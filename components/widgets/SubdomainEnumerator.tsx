'use client';

import { useState } from 'react';
import { Search, Globe, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SubdomainResult {
  subdomain: string;
  ip?: string;
  status: 'active' | 'inactive';
}

export default function SubdomainEnumerator() {
  const [domain, setDomain] = useState('');
  const [isEnumerating, setIsEnumerating] = useState(false);
  const [results, setResults] = useState<SubdomainResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const enumerateSubdomains = async () => {
    if (!domain) {
      setError('Please enter a domain name');
      return;
    }

    setIsEnumerating(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch('/api/subdomain/enumerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });

      const data = await response.json();
      if (data.success) {
        setResults(data.subdomains || []);
      } else {
        setError(data.error || 'Failed to enumerate subdomains');
      }
    } catch {
      setError('Network error occurred');
    } finally {
      setIsEnumerating(false);
    }
  };

  return (
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-indigo-400/30 shadow-2xl overflow-hidden group hover:border-indigo-400/50 transition-all duration-300">
      {/* Animated gradient background - Indigo */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to bottom right, rgba(129, 140, 248, 0.1), transparent 50%, rgba(99, 102, 241, 0.05))',
        }}
      />
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 70% 20%, rgba(129, 140, 248, 0.15), transparent 50%)',
        }}
      />
      
      {/* Glow effect */}
      <div 
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to right, rgb(129, 140, 248), rgb(99, 102, 241), rgb(79, 70, 229))',
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-400 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-indigo-400/30 to-indigo-400/10 border border-indigo-400/50 shadow-lg">
                <Globe className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5" style={{
                textShadow: '0 0 15px rgba(129, 140, 248, 0.6)',
              }}>Subdomain Enumerator</h3>
              <p className="text-xs text-muted-foreground">
                Discover subdomains for reconnaissance
              </p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Domain
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
                className="flex-1 px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
                onKeyPress={(e) => e.key === 'Enter' && enumerateSubdomains()}
              />
              <button
                onClick={enumerateSubdomains}
                disabled={isEnumerating || !domain}
                className="px-4 py-2 rounded-lg bg-indigo-400/20 hover:bg-indigo-400/30 border border-indigo-400/50 text-indigo-400 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                {isEnumerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Enumerate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
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

        {/* Results */}
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
                  Found {results.length} subdomain(s)
                </span>
                <button
                  onClick={() => {
                    const text = results.map(r => r.subdomain).join('\n');
                    navigator.clipboard.writeText(text);
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300"
                >
                  Copy All
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {results.map((result, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-2 rounded-lg bg-dark-secondary/50 border border-border/20 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {result.status === 'active' ? (
                        <CheckCircle className="w-3 h-3 text-green-400" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-gray-400" />
                      )}
                      <span className="text-foreground font-mono">{result.subdomain}</span>
                      {result.ip && (
                        <span className="text-muted-foreground text-[10px]">({result.ip})</span>
                      )}
                    </div>
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

