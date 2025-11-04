'use client';

import { useState } from 'react';
import { 
  Monitor, 
  Server, 
  Smartphone, 
  Cloud, 
  Database, 
  Router,
  Shield,
  AlertTriangle
} from 'lucide-react';

interface System {
  id: string;
  name: string;
  icon: React.ReactNode;
  vulnerabilities: number;
  isActive: boolean;
  os: string;
}

const systems: System[] = [
  { id: '1', name: 'Windows Server', icon: <Monitor className="w-6 h-6" />, vulnerabilities: 12, isActive: true, os: 'Windows' },
  { id: '2', name: 'Linux Cluster', icon: <Server className="w-6 h-6" />, vulnerabilities: 8, isActive: true, os: 'Linux' },
  { id: '3', name: 'Mobile Devices', icon: <Smartphone className="w-6 h-6" />, vulnerabilities: 5, isActive: false, os: 'Android' },
  { id: '4', name: 'Cloud Infrastructure', icon: <Cloud className="w-6 h-6" />, vulnerabilities: 15, isActive: true, os: 'Cloud' },
  { id: '5', name: 'Database Servers', icon: <Database className="w-6 h-6" />, vulnerabilities: 7, isActive: false, os: 'DB' },
  { id: '6', name: 'Network Devices', icon: <Router className="w-6 h-6" />, vulnerabilities: 10, isActive: true, os: 'Network' },
];

export default function TargetSystems() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="relative glass-strong rounded-2xl p-8 backdrop-blur-strong border border-border/50 shadow-2xl overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyber-blue/5 via-transparent to-neon-green/5 animate-pulse" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,212,255,0.1),transparent_70%)]" />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyber-blue/20 text-cyber-blue">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground" style={{
                textShadow: '0 0 10px rgba(0, 212, 255, 0.5)',
              }}>Target Systems</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Monitoring {systems.length} systems in real-time
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-4 py-2 rounded-lg bg-cyber-blue/10 border border-cyber-blue/30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              <span className="text-xs font-medium text-neon-green">{systems.filter(s => s.isActive).length} Active</span>
            </div>
            <div className="w-px h-4 bg-border/50" />
            <Shield className="w-4 h-4 text-cyber-blue" />
            <span className="text-xs font-medium text-foreground">{systems.length}</span>
          </div>
        </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {systems.map((system) => (
          <div
            key={system.id}
            onMouseEnter={() => setHoveredId(system.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={`
              relative rounded-xl p-6 transition-all duration-300 cursor-pointer
              ${system.isActive ? 'border-2 border-neon-green/50' : 'border border-border/50'}
              ${hoveredId === system.id ? 'scale-105 shadow-2xl' : 'shadow-lg'}
              ${system.isActive ? 'bg-neon-green/5' : 'bg-muted/30'}
              backdrop-blur-sm
            `}
            style={{
              boxShadow: system.isActive
                ? '0 0 30px rgba(0, 255, 65, 0.4), inset 0 0 30px rgba(0, 255, 65, 0.1), 0 8px 32px rgba(0, 0, 0, 0.5)'
                : hoveredId === system.id
                ? '0 0 20px rgba(0, 212, 255, 0.3), 0 8px 32px rgba(0, 0, 0, 0.5)'
                : '0 4px 16px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Pulse animation overlay for active systems */}
            {system.isActive && (
              <div className="absolute inset-0 rounded-xl bg-neon-green/10 animate-pulse" />
            )}

            {/* Hover glow effect */}
            {hoveredId === system.id && (
              <div className="absolute inset-0 rounded-xl bg-cyber-blue/10 blur-xl" />
            )}

            <div className="relative z-10">
              {/* Icon */}
              <div className={`
                inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 transition-all duration-300
                ${system.isActive 
                  ? 'bg-neon-green/20 text-neon-green shadow-lg' 
                  : 'bg-muted/50 text-muted-foreground'
                }
                ${hoveredId === system.id ? 'scale-110' : ''}
              `}
              style={{
                boxShadow: system.isActive
                  ? '0 0 20px rgba(0, 255, 65, 0.5)'
                  : undefined,
              }}>
                {system.icon}
              </div>

              {/* System name */}
              <h4 className="text-base font-bold text-foreground mb-2">
                {system.name}
              </h4>

              {/* OS badge */}
              <div className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/30">
                {system.os}
              </div>

              {/* Vulnerability count */}
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className={`
                  w-5 h-5
                  ${system.isActive ? 'text-danger-red' : 'text-muted-foreground'}
                `} />
                <span className={`
                  text-2xl font-bold
                  ${system.isActive ? 'text-danger-red' : 'text-muted-foreground'}
                `}
                style={{
                  textShadow: system.isActive ? '0 0 10px rgba(255, 0, 64, 0.5)' : undefined,
                }}>
                  {system.vulnerabilities}
                </span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  vulns
                </span>
              </div>

              {/* Active indicator */}
              {system.isActive && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-green/20 border border-neon-green/30">
                  <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                  <span className="text-xs text-neon-green font-bold uppercase tracking-wider">Active</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-8 pt-8 border-t border-border/50">
        <div className="grid grid-cols-2 gap-6">
          <div className="relative p-4 rounded-xl border border-border/30 bg-muted/20 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground uppercase tracking-wider">Total Vulnerabilities</span>
              <span className="text-2xl font-bold text-danger-red" style={{
                textShadow: '0 0 10px rgba(255, 0, 64, 0.5)',
              }}>
                {systems.reduce((sum, s) => sum + s.vulnerabilities, 0)}
              </span>
            </div>
          </div>
          <div className="relative p-4 rounded-xl border border-neon-green/30 bg-neon-green/5 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground uppercase tracking-wider">Active Systems</span>
              <span className="text-2xl font-bold text-neon-green" style={{
                textShadow: '0 0 10px rgba(0, 255, 65, 0.5)',
              }}>
                {systems.filter(s => s.isActive).length} / {systems.length}
              </span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

