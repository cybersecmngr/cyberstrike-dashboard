'use client';

import { useState, useEffect } from 'react';
import { Globe, RefreshCw, Shield, Copy, Check, Wifi } from 'lucide-react';
import { motion } from 'framer-motion';

export default function IPAddressChanger() {
  const [currentIP, setCurrentIP] = useState<string>('');
  const [interfaces, setInterfaces] = useState<string[]>([]);
  const [selectedInterface, setSelectedInterface] = useState<string>('en0');
  const [mode, setMode] = useState<'static' | 'dhcp'>('dhcp');
  const [newIP, setNewIP] = useState<string>('');
  const [subnetMask, setSubnetMask] = useState<string>('255.255.255.0');
  const [gateway, setGateway] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchCurrentIP();
  }, []);

  const fetchCurrentIP = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/network/ip');
      const data = await response.json();
      if (data.success) {
        setCurrentIP(data.currentIP);
        setInterfaces(data.interfaces || []);
        if (data.interfaces && data.interfaces.length > 0) {
          setSelectedInterface(data.interfaces[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch IP:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeIPAddress = async () => {
    setIsChanging(true);
    try {
      const response = await fetch('/api/network/ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ipAddress: mode === 'static' ? newIP : undefined,
          subnetMask: mode === 'static' ? subnetMask : undefined,
          gateway: mode === 'static' ? gateway : undefined,
          interface: selectedInterface,
          mode,
        }),
      });

      const data = await response.json();
      if (data.success) {
        if (mode === 'static' && data.newIP) {
          setCurrentIP(data.newIP);
        } else {
          await fetchCurrentIP();
        }
        alert(mode === 'dhcp' ? 'IP address renewed via DHCP!' : 'IP address changed successfully!');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to change IP address. Make sure you have sudo privileges.');
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
    <div className="relative glass-strong rounded-2xl p-8 backdrop-blur-strong border-2 border-neon-green/30 shadow-2xl overflow-hidden group hover:border-neon-green/50 transition-all duration-300">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-green/10 via-transparent to-cyber-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(0,255,65,0.15),transparent_50%)]" />
      
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-neon-green via-cyber-blue to-neon-green rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-neon-green rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-3 rounded-xl bg-gradient-to-br from-neon-green/30 to-neon-green/10 border border-neon-green/50 shadow-lg">
                <Globe className="w-6 h-6 text-neon-green" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-1" style={{
                textShadow: '0 0 15px rgba(0, 255, 65, 0.6)',
              }}>IP Address Changer</h3>
              <p className="text-sm text-muted-foreground">
                Change your network IP address (Static or DHCP)
              </p>
            </div>
          </div>
        </div>

        {/* Current IP Address */}
        <div className="mb-6 p-4 rounded-lg bg-muted/30 border border-border/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Current IP Address</span>
            <button
              onClick={() => fetchCurrentIP()}
              disabled={isLoading}
              className="p-1.5 rounded hover:bg-muted/50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 text-neon-green ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 rounded bg-dark-secondary border border-border/30 text-foreground font-mono text-sm">
              {currentIP || 'Loading...'}
            </code>
            <button
              onClick={() => copyToClipboard(currentIP)}
              className="p-2 rounded-lg bg-neon-green/20 hover:bg-neon-green/30 border border-neon-green/50 text-neon-green transition-colors"
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
            className="w-full px-4 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-neon-green/50"
          >
            {interfaces.map((iface) => (
              <option key={iface} value={iface}>
                {iface}
              </option>
            ))}
          </select>
        </div>

        {/* Mode Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            IP Mode
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('dhcp')}
              className={`flex-1 px-4 py-2 rounded-lg border font-medium transition-colors ${
                mode === 'dhcp'
                  ? 'bg-neon-green/20 border-neon-green/50 text-neon-green'
                  : 'bg-muted/20 border-border/30 text-muted-foreground'
              }`}
            >
              <Wifi className="w-4 h-4 inline mr-2" />
              DHCP
            </button>
            <button
              onClick={() => setMode('static')}
              className={`flex-1 px-4 py-2 rounded-lg border font-medium transition-colors ${
                mode === 'static'
                  ? 'bg-cyber-blue/20 border-cyber-blue/50 text-cyber-blue'
                  : 'bg-muted/20 border-border/30 text-muted-foreground'
              }`}
            >
              Static
            </button>
          </div>
        </div>

        {/* Static IP Configuration */}
        {mode === 'static' && (
          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                IP Address
              </label>
              <input
                type="text"
                value={newIP}
                onChange={(e) => setNewIP(e.target.value)}
                placeholder="192.168.1.100"
                className="w-full px-4 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyber-blue/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Subnet Mask
              </label>
              <input
                type="text"
                value={subnetMask}
                onChange={(e) => setSubnetMask(e.target.value)}
                placeholder="255.255.255.0"
                className="w-full px-4 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyber-blue/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Gateway (Optional)
              </label>
              <input
                type="text"
                value={gateway}
                onChange={(e) => setGateway(e.target.value)}
                placeholder="192.168.1.1"
                className="w-full px-4 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyber-blue/50"
              />
            </div>
          </div>
        )}

        {/* Change Button */}
        <button
          onClick={changeIPAddress}
          disabled={isChanging || (mode === 'static' && !newIP)}
          className="w-full px-6 py-3 rounded-lg bg-neon-green/20 hover:bg-neon-green/30 border border-neon-green/50 text-neon-green font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isChanging ? (
            <>
              <div className="w-5 h-5 border-2 border-neon-green border-t-transparent rounded-full animate-spin" />
              {mode === 'dhcp' ? 'Renewing...' : 'Changing...'}
            </>
          ) : (
            <>
              <Shield className="w-5 h-5" />
              {mode === 'dhcp' ? 'Renew DHCP' : 'Change IP Address'}
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

