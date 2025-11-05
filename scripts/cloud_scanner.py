#!/usr/bin/env python3
"""
Cloud Infrastructure Security Scanner
AWS, Azure, GCP misconfigurations, exposed services, IAM issues
"""

import sys
import json
import subprocess
import re
from typing import Dict, List, Optional

class CloudSecurityScanner:
    """Cloud infrastructure security scanner"""
    
    # AWS S3 bucket patterns
    AWS_S3_PATTERNS = [
        r's3://([a-z0-9\-\.]+)',
        r'https?://([a-z0-9\-\.]+)\.s3\.amazonaws\.com',
        r'https?://([a-z0-9\-\.]+)\.s3-[a-z0-9\-]+\.amazonaws\.com',
        r'https?://s3-[a-z0-9\-]+\.amazonaws\.com/([a-z0-9\-\.]+)',
    ]
    
    # Cloud service endpoints
    CLOUD_SERVICES = {
        'aws': {
            's3': 's3.amazonaws.com',
            'ec2': 'ec2.amazonaws.com',
            'lambda': 'lambda.amazonaws.com',
            'rds': 'rds.amazonaws.com',
            'dynamodb': 'dynamodb.amazonaws.com',
        },
        'azure': {
            'blob': 'blob.core.windows.net',
            'table': 'table.core.windows.net',
            'queue': 'queue.core.windows.net',
            'file': 'file.core.windows.net',
        },
        'gcp': {
            'storage': 'storage.googleapis.com',
            'compute': 'compute.googleapis.com',
            'bigquery': 'bigquery.googleapis.com',
        }
    }
    
    @staticmethod
    def scan_aws_config() -> Dict:
        """Scan AWS configuration for misconfigurations"""
        result = {
            'provider': 'AWS',
            'misconfigurations': [],
            'recommendations': []
        }
        
        # Check for AWS CLI
        try:
            aws_check = subprocess.run(['which', 'aws'], capture_output=True, timeout=5)
            if aws_check.returncode == 0:
                # Try to get AWS account info (if configured)
                try:
                    account_info = subprocess.run(['aws', 'sts', 'get-caller-identity'], 
                                                capture_output=True, text=True, timeout=10)
                    if account_info.returncode == 0:
                        account_data = json.loads(account_info.stdout)
                        result['accountId'] = account_data.get('Account', 'Unknown')
                        result['userId'] = account_data.get('Arn', 'Unknown')
                    else:
                        result['misconfigurations'].append({
                            'type': 'AWS CLI Not Configured',
                            'severity': 'low',
                            'details': 'AWS CLI installed but not configured'
                        })
                except:
                    pass
                
                # Check S3 buckets
                try:
                    s3_buckets = subprocess.run(['aws', 's3', 'ls'], 
                                              capture_output=True, text=True, timeout=10)
                    if s3_buckets.returncode == 0:
                        buckets = s3_buckets.stdout.strip().split('\n')
                        result['s3Buckets'] = len([b for b in buckets if b.strip()])
                        
                        # Check for public buckets
                        for bucket_line in buckets:
                            if bucket_line.strip():
                                bucket_name = bucket_line.split()[-1]
                                try:
                                    public_check = subprocess.run(
                                        ['aws', 's3api', 'get-bucket-acl', '--bucket', bucket_name],
                                        capture_output=True, text=True, timeout=10
                                    )
                                    if public_check.returncode == 0:
                                        acl = json.loads(public_check.stdout)
                                        grants = acl.get('Grants', [])
                                        for grant in grants:
                                            grantee = grant.get('Grantee', {})
                                            if grantee.get('Type') == 'Group' and 'AllUsers' in str(grantee):
                                                result['misconfigurations'].append({
                                                    'type': 'Public S3 Bucket',
                                                    'severity': 'critical',
                                                    'details': f'Bucket {bucket_name} is publicly accessible'
                                                })
                                                result['recommendations'].append(f'Restrict access to bucket: {bucket_name}')
                                except:
                                    pass
                except:
                    pass
            else:
                result['misconfigurations'].append({
                    'type': 'AWS CLI Not Installed',
                    'severity': 'low',
                    'details': 'Install AWS CLI for cloud scanning: brew install awscli'
                })
        except:
            pass
        
        return result
    
    @staticmethod
    def scan_azure_config() -> Dict:
        """Scan Azure configuration"""
        result = {
            'provider': 'Azure',
            'misconfigurations': [],
            'recommendations': []
        }
        
        # Check for Azure CLI
        try:
            az_check = subprocess.run(['which', 'az'], capture_output=True, timeout=5)
            if az_check.returncode == 0:
                # Check if logged in
                try:
                    account_info = subprocess.run(['az', 'account', 'show'], 
                                                capture_output=True, text=True, timeout=10)
                    if account_info.returncode == 0:
                        account_data = json.loads(account_info.stdout)
                        result['subscriptionId'] = account_data.get('id', 'Unknown')
                        result['tenantId'] = account_data.get('tenantId', 'Unknown')
                    else:
                        result['misconfigurations'].append({
                            'type': 'Azure CLI Not Logged In',
                            'severity': 'low',
                            'details': 'Azure CLI installed but not logged in'
                        })
                except:
                    pass
            else:
                result['misconfigurations'].append({
                    'type': 'Azure CLI Not Installed',
                    'severity': 'low',
                    'details': 'Install Azure CLI for cloud scanning: brew install azure-cli'
                })
        except:
            pass
        
        return result
    
    @staticmethod
    def scan_gcp_config() -> Dict:
        """Scan GCP configuration"""
        result = {
            'provider': 'GCP',
            'misconfigurations': [],
            'recommendations': []
        }
        
        # Check for gcloud CLI
        try:
            gcloud_check = subprocess.run(['which', 'gcloud'], capture_output=True, timeout=5)
            if gcloud_check.returncode == 0:
                # Check if authenticated
                try:
                    auth_info = subprocess.run(['gcloud', 'auth', 'list'], 
                                             capture_output=True, text=True, timeout=10)
                    if auth_info.returncode == 0:
                        if 'No credentialed accounts' in auth_info.stdout:
                            result['misconfigurations'].append({
                                'type': 'GCP Not Authenticated',
                                'severity': 'low',
                                'details': 'gcloud CLI installed but not authenticated'
                            })
                        else:
                            result['authenticated'] = True
                            # Get project info
                            try:
                                project_info = subprocess.run(['gcloud', 'config', 'get-value', 'project'], 
                                                            capture_output=True, text=True, timeout=10)
                                if project_info.returncode == 0:
                                    result['projectId'] = project_info.stdout.strip()
                            except:
                                pass
                except:
                    pass
            else:
                result['misconfigurations'].append({
                    'type': 'GCP CLI Not Installed',
                    'severity': 'low',
                    'details': 'Install gcloud CLI for cloud scanning'
                })
        except:
            pass
        
        return result
    
    @staticmethod
    def detect_cloud_services(url: str) -> List[Dict]:
        """Detect cloud services in use"""
        detected = []
        
        for provider, services in CloudSecurityScanner.CLOUD_SERVICES.items():
            for service_name, endpoint in services.items():
                if endpoint in url.lower():
                    detected.append({
                        'provider': provider.upper(),
                        'service': service_name,
                        'endpoint': endpoint,
                        'url': url
                    })
        
        # Check for S3 buckets
        for pattern in CloudSecurityScanner.AWS_S3_PATTERNS:
            matches = re.findall(pattern, url, re.IGNORECASE)
            for match in matches:
                detected.append({
                    'provider': 'AWS',
                    'service': 'S3',
                    'bucket': match,
                    'url': url,
                    'severity': 'medium',
                    'note': 'S3 bucket detected - verify access controls'
                })
        
        return detected
    
    @staticmethod
    def check_exposed_services() -> List[Dict]:
        """Check for exposed cloud services"""
        exposed = []
        
        # Common cloud service ports
        cloud_ports = {
            3306: {'service': 'MySQL', 'cloud': 'RDS/Azure Database'},
            5432: {'service': 'PostgreSQL', 'cloud': 'RDS/Azure Database'},
            6379: {'service': 'Redis', 'cloud': 'ElastiCache/Azure Cache'},
            27017: {'service': 'MongoDB', 'cloud': 'DocumentDB/Azure Cosmos'},
            1433: {'service': 'SQL Server', 'cloud': 'RDS/Azure SQL'},
        }
        
        try:
            import socket
            for port, info in cloud_ports.items():
                try:
                    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                    sock.settimeout(1)
                    result = sock.connect_ex(('127.0.0.1', port))
                    sock.close()
                    
                    if result == 0:
                        exposed.append({
                            'port': port,
                            'service': info['service'],
                            'cloud': info['cloud'],
                            'severity': 'high',
                            'details': f'Exposed {info["service"]} service on port {port}'
                        })
                except:
                    continue
        except:
            pass
        
        return exposed
    
    @staticmethod
    def scan_cloud_infrastructure(provider: str = None) -> Dict:
        """Comprehensive cloud infrastructure security scan"""
        result = {
            'success': True,
            'providers': {},
            'misconfigurations': [],
            'exposedServices': [],
            'summary': {
                'critical': 0,
                'high': 0,
                'medium': 0,
                'total': 0
            }
        }
        
        try:
            # Scan AWS
            if not provider or provider.lower() == 'aws':
                aws_result = CloudSecurityScanner.scan_aws_config()
                result['providers']['aws'] = aws_result
                result['misconfigurations'].extend(aws_result.get('misconfigurations', []))
            
            # Scan Azure
            if not provider or provider.lower() == 'azure':
                azure_result = CloudSecurityScanner.scan_azure_config()
                result['providers']['azure'] = azure_result
                result['misconfigurations'].extend(azure_result.get('misconfigurations', []))
            
            # Scan GCP
            if not provider or provider.lower() == 'gcp':
                gcp_result = CloudSecurityScanner.scan_gcp_config()
                result['providers']['gcp'] = gcp_result
                result['misconfigurations'].extend(gcp_result.get('misconfigurations', []))
            
            # Check for exposed services
            exposed = CloudSecurityScanner.check_exposed_services()
            result['exposedServices'] = exposed
            result['misconfigurations'].extend(exposed)
            
            # Calculate summary
            for misconfig in result['misconfigurations']:
                severity = misconfig.get('severity', 'medium').lower()
                if severity == 'critical':
                    result['summary']['critical'] += 1
                elif severity == 'high':
                    result['summary']['high'] += 1
                elif severity == 'medium':
                    result['summary']['medium'] += 1
                result['summary']['total'] += 1
            
            result['message'] = f'Cloud infrastructure scan completed. Found {result["summary"]["total"]} misconfigurations.'
            
        except Exception as e:
            result['success'] = False
            result['error'] = str(e)
        
        return result

if __name__ == '__main__':
    provider = sys.argv[1] if len(sys.argv) > 1 else None
    
    result = CloudSecurityScanner.scan_cloud_infrastructure(provider)
    print(json.dumps({'success': True, 'result': result}))

