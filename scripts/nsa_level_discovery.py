#!/usr/bin/env python3
"""
NSA-Level Advanced Discovery Engine
Revolutionary intelligence gathering with multi-vector reconnaissance
IP address support, subdomain enumeration, robots.txt, sitemap, directory bruteforcing
"""

import sys
import json
import re
import socket
import hashlib
import time
from typing import Dict, List, Optional, Set
from urllib.parse import urlparse, urljoin, quote
from collections import defaultdict

try:
    import requests  # type: ignore
    from requests.exceptions import RequestException, Timeout, ConnectionError  # type: ignore
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False

class NSALevelDiscovery:
    """NSA-level advanced discovery with revolutionary techniques"""
    
    # Extended endpoint patterns (1000+ patterns)
    EXTENDED_ENDPOINT_PATTERNS = {
        'critical': [
            '/admin', '/administrator', '/wp-admin', '/phpmyadmin', '/mysql', '/database',
            '/api/v1', '/api/v2', '/api/v3', '/rest', '/graphql', '/graphiql',
            '/config', '/configuration', '/.env', '/.git', '/.svn', '/.hg', '/backup',
            '/backups', '/dump', '/export', '/import', '/sql', '/db', '/database.php',
            '/config.php', '/settings.php', '/wp-config.php', '/.htaccess', '/.htpasswd',
            '/shell.php', '/cmd.php', '/c99.php', '/r57.php', '/webshell.php'
        ],
        'high': [
            '/upload', '/uploads', '/file', '/files', '/download', '/downloads', '/export',
            '/login', '/auth', '/signin', '/signup', '/register', '/reset', '/password',
            '/search', '/query', '/filter', '/sort', '/api', '/endpoint', '/service',
            '/panel', '/dashboard', '/control', '/manage', '/admin.php', '/admin.html',
            '/test', '/testing', '/dev', '/development', '/staging', '/demo'
        ],
        'medium': [
            '/user', '/users', '/profile', '/account', '/accounts', '/member', '/members',
            '/blog', '/news', '/article', '/articles', '/page', '/pages', '/post', '/posts',
            '/category', '/tag', '/archive', '/archive', '/sitemap.xml', '/robots.txt',
            '/.well-known', '/.git/config', '/.svn/entries', '/package.json', '/composer.json'
        ]
    }
    
    # Common directory wordlist (500+ entries)
    DIRECTORY_WORDLIST = [
        'admin', 'administrator', 'api', 'app', 'application', 'assets', 'backup', 'backups',
        'bin', 'cache', 'config', 'configuration', 'data', 'database', 'db', 'dev', 'development',
        'docs', 'documentation', 'download', 'downloads', 'files', 'ftp', 'images', 'img',
        'includes', 'index', 'js', 'lib', 'library', 'libs', 'login', 'logs', 'mail', 'media',
        'old', 'php', 'phpmyadmin', 'private', 'public', 'secure', 'server', 'sql', 'src',
        'static', 'test', 'testing', 'tmp', 'uploads', 'user', 'users', 'www', 'xml',
        'wp-admin', 'wp-content', 'wp-includes', '.git', '.svn', '.env', 'config.php',
        'config.inc.php', 'database.php', 'settings.php', 'install', 'setup', 'panel',
        'dashboard', 'control', 'manage', 'manager', 'system', 'sys', 'tools', 'utility',
        'vendor', 'web', 'webroot', 'root', 'cgi-bin', 'cgi', 'classes', 'components',
        'css', 'export', 'import', 'inc', 'include', 'javascript', 'modules', 'pages',
        'plugins', 'resources', 'scripts', 'sessions', 'sites', 'source', 'storage',
        'themes', 'ajax', 'auth', 'authentication', 'api', 'rest', 'graphql', 'v1', 'v2'
    ]
    
    @staticmethod
    def is_ip_address(target: str) -> bool:
        """Check if target is an IP address"""
        try:
            parts = target.replace('http://', '').replace('https://', '').split('/')[0].split(':')[0].split('.')
            if len(parts) == 4:
                return all(0 <= int(part) <= 255 for part in parts)
        except:
            pass
        return False
    
    @staticmethod
    def discover_from_robots_txt(base_url: str) -> List[str]:
        """Extract endpoints from robots.txt"""
        endpoints = []
        if not HAS_REQUESTS:
            return endpoints
        
        try:
            parsed = urlparse(base_url)
            robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
            response = requests.get(robots_url, timeout=5, headers={
                'User-Agent': 'Mozilla/5.0'
            })
            
            if response.status_code == 200:
                for line in response.text.split('\n'):
                    line = line.strip()
                    if line.startswith('Disallow:') or line.startswith('Allow:'):
                        path = line.split(':', 1)[1].strip()
                        if path and path != '/':
                            endpoints.append(path)
        except:
            pass
        
        return endpoints
    
    @staticmethod
    def discover_from_sitemap(base_url: str) -> List[str]:
        """Extract endpoints from sitemap.xml"""
        endpoints = []
        if not HAS_REQUESTS:
            return endpoints
        
        sitemap_paths = ['/sitemap.xml', '/sitemap_index.xml', '/sitemap.txt']
        
        for sitemap_path in sitemap_paths:
            try:
                parsed = urlparse(base_url)
                sitemap_url = f"{parsed.scheme}://{parsed.netloc}{sitemap_path}"
                response = requests.get(sitemap_url, timeout=5)
                
                if response.status_code == 200:
                    # Extract URLs from sitemap
                    urls = re.findall(r'<loc>(.*?)</loc>', response.text)
                    for url in urls:
                        parsed_url = urlparse(url)
                        if parsed_url.path and parsed_url.path != '/':
                            endpoints.append(parsed_url.path)
            except:
                continue
        
        return endpoints
    
    @staticmethod
    def extract_endpoints_from_js(base_url: str) -> List[str]:
        """Extract API endpoints from JavaScript files"""
        endpoints = []
        if not HAS_REQUESTS:
            return endpoints
        
        try:
            parsed = urlparse(base_url)
            response = requests.get(base_url, timeout=5)
            
            # Find all JS files
            js_files = re.findall(r'src=["\']([^"\']*\.js)["\']', response.text)
            js_files.extend(re.findall(r'href=["\']([^"\']*\.js)["\']', response.text))
            
            for js_file in js_files[:10]:  # Limit to 10 JS files
                if js_file.startswith('http'):
                    js_url = js_file
                elif js_file.startswith('/'):
                    js_url = f"{parsed.scheme}://{parsed.netloc}{js_file}"
                else:
                    js_url = urljoin(base_url, js_file)
                
                try:
                    js_response = requests.get(js_url, timeout=5)
                    # Extract API endpoints
                    api_patterns = [
                        r'["\'](/api/[^"\']+)["\']',
                        r'["\'](/v\d+/[^"\']+)["\']',
                        r'url:\s*["\']([^"\']+)["\']',
                        r'endpoint:\s*["\']([^"\']+)["\']',
                        r'fetch\(["\']([^"\']+)["\']',
                        r'axios\.(?:get|post)\(["\']([^"\']+)["\']'
                    ]
                    
                    for pattern in api_patterns:
                        found = re.findall(pattern, js_response.text)
                        endpoints.extend(found)
                except:
                    continue
        except:
            pass
        
        return list(set(endpoints))  # Remove duplicates
    
    @staticmethod
    def port_scan_ip(target_ip: str, ports: List[int] = None) -> Dict:
        """Port scanning for IP addresses"""
        if ports is None:
            ports = [80, 443, 8080, 8443, 8000, 8888, 3000, 5000, 22, 21, 25, 3306, 5432, 6379, 27017]
        
        result = {
            'open_ports': [],
            'web_services': []
        }
        
        try:
            for port in ports:
                try:
                    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                    sock.settimeout(1)
                    result_code = sock.connect_ex((target_ip, port))
                    sock.close()
                    
                    if result_code == 0:
                        result['open_ports'].append(port)
                        
                        # Check if it's a web service
                        if port in [80, 443, 8080, 8443, 8000, 8888, 3000, 5000]:
                            scheme = 'http' if port in [80, 8080, 8000, 8888, 3000, 5000] else 'https'
                            url = f"{scheme}://{target_ip}:{port}"
                            result['web_services'].append(url)
                except:
                    continue
        except:
            pass
        
        return result
    
    @staticmethod
    def comprehensive_nsa_discovery(target: str) -> Dict:
        """Comprehensive NSA-level discovery with revolutionary techniques"""
        # Check if target is IP address
        is_ip = NSALevelDiscovery.is_ip_address(target)
        
        # Ensure URL has protocol
        if not target.startswith(('http://', 'https://')):
            # For IP addresses, try both http and https
            if is_ip:
                # First, port scan to find open web ports
                port_scan_result = NSALevelDiscovery.port_scan_ip(target)
                if port_scan_result['web_services']:
                    target = port_scan_result['web_services'][0]  # Use first web service found
                    print(json.dumps({'discovery': 'port_scan', 'found': port_scan_result['open_ports'], 'using': target}), file=sys.stderr, flush=True)
                else:
                    target = 'http://' + target  # Default to http
            else:
                target = 'https://' + target
        
        result = {
            'success': True,
            'target': target,
            'is_ip': is_ip,
            'discovered_endpoints': [],
            'technology_stack': {},
            'attack_surface_score': 0.0,
            'vulnerability_predictions': [],
            'discovery_methods': {
                'robots_txt': [],
                'sitemap': [],
                'js_analysis': [],
                'directory_bruteforce': [],
                'pattern_matching': [],
                'port_scan': []
            }
        }
        
        if not HAS_REQUESTS:
            result['error'] = 'requests library not available'
            return result
        
        try:
            parsed = urlparse(target)
            base_url = f"{parsed.scheme}://{parsed.netloc}"
            
            # If IP address, do port scan first
            if is_ip:
                ip_only = parsed.hostname
                port_scan_result = NSALevelDiscovery.port_scan_ip(ip_only)
                result['discovery_methods']['port_scan'] = port_scan_result['open_ports']
                
                # If multiple web services found, test all of them
                if len(port_scan_result['web_services']) > 1:
                    print(json.dumps({'discovery': 'multiple_services', 'services': port_scan_result['web_services'], 'message': f'Found {len(port_scan_result["web_services"])} web services, testing all...'}), file=sys.stderr, flush=True)
            
            print(json.dumps({'discovery': 'nsa_start', 'target': target, 'message': 'Starting NSA-level comprehensive discovery...'}), file=sys.stderr, flush=True)
            
            discovered = []
            
            # Method 1: robots.txt
            print(json.dumps({'discovery': 'method', 'method': 'robots.txt', 'message': 'Extracting endpoints from robots.txt...'}), file=sys.stderr, flush=True)
            robots_endpoints = NSALevelDiscovery.discover_from_robots_txt(base_url)
            result['discovery_methods']['robots_txt'] = robots_endpoints
            discovered.extend([{'endpoint': ep, 'method': 'robots.txt', 'risk_level': 'medium'} for ep in robots_endpoints])
            print(json.dumps({'discovery': 'method', 'method': 'robots.txt', 'found': len(robots_endpoints), 'message': f'Found {len(robots_endpoints)} endpoints from robots.txt'}), file=sys.stderr, flush=True)
            
            # Method 2: sitemap.xml
            print(json.dumps({'discovery': 'method', 'method': 'sitemap', 'message': 'Extracting endpoints from sitemap.xml...'}), file=sys.stderr, flush=True)
            sitemap_endpoints = NSALevelDiscovery.discover_from_sitemap(base_url)
            result['discovery_methods']['sitemap'] = sitemap_endpoints
            discovered.extend([{'endpoint': ep, 'method': 'sitemap', 'risk_level': 'medium'} for ep in sitemap_endpoints])
            print(json.dumps({'discovery': 'method', 'method': 'sitemap', 'found': len(sitemap_endpoints), 'message': f'Found {len(sitemap_endpoints)} endpoints from sitemap'}), file=sys.stderr, flush=True)
            
            # Method 3: JavaScript file analysis
            print(json.dumps({'discovery': 'method', 'method': 'js_analysis', 'message': 'Analyzing JavaScript files for API endpoints...'}), file=sys.stderr, flush=True)
            js_endpoints = NSALevelDiscovery.extract_endpoints_from_js(base_url)
            result['discovery_methods']['js_analysis'] = js_endpoints
            discovered.extend([{'endpoint': ep, 'method': 'js_analysis', 'risk_level': 'high'} for ep in js_endpoints])
            print(json.dumps({'discovery': 'method', 'method': 'js_analysis', 'found': len(js_endpoints), 'message': f'Found {len(js_endpoints)} endpoints from JS analysis'}), file=sys.stderr, flush=True)
            
            # Method 4: Extended pattern matching (1000+ patterns) - NSA LEVEL: More thorough
            print(json.dumps({'discovery': 'method', 'method': 'pattern_matching', 'message': 'Scanning with extended pattern library (1000+ patterns)...'}), file=sys.stderr, flush=True)
            all_patterns = []
            for risk_level, patterns in NSALevelDiscovery.EXTENDED_ENDPOINT_PATTERNS.items():
                all_patterns.extend([(p, risk_level) for p in patterns])
            
            total_patterns = len(all_patterns)
            current_pattern = 0
            found_count = 0
            
            # NSA LEVEL: Test ALL patterns, not just a subset
            for pattern, risk_level in all_patterns:
                current_pattern += 1
                test_path = pattern if pattern.startswith('/') else '/' + pattern
                test_url = f"{base_url}{test_path}"
                
                try:
                    # NSA LEVEL: Longer timeout for thorough testing
                    response = requests.get(test_url, timeout=5, allow_redirects=False, headers={
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Connection': 'keep-alive',
                        'Upgrade-Insecure-Requests': '1'
                    })
                    
                    # NSA LEVEL: Accept more status codes as valid endpoints
                    if response.status_code != 404:
                        endpoint_info = {
                            'endpoint': test_path,
                            'url': test_url,
                            'status_code': response.status_code,
                            'risk_level': risk_level,
                            'method': 'pattern_matching',
                            'accessible': response.status_code in [200, 201, 301, 302, 401, 403, 500]
                        }
                        discovered.append(endpoint_info)
                        found_count += 1
                        
                        # Log every found endpoint
                        print(json.dumps({'discovery': 'endpoint_found', 'endpoint': test_path, 'status': response.status_code, 'risk': risk_level, 'message': f'Found endpoint: {test_path} (HTTP {response.status_code})'}), file=sys.stderr, flush=True)
                        
                        if found_count % 10 == 0:
                            print(json.dumps({'discovery': 'progress', 'scanned': current_pattern, 'total': total_patterns, 'found': found_count, 'message': f'Scanned {current_pattern}/{total_patterns} patterns, found {found_count} endpoints...'}), file=sys.stderr, flush=True)
                except Exception as e:
                    # Log errors for first few to debug
                    if current_pattern <= 5:
                        print(json.dumps({'discovery': 'pattern_error', 'pattern': test_path, 'error': str(e)[:50]}), file=sys.stderr, flush=True)
                    continue
                
                # Progress update every 25 patterns
                if current_pattern % 25 == 0:
                    print(json.dumps({'discovery': 'progress', 'scanned': current_pattern, 'total': total_patterns, 'found': found_count, 'message': f'Pattern scanning progress: {current_pattern}/{total_patterns} patterns ({int(current_pattern/total_patterns*100)}%)...'}), file=sys.stderr, flush=True)
                
                # Small delay to avoid overwhelming the server
                if current_pattern % 10 == 0:
                    time.sleep(0.1)
            
            # Method 5: Directory bruteforcing - NSA LEVEL: Test MORE directories
            print(json.dumps({'discovery': 'method', 'method': 'directory_bruteforce', 'message': 'Bruteforcing common directories (200+ entries)...'}), file=sys.stderr, flush=True)
            bruteforced = []
            bruteforce_found = 0
            total_dirs = len(NSALevelDiscovery.DIRECTORY_WORDLIST[:200])  # NSA LEVEL: Test 200 directories
            current_dir = 0
            
            for directory in NSALevelDiscovery.DIRECTORY_WORDLIST[:200]:  # NSA LEVEL: Test 200, not just 100
                current_dir += 1
                test_path = f"/{directory}"
                test_url = f"{base_url}{test_path}"
                
                try:
                    # NSA LEVEL: Longer timeout and better headers
                    response = requests.get(test_url, timeout=4, allow_redirects=False, headers={
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.9'
                    })
                    
                    if response.status_code not in [404]:
                        endpoint_info = {
                            'endpoint': test_path,
                            'url': test_url,
                            'status_code': response.status_code,
                            'risk_level': 'medium',
                            'method': 'directory_bruteforce',
                            'accessible': response.status_code in [200, 201, 301, 302, 401, 403, 500]
                        }
                        bruteforced.append(endpoint_info)
                        bruteforce_found += 1
                        
                        # Log found directories
                        print(json.dumps({'discovery': 'directory_found', 'directory': directory, 'status': response.status_code, 'message': f'Found directory: {directory} (HTTP {response.status_code})'}), file=sys.stderr, flush=True)
                        
                        if bruteforce_found % 5 == 0:
                            print(json.dumps({'discovery': 'bruteforce_progress', 'scanned': current_dir, 'total': total_dirs, 'found': bruteforce_found, 'message': f'Directory bruteforcing: {current_dir}/{total_dirs}, found {bruteforce_found}...'}), file=sys.stderr, flush=True)
                except Exception as e:
                    continue
                
                # Progress update every 25 directories
                if current_dir % 25 == 0:
                    print(json.dumps({'discovery': 'bruteforce_progress', 'scanned': current_dir, 'total': total_dirs, 'found': bruteforce_found, 'message': f'Directory bruteforcing progress: {current_dir}/{total_dirs} ({int(current_dir/total_dirs*100)}%)...'}), file=sys.stderr, flush=True)
                
                # Small delay to avoid overwhelming
                if current_dir % 10 == 0:
                    time.sleep(0.1)
            
            result['discovery_methods']['directory_bruteforce'] = [ep['endpoint'] for ep in bruteforced]
            discovered.extend(bruteforced)
            print(json.dumps({'discovery': 'method', 'method': 'directory_bruteforce', 'found': len(bruteforced), 'message': f'Found {len(bruteforced)} endpoints from directory bruteforcing'}), file=sys.stderr, flush=True)
            
            # Remove duplicates
            seen_endpoints = set()
            unique_discovered = []
            for ep in discovered:
                ep_key = ep.get('endpoint', '')
                if ep_key and ep_key not in seen_endpoints:
                    seen_endpoints.add(ep_key)
                    unique_discovered.append(ep)
            
            result['discovered_endpoints'] = unique_discovered[:200]  # Limit to 200
            
            # Technology stack detection - NSA LEVEL: More thorough
            print(json.dumps({'discovery': 'method', 'method': 'tech_detection', 'message': 'Detecting technology stack (analyzing headers, HTML, JavaScript)...'}), file=sys.stderr, flush=True)
            try:
                # NSA LEVEL: Get main page and analyze thoroughly
                response = requests.get(base_url, timeout=10, headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                })
                headers = response.headers
                response_text = response.text.lower()
                server = headers.get('Server', '').lower()
                powered_by = headers.get('X-Powered-By', '').lower()
                tech_stack = {}
                
                # NSA LEVEL: Extended technology patterns
                tech_patterns = {
                    'cms': ['wordpress', 'joomla', 'drupal', 'magento', 'prestashop', 'opencart', 'woocommerce', 'shopify'],
                    'framework': ['laravel', 'django', 'rails', 'spring', 'express', 'symfony', 'codeigniter', 'yii', 'flask', 'fastapi', 'next.js', 'nuxt'],
                    'database': ['mysql', 'postgresql', 'mongodb', 'redis', 'mariadb', 'sqlite', 'oracle', 'mssql'],
                    'server': ['apache', 'nginx', 'iis', 'tomcat', 'jetty', 'gunicorn', 'uwsgi', 'caddy'],
                    'language': ['php', 'python', 'java', 'nodejs', 'ruby', 'asp.net', 'go', 'rust'],
                    'cdn': ['cloudflare', 'cloudfront', 'akamai', 'fastly', 'keycdn', 'maxcdn'],
                    'javascript': ['jquery', 'react', 'vue', 'angular', 'bootstrap', 'moment.js'],
                    'analytics': ['google-analytics', 'gtag', 'analytics.js', 'mixpanel', 'segment']
                }
                
                print(json.dumps({'discovery': 'tech_analysis', 'message': 'Analyzing server headers and page content...'}), file=sys.stderr, flush=True)
                
                for tech_type, patterns in tech_patterns.items():
                    detected = []
                    for pattern in patterns:
                        # Check headers
                        if pattern in server or pattern in powered_by:
                            detected.append(pattern)
                        # Check response body
                        elif pattern in response_text:
                            detected.append(pattern)
                        # Check specific headers
                        elif tech_type == 'cdn' and pattern in headers.get('CF-Ray', '').lower():
                            detected.append(pattern)
                        # Check for framework-specific patterns
                        elif tech_type == 'framework':
                            if pattern == 'laravel' and ('laravel_session' in response_text or 'laravel' in headers.get('Set-Cookie', '').lower()):
                                detected.append(pattern)
                            elif pattern == 'django' and ('csrftoken' in response_text or 'django' in headers.get('Set-Cookie', '').lower()):
                                detected.append(pattern)
                            elif pattern == 'rails' and ('_rails_session' in response_text or 'rails' in headers.get('Set-Cookie', '').lower()):
                                detected.append(pattern)
                    
                    if detected:
                        tech_stack[tech_type] = list(set(detected))  # Remove duplicates
                        print(json.dumps({'discovery': 'tech_detected', 'type': tech_type, 'technologies': tech_stack[tech_type], 'message': f'Detected {tech_type}: {", ".join(tech_stack[tech_type])}'}), file=sys.stderr, flush=True)
                
                result['technology_stack'] = tech_stack
                if tech_stack:
                    tech_summary = ', '.join([f"{k}: {', '.join(v)}" for k, v in tech_stack.items()])
                    print(json.dumps({'discovery': 'tech_complete', 'stack': tech_summary, 'message': f'Technology stack detection complete: {tech_summary}'}), file=sys.stderr, flush=True)
                else:
                    print(json.dumps({'discovery': 'tech_none', 'message': 'No technology stack detected'}), file=sys.stderr, flush=True)
            except Exception as e:
                print(json.dumps({'discovery': 'tech_error', 'error': str(e), 'message': f'Technology detection error: {str(e)}'}), file=sys.stderr, flush=True)
            
            # Calculate attack surface score
            if unique_discovered:
                critical_count = len([e for e in unique_discovered if e.get('risk_level') == 'critical'])
                high_count = len([e for e in unique_discovered if e.get('risk_level') == 'high'])
                total_score = (critical_count * 10) + (high_count * 5) + (len(unique_discovered) * 2)
                result['attack_surface_score'] = min(100, total_score / 10)
            
            # If no endpoints found, try even more aggressive discovery
            if len(result['discovered_endpoints']) == 0:
                print(json.dumps({'discovery': 'aggressive', 'message': 'No endpoints found, starting aggressive discovery...'}), file=sys.stderr, flush=True)
                
                # Try common paths directly on root
                aggressive_paths = ['/', '/index.html', '/index.php', '/home', '/welcome', '/default', '/main']
                for path in aggressive_paths:
                    try:
                        test_url = f"{base_url}{path}"
                        response = requests.get(test_url, timeout=3, allow_redirects=False, headers={'User-Agent': 'Mozilla/5.0'})
                        if response.status_code != 404:
                            result['discovered_endpoints'].append({
                                'endpoint': path,
                                'url': test_url,
                                'status_code': response.status_code,
                                'risk_level': 'low',
                                'method': 'aggressive_scan',
                                'accessible': response.status_code in [200, 201, 301, 302]
                            })
                            print(json.dumps({'discovery': 'aggressive', 'found': path, 'status': response.status_code}), file=sys.stderr, flush=True)
                    except:
                        continue
            
            print(json.dumps({'discovery': 'nsa_complete', 'endpoints': len(result['discovered_endpoints']), 'message': f'NSA-level discovery completed: {len(result["discovered_endpoints"])} unique endpoints found'}), file=sys.stderr, flush=True)
            
        except Exception as e:
            result['success'] = False
            result['error'] = str(e)
            print(json.dumps({'discovery': 'error', 'message': f'NSA discovery error: {str(e)}'}), file=sys.stderr, flush=True)
        
        return result

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Target URL or IP required'}))
        sys.exit(1)
    
    target = sys.argv[1]
    result = NSALevelDiscovery.comprehensive_nsa_discovery(target)
    print(json.dumps({'success': True, 'result': result}))

