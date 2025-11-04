'use client';

import { useState } from 'react';
import { Shield, CheckCircle2, AlertTriangle, XCircle, Activity, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface SecurityStatus {
  firewall: 'active' | 'inactive' | 'warning';
  antivirus: 'active' | 'inactive' | 'warning';
  encryption: 'active' | 'inactive' | 'warning';
  intrusion: 'active' | 'inactive' | 'warning';
  updates: 'active' | 'inactive' | 'warning';
}

interface Threat {
  id: string;
  type: 'malware' | 'intrusion' | 'vulnerability' | 'suspicious';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  timestamp: Date;
  status: 'blocked' | 'detected' | 'investigating';
}

export default function SecurityShield() {
  const [status, setStatus] = useState<SecurityStatus>({
    firewall: 'active',
    antivirus: 'active',
    encryption: 'active',
    intrusion: 'active',
    updates: 'warning',
  });

  const [threats, setThreats] = useState<Threat[]>([
    {
      id: '1',
      type: 'intrusion',
      severity: 'critical',
      description: 'Unauthorized access attempt from 192.168.1.100',
      timestamp: new Date('2024-01-20T10:30:00'),
      status: 'blocked',
    },
    {
      id: '2',
      type: 'malware',
      severity: 'high',
      description: 'Malicious file detected: trojan.exe',
      timestamp: new Date('2024-01-20T09:15:00'),
      status: 'blocked',
    },
    {
      id: '3',
      type: 'vulnerability',
      severity: 'medium',
      description: 'Outdated software detected: OpenSSL 1.1.1',
      timestamp: new Date('2024-01-20T08:00:00'),
      status: 'investigating',
    },
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="w-5 h-5 text-neon-green" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <XCircle className="w-5 h-5 text-danger-red" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-neon-green/20 border-neon-green/50 text-neon-green';
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-500';
      default:
        return 'bg-danger-red/20 border-danger-red/50 text-danger-red';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-danger-red/20 border-danger-red/50 text-danger-red';
      case 'high':
        return 'bg-orange-500/20 border-orange-500/50 text-orange-500';
      case 'medium':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-500';
      default:
        return 'bg-cyber-blue/20 border-cyber-blue/50 text-cyber-blue';
    }
  };

  const overallHealth =
    Object.values(status).filter((s) => s === 'active').length / Object.keys(status).length;

  return (
    <div className="relative glass-strong rounded-2xl p-8 backdrop-blur-strong border border-border/50 shadow-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 via-transparent to-cyber-blue/5 animate-pulse" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-neon-green/20 text-neon-green">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground" style={{
                textShadow: '0 0 10px rgba(0, 255, 65, 0.5)',
              }}>Security Shield</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time security monitoring and protection
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-neon-green mb-1">
              {(overallHealth * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground">System Health</div>
          </div>
        </div>

        {/* Security Status */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {Object.entries(status).map(([key, value]) => (
            <div
              key={key}
              className={`p-4 rounded-lg border ${getStatusColor(value)}`}
            >
              <div className="flex items-center justify-between mb-2">
                {getStatusIcon(value)}
                <span className="text-xs font-medium uppercase">{key}</span>
              </div>
              <div className="text-sm font-semibold capitalize">{value}</div>
            </div>
          ))}
        </div>

        {/* Recent Threats */}
        <div className="mb-6">
          <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-danger-red" />
            Recent Threats
          </h4>
          <div className="space-y-3 max-h-96 overflow-auto">
            {threats.map((threat) => (
              <motion.div
                key={threat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-lg bg-muted/30 border border-border/30"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg border ${getSeverityColor(threat.severity)}`}>
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground">{threat.type.toUpperCase()}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${getSeverityColor(threat.severity)}`}>
                          {threat.severity}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{threat.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium mb-2 ${
                      threat.status === 'blocked'
                        ? 'bg-neon-green/20 text-neon-green border border-neon-green/50'
                        : threat.status === 'investigating'
                        ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50'
                        : 'bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/50'
                    }`}>
                      {threat.status.toUpperCase()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {threat.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-neon-green/10 border border-neon-green/30">
            <div className="text-2xl font-bold text-neon-green mb-1">
              {threats.filter((t) => t.status === 'blocked').length}
            </div>
            <div className="text-xs text-muted-foreground uppercase">Blocked</div>
          </div>
          <div className="p-4 rounded-lg bg-cyber-blue/10 border border-cyber-blue/30">
            <div className="text-2xl font-bold text-cyber-blue mb-1">{threats.length}</div>
            <div className="text-xs text-muted-foreground uppercase">Total Threats</div>
          </div>
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <div className="text-2xl font-bold text-yellow-500 mb-1">
              {threats.filter((t) => t.status === 'investigating').length}
            </div>
            <div className="text-xs text-muted-foreground uppercase">Investigating</div>
          </div>
        </div>
      </div>
    </div>
  );
}

