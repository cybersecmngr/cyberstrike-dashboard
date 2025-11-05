'use client';

import { useState } from 'react';
import { Lock, Shield, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CryptoSecurityScanner() {
  const [hostname, setHostname] = useState('');
  const [port, setPort] = useState('443');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<{
    error?: string;
    mock?: boolean;
    certificate?: any;
    vulnerabilities?: Array<{ type: string; severity: string; details: string }>;
    summary?: { critical: number; high: number; medium: number; total: number };
  } | null>(null);

  const scanCrypto = async () => {
    if (!hostname) {
      setResult({ error: 'Please enter a hostname' });
      return;
    }
    
    setIsScanning(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/crypto/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostname, port: parseInt(port) || 443 }),
      });
      
      const data = await response.json();
      if (data.success) {
        setResult({ ...data.result, mock: data.mock || false });
      } else {
        setResult({ error: data.error || 'Scan failed' });
      }
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Failed to scan' });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-purple-400/30 shadow-2xl overflow-hidden group hover:border-purple-400/50 transition-all duration-300">
      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-400 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-purple-400/30 to-purple-400/10 border border-purple-400/50 shadow-lg">
                <Lock className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5">Crypto Security Scanner</h3>
              <p className="text-xs text-muted-foreground">
                TLS/SSL, weak ciphers, certificate analysis
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Hostname
            </label>
            <input
              type="text"
              value={hostname}
              onChange={(e) => setHostname(e.target.value)}
              placeholder="example.com"
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Port
            </label>
            <input
              type="number"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="443"
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm"
            />
          </div>
          <button
            onClick={scanCrypto}
            disabled={isScanning || !hostname}
            className="w-full px-4 py-2 rounded-lg bg-purple-400/20 hover:bg-purple-400/30 border border-purple-400/50 text-purple-400 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Scan Cryptographic Security
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
                  <div className="text-[10px] text-yellow-400 mb-2">⚠️ Mock data</div>
                )}
                {!result.mock && (
                  <div className="text-[10px] text-green-400 mb-2">✓ Real cryptographic scan</div>
                )}
                {result.summary && (
                  <div className="mb-2">
                    <div className="font-semibold mb-1">Summary:</div>
                    <div className="flex gap-3 text-[10px]">
                      {result.summary.critical > 0 && <span className="text-red-400">Critical: {result.summary.critical}</span>}
                      {result.summary.high > 0 && <span className="text-orange-400">High: {result.summary.high}</span>}
                      {result.summary.medium > 0 && <span className="text-yellow-400">Medium: {result.summary.medium}</span>}
                      <span className="opacity-70">Total: {result.summary.total}</span>
                    </div>
                  </div>
                )}
                {result.vulnerabilities && result.vulnerabilities.length > 0 && (
                  <div className="mb-2">
                    <div className="font-semibold mb-1 text-red-400">⚠️ Vulnerabilities:</div>
                    <div className="text-[10px] space-y-1 max-h-40 overflow-y-auto">
                      {result.vulnerabilities.map((vuln, idx) => (
                        <div key={idx} className={`p-2 rounded border ${
                          vuln.severity === 'critical' ? 'bg-red-400/10 border-red-400/50' :
                          vuln.severity === 'high' ? 'bg-orange-400/10 border-orange-400/50' :
                          'bg-yellow-400/10 border-yellow-400/50'
                        }`}>
                          <div className="font-semibold">{vuln.type}</div>
                          <div className="text-[9px] opacity-80 mt-1">{vuln.details}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

