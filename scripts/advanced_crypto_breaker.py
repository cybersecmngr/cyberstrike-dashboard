#!/usr/bin/env python3
"""
Advanced Cryptography Breaker & Hash Cracking Suite
Multi-algorithm hash cracking with advanced techniques
Rainbow tables, dictionary attacks, brute force, and hybrid methods
"""

import sys
import json
import hashlib
import itertools
import string
from typing import Dict, List, Optional
from datetime import datetime

class AdvancedCryptoBreaker:
    """Advanced cryptography breaker and hash cracking suite"""
    
    # Supported hash algorithms
    HASH_ALGORITHMS = {
        'md5': {'speed': 'fast', 'security': 'weak', 'crackable': True},
        'sha1': {'speed': 'fast', 'security': 'weak', 'crackable': True},
        'sha256': {'speed': 'medium', 'security': 'medium', 'crackable': True},
        'sha512': {'speed': 'slow', 'security': 'strong', 'crackable': True},
        'bcrypt': {'speed': 'very_slow', 'security': 'strong', 'crackable': True},
        'argon2': {'speed': 'very_slow', 'security': 'very_strong', 'crackable': False},
        'pbkdf2': {'speed': 'slow', 'security': 'strong', 'crackable': True}
    }
    
    # Common wordlists
    WORDLISTS = {
        'rockyou': {
            'size': '14M',
            'description': 'Most common passwords',
            'source': 'RockYou data breach'
        },
        'common_passwords': {
            'size': '1M',
            'description': 'Common passwords',
            'source': 'Various leaks'
        },
        'custom': {
            'size': 'variable',
            'description': 'Custom wordlist',
            'source': 'User-defined'
        }
    }
    
    # Common password patterns
    PASSWORD_PATTERNS = [
        'word123',
        'word!@#',
        'Word123',
        'word123!',
        'PASSWORD123',
        'password123',
        'qwerty123',
        '12345678',
        'admin123',
        'password1'
    ]
    
    @staticmethod
    def hash_password(password: str, algorithm: str = 'md5') -> str:
        """Hash password with specified algorithm"""
        algorithms = {
            'md5': hashlib.md5,
            'sha1': hashlib.sha1,
            'sha256': hashlib.sha256,
            'sha512': hashlib.sha512
        }
        
        hash_func = algorithms.get(algorithm, hashlib.md5)
        return hash_func(password.encode()).hexdigest()
    
    @staticmethod
    def dictionary_attack(hash_value: str, wordlist: List[str], algorithm: str = 'md5') -> Dict:
        """Perform dictionary attack"""
        result = {
            'method': 'dictionary_attack',
            'hash_value': hash_value,
            'algorithm': algorithm,
            'cracked': False,
            'password': None,
            'attempts': 0,
            'time_taken': 0
        }
        
        start_time = datetime.now()
        
        for word in wordlist:
            result['attempts'] += 1
            hashed = AdvancedCryptoBreaker.hash_password(word, algorithm)
            
            if hashed == hash_value:
                result['cracked'] = True
                result['password'] = word
                break
        
        end_time = datetime.now()
        result['time_taken'] = (end_time - start_time).total_seconds()
        
        return result
    
    @staticmethod
    def brute_force_attack(hash_value: str, max_length: int = 4, algorithm: str = 'md5', charset: str = string.ascii_lowercase + string.digits) -> Dict:
        """Perform brute force attack"""
        result = {
            'method': 'brute_force',
            'hash_value': hash_value,
            'algorithm': algorithm,
            'max_length': max_length,
            'cracked': False,
            'password': None,
            'attempts': 0,
            'time_taken': 0,
            'progress': 0.0
        }
        
        start_time = datetime.now()
        total_combinations = sum(len(charset) ** i for i in range(1, max_length + 1))
        current_attempt = 0
        
        for length in range(1, max_length + 1):
            for attempt in itertools.product(charset, repeat=length):
                current_attempt += 1
                result['attempts'] = current_attempt
                password = ''.join(attempt)
                hashed = AdvancedCryptoBreaker.hash_password(password, algorithm)
                
                result['progress'] = (current_attempt / total_combinations) * 100
                
                if hashed == hash_value:
                    result['cracked'] = True
                    result['password'] = password
                    break
            
            if result['cracked']:
                break
        
        end_time = datetime.now()
        result['time_taken'] = (end_time - start_time).total_seconds()
        
        return result
    
    @staticmethod
    def hybrid_attack(hash_value: str, base_words: List[str], algorithm: str = 'md5') -> Dict:
        """Perform hybrid attack (dictionary + mutations)"""
        result = {
            'method': 'hybrid_attack',
            'hash_value': hash_value,
            'algorithm': algorithm,
            'cracked': False,
            'password': None,
            'attempts': 0,
            'mutations_applied': []
        }
        
        mutations = [
            lambda x: x + '123',
            lambda x: x + '!',
            lambda x: x + '123!',
            lambda x: x.capitalize(),
            lambda x: x.upper(),
            lambda x: x + '1',
            lambda x: '1' + x,
            lambda x: x.replace('a', '@'),
            lambda x: x.replace('o', '0'),
            lambda x: x.replace('i', '1'),
        ]
        
        for word in base_words:
            # Try original word
            result['attempts'] += 1
            if AdvancedCryptoBreaker.hash_password(word, algorithm) == hash_value:
                result['cracked'] = True
                result['password'] = word
                break
            
            # Try mutations
            for mutation in mutations:
                mutated = mutation(word)
                result['attempts'] += 1
                result['mutations_applied'].append(mutated)
                
                if AdvancedCryptoBreaker.hash_password(mutated, algorithm) == hash_value:
                    result['cracked'] = True
                    result['password'] = mutated
                    break
            
            if result['cracked']:
                break
        
        return result
    
    @staticmethod
    def rainbow_table_attack(hash_value: str, algorithm: str = 'md5') -> Dict:
        """Simulate rainbow table attack"""
        result = {
            'method': 'rainbow_table',
            'hash_value': hash_value,
            'algorithm': algorithm,
            'cracked': False,
            'password': None,
            'table_size': '10GB',
            'lookup_time': 0.001
        }
        
        # Simulate rainbow table lookup
        # In real implementation, this would use pre-computed rainbow tables
        common_hashes = {
            '5f4dcc3b5aa765d61d8327deb882cf99': 'password',  # MD5
            'e10adc3949ba59abbe56e057f20f883e': '123456',  # MD5
            '25d55ad283aa400af464c76d713c07ad': '12345678',  # MD5
        }
        
        if hash_value in common_hashes:
            result['cracked'] = True
            result['password'] = common_hashes[hash_value]
        
        return result
    
    @staticmethod
    def identify_hash_algorithm(hash_value: str) -> Dict:
        """Identify hash algorithm by length"""
        length = len(hash_value)
        
        algorithms = {
            32: 'md5',
            40: 'sha1',
            64: 'sha256',
            128: 'sha512'
        }
        
        identified = algorithms.get(length, 'unknown')
        
        return {
            'hash_value': hash_value,
            'length': length,
            'identified_algorithm': identified,
            'confidence': 'high' if identified != 'unknown' else 'low'
        }
    
    @staticmethod
    def comprehensive_hash_cracking(hash_value: str, method: str = 'dictionary') -> Dict:
        """Comprehensive hash cracking suite"""
        result = {
            'success': True,
            'hash_value': hash_value,
            'method': method,
            'algorithm_identification': {},
            'cracking_attempt': {},
            'summary': {
                'cracked': False,
                'password': None,
                'time_taken': 0,
                'attempts': 0,
                'recommendations': []
            }
        }
        
        try:
            # Identify algorithm
            algorithm_id = AdvancedCryptoBreaker.identify_hash_algorithm(hash_value)
            result['algorithm_identification'] = algorithm_id
            algorithm = algorithm_id['identified_algorithm']
            
            # Perform cracking based on method
            if method == 'dictionary':
                wordlist = ['password', '123456', 'admin', 'root', 'test', 'user', 'pass', '1234', 'qwerty']
                cracking_result = AdvancedCryptoBreaker.dictionary_attack(hash_value, wordlist, algorithm)
                result['cracking_attempt'] = cracking_result
                
            elif method == 'brute_force':
                cracking_result = AdvancedCryptoBreaker.brute_force_attack(hash_value, max_length=4, algorithm=algorithm)
                result['cracking_attempt'] = cracking_result
                
            elif method == 'hybrid':
                base_words = ['password', 'admin', 'root', 'test']
                cracking_result = AdvancedCryptoBreaker.hybrid_attack(hash_value, base_words, algorithm)
                result['cracking_attempt'] = cracking_result
                
            elif method == 'rainbow_table':
                cracking_result = AdvancedCryptoBreaker.rainbow_table_attack(hash_value, algorithm)
                result['cracking_attempt'] = cracking_result
            
            # Summary
            result['summary']['cracked'] = result['cracking_attempt'].get('cracked', False)
            result['summary']['password'] = result['cracking_attempt'].get('password')
            result['summary']['time_taken'] = result['cracking_attempt'].get('time_taken', 0)
            result['summary']['attempts'] = result['cracking_attempt'].get('attempts', 0)
            
            result['summary']['recommendations'] = [
                'Use stronger hash algorithms (bcrypt, argon2)',
                'Implement salt for password hashing',
                'Use key derivation functions (PBKDF2, scrypt)',
                'Enforce strong password policies',
                'Implement rate limiting',
                'Use multi-factor authentication'
            ]
            
            if result['summary']['cracked']:
                result['message'] = f'Hash cracked successfully! Password: {result["summary"]["password"]}'
            else:
                result['message'] = f'Hash not cracked. Tried {result["summary"]["attempts"]} attempts.'
            
        except Exception as e:
            result['success'] = False
            result['error'] = str(e)
        
        return result

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Hash value required'}))
        sys.exit(1)
    
    hash_value = sys.argv[1]
    method = sys.argv[2] if len(sys.argv) > 2 else 'dictionary'
    
    result = AdvancedCryptoBreaker.comprehensive_hash_cracking(hash_value, method)
    print(json.dumps({'success': True, 'result': result}))

