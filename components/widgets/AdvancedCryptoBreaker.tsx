'use client';

import { useState } from 'react';
import { Key, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdvancedCryptoBreaker() {
  const [hashValue, setHashValue] = useState('');
  const [method, setMethod] = useState('dictionary');
  const [isCracking, setIsCracking] = useState(false);
  const [result, setResult] = useState<{
    error?: string;
    mock?: boolean;
    summary?: { cracked?: boolean; password?: string; attempts?: number; time_taken?: number };
    algorithm_identification?: any;
  } | null>(null);

  const crack = async () => {
    if (!hashValue) {
      setResult({ error: 'Please enter a hash value' });
      return;
    }
    
    setIsCracking(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/crypto/crack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hashValue, method }),
      });
      
      const data = await response.json();
      if (data.success) {
        setResult({ ...data.result, mock: data.mock || false });
      } else {
        setResult({ error: data.error || 'Cracking failed' });
      }
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Failed to crack' });
    } finally {
      setIsCracking(false);
    }
  };

  return (
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-yellow-500/30 shadow-2xl overflow-hidden group hover:border-yellow-500/50 transition-all duration-300">
      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-500 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-yellow-500/30 to-yellow-500/10 border border-yellow-500/50 shadow-lg">
                <Key className="w-5 h-5 text-yellow-500" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5">Crypto Breaker</h3>
              <p className="text-xs text-muted-foreground">
                Advanced hash cracking suite
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Hash Value</label>
            <input type="text" value={hashValue} onChange={(e) => setHashValue(e.target.value)} placeholder="5f4dcc3b5aa765d61d8327deb882cf99" className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Cracking Method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm">
              <option value="dictionary">Dictionary Attack</option>
              <option value="brute_force">Brute Force</option>
              <option value="hybrid">Hybrid Attack</option>
              <option value="rainbow_table">Rainbow Table</option>
            </select>
          </div>
          <button onClick={crack} disabled={isCracking || !hashValue} className="w-full px-4 py-2 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 text-yellow-500 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
            {isCracking ? <> <Loader2 className="w-4 h-4 animate-spin" /> Cracking... </> : <> <Key className="w-4 h-4" /> Crack Hash </>}
          </button>
        </div>

        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 p-3 rounded-lg border text-xs ${result.error ? 'bg-red-400/10 border-red-400/50 text-red-400' : 'bg-dark-secondary/50 border-border/30'}`}>
            {result.error ? (
              <div className="font-semibold">✗ Error: {result.error}</div>
            ) : (
              <>
                {result.mock && <div className="text-[10px] text-yellow-400 mb-2">⚠️ Mock data</div>}
                {!result.mock && <div className="text-[10px] text-green-400 mb-2">✓ Real hash cracking</div>}
                {result.summary && (
                  <div className="mb-2">
                    {result.summary.cracked ? (
                      <>
                        <div className="font-semibold mb-1 text-green-400">✓ Hash Cracked!</div>
                        <div className="text-sm font-bold text-green-400">Password: {result.summary.password}</div>
                        <div className="text-[10px] opacity-80 mt-1">Attempts: {result.summary.attempts} | Time: {result.summary.time_taken?.toFixed(3)}s</div>
                      </>
                    ) : (
                      <>
                        <div className="font-semibold mb-1">Hash Not Cracked</div>
                        <div className="text-[10px] opacity-80">Attempts: {result.summary.attempts || 0}</div>
                      </>
                    )}
                  </div>
                )}
                {result.algorithm_identification && (
                  <div className="text-[10px] opacity-80">
                    Algorithm: {result.algorithm_identification.identified_algorithm || 'unknown'}
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

