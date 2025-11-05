'use client';

import { useState } from 'react';
import { Code, Copy, Check, Shuffle, ArrowRightLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EncoderDecoder() {
  const [input, setInput] = useState('');
  const [format, setFormat] = useState('base64');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const process = async () => {
    if (!input.trim()) return;

    try {
      const response = await fetch('/api/encode/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, format, mode }),
      });

      const data = await response.json();
      if (data.success) {
        setOutput(data.output);
      }
    } catch {
      // Error handling
    }
  };

  const copyToClipboard = async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const swap = () => {
    setInput(output);
    setOutput('');
    setMode(mode === 'encode' ? 'decode' : 'encode');
  };

  return (
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-pink-400/30 shadow-2xl overflow-hidden group hover:border-pink-400/50 transition-all duration-300">
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to bottom right, rgba(244, 114, 182, 0.1), transparent 50%, rgba(236, 72, 153, 0.05))',
        }}
      />
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 70% 20%, rgba(244, 114, 182, 0.15), transparent 50%)',
        }}
      />
      <div 
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to right, rgb(244, 114, 182), rgb(236, 72, 153), rgb(219, 39, 119))',
        }}
      />

      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-pink-400 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-pink-400/30 to-pink-400/10 border border-pink-400/50 shadow-lg">
                <Code className="w-5 h-5 text-pink-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5" style={{
                textShadow: '0 0 15px rgba(244, 114, 182, 0.6)',
              }}>Encoder/Decoder</h3>
              <p className="text-xs text-muted-foreground">
                Base64, URL, Hex encoding/decoding
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/50"
              >
                <option value="base64">Base64</option>
                <option value="url">URL Encoding</option>
                <option value="hex">Hex</option>
                <option value="html">HTML Entities</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as 'encode' | 'decode')}
                className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/50"
              >
                <option value="encode">Encode</option>
                <option value="decode">Decode</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Input
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'encode' ? 'Enter text to encode' : 'Enter encoded text'}
              rows={4}
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/50 font-mono resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={process}
              disabled={!input.trim()}
              className="flex-1 px-4 py-2 rounded-lg bg-pink-400/20 hover:bg-pink-400/30 border border-pink-400/50 text-pink-400 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              <Shuffle className="w-4 h-4" />
              {mode === 'encode' ? 'Encode' : 'Decode'}
            </button>
            {output && (
              <button
                onClick={swap}
                className="px-4 py-2 rounded-lg bg-pink-400/20 hover:bg-pink-400/30 border border-pink-400/50 text-pink-400 transition-all"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {output && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">
                Output
              </label>
              <button
                onClick={copyToClipboard}
                className="p-1 rounded hover:bg-pink-400/20 transition-colors"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-green-400" />
                ) : (
                  <Copy className="w-3 h-3 text-pink-400" />
                )}
              </button>
            </div>
            <div className="p-3 rounded-lg bg-dark-secondary/50 border border-border/30">
              <pre className="text-xs text-foreground font-mono break-all whitespace-pre-wrap">{output}</pre>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

