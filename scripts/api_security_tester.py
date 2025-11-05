#!/usr/bin/env python3
"""
API Security Tester
Tests REST APIs for security vulnerabilities
"""

import sys
import json
import requests
from typing import List, Dict
from urllib.parse import urljoin

def test_api_security(base_url: str, endpoints: List[str], test_type: str) -> List[Dict]:
    """Test API for security vulnerabilities"""
    results = []
    
    # Default endpoints if none provided
    if not endpoints:
        endpoints = ['/api/users', '/api/admin', '/api/data', '/api/config']
    
    for endpoint in endpoints:
        full_url = urljoin(base_url.rstrip('/') + '/', endpoint.lstrip('/'))
        
        # Test different HTTP methods
        methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
        
        for method in methods:
            try:
                # Test without authentication
                if method == 'GET':
                    response = requests.get(full_url, timeout=5, allow_redirects=False)
                elif method == 'POST':
                    response = requests.post(full_url, json={}, timeout=5, allow_redirects=False)
                elif method == 'PUT':
                    response = requests.put(full_url, json={}, timeout=5, allow_redirects=False)
                elif method == 'DELETE':
                    response = requests.delete(full_url, timeout=5, allow_redirects=False)
                elif method == 'PATCH':
                    response = requests.patch(full_url, json={}, timeout=5, allow_redirects=False)
                
                vulnerable = False
                issue = None
                severity = 'low'
                
                # Check for vulnerabilities based on test type
                if test_type == 'authentication':
                    if response.status_code == 200:
                        vulnerable = True
                        issue = 'Missing authentication - endpoint accessible without credentials'
                        severity = 'high'
                    elif response.status_code == 401:
                        vulnerable = False
                    elif response.status_code == 403:
                        vulnerable = False
                
                elif test_type == 'authorization':
                    if response.status_code == 200:
                        vulnerable = True
                        issue = 'Authorization bypass - unauthorized access granted'
                        severity = 'critical'
                    elif response.status_code == 403:
                        vulnerable = False
                
                elif test_type == 'injection':
                    # Test for injection vulnerabilities
                    test_payloads = {
                        'POST': {'data': "'; DROP TABLE users--"},
                        'GET': {'params': {'id': "1' OR '1'='1"}}
                    }
                    
                    if method == 'POST':
                        test_response = requests.post(full_url, json=test_payloads['POST'], timeout=5)
                        if 'error' in test_response.text.lower() or 'sql' in test_response.text.lower():
                            vulnerable = True
                            issue = 'Potential SQL injection vulnerability'
                            severity = 'critical'
                    elif method == 'GET':
                        test_response = requests.get(full_url, params=test_payloads['GET'], timeout=5)
                        if 'error' in test_response.text.lower() or 'sql' in test_response.text.lower():
                            vulnerable = True
                            issue = 'Potential SQL injection vulnerability'
                            severity = 'critical'
                
                elif test_type == 'rate-limit':
                    # Test rate limiting
                    rapid_requests = [requests.get(full_url, timeout=2) for _ in range(10)]
                    successful = sum(1 for r in rapid_requests if r.status_code == 200)
                    if successful >= 10:
                        vulnerable = True
                        issue = 'No rate limiting detected'
                        severity = 'medium'
                
                elif test_type == 'cors':
                    # Test CORS misconfiguration
                    headers = response.headers
                    if 'Access-Control-Allow-Origin' in headers:
                        if headers['Access-Control-Allow-Origin'] == '*':
                            vulnerable = True
                            issue = 'CORS misconfiguration - allows all origins'
                            severity = 'medium'
                        elif 'Access-Control-Allow-Credentials' in headers:
                            if headers['Access-Control-Allow-Credentials'].lower() == 'true':
                                vulnerable = True
                                issue = 'CORS allows credentials with wildcard origin'
                                severity = 'high'
                
                results.append({
                    'endpoint': endpoint,
                    'method': method,
                    'status': response.status_code,
                    'vulnerable': vulnerable,
                    'issue': issue,
                    'severity': severity
                })
                
            except requests.exceptions.RequestException:
                results.append({
                    'endpoint': endpoint,
                    'method': method,
                    'status': 0,
                    'vulnerable': False,
                    'severity': 'low'
                })
    
    return results

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Base URL required'}))
        sys.exit(1)
    
    base_url = sys.argv[1]
    endpoints = sys.argv[2].split(',') if len(sys.argv) > 2 and sys.argv[2] else []
    test_type = sys.argv[3] if len(sys.argv) > 3 else 'authentication'
    
    results = test_api_security(base_url, endpoints, test_type)
    print(json.dumps({'success': True, 'results': results}))

