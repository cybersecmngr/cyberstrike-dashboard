#!/usr/bin/env python3
"""
Real-Time Threat Intelligence & Attack Surface Mapper
Comprehensive attack surface analysis with threat intelligence integration
Real-time vulnerability correlation and risk assessment
"""

import sys
import json
import socket
import re
import hashlib
from typing import Dict, List, Optional
from urllib.parse import urlparse
from datetime import datetime

class ThreatIntelMapper:
    """Real-time threat intelligence and attack surface mapper"""
    
    # Threat intelligence sources (simulated)
    THREAT_DATABASES = {
        'cve': 'Common Vulnerabilities and Exposures',
        'exploit_db': 'Exploit Database',
        'nvd': 'National Vulnerability Database',
        'shodan': 'Shodan Intelligence',
        'virustotal': 'VirusTotal Intelligence'
    }
    
    # Attack surface components
    ATTACK_SURFACE_COMPONENTS = [
        'web_application',
        'api_endpoints',
        'network_services',
        'authentication',
        'file_operations',
        'database',
        'cloud_services',
        'third_party_integrations'
    ]
    
    @staticmethod
    def map_attack_surface(target: str) -> Dict:
        """Map attack surface of target"""
        result = {
            'target': target,
            'attack_surface': {},
            'exposed_components': [],
            'risk_score': 0.0,
            'threat_intelligence': {}
        }
        
        try:
            parsed = urlparse(target if '://' in target else f'http://{target}')
            
            # Web application components
            result['attack_surface']['web_application'] = {
                'url': f'{parsed.scheme}://{parsed.netloc}',
                'path': parsed.path,
                'parameters': parsed.query.split('&') if parsed.query else [],
                'components': []
            }
            
            # Network services
            try:
                # Try common ports
                common_ports = [22, 80, 443, 21, 25, 3306, 5432, 8080, 8443]
                open_ports = []
                
                for port in common_ports:
                    try:
                        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                        sock.settimeout(1)
                        result_port = sock.connect_ex((parsed.netloc.split(':')[0], port))
                        sock.close()
                        
                        if result_port == 0:
                            open_ports.append(port)
                    except:
                        continue
                
                result['attack_surface']['network_services'] = {
                    'open_ports': open_ports,
                    'services': [ThreatIntelMapper.get_service_name(p) for p in open_ports]
                }
                result['exposed_components'].extend([f'Port {p}' for p in open_ports])
            except:
                pass
            
            # Calculate risk score
            risk_factors = 0
            if result['attack_surface'].get('network_services', {}).get('open_ports'):
                risk_factors += len(result['attack_surface']['network_services']['open_ports'])
            
            if parsed.query:
                risk_factors += len(parsed.query.split('&'))
            
            result['risk_score'] = min(100, risk_factors * 10)
            
        except Exception as e:
            result['error'] = str(e)
        
        return result
    
    @staticmethod
    def get_service_name(port: int) -> str:
        """Get service name from port"""
        services = {
            22: 'SSH', 80: 'HTTP', 443: 'HTTPS', 21: 'FTP',
            25: 'SMTP', 3306: 'MySQL', 5432: 'PostgreSQL',
            8080: 'HTTP-Proxy', 8443: 'HTTPS-Alt'
        }
        return services.get(port, f'Service-{port}')
    
    @staticmethod
    def correlate_threat_intelligence(target: str, vulnerabilities: List[Dict]) -> Dict:
        """Correlate vulnerabilities with threat intelligence"""
        result = {
            'target': target,
            'correlated_threats': [],
            'exploit_availability': [],
            'cvss_scores': [],
            'recommendations': []
        }
        
        # Simulate threat intelligence correlation
        for vuln in vulnerabilities:
            vuln_type = vuln.get('vulnerability', '').lower()
            
            # Check for known exploit availability
            if 'sql injection' in vuln_type:
                result['exploit_availability'].append({
                    'vulnerability': vuln.get('vulnerability'),
                    'exploit_db': 'Multiple exploits available',
                    'cvss_score': 9.8,
                    'severity': 'critical'
                })
                result['cvss_scores'].append(9.8)
            
            elif 'xss' in vuln_type:
                result['exploit_availability'].append({
                    'vulnerability': vuln.get('vulnerability'),
                    'exploit_db': 'Common XSS exploits available',
                    'cvss_score': 6.1,
                    'severity': 'medium'
                })
                result['cvss_scores'].append(6.1)
            
            elif 'rce' in vuln_type or 'command injection' in vuln_type:
                result['exploit_availability'].append({
                    'vulnerability': vuln.get('vulnerability'),
                    'exploit_db': 'High exploit availability',
                    'cvss_score': 10.0,
                    'severity': 'critical'
                })
                result['cvss_scores'].append(10.0)
            
            # Generate recommendations
            if vuln.get('severity') == 'critical':
                result['recommendations'].append(
                    f'Immediate patching required for: {vuln.get("vulnerability")}'
                )
        
        # Calculate average CVSS
        if result['cvss_scores']:
            avg_cvss = sum(result['cvss_scores']) / len(result['cvss_scores'])
            result['average_cvss'] = round(avg_cvss, 1)
        
        return result
    
    @staticmethod
    def analyze_attack_surface_and_threats(target: str, vulnerabilities: List[Dict] = None) -> Dict:
        """Comprehensive attack surface and threat intelligence analysis"""
        result = {
            'success': True,
            'target': target,
            'attack_surface_map': {},
            'threat_intelligence': {},
            'risk_assessment': {},
            'recommendations': []
        }
        
        try:
            # Map attack surface
            surface_map = ThreatIntelMapper.map_attack_surface(target)
            result['attack_surface_map'] = surface_map
            
            # Correlate with threat intelligence
            if vulnerabilities:
                threat_correlation = ThreatIntelMapper.correlate_threat_intelligence(target, vulnerabilities)
                result['threat_intelligence'] = threat_correlation
            
            # Risk assessment
            risk_score = surface_map.get('risk_score', 0)
            if vulnerabilities:
                for vuln in vulnerabilities:
                    severity = vuln.get('severity', 'low')
                    if severity == 'critical':
                        risk_score += 20
                    elif severity == 'high':
                        risk_score += 10
                    elif severity == 'medium':
                        risk_score += 5
            
            result['risk_assessment'] = {
                'overall_risk_score': min(100, risk_score),
                'risk_level': 'critical' if risk_score >= 70 else 'high' if risk_score >= 50 else 'medium' if risk_score >= 30 else 'low',
                'exposed_components': len(surface_map.get('exposed_components', [])),
                'threat_count': len(vulnerabilities) if vulnerabilities else 0
            }
            
            # Generate recommendations
            if result['risk_assessment']['risk_level'] in ['high', 'critical']:
                result['recommendations'].extend([
                    'Reduce attack surface by closing unnecessary ports',
                    'Implement WAF and security headers',
                    'Regular security audits and penetration testing',
                    'Monitor threat intelligence feeds',
                    'Implement zero-trust architecture',
                    'Segment network to limit lateral movement'
                ])
            else:
                result['recommendations'].extend([
                    'Maintain current security posture',
                    'Regular monitoring and updates',
                    'Keep threat intelligence feeds active'
                ])
            
            result['message'] = f'Attack surface mapping completed. Risk level: {result["risk_assessment"]["risk_level"]}'
            
        except Exception as e:
            result['success'] = False
            result['error'] = str(e)
        
        return result

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Target required'}))
        sys.exit(1)
    
    target = sys.argv[1]
    vulnerabilities_json = sys.argv[2] if len(sys.argv) > 2 else '[]'
    vulnerabilities = json.loads(vulnerabilities_json) if vulnerabilities_json else []
    
    result = ThreatIntelMapper.analyze_attack_surface_and_threats(target, vulnerabilities)
    print(json.dumps({'success': True, 'result': result}))

