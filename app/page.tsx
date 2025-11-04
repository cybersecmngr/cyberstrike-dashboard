'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import ExploitCounter from '@/components/ExploitCounter';
import TargetSystems from '@/components/TargetSystems';
import LiveAttackChart from '@/components/LiveAttackChart';
import TerminalWidget from '@/components/TerminalWidget';
import CyberDock from '@/components/CyberDock';
import XSSPayloadGenerator from '@/components/XSSPayloadGenerator';
import HashCracker from '@/components/HashCracker';
import PwnedDatabases from '@/components/PwnedDatabases';
import ASCIIBanner from '@/components/ASCIIBanner';
import { RealTimeScanner } from '@/components/RealTimeScanner';
import Sidebar from '@/components/Sidebar';
import {
  Shield,
  Activity,
  Terminal,
  Code2,
  Database,
  Scan,
  Bug,
  Search,
  Wifi,
  Network,
  FileCode,
} from 'lucide-react';

type TabType = 'dashboard' | 'tools' | 'scanner' | 'osint';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showBanner, setShowBanner] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: Shield },
    { id: 'tools' as TabType, label: 'Tools', icon: Code2 },
    { id: 'scanner' as TabType, label: 'Scanner', icon: Scan },
    { id: 'osint' as TabType, label: 'OSINT', icon: Search },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar activeTool={activeTool || undefined} onToolSelect={setActiveTool} />

      {/* Main Content */}
      <div className="flex-1 lg:ml-72">
        {/* ASCII Banner */}
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="border-b border-neon-green/30 bg-dark-bg"
          >
            <div className="relative">
              <ASCIIBanner
                autoStart={true}
                speed={15}
                onComplete={() => setTimeout(() => setShowBanner(false), 2000)}
              />
              <button
                onClick={() => setShowBanner(false)}
                className="absolute top-4 right-4 px-3 py-1 rounded-lg bg-dark-secondary/80 hover:bg-dark-secondary text-muted-foreground hover:text-foreground transition-colors text-xs"
              >
                Skip
              </button>
            </div>
          </motion.div>
        )}

        {/* Navigation Tabs */}
        <div className="sticky top-0 z-40 bg-dark-bg/95 backdrop-blur-lg border-b border-border/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-2 py-4">
              <Terminal className="w-5 h-5 text-neon-green" />
              <h1 className="text-xl font-bold mr-8" style={{ color: '#00B000' }}>zencefil efendi</h1>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-neon-green/20 text-neon-green border border-neon-green/50'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <ExploitCounter initialCount={192} />
              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="w-5 h-5 text-cyber-blue" />
                  <h3 className="text-lg font-semibold text-foreground">System Health</h3>
                </div>
                <div className="text-4xl font-bold text-neon-green mb-2">98.5%</div>
                <div className="text-xs text-muted-foreground">All systems operational</div>
              </div>
            </div>

            {/* Pwned Databases - Full Width */}
            <div className="mb-6">
              <PwnedDatabases />
            </div>

            {/* Main Charts - Stacked */}
            <div className="space-y-6">
              <LiveAttackChart />
              <TargetSystems />
            </div>

            {/* Terminal Widget */}
            <TerminalWidget />
          </motion.div>
        )}

        {/* Tools Tab */}
        {activeTab === 'tools' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <XSSPayloadGenerator />
              <HashCracker />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Wifi className="w-5 h-5 text-cyber-blue" />
                  <h3 className="text-lg font-semibold text-foreground">WiFi Analyzer</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Scan networks, capture handshakes, and perform deauth attacks
                </p>
                <button className="w-full py-2 rounded-lg bg-neon-green/10 hover:bg-neon-green/20 text-neon-green border border-neon-green/30 transition-colors text-sm font-medium">
                  Open WiFi Analyzer
                </button>
              </div>

              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Network className="w-5 h-5 text-danger-red" />
                  <h3 className="text-lg font-semibold text-foreground">Reverse Shell</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate payloads and manage reverse shell sessions
                </p>
                <button className="w-full py-2 rounded-lg bg-neon-green/10 hover:bg-neon-green/20 text-neon-green border border-neon-green/30 transition-colors text-sm font-medium">
                  Open Shell Manager
                </button>
              </div>

              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileCode className="w-5 h-5 text-cyber-blue" />
                  <h3 className="text-lg font-semibold text-foreground">ExploitDB</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Search exploits, CVE database, and view PoC code
                </p>
                <button className="w-full py-2 rounded-lg bg-neon-green/10 hover:bg-neon-green/20 text-neon-green border border-neon-green/30 transition-colors text-sm font-medium">
                  Open ExploitDB
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Scanner Tab */}
        {activeTab === 'scanner' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <RealTimeScanner />
          </motion.div>
        )}

        {/* OSINT Tab */}
        {activeTab === 'osint' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Search className="w-5 h-5 text-cyber-blue" />
                  <h3 className="text-lg font-semibold text-foreground">Shodan Search</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Search for devices, services, and vulnerabilities using Shodan API
                </p>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Search query (e.g., apache)"
                    className="w-full px-4 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-neon-green/50"
                  />
                  <button className="w-full py-2 rounded-lg bg-neon-green/10 hover:bg-neon-green/20 text-neon-green border border-neon-green/30 transition-colors text-sm font-medium">
                    Search Shodan
                  </button>
                </div>
              </div>

              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Bug className="w-5 h-5 text-danger-red" />
                  <h3 className="text-lg font-semibold text-foreground">TheHarvester</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Gather emails, subdomains, hosts, and employee names from public sources
                </p>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Domain (e.g., example.com)"
                    className="w-full px-4 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-neon-green/50"
                  />
                  <button className="w-full py-2 rounded-lg bg-neon-green/10 hover:bg-neon-green/20 text-neon-green border border-neon-green/30 transition-colors text-sm font-medium">
                    Run TheHarvester
                  </button>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-5 h-5 text-cyber-blue" />
                <h3 className="text-lg font-semibold text-foreground">Social Media Search</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Search for profiles across multiple social media platforms
              </p>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Username"
                  className="w-full px-4 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-neon-green/50"
                />
                <div className="flex gap-2">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input type="checkbox" defaultChecked className="rounded" />
                    Twitter
                  </label>
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input type="checkbox" defaultChecked className="rounded" />
                    GitHub
                  </label>
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input type="checkbox" defaultChecked className="rounded" />
                    LinkedIn
                  </label>
                </div>
                <button className="w-full py-2 rounded-lg bg-neon-green/10 hover:bg-neon-green/20 text-neon-green border border-neon-green/30 transition-colors text-sm font-medium">
                  Search Profiles
                </button>
              </div>
            </div>
          </motion.div>
        )}
        </div>
      </div>

      {/* Cyber Dock - Always visible */}
      <CyberDock />
    </div>
  );
}
