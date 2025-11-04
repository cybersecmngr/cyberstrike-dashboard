'use client';

import { useState, useEffect } from 'react';
import { Network, RefreshCw, Shield, Copy, Check } from 'lucide-react';

export default function MACAddressChanger() {
  const [currentMac, setCurrentMac] = useState<string>('');
  const [interfaces, setInterfaces] = useState<string[]>([]);
  const [selectedInterface, setSelectedInterface] = useState<string>('en0');
  const [newMac, setNewMac] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchCurrentMac();
  }, []);

  const fetchCurrentMac = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/network/mac');
      const data = await response.json();
      if (data.success) {
        setCurrentMac(data.currentMac);
        setInterfaces(data.interfaces || []);
        if (data.interfaces && data.interfaces.length > 0) {
          setSelectedInterface(data.interfaces[0]);
        }
      }
    } catch {
      // Failed to fetch MAC
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomMac = () => {
    const hex = '0123456789ABCDEF';
    let mac = '';
    for (let i = 0; i < 6; i++) {
      if (i > 0) mac += ':';
      mac += hex[Math.floor(Math.random() * 16)];
      mac += hex[Math.floor(Math.random() * 16)];
    }
    setNewMac(mac);
  };

  const changeMacAddress = async () => {
    if (!newMac || !/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(newMac)) {
      alert('Please enter a valid MAC address');
      return;
    }

    setIsChanging(true);
    try {
      const response = await fetch('/api/network/mac', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          macAddress: newMac,
          interface: selectedInterface,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCurrentMac(data.newMac);
        setNewMac('');
        alert('MAC address changed successfully!');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch {
      alert('Failed to change MAC address. Make sure you have sudo privileges.');
    } finally {
      setIsChanging(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative glass-strong rounded-2xl p-8 backdrop-blur-strong border-2 border-sky-400/30 shadow-2xl overflow-hidden group hover:border-sky-400/50 transition-all duration-300">
      {/* Animated gradient background - Pastel Mavi */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to bottom right, rgba(56, 189, 248, 0.1), transparent 50%, rgba(103, 232, 249, 0.05))',
        }}
      />
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 70% 20%, rgba(56, 189, 248, 0.15), transparent 50%)',
        }}
      />
      
      {/* Glow effect - Pastel Mavi */}
      <div 
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to right, rgb(56, 189, 248), rgb(103, 232, 249), rgb(96, 165, 250))',
        }}
      />
      
      <div className="relative z-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-sky-400 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-3 rounded-xl bg-gradient-to-br from-sky-400/30 to-sky-400/10 border border-sky-400/50 shadow-lg">
                <Network className="w-6 h-6 text-sky-400" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-1" style={{
                textShadow: '0 0 15px rgba(56, 189, 248, 0.6)',
              }}>MAC Address Changer</h3>
              <p className="text-sm text-muted-foreground">
                Spoof your network interface MAC address
              </p>
            </div>
          </div>
        </div>

        {/* Current MAC Address */}
        <div className="mb-6 p-4 rounded-lg bg-muted/30 border border-border/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Current MAC Address</span>
            <button
              onClick={() => fetchCurrentMac()}
              disabled={isLoading}
              className="p-1.5 rounded hover:bg-muted/50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 text-sky-400 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 rounded bg-dark-secondary border border-border/30 text-foreground font-mono text-sm">
              {currentMac || 'Loading...'}
            </code>
            <button
              onClick={() => copyToClipboard(currentMac)}
              className="p-2 rounded-lg bg-sky-400/20 hover:bg-sky-400/30 border border-sky-400/50 text-sky-400 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Interface Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            Network Interface
          </label>
          <select
            value={selectedInterface}
            onChange={(e) => setSelectedInterface(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-sky-400/50"
          >
            {interfaces.map((iface) => (
              <option key={iface} value={iface}>
                {iface}
              </option>
            ))}
          </select>
        </div>

        {/* New MAC Address */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            New MAC Address
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newMac}
              onChange={(e) => setNewMac(e.target.value.toUpperCase())}
              placeholder="00:11:22:33:44:55"
                className="flex-1 px-4 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/50"
            />
            <button
              onClick={generateRandomMac}
              className="px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted/70 border border-border/30 text-foreground font-medium transition-colors"
            >
              Random
            </button>
          </div>
        </div>

        {/* Change Button */}
        <button
          onClick={changeMacAddress}
          disabled={isChanging || !newMac}
          className="w-full px-6 py-3 rounded-lg bg-sky-400/20 hover:bg-sky-400/30 border border-sky-400/50 text-sky-400 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isChanging ? (
            <>
              <div className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
              Changing...
            </>
          ) : (
            <>
              <Shield className="w-5 h-5" />
              Change MAC Address
            </>
          )}
        </button>

        {/* Warning */}
        <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
          <p className="text-xs text-yellow-500">
            ⚠️ Requires sudo privileges. Network connection may be temporarily interrupted.
          </p>
        </div>
      </div>
    </div>
  );
}

