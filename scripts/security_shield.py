#!/usr/bin/env python3
"""
Security Shield - Comprehensive Security Scanner
Multi-layer security analysis and vulnerability assessment
"""

import sys
import json
import subprocess
import socket
import requests
from typing import List, Dict
import re

def comprehensive_scan(target: str) -> Dict:
    """Perform comprehensive security scan"""
    results = {
        'target': target,
        'port_scan': [],
        'vulnerabilities': [],
        'ssl_issues': [],
        'security_headers': [],
        'recommendations': []
    }
    
    # Port scanning
    common_ports = [22, 23, 25, 53, 80, 110, 143, 443, 445, 993, 995, 3306, 3389, 5432, 8080]
    for port in common_ports:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)
            result = sock.connect_ex((target, port))
            sock.close()
            
            if result == 0:
                service = detect_service(port)
                results['port_scan'].append({
                    'port': port,
                    'state': 'open',
                    'service': service
                })
        except:
            pass
    
    # SSL/TLS analysis
    if '443' in [str(p['port']) for p in results['port_scan']]:
        try:
            import ssl
            context = ssl.create_default_context()
            with socket.create_connection((target, 443), timeout=5) as sock:
                with context.wrap_socket(sock, server_hostname=target) as ssock:
                    cert = ssock.getpeercert()
                    version = ssock.version()
                    
                    # Check for vulnerabilities
                    if 'TLSv1' in version and 'TLSv1.2' not in version and 'TLSv1.3' not in version:
                        results['ssl_issues'].append({
                            'severity': 'high',
                            'issue': 'Outdated TLS version',
                            'version': version
                        })
        except:
            pass
    
    # Security headers check
    try:
        response = requests.get(f'https://{target}', timeout=5, verify=False)
        headers = response.headers
        
        security_headers = {
            'X-Frame-Options': 'Clickjacking protection',
            'X-Content-Type-Options': 'MIME type sniffing protection',
            'X-XSS-Protection': 'XSS protection',
            'Strict-Transport-Security': 'HSTS enforcement',
            'Content-Security-Policy': 'CSP protection',
        }
        
        for header, description in security_headers.items():
            if header not in headers:
                results['security_headers'].append({
                    'missing': header,
                    'description': description,
                    'severity': 'medium'
                })
    except:
        pass
    
    # Generate recommendations
    if results['port_scan']:
        results['recommendations'].append('Review open ports and close unnecessary services')
    if results['ssl_issues']:
        results['recommendations'].append('Update TLS configuration to use TLS 1.2 or higher')
    if results['security_headers']:
        results['recommendations'].append('Implement missing security headers')
    
    return results

def detect_service(port: int) -> str:
    """Detect service based on port"""
    services = {
        22: 'SSH', 23: 'Telnet', 25: 'SMTP', 53: 'DNS',
        80: 'HTTP', 110: 'POP3', 143: 'IMAP', 443: 'HTTPS',
        445: 'SMB', 993: 'IMAPS', 995: 'POP3S',
        3306: 'MySQL', 3389: 'RDP', 5432: 'PostgreSQL', 8080: 'HTTP-Proxy'
    }
    return services.get(port, 'Unknown')

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Target required'}))
        sys.exit(1)
    
    target = sys.argv[1]
    result = comprehensive_scan(target)
    print(json.dumps({'success': True, 'result': result}))

