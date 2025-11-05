'use client';

import { useState } from 'react';
import { Globe, Shield, Loader2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WebAppScanner() {
  const [url, setUrl] = useState('');
  const [scanTypes, setScanTypes] = useState<string[]>(['sqli', 'xss', 'rce', 'lfi', 'csrf', 'headers']);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<{
    error?: string;
    mock?: boolean;
    vulnerabilities?: Array<{
      vulnerability: string;
      severity: string;
      parameter?: string;
      payload?: string;
      statusCode?: number;
      evidence?: string;
      url?: string;
    }>;
    summary?: {
      critical: number;
      high: number;
      medium: number;
      low: number;
      total: number;
    };
    message?: string;
  } | null>(null);

  const scanTypesList = [
    { value: 'sqli', label: 'SQL Injection' },
    { value: 'xss', label: 'Cross-Site Scripting (XSS)' },
    { value: 'rce', label: 'Remote Code Execution (RCE)' },
    { value: 'lfi', label: 'Local/Remote File Inclusion' },
    { value: 'xxe', label: 'XML External Entity (XXE)' },
    { value: 'ssrf', label: 'Server-Side Request Forgery (SSRF)' },
    { value: 'csrf', label: 'CSRF Protection' },
    { value: 'headers', label: 'Security Headers' },
  ];

  const handleScanTypeToggle = (value: string) => {
    setScanTypes(prev => 
      prev.includes(value) 
        ? prev.filter(t => t !== value)
        : [...prev, value]
    );
  };

  const scanWebApp = async () => {
    if (!url) {
      setResult({ error: 'Please enter a URL' });
      return;
    }
    
    setIsScanning(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/webapp/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, scanTypes }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult({
          ...data.result,
          mock: data.mock || false
        });
      } else {
        setResult({
          error: data.error || 'Scan failed. Please try again.'
        });
      }
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : 'Failed to scan web application. Please try again.'
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-red-400/30 shadow-2xl overflow-hidden group hover:border-red-400/50 transition-all duration-300">
      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-red-400 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-red-400/30 to-red-400/10 border border-red-400/50 shadow-lg">
                <Globe className="w-5 h-5 text-red-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5">Web Application Scanner</h3>
              <p className="text-xs text-muted-foreground">
                SQLi, XSS, RCE, LFI/RFI, XXE, SSRF, CSRF detection
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Target URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/page?id=1"
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Scan Types
            </label>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              {scanTypesList.map((type) => (
                <label key={type.value} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scanTypes.includes(type.value)}
                    onChange={() => handleScanTypeToggle(type.value)}
                    className="w-3 h-3 rounded border-border/50"
                  />
                  <span>{type.label}</span>
                </label>
              ))}
            </div>
          </div>
          <button
            onClick={scanWebApp}
            disabled={isScanning || !url}
            className="w-full px-4 py-2 rounded-lg bg-red-400/20 hover:bg-red-400/30 border border-red-400/50 text-red-400 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Scan Web Application
              </>
            )}
          </button>
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-3 rounded-lg border text-xs ${
              result.error
                ? 'bg-red-400/10 border-red-400/50 text-red-400'
                : 'bg-dark-secondary/50 border-border/30'
            }`}
          >
            {result.error ? (
              <div className="font-semibold">✗ Error: {result.error}</div>
            ) : (
              <>
                {result.mock && (
                  <div className="text-[10px] text-yellow-400 mb-2">⚠️ Mock data (Install requests library: pip3 install requests)</div>
                )}
                {!result.mock && (
                  <div className="text-[10px] text-green-400 mb-2">✓ Real web application scan</div>
                )}
                {result.summary && (
                  <div className="mb-2">
                    <div className="font-semibold mb-1">Scan Summary:</div>
                    <div className="flex gap-3 text-[10px]">
                      {result.summary.critical > 0 && (
                        <span className="text-red-400">Critical: {result.summary.critical}</span>
                      )}
                      {result.summary.high > 0 && (
                        <span className="text-orange-400">High: {result.summary.high}</span>
                      )}
                      {result.summary.medium > 0 && (
                        <span className="text-yellow-400">Medium: {result.summary.medium}</span>
                      )}
                      {result.summary.low > 0 && (
                        <span className="text-blue-400">Low: {result.summary.low}</span>
                      )}
                      <span className="opacity-70">Total: {result.summary.total}</span>
                    </div>
                  </div>
                )}
                {result.vulnerabilities && result.vulnerabilities.length > 0 && (
                  <div className="mb-2">
                    <div className="font-semibold mb-1 text-red-400">⚠️ Vulnerabilities Found:</div>
                    <div className="text-[10px] space-y-1 max-h-60 overflow-y-auto">
                      {result.vulnerabilities.map((vuln, idx) => (
                        <div key={idx} className={`p-2 rounded border ${
                          vuln.severity === 'critical' ? 'bg-red-400/10 border-red-400/50' :
                          vuln.severity === 'high' ? 'bg-orange-400/10 border-orange-400/50' :
                          'bg-yellow-400/10 border-yellow-400/50'
                        }`}>
                          <div className="font-semibold">{vuln.vulnerability}</div>
                          <div className="text-[9px] opacity-80 mt-1">
                            {vuln.parameter && <div>Parameter: {vuln.parameter}</div>}
                            {vuln.payload && <div>Payload: <code className="break-all">{vuln.payload}</code></div>}
                            {vuln.evidence && <div>Evidence: {vuln.evidence}</div>}
                            {vuln.statusCode && <div>Status: {vuln.statusCode}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {result.message && (
                  <div className="text-[10px] opacity-80 mt-2">{result.message}</div>
                )}
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

