'use client';

import { useState } from 'react';
import { Globe, Search, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdvancedRecon() {
  const [target, setTarget] = useState('');
  const [reconType, setReconType] = useState('shodan');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<{ error?: string; mock?: boolean; note?: string; results?: unknown[]; total?: number } | null>(null);

  const executeRecon = async () => {
    if (!target) {
      setResult({ error: 'Please enter a target' });
      return;
    }
    
    setIsScanning(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/recon/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, reconType }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult({
          ...data.result,
          mock: data.mock || false
        });
      } else {
        setResult({
          error: data.error || 'Reconnaissance failed. Please try again.'
        });
      }
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : 'Failed to execute reconnaissance. Please try again.'
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-cyan-400/30 shadow-2xl overflow-hidden group hover:border-cyan-400/50 transition-all duration-300">
      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-400 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-cyan-400/30 to-cyan-400/10 border border-cyan-400/50 shadow-lg">
                <Globe className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5">Advanced Reconnaissance</h3>
              <p className="text-xs text-muted-foreground">
                Shodan, Censys, TheHarvester, Google dorking, OSINT
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Target
            </label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="example.com or IP address"
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Reconnaissance Type
            </label>
            <select
              value={reconType}
              onChange={(e) => setReconType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm"
            >
              <option value="shodan">Shodan Search</option>
              <option value="censys">Censys Search</option>
              <option value="harvester">TheHarvester</option>
              <option value="dorking">Google Dorking</option>
              <option value="osint">Social Media OSINT</option>
            </select>
          </div>
          <button
            onClick={executeRecon}
            disabled={isScanning || !target}
            className="w-full px-4 py-2 rounded-lg bg-cyan-400/20 hover:bg-cyan-400/30 border border-cyan-400/50 text-cyan-400 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Execute Reconnaissance
              </>
            )}
          </button>
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-3 rounded-lg border text-xs max-h-60 overflow-y-auto ${
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
                  <div className="text-[10px] text-yellow-400 mb-2">⚠️ Mock data (Python script may not be available)</div>
                )}
                {result.note && (
                  <div className="text-[10px] opacity-80 mb-2">{result.note}</div>
                )}
                {result.results && result.results.length > 0 && (
                  <div className="mb-2">
                    <div className="font-semibold mb-1 text-green-400">✓ Results ({result.total || result.results.length}):</div>
                    <div className="text-[10px] max-h-32 overflow-y-auto">
                      {result.results.slice(0, 10).map((r: unknown, i: number) => (
                        <div key={i} className="mb-1 p-1 bg-dark-secondary/30 rounded">
                          {JSON.stringify(r)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <pre className="whitespace-pre-wrap break-all text-[10px] mt-2">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

