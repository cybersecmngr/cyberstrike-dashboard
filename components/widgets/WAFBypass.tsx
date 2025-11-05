'use client';

import { useState } from 'react';
import { Shield, Loader2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WAFBypass() {
  const [targetUrl, setTargetUrl] = useState('');
  const [payload, setPayload] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [result, setResult] = useState<{ 
    error?: string; 
    mock?: boolean; 
    wafDetected?: boolean; 
    wafDetection?: {
      wafDetected: boolean;
      wafType?: string;
      indicators?: string[];
      confidence?: string;
    };
    bypassMethods?: string[]; 
    obfuscatedPayload?: string;
    obfuscatedPayloads?: {
      obfuscations: Array<{
        method: string;
        payload: string;
        description: string;
      }>;
      total: number;
    };
    testResults?: Array<{
      method: string;
      statusCode?: number;
      blocked?: boolean;
      success?: boolean;
      error?: string;
    }>;
    note?: string;
  } | null>(null);

  const testBypass = async () => {
    if (!targetUrl || !payload) {
      setResult({ error: 'Please enter both target URL and payload' });
      return;
    }
    
    setIsTesting(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/waf/bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl, payload }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult({
          ...data.result,
          mock: data.mock || false
        });
      } else {
        setResult({
          error: data.error || 'WAF bypass test failed. Please try again.'
        });
      }
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : 'Failed to test bypass. Please try again.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-yellow-400/30 shadow-2xl overflow-hidden group hover:border-yellow-400/50 transition-all duration-300">
      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-400 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-yellow-400/30 to-yellow-400/10 border border-yellow-400/50 shadow-lg">
                <Shield className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5">WAF Bypass</h3>
              <p className="text-xs text-muted-foreground">
                WAF detection, bypass techniques, payload obfuscation
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Target URL
            </label>
            <input
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://example.com/api"
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Payload
            </label>
            <textarea
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              placeholder="SELECT * FROM users"
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm font-mono"
            />
          </div>
          <button
            onClick={testBypass}
            disabled={isTesting || !targetUrl || !payload}
            className="w-full px-4 py-2 rounded-lg bg-yellow-400/20 hover:bg-yellow-400/30 border border-yellow-400/50 text-yellow-400 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Test Bypass
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
                  <div className="text-[10px] text-yellow-400 mb-2">⚠️ Mock data (Install requests library: pip3 install requests)</div>
                )}
                {!result.mock && (
                  <div className="text-[10px] text-green-400 mb-2">✓ Real WAF bypass analysis</div>
                )}
                {result.wafDetection && (
                  <div className="mb-2">
                    <div className={`font-semibold mb-1 ${
                      result.wafDetection.wafDetected ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      WAF Detection: {result.wafDetection.wafDetected ? 'Yes ⚠️' : 'No ✓'}
                      {result.wafDetection.wafType && (
                        <span className="ml-2 text-xs">({result.wafDetection.wafType})</span>
                      )}
                    </div>
                    {result.wafDetection.indicators && result.wafDetection.indicators.length > 0 && (
                      <div className="text-[10px] opacity-80">
                        <ul className="list-disc list-inside">
                          {result.wafDetection.indicators.map((indicator: string, i: number) => (
                            <li key={i}>{indicator}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.wafDetection.confidence && (
                      <div className="text-[9px] opacity-70 mt-1">
                        Confidence: {result.wafDetection.confidence}
                      </div>
                    )}
                  </div>
                )}
                {result.wafDetected !== undefined && !result.wafDetection && (
                  <div className={`font-semibold mb-2 ${
                    result.wafDetected ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    WAF Detection: {result.wafDetected ? 'Yes ⚠️' : 'No ✓'}
                  </div>
                )}
                {result.obfuscatedPayloads && result.obfuscatedPayloads.obfuscations && (
                  <div className="mb-2">
                    <div className="font-semibold mb-1">
                      Obfuscated Payloads ({result.obfuscatedPayloads.total}):
                    </div>
                    <div className="text-[10px] space-y-1 max-h-40 overflow-y-auto">
                      {result.obfuscatedPayloads.obfuscations.slice(0, 5).map((obf: any, idx: number) => (
                        <div key={idx} className="p-1.5 bg-dark-secondary/30 rounded">
                          <div className="font-semibold text-blue-400">{obf.method}:</div>
                          <code className="text-[9px] break-all block mt-1">{obf.payload}</code>
                          {obf.description && (
                            <div className="text-[9px] opacity-70 mt-1">{obf.description}</div>
                          )}
                        </div>
                      ))}
                      {result.obfuscatedPayloads.obfuscations.length > 5 && (
                        <div className="text-[9px] opacity-60">
                          ... and {result.obfuscatedPayloads.obfuscations.length - 5} more obfuscations
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {result.obfuscatedPayload && !result.obfuscatedPayloads && (
                  <div className="mt-2">
                    <div className="font-semibold mb-1">Obfuscated Payload:</div>
                    <pre className="font-mono break-all text-[10px] bg-dark-secondary/30 p-2 rounded">{result.obfuscatedPayload}</pre>
                  </div>
                )}
                {result.bypassMethods && (
                  <div className="mb-2">
                    <div className="font-semibold mb-1">Bypass Methods ({result.bypassMethods.length}):</div>
                    <ul className="list-disc list-inside space-y-0.5 text-[10px] max-h-32 overflow-y-auto">
                      {result.bypassMethods.map((method: string, idx: number) => (
                        <li key={idx}>{method}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.testResults && result.testResults.length > 0 && (
                  <div className="mb-2">
                    <div className="font-semibold mb-1">Test Results:</div>
                    <div className="text-[10px] space-y-1">
                      {result.testResults.map((test: any, idx: number) => (
                        <div key={idx} className="p-1 bg-dark-secondary/30 rounded">
                          <span className="font-semibold">{test.method}:</span>
                          {test.statusCode && <span className="ml-1">Status {test.statusCode}</span>}
                          {test.blocked !== undefined && (
                            <span className={`ml-2 ${test.blocked ? 'text-red-400' : 'text-green-400'}`}>
                              {test.blocked ? '🔒 Blocked' : '✓ Passed'}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {result.note && (
                  <div className="text-[10px] opacity-80 mt-2">{result.note}</div>
                )}
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

