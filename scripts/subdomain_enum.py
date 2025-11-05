#!/usr/bin/env python3
"""
Subdomain Enumerator
Enumerates subdomains using various methods
"""

import subprocess
import sys
import json
import socket
from typing import List, Dict

def enumerate_subdomains(domain: str) -> List[Dict]:
    """Enumerate subdomains for a given domain"""
    subdomains = []
    
    # Common subdomain wordlist
    common_subdomains = [
        'www', 'mail', 'ftp', 'admin', 'api', 'blog', 'cdn', 'dev', 'test',
        'staging', 'prod', 'www2', 'shop', 'store', 'support', 'help', 'docs',
        'portal', 'app', 'web', 'ns1', 'ns2', 'mx', 'smtp', 'pop', 'imap',
        'remote', 'vpn', 'secure', 'login', 'auth', 'sso', 'dashboard',
        'static', 'assets', 'media', 'images', 'uploads', 'downloads',
        'backup', 'db', 'mysql', 'postgres', 'redis', 'mongodb',
        'monitoring', 'logs', 'analytics', 'stats', 'metrics'
    ]
    
    # Try using sublist3r if available
    try:
        result = subprocess.run(
            ['sublist3r', '-d', domain, '-t', '10', '-o', '/dev/stdout'],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            for line in result.stdout.split('\n'):
                if line.strip() and domain in line:
                    subdomain = line.strip()
                    try:
                        ip = socket.gethostbyname(subdomain)
                        subdomains.append({
                            'subdomain': subdomain,
                            'ip': ip,
                            'status': 'active'
                        })
                    except:
                        subdomains.append({
                            'subdomain': subdomain,
                            'status': 'inactive'
                        })
            return subdomains
    except (subprocess.TimeoutExpired, FileNotFoundError):
        pass
    
    # Try using amass if available
    try:
        result = subprocess.run(
            ['amass', 'enum', '-d', domain, '-passive'],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            for line in result.stdout.split('\n'):
                if line.strip() and domain in line:
                    subdomain = line.strip()
                    try:
                        ip = socket.gethostbyname(subdomain)
                        subdomains.append({
                            'subdomain': subdomain,
                            'ip': ip,
                            'status': 'active'
                        })
                    except:
                        subdomains.append({
                            'subdomain': subdomain,
                            'status': 'inactive'
                        })
            return subdomains
    except (subprocess.TimeoutExpired, FileNotFoundError):
        pass
    
    # Fallback: Try common subdomains
    import random
    found_subdomains = random.sample(common_subdomains, min(15, len(common_subdomains)))
    
    for sub in found_subdomains:
        subdomain = f"{sub}.{domain}"
        try:
            ip = socket.gethostbyname(subdomain)
            subdomains.append({
                'subdomain': subdomain,
                'ip': ip,
                'status': 'active'
            })
        except:
            subdomains.append({
                'subdomain': subdomain,
                'status': 'inactive'
            })
    
    return subdomains

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Domain required'}))
        sys.exit(1)
    
    domain = sys.argv[1]
    subdomains = enumerate_subdomains(domain)
    print(json.dumps({'subdomains': subdomains}))

