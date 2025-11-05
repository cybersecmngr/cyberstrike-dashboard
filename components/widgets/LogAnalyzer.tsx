'use client';

import { useState } from 'react';
import { FileSearch, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LogEntry {
  timestamp: string;
  level: 'error' | 'warning' | 'info' | 'success';
  message: string;
  source?: string;
  ip?: string;
}

export default function LogAnalyzer() {
  const [logText, setLogText] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterTerm, setFilterTerm] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    errors: 0,
    warnings: 0,
    info: 0,
    success: 0,
  });

  const analyzeLogs = async () => {
    if (!logText.trim()) {
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/logs/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs: logText }),
      });

      const data = await response.json();
      if (data.success) {
        setResults(data.entries || []);
        setStats(data.stats || stats);
      }
    } catch {
      // Error handling
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setLogText(content);
      };
      reader.readAsText(file);
    }
  };

  const filteredResults = results.filter(entry => {
    if (filterLevel !== 'all' && entry.level !== filterLevel) return false;
    if (filterTerm && !entry.message.toLowerCase().includes(filterTerm.toLowerCase())) return false;
    return true;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'warning': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'info': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'success': return 'text-green-400 bg-green-500/10 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  return (
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-blue-400/30 shadow-2xl overflow-hidden group hover:border-blue-400/50 transition-all duration-300">
      {/* Animated gradient background - Blue */}
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
      
      {/* Glow effect */}
      <div 
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to right, rgb(96, 165, 250), rgb(59, 130, 246), rgb(37, 99, 235))',
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-blue-400/30 to-blue-400/10 border border-blue-400/50 shadow-lg">
                <FileSearch className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5" style={{
                textShadow: '0 0 15px rgba(96, 165, 250, 0.6)',
              }}>Log Analyzer</h3>
              <p className="text-xs text-muted-foreground">
                Analyze web and system logs
              </p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Log Content
            </label>
            <textarea
              value={logText}
              onChange={(e) => setLogText(e.target.value)}
              placeholder="Paste log content here or upload a file..."
              rows={6}
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-blue-400/50 font-mono resize-none"
            />
          </div>
          <div className="flex gap-2">
            <label className="flex-1 px-3 py-2 rounded-lg bg-blue-400/20 hover:bg-blue-400/30 border border-blue-400/50 text-blue-400 font-semibold transition-all flex items-center justify-center gap-2 text-sm cursor-pointer">
              <Upload className="w-4 h-4" />
              Upload File
              <input
                type="file"
                accept=".log,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <button
              onClick={analyzeLogs}
              disabled={isAnalyzing || !logText.trim()}
              className="flex-1 px-4 py-2 rounded-lg bg-blue-400/20 hover:bg-blue-400/30 border border-blue-400/50 text-blue-400 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FileSearch className="w-4 h-4" />
                  Analyze
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filters */}
        {results.length > 0 && (
          <div className="mb-4 grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Filter by Level
              </label>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              >
                <option value="all">All</option>
                <option value="error">Error</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Search Term
              </label>
              <input
                type="text"
                value={filterTerm}
                onChange={(e) => setFilterTerm(e.target.value)}
                placeholder="Search..."
                className="w-full px-2 py-1.5 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              />
            </div>
          </div>
        )}

        {/* Stats */}
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-4 gap-2 mb-4"
          >
            <div className="p-2 rounded-lg bg-dark-secondary/50 border border-border/20 text-center">
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="text-sm font-bold text-foreground">{stats.total}</div>
            </div>
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-center">
              <div className="text-[10px] text-red-400">Errors</div>
              <div className="text-sm font-bold text-red-400">{stats.errors}</div>
            </div>
            <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-center">
              <div className="text-[10px] text-yellow-400">Warnings</div>
              <div className="text-sm font-bold text-yellow-400">{stats.warnings}</div>
            </div>
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center">
              <div className="text-[10px] text-blue-400">Info</div>
              <div className="text-sm font-bold text-blue-400">{stats.info}</div>
            </div>
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence>
          {filteredResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-1"
            >
              <div className="text-xs font-medium text-foreground mb-2">
                Showing {filteredResults.length} of {results.length} entries
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {filteredResults.map((entry, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className={`p-2 rounded-lg border text-xs ${getLevelColor(entry.level)}`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-mono text-[10px] text-muted-foreground">{entry.timestamp}</span>
                      <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${getLevelColor(entry.level)}`}>
                        {entry.level.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-foreground">{entry.message}</div>
                    {entry.source && (
                      <div className="text-[10px] text-muted-foreground mt-1">Source: {entry.source}</div>
                    )}
                    {entry.ip && (
                      <div className="text-[10px] text-muted-foreground">IP: {entry.ip}</div>
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

