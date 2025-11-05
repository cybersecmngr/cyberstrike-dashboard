#!/usr/bin/env python3
"""
Encoder/Decoder Tool
Multi-format encoding and decoding (Base64, URL, Hex, HTML)
"""

import sys
import json
import base64
import urllib.parse
import html

def encode_decode(input_text: str, format_type: str, mode: str) -> str:
    """Encode or decode text"""
    try:
        if mode == 'encode':
            if format_type == 'base64':
                return base64.b64encode(input_text.encode('utf-8')).decode('utf-8')
            elif format_type == 'url':
                return urllib.parse.quote(input_text, safe='')
            elif format_type == 'hex':
                return input_text.encode('utf-8').hex()
            elif format_type == 'html':
                return html.escape(input_text)
            else:
                return 'Unknown format'
        else:  # decode
            if format_type == 'base64':
                try:
                    return base64.b64decode(input_text).decode('utf-8')
                except:
                    return 'Invalid Base64'
            elif format_type == 'url':
                try:
                    return urllib.parse.unquote(input_text)
                except:
                    return 'Invalid URL encoding'
            elif format_type == 'hex':
                try:
                    # Remove non-hex characters
                    hex_clean = ''.join(c for c in input_text if c in '0123456789abcdefABCDEF')
                    return bytes.fromhex(hex_clean).decode('utf-8')
                except:
                    return 'Invalid Hex'
            elif format_type == 'html':
                return html.unescape(input_text)
            else:
                return 'Unknown format'
    except Exception as e:
        return f'Error: {str(e)}'

if __name__ == '__main__':
    if len(sys.argv) < 4:
        print(json.dumps({'error': 'Usage: encoder_decoder.py <input> <format> <mode>'}))
        sys.exit(1)
    
    input_text = sys.argv[1]
    format_type = sys.argv[2]
    mode = sys.argv[3]
    
    result = encode_decode(input_text, format_type, mode)
    print(json.dumps({'success': True, 'output': result}))

