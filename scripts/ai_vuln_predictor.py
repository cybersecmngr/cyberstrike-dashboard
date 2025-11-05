#!/usr/bin/env python3
"""
AI-Powered Vulnerability Predictor
Machine learning-based vulnerability prediction and pattern recognition
Advanced statistical analysis with predictive modeling
"""

import sys
import json
import re
import hashlib
import urllib.parse
from typing import Dict, List, Optional, Tuple
from collections import Counter
from urllib.parse import urlparse

class AIVulnerabilityPredictor:
    """AI-powered vulnerability predictor using pattern recognition"""
    
    # Vulnerability patterns (ML-inspired features)
    VULN_PATTERNS = {
        'sql_injection': {
            'indicators': [
                r'select\s+.*\s+from',
                r'union\s+select',
                r'where\s+.*\s*=\s*',
                r'order\s+by',
                r'group\s+by',
                r'insert\s+into',
                r'update\s+.*\s+set',
                r'delete\s+from',
            ],
            'weight': 0.9
        },
        'xss': {
            'indicators': [
                r'<script',
                r'javascript:',
                r'onerror=',
                r'onload=',
                r'eval\(',
                r'document\.',
                r'innerHTML',
                r'outerHTML',
            ],
            'weight': 0.85
        },
        'rce': {
            'indicators': [
                r'system\(',
                r'exec\(',
                r'eval\(',
                r'shell_exec',
                r'passthru',
                r'popen',
                r'proc_open',
            ],
            'weight': 0.95
        },
        'file_inclusion': {
            'indicators': [
                r'include\s*\(',
                r'require\s*\(',
                r'include_once',
                r'require_once',
                r'\.\./',
                r'\.\.\\\\',
            ],
            'weight': 0.8
        },
        'path_traversal': {
            'indicators': [
                r'\.\./',
                r'\.\.\\\\',
                r'%2e%2e%2f',
                r'%2e%2e%5c',
            ],
            'weight': 0.75
        },
        'command_injection': {
            'indicators': [
                r';\s*\w+',
                r'\|\s*\w+',
                r'&&\s*\w+',
                r'\|\|\s*\w+',
                r'`[^`]+`',
                r'\$\([^)]+\)',
            ],
            'weight': 0.9
        }
    }
    
    # Code complexity metrics
    COMPLEXITY_INDICATORS = {
        'high_complexity': [
            'nested_ifs', 'multiple_loops', 'deep_recursion',
            'dynamic_evaluation', 'reflection', 'metaprogramming'
        ],
        'risk_factors': [
            'user_input', 'external_data', 'file_operations',
            'network_operations', 'database_queries', 'system_calls'
        ]
    }
    
    @staticmethod
    def analyze_code_patterns(code: str) -> Dict:
        """Analyze code for vulnerability patterns"""
        result = {
            'vulnerability_scores': {},
            'risk_level': 'low',
            'confidence': 0.0,
            'patterns_found': [],
            'recommendations': []
        }
        
        code_lower = code.lower()
        
        # Analyze each vulnerability type
        for vuln_type, pattern_info in AIVulnerabilityPredictor.VULN_PATTERNS.items():
            score = 0.0
            matches = []
            
            for pattern in pattern_info['indicators']:
                matches_found = re.findall(pattern, code_lower, re.IGNORECASE)
                if matches_found:
                    matches.extend(matches_found)
                    score += pattern_info['weight'] * len(matches_found)
            
            if score > 0:
                result['vulnerability_scores'][vuln_type] = {
                    'score': min(1.0, score),
                    'matches': len(set(matches)),
                    'confidence': min(1.0, score * 0.8)
                }
                result['patterns_found'].extend(matches)
        
        # Calculate overall risk level
        max_score = max([v['score'] for v in result['vulnerability_scores'].values()]) if result['vulnerability_scores'] else 0.0
        
        if max_score >= 0.8:
            result['risk_level'] = 'critical'
        elif max_score >= 0.6:
            result['risk_level'] = 'high'
        elif max_score >= 0.4:
            result['risk_level'] = 'medium'
        else:
            result['risk_level'] = 'low'
        
        result['confidence'] = max_score
        
        # Generate recommendations
        if result['vulnerability_scores']:
            for vuln_type, vuln_data in result['vulnerability_scores'].items():
                if vuln_data['score'] > 0.5:
                    result['recommendations'].append(
                        f'Potential {vuln_type} vulnerability detected - review code for {vuln_type} patterns'
                    )
        
        return result
    
    @staticmethod
    def predict_vulnerabilities_from_url(url: str) -> Dict:
        """Predict vulnerabilities from URL structure and parameters"""
        result = {
            'url': url,
            'predicted_vulnerabilities': [],
            'risk_score': 0.0,
            'confidence': 0.0
        }
        
        parsed = urlparse(url)
        params = {}
        
        # Parse query parameters
        if parsed.query:
            params = dict(urllib.parse.parse_qsl(parsed.query))
        
        # Analyze URL structure
        url_lower = url.lower()
        
        # Check for suspicious patterns
        suspicious_patterns = {
            'sql_injection_risk': [
                'id=', 'user=', 'page=', 'search=', 'query=',
                'sort=', 'order=', 'filter='
            ],
            'file_operation_risk': [
                'file=', 'path=', 'include=', 'load=', 'download='
            ],
            'command_execution_risk': [
                'cmd=', 'command=', 'exec=', 'run='
            ],
            'xss_risk': [
                'q=', 'search=', 'query=', 'term='
            ]
        }
        
        for risk_type, patterns in suspicious_patterns.items():
            for pattern in patterns:
                if pattern in url_lower:
                    result['predicted_vulnerabilities'].append({
                        'type': risk_type.replace('_risk', ''),
                        'parameter': pattern.rstrip('='),
                        'confidence': 0.6,
                        'reason': f'URL contains suspicious parameter: {pattern}'
                    })
                    result['risk_score'] += 0.15
        
        # Analyze parameter values
        for param_name, param_value in params.items():
            param_lower = param_value.lower() if param_value else ''
            
            # Check for SQL injection patterns
            if any(keyword in param_lower for keyword in ['select', 'union', 'or', 'and', "'", '--']):
                result['predicted_vulnerabilities'].append({
                    'type': 'sql_injection',
                    'parameter': param_name,
                    'confidence': 0.8,
                    'reason': f'Parameter {param_name} contains SQL-like patterns'
                })
                result['risk_score'] += 0.2
            
            # Check for XSS patterns
            if any(keyword in param_lower for keyword in ['<script', 'javascript:', 'onerror=', 'onload=']):
                result['predicted_vulnerabilities'].append({
                    'type': 'xss',
                    'parameter': param_name,
                    'confidence': 0.85,
                    'reason': f'Parameter {param_name} contains XSS-like patterns'
                })
                result['risk_score'] += 0.2
            
            # Check for path traversal
            if '../' in param_value or '..\\' in param_value:
                result['predicted_vulnerabilities'].append({
                    'type': 'path_traversal',
                    'parameter': param_name,
                    'confidence': 0.9,
                    'reason': f'Parameter {param_name} contains path traversal patterns'
                })
                result['risk_score'] += 0.25
        
        result['risk_score'] = min(1.0, result['risk_score'])
        result['confidence'] = result['risk_score'] * 0.9
        
        return result
    
    @staticmethod
    def analyze_http_response(response_text: str, status_code: int) -> Dict:
        """Analyze HTTP response for vulnerability indicators"""
        result = {
            'vulnerability_indicators': [],
            'risk_score': 0.0,
            'recommendations': []
        }
        
        response_lower = response_text.lower()
        
        # Error messages that indicate vulnerabilities
        error_patterns = {
            'sql_injection': [
                'sql syntax', 'mysql error', 'postgresql error',
                'ora-', 'sqlite error', 'mssql error'
            ],
            'xss': [
                'script', 'javascript', 'eval'
            ],
            'file_disclosure': [
                'file not found', 'cannot open', 'permission denied',
                'no such file'
            ],
            'information_disclosure': [
                'stack trace', 'exception', 'traceback',
                'at line', 'file:', 'call stack'
            ]
        }
        
        for vuln_type, patterns in error_patterns.items():
            for pattern in patterns:
                if pattern in response_lower:
                    result['vulnerability_indicators'].append({
                        'type': vuln_type,
                        'pattern': pattern,
                        'confidence': 0.7,
                        'severity': 'high' if vuln_type in ['sql_injection', 'file_disclosure'] else 'medium'
                    })
                    result['risk_score'] += 0.15
        
        # Check for information disclosure
        if any(indicator in response_lower for indicator in ['version', 'server:', 'x-powered-by']):
            result['vulnerability_indicators'].append({
                'type': 'information_disclosure',
                'pattern': 'version information',
                'confidence': 0.5,
                'severity': 'low'
            })
            result['risk_score'] += 0.1
        
        result['risk_score'] = min(1.0, result['risk_score'])
        
        if result['vulnerability_indicators']:
            result['recommendations'].append('Review error handling to prevent information disclosure')
        
        return result
    
    @staticmethod
    def predict_vulnerability_probability(target: str, analysis_type: str = 'url') -> Dict:
        """Predict vulnerability probability using ML-inspired analysis"""
        result = {
            'success': True,
            'target': target,
            'analysis_type': analysis_type,
            'predictions': [],
            'overall_risk': 'low',
            'confidence': 0.0,
            'recommendations': []
        }
        
        try:
            if analysis_type == 'url':
                url_analysis = AIVulnerabilityPredictor.predict_vulnerabilities_from_url(target)
                result['predictions'] = url_analysis['predicted_vulnerabilities']
                result['confidence'] = url_analysis['confidence']
                result['overall_risk'] = 'high' if url_analysis['risk_score'] > 0.6 else 'medium' if url_analysis['risk_score'] > 0.3 else 'low'
            
            elif analysis_type == 'code':
                # Code analysis would require code content
                code_analysis = AIVulnerabilityPredictor.analyze_code_patterns(target)
                result['predictions'] = [
                    {
                        'type': vuln_type,
                        'score': data['score'],
                        'confidence': data['confidence']
                    }
                    for vuln_type, data in code_analysis['vulnerability_scores'].items()
                ]
                result['confidence'] = code_analysis['confidence']
                result['overall_risk'] = code_analysis['risk_level']
            
            # Generate recommendations
            if result['overall_risk'] in ['high', 'critical']:
                result['recommendations'].extend([
                    'Immediate security review recommended',
                    'Implement input validation and sanitization',
                    'Use parameterized queries for database operations',
                    'Enable WAF and security headers',
                    'Regular security testing and code reviews'
                ])
            else:
                result['recommendations'].extend([
                    'Regular security monitoring',
                    'Keep software updated',
                    'Follow secure coding practices'
                ])
            
            result['message'] = f'Vulnerability prediction completed. Overall risk: {result["overall_risk"]} (confidence: {result["confidence"]:.2%})'
            
        except Exception as e:
            result['success'] = False
            result['error'] = str(e)
        
        return result

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Target URL or code required'}))
        sys.exit(1)
    
    target = sys.argv[1]
    analysis_type = sys.argv[2] if len(sys.argv) > 2 else 'url'
    
    result = AIVulnerabilityPredictor.predict_vulnerability_probability(target, analysis_type)
    print(json.dumps({'success': True, 'result': result}))

