#!/usr/bin/env python3
"""
Code Analyzer - Security Vulnerability Detection
Analyzes code for security vulnerabilities and bad practices
"""

import sys
import json
import re
from typing import List, Dict

def analyze_code(code: str, language: str = 'python') -> Dict:
    """Analyze code for security vulnerabilities"""
    vulnerabilities = []
    
    if language == 'python':
        # Check for dangerous functions
        dangerous_patterns = [
            (r'eval\s*\(', 'Use of eval() - Code injection risk', 'critical'),
            (r'exec\s*\(', 'Use of exec() - Code injection risk', 'critical'),
            (r'__import__\s*\(', 'Dynamic import - Security risk', 'high'),
            (r'pickle\.loads?\s*\(', 'Unpickle untrusted data - Deserialization attack', 'critical'),
            (r'yaml\.load\s*\(', 'Unsafe YAML loading', 'high'),
            (r'subprocess\.call\s*\([^)]*shell\s*=\s*True', 'Shell injection risk', 'critical'),
            (r'os\.system\s*\(', 'Command injection risk', 'critical'),
            (r'input\s*\(', 'Unvalidated user input', 'medium'),
            (r'SQL.*%s|SQL.*\+', 'SQL injection risk - String formatting', 'critical'),
            (r'requests\.(get|post).*verify\s*=\s*False', 'SSL verification disabled', 'high'),
            (r'password\s*=\s*["\'].*["\']', 'Hardcoded password', 'critical'),
            (r'api[_-]?key\s*=\s*["\'].*["\']', 'Hardcoded API key', 'high'),
            (r'secret\s*=\s*["\'].*["\']', 'Hardcoded secret', 'critical'),
        ]
        
        for pattern, description, severity in dangerous_patterns:
            matches = re.finditer(pattern, code, re.IGNORECASE)
            for match in matches:
                line_num = code[:match.start()].count('\n') + 1
                vulnerabilities.append({
                    'line': line_num,
                    'severity': severity,
                    'issue': description,
                    'code': code.split('\n')[line_num - 1].strip() if line_num <= len(code.split('\n')) else ''
                })
    
    elif language == 'javascript':
        dangerous_patterns = [
            (r'eval\s*\(', 'Use of eval() - XSS risk', 'critical'),
            (r'innerHTML\s*=', 'innerHTML assignment - XSS risk', 'high'),
            (r'document\.write\s*\(', 'document.write() - XSS risk', 'high'),
            (r'Function\s*\(', 'Dynamic function creation', 'high'),
            (r'localStorage\.setItem.*password', 'Storing passwords in localStorage', 'critical'),
            (r'localStorage\.setItem.*token', 'Storing tokens in localStorage - XSS risk', 'high'),
        ]
        
        for pattern, description, severity in dangerous_patterns:
            matches = re.finditer(pattern, code, re.IGNORECASE)
            for match in matches:
                line_num = code[:match.start()].count('\n') + 1
                vulnerabilities.append({
                    'line': line_num,
                    'severity': severity,
                    'issue': description,
                    'code': code.split('\n')[line_num - 1].strip() if line_num <= len(code.split('\n')) else ''
                })
    
    elif language == 'sql':
        dangerous_patterns = [
            (r'SELECT.*FROM.*WHERE.*\+', 'String concatenation in SQL', 'critical'),
            (r'EXEC\s*\(', 'Dynamic SQL execution', 'critical'),
            (r'xp_cmdshell', 'xp_cmdshell - Command injection', 'critical'),
            (r'UNION.*SELECT', 'Potential SQL injection', 'high'),
        ]
        
        for pattern, description, severity in dangerous_patterns:
            matches = re.finditer(pattern, code, re.IGNORECASE)
            for match in matches:
                line_num = code[:match.start()].count('\n') + 1
                vulnerabilities.append({
                    'line': line_num,
                    'severity': severity,
                    'issue': description,
                    'code': code.split('\n')[line_num - 1].strip() if line_num <= len(code.split('\n')) else ''
                })
    
    return {
        'vulnerabilities': vulnerabilities,
        'total': len(vulnerabilities),
        'critical': len([v for v in vulnerabilities if v['severity'] == 'critical']),
        'high': len([v for v in vulnerabilities if v['severity'] == 'high']),
        'medium': len([v for v in vulnerabilities if v['severity'] == 'medium'])
    }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Code required'}))
        sys.exit(1)
    
    code = sys.argv[1]
    language = sys.argv[2] if len(sys.argv) > 2 else 'python'
    
    result = analyze_code(code, language)
    print(json.dumps({'success': True, **result}))

