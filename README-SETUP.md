# 🛠️ CyberStrike Dashboard - Setup Guide

## Automated Installation Script

This project includes an automated setup script for macOS that installs all required security tools.

### Quick Start

```bash
# Make script executable (if not already)
chmod +x setup.sh

# Run the setup script
./setup.sh
```

### What Gets Installed

#### Security Tools (via Homebrew)
- **nmap** - Network mapper and port scanner
- **nikto** - Web vulnerability scanner
- **sqlmap** - SQL injection testing tool
- **john** - John the Ripper password cracker
- **hashcat** - Advanced password recovery tool
- **hydra** - Network login cracker
- **aircrack-ng** - WiFi security auditing tools
- **wireshark** - Network protocol analyzer
- **metasploit** - Penetration testing framework
- **burp-suite** - Web application security testing (via Cask)

#### Python Tools (via pip3)
- **scapy** - Packet manipulation library
- **impacket** - Network protocols implementation
- **pwntools** - CTF framework and exploit development
- **requests** - HTTP library
- **beautifulsoup4** - HTML/XML parser
- **python-nmap** - Python nmap library
- **pycryptodome** - Cryptographic library

#### Node.js Security Modules (via npm)
- **retire** - Dependency vulnerability scanner
- **snyk** - Security vulnerability scanner
- **npm-audit** - Built-in npm security audit

### Manual Installation (Alternative)

If you prefer to install tools manually:

#### 1. Install Homebrew
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 2. Install Security Tools
```bash
brew install nmap nikto sqlmap john hashcat hydra aircrack-ng wireshark metasploit
brew install --cask burp-suite
```

#### 3. Install Python Tools
```bash
pip3 install scapy impacket pwntools requests beautifulsoup4 python-nmap pycryptodome
```

#### 4. Install Node.js Tools
```bash
npm install -g retire snyk
```

### Post-Installation Setup

#### Metasploit Framework
After installation, initialize the database:

```bash
msfconsole
msfdb init
```

#### Wireshark Permissions
For packet capture on macOS, you may need to:

1. Open System Preferences → Security & Privacy → Privacy
2. Add Wireshark to "Full Disk Access"
3. Restart Wireshark

#### Burp Suite
1. Launch Burp Suite from Applications
2. Follow the activation wizard
3. For REST API access, configure in Extender → APIs

### Verification

After running the setup script, verify installations:

```bash
# Check tool versions
nmap --version
nikto -Version
sqlmap --version
john --version
hashcat --version
hydra -v
msfconsole -v

# Check Python packages
pip3 list | grep -E "scapy|impacket|pwntools"

# Check Node.js packages
npm list -g | grep -E "retire|snyk"
```

### Troubleshooting

#### Homebrew Issues
```bash
# Update Homebrew
brew update

# Fix permissions
sudo chown -R $(whoami) $(brew --prefix)/*
```

#### Python Package Issues
```bash
# Upgrade pip
python3 -m pip install --upgrade pip

# Use --user flag if permission errors
pip3 install --user <package-name>
```

#### Node.js Global Install Issues
```bash
# Fix npm permissions (if needed)
sudo chown -R $(whoami) ~/.npm
```

### API Endpoints

Once tools are installed, the following API endpoints will work:

- `POST /api/nmap` - Port scanning
- `POST /api/nikto` - Web vulnerability scanning
- `POST /api/sqlmap` - SQL injection testing
- `POST /api/metasploit` - Exploit framework
- `POST /api/burp` - Burp Suite integration

**Note:** If tools are not installed, the API endpoints will return mock data for development purposes.

### Security Notes

⚠️ **Important Security Considerations:**

1. These tools are for **authorized testing only**
2. Never use these tools on systems without permission
3. Some tools require `sudo` permissions - use with caution
4. Keep tools updated for security patches
5. Use in isolated environments when possible

### Support

For issues or questions:
1. Check tool-specific documentation
2. Review API route logs
3. Verify tool installations with version commands

### Next Steps

After installation:
1. Start the development server: `npm run dev`
2. Test API endpoints with installed tools
3. Explore the dashboard components
4. Configure tool-specific settings as needed

