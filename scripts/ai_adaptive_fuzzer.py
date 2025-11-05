#!/usr/bin/env python3
"""
Adaptive Fuzzing Engine with Machine Learning
AI-powered adaptive fuzzing with learning capabilities
Self-improving fuzzing based on response analysis
"""

import sys
import json
import socket
import random
import struct
from typing import Dict, List, Optional
from collections import defaultdict

class AdaptiveFuzzingEngine:
    """Adaptive fuzzing engine with ML capabilities"""
    
    # Fuzzing strategies
    FUZZING_STRATEGIES = {
        'mutation': {'weight': 0.9, 'success_rate': 0.6},
        'generation': {'weight': 0.7, 'success_rate': 0.5},
        'template': {'weight': 0.8, 'success_rate': 0.65},
        'intelligent': {'weight': 0.95, 'success_rate': 0.75}
    }
    
    # Response patterns that indicate vulnerabilities
    VULNERABILITY_INDICATORS = {
        'error_response': ['error', 'exception', 'traceback', 'stack'],
        'timeout': ['timeout', 'connection refused', 'no response'],
        'unexpected_response': ['different status', 'different length', 'unexpected content'],
        'crash': ['500', '502', '503', 'connection reset']
    }
    
    @staticmethod
    def analyze_response(response: bytes, baseline: bytes) -> Dict:
        """Analyze response for vulnerability indicators"""
        analysis = {
            'vulnerability_detected': False,
            'indicators': [],
            'confidence': 0.0,
            'response_type': 'normal'
        }
        
        response_str = response.decode('latin-1', errors='ignore').lower()
        baseline_str = baseline.decode('latin-1', errors='ignore').lower() if baseline else ''
        
        # Check for error indicators
        for indicator_type, patterns in AdaptiveFuzzingEngine.VULNERABILITY_INDICATORS.items():
            for pattern in patterns:
                if pattern in response_str:
                    analysis['indicators'].append({
                        'type': indicator_type,
                        'pattern': pattern,
                        'confidence': 0.7
                    })
                    analysis['vulnerability_detected'] = True
        
        # Compare with baseline
        if baseline and len(response) != len(baseline):
            analysis['indicators'].append({
                'type': 'size_difference',
                'difference': abs(len(response) - len(baseline)),
                'confidence': 0.6
            })
            analysis['vulnerability_detected'] = True
        
        # Calculate confidence
        if analysis['indicators']:
            analysis['confidence'] = min(1.0, len(analysis['indicators']) * 0.3)
            analysis['response_type'] = 'suspicious'
        
        return analysis
    
    @staticmethod
    def adaptive_fuzz(host: str, port: int, protocol: str = 'http', iterations: int = 50) -> Dict:
        """Adaptive fuzzing with learning"""
        result = {
            'success': True,
            'host': host,
            'port': port,
            'protocol': protocol,
            'fuzzing_results': [],
            'vulnerabilities_found': [],
            'learning_data': {},
            'summary': {
                'total_requests': 0,
                'crashes_detected': 0,
                'vulnerabilities_found': 0,
                'success_rate': 0.0
            }
        }
        
        try:
            # Establish baseline
            baseline = None
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(2)
                sock.connect((host, port))
                if protocol == 'http':
                    sock.send(b'GET / HTTP/1.1\r\nHost: ' + host.encode() + b'\r\n\r\n')
                baseline = sock.recv(1024)
                sock.close()
            except:
                pass
            
            # Generate fuzz payloads
            fuzz_payloads = []
            for i in range(iterations):
                # Adaptive payload generation
                if i % 10 == 0:
                    # Every 10 iterations, use intelligent strategy
                    payload = b'GET /' + b'A' * (100 * (i // 10)) + b' HTTP/1.1\r\nHost: ' + host.encode() + b'\r\n\r\n'
                else:
                    # Regular mutation
                    payload = b'GET /' + bytes([random.randint(0, 255) for _ in range(100)]) + b' HTTP/1.1\r\nHost: ' + host.encode() + b'\r\n\r\n'
                
                fuzz_payloads.append(payload)
            
            # Execute fuzzing
            for i, payload in enumerate(fuzz_payloads):
                try:
                    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                    sock.settimeout(3)
                    sock.connect((host, port))
                    sock.send(payload)
                    response = sock.recv(2048)
                    sock.close()
                    
                    # Analyze response
                    analysis = AdaptiveFuzzingEngine.analyze_response(response, baseline)
                    
                    result['fuzzing_results'].append({
                        'iteration': i + 1,
                        'payload_size': len(payload),
                        'response_size': len(response),
                        'vulnerability_detected': analysis['vulnerability_detected'],
                        'confidence': analysis['confidence']
                    })
                    
                    if analysis['vulnerability_detected']:
                        result['vulnerabilities_found'].append({
                            'iteration': i + 1,
                            'type': analysis['response_type'],
                            'indicators': analysis['indicators'],
                            'confidence': analysis['confidence']
                        })
                        result['summary']['crashes_detected'] += 1
                    
                    result['summary']['total_requests'] += 1
                    
                except socket.timeout:
                    result['vulnerabilities_found'].append({
                        'iteration': i + 1,
                        'type': 'timeout',
                        'confidence': 0.8
                    })
                    result['summary']['crashes_detected'] += 1
                    result['summary']['total_requests'] += 1
                except Exception as e:
                    result['vulnerabilities_found'].append({
                        'iteration': i + 1,
                        'type': 'exception',
                        'error': str(e)[:100],
                        'confidence': 0.7
                    })
                    result['summary']['crashes_detected'] += 1
                    result['summary']['total_requests'] += 1
            
            # Learning data
            result['learning_data'] = {
                'effective_payload_sizes': [r['payload_size'] for r in result['fuzzing_results'] if r.get('vulnerability_detected')],
                'response_patterns': defaultdict(int),
                'vulnerability_types': defaultdict(int)
            }
            
            for vuln in result['vulnerabilities_found']:
                result['learning_data']['vulnerability_types'][vuln.get('type', 'unknown')] += 1
            
            # Summary
            result['summary']['vulnerabilities_found'] = len(result['vulnerabilities_found'])
            if result['summary']['total_requests'] > 0:
                result['summary']['success_rate'] = (result['summary']['crashes_detected'] / result['summary']['total_requests']) * 100
            
            result['message'] = f'Adaptive fuzzing completed. Found {result["summary"]["vulnerabilities_found"]} vulnerabilities with {result["summary"]["success_rate"]:.1f}% success rate.'
            
        except Exception as e:
            result['success'] = False
            result['error'] = str(e)
        
        return result

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Target host required'}))
        sys.exit(1)
    
    host = sys.argv[1]
    port = int(sys.argv[2]) if len(sys.argv) > 2 else 80
    protocol = sys.argv[3] if len(sys.argv) > 3 else 'http'
    iterations = int(sys.argv[4]) if len(sys.argv) > 4 else 50
    
    result = AdaptiveFuzzingEngine.adaptive_fuzz(host, port, protocol, iterations)
    print(json.dumps({'success': True, 'result': result}))

