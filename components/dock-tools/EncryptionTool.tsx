'use client';

import { useState } from 'react';
import { Lock, Key, Unlock, Copy, Download, Upload, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

type EncryptionType = 'aes256' | 'rsa' | 'base64' | 'md5' | 'sha256';

export default function EncryptionTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [encryptionType, setEncryptionType] = useState<EncryptionType>('aes256');
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEncrypt = async () => {
    if (!input.trim()) return;

    setIsProcessing(true);
    setOutput('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate encryption
      let result = '';
      switch (encryptionType) {
        case 'aes256':
          result = btoa(input).split('').reverse().join('') + '==AES256';
          break;
        case 'rsa':
          result = btoa(input) + '==RSA';
          break;
        case 'base64':
          result = btoa(input);
          break;
        case 'md5':
          result = '5d41402abc4b2a76b9719d911017c592'; // Mock MD5
          break;
        case 'sha256':
          result = '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae'; // Mock SHA256
          break;
      }

      setOutput(result);
    } catch (error) {
      setOutput(`Error: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecrypt = async () => {
    if (!input.trim()) return;

    setIsProcessing(true);
    setOutput('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate decryption
      let result = '';
      if (encryptionType === 'base64') {
        try {
          result = atob(input);
        } catch {
          result = 'Invalid base64 string';
        }
      } else {
        result = 'Decryption simulation (requires real implementation)';
      }

      setOutput(result);
    } catch (error) {
      setOutput(`Error: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="relative glass-strong rounded-2xl p-8 backdrop-blur-strong border border-border/50 shadow-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cyber-blue/5 via-transparent to-neon-green/5 animate-pulse" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyber-blue/20 text-cyber-blue">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground" style={{
                textShadow: '0 0 10px rgba(0, 212, 255, 0.5)',
              }}>Encryption Tool</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Encrypt, decrypt, and hash data with multiple algorithms
              </p>
            </div>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setMode('encrypt')}
            className={`flex-1 px-6 py-3 rounded-lg border font-semibold transition-colors flex items-center justify-center gap-2 ${
              mode === 'encrypt'
                ? 'bg-cyber-blue/20 border-cyber-blue/50 text-cyber-blue'
                : 'bg-muted/20 border-border/30 text-muted-foreground'
            }`}
          >
            <Lock className="w-5 h-5" />
            Encrypt
          </button>
          <button
            onClick={() => setMode('decrypt')}
            className={`flex-1 px-6 py-3 rounded-lg border font-semibold transition-colors flex items-center justify-center gap-2 ${
              mode === 'decrypt'
                ? 'bg-neon-green/20 border-neon-green/50 text-neon-green'
                : 'bg-muted/20 border-border/30 text-muted-foreground'
            }`}
          >
            <Unlock className="w-5 h-5" />
            Decrypt
          </button>
        </div>

        {/* Encryption Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            Algorithm
          </label>
          <select
            value={encryptionType}
            onChange={(e) => setEncryptionType(e.target.value as EncryptionType)}
            className="w-full px-4 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-cyber-blue/50"
          >
            <option value="aes256">AES-256</option>
            <option value="rsa">RSA</option>
            <option value="base64">Base64</option>
            <option value="md5">MD5 Hash</option>
            <option value="sha256">SHA-256 Hash</option>
          </select>
        </div>

        {/* Key Input (for encryption types that need it) */}
        {(encryptionType === 'aes256' || encryptionType === 'rsa') && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Encryption Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Enter encryption key"
                className="w-full px-4 py-2 pr-10 rounded-lg bg-dark-secondary border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-cyber-blue/50"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            {mode === 'encrypt' ? 'Plain Text' : 'Encrypted Text'}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encrypt' ? 'Enter text to encrypt...' : 'Enter encrypted text...'}
            className="w-full h-32 px-4 py-3 rounded-lg bg-dark-secondary border border-border/50 text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyber-blue/50 resize-none"
          />
        </div>

        {/* Process Button */}
        <button
          onClick={mode === 'encrypt' ? handleEncrypt : handleDecrypt}
          disabled={isProcessing || !input.trim()}
          className="w-full mb-6 px-6 py-3 rounded-lg bg-cyber-blue/20 hover:bg-cyber-blue/30 border border-cyber-blue/50 text-cyber-blue font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-cyber-blue border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              {mode === 'encrypt' ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
              {mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
            </>
          )}
        </button>

        {/* Output */}
        {output && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-muted/30 border border-border/30"
          >
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-foreground">
                {mode === 'encrypt' ? 'Encrypted Output' : 'Decrypted Output'}
              </label>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-cyber-blue/20 hover:bg-cyber-blue/30 border border-cyber-blue/50 text-cyber-blue text-sm transition-colors flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
            </div>
            <pre className="text-sm text-foreground font-mono whitespace-pre-wrap break-all bg-dark-secondary p-4 rounded-lg">
              {output}
            </pre>
          </motion.div>
        )}
      </div>
    </div>
  );
}

