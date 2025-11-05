'use client';

import { useState } from 'react';
import { Users, Mail, Globe, QrCode, Eye, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface SETResult {
  type: string;
  output: string;
  url?: string;
}

export default function SETToolkit() {
  const [toolType, setToolType] = useState('phishing');
  const [targetEmail, setTargetEmail] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<SETResult | null>(null);

  const generateTool = async () => {
    setIsGenerating(true);
    setResult(null);

    try {
      const response = await fetch('/api/set/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolType, targetEmail, targetUrl }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.result);
      }
    } catch {
      // Error handling
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-orange-400/30 shadow-2xl overflow-hidden group hover:border-orange-400/50 transition-all duration-300">
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to bottom right, rgba(251, 146, 60, 0.1), transparent 50%, rgba(249, 115, 22, 0.05))',
        }}
      />
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 70% 20%, rgba(251, 146, 60, 0.15), transparent 50%)',
        }}
      />
      <div 
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to right, rgb(251, 146, 60), rgb(249, 115, 22), rgb(234, 88, 12))',
        }}
      />

      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-400 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-orange-400/30 to-orange-400/10 border border-orange-400/50 shadow-lg">
                <Users className="w-5 h-5 text-orange-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5" style={{
                textShadow: '0 0 15px rgba(251, 146, 60, 0.6)',
              }}>Social Engineering Toolkit</h3>
              <p className="text-xs text-muted-foreground">
                Phishing, credential harvesting, website cloning
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Tool Type
            </label>
            <select
              value={toolType}
              onChange={(e) => setToolType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50"
            >
              <option value="phishing">Phishing Email Generator</option>
              <option value="harvest">Credential Harvesting</option>
              <option value="clone">Website Cloning</option>
              <option value="qr">QR Code Generator</option>
              <option value="osint">OSINT Data Gathering</option>
            </select>
          </div>
          {toolType === 'phishing' || toolType === 'harvest' ? (
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Target Email
              </label>
              <input
                type="email"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                placeholder="target@example.com"
                className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50"
              />
            </div>
          ) : null}
          {toolType === 'clone' || toolType === 'harvest' ? (
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Target URL
              </label>
              <input
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50"
              />
            </div>
          ) : null}
          <button
            onClick={generateTool}
            disabled={isGenerating}
            className="w-full px-4 py-2 rounded-lg bg-orange-400/20 hover:bg-orange-400/30 border border-orange-400/50 text-orange-400 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Generate Tool
              </>
            )}
          </button>
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-dark-secondary/50 border border-border/30"
          >
            <div className="text-xs font-semibold text-foreground mb-2">{result.type}</div>
            <div className="text-xs text-foreground font-mono whitespace-pre-wrap break-all">
              {result.output}
            </div>
            {result.url && (
              <div className="mt-2 text-xs text-muted-foreground">
                URL: <span className="text-foreground">{result.url}</span>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

