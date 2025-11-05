'use client';

import { useState } from 'react';
import { Database, AlertTriangle, CheckCircle, Loader2, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SQLResult {
  vulnerable: boolean;
  payload: string;
  technique: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  response?: string;
}

export default function SQLInjectionTester() {
  const [url, setUrl] = useState('');
  const [parameter, setParameter] = useState('id');
  const [testType, setTestType] = useState('basic');
  const [isTesting, setIsTesting] = useState(false);
  const [results, setResults] = useState<SQLResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const testSQLi = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    setIsTesting(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch('/api/sqli/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, parameter, testType }),
      });

      const data = await response.json();
      if (data.success) {
        setResults(data.results || []);
      } else {
        setError(data.error || 'Test failed');
      }
    } catch {
      setError('Network error occurred');
    } finally {
      setIsTesting(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'low': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  return (
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-red-400/30 shadow-2xl overflow-hidden group hover:border-red-400/50 transition-all duration-300">
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to bottom right, rgba(248, 113, 113, 0.1), transparent 50%, rgba(239, 68, 68, 0.05))',
        }}
      />
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 70% 20%, rgba(248, 113, 113, 0.15), transparent 50%)',
        }}
      />
      <div 
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to right, rgb(248, 113, 113), rgb(239, 68, 68), rgb(220, 38, 38))',
        }}
      />

      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-red-400 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-red-400/30 to-red-400/10 border border-red-400/50 shadow-lg">
                <Database className="w-5 h-5 text-red-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5" style={{
                textShadow: '0 0 15px rgba(248, 113, 113, 0.6)',
              }}>SQL Injection Tester</h3>
              <p className="text-xs text-muted-foreground">
                Test for SQL injection vulnerabilities
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
              placeholder="https://example.com/page.php?id=1"
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-red-400/50 font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Parameter
              </label>
              <input
                type="text"
                value={parameter}
                onChange={(e) => setParameter(e.target.value)}
                placeholder="id"
                className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-red-400/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Test Type
              </label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-red-400/50"
              >
                <option value="basic">Basic</option>
                <option value="union">Union-Based</option>
                <option value="boolean">Boolean-Based</option>
                <option value="time">Time-Based</option>
                <option value="error">Error-Based</option>
              </select>
            </div>
          </div>
          <button
            onClick={testSQLi}
            disabled={isTesting || !url}
            className="w-full px-4 py-2 rounded-lg bg-red-400/20 hover:bg-red-400/30 border border-red-400/50 text-red-400 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Target className="w-4 h-4" />
                Test SQL Injection
              </>
            )}
          </button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
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
              <div className="text-xs font-medium text-foreground mb-2">
                Test Results: {results.length} payload(s) tested
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
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {result.vulnerable ? (
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                        <span className="text-xs font-semibold">{result.technique}</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${getSeverityColor(result.severity)}`}>
                        {result.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-foreground mb-1 font-mono break-all">
                      Payload: {result.payload}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{result.description}</div>
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

