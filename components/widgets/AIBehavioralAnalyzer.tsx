'use client';

import { useState } from 'react';
import { User, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIBehavioralAnalyzer() {
  const [target, setTarget] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    error?: string;
    mock?: boolean;
    behavioral_patterns?: any;
    bypass_techniques?: any;
    summary?: any;
  } | null>(null);

  const analyze = async () => {
    if (!target) {
      setResult({ error: 'Please enter a target' });
      return;
    }
    
    setIsAnalyzing(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/ai/behavioral/analyze', {
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
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-emerald-500/30 shadow-2xl overflow-hidden group hover:border-emerald-500/50 transition-all duration-300">
      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-emerald-500/30 to-emerald-500/10 border border-emerald-500/50 shadow-lg">
                <User className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5">AI Behavioral Analyzer</h3>
              <p className="text-xs text-muted-foreground">
                Pattern analysis & bypass
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Target</label>
            <input type="text" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="target.com" className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm" />
          </div>
          <button onClick={analyze} disabled={isAnalyzing || !target} className="w-full px-4 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-500 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
            {isAnalyzing ? <> <Loader2 className="w-4 h-4 animate-spin" /> Analyzing... </> : <> <User className="w-4 h-4" /> Analyze Behavior </>}
          </button>
        </div>

        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 p-3 rounded-lg border text-xs ${result.error ? 'bg-red-400/10 border-red-400/50 text-red-400' : 'bg-dark-secondary/50 border-border/30'}`}>
            {result.error ? (
              <div className="font-semibold">✗ Error: {result.error}</div>
            ) : (
              <>
                {result.mock && <div className="text-[10px] text-yellow-400 mb-2">⚠️ Mock data</div>}
                {!result.mock && <div className="text-[10px] text-green-400 mb-2">✓ Real behavioral analysis</div>}
                {result.summary && (
                  <div className="mb-2">
                    <div className="font-semibold mb-1">Human Score:</div>
                    <div className="text-sm font-bold text-emerald-400">{(result.summary.human_score * 100).toFixed(1) || 0}%</div>
                    <div className="text-[10px] opacity-80 mt-1">Bypass Effectiveness: {(result.summary.bypass_effectiveness * 100).toFixed(1) || 0}%</div>
                  </div>
                )}
                {result.bypass_techniques && Object.keys(result.bypass_techniques).length > 0 && (
                  <div className="mb-2 text-[10px]">
                    <div className="font-semibold mb-1">Bypass Techniques:</div>
                    <div className="space-y-1">
                      {Object.entries(result.bypass_techniques).slice(0, 3).map(([key, val]: [string, any], idx) => (
                        <div key={idx} className="p-1 bg-dark-secondary/30 rounded">
                          <div className="font-semibold">{key.replace('_', ' ')}</div>
                          <div className="opacity-80 text-[9px]">Effectiveness: {(val.effectiveness * 100).toFixed(0)}%</div>
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

