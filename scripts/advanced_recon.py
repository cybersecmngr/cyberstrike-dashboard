#!/usr/bin/env python3
"""
Advanced Reconnaissance Framework
Shodan, Censys, TheHarvester, Google dorking, Social Media OSINT, DNS enumeration
"""

import sys
import json
import requests
import subprocess
import re
from typing import Dict, List
from urllib.parse import urlparse, quote
import socket
import dns.resolver
import dns.reversename

class ShodanSearch:
    """Shodan API integration"""
    
    BASE_URL = 'https://api.shodan.io'
    
    @staticmethod
    def search(query: str, api_key: str = '', limit: int = 10) -> Dict:
        """Search Shodan"""
        if not api_key:
            return {
                'results': [],
                'total': 0,
                'note': 'Shodan API key required. Sign up at https://account.shodan.io'
            }
        
        try:
            url = f'{ShodanSearch.BASE_URL}/shost/search'
            params = {
                'key': api_key,
                'query': query,
                'limit': limit
            }
            response = requests.get(url, params=params, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                return {
                    'results': data.get('matches', [])[:limit],
                    'total': data.get('total', 0),
                    'facets': data.get('facets', {})
                }
            else:
                return {
                    'error': f'Shodan API error: {response.status_code}',
                    'message': response.text
                }
        except Exception as e:
            return {
                'error': str(e),
                'results': []
            }
    
    @staticmethod
    def host_info(ip: str, api_key: str = '') -> Dict:
        """Get host information from Shodan"""
        if not api_key:
            return {'error': 'API key required'}
        
        try:
            url = f'{ShodanSearch.BASE_URL}/shost/{ip}'
            params = {'key': api_key}
            response = requests.get(url, params=params, timeout=15)
            
            if response.status_code == 200:
                return response.json()
            else:
                return {'error': f'API error: {response.status_code}'}
        except Exception as e:
            return {'error': str(e)}

class CensysSearch:
    """Censys API integration"""
    
    BASE_URL = 'https://search.censys.io/api/v2'
    
    @staticmethod
    def search(query: str, api_id: str = '', api_secret: str = '', limit: int = 10) -> Dict:
        """Search Censys"""
        if not api_id or not api_secret:
            return {
                'results': [],
                'note': 'Censys API credentials required. Sign up at https://search.censys.io'
            }
        
        try:
            url = f'{CensysSearch.BASE_URL}/hosts/search'
            auth = (api_id, api_secret)
            params = {
                'q': query,
                'per_page': limit
            }
            response = requests.get(url, auth=auth, params=params, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                return {
                    'results': data.get('result', {}).get('hits', [])[:limit],
                    'total': data.get('result', {}).get('total', 0)
                }
            else:
                return {
                    'error': f'Censys API error: {response.status_code}',
                    'message': response.text
                }
        except Exception as e:
            return {
                'error': str(e),
                'results': []
            }

class TheHarvester:
    """TheHarvester integration"""
    
    @staticmethod
    def search(target: str, sources: List[str] = None) -> Dict:
        """Run TheHarvester"""
        if sources is None:
            sources = ['all']
        
        try:
            # Try to run theHarvester
            cmd = ['theHarvester', '-d', target, '-b', ','.join(sources), '-f', '/tmp/harvester_output']
            process = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
            
            if process.returncode == 0:
                # Parse output
                output = process.stdout
                
                # Extract emails
                emails = re.findall(r'[\w\.-]+@[\w\.-]+\.\w+', output)
                
                # Extract subdomains
                subdomains = re.findall(r'[\w\.-]+\.' + re.escape(target), output)
                
                # Extract hosts
                hosts = re.findall(r'\b(?:\d{1,3}\.){3}\d{1,3}\b', output)
                
                return {
                    'emails': list(set(emails)),
                    'subdomains': list(set(subdomains)),
                    'hosts': list(set(hosts)),
                    'output': output[:5000]  # Limit output
                }
            else:
                return {
                    'error': process.stderr,
                    'note': 'Install theHarvester: pip install theHarvester'
                }
        except FileNotFoundError:
            return {
                'emails': [],
                'subdomains': [],
                'hosts': [],
                'note': 'TheHarvester not installed. Install: pip install theHarvester'
            }
        except Exception as e:
            return {
                'error': str(e),
                'emails': [],
                'subdomains': [],
                'hosts': []
            }

class GoogleDorking:
    """Google dorking query generator"""
    
    DORKS = [
        'site:{target} filetype:pdf',
        'site:{target} filetype:doc',
        'site:{target} filetype:xls',
        'site:{target} inurl:admin',
        'site:{target} inurl:login',
        'site:{target} intitle:"index of"',
        'site:{target} "password" filetype:txt',
        'site:{target} "password" filetype:csv',
        'site:{target} "api key" OR "apikey"',
        'site:{target} "private key" filetype:pem',
        'site:{target} "database" filetype:sql',
        'site:{target} inurl:config.php',
        'site:{target} inurl:wp-config.php',
        'site:{target} "sql" filetype:log',
        'site:{target} "error" filetype:log',
    ]
    
    @staticmethod
    def generate_dorks(target: str) -> Dict:
        """Generate Google dorking queries"""
        dorks = [dork.format(target=target) for dork in GoogleDorking.DORKS]
        
        return {
            'target': target,
            'dorks': dorks,
            'total': len(dorks),
            'note': 'Use these queries manually in Google search. Use quotes for exact matches.'
        }
    
    @staticmethod
    def build_search_urls(target: str) -> List[str]:
        """Build Google search URLs"""
        dorks = GoogleDorking.generate_dorks(target)
        base_url = 'https://www.google.com/search?q='
        
        urls = [base_url + quote(dork) for dork in dorks['dorks']]
        return urls

class OSINTGatherer:
    """Social media and general OSINT gathering"""
    
    @staticmethod
    def gather_osint(target: str) -> Dict:
        """Comprehensive OSINT gathering"""
        osint_data = {
            'target': target,
            'social_media': {},
            'domains': [],
            'dns_records': {},
            'technologies': [],
            'certificates': {},
            'ports': []
        }
        
        # Extract username/domain
        if '@' in target:
            username = target.split('@')[0]
            domain = target.split('@')[1]
        else:
            username = target
            domain = target if '.' in target else None
        
        # Social media profiles
        if username:
            osint_data['social_media'] = {
                'twitter': f'https://twitter.com/{username}',
                'github': f'https://github.com/{username}',
                'linkedin': f'https://linkedin.com/in/{username}',
                'instagram': f'https://instagram.com/{username}',
                'facebook': f'https://facebook.com/{username}',
                'reddit': f'https://reddit.com/user/{username}',
                'keybase': f'https://keybase.io/{username}',
            }
        
        # DNS enumeration
        if domain:
            osint_data['domains'] = OSINTGatherer._enumerate_subdomains(domain)
            osint_data['dns_records'] = OSINTGatherer._get_dns_records(domain)
            osint_data['technologies'] = OSINTGatherer._detect_technologies(domain)
            osint_data['certificates'] = OSINTGatherer._get_certificate_info(domain)
            osint_data['ports'] = OSINTGatherer._scan_ports(domain)
        
        return osint_data
    
    @staticmethod
    def _enumerate_subdomains(domain: str) -> List[str]:
        """Enumerate subdomains"""
        common_subdomains = [
            'www', 'mail', 'ftp', 'admin', 'secure', 'test', 'dev', 'staging',
            'api', 'cdn', 'static', 'assets', 'images', 'download', 'upload',
            'blog', 'forum', 'support', 'help', 'docs', 'wiki', 'portal'
        ]
        
        subdomains = []
        for sub in common_subdomains:
            full_domain = f'{sub}.{domain}'
            try:
                socket.gethostbyname(full_domain)
                subdomains.append(full_domain)
            except:
                pass
        
        return subdomains
    
    @staticmethod
    def _get_dns_records(domain: str) -> Dict:
        """Get DNS records"""
        records = {
            'A': [],
            'AAAA': [],
            'MX': [],
            'TXT': [],
            'NS': [],
            'CNAME': []
        }
        
        try:
            # A records
            try:
                a_records = socket.gethostbyname(domain)
                records['A'].append(a_records)
            except:
                pass
            
            # Other records using dnspython
            try:
                # MX records
                mx_records = dns.resolver.resolve(domain, 'MX')
                for mx in mx_records:
                    records['MX'].append(str(mx.exchange))
            except:
                pass
            
            try:
                # TXT records
                txt_records = dns.resolver.resolve(domain, 'TXT')
                for txt in txt_records:
                    records['TXT'].append(txt.strings[0].decode('utf-8'))
            except:
                pass
            
            try:
                # NS records
                ns_records = dns.resolver.resolve(domain, 'NS')
                for ns in ns_records:
                    records['NS'].append(str(ns))
            except:
                pass
        
        except Exception as e:
            records['error'] = str(e)
        
        return records
    
    @staticmethod
    def _detect_technologies(domain: str) -> List[str]:
        """Detect technologies used"""
        technologies = []
        
        try:
            response = requests.get(f'https://{domain}', timeout=10, verify=False)
            
            # Check headers
            server = response.headers.get('Server', '')
            if server:
                technologies.append(f'Server: {server}')
            
            if 'X-Powered-By' in response.headers:
                technologies.append(f'Powered by: {response.headers["X-Powered-By"]}')
            
            # Check content
            content = response.text.lower()
            tech_indicators = {
                'wordpress': ['wp-content', 'wp-includes', 'wordpress'],
                'drupal': ['drupal', 'sites/all'],
                'joomla': ['joomla', 'components/com_'],
                'react': ['react', 'react-dom'],
                'angular': ['angular', 'ng-'],
                'vue': ['vue.js', 'vue.min.js'],
                'jquery': ['jquery'],
                'bootstrap': ['bootstrap'],
                'php': ['<?php', '.php'],
                'asp': ['asp.net', '.aspx'],
            }
            
            for tech, indicators in tech_indicators.items():
                if any(indicator in content for indicator in indicators):
                    technologies.append(tech)
        
        except:
            pass
        
        return technologies
    
    @staticmethod
    def _get_certificate_info(domain: str) -> Dict:
        """Get SSL/TLS certificate information"""
        try:
            import ssl
            context = ssl.create_default_context()
            with socket.create_connection((domain, 443), timeout=5) as sock:
                with context.wrap_socket(sock, server_hostname=domain) as ssock:
                    cert = ssock.getpeercert()
                    return {
                        'subject': dict(x[0] for x in cert['subject']),
                        'issuer': dict(x[0] for x in cert['issuer']),
                        'version': cert['version'],
                        'serialNumber': cert['serialNumber'],
                        'notBefore': cert['notBefore'],
                        'notAfter': cert['notAfter']
                    }
        except:
            return {}
    
    @staticmethod
    def _scan_ports(domain: str) -> List[Dict]:
        """Quick port scan"""
        common_ports = [21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 993, 995, 3306, 3389, 5432, 8080]
        open_ports = []
        
        try:
            ip = socket.gethostbyname(domain)
            for port in common_ports:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(1)
                result = sock.connect_ex((ip, port))
                sock.close()
                
                if result == 0:
                    open_ports.append({
                        'port': port,
                        'status': 'open',
                        'service': OSINTGatherer._get_service_name(port)
                    })
        except:
            pass
        
        return open_ports
    
    @staticmethod
    def _get_service_name(port: int) -> str:
        """Get service name for port"""
        services = {
            21: 'FTP', 22: 'SSH', 23: 'Telnet', 25: 'SMTP', 53: 'DNS',
            80: 'HTTP', 110: 'POP3', 143: 'IMAP', 443: 'HTTPS',
            445: 'SMB', 993: 'IMAPS', 995: 'POP3S',
            3306: 'MySQL', 3389: 'RDP', 5432: 'PostgreSQL', 8080: 'HTTP-Proxy'
        }
        return services.get(port, 'Unknown')

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print(json.dumps({'error': 'Recon type and target required'}))
        sys.exit(1)
    
    recon_type = sys.argv[1]
    target = sys.argv[2]
    
    if recon_type == 'shodan':
        api_key = sys.argv[3] if len(sys.argv) > 3 else ''
        limit = int(sys.argv[4]) if len(sys.argv) > 4 else 10
        result = ShodanSearch.search(target, api_key, limit)
    elif recon_type == 'censys':
        api_id = sys.argv[3] if len(sys.argv) > 3 else ''
        api_secret = sys.argv[4] if len(sys.argv) > 4 else ''
        limit = int(sys.argv[5]) if len(sys.argv) > 5 else 10
        result = CensysSearch.search(target, api_id, api_secret, limit)
    elif recon_type == 'harvester':
        sources = sys.argv[3].split(',') if len(sys.argv) > 3 else None
        result = TheHarvester.search(target, sources)
    elif recon_type == 'dorking':
        result = GoogleDorking.generate_dorks(target)
    elif recon_type == 'osint':
        result = OSINTGatherer.gather_osint(target)
    else:
        result = {'error': 'Unknown recon type'}
    
    print(json.dumps({'success': True, 'result': result}))
