'use client';

import { useState } from 'react';
import { Globe, Search, Loader2, MapPin, Calendar, Building } from 'lucide-react';
import { motion } from 'framer-motion';

interface WhoIsData {
  domain?: string;
  registrar?: string;
  creationDate?: string;
  expirationDate?: string;
  updatedDate?: string;
  nameServers?: string[];
  status?: string[];
  ip?: string;
  country?: string;
  organization?: string;
  city?: string;
}

export default function WhoIsLookup() {
  const [query, setQuery] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [result, setResult] = useState<WhoIsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lookup = async () => {
    if (!query) {
      setError('Please enter a domain or IP address');
      return;
    }

    setIsLookingUp(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/whois/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.result);
      } else {
        setError(data.error || 'Lookup failed');
      }
    } catch {
      setError('Network error occurred');
    } finally {
      setIsLookingUp(false);
    }
  };

  return (
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-blue-400/30 shadow-2xl overflow-hidden group hover:border-blue-400/50 transition-all duration-300">
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to bottom right, rgba(96, 165, 250, 0.1), transparent 50%, rgba(59, 130, 246, 0.05))',
        }}
      />
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 70% 20%, rgba(96, 165, 250, 0.15), transparent 50%)',
        }}
      />
      <div 
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to right, rgb(96, 165, 250), rgb(59, 130, 246), rgb(37, 99, 235))',
        }}
      />

      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-blue-400/30 to-blue-400/10 border border-blue-400/50 shadow-lg">
                <Globe className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5" style={{
                textShadow: '0 0 15px rgba(96, 165, 250, 0.6)',
              }}>WhoIs Lookup</h3>
              <p className="text-xs text-muted-foreground">
                Domain & IP information lookup
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Domain or IP Address
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="example.com or 192.168.1.1"
                className="flex-1 px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                onKeyPress={(e) => e.key === 'Enter' && lookup()}
              />
              <button
                onClick={lookup}
                disabled={isLookingUp || !query}
                className="px-4 py-2 rounded-lg bg-blue-400/20 hover:bg-blue-400/30 border border-blue-400/50 text-blue-400 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                {isLookingUp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Looking up...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Lookup
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs"
          >
            {error}
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {result.domain && (
              <div className="p-3 rounded-lg bg-dark-secondary/50 border border-border/30">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-semibold text-foreground">Domain</span>
                </div>
                <div className="text-xs text-foreground font-mono">{result.domain}</div>
              </div>
            )}

            {result.registrar && (
              <div className="p-3 rounded-lg bg-dark-secondary/50 border border-border/30">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-semibold text-foreground">Registrar</span>
                </div>
                <div className="text-xs text-foreground">{result.registrar}</div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {result.creationDate && (
                <div className="p-3 rounded-lg bg-dark-secondary/50 border border-border/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-3 h-3 text-blue-400" />
                    <span className="text-[10px] font-semibold text-foreground">Created</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">{result.creationDate}</div>
                </div>
              )}
              {result.expirationDate && (
                <div className="p-3 rounded-lg bg-dark-secondary/50 border border-border/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-3 h-3 text-blue-400" />
                    <span className="text-[10px] font-semibold text-foreground">Expires</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">{result.expirationDate}</div>
                </div>
              )}
            </div>

            {result.ip && (
              <div className="p-3 rounded-lg bg-dark-secondary/50 border border-border/30">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-semibold text-foreground">IP Address</span>
                </div>
                <div className="text-xs text-foreground font-mono">{result.ip}</div>
                {result.country && (
                  <div className="text-[10px] text-muted-foreground mt-1">Country: {result.country}</div>
                )}
                {result.city && (
                  <div className="text-[10px] text-muted-foreground">City: {result.city}</div>
                )}
                {result.organization && (
                  <div className="text-[10px] text-muted-foreground">Org: {result.organization}</div>
                )}
              </div>
            )}

            {result.nameServers && result.nameServers.length > 0 && (
              <div className="p-3 rounded-lg bg-dark-secondary/50 border border-border/30">
                <div className="text-xs font-semibold text-foreground mb-2">Name Servers</div>
                <div className="space-y-1">
                  {result.nameServers.map((ns, idx) => (
                    <div key={idx} className="text-[10px] text-foreground font-mono">{ns}</div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

