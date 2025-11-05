# CyberDock Tools - Python Backend Scripts

Bu klasörde CyberDock'taki özellikler için gelişmiş Python backend script'leri bulunur.

## Dock Özellikleri ve Python Script'leri

### 1. Terminal (Command Line Interface)
- **Script**: `terminal_utils.py` (mevcut)
- **Özellikler**: 
  - Komut sanitization
  - Auto-completion
  - Command history

### 2. Security Shield
- **Script**: `security_shield.py` ✨ YENİ
- **Özellikler**:
  - Comprehensive port scanning
  - SSL/TLS vulnerability detection
  - Security headers analysis
  - Automated recommendations
  - Multi-layer security assessment

### 3. Network Scanner
- **Script**: `advanced_port_scanner.py` (mevcut)
- **Geliştirmeler**:
  - Service detection
  - Version detection
  - OS fingerprinting

### 4. Database Explorer
- **Script**: `database_explorer.py` ✨ YENİ
- **Özellikler**:
  - MySQL/PostgreSQL/MongoDB enumeration
  - Database structure analysis
  - Table enumeration
  - User enumeration
  - SQL injection testing
  - Default credential checking

### 5. Code Editor
- **Script**: `code_analyzer.py` ✨ YENİ
- **Özellikler**:
  - Security vulnerability detection
  - Dangerous function identification
  - Hardcoded secrets detection
  - Code injection risk analysis
  - Python/JavaScript/SQL support
  - Line-by-line vulnerability reporting

### 6. Encryption Tool
- **Script**: `advanced_encryption.py` ✨ YENİ
- **Özellikler**:
  - AES-256 encryption
  - RSA encryption (2048-bit)
  - ChaCha20 encryption
  - Key generation
  - Base64 encoding
  - ROT13 cipher
  - Secure key management

### 7. Vulnerability Scanner
- **Script**: `vuln_scanner.py` (mevcut)
- **Geliştirmeler**:
  - Multi-target scanning
  - CVE detection
  - Automated reporting

### 8. Port Scanner
- **Script**: `advanced_port_scanner.py` (mevcut)
- Zaten gelişmiş!

### 9. Key Manager
- **Script**: `key_manager.py` ✨ YENİ
- **Özellikler**:
  - SSH key generation (RSA, DSA, ECDSA)
  - Key analysis
  - Certificate generation
  - Key validation
  - Key strength analysis
  - Certificate management

### 10. Power Tools
- **Script**: `power_tools_automation.py` ✨ YENİ
- **Özellikler**:
  - Automated exploit chains
  - Reconnaissance automation
  - Vulnerability correlation
  - Post-exploitation automation
  - Technology detection
  - Multi-vector attack simulation

## Yeni Gelişmiş Özellikler

### 1. Malware Analysis Tool
- **Script**: `malware_analyzer.py` (öneri)
- **Özellikler**:
  - File hash analysis
  - PE file analysis
  - String extraction
  - YARA rule matching
  - Behavior analysis

### 2. Social Engineering Toolkit
- **Script**: `set_toolkit.py` (öneri)
- **Özellikler**:
  - Phishing email generation
  - Credential harvesting
  - Website cloning
  - QR code generation

### 3. Wireless Attack Tools
- **Script**: `wireless_attacks.py` (öneri)
- **Özellikler**:
  - WiFi handshake capture
  - WPS PIN brute force
  - Evil twin attack
  - Deauth attack

### 4. Forensic Tools
- **Script**: `forensic_tools.py` (öneri)
- **Özellikler**:
  - File carving
  - Memory dump analysis
  - Log analysis
  - Timeline generation

### 5. Penetration Testing Automation
- **Script**: `pentest_automation.py` (öneri)
- **Özellikler**:
  - Automated reconnaissance
  - Vulnerability exploitation
  - Privilege escalation
  - Lateral movement
  - Report generation

## Kurulum

```bash
# Tüm Python bağımlılıklarını yükle
pip3 install -r requirements.txt

# Script'leri executable yap
chmod +x scripts/*.py
```

## Kullanım Örnekleri

### Database Explorer
```bash
python3 scripts/database_explorer.py explore 192.168.1.100 3306 mysql
python3 scripts/database_explorer.py test http://example.com/page.php id
```

### Advanced Encryption
```bash
python3 scripts/advanced_encryption.py generate aes
python3 scripts/advanced_encryption.py encrypt "secret text" <key> aes
```

### Key Manager
```bash
python3 scripts/key_manager.py generate rsa 4096
python3 scripts/key_manager.py analyze ~/.ssh/id_rsa
python3 scripts/key_manager.py certificate example.com
```

### Security Shield
```bash
python3 scripts/security_shield.py example.com
```

### Code Analyzer
```bash
python3 scripts/code_analyzer.py "$(cat app.py)" python
```

### Power Tools
```bash
python3 scripts/power_tools_automation.py 192.168.1.100
```

