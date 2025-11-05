'use client';

import { useState } from 'react';
import { Shield, Target, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface APITestResult {
  endpoint: string;
  method: string;
  status: number;
  vulnerable: boolean;
  issue?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export default function APISecurityTester() {
  const [baseUrl, setBaseUrl] = useState('');
  const [endpoints, setEndpoints] = useState('');
  const [testType, setTestType] = useState('authentication');
  const [isTesting, setIsTesting] = useState(false);
  const [results, setResults] = useState<APITestResult[]>([]);

  const startTest = async () => {
    if (!baseUrl) return;

    setIsTesting(true);
    setResults([]);

    try {
      const response = await fetch('/api/security/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseUrl, endpoints, testType }),
      });

      const data = await response.json();
      if (data.success) {
        setResults(data.results || []);
      }
    } catch {
      // Error handling
    } finally {
      setIsTesting(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    }
  };

  return (
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-indigo-400/30 shadow-2xl overflow-hidden group hover:border-indigo-400/50 transition-all duration-300">
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
      <div 
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to right, rgb(129, 140, 248), rgb(99, 102, 241), rgb(79, 70, 229))',
        }}
      />

      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-400 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-indigo-400/30 to-indigo-400/10 border border-indigo-400/50 shadow-lg">
                <Shield className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5" style={{
                textShadow: '0 0 15px rgba(129, 140, 248, 0.6)',
              }}>API Security Tester</h3>
              <p className="text-xs text-muted-foreground">
                Test REST API security vulnerabilities
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Base URL
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.example.com"
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/50 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Endpoints (one per line, optional)
            </label>
            <textarea
              value={endpoints}
              onChange={(e) => setEndpoints(e.target.value)}
              placeholder="/api/users\n/api/admin\n/api/data"
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/50 font-mono resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Test Type
            </label>
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
            >
              <option value="authentication">Authentication Bypass</option>
              <option value="authorization">Authorization Issues</option>
              <option value="injection">Injection Attacks</option>
              <option value="rate-limit">Rate Limiting</option>
              <option value="cors">CORS Misconfiguration</option>
            </select>
          </div>
          <button
            onClick={startTest}
            disabled={isTesting || !baseUrl}
            className="w-full px-4 py-2 rounded-lg bg-indigo-400/20 hover:bg-indigo-400/30 border border-indigo-400/50 text-indigo-400 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Target className="w-4 h-4" />
                Start Test
              </>
            )}
          </button>
        </div>

        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <div className="text-xs font-medium text-foreground mb-2">
                Found {results.filter(r => r.vulnerable).length} vulnerability/vulnerabilities
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {results.map((result, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`p-3 rounded-lg border ${getSeverityColor(result.severity)}`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2 flex-1">
                        {result.vulnerable ? (
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-foreground">
                            {result.method} {result.endpoint}
                          </div>
                          {result.issue && (
                            <div className="text-[10px] text-muted-foreground mt-0.5">{result.issue}</div>
                          )}
                        </div>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${getSeverityColor(result.severity)}`}>
                        {result.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">Status: {result.status}</div>
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

