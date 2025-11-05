#!/usr/bin/env python3
"""
Advanced Password Generator & Strength Analyzer
Generates secure passwords and analyzes password strength
"""

import sys
import json
import secrets
import string
import re
from typing import Dict, List

def generate_password(
    length: int = 16,
    include_uppercase: bool = True,
    include_lowercase: bool = True,
    include_numbers: bool = True,
    include_symbols: bool = True,
    exclude_similar: bool = False
) -> str:
    """Generate a secure random password"""
    chars = ''
    
    if include_uppercase:
        chars += string.ascii_uppercase
    if include_lowercase:
        chars += string.ascii_lowercase
    if include_numbers:
        chars += string.digits
    if include_symbols:
        chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'
    
    if exclude_similar:
        chars = chars.replace('0', '').replace('O', '').replace('o', '')
        chars = chars.replace('1', '').replace('l', '').replace('I', '')
        chars = chars.replace('5', '').replace('S', '').replace('s', '')
    
    if not chars:
        chars = string.ascii_letters + string.digits
    
    password = ''.join(secrets.choice(chars) for _ in range(length))
    return password

def analyze_password_strength(password: str) -> Dict:
    """Analyze password strength and provide feedback"""
    score = 0
    feedback = []
    
    # Length check
    length = len(password)
    if length < 8:
        feedback.append('Password is too short (minimum 8 characters)')
    elif length < 12:
        score += 10
        feedback.append('Password length is acceptable')
    elif length < 16:
        score += 20
        feedback.append('Password length is good')
    else:
        score += 30
        feedback.append('Password length is excellent')
    
    # Character variety
    has_upper = bool(re.search(r'[A-Z]', password))
    has_lower = bool(re.search(r'[a-z]', password))
    has_digit = bool(re.search(r'\d', password))
    has_symbol = bool(re.search(r'[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]', password))
    
    char_types = sum([has_upper, has_lower, has_digit, has_symbol])
    
    if char_types == 1:
        score += 5
        feedback.append('Add more character types for better security')
    elif char_types == 2:
        score += 15
        feedback.append('Consider adding more character types')
    elif char_types == 3:
        score += 25
        feedback.append('Good character variety')
    else:
        score += 35
        feedback.append('Excellent character variety')
    
    # Common patterns
    if re.search(r'(.)\1{2,}', password):
        score -= 10
        feedback.append('Avoid repeating characters')
    
    if re.search(r'(012|123|234|345|456|567|678|789|890)', password):
        score -= 10
        feedback.append('Avoid sequential numbers')
    
    if re.search(r'(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)', password.lower()):
        score -= 10
        feedback.append('Avoid sequential letters')
    
    # Common passwords check
    common_passwords = ['password', '123456', 'qwerty', 'admin', 'letmein']
    if password.lower() in common_passwords:
        score -= 50
        feedback.append('This is a very common password - DO NOT USE')
    
    # Entropy calculation (simplified)
    unique_chars = len(set(password))
    if unique_chars < length * 0.5:
        score -= 5
        feedback.append('Low character diversity detected')
    
    # Determine strength
    score = max(0, min(100, score))
    
    if score < 30:
        strength = 'weak'
    elif score < 60:
        strength = 'medium'
    elif score < 80:
        strength = 'strong'
    else:
        strength = 'very-strong'
    
    return {
        'score': score,
        'strength': strength,
        'feedback': feedback
    }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Action required (generate or analyze)'}))
        sys.exit(1)
    
    action = sys.argv[1]
    
    if action == 'generate':
        import argparse
        parser = argparse.ArgumentParser()
        parser.add_argument('--length', type=int, default=16)
        parser.add_argument('--include-uppercase', action='store_true', default=True)
        parser.add_argument('--include-lowercase', action='store_true', default=True)
        parser.add_argument('--include-numbers', action='store_true', default=True)
        parser.add_argument('--include-symbols', action='store_true', default=True)
        parser.add_argument('--exclude-similar', action='store_true', default=False)
        
        args = parser.parse_args(sys.argv[2:])
        
        password = generate_password(
            length=args.length,
            include_uppercase=args.include_uppercase,
            include_lowercase=args.include_lowercase,
            include_numbers=args.include_numbers,
            include_symbols=args.include_symbols,
            exclude_similar=args.exclude_similar
        )
        
        strength = analyze_password_strength(password)
        
        print(json.dumps({
            'password': password,
            'strength': strength
        }))
    
    elif action == 'analyze':
        if len(sys.argv) < 3:
            print(json.dumps({'error': 'Password required'}))
            sys.exit(1)
        
        password = sys.argv[2]
        strength = analyze_password_strength(password)
        
        print(json.dumps({
            'success': True,
            'strength': strength
        }))

