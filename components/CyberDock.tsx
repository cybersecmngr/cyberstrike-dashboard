'use client';

import { useState } from 'react';
import {
  Terminal,
  Shield,
  Network,
  Database,
  Code,
  Lock,
  Bug,
  Scan,
  Key,
  Zap,
} from 'lucide-react';

interface DockItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  tooltip: string;
  color: string;
}

const dockItems: DockItem[] = [
  { id: '1', name: 'Terminal', icon: <Terminal className="w-6 h-6" />, tooltip: 'Command Line Interface', color: '#00FF41' },
  { id: '2', name: 'Shield', icon: <Shield className="w-6 h-6" />, tooltip: 'Security Shield', color: '#00D4FF' },
  { id: '3', name: 'Network', icon: <Network className="w-6 h-6" />, tooltip: 'Network Scanner', color: '#00FF41' },
  { id: '4', name: 'Database', icon: <Database className="w-6 h-6" />, tooltip: 'Database Explorer', color: '#00D4FF' },
  { id: '5', name: 'Code', icon: <Code className="w-6 h-6" />, tooltip: 'Code Editor', color: '#00FF41' },
  { id: '6', name: 'Lock', icon: <Lock className="w-6 h-6" />, tooltip: 'Encryption Tool', color: '#00D4FF' },
  { id: '7', name: 'Bug', icon: <Bug className="w-6 h-6" />, tooltip: 'Vulnerability Scanner', color: '#FF0040' },
  { id: '8', name: 'Scan', icon: <Scan className="w-6 h-6" />, tooltip: 'Port Scanner', color: '#00FF41' },
  { id: '9', name: 'Key', icon: <Key className="w-6 h-6" />, tooltip: 'Key Manager', color: '#00D4FF' },
  { id: '10', name: 'Zap', icon: <Zap className="w-6 h-6" />, tooltip: 'Power Tools', color: '#00FF41' },
];

export default function CyberDock() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string>('1');

  const getScale = (id: string) => {
    if (hoveredId === id) return 1.5;
    if (hoveredId && hoveredId !== id) return 0.9;
    return 1;
  };

  const getYOffset = (id: string) => {
    if (hoveredId === id) return -20;
    return 0;
  };

  return (
    <div className="fixed left-6 z-[9999]" style={{ top: '120px' }}>
      <div className="relative" style={{ overflow: 'visible' }}>
        {/* Dock background */}
        <div className="glass-strong rounded-2xl backdrop-blur-strong border border-border/50 shadow-2xl" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          paddingTop: '16px',
          paddingBottom: '16px',
          paddingLeft: '12px',
          paddingRight: '12px',
          overflow: 'visible'
        }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px', 
            alignItems: 'center',
            width: '100%',
            overflow: 'visible'
          }}>
            {dockItems.map((item) => {
              const isHovered = hoveredId === item.id;
              const isActive = activeId === item.id;
              const scale = getScale(item.id);
              const yOffset = getYOffset(item.id);

              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => setActiveId(item.id)}
                  className={`
                    relative transition-all duration-300 ease-out cursor-pointer
                    ${isActive ? 'opacity-100' : 'opacity-70'}
                    ${isHovered ? 'opacity-100' : ''}
                  `}
                  style={{
                    transform: `translateY(${yOffset}px) scale(${scale})`,
                    transformOrigin: 'top center',
                    overflow: 'visible',
                    zIndex: isHovered ? 100 : 1,
                  }}
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <div
                      className="absolute top-1/2 left-full transform -translate-y-1/2 px-3 py-1 rounded-lg text-xs font-medium text-foreground whitespace-nowrap glass-card border border-border/50 shadow-lg animate-bounce z-50"
                      style={{
                        animation: 'bounce 0.5s ease-in-out',
                        marginLeft: '32px',
                        pointerEvents: 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.tooltip}
                      <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-border/50" style={{ marginRight: '8px' }} />
                    </div>
                  )}

                  {/* Icon container */}
                  <div
                    className={`
                      relative p-3 rounded-xl transition-all duration-300
                      ${isActive ? 'bg-neon-green/20' : 'bg-transparent'}
                      ${isHovered ? 'shadow-lg' : ''}
                    `}
                    style={{
                      backgroundColor: isHovered ? `${item.color}20` : undefined,
                      boxShadow: isHovered
                        ? `0 0 20px ${item.color}40, 0 0 40px ${item.color}20`
                        : undefined,
                      border: isActive ? `1px solid ${item.color}40` : '1px solid transparent',
                    }}
                  >
                    {/* Glow effect */}
                    {isHovered && (
                      <div
                        className="absolute inset-0 rounded-xl opacity-50 blur-md animate-pulse"
                        style={{ backgroundColor: item.color }}
                      />
                    )}

                    {/* Icon */}
                    <div
                      className="relative z-10"
                      style={{ color: isActive || isHovered ? item.color : '#888' }}
                    >
                      {item.icon}
                    </div>

                    {/* Active indicator dot */}
                    {isActive && (
                      <div
                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full animate-pulse"
                        style={{ backgroundColor: item.color }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reflection effect (optional macOS-style) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl opacity-30">
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </div>
    </div>
  );
}

