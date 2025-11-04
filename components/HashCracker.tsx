'use client';

import { useState, useEffect, useRef } from 'react';
import { Hash, Lock, Unlock, Rainbow, Loader2, Copy, Check } from 'lucide-react';
import { useTypingAnimation } from '@/lib/animations';

// Common password hashes for simulation
const commonHashes: Record<string, string> = {
  '5f4dcc3b5aa765d61d8327deb882cf99': 'password',
  'e10adc3949ba59abbe56e057f20f883e': '123456',
  '098f6bcd4621d373cade4e832627b4f6': 'test',
  '202cb962ac59075b964b07152d234b70': '123',
  '25d55ad283aa400af464c76d713c07ad': '12345678',
  '482c811da5d5b4bc6d497ffa98491e38': 'password123',
  '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8': 'password', // SHA256
  'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f': '123456', // SHA256
};

export default function HashCracker() {
  const [hash, setHash] = useState('');
  const [hashType, setHashType] = useState<'MD5' | 'SHA256'>('MD5');
  const [isCracking, setIsCracking] = useState(false);
  const [cracked, setCracked] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [rainbowTableMatch, setRainbowTableMatch] = useState(false);
  const { displayedText, startTyping, reset } = useTypingAnimation(cracked || '', 50);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, []);

  const startCracking = () => {
    if (!hash.trim()) return;
    
    setIsCracking(true);
    setCracked(null);
    setProgress(0);
    setAttempts(0);
    setRainbowTableMatch(false);
    reset();

    // Simulate cracking progress
    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (progressRef.current) clearInterval(progressRef.current);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    // Check if hash is in common hashes
    const normalizedHash = hash.trim().toLowerCase();
    const foundPassword = commonHashes[normalizedHash];

    // Simulate cracking time (2-5 seconds)
    const crackTime = 2000 + Math.random() * 3000;

    setTimeout(() => {
      if (progressRef.current) clearInterval(progressRef.current);
      setProgress(100);
      
      if (foundPassword) {
        setCracked(foundPassword);
        setRainbowTableMatch(true);
        setAttempts(Math.floor(Math.random() * 50000) + 1000);
        startTyping();
      } else {
        setCracked(null);
        setAttempts(Math.floor(Math.random() * 1000000) + 50000);
      }
      
      setIsCracking(false);
    }, crackTime);
  };

  const handleCopy = async () => {
    if (cracked) {
      await navigator.clipboard.writeText(cracked);
    }
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-danger-red/20 text-danger-red">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Hash Cracker</h3>
            <p className="text-xs text-muted-foreground">Simulate password hash cracking</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Rainbow className="w-4 h-4 text-cyber-blue" />
          <span className="text-xs text-muted-foreground">Rainbow Table</span>
        </div>
      </div>

      {/* Hash input */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Hash Type
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setHashType('MD5')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                hashType === 'MD5'
                  ? 'bg-neon-green/20 text-neon-green border border-neon-green/50'
                  : 'bg-muted text-muted-foreground border border-border/50'
              }`}
            >
              MD5
            </button>
            <button
              onClick={() => setHashType('SHA256')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                hashType === 'SHA256'
                  ? 'bg-neon-green/20 text-neon-green border border-neon-green/50'
                  : 'bg-muted text-muted-foreground border border-border/50'
              }`}
            >
              SHA256
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Hash Input
          </label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              placeholder={hashType === 'MD5' ? '5f4dcc3b5aa765d61d8327deb882cf99' : 'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f'}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-dark-secondary border border-border/50 text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-neon-green/50"
              disabled={isCracking}
            />
          </div>
        </div>
      </div>

      {/* Cracking button */}
      <button
        onClick={startCracking}
        disabled={isCracking || !hash.trim()}
        className="w-full py-3 rounded-lg bg-gradient-to-r from-danger-red to-danger-red-dark text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98] mb-6"
      >
        {isCracking ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Cracking...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <Lock className="w-5 h-5" />
            <span>Start Cracking</span>
          </div>
        )}
      </button>

      {/* Progress bar */}
      {isCracking && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="relative h-2 bg-dark-secondary rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-danger-red to-danger-red-dark rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] animate-shimmer" />
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground text-center">
            Attempts: {attempts.toLocaleString()}
          </div>
        </div>
      )}

      {/* Result */}
      {cracked && !isCracking && (
        <div className="glass rounded-lg p-4 border border-neon-green/50 bg-neon-green/5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Unlock className="w-5 h-5 text-neon-green" />
                <span className="text-sm font-medium text-neon-green">Hash Cracked!</span>
              </div>
              <div className="font-mono text-lg text-foreground mb-2">
                {displayedText}
                <span className="inline-block w-2 h-4 bg-neon-green ml-1 animate-pulse" />
              </div>
              {rainbowTableMatch && (
                <div className="flex items-center gap-2 text-xs text-cyber-blue">
                  <Rainbow className="w-3 h-3" />
                  <span>Found in rainbow table</span>
                </div>
              )}
            </div>
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Copy className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      )}

      {!cracked && !isCracking && attempts > 0 && (
        <div className="glass rounded-lg p-4 border border-border/50 text-center">
          <div className="text-sm text-muted-foreground">
            Hash not found after {attempts.toLocaleString()} attempts
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 pt-6 border-t border-border/50">
        <div className="text-xs text-muted-foreground">
          <p className="mb-2">
            <span className="font-medium text-foreground">Test Hashes:</span>
          </p>
          <div className="space-y-1 font-mono text-[10px]">
            <p>MD5: 5f4dcc3b5aa765d61d8327deb882cf99</p>
            <p>SHA256: ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f</p>
          </div>
        </div>
      </div>
    </div>
  );
}

