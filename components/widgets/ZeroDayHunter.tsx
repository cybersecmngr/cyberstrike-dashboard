'use client';

import { useState } from 'react';
import { Target, Zap, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ZeroDayHunter() {
  const [targetUrl, setTargetUrl] = useState('');
  const [depth, setDepth] = useState('2');
  const [isHunting, setIsHunting] = useState(false);
  const [result, setResult] = useState<{
    error?: string;
    mock?: boolean;
    zeroDayCandidates?: Array<any>;
    vulnerabilities?: Array<any>;
    summary?: { critical: number; high: number; medium: number; total: number };
  } | null>(null);

  const huntZeroDays = async () => {
    if (!targetUrl) {
      setResult({ error: 'Please enter a target URL' });
      return;
    }
    
    setIsHunting(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/zeroday/hunt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl, depth: parseInt(depth) || 2 }),
      });
      
      const data = await response.json();
      if (data.success) {
        setResult({ ...data.result, mock: data.mock || false });
      } else {
        setResult({ error: data.error || 'Hunt failed' });
      }
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Failed to hunt' });
    } finally {
      setIsHunting(false);
    }
  };

  return (
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-purple-500/30 shadow-2xl overflow-hidden group hover:border-purple-500/50 transition-all duration-300">
      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-purple-500/30 to-purple-500/10 border border-purple-500/50 shadow-lg">
                <Target className="w-5 h-5 text-purple-500" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5">Zero-Day Hunter</h3>
              <p className="text-xs text-muted-foreground">
                AI-powered fuzzing & exploit generation
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
            <input
              type="number"
              value={depth}
              onChange={(e) => setDepth(e.target.value)}
              min="1"
              max="5"
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm"
            />
          </div>
          <button
            onClick={huntZeroDays}
            disabled={isHunting || !targetUrl}
            className="w-full px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-500 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isHunting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Hunting...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Hunt Zero-Days
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
                  <div className="text-[10px] text-green-400 mb-2">✓ Real zero-day hunting</div>
                )}
                {result.summary && (
                  <div className="mb-2">
                    <div className="font-semibold mb-1">Findings:</div>
                    <div className="flex gap-3 text-[10px]">
                      {result.summary.critical > 0 && <span className="text-red-400">Critical: {result.summary.critical}</span>}
                      {result.summary.high > 0 && <span className="text-orange-400">High: {result.summary.high}</span>}
                      {result.summary.medium > 0 && <span className="text-yellow-400">Medium: {result.summary.medium}</span>}
                      <span className="opacity-70">Total: {result.summary.total}</span>
                    </div>
                  </div>
                )}
                {result.zeroDayCandidates && result.zeroDayCandidates.length > 0 && (
                  <div className="mb-2">
                    <div className="font-semibold mb-1 text-red-400">🎯 Zero-Day Candidates:</div>
                    <div className="text-[10px] space-y-1 max-h-40 overflow-y-auto">
                      {result.zeroDayCandidates.map((candidate: any, idx: number) => (
                        <div key={idx} className="p-2 rounded bg-red-400/10 border border-red-400/50">
                          <div className="font-semibold">Risk Score: {candidate.finding?.risk_score || 'N/A'}</div>
                          <div className="text-[9px] opacity-80 mt-1">{candidate.exploit_potential}</div>
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

