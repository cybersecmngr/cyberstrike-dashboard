'use client';

import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Loader2, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Vulnerability {
  target: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  description: string;
  cve?: string;
  port?: number;
}

export default function AutomatedVulnScanner() {
  const [targets, setTargets] = useState('');
  const [scanType, setScanType] = useState('quick');
  const [isScanning, setIsScanning] = useState(false);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const startScan = async () => {
    if (!targets.trim()) {
      setError('Please enter at least one target');
      return;
    }

    setIsScanning(true);
    setError(null);
    setVulnerabilities([]);
    setProgress(0);

    const targetList = targets.split('\n').filter(t => t.trim());

    try {
      const response = await fetch('/api/vuln/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          targets: targetList,
          scanType,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setVulnerabilities(data.vulnerabilities || []);
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
      {/* Animated gradient background - Red */}
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
      
      {/* Glow effect */}
      <div 
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to right, rgb(248, 113, 113), rgb(239, 68, 68), rgb(220, 38, 38))',
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-red-400 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-red-400/30 to-red-400/10 border border-red-400/50 shadow-lg">
                <Shield className="w-5 h-5 text-red-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5" style={{
                textShadow: '0 0 15px rgba(248, 113, 113, 0.6)',
              }}>Vulnerability Scanner</h3>
              <p className="text-xs text-muted-foreground">
                Automated multi-target vulnerability scanning
              </p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Targets (one per line)
            </label>
            <textarea
              value={targets}
              onChange={(e) => setTargets(e.target.value)}
              placeholder="192.168.1.100&#10;example.com&#10;10.0.0.1"
              rows={4}
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-red-400/50 font-mono resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Scan Type
            </label>
            <select
              value={scanType}
              onChange={(e) => setScanType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-red-400/50"
            >
              <option value="quick">Quick Scan</option>
              <option value="standard">Standard Scan</option>
              <option value="deep">Deep Scan</option>
              <option value="full">Full Scan</option>
            </select>
          </div>
          <button
            onClick={startScan}
            disabled={isScanning || !targets.trim()}
            className="w-full px-4 py-2 rounded-lg bg-red-400/20 hover:bg-red-400/30 border border-red-400/50 text-red-400 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
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

        {/* Progress Bar */}
        {isScanning && (
          <div className="mb-4">
            <div className="w-full bg-dark-secondary rounded-full h-1.5">
              <motion.div
                className="bg-red-400 h-1.5 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Error Display */}
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

        {/* Results */}
        <AnimatePresence>
          {vulnerabilities.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-foreground">
                  Found {vulnerabilities.length} vulnerability/vulnerabilities
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">
                    Critical: {vulnerabilities.filter(v => v.severity === 'critical').length}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    High: {vulnerabilities.filter(v => v.severity === 'high').length}
                  </span>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {vulnerabilities.map((vuln, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`p-3 rounded-lg border ${getSeverityColor(vuln.severity)}`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {vuln.severity === 'critical' || vuln.severity === 'high' ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        <span className="text-xs font-semibold text-foreground">{vuln.target}</span>
                        {vuln.port && (
                          <span className="text-[10px] text-muted-foreground">:{vuln.port}</span>
                        )}
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${getSeverityColor(vuln.severity)}`}>
                        {vuln.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-foreground mb-1">{vuln.type}</div>
                    <div className="text-[10px] text-muted-foreground">{vuln.description}</div>
                    {vuln.cve && (
                      <div className="text-[10px] text-muted-foreground mt-1">
                        CVE: <span className="font-mono">{vuln.cve}</span>
                      </div>
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

