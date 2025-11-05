'use client';

import { useState } from 'react';
import { Wifi, Radio, Loader2, Shield } from 'lucide-react';

interface WiFiNetwork {
  bssid: string;
  ssid: string;
  channel: number;
  signal: number;
  encryption: string;
  frequency?: string;
  channelWidth?: string;
  method?: string;
}

export default function WirelessAttackSuite() {
  const [interfaceName, setInterfaceName] = useState('wlan0');
  const [isScanning, setIsScanning] = useState(false);
  const [networks, setNetworks] = useState<WiFiNetwork[]>([]);
  const [attackType, setAttackType] = useState('handshake');
  const [targetBSSID, setTargetBSSID] = useState('');
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackResult, setAttackResult] = useState<{ success: boolean; message?: string; note?: string } | null>(null);

  const scanNetworks = async () => {
    setIsScanning(true);
    try {
      const response = await fetch('/api/wireless/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interface: interfaceName }),
      });
      const data = await response.json();
      if (data.success) {
        setNetworks(data.networks || []);
      }
    } catch {
      // Error handling
    } finally {
      setIsScanning(false);
    }
  };

  const executeAttack = async () => {
    if (!targetBSSID || targetBSSID === 'N/A') {
      setAttackResult({ success: false, message: 'Please select a target network first by clicking on a network from the scan results.' });
      return;
    }
    
    setIsAttacking(true);
    setAttackResult(null);
    
    try {
      // Map frontend attack types to backend
      const backendAttackType = attackType === 'evil-twin' ? 'handshake' : attackType;
      
      const response = await fetch('/api/wireless/attack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          attackType: backendAttackType, 
          interface: interfaceName, 
          targetBSSID 
        }),
      });
      
      const data = await response.json();
      
      setAttackResult({
        success: data.success || false,
        message: data.message || (data.success ? `Attack initiated: ${attackType} on ${targetBSSID}` : 'Attack failed. Please check your interface and target BSSID.'),
        note: data.note || (data.mock ? 'This is a simulated attack. Install aircrack-ng suite for real attacks.' : undefined)
      });
    } catch (error) {
      setAttackResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to execute attack. Please try again.'
      });
    } finally {
      setIsAttacking(false);
    }
  };

  return (
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-purple-400/30 shadow-2xl overflow-hidden group hover:border-purple-400/50 transition-all duration-300">
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to bottom right, rgba(168, 85, 247, 0.1), transparent 50%, rgba(147, 51, 234, 0.05))',
        }}
      />
      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-400 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-purple-400/30 to-purple-400/10 border border-purple-400/50 shadow-lg">
                <Wifi className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5" style={{
                textShadow: '0 0 15px rgba(168, 85, 247, 0.6)',
              }}>Wireless Attack Suite</h3>
              <p className="text-xs text-muted-foreground">
                WiFi handshake capture, WPS PIN brute force, deauth attacks
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Interface
            </label>
            <input
              type="text"
              value={interfaceName}
              onChange={(e) => setInterfaceName(e.target.value)}
              placeholder="wlan0"
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50"
            />
          </div>
          <button
            onClick={scanNetworks}
            disabled={isScanning}
            className="w-full px-4 py-2 rounded-lg bg-purple-400/20 hover:bg-purple-400/30 border border-purple-400/50 text-purple-400 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Radio className="w-4 h-4" />
                Scan Networks
              </>
            )}
          </button>
        </div>

        {networks.length > 0 && (
          <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
            {networks.map((network, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setTargetBSSID(network.bssid);
                  setAttackResult(null); // Clear previous result
                }}
                className={`p-2.5 rounded-lg bg-dark-secondary/50 border cursor-pointer hover:border-purple-400/50 transition-colors ${
                  targetBSSID === network.bssid 
                    ? 'border-purple-400 bg-purple-400/10' 
                    : 'border-border/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-semibold text-foreground">{network.ssid}</div>
                  <div className="text-[10px] text-purple-400 font-medium">
                    {network.signal} dBm
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground space-y-0.5">
                  <div>BSSID: {network.bssid}</div>
                  <div className="flex items-center gap-2">
                    <span>Ch {network.channel}</span>
                    {network.frequency && <span className="text-purple-400">• {network.frequency}</span>}
                    {network.channelWidth && <span className="text-blue-400">• {network.channelWidth}</span>}
                  </div>
                  <div className="text-purple-300/80">{network.encryption}</div>
                  {network.method && network.method !== 'mock' && (
                    <div className="text-[9px] text-green-400/70">✓ Real scan via {network.method}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {attackResult && (
          <div className={`mb-4 p-3 rounded-lg border text-xs ${
            attackResult.success
              ? 'bg-green-400/10 border-green-400/50 text-green-400'
              : 'bg-red-400/10 border-red-400/50 text-red-400'
          }`}>
            <div className="font-semibold mb-1">
              {attackResult.success ? '✓ Success' : '✗ Error'}
            </div>
            <div className="text-muted-foreground">{attackResult.message}</div>
            {attackResult.note && (
              <div className="mt-1 text-[10px] opacity-80">{attackResult.note}</div>
            )}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Attack Type
            </label>
            <select
              value={attackType}
              onChange={(e) => {
                setAttackType(e.target.value);
                setAttackResult(null); // Clear previous result
              }}
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50"
            >
              <option value="handshake">Handshake Capture</option>
              <option value="wps">WPS PIN Brute Force</option>
              <option value="deauth">Deauth Attack</option>
              <option value="evil-twin">Evil Twin</option>
            </select>
          </div>
          <div className="text-[10px] text-muted-foreground mb-2">
            {targetBSSID && targetBSSID !== 'N/A' ? (
              <span className="text-purple-400">Target: {targetBSSID}</span>
            ) : (
              <span className="text-yellow-400">⚠️ Select a network from scan results above</span>
            )}
          </div>
          <button
            onClick={executeAttack}
            disabled={isAttacking || !targetBSSID || targetBSSID === 'N/A'}
            className="w-full px-4 py-2 rounded-lg bg-red-400/20 hover:bg-red-400/30 border border-red-400/50 text-red-400 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isAttacking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Attacking...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Execute Attack
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

