'use client';

import { useState } from 'react';
import { Zap, Loader2, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIIntelligentPayload() {
  const [target, setTarget] = useState('');
  const [payloadTypes, setPayloadTypes] = useState('sql_injection,xss');
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());
  const [copiedPayload, setCopiedPayload] = useState<string | null>(null);
  const [result, setResult] = useState<{
    error?: string;
    mock?: boolean;
    target?: string;
    payloads?: Record<string, {
      target_url?: string;
      payload_type?: string;
      generated_payloads?: string[];
      recommended_payloads?: string[];
      context_analysis?: Record<string, unknown>;
    }>;
    summary?: {
      total_payloads?: number;
      payload_types?: number;
      recommendations?: string[];
    };
  } | null>(null);

  const generate = async () => {
    if (!target) {
      setResult({ error: 'Please enter a target URL' });
      return;
    }
    
    setIsGenerating(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/ai/payload/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, payloadTypes: payloadTypes.split(',') }),
      });
      
      const data = await response.json();
      console.log('AI Payload Generator API Response:', JSON.stringify(data, null, 2).substring(0, 1500));
      
      if (data.success && data.result) {
        const resultData = {
          target: data.result.target,
          payloads: data.result.payloads || {},
          summary: data.result.summary || {},
          mock: data.mock || false
        };
        
        console.log('Setting payload result:', {
          payload_types: Object.keys(resultData.payloads).length,
          total_payloads: resultData.summary.total_payloads,
          payloads_structure: Object.keys(resultData.payloads).map(type => ({
            type,
            count: resultData.payloads[type]?.generated_payloads?.length || 0
          }))
        });
        
        setResult(resultData);
      } else {
        setResult({ error: data.error || 'Generation failed' });
      }
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Failed to generate' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-violet-500/30 shadow-2xl overflow-hidden group hover:border-violet-500/50 transition-all duration-300">
      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-violet-500 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-violet-500/30 to-violet-500/10 border border-violet-500/50 shadow-lg">
                <Zap className="w-5 h-5 text-violet-500" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5">AI Payload Generator</h3>
              <p className="text-xs text-muted-foreground">
                Intelligent adaptive payloads
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Target URL</label>
            <input type="url" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="https://target.com?id=1" className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Payload Types (comma-separated)</label>
            <input type="text" value={payloadTypes} onChange={(e) => setPayloadTypes(e.target.value)} placeholder="sql_injection,xss,command_injection" className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm" />
          </div>
          <button onClick={generate} disabled={isGenerating || !target} className="w-full px-4 py-2 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/50 text-violet-500 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
            {isGenerating ? <> <Loader2 className="w-4 h-4 animate-spin" /> Generating... </> : <> <Zap className="w-4 h-4" /> Generate Payloads </>}
          </button>
        </div>

        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 p-3 rounded-lg border text-xs ${result.error ? 'bg-red-400/10 border-red-400/50 text-red-400' : 'bg-dark-secondary/50 border-border/30'}`}>
            {result.error ? (
              <div className="font-semibold">✗ Error: {result.error}</div>
            ) : (
              <>
                {result.mock && <div className="text-[10px] text-yellow-400 mb-2">⚠️ Mock data</div>}
                {!result.mock && <div className="text-[10px] text-green-400 mb-2">✓ Real AI payload generation</div>}
                {result.summary && (
                  <div className="mb-2">
                    <div className="font-semibold mb-1">Generated:</div>
                    <div className="text-sm font-bold text-violet-400">{result.summary.total_payloads || 0} payloads</div>
                    <div className="text-[10px] opacity-80 mt-1">Types: {result.summary.payload_types || 0}</div>
                  </div>
                )}
                {result.payloads && typeof result.payloads === 'object' && Object.keys(result.payloads).length > 0 && (
                  <div className="mb-2 text-[10px]">
                    <div className="font-semibold mb-1">Payload Types:</div>
                    <div className="space-y-1 max-h-96 overflow-y-auto">
                      {Object.keys(result.payloads).slice(0, 5).map((type, idx) => {
                        const payloadData = result.payloads[type];
                        const payloads = payloadData?.generated_payloads || payloadData?.recommended_payloads || [];
                        const isExpanded = expandedTypes.has(type);
                        const displayPayloads = isExpanded ? payloads : payloads.slice(0, 3);
                        
                        return (
                          <div key={idx} className="p-2 bg-dark-secondary/30 rounded border border-border/20">
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-semibold">{type.replace('_', ' ').toUpperCase()}</div>
                              <div className="flex items-center gap-2">
                                <span className="opacity-80 text-[9px]">{payloads.length} payloads</span>
                                {payloads.length > 3 && (
                                  <button
                                    onClick={() => {
                                      const newExpanded = new Set(expandedTypes);
                                      if (isExpanded) {
                                        newExpanded.delete(type);
                                      } else {
                                        newExpanded.add(type);
                                      }
                                      setExpandedTypes(newExpanded);
                                    }}
                                    className="text-[8px] text-violet-400 hover:text-violet-300 flex items-center gap-1"
                                  >
                                    {isExpanded ? (
                                      <>Show Less <ChevronUp className="w-3 h-3" /></>
                                    ) : (
                                      <>Show All ({payloads.length}) <ChevronDown className="w-3 h-3" /></>
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                            {displayPayloads.length > 0 && (
                              <div className="space-y-1 max-h-64 overflow-y-auto">
                                {displayPayloads.map((payload: string, pIdx: number) => {
                                  const fullPayload = payload;
                                  const displayPayload = payload.length > 80 ? `${payload.substring(0, 80)}...` : payload;
                                  const isCopied = copiedPayload === `${type}-${pIdx}`;
                                  
                                  return (
                                    <div
                                      key={pIdx}
                                      className="group relative text-[8px] font-mono break-all bg-dark-secondary/50 p-2 rounded border border-border/10 hover:border-violet-500/30 transition-all"
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">{displayPayload}</div>
                                        <button
                                          onClick={async () => {
                                            try {
                                              await navigator.clipboard.writeText(fullPayload);
                                              setCopiedPayload(`${type}-${pIdx}`);
                                              setTimeout(() => setCopiedPayload(null), 2000);
                                            } catch (err) {
                                              console.error('Failed to copy:', err);
                                            }
                                          }}
                                          className="flex-shrink-0 text-[8px] text-violet-400 hover:text-violet-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                          title="Copy payload"
                                        >
                                          {isCopied ? (
                                            <Check className="w-3 h-3 text-green-400" />
                                          ) : (
                                            <Copy className="w-3 h-3" />
                                          )}
                                        </button>
                                      </div>
                                      {payload.length > 80 && (
                                        <div className="mt-1 text-[7px] opacity-60 italic">Full length: {payload.length} chars</div>
                                      )}
                                    </div>
                                  );
                                })}
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

