'use client';

import { useState } from 'react';
import { Network, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProtocolFuzzer() {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('80');
  const [protocol, setProtocol] = useState('http');
  const [isFuzzing, setIsFuzzing] = useState(false);
  const [result, setResult] = useState<{
    error?: string;
    mock?: boolean;
    fuzzing_results?: any;
    exploits_generated?: Array<any>;
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
      const response = await fetch('/api/fuzzer/fuzz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host, port: parseInt(port), protocol }),
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
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-lime-500/30 shadow-2xl overflow-hidden group hover:border-lime-500/50 transition-all duration-300">
      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-lime-500 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-lime-500/30 to-lime-500/10 border border-lime-500/50 shadow-lg">
                <Network className="w-5 h-5 text-lime-500" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5">Protocol Fuzzer</h3>
              <p className="text-xs text-muted-foreground">
                Intelligent protocol fuzzing
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
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Protocol</label>
            <select value={protocol} onChange={(e) => setProtocol(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm">
              <option value="http">HTTP</option>
              <option value="https">HTTPS</option>
              <option value="ftp">FTP</option>
              <option value="smtp">SMTP</option>
              <option value="tcp">TCP</option>
            </select>
          </div>
          <button onClick={fuzz} disabled={isFuzzing || !host} className="w-full px-4 py-2 rounded-lg bg-lime-500/20 hover:bg-lime-500/30 border border-lime-500/50 text-lime-500 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
            {isFuzzing ? <> <Loader2 className="w-4 h-4 animate-spin" /> Fuzzing... </> : <> <Network className="w-4 h-4" /> Start Fuzzing </>}
          </button>
        </div>

        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 p-3 rounded-lg border text-xs ${result.error ? 'bg-red-400/10 border-red-400/50 text-red-400' : 'bg-dark-secondary/50 border-border/30'}`}>
            {result.error ? (
              <div className="font-semibold">✗ Error: {result.error}</div>
            ) : (
              <>
                {result.mock && <div className="text-[10px] text-yellow-400 mb-2">⚠️ Mock data</div>}
                {!result.mock && <div className="text-[10px] text-green-400 mb-2">✓ Real protocol fuzzing</div>}
                {result.summary && (
                  <div className="mb-2">
                    <div className="font-semibold mb-1">Fuzzing Results:</div>
                    <div className="text-[10px] space-y-1">
                      <div>Requests: {result.summary.requests_sent || 0}</div>
                      <div>Crashes: {result.summary.crashes_found || 0}</div>
                      <div>Vulnerabilities: {result.summary.vulnerabilities_detected || 0}</div>
                      <div>Exploits: {result.summary.exploits_created || 0}</div>
                    </div>
                  </div>
                )}
                {result.exploits_generated && result.exploits_generated.length > 0 && (
                  <div className="mb-2 text-[10px]">
                    <div className="font-semibold text-green-400">Exploits Generated:</div>
                    <div className="opacity-80 mt-1">{result.exploits_generated.length} exploit(s)</div>
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

