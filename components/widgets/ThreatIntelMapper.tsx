'use client';

import { useState } from 'react';
import { Map, Shield, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThreatIntelMapper() {
  const [target, setTarget] = useState('');
  const [isMapping, setIsMapping] = useState(false);
  const [result, setResult] = useState<{
    error?: string;
    mock?: boolean;
    attack_surface_map?: any;
    threat_intelligence?: any;
    risk_assessment?: { overall_risk_score?: number; risk_level?: string; exposed_components?: number };
  } | null>(null);

  const mapAttackSurface = async () => {
    if (!target) {
      setResult({ error: 'Please enter a target' });
      return;
    }
    
    setIsMapping(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/threat/map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target }),
      });
      
      const data = await response.json();
      if (data.success) {
        setResult({ ...data.result, mock: data.mock || false });
      } else {
        setResult({ error: data.error || 'Mapping failed' });
      }
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Failed to map' });
    } finally {
      setIsMapping(false);
    }
  };

  return (
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-teal-500/30 shadow-2xl overflow-hidden group hover:border-teal-500/50 transition-all duration-300">
      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-teal-500 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-teal-500/30 to-teal-500/10 border border-teal-500/50 shadow-lg">
                <Map className="w-5 h-5 text-teal-500" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5">Threat Intel Mapper</h3>
              <p className="text-xs text-muted-foreground">
                Attack surface & threat intelligence
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Target URL or IP
            </label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="example.com or 192.168.1.1"
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm"
            />
          </div>
          <button
            onClick={mapAttackSurface}
            disabled={isMapping || !target}
            className="w-full px-4 py-2 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/50 text-teal-500 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isMapping ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Mapping...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Map Attack Surface
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
                  <div className="text-[10px] text-green-400 mb-2">✓ Real threat intelligence</div>
                )}
                {result.risk_assessment && (
                  <div className="mb-2">
                    <div className="font-semibold mb-1">Risk Assessment:</div>
                    <div className="text-[10px] space-y-1">
                      <div>
                        <span className="font-semibold">Risk Level:</span>{' '}
                        <span className={
                          result.risk_assessment.risk_level === 'critical' ? 'text-red-400' :
                          result.risk_assessment.risk_level === 'high' ? 'text-orange-400' :
                          result.risk_assessment.risk_level === 'medium' ? 'text-yellow-400' :
                          'text-green-400'
                        }>
                          {result.risk_assessment.risk_level?.toUpperCase()}
                        </span>
                      </div>
                      {result.risk_assessment.overall_risk_score !== undefined && (
                        <div>
                          <span className="font-semibold">Risk Score:</span> {result.risk_assessment.overall_risk_score}/100
                        </div>
                      )}
                      {result.risk_assessment.exposed_components !== undefined && (
                        <div>
                          <span className="font-semibold">Exposed Components:</span> {result.risk_assessment.exposed_components}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {result.attack_surface_map && result.attack_surface_map.exposed_components && (
                  <div className="mb-2">
                    <div className="font-semibold mb-1">Exposed Components:</div>
                    <div className="text-[10px] space-y-1 max-h-32 overflow-y-auto">
                      {result.attack_surface_map.exposed_components.map((comp: string, idx: number) => (
                        <div key={idx} className="p-1 bg-yellow-400/10 rounded">
                          {comp}
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

