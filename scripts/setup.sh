#!/bin/bash
# Setup script for Python dependencies

echo "🔧 Setting up Python dependencies for CyberStrike Dashboard..."

# Check if python3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed. Please install Python3 first."
    exit 1
fi

echo "✅ Python3 found: $(python3 --version)"

# Install Python dependencies
echo "📦 Installing Python packages..."
pip3 install -r requirements.txt

# Make scripts executable
echo "🔐 Making scripts executable..."
chmod +x scripts/*.py

echo "✅ Setup complete!"
echo ""
echo "Optional tools for better results:"
echo "  - sublist3r: pip3 install sublist3r"
echo "  - amass: brew install amass (macOS) or download from OWASP"
echo "  - nmap: brew install nmap (macOS)"
echo "  - nikto: brew install nikto (macOS)"
echo "  - dig: Usually pre-installed on macOS/Linux"

