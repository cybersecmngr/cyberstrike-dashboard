'use client';

import { useState } from 'react';
import { Hash, Copy, Check, Loader2, Shuffle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdvancedHashGenerator() {
  const [input, setInput] = useState('');
  const [hashType, setHashType] = useState('md5');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const generateHash = async () => {
    if (!input.trim()) return;

    setIsGenerating(true);
    setHashes({});

    try {
      const response = await fetch('/api/hash/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, hashType }),
      });

      const data = await response.json();
      if (data.success) {
        setHashes(data.hashes || {});
      }
    } catch {
      // Error handling
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, hashType: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(hashType);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-purple-400/30 shadow-2xl overflow-hidden group hover:border-purple-400/50 transition-all duration-300">
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to bottom right, rgba(192, 132, 252, 0.1), transparent 50%, rgba(168, 85, 247, 0.05))',
        }}
      />
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 70% 20%, rgba(192, 132, 252, 0.15), transparent 50%)',
        }}
      />
      <div 
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to right, rgb(192, 132, 252), rgb(168, 85, 247), rgb(147, 51, 234))',
        }}
      />

      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-400 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-purple-400/30 to-purple-400/10 border border-purple-400/50 shadow-lg">
                <Hash className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5" style={{
                textShadow: '0 0 15px rgba(192, 132, 252, 0.6)',
              }}>Advanced Hash Generator</h3>
              <p className="text-xs text-muted-foreground">
                Generate multiple hash types (MD5, SHA256, bcrypt, etc.)
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Input Text
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to hash"
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Hash Type
            </label>
            <select
              value={hashType}
              onChange={(e) => setHashType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50"
            >
              <option value="md5">MD5</option>
              <option value="sha1">SHA1</option>
              <option value="sha256">SHA256</option>
              <option value="sha512">SHA512</option>
              <option value="bcrypt">bcrypt</option>
              <option value="all">All Types</option>
            </select>
          </div>
          <button
            onClick={generateHash}
            disabled={isGenerating || !input.trim()}
            className="w-full px-4 py-2 rounded-lg bg-purple-400/20 hover:bg-purple-400/30 border border-purple-400/50 text-purple-400 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Shuffle className="w-4 h-4" />
                Generate Hash
              </>
            )}
          </button>
        </div>

        {Object.keys(hashes).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            {Object.entries(hashes).map(([type, hash]) => (
              <div key={type} className="p-3 rounded-lg bg-dark-secondary/50 border border-border/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-foreground uppercase">{type}</span>
                  <button
                    onClick={() => copyToClipboard(hash, type)}
                    className="p-1 rounded hover:bg-purple-400/20 transition-colors"
                  >
                    {copied === type ? (
                      <Check className="w-3 h-3 text-green-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-purple-400" />
                    )}
                  </button>
                </div>
                <div className="text-xs text-foreground font-mono break-all">{hash}</div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

