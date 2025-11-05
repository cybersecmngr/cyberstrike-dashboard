'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIAttackSurfaceDiscovery() {
  const [target, setTarget] = useState('');
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [result, setResult] = useState<{
    error?: string;
    mock?: boolean;
    discovery_results?: {
      base_url?: string;
      discovered_endpoints?: Array<{
        endpoint: string;
        url: string;
        status_code: number;
        risk_level: string;
        risk_score: number;
        vulnerability_probability: number;
        content_type: string;
        size: number;
        accessible: boolean;
      }>;
      technology_stack?: Record<string, string[]>;
      attack_surface_score?: number;
      vulnerability_predictions?: Array<{
        endpoint: string;
        predicted_vulnerabilities: Array<string | null>;
        confidence: number;
      }>;
    };
    summary?: {
      endpoints_found?: number;
      attack_surface_score?: number;
      vulnerabilities_predicted?: number;
    };
  } | null>(null);

  const discover = async () => {
    if (!target) {
      setResult({ error: 'Please enter a target URL' });
      return;
    }
    
    setIsDiscovering(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/ai/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target }),
      });
      
      const data = await response.json();
      console.log('API Response:', JSON.stringify(data, null, 2).substring(0, 1000));
      
      if (data.success && data.result) {
        // Extract discovery_results and summary from result
        // Handle both direct result and nested result structure
        const resultObj = data.result || {};
        const discoveryResults = resultObj.discovery_results || {};
        const summary = resultObj.summary || {};
        
        // If summary is empty but discovery_results has data, create summary from discovery_results
        if (!summary.endpoints_found && discoveryResults.discovered_endpoints) {
          summary.endpoints_found = discoveryResults.discovered_endpoints.length;
        }
        if (!summary.attack_surface_score && discoveryResults.attack_surface_score) {
          summary.attack_surface_score = discoveryResults.attack_surface_score;
        }
        if (!summary.vulnerabilities_predicted && discoveryResults.vulnerability_predictions) {
          summary.vulnerabilities_predicted = discoveryResults.vulnerability_predictions.length;
        }
        
        const resultData = {
          discovery_results: discoveryResults,
          summary: summary,
          target: resultObj.target || data.result?.target,
          recommendations: resultObj.recommendations || [],
          message: resultObj.message,
          mock: data.mock || false
        };
        
        console.log('Setting result:', {
          endpoints_found: resultData.summary.endpoints_found,
          attack_surface_score: resultData.summary.attack_surface_score,
          has_discovery_results: !!resultData.discovery_results,
          discovered_endpoints: resultData.discovery_results?.discovered_endpoints?.length || 0,
          summary_keys: Object.keys(resultData.summary),
          discovery_keys: Object.keys(resultData.discovery_results)
        });
        
        setResult(resultData);
      } else {
        setResult({ error: data.error || 'Discovery failed' });
      }
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Failed to discover' });
    } finally {
      setIsDiscovering(false);
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
                <Search className="w-5 h-5 text-cyan-500" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5">AI Surface Discovery</h3>
              <p className="text-xs text-muted-foreground">
                ML-powered attack surface mapping
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Target URL</label>
            <input type="url" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="https://target.com" className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm" />
          </div>
          <button onClick={discover} disabled={isDiscovering || !target} className="w-full px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-500 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
            {isDiscovering ? <> <Loader2 className="w-4 h-4 animate-spin" /> Discovering... </> : <> <Search className="w-4 h-4" /> Discover Attack Surface </>}
          </button>
        </div>

        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 p-3 rounded-lg border text-xs ${result.error ? 'bg-red-400/10 border-red-400/50 text-red-400' : 'bg-dark-secondary/50 border-border/30'}`}>
            {result.error ? (
              <div className="font-semibold">✗ Error: {result.error}</div>
            ) : (
              <>
                {result.mock && <div className="text-[10px] text-yellow-400 mb-2">⚠️ Mock data</div>}
                {!result.mock && <div className="text-[10px] text-green-400 mb-2">✓ Real AI discovery</div>}
                {result.summary && (
                  <div className="mb-2">
                    <div className="font-semibold mb-1">Discovery Summary:</div>
                    <div className="text-[10px] space-y-1">
                      <div>Endpoints: {result.summary.endpoints_found || 0}</div>
                      <div>Attack Surface: {result.summary.attack_surface_score?.toFixed(1) || 0}/100</div>
                      <div>Vulnerabilities: {result.summary.vulnerabilities_predicted || 0}</div>
                    </div>
                  </div>
                )}
                {result.discovery_results && result.discovery_results.discovered_endpoints && result.discovery_results.discovered_endpoints.length > 0 && (
                  <div className="mb-2 text-[10px]">
                    <div className="font-semibold mb-1">Endpoints ({result.discovery_results.discovered_endpoints.length}):</div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {result.discovery_results.discovered_endpoints.slice(0, 5).map((ep, idx: number) => (
                        <div key={idx} className="p-1 bg-dark-secondary/30 rounded">
                          <div className="font-semibold">{ep.endpoint}</div>
                          <div className="opacity-80 text-[9px]">Risk: {ep.risk_level} ({ep.risk_score})</div>
                        </div>
                      ))}
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

