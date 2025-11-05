#!/usr/bin/env python3
"""
Advanced Cryptographic Vulnerability Scanner
Weak ciphers, SSL/TLS issues, certificate analysis, encryption weaknesses
"""

import sys
import json
import socket
import ssl
import re
from typing import Dict, List, Optional
from datetime import datetime, timedelta

class CryptoSecurityScanner:
    """Advanced cryptographic vulnerability scanner"""
    
    # Weak cipher suites
    WEAK_CIPHERS = [
        'SSLv2', 'SSLv3', 'TLSv1.0', 'TLSv1.1',
        'RC4', 'MD5', 'SHA1', 'DES', '3DES',
        'NULL', 'EXPORT', 'ANON', 'ADH', 'AECDH',
        'CBC', 'ECB'
    ]
    
    # Strong cipher suites (modern)
    STRONG_CIPHERS = [
        'TLSv1.2', 'TLSv1.3',
        'AES-GCM', 'AES-CCM', 'ChaCha20-Poly1305',
        'ECDHE', 'DHE', 'RSA'
    ]
    
    @staticmethod
    def scan_certificate(hostname: str, port: int = 443) -> Dict:
        """Scan SSL/TLS certificate"""
        result = {
            'success': True,
            'hostname': hostname,
            'port': port,
            'certificate': {},
            'vulnerabilities': [],
            'recommendations': []
        }
        
        try:
            context = ssl.create_default_context()
            context.check_hostname = False
            context.verify_mode = ssl.CERT_NONE
            
            with socket.create_connection((hostname, port), timeout=10) as sock:
                with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                    cert = ssock.getpeercert()
                    cipher = ssock.cipher()
                    version = ssock.version()
                    
                    result['certificate'] = {
                        'subject': dict(x[0] for x in cert.get('subject', [])),
                        'issuer': dict(x[0] for x in cert.get('issuer', [])),
                        'version': cert.get('version'),
                        'serialNumber': cert.get('serialNumber'),
                        'notBefore': cert.get('notBefore'),
                        'notAfter': cert.get('notAfter'),
                        'subjectAltName': cert.get('subjectAltName', [])
                    }
                    
                    result['tlsVersion'] = version
                    result['cipherSuite'] = cipher[0] if cipher else None
                    result['cipherName'] = cipher[1] if cipher and len(cipher) > 1 else None
                    result['cipherVersion'] = cipher[2] if cipher and len(cipher) > 2 else None
                    
                    # Check certificate expiry
                    try:
                        from dateutil import parser  # type: ignore
                        not_after = cert.get('notAfter')
                        if not_after:
                            expiry = parser.parse(not_after)
                            days_until_expiry = (expiry - datetime.now()).days
                            
                            if days_until_expiry < 0:
                                result['vulnerabilities'].append({
                                    'type': 'Certificate Expired',
                                    'severity': 'high',
                                    'details': f'Certificate expired {abs(days_until_expiry)} days ago'
                                })
                            elif days_until_expiry < 30:
                                result['vulnerabilities'].append({
                                    'type': 'Certificate Expiring Soon',
                                    'severity': 'medium',
                                    'details': f'Certificate expires in {days_until_expiry} days'
                                })
                    except:
                        pass
                    
                    # Check for weak TLS version
                    if version in ['TLSv1', 'TLSv1.1', 'SSLv2', 'SSLv3']:
                        result['vulnerabilities'].append({
                            'type': 'Weak TLS Version',
                            'severity': 'high',
                            'details': f'Using deprecated TLS version: {version}'
                        })
                        result['recommendations'].append(f'Disable {version} and use TLSv1.2 or TLSv1.3')
                    
                    # Check for weak cipher
                    if cipher:
                        cipher_name = cipher[0]
                        if any(weak in cipher_name for weak in ['RC4', 'MD5', 'DES', 'NULL', 'EXPORT']):
                            result['vulnerabilities'].append({
                                'type': 'Weak Cipher Suite',
                                'severity': 'high',
                                'details': f'Using weak cipher: {cipher_name}'
                            })
                            result['recommendations'].append('Disable weak cipher suites')
        except Exception as e:
            result['success'] = False
            result['error'] = str(e)
        
        return result
    
    @staticmethod
    def test_tls_versions(hostname: str, port: int = 443) -> Dict:
        """Test all TLS versions"""
        result = {
            'supportedVersions': [],
            'vulnerableVersions': [],
            'secureVersions': []
        }
        
        tls_versions = [
            (ssl.PROTOCOL_TLSv1, 'TLSv1'),
            (ssl.PROTOCOL_TLSv1_1, 'TLSv1.1'),
            (ssl.PROTOCOL_TLSv1_2, 'TLSv1.2'),
        ]
        
        # Try TLS 1.3
        try:
            tls_versions.append((ssl.PROTOCOL_TLS, 'TLSv1.3'))
        except:
            pass
        
        for protocol, version_name in tls_versions:
            try:
                context = ssl.SSLContext(protocol)
                context.check_hostname = False
                context.verify_mode = ssl.CERT_NONE
                
                with socket.create_connection((hostname, port), timeout=5) as sock:
                    with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                        result['supportedVersions'].append(version_name)
                        if version_name in ['TLSv1', 'TLSv1.1', 'SSLv2', 'SSLv3']:
                            result['vulnerableVersions'].append(version_name)
                        else:
                            result['secureVersions'].append(version_name)
            except:
                continue
        
        return result
    
    @staticmethod
    def test_cipher_suites(hostname: str, port: int = 443) -> Dict:
        """Test cipher suite support"""
        result = {
            'supportedCiphers': [],
            'weakCiphers': [],
            'strongCiphers': [],
            'recommendations': []
        }
        
        try:
            context = ssl.create_default_context()
            context.check_hostname = False
            context.verify_mode = ssl.CERT_NONE
            
            # Get available cipher suites
            with socket.create_connection((hostname, port), timeout=10) as sock:
                with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                    # Get cipher info
                    cipher = ssock.cipher()
                    if cipher:
                        cipher_name = cipher[0]
                        result['supportedCiphers'].append(cipher_name)
                        
                        # Check for weak ciphers
                        if any(weak in cipher_name for weak in CryptoSecurityScanner.WEAK_CIPHERS):
                            result['weakCiphers'].append(cipher_name)
                            result['recommendations'].append(f'Disable weak cipher: {cipher_name}')
                        else:
                            result['strongCiphers'].append(cipher_name)
        except Exception as e:
            result['error'] = str(e)
        
        return result
    
    @staticmethod
    def check_certificate_chain(hostname: str, port: int = 443) -> Dict:
        """Check certificate chain validation"""
        result = {
            'chainValid': False,
            'chainLength': 0,
            'issues': [],
            'recommendations': []
        }
        
        try:
            context = ssl.create_default_context()
            context.check_hostname = True
            context.verify_mode = ssl.CERT_REQUIRED
            
            try:
                with socket.create_connection((hostname, port), timeout=10) as sock:
                    with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                        result['chainValid'] = True
                        # Get certificate chain
                        cert_chain = ssock.getpeercert_chain()
                        if cert_chain:
                            result['chainLength'] = len(cert_chain)
            except ssl.SSLCertVerificationError as e:
                result['issues'].append(f'Certificate chain validation failed: {str(e)}')
                result['recommendations'].append('Fix certificate chain - ensure all intermediate certificates are included')
            except Exception as e:
                result['issues'].append(f'Certificate error: {str(e)}')
        except Exception as e:
            result['error'] = str(e)
        
        return result
    
    @staticmethod
    def check_weak_encryption_algorithms() -> Dict:
        """Check for weak encryption algorithms in system"""
        result = {
            'weakAlgorithms': [],
            'recommendations': []
        }
        
        # Check OpenSSL version
        try:
            import subprocess
            openssl_check = subprocess.run(['openssl', 'version'], 
                                          capture_output=True, text=True, timeout=5)
            if openssl_check.returncode == 0:
                version = openssl_check.stdout.strip()
                # Check for old versions
                version_match = re.search(r'(\d+)\.(\d+)\.(\d+)', version)
                if version_match:
                    major, minor, patch = map(int, version_match.groups())
                    if major < 1 or (major == 1 and minor < 1):
                        result['weakAlgorithms'].append({
                            'algorithm': 'OpenSSL',
                            'version': version,
                            'severity': 'high',
                            'issue': 'Outdated OpenSSL version with known vulnerabilities'
                        })
                        result['recommendations'].append('Update OpenSSL to latest version')
        except:
            pass
        
        return result
    
    @staticmethod
    def scan_cryptographic_security(hostname: str, port: int = 443) -> Dict:
        """Comprehensive cryptographic security scan"""
        result = {
            'success': True,
            'hostname': hostname,
            'port': port,
            'certificate': {},
            'tlsVersions': {},
            'cipherSuites': {},
            'certificateChain': {},
            'vulnerabilities': [],
            'summary': {
                'critical': 0,
                'high': 0,
                'medium': 0,
                'total': 0
            }
        }
        
        try:
            # Certificate scan
            cert_result = CryptoSecurityScanner.scan_certificate(hostname, port)
            result['certificate'] = cert_result.get('certificate', {})
            result['vulnerabilities'].extend(cert_result.get('vulnerabilities', []))
            
            # TLS version test
            tls_result = CryptoSecurityScanner.test_tls_versions(hostname, port)
            result['tlsVersions'] = tls_result
            
            if tls_result.get('vulnerableVersions'):
                result['vulnerabilities'].append({
                    'type': 'Vulnerable TLS Versions',
                    'severity': 'high',
                    'details': f'Server supports vulnerable TLS versions: {", ".join(tls_result["vulnerableVersions"])}'
                })
            
            # Cipher suite test
            cipher_result = CryptoSecurityScanner.test_cipher_suites(hostname, port)
            result['cipherSuites'] = cipher_result
            
            if cipher_result.get('weakCiphers'):
                result['vulnerabilities'].append({
                    'type': 'Weak Cipher Suites',
                    'severity': 'high',
                    'details': f'Server supports weak ciphers: {", ".join(cipher_result["weakCiphers"])}'
                })
            
            # Certificate chain check
            chain_result = CryptoSecurityScanner.check_certificate_chain(hostname, port)
            result['certificateChain'] = chain_result
            
            if chain_result.get('issues'):
                result['vulnerabilities'].append({
                    'type': 'Certificate Chain Issues',
                    'severity': 'medium',
                    'details': '; '.join(chain_result['issues'])
                })
            
            # Weak encryption algorithms
            weak_algo_result = CryptoSecurityScanner.check_weak_encryption_algorithms()
            if weak_algo_result.get('weakAlgorithms'):
                result['vulnerabilities'].extend(weak_algo_result['weakAlgorithms'])
            
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
            
            result['message'] = f'Cryptographic security scan completed. Found {result["summary"]["total"]} vulnerabilities.'
            
        except Exception as e:
            result['success'] = False
            result['error'] = str(e)
        
        return result

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Hostname required'}))
        sys.exit(1)
    
    hostname = sys.argv[1]
    port = int(sys.argv[2]) if len(sys.argv) > 2 else 443
    
    result = CryptoSecurityScanner.scan_cryptographic_security(hostname, port)
    print(json.dumps({'success': True, 'result': result}))

