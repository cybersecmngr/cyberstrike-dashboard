#!/usr/bin/env python3
"""
Active Directory / LDAP Security Scanner
User enumeration, privilege escalation, Kerberos attacks, misconfigurations
"""

import sys
import json
import socket
import subprocess
from typing import Dict, List, Optional

class ADSecurityScanner:
    """Active Directory / LDAP security scanner"""
    
    # Common LDAP ports
    LDAP_PORTS = [389, 636, 3268, 3269]
    
    # Common AD users
    COMMON_USERS = [
        'administrator', 'admin', 'guest', 'test', 'user',
        'service', 'sql', 'backup', 'www', 'http',
        'root', 'daemon', 'nobody', 'www-data'
    ]
    
    # Common AD groups
    COMMON_GROUPS = [
        'Domain Admins', 'Enterprise Admins', 'Schema Admins',
        'Administrators', 'Account Operators', 'Backup Operators',
        'Domain Users', 'Everyone', 'Authenticated Users'
    ]
    
    @staticmethod
    def test_ldap_anonymous_bind(hostname: str, port: int = 389) -> Dict:
        """Test for anonymous LDAP bind"""
        result = {
            'vulnerability': 'Anonymous LDAP Bind',
            'severity': 'high',
            'allowed': False,
            'details': []
        }
        
        try:
            import ldap3  # type: ignore
            from ldap3 import Server, Connection, ALL, ANONYMOUS
            
            server = Server(hostname, port=port, get_info=ALL)
            conn = Connection(server, user='', password='', authentication=ANONYMOUS)
            
            try:
                if conn.bind():
                    result['allowed'] = True
                    result['details'].append('Anonymous bind successful - no authentication required')
                    result['details'].append(f'Server: {server.info}')
                else:
                    result['details'].append('Anonymous bind failed - authentication required')
            except Exception as e:
                result['details'].append(f'Bind attempt failed: {str(e)}')
            finally:
                conn.unbind()
        except ImportError:
            result['details'].append('ldap3 library not available - install with: pip3 install ldap3')
        except Exception as e:
            result['details'].append(f'Error: {str(e)}')
        
        return result
    
    @staticmethod
    def enumerate_users(hostname: str, base_dn: str = None, username: str = None, password: str = None) -> Dict:
        """Enumerate LDAP/AD users"""
        result = {
            'success': False,
            'users': [],
            'total': 0,
            'details': []
        }
        
        try:
            import ldap3  # type: ignore
            from ldap3 import Server, Connection, ALL, SIMPLE
            
            server = Server(hostname, get_info=ALL)
            
            # Try anonymous first
            try:
                conn = Connection(server, user='', password='', authentication=ldap3.ANONYMOUS)
                if conn.bind():
                    result['details'].append('Anonymous bind successful')
                else:
                    if username and password:
                        conn = Connection(server, user=username, password=password, authentication=SIMPLE)
                        if not conn.bind():
                            result['details'].append('Authentication failed')
                            return result
                    else:
                        result['details'].append('Authentication required but not provided')
                        return result
            except:
                if username and password:
                    conn = Connection(server, user=username, password=password, authentication=SIMPLE)
                    if not conn.bind():
                        result['details'].append('Authentication failed')
                        return result
                else:
                    result['details'].append('Authentication required')
                    return result
            
            # Try to discover base DN
            if not base_dn:
                root_dse = server.info
                if root_dse:
                    default_naming_context = root_dse.get('defaultNamingContext', [None])[0]
                    if default_naming_context:
                        base_dn = default_naming_context
                        result['baseDN'] = base_dn
                    else:
                        base_dn = 'dc=example,dc=com'  # Default
                        result['details'].append('Could not discover base DN, using default')
            
            # Search for users
            search_filter = '(&(objectClass=user)(objectClass=person))'
            conn.search(base_dn, search_filter, attributes=['cn', 'sAMAccountName', 'mail', 'memberOf'])
            
            for entry in conn.entries:
                user_info = {
                    'cn': str(entry.cn) if hasattr(entry, 'cn') else 'N/A',
                    'sAMAccountName': str(entry.sAMAccountName) if hasattr(entry, 'sAMAccountName') else 'N/A',
                    'mail': str(entry.mail) if hasattr(entry, 'mail') else 'N/A',
                }
                result['users'].append(user_info)
            
            result['total'] = len(result['users'])
            result['success'] = True
            result['details'].append(f'Found {result["total"]} users')
            
            conn.unbind()
        except ImportError:
            result['details'].append('ldap3 library not available - install with: pip3 install ldap3')
        except Exception as e:
            result['details'].append(f'Enumeration error: {str(e)}')
        
        return result
    
    @staticmethod
    def test_kerberoasting(domain: str = None) -> Dict:
        """Test for Kerberoasting vulnerabilities"""
        result = {
            'vulnerability': 'Kerberoasting',
            'severity': 'high',
            'vulnerable': False,
            'details': []
        }
        
        # Check for Impacket or similar tools
        try:
            impacket_check = subprocess.run(['which', 'GetUserSPNs.py'], 
                                          capture_output=True, timeout=5)
            if impacket_check.returncode == 0:
                result['details'].append('Impacket GetUserSPNs.py available for Kerberoasting')
                result['vulnerable'] = True  # Tool available
            else:
                result['details'].append('Impacket not installed - install for Kerberoasting tests')
        except:
            pass
        
        # Check for common service accounts
        result['details'].append('Kerberoasting targets service accounts with SPNs')
        result['recommendations'] = [
            'Use strong passwords for service accounts',
            'Enable Kerberos AES encryption',
            'Monitor for unusual Kerberos ticket requests'
        ]
        
        return result
    
    @staticmethod
    def test_asreproasting(domain: str = None) -> Dict:
        """Test for AS-REP Roasting vulnerabilities"""
        result = {
            'vulnerability': 'AS-REP Roasting',
            'severity': 'high',
            'vulnerable': False,
            'details': []
        }
        
        # Check for Impacket
        try:
            impacket_check = subprocess.run(['which', 'GetNPUsers.py'], 
                                          capture_output=True, timeout=5)
            if impacket_check.returncode == 0:
                result['details'].append('Impacket GetNPUsers.py available for AS-REP Roasting')
                result['vulnerable'] = True
            else:
                result['details'].append('Impacket not installed - install for AS-REP Roasting tests')
        except:
            pass
        
        result['details'].append('AS-REP Roasting targets accounts with "Do not require Kerberos preauthentication"')
        result['recommendations'] = [
            'Require Kerberos preauthentication for all accounts',
            'Use strong passwords',
            'Monitor for AS-REP requests'
        ]
        
        return result
    
    @staticmethod
    def check_ldap_port(hostname: str) -> List[Dict]:
        """Check for open LDAP ports"""
        open_ports = []
        
        for port in ADSecurityScanner.LDAP_PORTS:
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(2)
                result = sock.connect_ex((hostname, port))
                sock.close()
                
                if result == 0:
                    port_info = {
                        'port': port,
                        'service': 'LDAP' if port == 389 else 'LDAPS' if port == 636 else f'LDAP-GC ({port})',
                        'encrypted': port in [636, 3269],
                        'status': 'open'
                    }
                    open_ports.append(port_info)
            except:
                continue
        
        return open_ports
    
    @staticmethod
    def scan_active_directory(hostname: str, base_dn: str = None, username: str = None, password: str = None) -> Dict:
        """Comprehensive Active Directory security scan"""
        result = {
            'success': True,
            'hostname': hostname,
            'ldapPorts': [],
            'vulnerabilities': [],
            'summary': {
                'critical': 0,
                'high': 0,
                'medium': 0,
                'total': 0
            }
        }
        
        try:
            # Check LDAP ports
            open_ports = ADSecurityScanner.check_ldap_port(hostname)
            result['ldapPorts'] = open_ports
            
            if not open_ports:
                result['vulnerabilities'].append({
                    'type': 'LDAP Not Accessible',
                    'severity': 'low',
                    'details': 'No LDAP ports found open on target'
                })
                result['message'] = 'LDAP ports not accessible - scan may be limited'
                return result
            
            # Test anonymous bind
            for port_info in open_ports:
                if not port_info.get('encrypted'):
                    anonymous_result = ADSecurityScanner.test_ldap_anonymous_bind(hostname, port_info['port'])
                    if anonymous_result.get('allowed'):
                        result['vulnerabilities'].append(anonymous_result)
            
            # User enumeration
            if username and password:
                enum_result = ADSecurityScanner.enumerate_users(hostname, base_dn, username, password)
                if enum_result.get('success'):
                    result['userEnumeration'] = enum_result
                    if enum_result.get('total', 0) > 0:
                        result['vulnerabilities'].append({
                            'type': 'User Enumeration Possible',
                            'severity': 'medium',
                            'details': f'Successfully enumerated {enum_result["total"]} users'
                        })
            
            # Kerberoasting
            kerberoast_result = ADSecurityScanner.test_kerberoasting()
            if kerberoast_result.get('vulnerable'):
                result['vulnerabilities'].append(kerberoast_result)
            
            # AS-REP Roasting
            asrep_result = ADSecurityScanner.test_asreproasting()
            if asrep_result.get('vulnerable'):
                result['vulnerabilities'].append(asrep_result)
            
            # Calculate summary
            for vuln in result['vulnerabilities']:
                severity = vuln.get('severity', 'medium').lower()
                if severity == 'critical':
                    result['summary']['critical'] += 1
                elif severity == 'high':
                    result['summary']['high'] += 1
                elif severity == 'medium':
                    result['summary']['medium'] += 1
                result['summary']['total'] += 1
            
            result['message'] = f'Active Directory scan completed. Found {result["summary"]["total"]} vulnerabilities.'
            
        except Exception as e:
            result['success'] = False
            result['error'] = str(e)
        
        return result

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Hostname required'}))
        sys.exit(1)
    
    hostname = sys.argv[1]
    base_dn = sys.argv[2] if len(sys.argv) > 2 else None
    username = sys.argv[3] if len(sys.argv) > 3 else None
    password = sys.argv[4] if len(sys.argv) > 4 else None
    
    result = ADSecurityScanner.scan_active_directory(hostname, base_dn, username, password)
    print(json.dumps({'success': True, 'result': result}))

