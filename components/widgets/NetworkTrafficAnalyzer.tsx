'use client';

import { useState } from 'react';
import { Network, Loader2, Activity, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

interface PacketInfo {
  timestamp: string;
  source: string;
  destination: string;
  protocol: string;
  size: number;
  info: string;
}

export default function NetworkTrafficAnalyzer() {
  const [networkInterface, setNetworkInterface] = useState('eth0');
  const [isCapturing, setIsCapturing] = useState(false);
  const [packets, setPackets] = useState<PacketInfo[]>([]);
  const [filter, setFilter] = useState('');

  const startCapture = async () => {
    setIsCapturing(true);
    setPackets([]);

    try {
      const response = await fetch('/api/network/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interface: networkInterface, duration: 10 }),
      });

      const data = await response.json();
      if (data.success) {
        setPackets(data.packets || []);
      }
    } catch {
      // Error handling
    } finally {
      setIsCapturing(false);
    }
  };

  const filteredPackets = packets.filter(packet => {
    if (!filter) return true;
    const searchTerm = filter.toLowerCase();
    return (
      packet.source.toLowerCase().includes(searchTerm) ||
      packet.destination.toLowerCase().includes(searchTerm) ||
      packet.protocol.toLowerCase().includes(searchTerm) ||
      packet.info.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-violet-400/30 shadow-2xl overflow-hidden group hover:border-violet-400/50 transition-all duration-300">
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to bottom right, rgba(167, 139, 250, 0.1), transparent 50%, rgba(139, 92, 246, 0.05))',
        }}
      />
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 70% 20%, rgba(167, 139, 250, 0.15), transparent 50%)',
        }}
      />
      <div 
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to right, rgb(167, 139, 250), rgb(139, 92, 246), rgb(124, 58, 237))',
        }}
      />

      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-violet-400 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-violet-400/30 to-violet-400/10 border border-violet-400/50 shadow-lg">
                <Network className="w-5 h-5 text-violet-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5" style={{
                textShadow: '0 0 15px rgba(167, 139, 250, 0.6)',
              }}>Network Traffic Analyzer</h3>
              <p className="text-xs text-muted-foreground">
                Capture and analyze network packets
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Network Interface
            </label>
            <input
              type="text"
              value={networkInterface}
              onChange={(e) => setNetworkInterface(e.target.value)}
              placeholder="eth0"
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 font-mono"
            />
          </div>
          <button
            onClick={startCapture}
            disabled={isCapturing}
            className="w-full px-4 py-2 rounded-lg bg-violet-400/20 hover:bg-violet-400/30 border border-violet-400/50 text-violet-400 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isCapturing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Capturing...
              </>
            ) : (
              <>
                <Activity className="w-4 h-4" />
                Start Capture
              </>
            )}
          </button>
        </div>

        {packets.length > 0 && (
          <>
            <div className="mb-2">
              <div className="flex items-center gap-2">
                <Filter className="w-3 h-3 text-violet-400" />
                <input
                  type="text"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Filter packets..."
                  className="flex-1 px-2 py-1 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-violet-400/50"
                />
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-1"
            >
              <div className="text-xs font-medium text-foreground mb-2">
                Captured: {filteredPackets.length} packets
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {filteredPackets.map((packet, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-dark-secondary/50 border border-border/20 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-muted-foreground font-mono">{packet.timestamp}</span>
                      <span className="px-1.5 py-0.5 rounded bg-violet-400/20 text-violet-400 text-[10px] font-mono">
                        {packet.protocol}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground">
                      <span className="font-mono">{packet.source}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-mono">{packet.destination}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">{packet.info}</div>
                    <div className="text-[10px] text-muted-foreground">{packet.size} bytes</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

