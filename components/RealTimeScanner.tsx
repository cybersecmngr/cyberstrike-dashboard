'use client';

import { useState, useEffect, useRef } from 'react';
import { Terminal, Scan, AlertTriangle, CheckCircle, XCircle, Loader2, Copy, ExternalLink } from 'lucide-react';
import { securityTools } from '@/lib/security-tools';

interface ScanResult {
  id: string;
  type: 'nmap' | 'nikto' | 'gobuster' | 'sqlmap';
  timestamp: Date;
  status: 'success' | 'error' | 'pending';
  data: any;
  message?: string;
}

interface PortResult {
  port: number;
  state: string;
  service: string;
  version?: string;
}

interface VulnerabilityResult {
  id: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  cve?: string;
  url: string;
}

export function RealTimeScanner() {
  const [target, setTarget] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanType, setScanType] = useState<'nmap' | 'nikto' | 'all'>('all');
  const [results, setResults] = useState<ScanResult[]>([]);
  const [activeScan, setActiveScan] = useState<string | null>(null);
  const resultsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new results arrive
  useEffect(() => {
    resultsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [results]);

  const addResult = (result: ScanResult) => {
    setResults((prev) => [...prev, result]);
  };

  const startScan = async () => {
    if (!target.trim()) return;

    setScanning(true);
    setResults([]);
    setActiveScan(null);

    try {
      // Nmap scan
      if (scanType === 'all' || scanType === 'nmap') {
        setActiveScan('nmap');
        addResult({
          id: `nmap-${Date.now()}`,
          type: 'nmap',
          timestamp: new Date(),
          status: 'pending',
          data: null,
          message: 'Starting Nmap scan...',
        });

        try {
          const response = await fetch('/api/nmap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              target: target.trim(),
              ports: '1-1000',
              scanType: 'syn',
            }),
          });

          const data = await response.json();

          if (data.success) {
            addResult({
              id: `nmap-${Date.now()}`,
              type: 'nmap',
              timestamp: new Date(),
              status: 'success',
              data: data.results,
              message: `Nmap scan completed. Found ${data.results?.ports?.length || 0} open ports.`,
            });
          } else {
            addResult({
              id: `nmap-${Date.now()}`,
              type: 'nmap',
              timestamp: new Date(),
              status: 'error',
              data: null,
              message: data.error || 'Nmap scan failed',
            });
          }
        } catch (error: any) {
          addResult({
            id: `nmap-${Date.now()}`,
            type: 'nmap',
            timestamp: new Date(),
            status: 'error',
            data: null,
            message: error.message || 'Nmap scan error',
          });
        }
      }

      // Nikto scan
      if (scanType === 'all' || scanType === 'nikto') {
        setActiveScan('nikto');
        addResult({
          id: `nikto-${Date.now()}`,
          type: 'nikto',
          timestamp: new Date(),
          status: 'pending',
          data: null,
          message: 'Starting Nikto vulnerability scan...',
        });

        try {
          const response = await fetch('/api/nikto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              target: target.trim(),
            }),
          });

          const data = await response.json();

          if (data.success) {
            addResult({
              id: `nikto-${Date.now()}`,
              type: 'nikto',
              timestamp: new Date(),
              status: 'success',
              data: data.results,
              message: `Nikto scan completed. Found ${data.results?.vulnerabilities?.length || 0} vulnerabilities.`,
            });
          } else {
            addResult({
              id: `nikto-${Date.now()}`,
              type: 'nikto',
              timestamp: new Date(),
              status: 'error',
              data: null,
              message: data.error || 'Nikto scan failed',
            });
          }
        } catch (error: any) {
          addResult({
            id: `nikto-${Date.now()}`,
            type: 'nikto',
            timestamp: new Date(),
            status: 'error',
            data: null,
            message: error.message || 'Nikto scan error',
          });
        }
      }

      setActiveScan(null);
    } catch (error: any) {
      addResult({
        id: `error-${Date.now()}`,
        type: 'nmap',
        timestamp: new Date(),
        status: 'error',
        data: null,
        message: error.message || 'Scan failed',
      });
    } finally {
      setScanning(false);
      setActiveScan(null);
    }
  };

  const getStatusIcon = (status: ScanResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-neon-green" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-danger-red" />;
      case 'pending':
        return <Loader2 className="w-4 h-4 text-cyber-blue animate-spin" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'text-danger-red';
      case 'high':
        return 'text-orange-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-cyber-blue';
      default:
        return 'text-muted-foreground';
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  return (
    <div className="glass-card rounded-xl p-6 border border-neon-green/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-neon-green/20 text-neon-green">
            <Scan className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Real-Time Scanner</h2>
            <p className="text-xs text-muted-foreground">Multi-tool security scanning</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-neon-green" />
          <span className="text-xs font-mono text-neon-green">LIVE</span>
        </div>
      </div>

      {/* Input Section */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Target
          </label>
          <input
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="192.168.1.100 or example.com"
            disabled={scanning}
            className="w-full px-4 py-3 rounded-lg bg-dark-secondary border border-border/50 text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-neon-green/50 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Scan Type
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setScanType('all')}
              disabled={scanning}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                scanType === 'all'
                  ? 'bg-neon-green/20 text-neon-green border border-neon-green/50'
                  : 'bg-muted text-muted-foreground border border-border/50 hover:bg-muted/80'
              } disabled:opacity-50`}
            >
              All Scans
            </button>
            <button
              onClick={() => setScanType('nmap')}
              disabled={scanning}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                scanType === 'nmap'
                  ? 'bg-neon-green/20 text-neon-green border border-neon-green/50'
                  : 'bg-muted text-muted-foreground border border-border/50 hover:bg-muted/80'
              } disabled:opacity-50`}
            >
              Nmap Only
            </button>
            <button
              onClick={() => setScanType('nikto')}
              disabled={scanning}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                scanType === 'nikto'
                  ? 'bg-neon-green/20 text-neon-green border border-neon-green/50'
                  : 'bg-muted text-muted-foreground border border-border/50 hover:bg-muted/80'
              } disabled:opacity-50`}
            >
              Nikto Only
            </button>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={startScan}
        disabled={scanning || !target.trim()}
        className="w-full py-3 rounded-lg bg-gradient-to-r from-neon-green to-neon-green-dark text-dark-bg font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-neon-green/20"
      >
        {scanning ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>SCANNING...</span>
          </>
        ) : (
          <>
            <Scan className="w-5 h-5" />
            <span>START SCAN</span>
          </>
        )}
      </button>

      {/* Results */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-foreground">Scan Results</h3>
          {results.length > 0 && (
            <button
              onClick={() => setResults([])}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
          {results.length === 0 && !scanning && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Scan className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No scan results yet</p>
              <p className="text-xs mt-1">Enter a target and start scanning</p>
            </div>
          )}

          {results.map((result) => (
            <div
              key={result.id}
              className="glass rounded-lg p-4 border border-border/50"
            >
              {/* Result Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(result.status)}
                  <span className="text-xs font-mono text-muted-foreground uppercase">
                    {result.type}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {result.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                {result.message && (
                  <button
                    onClick={() => copyToClipboard(result.message || '')}
                    className="p-1 rounded hover:bg-muted transition-colors"
                    title="Copy message"
                  >
                    <Copy className="w-3 h-3 text-muted-foreground" />
                  </button>
                )}
              </div>

              {/* Message */}
              {result.message && (
                <p className="text-sm text-foreground mb-3">{result.message}</p>
              )}

              {/* Nmap Results */}
              {result.type === 'nmap' && result.status === 'success' && result.data?.ports && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-foreground mb-2">Open Ports:</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {result.data.ports.map((port: PortResult, idx: number) => (
                      <div
                        key={idx}
                        className="p-2 rounded bg-dark-secondary border border-neon-green/20"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                          <span className="text-sm font-mono text-neon-green">
                            {port.port}/{port.service}
                          </span>
                        </div>
                        {port.version && (
                          <div className="text-xs text-muted-foreground mt-1 truncate">
                            {port.version}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nikto Results */}
              {result.type === 'nikto' && result.status === 'success' && result.data?.vulnerabilities && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-foreground mb-2">Vulnerabilities:</div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {result.data.vulnerabilities.map((vuln: VulnerabilityResult, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded bg-dark-secondary border border-border/50"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className={`w-4 h-4 ${getSeverityColor(vuln.severity)}`} />
                            <span className={`text-xs font-medium ${getSeverityColor(vuln.severity)}`}>
                              {vuln.severity}
                            </span>
                            {vuln.cve && (
                              <span className="text-xs font-mono text-muted-foreground">
                                {vuln.cve}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => copyToClipboard(vuln.description)}
                            className="p-1 rounded hover:bg-muted transition-colors"
                          >
                            <Copy className="w-3 h-3 text-muted-foreground" />
                          </button>
                        </div>
                        <p className="text-xs text-foreground mt-1">{vuln.description}</p>
                        {vuln.url && (
                          <div className="flex items-center gap-1 mt-2">
                            <ExternalLink className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground font-mono truncate">
                              {vuln.url}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Results */}
              {result.status === 'error' && (
                <div className="p-3 rounded bg-danger-red/10 border border-danger-red/20">
                  <p className="text-sm text-danger-red">{result.message}</p>
                </div>
              )}
            </div>
          ))}

          {/* Active Scan Indicator */}
          {scanning && activeScan && (
            <div className="glass rounded-lg p-4 border border-cyber-blue/50">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-cyber-blue animate-spin" />
                <span className="text-sm text-foreground">
                  Running {activeScan.toUpperCase()} scan...
                </span>
              </div>
            </div>
          )}

          <div ref={resultsEndRef} />
        </div>
      </div>
    </div>
  );
}

