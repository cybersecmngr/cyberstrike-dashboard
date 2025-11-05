#!/usr/bin/env python3
"""
Advanced Key Manager
SSH key generation, certificate management, and key analysis
"""

import sys
import json
import subprocess
import os
from pathlib import Path
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa, dsa, ec
from cryptography.hazmat.backends import default_backend

def generate_ssh_key(key_type: str = 'rsa', bits: int = 2048, comment: str = '') -> Dict:
    """Generate SSH key pair"""
    try:
        # Generate private key
        if key_type == 'rsa':
            private_key = rsa.generate_private_key(
                public_exponent=65537,
                key_size=bits,
                backend=default_backend()
            )
        elif key_type == 'dsa':
            private_key = dsa.generate_private_key(
                key_size=bits,
                backend=default_backend()
            )
        elif key_type == 'ecdsa':
            private_key = ec.generate_private_key(
                ec.SECP256R1(),
                backend=default_backend()
            )
        else:
            return {'error': 'Unsupported key type'}
        
        # Serialize private key
        private_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        
        # Get public key
        public_key = private_key.public_key()
        public_ssh = public_key.public_bytes(
            encoding=serialization.Encoding.OpenSSH,
            format=serialization.PublicFormat.OpenSSH
        )
        
        return {
            'success': True,
            'private_key': private_pem.decode('utf-8'),
            'public_key': public_ssh.decode('utf-8'),
            'key_type': key_type,
            'bits': bits
        }
    except Exception as e:
        return {'error': str(e)}

def analyze_key(key_path: str) -> Dict:
    """Analyze SSH key"""
    try:
        with open(key_path, 'r') as f:
            key_data = f.read()
        
        # Try to load key
        try:
            private_key = serialization.load_pem_private_key(
                key_data.encode('utf-8'),
                password=None,
                backend=default_backend()
            )
            
            key_info = {
                'type': 'private',
                'format': 'PEM',
                'valid': True
            }
            
            # Determine key type
            if isinstance(private_key, rsa.RSAPrivateKey):
                key_info['algorithm'] = 'RSA'
                key_info['size'] = private_key.key_size
            elif isinstance(private_key, dsa.DSAPrivateKey):
                key_info['algorithm'] = 'DSA'
                key_info['size'] = private_key.key_size
            elif isinstance(private_key, ec.EllipticCurvePrivateKey):
                key_info['algorithm'] = 'ECDSA'
                key_info['curve'] = private_key.curve.name
            
            return {'success': True, 'key_info': key_info}
        except:
            # Try public key
            try:
                public_key = serialization.load_ssh_public_key(
                    key_data.encode('utf-8'),
                    backend=default_backend()
                )
                return {
                    'success': True,
                    'key_info': {
                        'type': 'public',
                        'format': 'SSH',
                        'valid': True,
                        'algorithm': type(public_key).__name__
                    }
                }
            except:
                return {'error': 'Invalid key format'}
    except Exception as e:
        return {'error': str(e)}

def generate_certificate(common_name: str, days: int = 365) -> Dict:
    """Generate self-signed certificate"""
    try:
        # Use openssl if available
        cmd = [
            'openssl', 'req', '-new', '-x509', '-nodes',
            '-days', str(days),
            '-keyout', '/tmp/key.pem',
            '-out', '/tmp/cert.pem',
            '-subj', f'/CN={common_name}'
        ]
        
        process = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        
        if process.returncode == 0:
            with open('/tmp/key.pem', 'r') as f:
                key = f.read()
            with open('/tmp/cert.pem', 'r') as f:
                cert = f.read()
            
            # Clean up
            os.remove('/tmp/key.pem')
            os.remove('/tmp/cert.pem')
            
            return {
                'success': True,
                'private_key': key,
                'certificate': cert
            }
        else:
            return {'error': 'Failed to generate certificate'}
    except Exception as e:
        return {'error': str(e)}

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Action required (generate, analyze, certificate)'}))
        sys.exit(1)
    
    action = sys.argv[1]
    
    if action == 'generate':
        key_type = sys.argv[2] if len(sys.argv) > 2 else 'rsa'
        bits = int(sys.argv[3]) if len(sys.argv) > 3 else 2048
        
        result = generate_ssh_key(key_type, bits)
        print(json.dumps(result))
    
    elif action == 'analyze':
        if len(sys.argv) < 3:
            print(json.dumps({'error': 'Key path required'}))
            sys.exit(1)
        
        key_path = sys.argv[2]
        result = analyze_key(key_path)
        print(json.dumps(result))
    
    elif action == 'certificate':
        if len(sys.argv) < 3:
            print(json.dumps({'error': 'Common name required'}))
            sys.exit(1)
        
        common_name = sys.argv[2]
        days = int(sys.argv[3]) if len(sys.argv) > 3 else 365
        
        result = generate_certificate(common_name, days)
        print(json.dumps(result))

