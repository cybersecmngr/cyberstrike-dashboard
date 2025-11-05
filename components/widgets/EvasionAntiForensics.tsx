'use client';

import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EvasionAntiForensics() {
  const [target, setTarget] = useState('');
  const [evasionLevel, setEvasionLevel] = useState('high');
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<{
    error?: string;
    mock?: boolean;
    timestomping?: any;
    log_manipulation?: any;
    artifact_removal?: any;
    summary?: any;
  } | null>(null);

  const execute = async () => {
    if (!target) {
      setResult({ error: 'Please enter a target' });
      return;
    }
    
    setIsExecuting(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/evasion/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, evasionLevel }),
      });
      
      const data = await response.json();
      if (data.success) {
        setResult({ ...data.result, mock: data.mock || false });
      } else {
        setResult({ error: data.error || 'Execution failed' });
      }
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Failed to execute' });
    } finally {
      setIsExecuting(false);
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
                <EyeOff className="w-5 h-5 text-pink-500" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5">Evasion & Anti-Forensics</h3>
              <p className="text-xs text-muted-foreground">
                Advanced evasion techniques
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Target</label>
            <input type="text" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="target.com" className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Evasion Level</label>
            <select value={evasionLevel} onChange={(e) => setEvasionLevel(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <button onClick={execute} disabled={isExecuting || !target} className="w-full px-4 py-2 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/50 text-pink-500 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
            {isExecuting ? <> <Loader2 className="w-4 h-4 animate-spin" /> Executing... </> : <> <Eye className="w-4 h-4" /> Execute Evasion </>}
          </button>
        </div>

        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 p-3 rounded-lg border text-xs ${result.error ? 'bg-red-400/10 border-red-400/50 text-red-400' : 'bg-dark-secondary/50 border-border/30'}`}>
            {result.error ? (
              <div className="font-semibold">✗ Error: {result.error}</div>
            ) : (
              <>
                {result.mock && <div className="text-[10px] text-yellow-400 mb-2">⚠️ Mock data</div>}
                {!result.mock && <div className="text-[10px] text-green-400 mb-2">✓ Real evasion framework</div>}
                {result.summary && (
                  <div className="mb-2">
                    <div className="font-semibold mb-1">Stealth Score:</div>
                    <div className="text-sm font-bold text-pink-400">{result.summary.stealth_score || 0}/100</div>
                    <div className="text-[10px] opacity-80 mt-1">Detection Difficulty: {result.summary.detection_difficulty || 'medium'}</div>
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

