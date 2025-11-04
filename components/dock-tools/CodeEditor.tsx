'use client';

import { useState } from 'react';
import { Code, Play, Save, FileCode, Terminal, Download, Upload } from 'lucide-react';
import { motion } from 'framer-motion';

interface File {
  id: string;
  name: string;
  content: string;
  language: 'python' | 'javascript' | 'bash' | 'sql' | 'html';
}

export default function CodeEditor() {
  const [files, setFiles] = useState<File[]>([
    { id: '1', name: 'exploit.py', content: '#!/usr/bin/env python3\n\nimport requests\nimport sys\n\n# Custom exploit script\ntarget = sys.argv[1] if len(sys.argv) > 1 else "http://target.com"\n\nprint(f"[*] Scanning {target}...")\n', language: 'python' },
  ]);
  const [activeFile, setActiveFile] = useState<string>('1');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const currentFile = files.find((f) => f.id === activeFile);

  const handleSave = () => {
    // Save file logic
    console.log('Saving file:', currentFile);
  };

  const handleRun = async () => {
    if (!currentFile) return;

    setIsRunning(true);
    setOutput('');

    try {
      // Simulate code execution
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockOutput = `[+] Executing ${currentFile.name}...\n[+] Target: http://target.com\n[+] Scanning ports...\n[+] Found 3 open ports: 80, 443, 8080\n[+] Scan completed successfully!`;

      setOutput(mockOutput);
    } catch (error) {
      setOutput(`Error: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleContentChange = (content: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === activeFile ? { ...f, content } : f))
    );
  };

  const getLanguageIcon = (lang: string) => {
    switch (lang) {
      case 'python':
        return '🐍';
      case 'javascript':
        return '📜';
      case 'bash':
        return '💻';
      case 'sql':
        return '🗄️';
      case 'html':
        return '🌐';
      default:
        return '📄';
    }
  };

  return (
    <div className="relative glass-strong rounded-2xl p-8 backdrop-blur-strong border border-border/50 shadow-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cyber-blue/5 via-transparent to-neon-green/5 animate-pulse" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyber-blue/20 text-cyber-blue">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground" style={{
                textShadow: '0 0 10px rgba(0, 212, 255, 0.5)',
              }}>Code Editor</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Advanced code editor with syntax highlighting
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-cyber-blue/20 hover:bg-cyber-blue/30 border border-cyber-blue/50 text-cyber-blue font-medium transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="px-4 py-2 rounded-lg bg-neon-green/20 hover:bg-neon-green/30 border border-neon-green/50 text-neon-green font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              {isRunning ? 'Running...' : 'Run'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File Browser */}
          <div className="lg:col-span-1 space-y-4">
            <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileCode className="w-4 h-4" />
                Files
              </h4>
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => setActiveFile(file.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-center gap-2 ${
                      activeFile === file.id
                        ? 'bg-cyber-blue/20 border-cyber-blue/50'
                        : 'bg-muted/20 border-border/30 hover:border-border/50'
                    }`}
                  >
                    <span className="text-lg">{getLanguageIcon(file.language)}</span>
                    <span className="font-medium text-foreground text-sm flex-1">{file.name}</span>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted/70 border border-border/30 text-foreground text-sm transition-colors">
                + New File
              </button>
            </div>
          </div>

          {/* Editor */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-foreground">{currentFile?.name}</h4>
                <span className="px-3 py-1 rounded-full bg-cyber-blue/20 text-cyber-blue text-xs font-medium">
                  {currentFile?.language.toUpperCase()}
                </span>
              </div>
              <textarea
                value={currentFile?.content || ''}
                onChange={(e) => handleContentChange(e.target.value)}
                className="w-full h-96 px-4 py-3 rounded-lg bg-dark-secondary border border-border/50 text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyber-blue/50 resize-none"
                placeholder="Start coding..."
              />
            </div>

            {/* Output */}
            {output && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-dark-secondary border border-border/30"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Terminal className="w-4 h-4 text-neon-green" />
                  <h4 className="font-semibold text-foreground">Output</h4>
                </div>
                <pre className="text-sm text-foreground font-mono whitespace-pre-wrap overflow-auto max-h-48">
                  {output}
                </pre>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

