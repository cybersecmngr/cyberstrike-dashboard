'use client';

import { useState } from 'react';
import { Key, Plus, Eye, EyeOff, Copy, Trash2, Download, Upload, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface KeyEntry {
  id: string;
  name: string;
  type: 'ssh' | 'api' | 'gpg' | 'certificate' | 'other';
  value: string;
  createdAt: Date;
  lastUsed?: Date;
}

export default function KeyManager() {
  const [keys, setKeys] = useState<KeyEntry[]>([
    {
      id: '1',
      name: 'Production SSH Key',
      type: 'ssh',
      value: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC...',
      createdAt: new Date('2024-01-15'),
      lastUsed: new Date('2024-01-20'),
    },
    {
      id: '2',
      name: 'API Token',
      type: 'api',
      value: 'sk_live_51H...',
      createdAt: new Date('2024-01-10'),
    },
  ]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [newKey, setNewKey] = useState<{
    name: string;
    type: 'ssh' | 'api' | 'gpg' | 'certificate' | 'other';
    value: string;
  }>({
    name: '',
    type: 'ssh',
    value: '',
  });

  const handleAddKey = () => {
    const key: KeyEntry = {
      id: Date.now().toString(),
      ...newKey,
      createdAt: new Date(),
    };
    setKeys([...keys, key]);
    setNewKey({ name: '', type: 'ssh', value: '' });
  };

  const handleDeleteKey = (id: string) => {
    setKeys(keys.filter((k) => k.id !== id));
    if (selectedKey === id) setSelectedKey(null);
  };

  const handleCopyKey = (value: string) => {
    navigator.clipboard.writeText(value);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ssh':
        return '🔑';
      case 'api':
        return '🔐';
      case 'gpg':
        return '🛡️';
      case 'certificate':
        return '📜';
      default:
        return '🔒';
    }
  };

  const selectedKeyEntry = keys.find((k) => k.id === selectedKey);

  return (
    <div className="relative glass-strong rounded-2xl p-8 backdrop-blur-strong border border-border/50 shadow-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cyber-blue/5 via-transparent to-neon-green/5 animate-pulse" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyber-blue/20 text-cyber-blue">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground" style={{
                textShadow: '0 0 10px rgba(0, 212, 255, 0.5)',
              }}>Key Manager</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Manage SSH keys, API tokens, certificates, and more
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Keys List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-foreground">Keys</h4>
                <button className="p-2 rounded-lg bg-cyber-blue/20 hover:bg-cyber-blue/30 border border-cyber-blue/50 text-cyber-blue transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 max-h-96 overflow-auto">
                {keys.map((key) => (
                  <div
                    key={key.id}
                    onClick={() => setSelectedKey(key.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedKey === key.id
                        ? 'bg-cyber-blue/20 border-cyber-blue/50'
                        : 'bg-muted/20 border-border/30 hover:border-border/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getTypeIcon(key.type)}</span>
                        <span className="font-medium text-foreground text-sm">{key.name}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteKey(key.id);
                        }}
                        className="p-1 rounded hover:bg-danger-red/20 text-danger-red"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {key.type.toUpperCase()} • {key.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Key */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
              <h4 className="font-semibold text-foreground mb-4">Add New Key</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Key Name"
                  value={newKey.name}
                  onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm"
                />
                <select
                  value={newKey.type}
                  onChange={(e) => setNewKey({ ...newKey, type: e.target.value as 'ssh' | 'api' | 'gpg' | 'certificate' | 'other' })}
                  className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm"
                >
                  <option value="ssh">SSH Key</option>
                  <option value="api">API Token</option>
                  <option value="gpg">GPG Key</option>
                  <option value="certificate">Certificate</option>
                  <option value="other">Other</option>
                </select>
                <textarea
                  placeholder="Key Value"
                  value={newKey.value}
                  onChange={(e) => setNewKey({ ...newKey, value: e.target.value })}
                  className="w-full h-24 px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground font-mono text-xs resize-none"
                />
                <button
                  onClick={handleAddKey}
                  disabled={!newKey.name || !newKey.value}
                  className="w-full px-4 py-2 rounded-lg bg-neon-green/20 hover:bg-neon-green/30 border border-neon-green/50 text-neon-green font-medium transition-colors disabled:opacity-50"
                >
                  Add Key
                </button>
              </div>
            </div>
          </div>

          {/* Key Details */}
          <div className="lg:col-span-2">
            {selectedKeyEntry ? (
              <div className="p-6 rounded-lg bg-muted/30 border border-border/30">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-xl font-bold text-foreground mb-2">{selectedKeyEntry.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="px-3 py-1 rounded-full bg-cyber-blue/20 text-cyber-blue font-medium">
                        {selectedKeyEntry.type.toUpperCase()}
                      </span>
                      <span>Created: {selectedKeyEntry.createdAt.toLocaleDateString()}</span>
                      {selectedKeyEntry.lastUsed && (
                        <span>Last used: {selectedKeyEntry.lastUsed.toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyKey(selectedKeyEntry.value)}
                      className="p-2 rounded-lg bg-cyber-blue/20 hover:bg-cyber-blue/30 border border-cyber-blue/50 text-cyber-blue transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowKey(!showKey)}
                      className="p-2 rounded-lg bg-muted/50 hover:bg-muted/70 border border-border/30 text-foreground transition-colors"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Key Value
                  </label>
                  <pre className="p-4 rounded-lg bg-dark-secondary border border-border/30 text-foreground font-mono text-xs whitespace-pre-wrap break-all overflow-auto max-h-64">
                    {showKey ? selectedKeyEntry.value : '•'.repeat(50)}
                  </pre>
                </div>

                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 rounded-lg bg-cyber-blue/20 hover:bg-cyber-blue/30 border border-cyber-blue/50 text-cyber-blue font-medium transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted/70 border border-border/30 text-foreground font-medium transition-colors flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Import
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a key to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

