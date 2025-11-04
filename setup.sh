#!/bin/bash

# setup.sh - macOS için gerekli security tool'ları kur
# CyberStrike Dashboard için gerekli tüm araçları otomatik kurar

set -e  # Hata durumunda dur

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║     CyberStrike Dashboard - Tool Installation Script      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Homebrew kontrolü ve kurulumu
echo -e "${BLUE}[*] Checking Homebrew installation...${NC}"
if ! command -v brew &> /dev/null; then
    echo -e "${YELLOW}[!] Homebrew not found. Installing Homebrew...${NC}"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Homebrew path'i ekle (Apple Silicon için)
    if [[ $(uname -m) == "arm64" ]]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
else
    echo -e "${GREEN}[✓] Homebrew is already installed${NC}"
fi

# Homebrew güncelle
echo -e "${BLUE}[*] Updating Homebrew...${NC}"
brew update

# Security tools kurulumu
echo -e "${BLUE}[*] Installing security tools...${NC}"

TOOLS=(
    "nmap"
    "nikto"
    "sqlmap"
    "john"
    "hashcat"
    "hydra"
    "aircrack-ng"
    "wireshark"
    "metasploit"
)

for tool in "${TOOLS[@]}"; do
    if brew list "$tool" &>/dev/null; then
        echo -e "${GREEN}[✓] $tool is already installed${NC}"
    else
        echo -e "${YELLOW}[*] Installing $tool...${NC}"
        brew install "$tool" || echo -e "${RED}[✗] Failed to install $tool${NC}"
    fi
done

# Burp Suite (cask olarak)
echo -e "${BLUE}[*] Installing Burp Suite...${NC}"
if brew list --cask burp-suite &>/dev/null; then
    echo -e "${GREEN}[✓] Burp Suite is already installed${NC}"
else
    echo -e "${YELLOW}[*] Installing Burp Suite...${NC}"
    brew install --cask burp-suite || echo -e "${RED}[✗] Failed to install Burp Suite${NC}"
fi

# Python3 kontrolü
echo -e "${BLUE}[*] Checking Python3 installation...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${YELLOW}[!] Python3 not found. Installing via Homebrew...${NC}"
    brew install python3
else
    echo -e "${GREEN}[✓] Python3 is already installed${NC}"
fi

# pip3 kontrolü
if ! command -v pip3 &> /dev/null; then
    echo -e "${YELLOW}[!] pip3 not found. Installing pip...${NC}"
    python3 -m ensurepip --upgrade
fi

# Python tools kurulumu
echo -e "${BLUE}[*] Installing Python security tools...${NC}"

PYTHON_TOOLS=(
    "scapy"
    "impacket"
    "pwntools"
    "requests"
    "beautifulsoup4"
    "python-nmap"
    "pycryptodome"
)

for tool in "${PYTHON_TOOLS[@]}"; do
    if pip3 show "$tool" &>/dev/null; then
        echo -e "${GREEN}[✓] Python package $tool is already installed${NC}"
    else
        echo -e "${YELLOW}[*] Installing Python package $tool...${NC}"
        pip3 install "$tool" || echo -e "${RED}[✗] Failed to install $tool${NC}"
    fi
done

# Node.js kontrolü
echo -e "${BLUE}[*] Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}[!] Node.js not found. Installing via Homebrew...${NC}"
    brew install node
else
    echo -e "${GREEN}[✓] Node.js is already installed${NC}"
    echo -e "${BLUE}    Version: $(node --version)${NC}"
fi

# npm kontrolü
if ! command -v npm &> /dev/null; then
    echo -e "${RED}[✗] npm not found${NC}"
    exit 1
fi

# Node.js security modules
echo -e "${BLUE}[*] Installing Node.js security modules...${NC}"

NODE_TOOLS=(
    "retire"
    "snyk"
    "npm-audit"
)

for tool in "${NODE_TOOLS[@]}"; do
    if npm list -g "$tool" &>/dev/null 2>&1; then
        echo -e "${GREEN}[✓] Node.js package $tool is already installed${NC}"
    else
        echo -e "${YELLOW}[*] Installing Node.js package $tool...${NC}"
        npm install -g "$tool" || echo -e "${RED}[✗] Failed to install $tool${NC}"
    fi
done

# Metasploit Framework path kontrolü
echo -e "${BLUE}[*] Checking Metasploit Framework...${NC}"
if [ -d "/opt/metasploit-framework" ] || [ -d "$HOME/.msf4" ]; then
    echo -e "${GREEN}[✓] Metasploit Framework is installed${NC}"
    echo -e "${YELLOW}[!] Note: You may need to run: msfconsole${NC}"
else
    echo -e "${YELLOW}[!] Metasploit Framework may need additional setup${NC}"
fi

# Tool versiyonlarını göster
echo -e "${BLUE}[*] Installed tool versions:${NC}"
echo -e "${GREEN}"
echo "═══════════════════════════════════════════════════════════"

for tool in nmap nikto sqlmap john hashcat hydra; do
    if command -v "$tool" &>/dev/null; then
        version=$($tool --version 2>/dev/null | head -n 1 || echo "N/A")
        echo "  $tool: $version"
    fi
done

if command -v python3 &>/dev/null; then
    echo "  Python3: $(python3 --version)"
fi

if command -v node &>/dev/null; then
    echo "  Node.js: $(node --version)"
    echo "  npm: $(npm --version)"
fi

echo "═══════════════════════════════════════════════════════════"
echo -e "${NC}"

# Özet
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  Installation Complete!                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${YELLOW}[!] Important Notes:${NC}"
echo "  1. Some tools may require sudo permissions (nmap, aircrack-ng)"
echo "  2. Burp Suite requires manual activation after installation"
echo "  3. Metasploit Framework needs initial database setup:"
echo "     Run: msfconsole"
echo "     Then: msfdb init"
echo "  4. Wireshark requires additional permissions for packet capture"
echo ""
echo -e "${GREEN}[✓] Setup script completed successfully!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Run 'npm run dev' to start the CyberStrike Dashboard"
echo "  2. Test API endpoints with the installed tools"
echo "  3. Configure Burp Suite if needed for web testing"

