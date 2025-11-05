#!/usr/bin/env python3
"""
DNS Enumerator
Queries DNS records for a given domain
"""

import sys
import json
import socket
from typing import List, Dict

# Try to import dnspython, fallback to socket if not available
try:
    import dns.resolver  # type: ignore
    HAS_DNSPYTHON = True
except ImportError:
    HAS_DNSPYTHON = False

def enumerate_dns(domain: str, record_type: str = 'A') -> List[Dict]:
    """Enumerate DNS records for a given domain"""
    records = []
    
    # Use dnspython if available
    if HAS_DNSPYTHON:
        try:
            if record_type.upper() == 'A':
                answers = dns.resolver.resolve(domain, 'A')
                for rdata in answers:
                    records.append({
                        'type': 'A',
                        'name': domain,
                        'value': str(rdata),
                        'ttl': answers.rrset.ttl if hasattr(answers, 'rrset') else None
                    })
            
            elif record_type.upper() == 'AAAA':
                answers = dns.resolver.resolve(domain, 'AAAA')
                for rdata in answers:
                    records.append({
                        'type': 'AAAA',
                        'name': domain,
                        'value': str(rdata),
                        'ttl': answers.rrset.ttl if hasattr(answers, 'rrset') else None
                    })
            
            elif record_type.upper() == 'MX':
                answers = dns.resolver.resolve(domain, 'MX')
                for rdata in answers:
                    records.append({
                        'type': 'MX',
                        'name': domain,
                        'value': f"{rdata.preference} {rdata.exchange}",
                        'ttl': answers.rrset.ttl if hasattr(answers, 'rrset') else None
                    })
            
            elif record_type.upper() == 'TXT':
                answers = dns.resolver.resolve(domain, 'TXT')
                for rdata in answers:
                    records.append({
                        'type': 'TXT',
                        'name': domain,
                        'value': ' '.join([s.decode('utf-8') if isinstance(s, bytes) else s for s in rdata.strings]),
                        'ttl': answers.rrset.ttl if hasattr(answers, 'rrset') else None
                    })
            
            elif record_type.upper() == 'NS':
                answers = dns.resolver.resolve(domain, 'NS')
                for rdata in answers:
                    records.append({
                        'type': 'NS',
                        'name': domain,
                        'value': str(rdata),
                        'ttl': answers.rrset.ttl if hasattr(answers, 'rrset') else None
                    })
            
            elif record_type.upper() == 'CNAME':
                answers = dns.resolver.resolve(domain, 'CNAME')
                for rdata in answers:
                    records.append({
                        'type': 'CNAME',
                        'name': domain,
                        'value': str(rdata),
                        'ttl': answers.rrset.ttl if hasattr(answers, 'rrset') else None
                    })
        
        except dns.resolver.NXDOMAIN:
            records.append({
                'type': record_type,
                'name': domain,
                'value': 'NXDOMAIN - Domain does not exist',
                'ttl': 0
            })
        except dns.resolver.NoAnswer:
            records.append({
                'type': record_type,
                'name': domain,
                'value': 'No records found',
                'ttl': 0
            })
        except Exception as e:
            records.append({
                'type': record_type,
                'name': domain,
                'value': f'Error: {str(e)}',
                'ttl': 0
            })
    else:
        # Fallback to socket.gethostbyname for A records
        try:
            if record_type.upper() == 'A':
                ip = socket.gethostbyname(domain)
                records.append({
                    'type': 'A',
                    'name': domain,
                    'value': ip,
                    'ttl': None
                })
            else:
                records.append({
                    'type': record_type,
                    'name': domain,
                    'value': 'dnspython required for this record type',
                    'ttl': 0
                })
        except socket.gaierror:
            records.append({
                'type': record_type,
                'name': domain,
                'value': 'NXDOMAIN - Domain does not exist',
                'ttl': 0
            })
        except Exception as e:
            records.append({
                'type': record_type,
                'name': domain,
                'value': f'Error: {str(e)}',
                'ttl': 0
            })
    
    return records

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Domain required'}))
        sys.exit(1)
    
    domain = sys.argv[1]
    record_type = sys.argv[2] if len(sys.argv) > 2 else 'A'
    
    records = enumerate_dns(domain, record_type)
    print(json.dumps({'records': records}))
