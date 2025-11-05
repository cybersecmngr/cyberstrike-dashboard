#!/usr/bin/env python3
"""
Advanced Forensic Analysis Tools
File carving, memory dump analysis, log correlation, timeline generation, metadata extraction
"""

import sys
import json
import os
import re
import struct
from typing import Dict, List, Tuple
from datetime import datetime
import mimetypes

class FileCarver:
    """Advanced file carving from disk images"""
    
    # File signatures (magic bytes)
    SIGNATURES = {
        'JPEG': [(b'\xFF\xD8\xFF', 'JPEG Image')],
        'PNG': [(b'\x89PNG\r\n\x1a\n', 'PNG Image')],
        'GIF': [(b'GIF87a', 'GIF Image'), (b'GIF89a', 'GIF Image')],
        'PDF': [(b'%PDF', 'PDF Document')],
        'ZIP': [(b'PK\x03\x04', 'ZIP Archive'), (b'PK\x05\x06', 'ZIP Archive (empty)')],
        'RAR': [(b'Rar!\x1a\x07', 'RAR Archive')],
        '7Z': [(b'7z\xBC\xAF\x27\x1C', '7-Zip Archive')],
        'DOC': [(b'\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1', 'Microsoft Word Document')],
        'XLS': [(b'\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1', 'Microsoft Excel Spreadsheet')],
        'PPT': [(b'\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1', 'Microsoft PowerPoint Presentation')],
        'EXE': [(b'MZ', 'Windows Executable')],
        'ELF': [(b'\x7fELF', 'Linux Executable')],
        'MP3': [(b'ID3', 'MP3 Audio'), (b'\xFF\xFB', 'MP3 Audio')],
        'MP4': [(b'\x00\x00\x00\x20ftyp', 'MP4 Video')],
        'AVI': [(b'RIFF', 'AVI Video')],
        'HTML': [(b'<html', 'HTML Document'), (b'<!DOCTYPE', 'HTML Document')],
    }
    
    @staticmethod
    def carve_files(file_path: str, output_dir: str = '/tmp/carved_files') -> Dict:
        """Carve files from disk image or binary file"""
        carved_files = []
        
        try:
            os.makedirs(output_dir, exist_ok=True)
            
            with open(file_path, 'rb') as f:
                data = f.read()
            
            file_count = 0
            
            for file_type, signatures in FileCarver.SIGNATURES.items():
                for signature, description in signatures:
                    offset = 0
                    while True:
                        pos = data.find(signature, offset)
                        if pos == -1:
                            break
                        
                        # Try to determine file size
                        file_size = FileCarver._estimate_file_size(data, pos, file_type, signature)
                        
                        if file_size > 0:
                            file_data = data[pos:pos+file_size]
                            filename = f'carved_{file_count:04d}_{file_type.lower()}_{pos}.{file_type.lower()}'
                            filepath = os.path.join(output_dir, filename)
                            
                            with open(filepath, 'wb') as out:
                                out.write(file_data)
                            
                            carved_files.append({
                                'type': file_type,
                                'description': description,
                                'offset': pos,
                                'size': file_size,
                                'filename': filename,
                                'path': filepath,
                                'md5': FileCarver._calculate_hash(file_data)
                            })
                            file_count += 1
                        
                        offset = pos + len(signature)
        
        except Exception as e:
            return {'error': str(e), 'files': carved_files}
        
        return {
            'files': carved_files,
            'total': len(carved_files),
            'output_dir': output_dir
        }
    
    @staticmethod
    def _estimate_file_size(data: bytes, offset: int, file_type: str, signature: bytes) -> int:
        """Estimate file size based on file type"""
        if file_type == 'JPEG':
            # JPEG ends with FF D9
            end_marker = data.find(b'\xFF\xD9', offset)
            if end_marker != -1:
                return end_marker - offset + 2
        elif file_type == 'PNG':
            # PNG has IEND chunk
            end_marker = data.find(b'IEND\xaeB`\x82', offset)
            if end_marker != -1:
                return end_marker - offset + 8
        elif file_type in ['ZIP', 'DOC', 'XLS', 'PPT']:
            # Try to find end of file structure
            # Simplified: look for next signature or end of data
            next_sig = len(data)
            for sig_type, sigs in FileCarver.SIGNATURES.items():
                for sig, _ in sigs:
                    next_pos = data.find(sig, offset + 100)
                    if next_pos != -1:
                        next_sig = min(next_sig, next_pos)
            return min(next_sig - offset, len(data) - offset)
        
        # Default: return a reasonable chunk size
        return min(1024 * 1024, len(data) - offset)
    
    @staticmethod
    def _calculate_hash(data: bytes) -> str:
        """Calculate MD5 hash"""
        import hashlib
        return hashlib.md5(data).hexdigest()

class MemoryAnalyzer:
    """Memory dump analysis"""
    
    @staticmethod
    def analyze_memory_dump(dump_path: str) -> Dict:
        """Analyze memory dump for processes, network connections, etc."""
        result = {
            'processes': [],
            'network_connections': [],
            'loaded_modules': [],
            'registry_keys': [],
            'suspicious_activity': []
        }
        
        try:
            with open(dump_path, 'rb') as f:
                data = f.read()
            
            # Extract process names (simplified)
            process_patterns = [
                b'explorer.exe',
                b'chrome.exe',
                b'firefox.exe',
                b'svchost.exe',
                b'winlogon.exe',
                b'lsass.exe',
                b'smss.exe',
                b'csrss.exe',
                b'cmd.exe',
                b'powershell.exe',
            ]
            
            for pattern in process_patterns:
                if pattern in data:
                    result['processes'].append({
                        'name': pattern.decode('utf-8', errors='ignore'),
                        'found': True
                    })
            
            # Extract IP addresses
            ip_pattern = re.compile(rb'\b(?:\d{1,3}\.){3}\d{1,3}\b')
            ip_matches = ip_pattern.findall(data)
            unique_ips = list(set(ip_matches[:50]))  # Limit to 50
            
            for ip_bytes in unique_ips:
                try:
                    ip = ip_bytes.decode('utf-8', errors='ignore')
                    result['network_connections'].append({
                        'ip': ip,
                        'type': 'IPv4'
                    })
                except:
                    pass
            
            # Extract URLs
            url_pattern = re.compile(rb'https?://[^\s<>"\']+')
            url_matches = url_pattern.findall(data)
            unique_urls = list(set(url_matches[:20]))  # Limit to 20
            
            for url_bytes in unique_urls:
                try:
                    url = url_bytes.decode('utf-8', errors='ignore')
                    result['network_connections'].append({
                        'url': url,
                        'type': 'URL'
                    })
                except:
                    pass
            
            result['note'] = 'For full analysis, use volatility framework: volatility -f dump.raw imageinfo'
        
        except Exception as e:
            result['error'] = str(e)
        
        return result

class LogCorrelator:
    """Log correlation and analysis"""
    
    @staticmethod
    def correlate_logs(log_path: str, patterns: List[str] = None) -> Dict:
        """Correlate log entries and detect anomalies"""
        if patterns is None:
            patterns = [
                r'error',
                r'fail',
                r'denied',
                r'unauthorized',
                r'attack',
                r'intrusion',
                r'breach',
                r'exploit',
                r'sql injection',
                r'xss',
            ]
        
        result = {
            'events': [],
            'anomalies': [],
            'statistics': {},
            'timeline': []
        }
        
        try:
            with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
            
            total_lines = len(lines)
            error_count = 0
            warning_count = 0
            
            for i, line in enumerate(lines[:1000]):  # Limit to 1000 lines
                line_lower = line.lower()
                
                # Check for patterns
                for pattern in patterns:
                    if re.search(pattern, line_lower, re.IGNORECASE):
                        result['anomalies'].append({
                            'line': i + 1,
                            'pattern': pattern,
                            'content': line.strip()[:200]
                        })
                
                # Categorize events
                if 'error' in line_lower:
                    error_count += 1
                    result['events'].append({
                        'type': 'error',
                        'line': i + 1,
                        'content': line.strip()[:200]
                    })
                elif 'warning' in line_lower:
                    warning_count += 1
                    result['events'].append({
                        'type': 'warning',
                        'line': i + 1,
                        'content': line.strip()[:200]
                    })
                
                # Extract timestamps
                timestamp_match = re.search(r'(\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2})', line)
                if timestamp_match:
                    result['timeline'].append({
                        'timestamp': timestamp_match.group(1),
                        'line': i + 1,
                        'event': line.strip()[:100]
                    })
            
            result['statistics'] = {
                'total_lines': total_lines,
                'errors': error_count,
                'warnings': warning_count,
                'anomalies': len(result['anomalies'])
            }
        
        except Exception as e:
            result['error'] = str(e)
        
        return result

class TimelineGenerator:
    """Generate timeline from file metadata"""
    
    @staticmethod
    def generate_timeline(file_path: str) -> Dict:
        """Generate timeline from file system metadata"""
        timeline = []
        
        try:
            stat = os.stat(file_path)
            
            timeline.append({
                'event': 'File Created',
                'time': datetime.fromtimestamp(stat.st_ctime).isoformat(),
                'timestamp': stat.st_ctime
            })
            
            timeline.append({
                'event': 'File Modified',
                'time': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                'timestamp': stat.st_mtime
            })
            
            timeline.append({
                'event': 'File Accessed',
                'time': datetime.fromtimestamp(stat.st_atime).isoformat(),
                'timestamp': stat.st_atime
            })
            
            # Sort by timestamp
            timeline.sort(key=lambda x: x['timestamp'])
            
        except Exception as e:
            return {'error': str(e), 'timeline': []}
        
        return {
            'file': os.path.basename(file_path),
            'timeline': timeline,
            'events': len(timeline)
        }
    
    @staticmethod
    def generate_directory_timeline(directory: str) -> Dict:
        """Generate timeline for all files in directory"""
        timeline_events = []
        
        try:
            for root, dirs, files in os.walk(directory):
                for file in files:
                    file_path = os.path.join(root, file)
                    try:
                        stat = os.stat(file_path)
                        timeline_events.extend([
                            {
                                'event': 'Created',
                                'file': file_path,
                                'time': datetime.fromtimestamp(stat.st_ctime).isoformat(),
                                'timestamp': stat.st_ctime
                            },
                            {
                                'event': 'Modified',
                                'file': file_path,
                                'time': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                                'timestamp': stat.st_mtime
                            }
                        ])
                    except:
                        pass
            
            # Sort by timestamp
            timeline_events.sort(key=lambda x: x['timestamp'])
        
        except Exception as e:
            return {'error': str(e), 'timeline': []}
        
        return {
            'directory': directory,
            'timeline': timeline_events,
            'total_events': len(timeline_events)
        }

class MetadataExtractor:
    """Extract metadata from files"""
    
    @staticmethod
    def extract_metadata(file_path: str) -> Dict:
        """Extract comprehensive file metadata"""
        metadata = {
            'basic': {},
            'extended': {},
            'security': {}
        }
        
        try:
            stat = os.stat(file_path)
            
            # Basic metadata
            metadata['basic'] = {
                'filename': os.path.basename(file_path),
                'path': file_path,
                'size': stat.st_size,
                'size_human': MetadataExtractor._format_size(stat.st_size),
                'created': datetime.fromtimestamp(stat.st_ctime).isoformat(),
                'modified': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                'accessed': datetime.fromtimestamp(stat.st_atime).isoformat(),
                'type': mimetypes.guess_type(file_path)[0] or 'unknown'
            }
            
            # Extended metadata
            metadata['extended'] = {
                'permissions': oct(stat.st_mode)[-3:],
                'inode': stat.st_ino,
                'device': stat.st_dev,
                'links': stat.st_nlink,
                'uid': stat.st_uid,
                'gid': stat.st_gid
            }
            
            # Security metadata
            metadata['security'] = {
                'readable': os.access(file_path, os.R_OK),
                'writable': os.access(file_path, os.W_OK),
                'executable': os.access(file_path, os.X_OK)
            }
            
            # Calculate file hash
            try:
                import hashlib
                with open(file_path, 'rb') as f:
                    file_data = f.read(1024 * 1024)  # Read first 1MB for hash
                    metadata['basic']['md5'] = hashlib.md5(file_data).hexdigest()
                    metadata['basic']['sha256'] = hashlib.sha256(file_data).hexdigest()
            except:
                pass
        
        except Exception as e:
            metadata['error'] = str(e)
        
        return metadata
    
    @staticmethod
    def _format_size(size: int) -> str:
        """Format file size in human-readable format"""
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if size < 1024.0:
                return f'{size:.2f} {unit}'
            size /= 1024.0
        return f'{size:.2f} PB'

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print(json.dumps({'error': 'Tool type and file path required'}))
        sys.exit(1)
    
    tool_type = sys.argv[1]
    file_path = sys.argv[2]
    
    if tool_type == 'carve':
        output_dir = sys.argv[3] if len(sys.argv) > 3 else '/tmp/carved_files'
        result = FileCarver.carve_files(file_path, output_dir)
    elif tool_type == 'memory':
        result = MemoryAnalyzer.analyze_memory_dump(file_path)
    elif tool_type == 'log':
        patterns = sys.argv[3].split(',') if len(sys.argv) > 3 else None
        result = LogCorrelator.correlate_logs(file_path, patterns)
    elif tool_type == 'timeline':
        if os.path.isdir(file_path):
            result = TimelineGenerator.generate_directory_timeline(file_path)
        else:
            result = TimelineGenerator.generate_timeline(file_path)
    elif tool_type == 'metadata':
        result = MetadataExtractor.extract_metadata(file_path)
    else:
        result = {'error': 'Unknown tool type'}
    
    print(json.dumps({'success': True, 'result': result}))
