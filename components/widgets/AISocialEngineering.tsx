'use client';

import { useState } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AISocialEngineering() {
  const [target, setTarget] = useState('');
  const [attackType, setAttackType] = useState('phishing');
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<{
    error?: string;
    mock?: boolean;
    phishing_email?: any;
    pretexting_scenario?: any;
    summary?: any;
  } | null>(null);

  const execute = async () => {
    if (!target) {
      setResult({ error: 'Please enter target email' });
      return;
    }
    
    setIsExecuting(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/social/engineer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, attackType }),
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
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-cyan-500/30 shadow-2xl overflow-hidden group hover:border-cyan-500/50 transition-all duration-300">
      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-cyan-500/30 to-cyan-500/10 border border-cyan-500/50 shadow-lg">
                <Users className="w-5 h-5 text-cyan-500" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5">AI Social Engineering</h3>
              <p className="text-xs text-muted-foreground">
                AI-powered social engineering
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Target Email</label>
            <input type="email" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="target@example.com" className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Attack Type</label>
            <select value={attackType} onChange={(e) => setAttackType(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm">
              <option value="phishing">Phishing Email</option>
              <option value="pretexting">Pretexting</option>
              <option value="baiting">Baiting</option>
            </select>
          </div>
          <button onClick={execute} disabled={isExecuting || !target} className="w-full px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-500 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
            {isExecuting ? <> <Loader2 className="w-4 h-4 animate-spin" /> Generating... </> : <> <Users className="w-4 h-4" /> Generate Attack </>}
          </button>
        </div>

        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 p-3 rounded-lg border text-xs ${result.error ? 'bg-red-400/10 border-red-400/50 text-red-400' : 'bg-dark-secondary/50 border-border/30'}`}>
            {result.error ? (
              <div className="font-semibold">✗ Error: {result.error}</div>
            ) : (
              <>
                {result.mock && <div className="text-[10px] text-yellow-400 mb-2">⚠️ Mock data</div>}
                {!result.mock && <div className="text-[10px] text-green-400 mb-2">✓ Real AI social engineering</div>}
                {result.summary && (
                  <div className="mb-2">
                    <div className="font-semibold mb-1">Success Rate:</div>
                    <div className="text-sm font-bold text-cyan-400">{result.summary.estimated_success_rate?.toFixed(1) || 0}%</div>
                  </div>
                )}
                {result.phishing_email && (
                  <div className="mb-2 text-[10px]">
                    <div className="font-semibold">Phishing Email:</div>
                    <div className="opacity-80 mt-1">Subject: {result.phishing_email.subject}</div>
                    <div className="opacity-80">Trigger: {result.phishing_email.psychological_trigger}</div>
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

