'use client';

import { useState } from 'react';
import { ShieldOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AISecurityBypass() {
  const [payload, setPayload] = useState('');
  const [targetWaf, setTargetWaf] = useState('generic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{
    error?: string;
    mock?: boolean;
    bypass_payloads?: any;
    summary?: any;
  } | null>(null);

  const generate = async () => {
    if (!payload) {
      setResult({ error: 'Please enter a payload' });
      return;
    }
    
    setIsGenerating(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/ai/bypass/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload, targetWaf }),
      });
      
      const data = await response.json();
      if (data.success) {
        setResult({ ...data.result, mock: data.mock || false });
      } else {
        setResult({ error: data.error || 'Generation failed' });
      }
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Failed to generate' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-amber-500/30 shadow-2xl overflow-hidden group hover:border-amber-500/50 transition-all duration-300">
      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-500/10 border border-amber-500/50 shadow-lg">
                <ShieldOff className="w-5 h-5 text-amber-500" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5">AI Security Bypass</h3>
              <p className="text-xs text-muted-foreground">
                WAF/IDS/IPS bypass framework
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Original Payload</label>
            <input type="text" value={payload} onChange={(e) => setPayload(e.target.value)} placeholder="<script>alert(1)</script>" className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Target WAF</label>
            <select value={targetWaf} onChange={(e) => setTargetWaf(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm">
              <option value="generic">Generic</option>
              <option value="cloudflare">Cloudflare</option>
              <option value="akamai">Akamai</option>
              <option value="aws">AWS WAF</option>
            </select>
          </div>
          <button onClick={generate} disabled={isGenerating || !payload} className="w-full px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-500 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
            {isGenerating ? <> <Loader2 className="w-4 h-4 animate-spin" /> Generating... </> : <> <ShieldOff className="w-4 h-4" /> Generate Bypasses </>}
          </button>
        </div>

        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 p-3 rounded-lg border text-xs ${result.error ? 'bg-red-400/10 border-red-400/50 text-red-400' : 'bg-dark-secondary/50 border-border/30'}`}>
            {result.error ? (
              <div className="font-semibold">✗ Error: {result.error}</div>
            ) : (
              <>
                {result.mock && <div className="text-[10px] text-yellow-400 mb-2">⚠️ Mock data</div>}
                {!result.mock && <div className="text-[10px] text-green-400 mb-2">✓ Real AI bypass generation</div>}
                {result.summary && (
                  <div className="mb-2">
                    <div className="font-semibold mb-1">Bypass Payloads:</div>
                    <div className="text-sm font-bold text-amber-400">{result.summary.total_bypasses || 0} generated</div>
                    <div className="text-[10px] opacity-80 mt-1">Effectiveness: {(result.summary.average_effectiveness * 100).toFixed(1) || 0}%</div>
                  </div>
                )}
                {result.bypass_payloads && result.bypass_payloads.all_unique && (
                  <div className="mb-2 text-[10px]">
                    <div className="font-semibold mb-1">Sample Bypasses:</div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {result.bypass_payloads.all_unique.slice(0, 3).map((bp: string, idx: number) => (
                        <div key={idx} className="p-1 bg-dark-secondary/30 rounded font-mono text-[9px] break-all">
                          {bp.substring(0, 60)}...
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

