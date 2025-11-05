'use client';

import { useState } from 'react';
import { Activity, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIAdaptiveFuzzer() {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('80');
  const [protocol, setProtocol] = useState('http');
  const [iterations, setIterations] = useState('50');
  const [isFuzzing, setIsFuzzing] = useState(false);
  const [result, setResult] = useState<{
    error?: string;
    mock?: boolean;
    fuzzing_results?: Array<any>;
    vulnerabilities_found?: Array<any>;
    summary?: any;
  } | null>(null);

  const fuzz = async () => {
    if (!host) {
      setResult({ error: 'Please enter a host' });
      return;
    }
    
    setIsFuzzing(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/ai/fuzzer/adaptive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host, port: parseInt(port), protocol, iterations: parseInt(iterations) }),
      });
      
      const data = await response.json();
      if (data.success) {
        setResult({ ...data.result, mock: data.mock || false });
      } else {
        setResult({ error: data.error || 'Fuzzing failed' });
      }
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Failed to fuzz' });
    } finally {
      setIsFuzzing(false);
    }
  };

  return (
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-rose-500/30 shadow-2xl overflow-hidden group hover:border-rose-500/50 transition-all duration-300">
      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-rose-500 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-rose-500/30 to-rose-500/10 border border-rose-500/50 shadow-lg">
                <Activity className="w-5 h-5 text-rose-500" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5">AI Adaptive Fuzzer</h3>
              <p className="text-xs text-muted-foreground">
                ML-powered adaptive fuzzing
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Host</label>
              <input type="text" value={host} onChange={(e) => setHost(e.target.value)} placeholder="127.0.0.1" className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Port</label>
              <input type="text" value={port} onChange={(e) => setPort(e.target.value)} placeholder="80" className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Protocol</label>
              <select value={protocol} onChange={(e) => setProtocol(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm">
                <option value="http">HTTP</option>
                <option value="https">HTTPS</option>
                <option value="tcp">TCP</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Iterations</label>
              <input type="number" value={iterations} onChange={(e) => setIterations(e.target.value)} placeholder="50" className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm" />
            </div>
          </div>
          <button onClick={fuzz} disabled={isFuzzing || !host} className="w-full px-4 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-500 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
            {isFuzzing ? <> <Loader2 className="w-4 h-4 animate-spin" /> Fuzzing... </> : <> <Activity className="w-4 h-4" /> Start Fuzzing </>}
          </button>
        </div>

        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 p-3 rounded-lg border text-xs ${result.error ? 'bg-red-400/10 border-red-400/50 text-red-400' : 'bg-dark-secondary/50 border-border/30'}`}>
            {result.error ? (
              <div className="font-semibold">✗ Error: {result.error}</div>
            ) : (
              <>
                {result.mock && <div className="text-[10px] text-yellow-400 mb-2">⚠️ Mock data</div>}
                {!result.mock && <div className="text-[10px] text-green-400 mb-2">✓ Real adaptive fuzzing</div>}
                {result.summary && (
                  <div className="mb-2">
                    <div className="font-semibold mb-1">Fuzzing Results:</div>
                    <div className="text-[10px] space-y-1">
                      <div>Requests: {result.summary.total_requests || 0}</div>
                      <div>Crashes: <span className="text-red-400">{result.summary.crashes_detected || 0}</span></div>
                      <div>Vulnerabilities: <span className="text-orange-400">{result.summary.vulnerabilities_found || 0}</span></div>
                      <div>Success Rate: {result.summary.success_rate?.toFixed(1) || 0}%</div>
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

