'use client';

import { useState } from 'react';
import { Shield, AlertCircle, CheckCircle, XCircle, Lock, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface SSLInfo {
  host: string;
  port: number;
  valid: boolean;
  certificate?: {
    issuer: string;
    subject: string;
    validFrom: string;
    validTo: string;
    serialNumber: string;
    fingerprint: string;
  };
  tlsVersion?: string;
  cipherSuite?: string;
  vulnerabilities?: string[];
}

export default function SSLAnalyzer() {
  const [target, setTarget] = useState('');
  const [port, setPort] = useState('443');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SSLInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeSSL = async () => {
    if (!target) {
      setError('Please enter a target hostname or IP');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/ssl/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host: target, port: parseInt(port) || 443 }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.result);
      } else {
        setError(data.error || 'Failed to analyze SSL/TLS');
      }
    } catch {
      setError('Network error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-amber-400/30 shadow-2xl overflow-hidden group hover:border-amber-400/50 transition-all duration-300">
      {/* Animated gradient background - Amber/Orange */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to bottom right, rgba(251, 191, 36, 0.1), transparent 50%, rgba(249, 115, 22, 0.05))',
        }}
      />
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 70% 20%, rgba(251, 191, 36, 0.15), transparent 50%)',
        }}
      />
      
      {/* Glow effect */}
      <div 
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to right, rgb(251, 191, 36), rgb(249, 115, 22), rgb(234, 88, 12))',
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-400 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-amber-400/30 to-amber-400/10 border border-amber-400/50 shadow-lg">
                <Shield className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5" style={{
                textShadow: '0 0 15px rgba(251, 191, 36, 0.6)',
              }}>SSL/TLS Analyzer</h3>
              <p className="text-xs text-muted-foreground">
                Analyze SSL/TLS certificates and security
              </p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Target Hostname/IP
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="example.com"
                className="flex-1 px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                onKeyPress={(e) => e.key === 'Enter' && analyzeSSL()}
              />
              <input
                type="number"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="443"
                className="w-20 px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              />
              <button
                onClick={analyzeSSL}
                disabled={isAnalyzing || !target}
                className="px-4 py-2 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/50 text-amber-400 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Analyze
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
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Status */}
            <div className={`p-3 rounded-lg flex items-center gap-2 ${
              result.valid 
                ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}>
              {result.valid ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              <span className="text-xs font-medium">
                {result.valid ? 'SSL Certificate Valid' : 'SSL Certificate Invalid'}
              </span>
            </div>

            {/* Certificate Info */}
            {result.certificate && (
              <div className="p-3 rounded-lg bg-dark-secondary/50 border border-border/30 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-foreground">Certificate Details</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Issuer:</span>
                    <div className="text-foreground font-mono mt-0.5">{result.certificate.issuer}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Subject:</span>
                    <div className="text-foreground font-mono mt-0.5">{result.certificate.subject}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Valid From:</span>
                    <div className="text-foreground mt-0.5">{result.certificate.validFrom}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Valid To:</span>
                    <div className="text-foreground mt-0.5">{result.certificate.validTo}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Fingerprint:</span>
                    <div className="text-foreground font-mono mt-0.5 text-[10px] break-all">{result.certificate.fingerprint}</div>
                  </div>
                </div>
              </div>
            )}

            {/* TLS Info */}
            {result.tlsVersion && (
              <div className="p-3 rounded-lg bg-dark-secondary/50 border border-border/30">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-foreground">TLS Information</span>
                </div>
                <div className="text-xs space-y-1">
                  <div>
                    <span className="text-muted-foreground">Version: </span>
                    <span className="text-foreground font-mono">{result.tlsVersion}</span>
                  </div>
                  {result.cipherSuite && (
                    <div>
                      <span className="text-muted-foreground">Cipher Suite: </span>
                      <span className="text-foreground font-mono text-[10px]">{result.cipherSuite}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Vulnerabilities */}
            {result.vulnerabilities && result.vulnerabilities.length > 0 && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-semibold text-red-400">Vulnerabilities Found</span>
                </div>
                <ul className="text-xs text-red-400 space-y-1">
                  {result.vulnerabilities.map((vuln, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-red-500">•</span>
                      <span>{vuln}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

