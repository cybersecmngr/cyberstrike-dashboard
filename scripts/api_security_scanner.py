#!/usr/bin/env python3
"""
Advanced API Security Scanner
REST/GraphQL endpoint discovery, authentication bypass, rate limiting, injection attacks
"""

import sys
import json
import re
import urllib.parse
from typing import Dict, List, Optional
from urllib.parse import urlparse

class APISecurityScanner:
    """Advanced API security scanner"""
    
    # Common API endpoints
    COMMON_ENDPOINTS = [
        '/api/v1/users',
        '/api/v1/admin',
        '/api/v1/data',
        '/api/users',
        '/api/admin',
        '/api/data',
        '/api/v2/users',
        '/api/v2/admin',
        '/graphql',
        '/api/auth',
        '/api/login',
        '/api/logout',
        '/api/register',
        '/api/token',
        '/api/refresh',
        '/api/profile',
        '/api/settings',
        '/api/upload',
        '/api/download',
        '/api/search',
        '/api/query',
    ]
    
    # HTTP methods to test
    HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD']
    
    # Authentication bypass techniques
    AUTH_BYPASS_HEADERS = [
        {'X-Forwarded-For': '127.0.0.1'},
        {'X-Real-IP': '127.0.0.1'},
        {'X-Originating-IP': '127.0.0.1'},
        {'X-Remote-IP': '127.0.0.1'},
        {'X-Remote-Addr': '127.0.0.1'},
        {'X-API-Key': ''},
        {'Authorization': 'Bearer '},
        {'Authorization': 'Basic YWRtaW46YWRtaW4='},  # admin:admin
        {'X-User-Id': '1'},
        {'X-Admin': 'true'},
    ]
    
    # Injection payloads for API parameters
    INJECTION_PAYLOADS = {
        'sql': ["' OR '1'='1", "' UNION SELECT NULL--", "1' AND '1'='1"],
        'nosql': ['{"$ne": null}', '{"$gt": ""}', '{"$where": "this.username == this.password"}'],
        'command': ['; ls', '| id', '&& whoami'],
        'xpath': ["' or '1'='1", "'] | //*[contains(@id, 'admin')] | //*['"],
        'ldap': ['*)(uid=*))(|(uid=*', 'admin)(&(password=*', '*)(|(admin=*'],
    }
    
    @staticmethod
    def discover_endpoints(base_url: str) -> List[Dict]:
        """Discover API endpoints"""
        discovered = []
        
        try:
            import requests
            from requests.exceptions import RequestException, Timeout
            
            base_url_parsed = urlparse(base_url)
            base_path = base_url_parsed.path.rstrip('/')
            if not base_path:
                base_path = ''
            
            for endpoint in APISecurityScanner.COMMON_ENDPOINTS:
                full_url = f"{base_url_parsed.scheme}://{base_url_parsed.netloc}{base_path}{endpoint}"
                
                try:
                    response = requests.get(full_url, timeout=5, allow_redirects=False)
                    
                    if response.status_code not in [404, 403]:
                        discovered.append({
                            'endpoint': endpoint,
                            'url': full_url,
                            'statusCode': response.status_code,
                            'method': 'GET',
                            'contentType': response.headers.get('Content-Type', ''),
                            'size': len(response.content),
                            'accessible': response.status_code in [200, 201, 401, 403]
                        })
                except (RequestException, Timeout):
                    continue
        except ImportError:
            pass
        
        return discovered
    
    @staticmethod
    def test_authentication_bypass(url: str) -> List[Dict]:
        """Test authentication bypass techniques"""
        results = []
        
        try:
            import requests
            from requests.exceptions import RequestException, Timeout
            
            # Try without authentication
            try:
                no_auth_response = requests.get(url, timeout=10, allow_redirects=False)
                if no_auth_response.status_code == 200:
                    results.append({
                        'vulnerability': 'Authentication Bypass',
                        'severity': 'critical',
                        'technique': 'No authentication required',
                        'statusCode': 200,
                        'evidence': 'Endpoint accessible without authentication'
                    })
            except:
                pass
            
            # Try with bypass headers
            for header_set in APISecurityScanner.AUTH_BYPASS_HEADERS:
                try:
                    response = requests.get(url, headers=header_set, timeout=10, allow_redirects=False)
                    
                    if response.status_code == 200 and response.status_code != no_auth_response.status_code:
                        results.append({
                            'vulnerability': 'Authentication Bypass',
                            'severity': 'high',
                            'technique': f'Header manipulation: {list(header_set.keys())[0]}',
                            'statusCode': response.status_code,
                            'evidence': 'Endpoint accessible with manipulated headers'
                        })
                except:
                    continue
        except ImportError:
            pass
        
        return results
    
    @staticmethod
    def test_rate_limiting(url: str) -> Dict:
        """Test for rate limiting"""
        result = {
            'vulnerability': 'Rate Limiting',
            'protected': False,
            'requests': 0,
            'blocked': False,
            'recommendations': []
        }
        
        try:
            import requests
            from requests.exceptions import RequestException, Timeout
            import time
            
            # Send multiple rapid requests
            status_codes = []
            for i in range(20):
                try:
                    response = requests.get(url, timeout=5, allow_redirects=False)
                    status_codes.append(response.status_code)
                    
                    # Check for rate limiting headers
                    rate_limit_headers = [
                        'X-RateLimit-Limit',
                        'X-RateLimit-Remaining',
                        'X-RateLimit-Reset',
                        'Retry-After',
                        'RateLimit-Limit',
                        'RateLimit-Remaining',
                    ]
                    
                    if any(header in response.headers for header in rate_limit_headers):
                        result['protected'] = True
                        result['requests'] = i + 1
                        break
                    
                    # Check for 429 status code
                    if response.status_code == 429:
                        result['protected'] = True
                        result['blocked'] = True
                        result['requests'] = i + 1
                        break
                    
                    time.sleep(0.1)  # Small delay
                except:
                    break
            
            result['requests'] = len(status_codes)
            
            if not result['protected']:
                result['severity'] = 'medium'
                result['recommendations'].append('Implement rate limiting to prevent abuse')
                result['recommendations'].append('Add X-RateLimit-* headers')
        except ImportError:
            pass
        
        return result
    
    @staticmethod
    def test_injection_attacks(url: str, params: Dict[str, str]) -> List[Dict]:
        """Test for injection attacks in API"""
        results = []
        
        try:
            import requests
            from requests.exceptions import RequestException, Timeout
            
            # Test each injection type
            for injection_type, payloads in APISecurityScanner.INJECTION_PAYLOADS.items():
                for payload in payloads:
                    for param_name, param_value in params.items():
                        test_params = params.copy()
                        test_params[param_name] = payload
                        
                        try:
                            # Test GET
                            response = requests.get(url, params=test_params, timeout=10, allow_redirects=False)
                            
                            # Check for injection indicators
                            indicators = {
                                'sql': ['sql syntax', 'mysql error', 'postgresql error'],
                                'nosql': ['mongodb', 'syntax error', 'unexpected token'],
                                'command': ['uid=', 'gid=', 'root:x:'],
                                'xpath': ['xpath', 'invalid expression'],
                                'ldap': ['ldap', 'invalid dn'],
                            }
                            
                            response_text = response.text.lower()
                            if injection_type in indicators:
                                if any(indicator in response_text for indicator in indicators[injection_type]):
                                    results.append({
                                        'vulnerability': f'{injection_type.upper()} Injection',
                                        'severity': 'high' if injection_type in ['sql', 'command'] else 'medium',
                                        'parameter': param_name,
                                        'payload': payload,
                                        'statusCode': response.status_code,
                                        'evidence': f'{injection_type.upper()} error detected'
                                    })
                        except (RequestException, Timeout):
                            continue
                        
                        # Test POST
                        try:
                            response = requests.post(url, json=test_params, timeout=10, allow_redirects=False)
                            response_text = response.text.lower()
                            
                            if injection_type in indicators:
                                if any(indicator in response_text for indicator in indicators[injection_type]):
                                    results.append({
                                        'vulnerability': f'{injection_type.upper()} Injection (POST)',
                                        'severity': 'high' if injection_type in ['sql', 'command'] else 'medium',
                                        'parameter': param_name,
                                        'payload': payload,
                                        'statusCode': response.status_code,
                                        'evidence': f'{injection_type.upper()} error detected in POST request'
                                    })
                        except:
                            pass
        except ImportError:
            pass
        
        return results
    
    @staticmethod
    def test_cors_misconfiguration(url: str) -> Dict:
        """Test for CORS misconfiguration"""
        result = {
            'vulnerability': 'CORS Misconfiguration',
            'misconfigured': False,
            'severity': 'medium',
            'indicators': []
        }
        
        try:
            import requests
            from requests.exceptions import RequestException, Timeout
            
            try:
                # Send OPTIONS request with Origin header
                headers = {
                    'Origin': 'https://evil.com',
                    'Access-Control-Request-Method': 'POST',
                    'Access-Control-Request-Headers': 'Content-Type'
                }
                
                response = requests.options(url, headers=headers, timeout=10, allow_redirects=False)
                
                cors_headers = {
                    'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin', ''),
                    'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials', ''),
                    'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods', ''),
                    'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers', ''),
                }
                
                # Check for misconfigurations
                if cors_headers['Access-Control-Allow-Origin'] == '*':
                    result['misconfigured'] = True
                    result['severity'] = 'high'
                    result['indicators'].append('Access-Control-Allow-Origin set to * (allows all origins)')
                
                if cors_headers['Access-Control-Allow-Origin'] == 'https://evil.com':
                    result['misconfigured'] = True
                    result['severity'] = 'critical'
                    result['indicators'].append('Origin reflection detected - allows arbitrary origins')
                
                if cors_headers['Access-Control-Allow-Credentials'] == 'true' and cors_headers['Access-Control-Allow-Origin'] == '*':
                    result['misconfigured'] = True
                    result['severity'] = 'critical'
                    result['indicators'].append('CORS allows credentials with wildcard origin')
                
                result['corsHeaders'] = cors_headers
                
            except (RequestException, Timeout):
                result['indicators'].append('Failed to test CORS configuration')
        except ImportError:
            pass
        
        return result
    
    @staticmethod
    def test_http_methods(url: str) -> List[Dict]:
        """Test different HTTP methods"""
        results = []
        
        try:
            import requests
            from requests.exceptions import RequestException, Timeout
            
            for method in APISecurityScanner.HTTP_METHODS:
                try:
                    response = requests.request(method, url, timeout=10, allow_redirects=False)
                    
                    if response.status_code not in [404, 405]:
                        results.append({
                            'method': method,
                            'statusCode': response.status_code,
                            'allowed': response.status_code not in [405],
                            'contentLength': len(response.content)
                        })
                except (RequestException, Timeout):
                    continue
        except ImportError:
            pass
        
        return results
    
    @staticmethod
    def scan_api(base_url: str, scan_types: List[str] = None) -> Dict:
        """Comprehensive API security scan"""
        if scan_types is None:
            scan_types = ['discovery', 'auth', 'injection', 'cors', 'ratelimit', 'methods']
        
        result = {
            'success': True,
            'baseUrl': base_url,
            'endpoints': [],
            'vulnerabilities': [],
            'summary': {
                'critical': 0,
                'high': 0,
                'medium': 0,
                'total': 0
            }
        }
        
        try:
            # Endpoint discovery
            if 'discovery' in scan_types:
                discovered = APISecurityScanner.discover_endpoints(base_url)
                result['endpoints'] = discovered
            
            # Test discovered endpoints or base URL
            test_urls = [endpoint['url'] for endpoint in result['endpoints']] if result['endpoints'] else [base_url]
            
            for test_url in test_urls[:5]:  # Limit to first 5 endpoints
                # Authentication bypass
                if 'auth' in scan_types:
                    auth_results = APISecurityScanner.test_authentication_bypass(test_url)
                    result['vulnerabilities'].extend(auth_results)
                
                # Injection attacks
                if 'injection' in scan_types:
                    parsed = urlparse(test_url)
                    params = {k: v[0] if v else '1' for k, v in urllib.parse.parse_qs(parsed.query).items()}
                    if not params:
                        params = {'id': '1', 'user': 'admin'}
                    
                    injection_results = APISecurityScanner.test_injection_attacks(test_url, params)
                    result['vulnerabilities'].extend(injection_results)
                
                # CORS
                if 'cors' in scan_types:
                    cors_result = APISecurityScanner.test_cors_misconfiguration(test_url)
                    if cors_result.get('misconfigured'):
                        result['vulnerabilities'].append(cors_result)
                
                # Rate limiting
                if 'ratelimit' in scan_types:
                    rate_limit_result = APISecurityScanner.test_rate_limiting(test_url)
                    if not rate_limit_result.get('protected'):
                        result['vulnerabilities'].append(rate_limit_result)
                
                # HTTP methods
                if 'methods' in scan_types:
                    methods_result = APISecurityScanner.test_http_methods(test_url)
                    if methods_result:
                        result['vulnerabilities'].append({
                            'vulnerability': 'HTTP Methods',
                            'severity': 'low',
                            'methods': methods_result,
                            'evidence': 'Multiple HTTP methods allowed'
                        })
            
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
            
            result['message'] = f'API security scan completed. Found {result["summary"]["total"]} vulnerabilities across {len(result["endpoints"])} endpoints.'
            
        except Exception as e:
            result['success'] = False
            result['error'] = str(e)
        
        return result

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Base URL required'}))
        sys.exit(1)
    
    base_url = sys.argv[1]
    scan_types = sys.argv[2].split(',') if len(sys.argv) > 2 else None
    
    result = APISecurityScanner.scan_api(base_url, scan_types)
    print(json.dumps({'success': True, 'result': result}))

