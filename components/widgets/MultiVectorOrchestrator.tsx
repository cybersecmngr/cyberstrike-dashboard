'use client';

import { useState } from 'react';
import { Network, Zap, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MultiVectorOrchestrator() {
  const [target, setTarget] = useState('');
  const [objective, setObjective] = useState('data_theft');
  const [complexity, setComplexity] = useState('medium');
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [result, setResult] = useState<{
    error?: string;
    mock?: boolean;
    target?: string;
    objective?: string;
    complexity?: string;
    attack_chain?: Array<{
      stage_id: number;
      name: string;
      attack_type: string;
      payload: string;
      success_probability: number;
      impact: string;
    }>;
    executionResults?: {
      stages_executed?: Array<{
        stage_id: number;
        name: string;
        success: boolean;
        execution_time: number;
      }>;
      stages_failed?: Array<{
        stage_id: number;
        name: string;
        success: boolean;
        reason?: string;
        missing_dependencies?: number[];
      }>;
      success_rate?: number;
    };
    execution_results?: {
      stages_executed?: Array<{
        stage_id: number;
        name: string;
        success: boolean;
        execution_time: number;
      }>;
      stages_failed?: Array<{
        stage_id: number;
        name: string;
        success: boolean;
        reason?: string;
        missing_dependencies?: number[];
      }>;
      success_rate?: number;
    };
    successRate?: number;
    risk_assessment?: {
      overall_risk?: string;
      detection_probability?: string;
    };
  } | null>(null);

  const orchestrateAttack = async () => {
    if (!target) {
      setResult({ error: 'Please enter a target' });
      return;
    }
    
    setIsOrchestrating(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/multivector/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, objective, complexity }),
      });
      
      const data = await response.json();
      if (data.success) {
        setResult({ ...data.result, mock: data.mock || false });
      } else {
        setResult({ error: data.error || 'Orchestration failed' });
      }
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Failed to orchestrate' });
    } finally {
      setIsOrchestrating(false);
    }
  };

  return (
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-cyan-500/30 shadow-2xl overflow-hidden group hover:border-cyan-500/50 transition-all duration-300">
      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-cyan-500/30 to-cyan-500/10 border border-cyan-500/50 shadow-lg">
                <Network className="w-5 h-5 text-cyan-500" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5">Multi-Vector Orchestrator</h3>
              <p className="text-xs text-muted-foreground">
                Coordinated attack simulation
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Target
            </label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="target.com"
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Objective
            </label>
            <select
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm"
            >
              <option value="data_theft">Data Theft</option>
              <option value="system_compromise">System Compromise</option>
              <option value="network_penetration">Network Penetration</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Complexity
            </label>
            <select
              value={complexity}
              onChange={(e) => setComplexity(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <button
            onClick={orchestrateAttack}
            disabled={isOrchestrating || !target}
            className="w-full px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-500 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isOrchestrating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Orchestrating...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Orchestrate Attack
              </>
            )}
          </button>
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-3 rounded-lg border text-xs ${
              result.error
                ? 'bg-red-400/10 border-red-400/50 text-red-400'
                : 'bg-dark-secondary/50 border-border/30'
            }`}
          >
            {result.error ? (
              <div className="font-semibold">✗ Error: {result.error}</div>
            ) : (
              <>
                {result.mock && (
                  <div className="text-[10px] text-yellow-400 mb-2">⚠️ Mock data</div>
                )}
                {!result.mock && (
                  <div className="text-[10px] text-green-400 mb-2">✓ Real attack orchestration</div>
                )}
                {result.target && (
                  <div className="mb-2 text-[10px]">
                    <div className="font-semibold">Target:</div>
                    <div className="opacity-80">{result.target}</div>
                    {result.objective && (
                      <div className="mt-1">
                        <span className="font-semibold">Objective:</span> {result.objective}
                      </div>
                    )}
                    {result.complexity && (
                      <div>
                        <span className="font-semibold">Complexity:</span> {result.complexity}
                      </div>
                    )}
                  </div>
                )}
                {(result.successRate !== undefined || result.executionResults?.success_rate !== undefined || result.execution_results?.success_rate !== undefined) && (
                  <div className="mb-2">
                    <div className="font-semibold mb-1">Success Rate:</div>
                    <div className="text-lg font-bold text-green-400">
                      {result.successRate ?? result.executionResults?.success_rate ?? result.execution_results?.success_rate ?? 0}%
                    </div>
                  </div>
                )}
                {(result.executionResults || result.execution_results) && (
                  <div className="mb-2">
                    <div className="font-semibold mb-1">Execution Results:</div>
                    <div className="text-[10px] space-y-1">
                      {(() => {
                        const execResults = result.executionResults || result.execution_results;
                        if (!execResults) return null;
                        
                        return (
                          <>
                            <div className="flex gap-3">
                              <span className="text-green-400">
                                Executed: {execResults.stages_executed?.length || 0}
                              </span>
                              <span className="text-red-400">
                                Failed: {execResults.stages_failed?.length || 0}
                              </span>
                            </div>
                            {execResults.stages_executed && execResults.stages_executed.length > 0 && (
                              <div className="mt-2 max-h-32 overflow-y-auto">
                                <div className="font-semibold mb-1">Successful Stages:</div>
                                {execResults.stages_executed.map((stage, idx) => (
                                  <div key={idx} className="p-1 bg-green-400/10 rounded text-[9px] mb-1">
                                    <div className="font-semibold text-green-400">✓ {stage.name}</div>
                                    <div className="opacity-70">Time: {stage.execution_time?.toFixed(2)}s</div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {execResults.stages_failed && execResults.stages_failed.length > 0 && (
                              <div className="mt-2 max-h-32 overflow-y-auto">
                                <div className="font-semibold mb-1 text-red-400">Failed Stages:</div>
                                {execResults.stages_failed.map((stage, idx) => (
                                  <div key={idx} className="p-1 bg-red-400/10 rounded text-[9px] mb-1">
                                    <div className="font-semibold text-red-400">✗ {stage.name}</div>
                                    {stage.reason && (
                                      <div className="text-[8px] opacity-70 mt-0.5">{stage.reason}</div>
                                    )}
                                    {stage.missing_dependencies && stage.missing_dependencies.length > 0 && (
                                      <div className="text-[8px] opacity-70 mt-0.5">
                                        Missing deps: {stage.missing_dependencies.join(', ')}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
                {result.attack_chain && result.attack_chain.length > 0 && (
                  <div className="mb-2">
                    <div className="font-semibold mb-1">Attack Chain ({result.attack_chain.length} stages):</div>
                    <div className="text-[10px] space-y-1 max-h-40 overflow-y-auto">
                      {result.attack_chain.map((stage, idx) => (
                        <div key={idx} className="p-1.5 bg-dark-secondary/30 rounded">
                          <div className="font-semibold">{stage.stage_id}. {stage.name}</div>
                          <div className="text-[9px] opacity-80 mt-1">
                            <div>Type: {stage.attack_type}</div>
                            <div>Success Prob: {(stage.success_probability * 100).toFixed(0)}%</div>
                            <div>Impact: {stage.impact}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {result.risk_assessment && (
                  <div className="mb-2">
                    <div className="font-semibold mb-1">Risk Assessment:</div>
                    <div className="text-[10px] space-y-1">
                      <div>
                        <span className="font-semibold">Overall Risk:</span>{' '}
                        <span className={result.risk_assessment.overall_risk === 'High' ? 'text-red-400' : result.risk_assessment.overall_risk === 'Medium' ? 'text-yellow-400' : 'text-green-400'}>
                          {result.risk_assessment.overall_risk}
                        </span>
                      </div>
                      {result.risk_assessment.detection_probability && (
                        <div>
                          <span className="font-semibold">Detection:</span> {result.risk_assessment.detection_probability}
                        </div>
                      )}
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

