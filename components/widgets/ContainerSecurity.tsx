'use client';

import { useState } from 'react';
import { Container, Shield, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContainerSecurity() {
  const [imageName, setImageName] = useState('');
  const [scanType, setScanType] = useState('vulnerability');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<{ error?: string; mock?: boolean; riskScore?: number; vulnerabilities?: Array<{ cve?: string; name?: string; VulnerabilityID?: string; severity?: string; Severity?: string; package?: string; PkgName?: string }>; note?: string } | null>(null);

  const scanContainer = async () => {
    if (!imageName) {
      setResult({ error: 'Please enter an image name' });
      return;
    }
    
    setIsScanning(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/container/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageName, scanType }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult({
          ...data.result,
          mock: data.mock || false
        });
      } else {
        setResult({
          error: data.error || 'Container scan failed. Please try again.'
        });
      }
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : 'Failed to scan container. Please try again.'
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-indigo-400/30 shadow-2xl overflow-hidden group hover:border-indigo-400/50 transition-all duration-300">
      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-400 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-indigo-400/30 to-indigo-400/10 border border-indigo-400/50 shadow-lg">
                <Container className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5">Container Security Scanner</h3>
              <p className="text-xs text-muted-foreground">
                Docker image analysis, Kubernetes security, container escape detection
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Image Name
            </label>
            <input
              type="text"
              value={imageName}
              onChange={(e) => setImageName(e.target.value)}
              placeholder="nginx:latest or nginx:1.21"
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Scan Type
            </label>
            <select
              value={scanType}
              onChange={(e) => setScanType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm"
            >
              <option value="vulnerability">Vulnerability Scan</option>
              <option value="escape">Container Escape Detection</option>
              <option value="kubernetes">Kubernetes Security</option>
              <option value="image">Image Analysis</option>
            </select>
          </div>
          <button
            onClick={scanContainer}
            disabled={isScanning || !imageName}
            className="w-full px-4 py-2 rounded-lg bg-indigo-400/20 hover:bg-indigo-400/30 border border-indigo-400/50 text-indigo-400 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Scan Container
              </>
            )}
          </button>
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-3 rounded-lg border text-xs ${
              result.error
                ? 'bg-red-400/10 border-red-400/50 text-red-400'
                : 'bg-dark-secondary/50 border-border/30'
            }`}
          >
            {result.error ? (
              <div className="font-semibold">✗ Error: {result.error}</div>
            ) : (
              <>
                {result.mock && (
                  <div className="text-[10px] text-yellow-400 mb-2">⚠️ Mock data (Install trivy for real scanning: brew install trivy)</div>
                )}
                {result.vulnerabilities && (
              <div className="mb-2">
                <div className="font-semibold">Vulnerabilities: {result.vulnerabilities.length}</div>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  {result.vulnerabilities.slice(0, 5).map((vuln, idx: number) => (
                    <li key={idx}>{vuln.cve || vuln.name}</li>
                  ))}
                </ul>
              </div>
            )}
                {result.riskScore !== undefined && (
                  <div className={`font-semibold mb-2 ${
                    result.riskScore > 70 ? 'text-red-400' : 
                    result.riskScore > 40 ? 'text-yellow-400' : 
                    'text-green-400'
                  }`}>
                    Risk Score: {result.riskScore}/100
                  </div>
                )}
                {result.vulnerabilities && result.vulnerabilities.length > 0 && (
                  <div className="text-[10px] opacity-70">
                    Showing {Math.min(5, result.vulnerabilities.length)} of {result.vulnerabilities.length} vulnerabilities
                  </div>
                )}
                {result.note && (
                  <div className="text-[10px] opacity-80 mt-2">{result.note}</div>
                )}
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

