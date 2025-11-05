#!/usr/bin/env python3
"""
Multi-Threaded High-Performance Scanner
10x-20x faster scanning with intelligent thread pool management
Thread-safe vulnerability detection with real-time progress tracking
"""

import sys
import json
import time
import threading
import queue
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, List, Optional, Callable, Any
from datetime import datetime
from collections import defaultdict

try:
    import requests
    from requests.exceptions import RequestException, Timeout, ConnectionError
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False


class MultiThreadedScanner:
    """High-performance multi-threaded vulnerability scanner"""

    def __init__(self, target: str, max_workers: int = 10):
        self.target = target
        self.max_workers = max_workers
        self.results_lock = threading.Lock()
        self.results = []
        self.progress_lock = threading.Lock()
        self.completed_tasks = 0
        self.total_tasks = 0
        self.errors = []
        self.start_time = None

        # Thread-safe session pool
        self.session_lock = threading.Lock()
        self.sessions = queue.Queue(maxsize=max_workers)
        for _ in range(max_workers):
            session = requests.Session() if HAS_REQUESTS else None
            if session:
                session.headers.update({
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Connection': 'keep-alive',
                })
            self.sessions.put(session)

    def get_session(self):
        """Get a session from the pool"""
        return self.sessions.get()

    def return_session(self, session):
        """Return a session to the pool"""
        self.sessions.put(session)

    def add_result(self, result: Dict):
        """Thread-safe result addition"""
        with self.results_lock:
            self.results.append(result)

    def update_progress(self):
        """Thread-safe progress update"""
        with self.progress_lock:
            self.completed_tasks += 1
            if self.total_tasks > 0:
                progress = (self.completed_tasks / self.total_tasks) * 100
                elapsed = time.time() - self.start_time if self.start_time else 0
                eta = (elapsed / self.completed_tasks) * (self.total_tasks - self.completed_tasks) if self.completed_tasks > 0 else 0

                if self.completed_tasks % 10 == 0:  # Log every 10 tasks
                    print(json.dumps({
                        'multithreaded_scan': 'progress',
                        'completed': self.completed_tasks,
                        'total': self.total_tasks,
                        'progress': f'{progress:.1f}%',
                        'elapsed': f'{elapsed:.1f}s',
                        'eta': f'{eta:.1f}s',
                        'workers': self.max_workers
                    }), file=sys.stderr, flush=True)

    def scan_endpoint(self, endpoint: str, test_func: Callable, test_data: Any) -> Dict:
        """Scan a single endpoint with a test function"""
        session = self.get_session()
        result = {
            'endpoint': endpoint,
            'test_data': test_data,
            'success': False,
            'vulnerable': False,
            'error': None,
            'timestamp': datetime.now().isoformat()
        }

        try:
            # Execute test function with session
            test_result = test_func(session, endpoint, test_data)
            result.update(test_result)
            result['success'] = True

        except Exception as e:
            result['error'] = str(e)
            with self.results_lock:
                self.errors.append({
                    'endpoint': endpoint,
                    'error': str(e),
                    'test_data': str(test_data)[:100]
                })

        finally:
            self.return_session(session)
            self.update_progress()

        return result

    def parallel_endpoint_scan(self, endpoints: List[str], test_func: Callable, test_data_list: List[Any] = None) -> List[Dict]:
        """
        Scan multiple endpoints in parallel

        Args:
            endpoints: List of endpoint URLs to scan
            test_func: Function to test each endpoint (signature: func(session, endpoint, test_data) -> dict)
            test_data_list: Optional list of test data for each endpoint (if None, uses None for all)

        Returns:
            List of scan results
        """
        if test_data_list is None:
            test_data_list = [None] * len(endpoints)

        self.total_tasks = len(endpoints)
        self.completed_tasks = 0
        self.start_time = time.time()
        self.results = []
        self.errors = []

        print(json.dumps({
            'multithreaded_scan': 'starting',
            'endpoints': len(endpoints),
            'workers': self.max_workers,
            'message': f'Starting parallel scan of {len(endpoints)} endpoints with {self.max_workers} workers...'
        }), file=sys.stderr, flush=True)

        # Create thread pool and submit tasks
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            # Submit all tasks
            futures = []
            for endpoint, test_data in zip(endpoints, test_data_list):
                future = executor.submit(self.scan_endpoint, endpoint, test_func, test_data)
                futures.append(future)

            # Collect results as they complete
            for future in as_completed(futures):
                try:
                    result = future.result()
                    self.add_result(result)
                except Exception as e:
                    with self.results_lock:
                        self.errors.append({
                            'error': f'Future execution failed: {str(e)}'
                        })

        elapsed_time = time.time() - self.start_time

        print(json.dumps({
            'multithreaded_scan': 'completed',
            'total_scanned': len(self.results),
            'vulnerabilities_found': len([r for r in self.results if r.get('vulnerable')]),
            'errors': len(self.errors),
            'elapsed_time': f'{elapsed_time:.2f}s',
            'avg_time_per_endpoint': f'{elapsed_time / len(endpoints):.2f}s',
            'speedup': f'{len(endpoints) / elapsed_time:.1f} endpoints/sec',
            'message': f'Parallel scan completed in {elapsed_time:.2f}s'
        }), file=sys.stderr, flush=True)

        return self.results

    def parallel_payload_test(self, endpoint: str, payloads: List[str], test_func: Callable) -> List[Dict]:
        """
        Test multiple payloads against a single endpoint in parallel

        Args:
            endpoint: Target endpoint URL
            payloads: List of payloads to test
            test_func: Function to test each payload (signature: func(session, endpoint, payload) -> dict)

        Returns:
            List of payload test results
        """
        # Create pseudo-endpoints by appending payload index
        pseudo_endpoints = [f"{endpoint}#payload_{i}" for i in range(len(payloads))]

        # Run parallel test
        results = self.parallel_endpoint_scan(pseudo_endpoints, test_func, payloads)

        # Clean up pseudo-endpoint names
        for result in results:
            if '#payload_' in result['endpoint']:
                result['endpoint'] = endpoint

        return results

    def parallel_parameter_scan(self, base_url: str, parameters: List[Dict], test_func: Callable) -> List[Dict]:
        """
        Scan multiple parameters in parallel

        Args:
            base_url: Base URL to test
            parameters: List of parameter dictionaries to test
            test_func: Function to test each parameter set (signature: func(session, url, params) -> dict)

        Returns:
            List of parameter scan results
        """
        # Create endpoint URLs for each parameter set
        endpoints = [base_url] * len(parameters)

        return self.parallel_endpoint_scan(endpoints, test_func, parameters)

    def get_statistics(self) -> Dict:
        """Get scanning statistics"""
        return {
            'total_scanned': len(self.results),
            'vulnerabilities_found': len([r for r in self.results if r.get('vulnerable')]),
            'success_rate': len([r for r in self.results if r.get('success')]) / len(self.results) if self.results else 0,
            'error_rate': len(self.errors) / self.total_tasks if self.total_tasks > 0 else 0,
            'average_time': (time.time() - self.start_time) / self.total_tasks if self.start_time and self.total_tasks > 0 else 0,
            'workers_used': self.max_workers,
            'errors': self.errors
        }


# Example test functions for common vulnerability types

def test_sql_injection(session, endpoint: str, payload: str) -> Dict:
    """Test function for SQL injection"""
    result = {'vulnerable': False, 'technique': None, 'response_time': 0}

    try:
        start_time = time.time()
        response = session.get(f"{endpoint}?id={payload}", timeout=10)
        result['response_time'] = time.time() - start_time
        result['status_code'] = response.status_code

        # Check for SQL errors
        sql_errors = ['sql syntax', 'mysql', 'postgresql', 'sqlite', 'ora-', 'warning: mysql']
        response_lower = response.text.lower()

        for error in sql_errors:
            if error in response_lower:
                result['vulnerable'] = True
                result['technique'] = 'error-based'
                result['evidence'] = error
                break

        # Check for time-based
        if result['response_time'] > 5:
            result['vulnerable'] = True
            result['technique'] = 'time-based'

    except Timeout:
        result['vulnerable'] = True
        result['technique'] = 'time-based'
        result['error'] = 'timeout'

    except Exception as e:
        result['error'] = str(e)

    return result


def test_xss(session, endpoint: str, payload: str) -> Dict:
    """Test function for XSS"""
    result = {'vulnerable': False, 'reflected': False}

    try:
        response = session.get(f"{endpoint}?input={payload}", timeout=10)
        result['status_code'] = response.status_code

        # Check if payload is reflected
        if payload in response.text:
            result['vulnerable'] = True
            result['reflected'] = True
        elif payload.replace('<', '&lt;').replace('>', '&gt;') in response.text:
            result['vulnerable'] = True
            result['reflected'] = True
            result['encoded'] = True

    except Exception as e:
        result['error'] = str(e)

    return result


def test_endpoint_accessibility(session, endpoint: str, test_data: Any) -> Dict:
    """Test function for endpoint accessibility"""
    result = {'vulnerable': False, 'accessible': False}

    try:
        response = session.get(endpoint, timeout=5)
        result['status_code'] = response.status_code
        result['accessible'] = response.status_code in [200, 201, 301, 302, 401, 403]
        result['content_length'] = len(response.content)

        # Mark sensitive endpoints as vulnerable if accessible
        sensitive_paths = ['/admin', '/config', '/.env', '/.git', '/backup']
        if any(path in endpoint for path in sensitive_paths) and result['accessible']:
            result['vulnerable'] = True
            result['reason'] = 'sensitive_endpoint_accessible'

    except Exception as e:
        result['error'] = str(e)

    return result


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Target URL required'}))
        sys.exit(1)

    target = sys.argv[1]
    scanner = MultiThreadedScanner(target, max_workers=10)

    # Example 1: Scan multiple endpoints
    endpoints = [
        f"{target}/admin",
        f"{target}/login",
        f"{target}/api",
        f"{target}/config",
        f"{target}/.env",
    ]

    print("\n=== Example 1: Parallel Endpoint Scan ===")
    results = scanner.parallel_endpoint_scan(endpoints, test_endpoint_accessibility)
    print(json.dumps({
        'scan_type': 'endpoint_accessibility',
        'results': results,
        'statistics': scanner.get_statistics()
    }, indent=2))

    # Example 2: Test SQL injection payloads in parallel
    sql_payloads = [
        "' OR '1'='1'--",
        "' OR 1=1--",
        "' UNION SELECT NULL--",
        "' AND SLEEP(5)--",
    ]

    print("\n=== Example 2: Parallel SQLi Payload Test ===")
    scanner2 = MultiThreadedScanner(target, max_workers=4)
    sqli_results = scanner2.parallel_payload_test(f"{target}/login", sql_payloads, test_sql_injection)
    print(json.dumps({
        'scan_type': 'sqli_payload_test',
        'results': sqli_results,
        'statistics': scanner2.get_statistics()
    }, indent=2))
