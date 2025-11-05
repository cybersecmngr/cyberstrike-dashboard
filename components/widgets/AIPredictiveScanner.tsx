'use client';

import { useState } from 'react';
import { Scan, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIPredictiveScanner() {
  const [target, setTarget] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<{
    error?: string;
    mock?: boolean;
    predictions?: any;
    risk_forecast?: any;
    summary?: any;
  } | null>(null);

  const scan = async () => {
    if (!target) {
      setResult({ error: 'Please enter a target URL' });
      return;
    }
    
    setIsScanning(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/ai/predictive/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target }),
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
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-fuchsia-500/30 shadow-2xl overflow-hidden group hover:border-fuchsia-500/50 transition-all duration-300">
      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-fuchsia-500 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-fuchsia-500/30 to-fuchsia-500/10 border border-fuchsia-500/50 shadow-lg">
                <Scan className="w-5 h-5 text-fuchsia-500" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5">AI Predictive Scanner</h3>
              <p className="text-xs text-muted-foreground">
                Future vulnerability prediction
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Target URL</label>
            <input type="url" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="https://target.com?id=1" className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm" />
          </div>
          <button onClick={scan} disabled={isScanning || !target} className="w-full px-4 py-2 rounded-lg bg-fuchsia-500/20 hover:bg-fuchsia-500/30 border border-fuchsia-500/50 text-fuchsia-500 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
            {isScanning ? <> <Loader2 className="w-4 h-4 animate-spin" /> Scanning... </> : <> <Scan className="w-4 h-4" /> Predictive Scan </>}
          </button>
        </div>

        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 p-3 rounded-lg border text-xs ${result.error ? 'bg-red-400/10 border-red-400/50 text-red-400' : 'bg-dark-secondary/50 border-border/30'}`}>
            {result.error ? (
              <div className="font-semibold">✗ Error: {result.error}</div>
            ) : (
              <>
                {result.mock && <div className="text-[10px] text-yellow-400 mb-2">⚠️ Mock data</div>}
                {!result.mock && <div className="text-[10px] text-green-400 mb-2">✓ Real predictive scanning</div>}
                {result.summary && (
                  <div className="mb-2">
                    <div className="font-semibold mb-1">Predictions:</div>
                    <div className="text-sm font-bold text-fuchsia-400">{result.summary.predicted_vulnerabilities || 0} vulnerabilities</div>
                    <div className={`text-[10px] mt-1 ${
                      result.summary.overall_risk === 'critical' ? 'text-red-400' :
                      result.summary.overall_risk === 'high' ? 'text-orange-400' :
                      result.summary.overall_risk === 'medium' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      Risk: {result.summary.overall_risk?.toUpperCase() || 'LOW'} | Confidence: {(result.summary.confidence * 100).toFixed(1) || 0}%
                    </div>
                  </div>
                )}
                {result.risk_forecast && (
                  <div className="mb-2 text-[10px]">
                    <div className="font-semibold mb-1">Risk Forecast:</div>
                    <div className="opacity-80">
                      <div>Immediate: {result.risk_forecast.immediate_risk}</div>
                      <div>Future: {result.risk_forecast.future_risk}</div>
                      <div>Trend: {result.risk_forecast.trend}</div>
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

