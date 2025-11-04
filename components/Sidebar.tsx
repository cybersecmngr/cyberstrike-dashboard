'use client';

import { useState } from 'react';
import {
  Terminal,
  Wifi,
  Network,
  FileCode,
  Search,
  Hash,
  Code2,
  Shield,
  Database,
  Bug,
  Scan,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ToolItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  category: 'scanner' | 'exploit' | 'network' | 'osint' | 'utility';
  color: string;
  status?: 'available' | 'coming-soon';
}

const tools: ToolItem[] = [
  {
    id: 'terminal',
    name: 'Terminal',
    icon: <Terminal className="w-5 h-5" />,
    description: 'Command line interface',
    category: 'utility',
    color: '#00FF41',
    status: 'available',
  },
  {
    id: 'nmap',
    name: 'Network Scanner',
    icon: <Scan className="w-5 h-5" />,
    description: 'Nmap port scanning',
    category: 'scanner',
    color: '#00D4FF',
    status: 'available',
  },
  {
    id: 'nikto',
    name: 'Web Scanner',
    icon: <Shield className="w-5 h-5" />,
    description: 'Nikto vulnerability scan',
    category: 'scanner',
    color: '#00FF41',
    status: 'available',
  },
  {
    id: 'sqlmap',
    name: 'SQL Injection',
    icon: <Database className="w-5 h-5" />,
    description: 'SQLMap testing',
    category: 'exploit',
    color: '#FF0040',
    status: 'available',
  },
  {
    id: 'wifi',
    name: 'WiFi Analyzer',
    icon: <Wifi className="w-5 h-5" />,
    description: 'Network analysis & handshake',
    category: 'network',
    color: '#00D4FF',
    status: 'available',
  },
  {
    id: 'reverse-shell',
    name: 'Reverse Shell',
    icon: <Network className="w-5 h-5" />,
    description: 'Payload generator & listener',
    category: 'exploit',
    color: '#FF0040',
    status: 'available',
  },
  {
    id: 'exploitdb',
    name: 'ExploitDB',
    icon: <FileCode className="w-5 h-5" />,
    description: 'CVE search & PoC viewer',
    category: 'exploit',
    color: '#00FF41',
    status: 'available',
  },
  {
    id: 'shodan',
    name: 'Shodan',
    icon: <Search className="w-5 h-5" />,
    description: 'Device & service search',
    category: 'osint',
    color: '#00D4FF',
    status: 'available',
  },
  {
    id: 'harvester',
    name: 'TheHarvester',
    icon: <Bug className="w-5 h-5" />,
    description: 'OSINT data gathering',
    category: 'osint',
    color: '#00FF41',
    status: 'available',
  },
  {
    id: 'xss',
    name: 'XSS Scanner',
    icon: <Code2 className="w-5 h-5" />,
    description: 'XSS payload generator',
    category: 'scanner',
    color: '#00FF41',
    status: 'available',
  },
  {
    id: 'hashcracker',
    name: 'Hash Cracker',
    icon: <Hash className="w-5 h-5" />,
    description: 'MD5/SHA256 cracking',
    category: 'utility',
    color: '#FF0040',
    status: 'available',
  },
];

interface SidebarProps {
  onToolSelect?: (toolId: string) => void;
  activeTool?: string;
}

export default function Sidebar({ onToolSelect, activeTool }: SidebarProps) {
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

  const handleToolClick = (toolId: string) => {
    onToolSelect?.(toolId);
  };

  return (
    <div className="hidden lg:block fixed left-0 top-0 h-full w-72 border-r z-30 overflow-y-auto" style={{ backgroundColor: '#1a1a1c', borderRightColor: 'rgba(255, 255, 255, 0.1)' }}>
      {/* Header */}
      <div className="sticky top-0 border-b p-6 z-10" style={{ backgroundColor: '#1a1a1c', borderBottomColor: 'rgba(255, 255, 255, 0.1)' }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-neon-green/20 text-neon-green">
            <Zap className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Cyber Tools</h2>
        </div>
        <p className="text-xs text-muted-foreground">Security testing toolkit</p>
      </div>

      {/* Tools List */}
      <div className="p-4 space-y-2">
        {tools.map((tool, index) => {
          const isActive = activeTool === tool.id;
          const isHovered = hoveredTool === tool.id;

          return (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onMouseEnter={() => setHoveredTool(tool.id)}
              onMouseLeave={() => setHoveredTool(null)}
              onClick={() => handleToolClick(tool.id)}
              className={`
                relative group cursor-pointer rounded-lg p-4 transition-all duration-300
                ${isActive 
                  ? 'bg-neon-green/20 border border-neon-green/50' 
                  : 'bg-muted/30 border border-border/30 hover:bg-muted/50 hover:border-border/50'
                }
              `}
              style={{
                boxShadow: isHovered || isActive
                  ? `0 0 20px ${tool.color}30, inset 0 0 20px ${tool.color}10`
                  : undefined,
              }}
            >
              {/* Glow effect */}
              {(isHovered || isActive) && (
                <div
                  className="absolute inset-0 rounded-lg opacity-50 blur-sm"
                  style={{ backgroundColor: tool.color }}
                />
              )}

              <div className="relative z-10 flex items-start gap-3">
                {/* Icon */}
                <div
                  className={`
                    flex-shrink-0 p-2 rounded-lg transition-all duration-300
                    ${isActive ? 'scale-110' : 'group-hover:scale-110'}
                  `}
                  style={{
                    backgroundColor: `${tool.color}20`,
                    color: tool.color,
                  }}
                >
                  {tool.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`
                      font-semibold text-sm transition-colors
                      ${isActive ? 'text-neon-green' : 'text-foreground'}
                    `}>
                      {tool.name}
                    </h3>
                    {tool.status === 'available' && (
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: tool.color }}
                      />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {tool.description}
                  </p>
                  
                  {/* Category badge */}
                  <div className="mt-2">
                    <span className={`
                      text-[10px] px-2 py-0.5 rounded-full font-medium
                      ${tool.category === 'scanner' ? 'bg-cyber-blue/20 text-cyber-blue' : ''}
                      ${tool.category === 'exploit' ? 'bg-danger-red/20 text-danger-red' : ''}
                      ${tool.category === 'network' ? 'bg-neon-green/20 text-neon-green' : ''}
                      ${tool.category === 'osint' ? 'bg-cyber-blue/20 text-cyber-blue' : ''}
                      ${tool.category === 'utility' ? 'bg-muted text-muted-foreground' : ''}
                    `}>
                      {tool.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Active indicator */}
              {isActive && (
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
                  style={{ backgroundColor: tool.color }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-dark-secondary/95 backdrop-blur-lg border-t border-border/50 p-4">
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">
            {tools.filter(t => t.status === 'available').length} tools available
          </div>
          <div className="flex items-center justify-center gap-1">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <span className="text-xs text-neon-green font-medium">System Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}

