'use client';

import { useState } from 'react';
import { Lock, Copy, Check, Shield, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface PasswordStrength {
  score: number;
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  feedback: string[];
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [strength, setStrength] = useState<PasswordStrength | null>(null);
  const [copied, setCopied] = useState(false);
  const [analyzePassword, setAnalyzePassword] = useState('');

  const generatePassword = async () => {
    try {
      const response = await fetch('/api/password/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          length,
          includeUppercase,
          includeLowercase,
          includeNumbers,
          includeSymbols,
          excludeSimilar,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedPassword(data.password);
        setStrength(data.strength);
      }
    } catch {
      // Error handling
    }
  };

  const checkStrength = async () => {
    if (!analyzePassword) return;

    try {
      const response = await fetch('/api/password/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: analyzePassword }),
      });

      const data = await response.json();
      if (data.success) {
        setStrength(data.strength);
      }
    } catch {
      // Error handling
    }
  };

  const copyToClipboard = async () => {
    if (generatedPassword) {
      await navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStrengthColor = (strength?: string) => {
    switch (strength) {
      case 'weak': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'strong': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'very-strong': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  return (
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-emerald-400/30 shadow-2xl overflow-hidden group hover:border-emerald-400/50 transition-all duration-300">
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to bottom right, rgba(52, 211, 153, 0.1), transparent 50%, rgba(16, 185, 129, 0.05))',
        }}
      />
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 70% 20%, rgba(52, 211, 153, 0.15), transparent 50%)',
        }}
      />
      
      <div 
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to right, rgb(52, 211, 153), rgb(16, 185, 129), rgb(5, 150, 105))',
        }}
      />

      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-400 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-emerald-400/30 to-emerald-400/10 border border-emerald-400/50 shadow-lg">
                <Lock className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5" style={{
                textShadow: '0 0 15px rgba(52, 211, 153, 0.6)',
              }}>Password Generator</h3>
              <p className="text-xs text-muted-foreground">
                Generate & analyze secure passwords
              </p>
            </div>
          </div>
        </div>

        {/* Generator Section */}
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Length: {length}
            </label>
            <input
              type="range"
              min="8"
              max="128"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeUppercase}
                onChange={(e) => setIncludeUppercase(e.target.checked)}
                className="rounded"
              />
              <span>Uppercase (A-Z)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeLowercase}
                onChange={(e) => setIncludeLowercase(e.target.checked)}
                className="rounded"
              />
              <span>Lowercase (a-z)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeNumbers}
                onChange={(e) => setIncludeNumbers(e.target.checked)}
                className="rounded"
              />
              <span>Numbers (0-9)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSymbols}
                onChange={(e) => setIncludeSymbols(e.target.checked)}
                className="rounded"
              />
              <span>Symbols (!@#$)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer col-span-2">
              <input
                type="checkbox"
                checked={excludeSimilar}
                onChange={(e) => setExcludeSimilar(e.target.checked)}
                className="rounded"
              />
              <span>Exclude Similar (0, O, l, 1)</span>
            </label>
          </div>

          <button
            onClick={generatePassword}
            className="w-full px-4 py-2 rounded-lg bg-emerald-400/20 hover:bg-emerald-400/30 border border-emerald-400/50 text-emerald-400 font-semibold transition-all flex items-center justify-center gap-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Generate Password
          </button>
        </div>

        {/* Generated Password */}
        {generatedPassword && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={generatedPassword}
                readOnly
                className="flex-1 px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm font-mono"
              />
              <button
                onClick={copyToClipboard}
                className="px-3 py-2 rounded-lg bg-emerald-400/20 hover:bg-emerald-400/30 border border-emerald-400/50 text-emerald-400 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>
        )}

        {/* Password Analyzer */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Analyze Password Strength
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={analyzePassword}
              onChange={(e) => setAnalyzePassword(e.target.value)}
              placeholder="Enter password to analyze"
              className="flex-1 px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              onKeyPress={(e) => e.key === 'Enter' && checkStrength()}
            />
            <button
              onClick={checkStrength}
              className="px-4 py-2 rounded-lg bg-emerald-400/20 hover:bg-emerald-400/30 border border-emerald-400/50 text-emerald-400 font-semibold transition-all"
            >
              <Shield className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Strength Display */}
        {strength && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-lg border ${getStrengthColor(strength.strength)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold">Strength: {strength.strength.toUpperCase()}</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i <= Math.ceil(strength.score / 25) ? 'bg-current' : 'bg-current/30'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="text-xs text-foreground mb-1">Score: {strength.score}/100</div>
            {strength.feedback.length > 0 && (
              <ul className="text-[10px] space-y-1 mt-2">
                {strength.feedback.map((fb, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span>•</span>
                    <span>{fb}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

