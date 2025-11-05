#!/usr/bin/env python3
"""
Vulnerability Scanner
Scans multiple targets for vulnerabilities using nmap and nikto
"""

import subprocess
import sys
import json
import re
from typing import List, Dict

def scan_target(target: str, scan_type: str = 'quick') -> List[Dict]:
    """Scan a target for vulnerabilities"""
    vulnerabilities = []
    
    # Check if nmap is available
    try:
        # Build nmap command based on scan type
        nmap_cmd = ['nmap', '-sV', '--script', 'vuln']
        
        if scan_type == 'quick':
            nmap_cmd.extend(['-F', '--top-ports', '100'])
        elif scan_type == 'standard':
            nmap_cmd.extend(['-p', '1-1000'])
        elif scan_type == 'deep':
            nmap_cmd.extend(['-p', '1-65535'])
        elif scan_type == 'full':
            nmap_cmd.extend(['-p-', '--script', 'vuln,exploit'])
        
        nmap_cmd.append(target)
        
        result = subprocess.run(
            nmap_cmd,
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode == 0:
            lines = result.stdout.split('\n')
            current_port = 0
            
            for line in lines:
                # Extract port number
                port_match = re.search(r'(\d+)/(tcp|udp)\s+open', line)
                if port_match:
                    current_port = int(port_match.group(1))
                
                # Check for vulnerabilities
                if 'VULNERABLE' in line or 'CVE-' in line:
                    severity = 'low'
                    if 'CRITICAL' in line.upper() or 'CRITICAL' in line:
                        severity = 'critical'
                    elif 'HIGH' in line.upper() or 'HIGH' in line:
                        severity = 'high'
                    elif 'MEDIUM' in line.upper() or 'MEDIUM' in line:
                        severity = 'medium'
                    
                    cve_match = re.search(r'CVE-\d{4}-\d+', line)
                    cve = cve_match.group(0) if cve_match else None
                    
                    vulnerabilities.append({
                        'target': target,
                        'severity': severity,
                        'type': 'Vulnerability Detected',
                        'description': line.strip(),
                        'cve': cve,
                        'port': current_port if current_port > 0 else None
                    })
    except (subprocess.TimeoutExpired, FileNotFoundError):
        pass
    
    # Check if nikto is available for web targets
    if 'http' in target or target.startswith('http'):
        try:
            result = subprocess.run(
                ['nikto', '-h', target, '-Format', 'txt'],
                capture_output=True,
                text=True,
                timeout=60
            )
            
            if result.returncode == 0:
                for line in result.stdout.split('\n'):
                    if '+ OSVDB' in line or '+' in line:
                        severity = 'medium'
                        if 'OSVDB-0' in line:
                            severity = 'high'
                        
                        vulnerabilities.append({
                            'target': target,
                            'severity': severity,
                            'type': 'Web Vulnerability',
                            'description': line.strip(),
                            'port': 80 if 'http://' in target else 443 if 'https://' in target else None
                        })
        except (subprocess.TimeoutExpired, FileNotFoundError):
            pass
    
    return vulnerabilities

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Target required'}))
        sys.exit(1)
    
    target = sys.argv[1]
    scan_type = sys.argv[2] if len(sys.argv) > 2 else 'quick'
    
    vulnerabilities = scan_target(target, scan_type)
    print(json.dumps({'vulnerabilities': vulnerabilities}))

