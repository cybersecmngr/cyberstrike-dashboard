#!/usr/bin/env python3
"""
WhoIs Lookup Tool
Performs WhoIs lookups for domains and IP addresses
"""

import sys
import json
import socket
import subprocess
from typing import Dict, Optional

def lookup_whois(query: str) -> Dict:
    """Perform WhoIs lookup"""
    result = {}
    
    # Check if it's an IP address
    try:
        socket.inet_aton(query)
        is_ip = True
    except:
        is_ip = False
    
    # Try using whois command
    try:
        cmd = ['whois', query]
        process = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        
        if process.returncode == 0:
            output = process.stdout
            
            # Parse domain information
            if not is_ip:
                for line in output.split('\n'):
                    line_lower = line.lower()
                    if 'registrar:' in line_lower or 'registrar name:' in line_lower:
                        result['registrar'] = line.split(':', 1)[1].strip() if ':' in line else line.strip()
                    elif 'creation date:' in line_lower or 'created:' in line_lower:
                        result['creationDate'] = line.split(':', 1)[1].strip() if ':' in line else line.strip()
                    elif 'expiration date:' in line_lower or 'expires:' in line_lower:
                        result['expirationDate'] = line.split(':', 1)[1].strip() if ':' in line else line.strip()
                    elif 'updated date:' in line_lower or 'last updated:' in line_lower:
                        result['updatedDate'] = line.split(':', 1)[1].strip() if ':' in line else line.strip()
                    elif 'name server:' in line_lower or 'nserver:' in line_lower:
                        if 'nameServers' not in result:
                            result['nameServers'] = []
                        ns = line.split(':', 1)[1].strip() if ':' in line else line.strip()
                        if ns:
                            result['nameServers'].append(ns)
                    elif 'status:' in line_lower:
                        if 'status' not in result:
                            result['status'] = []
                        status = line.split(':', 1)[1].strip() if ':' in line else line.strip()
                        if status:
                            result['status'].append(status)
            
            # Parse IP information
            if is_ip:
                for line in output.split('\n'):
                    line_lower = line.lower()
                    if 'country:' in line_lower or 'country code:' in line_lower:
                        result['country'] = line.split(':', 1)[1].strip() if ':' in line else line.strip()
                    elif 'org:' in line_lower or 'organization:' in line_lower:
                        result['organization'] = line.split(':', 1)[1].strip() if ':' in line else line.strip()
                    elif 'city:' in line_lower:
                        result['city'] = line.split(':', 1)[1].strip() if ':' in line else line.strip()
            
            # Add domain/IP
            if not is_ip:
                result['domain'] = query
            else:
                result['ip'] = query
            
    except (subprocess.TimeoutExpired, FileNotFoundError):
        # Fallback: Use socket for IP lookup
        if is_ip:
            result['ip'] = query
            try:
                hostname = socket.gethostbyaddr(query)[0]
                result['hostname'] = hostname
            except:
                pass
        else:
            result['domain'] = query
            try:
                ip = socket.gethostbyname(query)
                result['ip'] = ip
            except:
                pass
    
    return result

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Query required'}))
        sys.exit(1)
    
    query = sys.argv[1]
    result = lookup_whois(query)
    print(json.dumps({'success': True, 'result': result}))

