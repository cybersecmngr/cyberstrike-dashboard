'use client';

import { useState } from 'react';
import { Zap, Power, Settings, Rocket, Flame, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'active' | 'inactive' | 'running';
  category: 'automation' | 'analysis' | 'exploitation' | 'monitoring';
}

export default function PowerTools() {
  const [tools, setTools] = useState<Tool[]>([
    {
      id: '1',
      name: 'Auto Exploit',
      description: 'Automated exploit chain execution',
      icon: <Rocket className="w-5 h-5" />,
      status: 'inactive',
      category: 'exploitation',
    },
    {
      id: '2',
      name: 'Traffic Analyzer',
      description: 'Real-time network traffic analysis',
      icon: <Activity className="w-5 h-5" />,
      status: 'inactive',
      category: 'monitoring',
    },
    {
      id: '3',
      name: 'Payload Generator',
      description: 'Generate custom exploit payloads',
      icon: <Flame className="w-5 h-5" />,
      status: 'inactive',
      category: 'exploitation',
    },
    {
      id: '4',
      name: 'Auto Scanner',
      description: 'Automated vulnerability scanning',
      icon: <Zap className="w-5 h-5" />,
      status: 'inactive',
      category: 'automation',
    },
  ]);

  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const handleToggleTool = (id: string) => {
    setTools((prev) =>
      prev.map((tool) =>
        tool.id === id
          ? { ...tool, status: tool.status === 'active' ? 'inactive' : 'active' }
          : tool
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-neon-green/20 border-neon-green/50 text-neon-green';
      case 'running':
        return 'bg-cyber-blue/20 border-cyber-blue/50 text-cyber-blue';
      default:
        return 'bg-muted/20 border-border/30 text-muted-foreground';
    }
  };

  const categories = ['all', 'automation', 'analysis', 'exploitation', 'monitoring'] as const;
  const [activeCategory, setActiveCategory] = useState<typeof categories[number]>('all');

  const filteredTools =
    activeCategory === 'all'
      ? tools
      : tools.filter((tool) => tool.category === activeCategory);

  return (
    <div className="relative glass-strong rounded-2xl p-8 backdrop-blur-strong border border-border/50 shadow-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cyber-blue/5 via-transparent to-neon-green/5 animate-pulse" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyber-blue/20 text-cyber-blue">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground" style={{
                textShadow: '0 0 10px rgba(0, 212, 255, 0.5)',
              }}>Power Tools</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Advanced automation and exploitation tools
              </p>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-lg border font-medium transition-colors whitespace-nowrap ${
                activeCategory === category
                  ? 'bg-cyber-blue/20 border-cyber-blue/50 text-cyber-blue'
                  : 'bg-muted/20 border-border/30 text-muted-foreground hover:border-border/50'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTools.map((tool) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedTool(tool.id)}
              className={`p-6 rounded-xl border cursor-pointer transition-all hover:scale-105 ${
                selectedTool === tool.id
                  ? 'bg-cyber-blue/20 border-cyber-blue/50'
                  : 'bg-muted/20 border-border/30 hover:border-border/50'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-cyber-blue/20 text-cyber-blue">
                  {tool.icon}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleTool(tool.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${getStatusColor(tool.status)}`}
                >
                  {tool.status === 'active' ? 'ON' : 'OFF'}
                </button>
              </div>
              <h4 className="text-lg font-bold text-foreground mb-2">{tool.name}</h4>
              <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded bg-muted/50 text-xs text-muted-foreground">
                  {tool.category}
                </span>
                {tool.status === 'active' && (
                  <div className="flex items-center gap-1 text-xs text-neon-green">
                    <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                    Active
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
            <div className="text-2xl font-bold text-foreground mb-1">
              {tools.filter((t) => t.status === 'active').length}
            </div>
            <div className="text-xs text-muted-foreground uppercase">Active Tools</div>
          </div>
          <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
            <div className="text-2xl font-bold text-foreground mb-1">{tools.length}</div>
            <div className="text-xs text-muted-foreground uppercase">Total Tools</div>
          </div>
          <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
            <div className="text-2xl font-bold text-foreground mb-1">
              {tools.filter((t) => t.status === 'running').length}
            </div>
            <div className="text-xs text-muted-foreground uppercase">Running</div>
          </div>
        </div>
      </div>
    </div>
  );
}

