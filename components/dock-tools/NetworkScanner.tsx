'use client';

import { useState } from 'react';
import { Network, Scan, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ScanResult {
  host: string;
  port: number;
  state: 'open' | 'closed' | 'filtered';
  service?: string;
  version?: string;
  timestamp: Date;
}

export default function NetworkScanner() {
  const [target, setTarget] = useState('');
  const [portRange, setPortRange] = useState('1-1000');
  const [scanType, setScanType] = useState<'quick' | 'full' | 'stealth'>('quick');
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [stats, setStats] = useState({ open: 0, closed: 0, filtered: 0 });

  const handleScan = async () => {
    if (!target.trim()) return;

    setIsScanning(true);
    setResults([]);
    setStats({ open: 0, closed: 0, filtered: 0 });

    try {
      const [startPort, endPort] = portRange.split('-').map(Number);
      const ports = Array.from({ length: endPort - startPort + 1 }, (_, i) => startPort + i);

      // Simulate real-time scanning
      for (const port of ports.slice(0, 50)) { // Limit to 50 ports for demo
        await new Promise((resolve) => setTimeout(resolve, 50));

        // Simulate scan results
        const isOpen = Math.random() > 0.85;
        const isFiltered = Math.random() > 0.95;

        const result: ScanResult = {
          host: target,
          port,
          state: isOpen ? 'open' : isFiltered ? 'filtered' : 'closed',
          service: isOpen ? ['http', 'ssh', 'ftp', 'mysql', 'redis'][Math.floor(Math.random() * 5)] : undefined,
          version: isOpen && Math.random() > 0.7 ? 'v1.0' : undefined,
          timestamp: new Date(),
        };

        setResults((prev) => {
          const newResults = [...prev, result];
          setStats({
            open: newResults.filter((r) => r.state === 'open').length,
            closed: newResults.filter((r) => r.state === 'closed').length,
            filtered: newResults.filter((r) => r.state === 'filtered').length,
          });
          return newResults;
        });
      }

      // Real nmap scan via API
      const response = await fetch('/api/nmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target,
          ports: portRange,
          scanType,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Merge real results
        if (data.ports) {
          const realResults = data.ports.map((p: any) => ({
            host: target,
            port: p.port,
            state: p.state,
            service: p.service,
            version: p.version,
            timestamp: new Date(),
          }));
          setResults((prev) => [...prev, ...realResults]);
        }
      }
    } catch (error) {
      console.error('Scan error:', error);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="relative glass-strong rounded-2xl p-8 backdrop-blur-strong border border-border/50 shadow-2xl overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyber-blue/5 via-transparent to-neon-green/5 animate-pulse" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyber-blue/20 text-cyber-blue">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground" style={{
                textShadow: '0 0 10px rgba(0, 212, 255, 0.5)',
              }}>Network Scanner</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Advanced port scanning with Nmap integration
              </p>
            </div>
          </div>
          {isScanning && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-green/10 border border-neon-green/30">
              <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              <span className="text-xs font-medium text-neon-green">Scanning...</span>
            </div>
          )}
        </div>

        {/* Scan Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Target IP/Host
            </label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="192.168.1.1 or example.com"
              className="w-full px-4 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-cyber-blue/50"
              disabled={isScanning}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Port Range
            </label>
            <input
              type="text"
              value={portRange}
              onChange={(e) => setPortRange(e.target.value)}
              placeholder="1-1000"
              className="w-full px-4 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-cyber-blue/50"
              disabled={isScanning}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Scan Type
            </label>
            <select
              value={scanType}
              onChange={(e) => setScanType(e.target.value as any)}
              className="w-full px-4 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-cyber-blue/50"
              disabled={isScanning}
            >
              <option value="quick">Quick Scan</option>
              <option value="full">Full Scan</option>
              <option value="stealth">Stealth Scan</option>
            </select>
          </div>
        </div>

        {/* Scan Button */}
        <div className="mb-6">
          <button
            onClick={handleScan}
            disabled={isScanning || !target.trim()}
            className="w-full px-6 py-3 rounded-lg bg-cyber-blue/20 hover:bg-cyber-blue/30 border border-cyber-blue/50 text-cyber-blue font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Scan className="w-5 h-5" />
            {isScanning ? 'Scanning...' : 'Start Scan'}
          </button>
        </div>

        {/* Stats */}
        {results.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-neon-green/10 border border-neon-green/30">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-neon-green" />
                <span className="text-sm text-muted-foreground">Open Ports</span>
              </div>
              <div className="text-2xl font-bold text-neon-green">{stats.open}</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Closed</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.closed}</div>
            </div>
            <div className="p-4 rounded-lg bg-cyber-blue/10 border border-cyber-blue/30">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-cyber-blue" />
                <span className="text-sm text-muted-foreground">Filtered</span>
              </div>
              <div className="text-2xl font-bold text-cyber-blue">{stats.filtered}</div>
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-auto">
            {results
              .filter((r) => r.state === 'open')
              .map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 rounded-lg bg-muted/30 border border-border/30 hover:border-neon-green/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-neon-green/20 text-neon-green flex items-center justify-center font-mono font-bold">
                        {result.port}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{result.service?.toUpperCase() || 'UNKNOWN'}</div>
                        <div className="text-sm text-muted-foreground">{result.host}:{result.port}</div>
                        {result.version && (
                          <div className="text-xs text-cyber-blue mt-1">Version: {result.version}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-neon-green/20 border border-neon-green/30">
                      <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                      <span className="text-xs font-medium text-neon-green">OPEN</span>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        )}

        {!isScanning && results.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Network className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Enter target and start scanning</p>
          </div>
        )}
      </div>
    </div>
  );
}

