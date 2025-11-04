'use client';

import { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Shield, Activity, TrendingUp } from 'lucide-react';

interface AttackData {
  time: string;
  attacks: number;
  blocked: number;
  threats: number;
}

export default function LiveAttackChart() {
  const [data, setData] = useState<AttackData[]>(() => {
    // Only initialize on client side
    if (typeof window === 'undefined') return [];
    const now = new Date();
    return Array.from({ length: 30 }, (_, i) => {
      const time = new Date(now.getTime() - (29 - i) * 60000);
      return {
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        attacks: Math.floor(Math.random() * 100) + 50,
        blocked: Math.floor(Math.random() * 80) + 30,
        threats: Math.floor(Math.random() * 40) + 10,
      };
    });
  });
  const mounted = typeof window !== 'undefined';

  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      const now = new Date();
      const newDataPoint: AttackData = {
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        attacks: Math.floor(Math.random() * 100) + 50,
        blocked: Math.floor(Math.random() * 80) + 30,
        threats: Math.floor(Math.random() * 40) + 10,
      };

      setData((prev) => {
        if (prev.length === 0) return [newDataPoint];
        const updated = [...prev.slice(1), newDataPoint];
        return updated;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [mounted]);

  return (
    <div className="relative glass-strong rounded-2xl p-8 backdrop-blur-strong border border-border/50 shadow-2xl overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 via-transparent to-cyber-blue/5 animate-pulse" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,65,0.1),transparent_70%)]" />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-neon-green/20 text-neon-green">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-foreground" style={{
                textShadow: '0 0 10px rgba(0, 255, 65, 0.5)',
              }}>Live Attack Monitor</h3>
            </div>
            <p className="text-sm text-muted-foreground ml-12">
              Real-time security metrics over the last 30 minutes
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-green/10 border border-neon-green/30">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <span className="text-xs font-medium text-neon-green">LIVE</span>
          </div>
        </div>

      <div className="h-96 w-full relative">
        {/* Scan line effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-neon-green to-transparent animate-scan-line opacity-50" />
        </div>
        {mounted && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAttacks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00FF41" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#00FF41" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF0040" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#FF0040" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            
            <XAxis 
              dataKey="time" 
              stroke="#888"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#888' }}
            />
            <YAxis 
              stroke="#888"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#888' }}
            />
            
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(20, 20, 22, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
              }}
              labelStyle={{ color: '#00FF41' }}
            />
            
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            
            <Area
              type="monotone"
              dataKey="attacks"
              stroke="#00FF41"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorAttacks)"
              name="Total Attacks"
              animationDuration={300}
            />
            
            <Area
              type="monotone"
              dataKey="blocked"
              stroke="#00D4FF"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorBlocked)"
              name="Blocked"
              animationDuration={300}
            />
            
            <Area
              type="monotone"
              dataKey="threats"
              stroke="#FF0040"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorThreats)"
              name="Active Threats"
              animationDuration={300}
            />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-neon-green border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm">Loading chart data...</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats summary */}
      {mounted && data.length > 0 && (
        <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-border/50">
          <div className="relative text-center group">
            <div className="absolute inset-0 bg-neon-green/5 rounded-lg blur-xl group-hover:bg-neon-green/10 transition-colors" />
            <div className="relative p-4 rounded-lg border border-neon-green/20 group-hover:border-neon-green/40 transition-colors">
              <Activity className="w-5 h-5 text-neon-green mx-auto mb-2" />
              <div className="text-4xl font-bold text-neon-green mb-1" style={{
                textShadow: '0 0 20px rgba(0, 255, 65, 0.8)',
              }}>
                {data[data.length - 1]?.attacks || 0}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Attacks</div>
            </div>
          </div>
          <div className="relative text-center group">
            <div className="absolute inset-0 bg-cyber-blue/5 rounded-lg blur-xl group-hover:bg-cyber-blue/10 transition-colors" />
            <div className="relative p-4 rounded-lg border border-cyber-blue/20 group-hover:border-cyber-blue/40 transition-colors">
              <Shield className="w-5 h-5 text-cyber-blue mx-auto mb-2" />
              <div className="text-4xl font-bold text-cyber-blue mb-1" style={{
                textShadow: '0 0 20px rgba(0, 212, 255, 0.8)',
              }}>
                {data[data.length - 1]?.blocked || 0}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Blocked</div>
            </div>
          </div>
          <div className="relative text-center group">
            <div className="absolute inset-0 bg-danger-red/5 rounded-lg blur-xl group-hover:bg-danger-red/10 transition-colors" />
            <div className="relative p-4 rounded-lg border border-danger-red/20 group-hover:border-danger-red/40 transition-colors">
              <TrendingUp className="w-5 h-5 text-danger-red mx-auto mb-2" />
              <div className="text-4xl font-bold text-danger-red mb-1" style={{
                textShadow: '0 0 20px rgba(255, 0, 64, 0.8)',
              }}>
                {data[data.length - 1]?.threats || 0}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Active Threats</div>
            </div>
          </div>
        </div>
      )}
      
      {!mounted && (
        <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-border/50">
          <div className="text-center p-4 rounded-lg border border-border/20">
            <div className="text-4xl font-bold text-neon-green">-</div>
            <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Total Attacks</div>
          </div>
          <div className="text-center p-4 rounded-lg border border-border/20">
            <div className="text-4xl font-bold text-cyber-blue">-</div>
            <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Blocked</div>
          </div>
          <div className="text-center p-4 rounded-lg border border-border/20">
            <div className="text-4xl font-bold text-danger-red">-</div>
            <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Active Threats</div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

