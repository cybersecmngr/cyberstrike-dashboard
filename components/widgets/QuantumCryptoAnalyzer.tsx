'use client';

import { useState } from 'react';
import { Atom, Shield, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function QuantumCryptoAnalyzer() {
  const [target, setTarget] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    error?: string;
    mock?: boolean;
    quantumVulnerabilities?: Array<{
      algorithm?: string;
      quantum_resistant?: boolean;
      vulnerabilities?: Array<{
        attack?: string;
        severity?: string;
        description?: string;
      }>;
    }>;
    summary?: { critical: number; high: number; medium: number; total: number };
  } | null>(null);

  const analyzeQuantum = async () => {
    if (!target) {
      setResult({ error: 'Please enter a target' });
      return;
    }
    
    setIsAnalyzing(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/quantum/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target }),
      });
      
      const data = await response.json();
      if (data.success) {
        setResult({ ...data.result, mock: data.mock || false });
      } else {
        setResult({ error: data.error || 'Analysis failed' });
      }
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Failed to analyze' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-indigo-500/30 shadow-2xl overflow-hidden group hover:border-indigo-500/50 transition-all duration-300">
      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-indigo-500/30 to-indigo-500/10 border border-indigo-500/50 shadow-lg">
                <Atom className="w-5 h-5 text-indigo-500" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5">Quantum Crypto Analyzer</h3>
              <p className="text-xs text-muted-foreground">
                Post-quantum cryptography testing
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Target System
            </label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="System name or crypto config"
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm"
            />
          </div>
          <button
            onClick={analyzeQuantum}
            disabled={isAnalyzing || !target}
            className="w-full px-4 py-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/50 text-indigo-500 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Analyze Quantum Resistance
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
                  <div className="text-[10px] text-green-400 mb-2">✓ Real quantum analysis</div>
                )}
                {result.summary && (
                  <div className="mb-2">
                    <div className="font-semibold mb-1">Vulnerabilities:</div>
                    <div className="flex gap-3 text-[10px]">
                      {result.summary.critical > 0 && <span className="text-red-400">Critical: {result.summary.critical}</span>}
                      {result.summary.high > 0 && <span className="text-orange-400">High: {result.summary.high}</span>}
                      {result.summary.medium > 0 && <span className="text-yellow-400">Medium: {result.summary.medium}</span>}
                      <span className="opacity-70">Total: {result.summary.total}</span>
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

