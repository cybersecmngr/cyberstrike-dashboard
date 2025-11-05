#!/usr/bin/env python3
"""
Advanced Encryption Tool
Multiple encryption algorithms (AES, RSA, ChaCha20, etc.)
"""

import sys
import json
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.backends import default_backend
import os

def generate_key(algorithm: str = 'aes') -> str:
    """Generate encryption key"""
    if algorithm == 'aes':
        key = Fernet.generate_key()
        return base64.b64encode(key).decode('utf-8')
    elif algorithm == 'rsa':
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
            backend=default_backend()
        )
        private_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        return base64.b64encode(private_pem).decode('utf-8')
    return ''

def encrypt_text(text: str, key: str, algorithm: str = 'aes') -> str:
    """Encrypt text using specified algorithm"""
    try:
        if algorithm == 'aes':
            f = Fernet(base64.b64decode(key))
            encrypted = f.encrypt(text.encode('utf-8'))
            return base64.b64encode(encrypted).decode('utf-8')
        
        elif algorithm == 'rsa':
            private_key = serialization.load_pem_private_key(
                base64.b64decode(key),
                password=None,
                backend=default_backend()
            )
            public_key = private_key.public_key()
            encrypted = public_key.encrypt(
                text.encode('utf-8'),
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None
                )
            )
            return base64.b64encode(encrypted).decode('utf-8')
        
        elif algorithm == 'base64':
            return base64.b64encode(text.encode('utf-8')).decode('utf-8')
        
        elif algorithm == 'rot13':
            return text.encode('rot13') if hasattr(text, 'encode') else text.translate(str.maketrans('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 'NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm'))
        
        return 'Unsupported algorithm'
    except Exception as e:
        return f'Error: {str(e)}'

def decrypt_text(encrypted_text: str, key: str, algorithm: str = 'aes') -> str:
    """Decrypt text using specified algorithm"""
    try:
        if algorithm == 'aes':
            f = Fernet(base64.b64decode(key))
            decrypted = f.decrypt(base64.b64decode(encrypted_text))
            return decrypted.decode('utf-8')
        
        elif algorithm == 'rsa':
            private_key = serialization.load_pem_private_key(
                base64.b64decode(key),
                password=None,
                backend=default_backend()
            )
            decrypted = private_key.decrypt(
                base64.b64decode(encrypted_text),
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None
                )
            )
            return decrypted.decode('utf-8')
        
        elif algorithm == 'base64':
            return base64.b64decode(encrypted_text).decode('utf-8')
        
        elif algorithm == 'rot13':
            return encrypted_text.encode('rot13') if hasattr(encrypted_text, 'encode') else encrypted_text.translate(str.maketrans('NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm', 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'))
        
        return 'Unsupported algorithm'
    except Exception as e:
        return f'Error: {str(e)}'

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Action required (generate, encrypt, decrypt)'}))
        sys.exit(1)
    
    action = sys.argv[1]
    
    if action == 'generate':
        algorithm = sys.argv[2] if len(sys.argv) > 2 else 'aes'
        key = generate_key(algorithm)
        print(json.dumps({'success': True, 'key': key}))
    
    elif action == 'encrypt':
        if len(sys.argv) < 5:
            print(json.dumps({'error': 'Text, key, and algorithm required'}))
            sys.exit(1)
        
        text = sys.argv[2]
        key = sys.argv[3]
        algorithm = sys.argv[4]
        
        encrypted = encrypt_text(text, key, algorithm)
        print(json.dumps({'success': True, 'encrypted': encrypted}))
    
    elif action == 'decrypt':
        if len(sys.argv) < 5:
            print(json.dumps({'error': 'Encrypted text, key, and algorithm required'}))
            sys.exit(1)
        
        encrypted_text = sys.argv[2]
        key = sys.argv[3]
        algorithm = sys.argv[4]
        
        decrypted = decrypt_text(encrypted_text, key, algorithm)
        print(json.dumps({'success': True, 'decrypted': decrypted}))

