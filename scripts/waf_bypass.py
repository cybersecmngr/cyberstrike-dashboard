#!/usr/bin/env python3
"""
WAF (Web Application Firewall) Bypass Tool
WAF detection, bypass techniques, payload obfuscation
"""

import sys
import json
import re
import urllib.parse
import base64
from typing import Dict, List, Optional

class WAFBypass:
    """WAF bypass techniques and payload obfuscation"""
    
    @staticmethod
    def detect_waf(target_url: str) -> Dict:
        """Attempt to detect WAF by analyzing response headers"""
        result = {
            'wafDetected': False,
            'wafType': None,
            'indicators': [],
            'confidence': 'low'
        }
        
        try:
            import requests
            from requests.exceptions import RequestException, Timeout
            
            # Common WAF headers
            waf_headers = {
                'Cloudflare': ['cf-ray', 'cf-request-id', 'server'],
                'AWS WAF': ['x-amzn-requestid', 'x-amz-id-2'],
                'Akamai': ['akamai-request-id', 'x-akamai-transformed'],
                'Imperva': ['x-iinfo', 'x-cdn'],
                'Incapsula': ['x-iinfo', 'x-cdn'],
                'Sucuri': ['x-sucuri-id', 'x-sucuri-cache'],
                'Barracuda': ['x-barracuda-'],
                'F5': ['x-f5-'],
                'ModSecurity': ['x-modsec'],
            }
            
            try:
                response = requests.get(
                    target_url,
                    timeout=10,
                    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'},
                    allow_redirects=True
                )
                
                headers_lower = {k.lower(): v for k, v in response.headers.items()}
                
                for waf_name, header_patterns in waf_headers.items():
                    for pattern in header_patterns:
                        pattern_lower = pattern.lower()
                        if any(pattern_lower in key for key in headers_lower.keys()):
                            result['wafDetected'] = True
                            result['wafType'] = waf_name
                            result['indicators'].append(f'Found {waf_name} header: {pattern}')
                            result['confidence'] = 'high'
                            break
                    
                    if result['wafDetected']:
                        break
                
                # Check for common WAF response patterns
                if 'cloudflare' in response.text.lower():
                    result['wafDetected'] = True
                    result['wafType'] = 'Cloudflare'
                    result['indicators'].append('Cloudflare challenge page detected')
                
                if 'access denied' in response.text.lower() or 'blocked' in response.text.lower():
                    result['indicators'].append('Possible blocking response')
                    if not result['wafDetected']:
                        result['confidence'] = 'medium'
                
            except RequestException as e:
                result['indicators'].append(f'Request failed: {str(e)}')
                result['confidence'] = 'low'
                
        except ImportError:
            result['indicators'].append('requests library not available - install with: pip3 install requests')
        except Exception as e:
            result['indicators'].append(f'Detection error: {str(e)}')
        
        return result
    
    @staticmethod
    def obfuscate_payload(payload: str) -> Dict:
        """Generate multiple obfuscated versions of a payload"""
        obfuscations = []
        
        # Original payload
        obfuscations.append({
            'method': 'Original',
            'payload': payload,
            'description': 'Unmodified payload'
        })
        
        # Case variation
        case_variations = []
        words = re.findall(r'\b\w+\b', payload)
        for word in words[:5]:  # Limit to first 5 words
            if word.upper() in ['SELECT', 'FROM', 'WHERE', 'UNION', 'INSERT', 'UPDATE', 'DELETE']:
                case_variations.append(word.upper())
            elif word.lower() in ['select', 'from', 'where', 'union']:
                case_variations.append(word.lower())
        
        if case_variations:
            case_payload = payload
            for word in case_variations:
                case_payload = re.sub(r'\b' + re.escape(word) + r'\b', 
                                     lambda m: m.group().swapcase(), 
                                     case_payload, flags=re.IGNORECASE)
            obfuscations.append({
                'method': 'Case Variation',
                'payload': case_payload,
                'description': 'Mixed case SQL keywords'
            })
        
        # URL encoding
        try:
            url_encoded = urllib.parse.quote(payload, safe='')
            obfuscations.append({
                'method': 'URL Encoding',
                'payload': url_encoded,
                'description': 'Full URL encoding'
            })
        except:
            pass
        
        # Double URL encoding
        try:
            double_encoded = urllib.parse.quote(urllib.parse.quote(payload, safe=''), safe='')
            obfuscations.append({
                'method': 'Double URL Encoding',
                'payload': double_encoded,
                'description': 'URL encoded twice'
            })
        except:
            pass
        
        # Base64 encoding
        try:
            base64_encoded = base64.b64encode(payload.encode()).decode()
            obfuscations.append({
                'method': 'Base64 Encoding',
                'payload': base64_encoded,
                'description': 'Base64 encoded payload'
            })
        except:
            pass
        
        # Whitespace manipulation
        whitespace_payload = payload.replace(' ', '/**/')
        obfuscations.append({
            'method': 'SQL Comment Whitespace',
            'payload': whitespace_payload,
            'description': 'Spaces replaced with SQL comments /**/'
        })
        
        # Comment insertion
        comment_payload = payload.replace(' ', '/*comment*/')
        obfuscations.append({
            'method': 'Comment Insertion',
            'payload': comment_payload,
            'description': 'Comments inserted between keywords'
        })
        
        # Unicode encoding
        try:
            unicode_payload = ''.join([f'\\u{ord(c):04x}' if ord(c) > 127 else c for c in payload[:100]])
            if unicode_payload != payload[:100]:
                obfuscations.append({
                    'method': 'Unicode Encoding',
                    'payload': unicode_payload,
                    'description': 'Unicode escape sequences'
                })
        except:
            pass
        
        # Hexadecimal encoding
        hex_payload = ''.join([f'0x{ord(c):02x}' if c.isalnum() else c for c in payload[:50]])
        obfuscations.append({
            'method': 'Hexadecimal Encoding',
            'payload': hex_payload,
            'description': 'Partial hex encoding'
        })
        
        # Function name obfuscation (SQL)
        sql_obfuscated = payload
        sql_replacements = {
            'SELECT': 'SeLeCt',
            'FROM': 'FrOm',
            'WHERE': 'WhErE',
            'UNION': 'UnIoN',
            'OR': 'Or',
            'AND': 'AnD',
        }
        
        for original, replacement in sql_replacements.items():
            sql_obfuscated = re.sub(r'\b' + original + r'\b', replacement, sql_obfuscated, flags=re.IGNORECASE)
        
        if sql_obfuscated != payload:
            obfuscations.append({
                'method': 'SQL Function Obfuscation',
                'payload': sql_obfuscated,
                'description': 'Mixed case SQL functions'
            })
        
        # Character encoding variations
        char_variations = []
        
        # Single quote variations
        if "'" in payload:
            char_variations.append(payload.replace("'", "''"))  # Double quote
            char_variations.append(payload.replace("'", "\\'"))  # Escaped quote
            char_variations.append(payload.replace("'", "%27"))  # URL encoded quote
        
        if char_variations:
            obfuscations.append({
                'method': 'Quote Encoding',
                'payload': char_variations[0],
                'description': 'Single quote variations'
            })
        
        return {
            'obfuscations': obfuscations,
            'total': len(obfuscations)
        }
    
    @staticmethod
    def generate_bypass_methods() -> List[str]:
        """Generate list of common WAF bypass methods"""
        return [
            'URL encoding',
            'Double URL encoding',
            'Unicode encoding',
            'Case variation (SeLeCt vs SELECT)',
            'Whitespace manipulation (/**/ comments)',
            'Comment insertion (/*comment*/)',
            'Function name obfuscation',
            'Character encoding variations',
            'Base64 encoding',
            'Hexadecimal encoding',
            'SQL comment injection',
            'Time-based delays',
            'Boolean-based blind',
            'Error-based injection',
            'Union-based injection',
            'Second-order injection',
            'Parameter pollution',
            'HTTP method switching (GET/POST)',
            'Header manipulation',
            'Cookie-based injection'
        ]
    
    @staticmethod
    def test_bypass(target_url: str, payload: str) -> Dict:
        """Test payload against target URL"""
        result = {
            'success': True,
            'targetUrl': target_url,
            'originalPayload': payload,
            'wafDetection': None,
            'obfuscatedPayloads': None,
            'bypassMethods': None,
            'testResults': []
        }
        
        # Detect WAF
        waf_result = WAFBypass.detect_waf(target_url)
        result['wafDetection'] = waf_result
        
        # Generate obfuscated payloads
        obfuscation_result = WAFBypass.obfuscate_payload(payload)
        result['obfuscatedPayloads'] = obfuscation_result
        
        # Get bypass methods
        result['bypassMethods'] = WAFBypass.generate_bypass_methods()
        
        # Test obfuscated payloads (if requests available)
        try:
            import requests
            from requests.exceptions import RequestException, Timeout
            
            # Test first 3 obfuscated payloads
            for obf in obfuscation_result['obfuscations'][:3]:
                try:
                    test_response = requests.post(
                        target_url,
                        data={'payload': obf['payload']},
                        timeout=5,
                        headers={'User-Agent': 'Mozilla/5.0'},
                        allow_redirects=False
                    )
                    
                    result['testResults'].append({
                        'method': obf['method'],
                        'statusCode': test_response.status_code,
                        'blocked': test_response.status_code in [403, 406, 429],
                        'success': test_response.status_code == 200
                    })
                except (RequestException, Timeout):
                    result['testResults'].append({
                        'method': obf['method'],
                        'statusCode': None,
                        'blocked': None,
                        'success': False,
                        'error': 'Request timeout or failed'
                    })
        except ImportError:
            result['testResults'] = []
        
        result['message'] = f'WAF bypass analysis completed for {target_url}'
        result['note'] = 'This is for educational/defensive purposes only. Use responsibly.'
        
        return result

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print(json.dumps({'error': 'Target URL and payload required'}))
        sys.exit(1)
    
    target_url = sys.argv[1]
    payload = sys.argv[2]
    
    result = WAFBypass.test_bypass(target_url, payload)
    print(json.dumps({'success': True, 'result': result}))

