'use client';

import { useState } from 'react';
import { Fingerprint, Shield, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BehavioralBiometricBypass() {
  const [targetUrl, setTargetUrl] = useState('');
  const [isBypassing, setIsBypassing] = useState(false);
  const [result, setResult] = useState<{
    error?: string;
    mock?: boolean;
    successRate?: number;
    spoofCapabilities?: Array<any>;
  } | null>(null);

  const bypassBiometrics = async () => {
    if (!targetUrl) {
      setResult({ error: 'Please enter a target URL' });
      return;
    }
    
    setIsBypassing(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/behavioral/bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl }),
      });
      
      const data = await response.json();
      if (data.success) {
        setResult({ ...data.result, mock: data.mock || false });
      } else {
        setResult({ error: data.error || 'Bypass failed' });
      }
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Failed to bypass' });
    } finally {
      setIsBypassing(false);
    }
  };

  return (
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-pink-500/30 shadow-2xl overflow-hidden group hover:border-pink-500/50 transition-all duration-300">
      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-pink-500 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-pink-500/30 to-pink-500/10 border border-pink-500/50 shadow-lg">
                <Fingerprint className="w-5 h-5 text-pink-500" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5">Behavioral Biometric Bypass</h3>
              <p className="text-xs text-muted-foreground">
                Mouse/keyboard pattern spoofing
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
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://target.com/login"
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm"
            />
          </div>
          <button
            onClick={bypassBiometrics}
            disabled={isBypassing || !targetUrl}
            className="w-full px-4 py-2 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/50 text-pink-500 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isBypassing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Bypassing...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Bypass Biometrics
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
                  <div className="text-[10px] text-green-400 mb-2">✓ Real biometric bypass</div>
                )}
                {result.successRate !== undefined && (
                  <div className="mb-2">
                    <div className="font-semibold mb-1">Bypass Success Rate:</div>
                    <div className="text-lg font-bold text-green-400">{result.successRate}%</div>
                  </div>
                )}
                {result.spoofCapabilities && result.spoofCapabilities.length > 0 && (
                  <div className="mb-2">
                    <div className="font-semibold mb-1">Capabilities:</div>
                    <div className="text-[10px] space-y-1 max-h-40 overflow-y-auto">
                      {result.spoofCapabilities.map((cap: any, idx: number) => (
                        <div key={idx} className="p-1.5 bg-dark-secondary/30 rounded">
                          <div className="font-semibold">{cap.type}</div>
                          <div className="text-[9px] opacity-80">Bypass Rate: {cap.bypass_rate}</div>
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

