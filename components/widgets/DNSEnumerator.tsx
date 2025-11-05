'use client';

import { useState } from 'react';
import { Network, Search, Loader2, AlertCircle, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

interface DNSRecord {
  type: string;
  name: string;
  value: string;
  ttl?: number;
}

export default function DNSEnumerator() {
  const [domain, setDomain] = useState('');
  const [recordType, setRecordType] = useState('A');
  const [isEnumerating, setIsEnumerating] = useState(false);
  const [results, setResults] = useState<DNSRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  const enumerateDNS = async () => {
    if (!domain) {
      setError('Please enter a domain name');
      return;
    }

    setIsEnumerating(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch('/api/dns/enumerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, type: recordType }),
      });

      const data = await response.json();
      if (data.success) {
        setResults(data.records || []);
      } else {
        setError(data.error || 'Failed to enumerate DNS records');
      }
    } catch {
      setError('Network error occurred');
    } finally {
      setIsEnumerating(false);
    }
  };

  return (
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-teal-400/30 shadow-2xl overflow-hidden group hover:border-teal-400/50 transition-all duration-300">
      {/* Animated gradient background - Teal */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to bottom right, rgba(45, 212, 191, 0.1), transparent 50%, rgba(20, 184, 166, 0.05))',
        }}
      />
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 70% 20%, rgba(45, 212, 191, 0.15), transparent 50%)',
        }}
      />
      
      {/* Glow effect */}
      <div 
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to right, rgb(45, 212, 191), rgb(20, 184, 166), rgb(13, 148, 136))',
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-teal-400 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-teal-400/30 to-teal-400/10 border border-teal-400/50 shadow-lg">
                <Network className="w-5 h-5 text-teal-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5" style={{
                textShadow: '0 0 15px rgba(45, 212, 191, 0.6)',
              }}>DNS Enumeration</h3>
              <p className="text-xs text-muted-foreground">
                Query DNS records (A, MX, TXT, SPF, etc.)
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
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/50"
              onKeyPress={(e) => e.key === 'Enter' && enumerateDNS()}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Record Type
            </label>
            <select
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/50"
            >
              <option value="A">A (IPv4)</option>
              <option value="AAAA">AAAA (IPv6)</option>
              <option value="MX">MX (Mail Exchange)</option>
              <option value="TXT">TXT (Text)</option>
              <option value="NS">NS (Name Server)</option>
              <option value="CNAME">CNAME (Canonical Name)</option>
              <option value="SOA">SOA (Start of Authority)</option>
              <option value="SPF">SPF (Sender Policy Framework)</option>
            </select>
          </div>
          <button
            onClick={enumerateDNS}
            disabled={isEnumerating || !domain}
            className="w-full px-4 py-2 rounded-lg bg-teal-400/20 hover:bg-teal-400/30 border border-teal-400/50 text-teal-400 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isEnumerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Querying...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Enumerate DNS
              </>
            )}
          </button>
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
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-foreground">
                Found {results.length} record(s)
              </span>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {results.map((record, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-2 rounded-lg bg-dark-secondary/50 border border-border/20 text-xs"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-1.5 py-0.5 rounded bg-teal-400/20 text-teal-400 font-mono text-[10px]">
                      {record.type}
                    </span>
                    <span className="text-foreground font-mono">{record.name}</span>
                  </div>
                  <div className="text-muted-foreground text-[10px] break-all ml-12">
                    {record.value}
                  </div>
                  {record.ttl && (
                    <div className="text-muted-foreground text-[10px] ml-12 mt-0.5">
                      TTL: {record.ttl}s
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

