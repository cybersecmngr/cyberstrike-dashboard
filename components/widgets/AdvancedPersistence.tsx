'use client';

import { useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdvancedPersistence() {
  const [target, setTarget] = useState('');
  const [method, setMethod] = useState('systemd');
  const [c2Host, setC2Host] = useState('127.0.0.1');
  const [c2Port, setC2Port] = useState('4444');
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<{
    error?: string;
    mock?: boolean;
    persistence_config?: any;
    backdoor_payload?: any;
    stealth_features?: any;
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
      const response = await fetch('/api/persistence/establish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, method, c2Host, c2Port: parseInt(c2Port) }),
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
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-indigo-500/30 shadow-2xl overflow-hidden group hover:border-indigo-500/50 transition-all duration-300">
      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-indigo-500/30 to-indigo-500/10 border border-indigo-500/50 shadow-lg">
                <Lock className="w-5 h-5 text-indigo-500" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5">Persistence Framework</h3>
              <p className="text-xs text-muted-foreground">
                Advanced backdoor & persistence
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
            <label className="block text-xs font-medium text-foreground mb-1.5">Method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm">
              <option value="systemd">Systemd Service</option>
              <option value="cron">Cron Job</option>
              <option value="launchd">LaunchDaemon (macOS)</option>
              <option value="ssh_key">SSH Key</option>
              <option value="web_shell">Web Shell</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">C2 Host</label>
              <input type="text" value={c2Host} onChange={(e) => setC2Host(e.target.value)} placeholder="127.0.0.1" className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">C2 Port</label>
              <input type="text" value={c2Port} onChange={(e) => setC2Port(e.target.value)} placeholder="4444" className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm" />
            </div>
          </div>
          <button onClick={execute} disabled={isExecuting || !target} className="w-full px-4 py-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/50 text-indigo-500 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
            {isExecuting ? <> <Loader2 className="w-4 h-4 animate-spin" /> Executing... </> : <> <Lock className="w-4 h-4" /> Establish Persistence </>}
          </button>
        </div>

        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 p-3 rounded-lg border text-xs ${result.error ? 'bg-red-400/10 border-red-400/50 text-red-400' : 'bg-dark-secondary/50 border-border/30'}`}>
            {result.error ? (
              <div className="font-semibold">✗ Error: {result.error}</div>
            ) : (
              <>
                {result.mock && <div className="text-[10px] text-yellow-400 mb-2">⚠️ Mock data</div>}
                {!result.mock && <div className="text-[10px] text-green-400 mb-2">✓ Real persistence framework</div>}
                {result.summary && (
                  <div className="mb-2">
                    <div className="font-semibold mb-1">Stealth Level:</div>
                    <div className="text-sm font-bold text-indigo-400">{result.summary.stealth_level || 'medium'}</div>
                  </div>
                )}
                {result.persistence_config && result.persistence_config.success && (
                  <div className="mb-2 text-[10px]">
                    <div className="font-semibold">✓ Persistence configured</div>
                    <div className="opacity-80 mt-1">Method: {result.persistence_config.method}</div>
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

