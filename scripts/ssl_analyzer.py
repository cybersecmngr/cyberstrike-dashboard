#!/usr/bin/env python3
"""
SSL/TLS Certificate Analyzer
Analyzes SSL/TLS certificates for security vulnerabilities
"""

import socket
import ssl
import sys
import json
from datetime import datetime
from typing import Dict, List, Optional

def analyze_ssl(host: str, port: int = 443) -> Dict:
    """Analyze SSL/TLS certificate for a given host and port"""
    result = {
        'host': host,
        'port': port,
        'valid': False,
        'certificate': {},
        'tlsVersion': None,
        'cipherSuite': None,
        'vulnerabilities': []
    }
    
    try:
        # Create SSL context
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE
        
        # Create socket and wrap with SSL
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(10)
        sock.connect((host, port))
        
        with context.wrap_socket(sock, server_hostname=host) as ssock:
            # Get certificate
            cert = ssock.getpeercert()
            
            # Get TLS version
            tls_version = ssock.version()
            
            # Get cipher suite
            cipher = ssock.cipher()
            
            # Parse certificate
            issuer_dict = dict(x[0] for x in cert.get('issuer', []))
            subject_dict = dict(x[0] for x in cert.get('subject', []))
            
            # Format issuer and subject as strings
            issuer_str = ', '.join([f'{k}={v}' for k, v in issuer_dict.items()])
            subject_str = ', '.join([f'{k}={v}' for k, v in subject_dict.items()])
            
            result['certificate'] = {
                'issuer': issuer_str or 'Unknown',
                'subject': subject_str or 'Unknown',
                'validFrom': cert.get('notBefore', ''),
                'validTo': cert.get('notAfter', ''),
                'serialNumber': str(cert.get('serialNumber', '')),
                'fingerprint': str(cert.get('serialNumber', ''))
            }
            
            result['tlsVersion'] = tls_version
            result['cipherSuite'] = cipher[0] if cipher else None
            
            # Check validity
            not_after = cert.get('notAfter', '')
            if not_after:
                try:
                    from dateutil import parser  # type: ignore
                    expiry = parser.parse(not_after)
                    if expiry > datetime.now():
                        result['valid'] = True
                    else:
                        result['vulnerabilities'].append('Certificate expired')
                except:
                    result['valid'] = True
            
            # Check for vulnerabilities
            if tls_version and 'TLSv1' in tls_version and 'TLSv1.2' not in tls_version and 'TLSv1.3' not in tls_version:
                result['vulnerabilities'].append('Outdated TLS version')
            
            if not_after:
                try:
                    # Try using dateutil if available
                    try:
                        from dateutil import parser  # type: ignore
                        expiry = parser.parse(not_after)
                    except:
                        # Fallback to manual parsing
                        from datetime import datetime as dt
                        expiry = dt.strptime(not_after, '%b %d %H:%M:%S %Y %Z')
                    
                    days_until_expiry = (expiry - datetime.now()).days
                    if days_until_expiry < 30:
                        result['vulnerabilities'].append('Certificate expires soon')
                except:
                    pass
                    
    except socket.timeout:
        result['vulnerabilities'].append('Connection timeout')
    except Exception as e:
        result['vulnerabilities'].append(f'Error: {str(e)}')
    
    return result

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Host required'}))
        sys.exit(1)
    
    host = sys.argv[1]
    port = int(sys.argv[2]) if len(sys.argv) > 2 else 443
    
    result = analyze_ssl(host, port)
    print(json.dumps(result))

