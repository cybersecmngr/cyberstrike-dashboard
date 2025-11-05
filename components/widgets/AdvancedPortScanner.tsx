'use client';

import { useState } from 'react';
import { Network, Target, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PortResult {
  port: number;
  state: 'open' | 'closed' | 'filtered';
  service?: string;
  version?: string;
}

export default function AdvancedPortScanner() {
  const [target, setTarget] = useState('');
  const [portRange, setPortRange] = useState('1-1000');
  const [scanType, setScanType] = useState('syn');
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<PortResult[]>([]);
  const [progress, setProgress] = useState(0);

  const startScan = async () => {
    if (!target) return;

    setIsScanning(true);
    setResults([]);
    setProgress(0);

    try {
      const response = await fetch('/api/port/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, portRange, scanType }),
      });

      const data = await response.json();
      if (data.success) {
        setResults(data.results || []);
        setProgress(100);
      }
    } catch {
      // Error handling
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-green-400/30 shadow-2xl overflow-hidden group hover:border-green-400/50 transition-all duration-300">
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to bottom right, rgba(74, 222, 128, 0.1), transparent 50%, rgba(34, 197, 94, 0.05))',
        }}
      />
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 70% 20%, rgba(74, 222, 128, 0.15), transparent 50%)',
        }}
      />
      <div 
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to right, rgb(74, 222, 128), rgb(34, 197, 94), rgb(22, 163, 74))',
        }}
      />

      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-green-400 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-green-400/30 to-green-400/10 border border-green-400/50 shadow-lg">
                <Network className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5" style={{
                textShadow: '0 0 15px rgba(74, 222, 128, 0.6)',
              }}>Advanced Port Scanner</h3>
              <p className="text-xs text-muted-foreground">
                Advanced port scanning with service detection
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Target
            </label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="192.168.1.1 or example.com"
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-green-400/50 font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Port Range
              </label>
              <input
                type="text"
                value={portRange}
                onChange={(e) => setPortRange(e.target.value)}
                placeholder="1-1000"
                className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-green-400/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Scan Type
              </label>
              <select
                value={scanType}
                onChange={(e) => setScanType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-green-400/50"
              >
                <option value="syn">SYN Scan</option>
                <option value="tcp">TCP Connect</option>
                <option value="udp">UDP Scan</option>
                <option value="stealth">Stealth Scan</option>
              </select>
            </div>
          </div>
          <button
            onClick={startScan}
            disabled={isScanning || !target}
            className="w-full px-4 py-2 rounded-lg bg-green-400/20 hover:bg-green-400/30 border border-green-400/50 text-green-400 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Scanning... {progress}%
              </>
            ) : (
              <>
                <Target className="w-4 h-4" />
                Start Scan
              </>
            )}
          </button>
        </div>

        {isScanning && (
          <div className="mb-4">
            <div className="w-full bg-dark-secondary rounded-full h-1.5">
              <motion.div
                className="bg-green-400 h-1.5 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <div className="text-xs font-medium text-foreground mb-2">
                Open Ports: {results.filter(r => r.state === 'open').length}
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {results.filter(r => r.state === 'open').map((result, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-2 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="text-foreground font-mono">Port {result.port}</span>
                      {result.service && (
                        <span className="text-muted-foreground">- {result.service}</span>
                      )}
                    </div>
                    {result.version && (
                      <span className="text-[10px] text-muted-foreground">{result.version}</span>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

