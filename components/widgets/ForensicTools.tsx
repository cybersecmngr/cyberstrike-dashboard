'use client';

import { useState } from 'react';
import { FileSearch, Upload, Loader2, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForensicTools() {
  const [file, setFile] = useState<File | null>(null);
  const [toolType, setToolType] = useState('carve');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ error?: string; mock?: boolean; message?: string; note?: string; [key: string]: unknown } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setResult(null);
  };

  const processFile = async () => {
    if (!file) {
      setResult({ error: 'Please select a file first' });
      return;
    }
    
    setIsProcessing(true);
    setResult(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('toolType', toolType);

      const response = await fetch('/api/forensic/analyze', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult({
          ...data.result,
          mock: data.mock || false
        });
      } else {
        setResult({
          error: data.error || 'Analysis failed. Please try again.'
        });
      }
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : 'Failed to process file. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-blue-400/30 shadow-2xl overflow-hidden group hover:border-blue-400/50 transition-all duration-300">
      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-blue-400/30 to-blue-400/10 border border-blue-400/50 shadow-lg">
                <FileSearch className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5">Forensic Tools</h3>
              <p className="text-xs text-muted-foreground">
                File carving, memory analysis, log correlation, timeline
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Tool Type
            </label>
            <select
              value={toolType}
              onChange={(e) => setToolType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm"
            >
              <option value="carve">File Carving</option>
              <option value="memory">Memory Dump Analysis</option>
              <option value="log">Log Correlation</option>
              <option value="timeline">Timeline Generation</option>
              <option value="metadata">Metadata Extraction</option>
            </select>
          </div>
          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-dark-secondary/50 border-border/50 hover:border-blue-400/50 transition-colors">
            <Upload className="w-6 h-6 mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              {file ? file.name : 'Upload file'}
            </p>
            <input type="file" className="hidden" onChange={handleFileUpload} />
          </label>
          <button
            onClick={processFile}
            disabled={isProcessing || !file}
            className="w-full px-4 py-2 rounded-lg bg-blue-400/20 hover:bg-blue-400/30 border border-blue-400/50 text-blue-400 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Analyze
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
                  <div className="text-[10px] text-yellow-400 mb-2">⚠️ Mock data (Python script may not be available)</div>
                )}
                {result.message && (
                  <div className="mb-2 font-semibold text-green-400">✓ {result.message}</div>
                )}
                {result.note && (
                  <div className="text-[10px] opacity-80 mb-2">{result.note}</div>
                )}
                <pre className="whitespace-pre-wrap break-all text-[10px] mt-2 max-h-40 overflow-y-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

