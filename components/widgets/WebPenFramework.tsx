'use client';

import { useState } from 'react';
import { Globe, Shield, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WebPenFramework() {
  const [targetUrl, setTargetUrl] = useState('');
  const [scanDepth, setScanDepth] = useState('medium');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<{
    error?: string;
    mock?: boolean;
    endpoints_discovered?: Array<any>;
    vulnerabilities?: Array<any>;
    summary?: { critical: number; high: number; medium: number; low: number; total: number };
    risk_score?: number;
  } | null>(null);

  const scanWebApp = async () => {
    if (!targetUrl) {
      setResult({ error: 'Please enter a target URL' });
      return;
    }
    
    setIsScanning(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/webpen/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl, scanDepth }),
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
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-red-500/30 shadow-2xl overflow-hidden group hover:border-red-500/50 transition-all duration-300">
      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-red-500/30 to-red-500/10 border border-red-500/50 shadow-lg">
                <Globe className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5">Web Pen Framework</h3>
              <p className="text-xs text-muted-foreground">
                Advanced automated web app testing
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
              placeholder="https://target.com/page?id=1"
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Scan Depth
            </label>
            <select
              value={scanDepth}
              onChange={(e) => setScanDepth(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <button
            onClick={scanWebApp}
            disabled={isScanning || !targetUrl}
            className="w-full px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-500 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Run Penetration Test
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
                  <div className="text-[10px] text-green-400 mb-2">✓ Real penetration test</div>
                )}
                {result.risk_score !== undefined && (
                  <div className="mb-2">
                    <div className="font-semibold mb-1">Risk Score:</div>
                    <div className="text-lg font-bold text-red-400">{result.risk_score}/100</div>
                  </div>
                )}
                {result.summary && (
                  <div className="mb-2">
                    <div className="font-semibold mb-1">Vulnerabilities:</div>
                    <div className="flex gap-3 text-[10px]">
                      {result.summary.critical > 0 && <span className="text-red-400">Critical: {result.summary.critical}</span>}
                      {result.summary.high > 0 && <span className="text-orange-400">High: {result.summary.high}</span>}
                      {result.summary.medium > 0 && <span className="text-yellow-400">Medium: {result.summary.medium}</span>}
                      {result.summary.low > 0 && <span className="text-blue-400">Low: {result.summary.low}</span>}
                      <span className="opacity-70">Total: {result.summary.total}</span>
                    </div>
                  </div>
                )}
                {result.endpoints_discovered && result.endpoints_discovered.length > 0 && (
                  <div className="mb-2">
                    <div className="font-semibold mb-1">Endpoints ({result.endpoints_discovered.length}):</div>
                    <div className="text-[10px] space-y-1 max-h-32 overflow-y-auto">
                      {result.endpoints_discovered.map((ep: any, idx: number) => (
                        <div key={idx} className="p-1 bg-dark-secondary/30 rounded">
                          <div className="font-mono break-all">{ep.endpoint}</div>
                          <div className="text-[9px] opacity-70">Status: {ep.status_code}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {result.vulnerabilities && result.vulnerabilities.length > 0 && (
                  <div className="mb-2">
                    <div className="font-semibold mb-1 text-red-400">⚠️ Vulnerabilities:</div>
                    <div className="text-[10px] space-y-1 max-h-40 overflow-y-auto">
                      {result.vulnerabilities.map((vuln: any, idx: number) => (
                        <div key={idx} className={`p-2 rounded border ${
                          vuln.severity === 'critical' ? 'bg-red-400/10 border-red-400/50' :
                          vuln.severity === 'high' ? 'bg-orange-400/10 border-orange-400/50' :
                          'bg-yellow-400/10 border-yellow-400/50'
                        }`}>
                          <div className="font-semibold">{vuln.vulnerability}</div>
                          <div className="text-[9px] opacity-80 mt-1">
                            {vuln.parameter && <div>Parameter: {vuln.parameter}</div>}
                            {vuln.evidence && <div>{vuln.evidence}</div>}
                          </div>
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

