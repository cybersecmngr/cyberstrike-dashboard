'use client';

import { useState } from 'react';
import { Brain, Zap, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIVulnPredictor() {
  const [target, setTarget] = useState('');
  const [analysisType, setAnalysisType] = useState('url');
  const [isPredicting, setIsPredicting] = useState(false);
  const [result, setResult] = useState<{
    error?: string;
    mock?: boolean;
    predictions?: Array<{
      type?: string;
      vulnerability?: string;
      parameter?: string;
      confidence?: number;
      reason?: string;
    }>;
    overall_risk?: string;
    confidence?: number;
  } | null>(null);

  const predictVulnerabilities = async () => {
    if (!target) {
      setResult({ error: 'Please enter a target URL or code' });
      return;
    }
    
    setIsPredicting(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/ai/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, analysisType }),
      });
      
      const data = await response.json();
      if (data.success) {
        setResult({ ...data.result, mock: data.mock || false });
      } else {
        setResult({ error: data.error || 'Prediction failed' });
      }
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Failed to predict' });
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-purple-500/30 shadow-2xl overflow-hidden group hover:border-purple-500/50 transition-all duration-300">
      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-purple-500/30 to-purple-500/10 border border-purple-500/50 shadow-lg">
                <Brain className="w-5 h-5 text-purple-500" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5">AI Vuln Predictor</h3>
              <p className="text-xs text-muted-foreground">
                ML-based vulnerability prediction
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Target URL or Code
            </label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="https://example.com?id=1 or code snippet"
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Analysis Type
            </label>
            <select
              value={analysisType}
              onChange={(e) => setAnalysisType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm"
            >
              <option value="url">URL Analysis</option>
              <option value="code">Code Analysis</option>
            </select>
          </div>
          <button
            onClick={predictVulnerabilities}
            disabled={isPredicting || !target}
            className="w-full px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-500 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isPredicting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Predicting...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Predict Vulnerabilities
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
                  <div className="text-[10px] text-green-400 mb-2">✓ Real AI prediction</div>
                )}
                {result.overall_risk && (
                  <div className="mb-2">
                    <div className="font-semibold mb-1">Overall Risk:</div>
                    <div className={`text-lg font-bold ${
                      result.overall_risk === 'critical' ? 'text-red-400' :
                      result.overall_risk === 'high' ? 'text-orange-400' :
                      result.overall_risk === 'medium' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {result.overall_risk.toUpperCase()}
                    </div>
                  </div>
                )}
                {result.confidence !== undefined && (
                  <div className="mb-2">
                    <div className="font-semibold mb-1">Confidence:</div>
                    <div className="text-sm font-bold text-blue-400">{(result.confidence * 100).toFixed(1)}%</div>
                  </div>
                )}
                {result.predictions && result.predictions.length > 0 && (
                  <div className="mb-2">
                    <div className="font-semibold mb-1">Predictions:</div>
                    <div className="text-[10px] space-y-1 max-h-40 overflow-y-auto">
                      {result.predictions.map((pred, idx: number) => (
                        <div key={idx} className="p-1.5 bg-dark-secondary/30 rounded">
                          <div className="font-semibold">{pred.type || pred.vulnerability}</div>
                          <div className="text-[9px] opacity-80 mt-1">
                            {pred.confidence && <div>Confidence: {(pred.confidence * 100).toFixed(0)}%</div>}
                            {pred.reason && <div>{pred.reason}</div>}
                            {pred.parameter && <div>Parameter: {pred.parameter}</div>}
                          </div>
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

