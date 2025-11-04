'use client';

import { useState, useEffect } from 'react';
import { Fingerprint, Copy, Check, Eye, EyeOff, Download } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FingerprintSpoofer() {
  const [userAgent, setUserAgent] = useState<string>('');
  const [language, setLanguage] = useState<string>('en-US');
  const [timezone, setTimezone] = useState<string>('America/New_York');
  const [screenResolution, setScreenResolution] = useState<string>('1920x1080');
  const [platform, setPlatform] = useState<string>('Win32');
  const [options, setOptions] = useState<{
    userAgent: string[];
    languages: string[];
    timezone: string[];
    screenResolution: string[];
    platform: string[];
  } | null>(null);
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [showScript, setShowScript] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch('/api/fingerprint');
        const data = await response.json();
        if (data.success) {
          setOptions(data.options);
          setUserAgent(data.options.userAgent[0]);
          setLanguage(data.options.languages[0]);
          setTimezone(data.options.timezone[0]);
          setScreenResolution(data.options.screenResolution[0]);
          setPlatform(data.options.platform[0]);
        }
      } catch {
        // Failed to fetch options
      }
    };
    fetchOptions();
  }, []);

  const generateScript = async () => {
    try {
      const response = await fetch('/api/fingerprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAgent,
          language,
          timezone,
          screenResolution,
          platform,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedScript(data.script);
        setShowScript(true);
      }
    } catch {
      alert('Failed to generate fingerprint script');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const injectScript = () => {
    if (!generatedScript) return;
    
    // Create script element and inject
    const script = document.createElement('script');
    script.textContent = generatedScript;
    document.head.appendChild(script);
    
    alert('Fingerprint spoofing script injected! Refresh page to see changes.');
  };

  return (
    <div className="relative glass-strong rounded-2xl p-8 backdrop-blur-strong border-2 border-rose-400/30 shadow-2xl overflow-hidden group hover:border-rose-400/50 transition-all duration-300">
      {/* Animated gradient background - Pastel Kırmızı */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to bottom right, rgba(251, 113, 133, 0.1), transparent 50%, rgba(244, 114, 182, 0.05))',
        }}
      />
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 70% 20%, rgba(251, 113, 133, 0.15), transparent 50%)',
        }}
      />
      
      {/* Glow effect - Pastel Kırmızı */}
      <div 
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to right, rgb(251, 113, 133), rgb(244, 114, 182), rgb(252, 165, 165))',
        }}
      />
      
      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-rose-400 to-transparent animate-scan-line opacity-30" />
      </div>
      
      <div className="relative z-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-rose-400 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-3 rounded-xl bg-gradient-to-br from-rose-400/30 to-rose-400/10 border border-rose-400/50 shadow-lg">
                <Fingerprint className="w-6 h-6 text-rose-400" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-1" style={{
                textShadow: '0 0 15px rgba(251, 113, 133, 0.6)',
              }}>Fingerprint Spoofer</h3>
              <p className="text-sm text-muted-foreground">
                Spoof browser fingerprint to evade tracking
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-400/10 border border-rose-400/30">
            <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            <span className="text-xs font-medium text-rose-400">SPOOFING</span>
          </div>
        </div>

        {/* Configuration */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              User Agent
            </label>
            {options && (
              <select
                value={userAgent}
                onChange={(e) => setUserAgent(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/50"
              >
                {options.userAgent.map((ua: string) => (
                  <option key={ua} value={ua}>
                    {ua.substring(0, 60)}...
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Language
              </label>
              {options && (
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/50"
                >
                  {options.languages.map((lang: string) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Platform
              </label>
              {options && (
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/50"
                >
                  {options.platform.map((plat: string) => (
                    <option key={plat} value={plat}>
                      {plat}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Timezone
              </label>
              {options && (
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/50"
                >
                  {options.timezone.map((tz: string) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Screen Resolution
              </label>
              {options && (
                <select
                  value={screenResolution}
                  onChange={(e) => setScreenResolution(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/50"
                >
                  {options.screenResolution.map((res: string) => (
                    <option key={res} value={res}>
                      {res}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateScript}
          className="w-full mb-6 px-6 py-3 rounded-lg bg-rose-400/20 hover:bg-rose-400/30 border border-rose-400/50 text-rose-400 font-semibold transition-all flex items-center justify-center gap-2"
        >
          <Fingerprint className="w-5 h-5" />
          Generate Spoofing Script
        </button>

        {/* Generated Script */}
        {generatedScript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-foreground">
                Generated Script
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowScript(!showScript)}
                  className="p-2 rounded-lg bg-muted/50 hover:bg-muted/70 border border-border/30 text-foreground transition-colors"
                >
                  {showScript ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => copyToClipboard(generatedScript)}
                  className="p-2 rounded-lg bg-cyber-blue/20 hover:bg-cyber-blue/30 border border-cyber-blue/50 text-cyber-blue transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={injectScript}
                  className="px-3 py-2 rounded-lg bg-neon-green/20 hover:bg-neon-green/30 border border-neon-green/50 text-neon-green font-medium transition-colors text-sm flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Inject
                </button>
              </div>
            </div>
            <pre className="p-4 rounded-lg bg-dark-secondary border border-border/30 text-foreground font-mono text-xs whitespace-pre-wrap break-all overflow-auto max-h-64">
              {showScript ? generatedScript : '•'.repeat(50)}
            </pre>
          </motion.div>
        )}

        {/* Info */}
        <div className="p-3 rounded-lg bg-cyber-blue/10 border border-cyber-blue/30">
          <p className="text-xs text-cyber-blue">
            💡 Inject the generated script into browser console or use a browser extension to apply fingerprint spoofing.
          </p>
        </div>
      </div>
    </div>
  );
}

