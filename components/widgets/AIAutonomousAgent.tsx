'use client';

import { useState } from 'react';
import { Bot, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIAutonomousAgent() {
  const [target, setTarget] = useState('');
  const [maxStages, setMaxStages] = useState('5');
  const [isRunning, setIsRunning] = useState(false);
  interface AttackFinding {
    type: string;
    value?: string;
    endpoint?: string;
    severity?: string;
    confidence?: number;
    method?: string;
    payload?: string;
    parameter?: string;
    shell_url?: string;
    accessible?: boolean;
    timestamp?: string;
    reason?: string;
    message?: string;
  }

  interface AttackStage {
    stage: string;
    status?: string;
    findings?: AttackFinding[];
    vulnerabilities?: Array<{
      type: string;
      payload?: string;
      parameter?: string;
      severity?: string;
    }>;
    success?: boolean;
  }

  const [result, setResult] = useState<{
    error?: string;
    mock?: boolean;
    attack_chain?: AttackStage[];
    summary?: {
      stages_completed?: number;
      vulnerabilities_found?: number;
      exploits_successful?: number;
      access_gained?: boolean;
      data_exfiltrated?: boolean;
    };
    vulnerabilities_found?: Array<{
      type: string;
      severity?: string;
      payload?: string;
      parameter?: string;
    }>;
    exploits_successful?: string[];
    access_gained?: boolean;
  } | null>(null);

  const run = async () => {
    if (!target) {
      setResult({ error: 'Please enter a target' });
      return;
    }
    
    setIsRunning(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/ai/autonomous/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, maxStages: parseInt(maxStages) }),
      });
      
      const data = await response.json();
      if (data.success) {
        setResult({ ...data.result, mock: data.mock || false });
      } else {
        setResult({ error: data.error || 'Execution failed' });
      }
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Failed to run' });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-sky-500/30 shadow-2xl overflow-hidden group hover:border-sky-500/50 transition-all duration-300">
      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-sky-500 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-sky-500/30 to-sky-500/10 border border-sky-500/50 shadow-lg">
                <Bot className="w-5 h-5 text-sky-500" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5">AI Autonomous Agent</h3>
              <p className="text-xs text-muted-foreground">
                Self-learning pentest agent
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Target</label>
            <input type="text" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="target.com" className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Max Stages</label>
            <input type="number" value={maxStages} onChange={(e) => setMaxStages(e.target.value)} placeholder="5" className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm" />
          </div>
          <button onClick={run} disabled={isRunning || !target} className="w-full px-4 py-2 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/50 text-sky-500 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
            {isRunning ? <> <Loader2 className="w-4 h-4 animate-spin" /> Running... </> : <> <Bot className="w-4 h-4" /> Execute Autonomous Test </>}
          </button>
        </div>

        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 p-3 rounded-lg border text-xs ${result.error ? 'bg-red-400/10 border-red-400/50 text-red-400' : 'bg-dark-secondary/50 border-border/30'}`}>
            {result.error ? (
              <div className="font-semibold">✗ Error: {result.error}</div>
            ) : (
              <>
                {result.mock && <div className="text-[10px] text-yellow-400 mb-2">⚠️ Mock data</div>}
                {!result.mock && <div className="text-[10px] text-green-400 mb-2">✓ Real autonomous agent</div>}
                {result.summary && (
                  <div className="mb-2">
                    <div className="font-semibold mb-1">Attack Summary:</div>
                    <div className="text-[10px] space-y-1">
                      <div>Stages: {result.summary.stages_completed || 0}</div>
                      <div>Vulnerabilities: {result.summary.vulnerabilities_found || 0}</div>
                      <div>Exploits: {result.summary.exploits_successful || 0}</div>
                      <div className={result.summary.access_gained ? 'text-green-400 font-bold' : 'text-red-400'}>
                        Access: {result.summary.access_gained ? '✓ GAINED' : '✗ Not Gained'}
                      </div>
                      <div className={result.summary.data_exfiltrated ? 'text-green-400 font-bold' : 'text-red-400'}>
                        Data: {result.summary.data_exfiltrated ? '✓ EXFILTRATED' : '✗ Not Exfiltrated'}
                      </div>
                      {result.exploits_successful && result.exploits_successful.length > 0 && (
                        <div className="text-orange-400 font-bold">
                          Exploits: {result.exploits_successful.join(', ').toUpperCase()}
                        </div>
                      )}
                      {result.vulnerabilities_found && result.vulnerabilities_found.length > 0 && (
                        <div className="text-red-400 font-bold">
                          Vulnerabilities: {result.vulnerabilities_found.length} FOUND
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {result.attack_chain && result.attack_chain.length > 0 && (
                  <div className="mb-2 text-[10px]">
                    <div className="font-semibold mb-1">Attack Chain ({result.attack_chain.length} stages):</div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {result.attack_chain.map((stage, idx) => {
                        const hasExploits = stage.findings?.some((f) => 
                          f.type?.includes('exploitation_successful') || 
                          f.type?.includes('web_shell') ||
                          f.type?.includes('access_gained')
                        ) ?? false;
                        const hasVulns = (stage.vulnerabilities?.length ?? 0) > 0;
                        
                        return (
                          <div key={idx} className={`p-2 rounded border ${
                            hasExploits ? 'bg-green-400/20 border-green-400/50' :
                            hasVulns ? 'bg-orange-400/20 border-orange-400/50' :
                            stage.success ? 'bg-green-400/10 border-green-400/30' : 
                            'bg-red-400/10 border-red-400/30'
                          }`}>
                            <div className="font-semibold flex items-center justify-between">
                              <span>{idx + 1}. {stage.stage?.replace('_', ' ').toUpperCase()}</span>
                              {hasExploits && <span className="text-red-400 text-[8px]">⚠️ EXPLOITED</span>}
                            </div>
                            <div className="opacity-80 text-[9px] mt-1">
                              Findings: {stage.findings?.length || stage.vulnerabilities?.length || 0}
                            </div>
                            {hasVulns && stage.vulnerabilities && (
                              <div className="mt-1 space-y-1">
                                {stage.vulnerabilities.slice(0, 2).map((vuln, vIdx) => (
                                  <div key={vIdx} className="text-[8px] bg-red-400/20 p-1 rounded">
                                    <div className="font-semibold text-red-400">
                                      {vuln.type?.toUpperCase() || 'VULNERABILITY'}
                                    </div>
                                    {vuln.payload && (
                                      <div className="opacity-80 font-mono text-[7px]">
                                        Payload: {vuln.payload.substring(0, 40)}...
                                      </div>
                                    )}
                                    {vuln.parameter && (
                                      <div className="opacity-80 text-[7px]">
                                        Parameter: {vuln.parameter}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            {hasExploits && stage.findings && (
                              <div className="mt-1 space-y-1">
                                {stage.findings.filter((f) => 
                                  f.type?.includes('exploitation') || 
                                  f.type?.includes('web_shell') ||
                                  f.type?.includes('access_gained')
                                ).map((finding, fIdx) => (
                                  <div key={fIdx} className="text-[8px] bg-red-400/30 p-1 rounded border border-red-400/50">
                                    <div className="font-bold text-red-400">
                                      ✓ {finding.type?.replace('_', ' ').toUpperCase()}
                                    </div>
                                    {finding.payload && (
                                      <div className="font-mono text-[7px] opacity-90">
                                        {finding.payload.substring(0, 50)}...
                                      </div>
                                    )}
                                    {finding.shell_url && (
                                      <div className="text-[7px] opacity-90">
                                        Shell: {finding.shell_url}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

