#!/usr/bin/env python3
"""
Advanced Port Scanner
Scans ports with service detection and version detection
"""

import sys
import json
import socket
import subprocess
from typing import List, Dict

def scan_ports(target: str, port_range: str, scan_type: str = 'syn') -> List[Dict]:
    """Scan ports on target"""
    results = []
    
    # Parse port range
    try:
        if '-' in port_range:
            start, end = map(int, port_range.split('-'))
            ports = range(start, end + 1)
        else:
            ports = [int(port_range)]
    except:
        ports = range(1, 1001)
    
    # Try using nmap if available
    try:
        nmap_cmd = ['nmap', '-sV', '--open', '-p', port_range, target]
        
        if scan_type == 'syn':
            nmap_cmd.insert(1, '-sS')
        elif scan_type == 'udp':
            nmap_cmd.insert(1, '-sU')
        elif scan_type == 'stealth':
            nmap_cmd.insert(1, '-sS')
            nmap_cmd.insert(2, '-f')
        
        result = subprocess.run(
            nmap_cmd,
            capture_output=True,
            text=True,
            timeout=300
        )
        
        if result.returncode == 0:
            for line in result.stdout.split('\n'):
                if '/tcp' in line or '/udp' in line:
                    parts = line.split()
                    if len(parts) >= 3:
                        port_info = parts[0]
                        port = int(port_info.split('/')[0])
                        protocol = port_info.split('/')[1]
                        state = parts[1]
                        
                        if state == 'open':
                            service = parts[2] if len(parts) > 2 else 'unknown'
                            version = ' '.join(parts[3:]) if len(parts) > 3 else None
                            
                            results.append({
                                'port': port,
                                'state': 'open',
                                'service': service,
                                'version': version
                            })
            return results
    except (subprocess.TimeoutExpired, FileNotFoundError):
        pass
    
    # Fallback: Basic socket scan
    for port in list(ports)[:100]:  # Limit to 100 ports for fallback
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)
            result = sock.connect_ex((target, port))
            sock.close()
            
            if result == 0:
                # Try to detect service
                service = detect_service(port)
                results.append({
                    'port': port,
                    'state': 'open',
                    'service': service
                })
        except:
            pass
    
    return results

def detect_service(port: int) -> str:
    """Detect service based on port"""
    common_ports = {
        21: 'ftp', 22: 'ssh', 23: 'telnet', 25: 'smtp', 53: 'dns',
        80: 'http', 110: 'pop3', 143: 'imap', 443: 'https', 445: 'smb',
        3306: 'mysql', 5432: 'postgresql', 8080: 'http-proxy', 3389: 'rdp',
    }
    return common_ports.get(port, 'unknown')

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Target required'}))
        sys.exit(1)
    
    target = sys.argv[1]
    port_range = sys.argv[2] if len(sys.argv) > 2 else '1-1000'
    scan_type = sys.argv[3] if len(sys.argv) > 3 else 'syn'
    
    results = scan_ports(target, port_range, scan_type)
    print(json.dumps({'success': True, 'results': results}))

