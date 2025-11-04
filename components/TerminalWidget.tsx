'use client';

import { useEffect, useState } from 'react';
import { Terminal, Copy, Check } from 'lucide-react';

const exploitCode = `#!/usr/bin/env python3
import socket
import struct
import time

def exploit_cve_2024_1234(target_ip, target_port):
    """
    Proof of Concept Exploit
    CVE-2024-1234 - Buffer Overflow
    """
    payload = b'A' * 1024 + struct.pack('<L', 0x41414141)
    
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect((target_ip, target_port))
    
    print(f"[+] Connected to {target_ip}:{target_port}")
    print("[+] Sending payload...")
    sock.send(payload)
    
    response = sock.recv(1024)
    print(f"[+] Response: {response.hex()}")
    
    sock.close()
    return True

if __name__ == "__main__":
    exploit_cve_2024_1234("192.168.1.100", 8080)`;

export default function TerminalWidget() {
  const [displayedCode, setDisplayedCode] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isTyping) return;

    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex < exploitCode.length) {
        setDisplayedCode(exploitCode.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, 20); // Typing speed

    return () => clearInterval(typingInterval);
  }, [isTyping]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(exploitCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple syntax highlighting
  const highlightCode = (code: string) => {
    const lines = code.split('\n');
    return lines.map((line, index) => {
      // Keywords
      let highlighted = line
        .replace(/(import|def|if|__name__|__main__|return|True|False|print)/g, 
          '<span class="text-cyber-blue">$1</span>')
        .replace(/(#.*)/g, '<span class="text-muted-foreground">$1</span>')
        .replace(/(["'].*?["'])/g, '<span class="text-neon-green">$1</span>')
        .replace(/(\d+)/g, '<span class="text-danger-red">$1</span>')
        .replace(/(f"[^"]*")/g, '<span class="text-neon-green">$1</span>');

      return (
        <div key={index} className="font-mono text-sm leading-relaxed">
          <span className="text-muted-foreground select-none mr-4">
            {String(index + 1).padStart(3, '0')}
          </span>
          <span dangerouslySetInnerHTML={{ __html: highlighted }} />
          {index === lines.length - 1 && isTyping && (
            <span className="inline-block w-2 h-4 bg-neon-green ml-1 animate-pulse" />
          )}
        </div>
      );
    });
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Terminal header */}
      <div className="bg-dark-secondary border-b border-border/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-neon-green" />
          <span className="text-sm font-medium text-foreground">exploit.py</span>
          <span className="text-xs text-muted-foreground">Python 3.11</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-muted transition-colors text-xs text-muted-foreground hover:text-foreground"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-neon-green" />
              <span className="text-neon-green">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code area */}
      <div 
        className="relative p-4 bg-[#0d1117] font-mono text-sm overflow-auto max-h-96"
        style={{
          background: 'linear-gradient(135deg, #0a0a0b 0%, #0d1117 100%)',
        }}
      >
        {/* Matrix-style background effect */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 65, 0.03) 2px, rgba(0, 255, 65, 0.03) 4px)',
          }} />
        </div>

        {/* Code content */}
        <div className="relative z-10">
          <pre className="text-[#c9d1d9]">
            <code>{highlightCode(displayedCode)}</code>
          </pre>
        </div>

        {/* Scan line effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-full h-px bg-neon-green/20 animate-scan-line" />
        </div>
      </div>

      {/* Terminal footer */}
      <div className="bg-dark-secondary border-t border-border/50 px-4 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4 text-muted-foreground">
          <span>Ln {displayedCode.split('\n').length}, Col {displayedCode.length % 80}</span>
          <span>UTF-8</span>
        </div>
        {isTyping && (
          <div className="flex items-center gap-2 text-neon-green">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <span>Typing...</span>
          </div>
        )}
      </div>
    </div>
  );
}

