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
import NetworkScanner from '@/components/dock-tools/NetworkScanner';
import VulnerabilityScanner from '@/components/dock-tools/VulnerabilityScanner';
import DatabaseExplorer from '@/components/dock-tools/DatabaseExplorer';
import CodeEditor from '@/components/dock-tools/CodeEditor';
import EncryptionTool from '@/components/dock-tools/EncryptionTool';
import KeyManager from '@/components/dock-tools/KeyManager';
import PowerTools from '@/components/dock-tools/PowerTools';
import SecurityShield from '@/components/dock-tools/SecurityShield';
import MACAddressChanger from '@/components/widgets/MACAddressChanger';
import IPAddressChanger from '@/components/widgets/IPAddressChanger';
import FingerprintSpoofer from '@/components/widgets/FingerprintSpoofer';
import SSLAnalyzer from '@/components/widgets/SSLAnalyzer';
import ReverseShellGenerator from '@/components/widgets/ReverseShellGenerator';
import SubdomainEnumerator from '@/components/widgets/SubdomainEnumerator';
import DNSEnumerator from '@/components/widgets/DNSEnumerator';
import AutomatedVulnScanner from '@/components/widgets/AutomatedVulnScanner';
import ReportGenerator from '@/components/widgets/ReportGenerator';
import LogAnalyzer from '@/components/widgets/LogAnalyzer';
import PasswordGenerator from '@/components/widgets/PasswordGenerator';
import SQLInjectionTester from '@/components/widgets/SQLInjectionTester';
import WhoIsLookup from '@/components/widgets/WhoIsLookup';
import AdvancedHashGenerator from '@/components/widgets/AdvancedHashGenerator';
import DirectoryBruteforcer from '@/components/widgets/DirectoryBruteforcer';
import AdvancedPortScanner from '@/components/widgets/AdvancedPortScanner';
import EncoderDecoder from '@/components/widgets/EncoderDecoder';
import ExploitPayloadGenerator from '@/components/widgets/ExploitPayloadGenerator';
import APISecurityTester from '@/components/widgets/APISecurityTester';
import NetworkTrafficAnalyzer from '@/components/widgets/NetworkTrafficAnalyzer';
import MalwareAnalyzer from '@/components/widgets/MalwareAnalyzer';
import SETToolkit from '@/components/widgets/SETToolkit';
import WirelessAttackSuite from '@/components/widgets/WirelessAttackSuite';
import ForensicTools from '@/components/widgets/ForensicTools';
import AdvancedRecon from '@/components/widgets/AdvancedRecon';
import PostExploit from '@/components/widgets/PostExploit';
import WAFBypass from '@/components/widgets/WAFBypass';
import ContainerSecurity from '@/components/widgets/ContainerSecurity';
import WebAppScanner from '@/components/widgets/WebAppScanner';
import APISecurityScanner from '@/components/widgets/APISecurityScanner';
import CryptoSecurityScanner from '@/components/widgets/CryptoSecurityScanner';
import CloudInfrastructureScanner from '@/components/widgets/CloudInfrastructureScanner';
import ADSecurityScanner from '@/components/widgets/ADSecurityScanner';
import ZeroDayHunter from '@/components/widgets/ZeroDayHunter';
import BehavioralBiometricBypass from '@/components/widgets/BehavioralBiometricBypass';
import QuantumCryptoAnalyzer from '@/components/widgets/QuantumCryptoAnalyzer';
import MemoryForensicExploiter from '@/components/widgets/MemoryForensicExploiter';
import MultiVectorOrchestrator from '@/components/widgets/MultiVectorOrchestrator';
import WebPenFramework from '@/components/widgets/WebPenFramework';
import NetworkPenTester from '@/components/widgets/NetworkPenTester';
import AIVulnPredictor from '@/components/widgets/AIVulnPredictor';
import ExploitChainBuilder from '@/components/widgets/ExploitChainBuilder';
import ThreatIntelMapper from '@/components/widgets/ThreatIntelMapper';
import AdvancedPersistence from '@/components/widgets/AdvancedPersistence';
import EvasionAntiForensics from '@/components/widgets/EvasionAntiForensics';
import AISocialEngineering from '@/components/widgets/AISocialEngineering';
import AdvancedCryptoBreaker from '@/components/widgets/AdvancedCryptoBreaker';
import ProtocolFuzzer from '@/components/widgets/ProtocolFuzzer';
import AIAttackSurfaceDiscovery from '@/components/widgets/AIAttackSurfaceDiscovery';
import AIIntelligentPayload from '@/components/widgets/AIIntelligentPayload';
import AIAdaptiveFuzzer from '@/components/widgets/AIAdaptiveFuzzer';
import AIBehavioralAnalyzer from '@/components/widgets/AIBehavioralAnalyzer';
import AISecurityBypass from '@/components/widgets/AISecurityBypass';
import AIPredictiveScanner from '@/components/widgets/AIPredictiveScanner';
import AIAutonomousAgent from '@/components/widgets/AIAutonomousAgent';
import AIFullAutoPentest from '@/components/widgets/AIFullAutoPentest';
import IQ200UltimatePentest from '@/components/widgets/IQ200UltimatePentest';
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
  Zap,
  Brain,
} from 'lucide-react';

type TabType = 'dashboard' | 'tools' | 'scanner' | 'osint' | 'advanced' | 'zde' | 'ai' | 'ccc';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showBanner, setShowBanner] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [activeDockTool, setActiveDockTool] = useState<string | null>(null);

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: Shield },
    { id: 'tools' as TabType, label: 'Tools', icon: Code2 },
    { id: 'scanner' as TabType, label: 'Scanner', icon: Scan },
    { id: 'osint' as TabType, label: 'OSINT', icon: Search },
    { id: 'advanced' as TabType, label: 'Advanced', icon: Zap },
    { id: 'zde' as TabType, label: 'Z.D.E', icon: Bug },
    { id: 'ai' as TabType, label: 'AI', icon: Brain },
    { id: 'ccc' as TabType, label: 'C.C.C', icon: Terminal },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f0f10' }}>
      {/* Main Content */}
      <div className="w-full" style={{ marginTop: '180px', paddingTop: '20px' }}>
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

        {/* Navigation Header - Koyu Gri Solid */}
        <div className="fixed top-0 left-0 right-0 z-50" style={{ backgroundColor: '#1a1a1c', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between py-4">
              {/* Logo Section with Animation */}
              <motion.div 
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="absolute inset-0 bg-neon-green/20 blur-lg rounded-lg animate-pulse" />
                  <Terminal className="w-6 h-6 text-neon-green relative z-10" />
                </motion.div>
                <motion.h1 
                  className="text-xl font-bold font-mono"
                  style={{ color: '#00B000' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  zencefil efendi
                </motion.h1>
                <motion.div
                  className="flex items-center gap-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                  <span className="text-xs text-muted-foreground ml-2">ACTIVE</span>
                </motion.div>
              </motion.div>

              {/* Navigation Tabs with Icons */}
              <div className="flex items-center gap-2">
                {tabs.map((tab, index) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all overflow-hidden ${
                        isActive
                          ? 'text-neon-green'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {/* Active Background */}
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 bg-neon-green/10 border border-neon-green/30 rounded-lg"
                          layoutId="activeTab"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      {/* Hover Background */}
                      <motion.div
                        className="absolute inset-0 bg-muted/30 rounded-lg"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                      />
                      <Icon 
                        className={`w-4 h-4 relative z-10 ${isActive ? 'animate-pulse' : ''}`}
                      />
                      <span className="relative z-10">{tab.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full px-4 py-3">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Terminal Widget - Show at top when active */}
            {showTerminal && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-bold text-foreground">Terminal</h2>
                  <button
                    onClick={() => setShowTerminal(false)}
                    className="px-2 py-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs transition-colors"
                  >
                    Close
                  </button>
                </div>
                <TerminalWidget />
              </motion.div>
            )}

            {/* Security Shield - Show when dock tool 2 is active */}
            {activeDockTool === '2' && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-bold text-foreground">Security Shield</h2>
                  <button
                    onClick={() => setActiveDockTool(null)}
                    className="px-2 py-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs transition-colors"
                  >
                    Close
                  </button>
                </div>
                <SecurityShield />
              </motion.div>
            )}

            {/* Network Tools Section - EN ÜST - 3 Widget Yan Yana */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyber-blue to-neon-green rounded-lg blur-lg opacity-50 animate-pulse" />
                    <div className="relative p-2 rounded-lg bg-gradient-to-br from-cyber-blue/20 to-neon-green/20 border border-cyber-blue/30 backdrop-blur-sm">
                      <Network className="w-4 h-4 text-cyber-blue" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground" style={{
                      textShadow: '0 0 15px rgba(0, 212, 255, 0.5)',
                    }}>Network Tools</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Advanced network manipulation & fingerprint spoofing
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neon-green/10 border border-neon-green/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                  <span className="text-[10px] font-medium text-neon-green">ACTIVE</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <MACAddressChanger />
                <IPAddressChanger />
                <FingerprintSpoofer />
                <SSLAnalyzer />
                <ReverseShellGenerator />
                <SubdomainEnumerator />
                <DNSEnumerator />
                <AutomatedVulnScanner />
                <ReportGenerator />
                <LogAnalyzer />
                <PasswordGenerator />
                <SQLInjectionTester />
                <WhoIsLookup />
                <AdvancedHashGenerator />
                <DirectoryBruteforcer />
                <AdvancedPortScanner />
                <EncoderDecoder />
                <ExploitPayloadGenerator />
                <APISecurityTester />
                <NetworkTrafficAnalyzer />
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <ExploitCounter initialCount={192} />
              <div className="glass-card rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-cyber-blue" />
                  <h3 className="text-sm font-semibold text-foreground">System Health</h3>
                </div>
                <div className="text-2xl font-bold text-neon-green mb-1">98.5%</div>
                <div className="text-[10px] text-muted-foreground">All systems operational</div>
              </div>
            </div>

            {/* Pwned Databases - Full Width */}
            <div className="mb-3">
              <PwnedDatabases />
            </div>

            {/* Main Charts - Stacked */}
            <div className="space-y-3">
              <LiveAttackChart />
              <TargetSystems />
            </div>
          </motion.div>
        )}

        {/* Tools Tab */}
        {activeTab === 'tools' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Database Explorer */}
            {activeDockTool === '4' && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">Database Explorer</h2>
                  <button
                    onClick={() => setActiveDockTool(null)}
                    className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm transition-colors"
                  >
                    Close
                  </button>
                </div>
                <DatabaseExplorer />
              </motion.div>
            )}

            {/* Code Editor */}
            {activeDockTool === '5' && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">Code Editor</h2>
                  <button
                    onClick={() => setActiveDockTool(null)}
                    className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm transition-colors"
                  >
                    Close
                  </button>
                </div>
                <CodeEditor />
              </motion.div>
            )}

            {/* Encryption Tool */}
            {activeDockTool === '6' && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">Encryption Tool</h2>
                  <button
                    onClick={() => setActiveDockTool(null)}
                    className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm transition-colors"
                  >
                    Close
                  </button>
                </div>
                <EncryptionTool />
              </motion.div>
            )}

            {/* Key Manager */}
            {activeDockTool === '9' && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">Key Manager</h2>
                  <button
                    onClick={() => setActiveDockTool(null)}
                    className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm transition-colors"
                  >
                    Close
                  </button>
                </div>
                <KeyManager />
              </motion.div>
            )}

            {/* Power Tools */}
            {activeDockTool === '10' && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">Power Tools</h2>
                  <button
                    onClick={() => setActiveDockTool(null)}
                    className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm transition-colors"
                  >
                    Close
                  </button>
                </div>
                <PowerTools />
              </motion.div>
            )}

            {/* Default Tools View */}
            {!activeDockTool && (
              <>
                {/* Network Tools */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <MACAddressChanger />
                  <IPAddressChanger />
                </div>

                {/* Fingerprint Spoofer */}
                <div className="mb-6">
                  <FingerprintSpoofer />
                </div>

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
              </>
            )}
          </motion.div>
        )}

        {/* Scanner Tab */}
        {activeTab === 'scanner' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Network Scanner */}
            {activeDockTool === '3' && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">Network Scanner</h2>
                  <button
                    onClick={() => setActiveDockTool(null)}
                    className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm transition-colors"
                  >
                    Close
                  </button>
                </div>
                <NetworkScanner />
              </motion.div>
            )}

            {/* Vulnerability Scanner */}
            {activeDockTool === '7' && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">Vulnerability Scanner</h2>
                  <button
                    onClick={() => setActiveDockTool(null)}
                    className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm transition-colors"
                  >
                    Close
                  </button>
                </div>
                <VulnerabilityScanner />
              </motion.div>
            )}

            {/* Port Scanner */}
            {activeDockTool === '8' && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">Port Scanner</h2>
                  <button
                    onClick={() => setActiveDockTool(null)}
                    className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm transition-colors"
                  >
                    Close
                  </button>
                </div>
                <NetworkScanner />
              </motion.div>
            )}

            {/* Default Scanner View */}
            {!activeDockTool && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <WebAppScanner />
                <APISecurityScanner />
                <CryptoSecurityScanner />
                <CloudInfrastructureScanner />
                <ADSecurityScanner />
              </div>
            )}
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

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <MalwareAnalyzer />
              <SETToolkit />
              <WirelessAttackSuite />
              <ForensicTools />
              <AdvancedRecon />
              <PostExploit />
              <WAFBypass />
              <ContainerSecurity />
            </div>
          </motion.div>
        )}

        {/* Z.D.E (Zero Day Exploit) Tab */}
        {activeTab === 'zde' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <ZeroDayHunter />
              <BehavioralBiometricBypass />
              <QuantumCryptoAnalyzer />
              <MemoryForensicExploiter />
              <MultiVectorOrchestrator />
              <WebPenFramework />
              <NetworkPenTester />
              <AIVulnPredictor />
              <ExploitChainBuilder />
              <ThreatIntelMapper />
              <AdvancedPersistence />
              <EvasionAntiForensics />
              <AISocialEngineering />
              <AdvancedCryptoBreaker />
              <ProtocolFuzzer />
            </div>
          </motion.div>
        )}

        {/* AI Tab */}
        {activeTab === 'ai' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <AIFullAutoPentest />
              <AIAttackSurfaceDiscovery />
              <AIIntelligentPayload />
              <AIAdaptiveFuzzer />
              <AIBehavioralAnalyzer />
              <AISecurityBypass />
              <AIPredictiveScanner />
              <AIAutonomousAgent />
            </div>
          </motion.div>
        )}

        {/* CCC Tab - Custom Claude Code */}
        {activeTab === 'ccc' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* IQ 200 Ultimate Pentest - Main Tool */}
            <IQ200UltimatePentest />

            {/* Features Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Aggressive Data Exfiltrator */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(26, 26, 28, 0.95) 0%, rgba(15, 15, 16, 0.95) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Database className="w-8 h-8 text-neon-green" />
                  <div>
                    <h3 className="text-lg font-bold text-neon-green">Aggressive Data Exfiltrator</h3>
                    <p className="text-xs text-muted-foreground">SQL Injection → Complete Database Dump</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-neon-green mt-1.5" />
                    <div>
                      <p className="text-foreground font-medium">Database Reconnaissance</p>
                      <p className="text-xs text-muted-foreground">Version, name, user, privileges, all databases</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-neon-green mt-1.5" />
                    <div>
                      <p className="text-foreground font-medium">Table Enumeration</p>
                      <p className="text-xs text-muted-foreground">information_schema → All tables, prioritized by sensitivity</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-neon-green mt-1.5" />
                    <div>
                      <p className="text-foreground font-medium">Column Discovery</p>
                      <p className="text-xs text-muted-foreground">15 columns per table with intelligent mapping</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-neon-green mt-1.5" />
                    <div>
                      <p className="text-foreground font-medium">Data Extraction</p>
                      <p className="text-xs text-muted-foreground">5 rows per table → users, passwords, API keys, credentials</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(0, 176, 0, 0.05)', border: '1px solid rgba(0, 176, 0, 0.2)' }}>
                  <p className="text-xs font-mono text-neon-green">
                    ✅ UNION SELECT → ✅ information_schema → ✅ CONCAT_WS → ✅ Proof of Compromise
                  </p>
                </div>
              </motion.div>

              {/* Advanced File Hunter */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(26, 26, 28, 0.95) 0%, rgba(15, 15, 16, 0.95) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <FileCode className="w-8 h-8 text-neon-green" />
                  <div>
                    <h3 className="text-lg font-bold text-neon-green">Advanced File Hunter</h3>
                    <p className="text-xs text-muted-foreground">Command Injection → Recursive File Exfiltration</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-neon-green mt-1.5" />
                    <div>
                      <p className="text-foreground font-medium">File Discovery (6 Categories)</p>
                      <p className="text-xs text-muted-foreground">credentials, config, source, database, backups, logs</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-neon-green mt-1.5" />
                    <div>
                      <p className="text-foreground font-medium">Recursive Search</p>
                      <p className="text-xs text-muted-foreground">find /var/www, /home → locate → head -10 per pattern</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-neon-green mt-1.5" />
                    <div>
                      <p className="text-foreground font-medium">Content Extraction</p>
                      <p className="text-xs text-muted-foreground">cat → 30 lines → 2000 chars per file</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-neon-green mt-1.5" />
                    <div>
                      <p className="text-foreground font-medium">Sensitive Data Patterns</p>
                      <p className="text-xs text-muted-foreground">passwords, API keys, secrets, DB creds, hosts, users</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(0, 176, 0, 0.05)', border: '1px solid rgba(0, 176, 0, 0.2)' }}>
                  <p className="text-xs font-mono text-neon-green">
                    📁 .env → 📁 config.php → 📁 id_rsa → 📁 .aws/credentials → 📁 database.yml
                  </p>
                </div>
              </motion.div>
            </div>

          </motion.div>
        )}
        </div>
      </div>

      {/* Cyber Dock - Always visible */}
      <CyberDock 
        onToolClick={(toolId) => {
          setActiveDockTool(toolId);
          if (toolId === '1') { // Terminal
            setShowTerminal(true);
            setActiveTab('dashboard');
          } else if (toolId === '2') { // Security Shield
            setActiveTab('dashboard');
          } else if (toolId === '3') { // Network Scanner
            setActiveTab('scanner');
          } else if (toolId === '4') { // Database Explorer
            setActiveTab('tools');
          } else if (toolId === '5') { // Code Editor
            setActiveTab('tools');
          } else if (toolId === '6') { // Encryption Tool
            setActiveTab('tools');
          } else if (toolId === '7') { // Vulnerability Scanner
            setActiveTab('scanner');
          } else if (toolId === '8') { // Port Scanner
            setActiveTab('scanner');
          } else if (toolId === '9') { // Key Manager
            setActiveTab('tools');
          } else if (toolId === '10') { // Power Tools
            setActiveTab('tools');
          } else {
            setActiveTab('dashboard');
          }
        }}
      />
    </div>
  );
}
