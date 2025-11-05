'use client';

import { useState } from 'react';
import { FileText, Download, Loader2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReportData {
  title: string;
  date: string;
  targets: string[];
  vulnerabilities: Array<{
    severity: string;
    type: string;
    description: string;
    target: string;
  }>;
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export default function ReportGenerator() {
  const [reportTitle, setReportTitle] = useState('Security Assessment Report');
  const [reportFormat, setReportFormat] = useState<'html' | 'markdown'>('html');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generateReport = async () => {
    setIsGenerating(true);
    setGenerated(false);

    try {
      const response = await fetch('/api/report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: reportTitle,
          format: reportFormat,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Download the report
        const blob = new Blob([data.report], { 
          type: reportFormat === 'html' ? 'text/html' : 'text/markdown' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `security_report_${new Date().toISOString().split('T')[0]}.${reportFormat === 'html' ? 'html' : 'md'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setGenerated(true);
        setTimeout(() => setGenerated(false), 3000);
      }
    } catch {
      // Error handling
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-emerald-400/30 shadow-2xl overflow-hidden group hover:border-emerald-400/50 transition-all duration-300">
      {/* Animated gradient background - Emerald */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to bottom right, rgba(52, 211, 153, 0.1), transparent 50%, rgba(16, 185, 129, 0.05))',
        }}
      />
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 70% 20%, rgba(52, 211, 153, 0.15), transparent 50%)',
        }}
      />
      
      {/* Glow effect */}
      <div 
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to right, rgb(52, 211, 153), rgb(16, 185, 129), rgb(5, 150, 105))',
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-400 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-emerald-400/30 to-emerald-400/10 border border-emerald-400/50 shadow-lg">
                <FileText className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5" style={{
                textShadow: '0 0 15px rgba(52, 211, 153, 0.6)',
              }}>Report Generator</h3>
              <p className="text-xs text-muted-foreground">
                Generate professional security reports
              </p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Report Title
            </label>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              placeholder="Security Assessment Report"
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Format
            </label>
            <select
              value={reportFormat}
              onChange={(e) => setReportFormat(e.target.value as 'html' | 'markdown')}
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            >
              <option value="html">HTML</option>
              <option value="markdown">Markdown</option>
            </select>
          </div>
          <button
            onClick={generateReport}
            disabled={isGenerating || !reportTitle}
            className="w-full px-4 py-2 rounded-lg bg-emerald-400/20 hover:bg-emerald-400/30 border border-emerald-400/50 text-emerald-400 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : generated ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Report Generated!
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Generate Report
              </>
            )}
          </button>
        </div>

        {/* Info */}
        <div className="p-3 rounded-lg bg-muted/20 border border-border/20">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Note:</strong> Report includes all scan results, vulnerabilities, and recommendations from current session.
          </p>
        </div>
      </div>
    </div>
  );
}

