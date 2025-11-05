#!/usr/bin/env python3
"""
Advanced Hash Generator
Generates various hash types (MD5, SHA256, bcrypt, etc.)
"""

import sys
import json
import hashlib
import bcrypt

def generate_hashes(input_text: str, hash_type: str = 'md5') -> dict:
    """Generate hashes for the input text"""
    hashes = {}
    
    if hash_type == 'all' or hash_type == 'md5':
        hashes['MD5'] = hashlib.md5(input_text.encode()).hexdigest()
    
    if hash_type == 'all' or hash_type == 'sha1':
        hashes['SHA1'] = hashlib.sha1(input_text.encode()).hexdigest()
    
    if hash_type == 'all' or hash_type == 'sha256':
        hashes['SHA256'] = hashlib.sha256(input_text.encode()).hexdigest()
    
    if hash_type == 'all' or hash_type == 'sha512':
        hashes['SHA512'] = hashlib.sha512(input_text.encode()).hexdigest()
    
    if hash_type == 'all' or hash_type == 'bcrypt':
        # bcrypt requires salt
        salt = bcrypt.gensalt()
        hashes['bcrypt'] = bcrypt.hashpw(input_text.encode(), salt).decode()
    
    return hashes

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Input text required'}))
        sys.exit(1)
    
    input_text = sys.argv[1]
    hash_type = sys.argv[2] if len(sys.argv) > 2 else 'md5'
    
    try:
        hashes = generate_hashes(input_text, hash_type)
        print(json.dumps({'success': True, 'hashes': hashes}))
    except Exception as e:
        print(json.dumps({'error': str(e)}))

