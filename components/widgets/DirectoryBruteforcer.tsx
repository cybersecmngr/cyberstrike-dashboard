'use client';

import { useState } from 'react';
import { FolderSearch, Target, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DirectoryResult {
  path: string;
  status: number;
  size?: number;
  found: boolean;
}

export default function DirectoryBruteforcer() {
  const [url, setUrl] = useState('');
  const [wordlist, setWordlist] = useState('common');
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<DirectoryResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const startScan = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    setIsScanning(true);
    setError(null);
    setResults([]);
    setProgress(0);

    try {
      const response = await fetch('/api/directory/bruteforce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, wordlist }),
      });

      const data = await response.json();
      if (data.success) {
        setResults(data.results || []);
        setProgress(100);
      } else {
        setError(data.error || 'Scan failed');
      }
    } catch {
      setError('Network error occurred');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-cyan-400/30 shadow-2xl overflow-hidden group hover:border-cyan-400/50 transition-all duration-300">
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to bottom right, rgba(34, 211, 238, 0.1), transparent 50%, rgba(6, 182, 212, 0.05))',
        }}
      />
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 70% 20%, rgba(34, 211, 238, 0.15), transparent 50%)',
        }}
      />
      <div 
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to right, rgb(34, 211, 238), rgb(6, 182, 212), rgb(8, 145, 178))',
        }}
      />

      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-400 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-cyan-400/30 to-cyan-400/10 border border-cyan-400/50 shadow-lg">
                <FolderSearch className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5" style={{
                textShadow: '0 0 15px rgba(34, 211, 238, 0.6)',
              }}>Directory Bruteforcer</h3>
              <p className="text-xs text-muted-foreground">
                Discover hidden directories and files
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Target URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Wordlist
            </label>
            <select
              value={wordlist}
              onChange={(e) => setWordlist(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
            >
              <option value="common">Common (1000)</option>
              <option value="medium">Medium (5000)</option>
              <option value="large">Large (10000)</option>
              <option value="extensive">Extensive (50000)</option>
            </select>
          </div>
          <button
            onClick={startScan}
            disabled={isScanning || !url}
            className="w-full px-4 py-2 rounded-lg bg-cyan-400/20 hover:bg-cyan-400/30 border border-cyan-400/50 text-cyan-400 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
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
                className="bg-cyan-400 h-1.5 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.div>
        )}

        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-foreground">
                  Found {results.filter(r => r.found).length} directory/directories
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {results.filter(r => r.found).map((result, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-2 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="text-foreground font-mono">{result.path}</span>
                      <span className="text-muted-foreground">({result.status})</span>
                    </div>
                    {result.size && (
                      <span className="text-[10px] text-muted-foreground">{result.size} bytes</span>
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

