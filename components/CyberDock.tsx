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

interface CyberDockProps {
  onToolClick?: (toolId: string) => void;
}

export default function CyberDock({ onToolClick }: CyberDockProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string>('1');

  const getScale = (id: string) => {
    if (hoveredId === id) return 1.5;
    if (hoveredId && hoveredId !== id) return 0.9;
    return 1;
  };

  const getYOffset = (id: string) => {
    if (hoveredId === id) return -12;
    return 0;
  };

  return (
    <div className="fixed top-[73px] left-0 right-0 z-[9999]" style={{ 
      backgroundColor: '#1a1a1c',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      paddingTop: '8px',
      paddingBottom: '8px',
    }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative" style={{ overflow: 'visible' }}>
          {/* Dock background */}
          <div className="glass-strong rounded-xl backdrop-blur-strong border border-border/50 shadow-xl" style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: '8px',
            paddingBottom: '8px',
            paddingLeft: '16px',
            paddingRight: '16px',
            overflow: 'visible',
            gap: '4px'
          }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'row', 
              gap: '4px', 
              alignItems: 'center',
              width: '100%',
              justifyContent: 'center',
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
                  onClick={() => {
                    setActiveId(item.id);
                    onToolClick?.(item.id);
                  }}
                  className={`
                    relative transition-all duration-300 ease-out cursor-pointer
                    ${isActive ? 'opacity-100' : 'opacity-70'}
                    ${isHovered ? 'opacity-100' : ''}
                  `}
                  style={{
                    transform: `translateY(${yOffset}px) scale(${scale})`,
                    transformOrigin: 'bottom center',
                    overflow: 'visible',
                    zIndex: isHovered ? 100 : 1,
                  }}
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <div
                      className="absolute bottom-full left-1/2 transform -translate-x-1/2 px-2 py-1 rounded-lg text-[10px] font-medium text-foreground whitespace-nowrap glass-card border border-border/50 shadow-lg z-50 mb-2"
                      style={{
                        pointerEvents: 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.tooltip}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-border/50" style={{ marginTop: '0px' }} />
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
                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full animate-pulse"
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
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl opacity-20">
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}

