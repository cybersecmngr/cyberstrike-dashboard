'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Terminal, X } from 'lucide-react';
import { formatCommandPrompt, getAutoCompleteSuggestions } from '@/lib/terminal-utils';

interface TerminalOutput {
  type: 'command' | 'output' | 'error';
  content: string;
  timestamp: Date;
}

export default function TerminalWidget() {
  const [command, setCommand] = useState('');
  const [outputs, setOutputs] = useState<TerminalOutput[]>([
    {
      type: 'output',
      content: 'print("hoşgeldin zencefil efendi - güç seninle olsun")\n# Type "help" for available commands.\n',
      timestamp: new Date(),
    },
  ]);
  const [currentDir, setCurrentDir] = useState('/home/zencefil');
  const [isExecuting, setIsExecuting] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [outputs]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const executeCommand = useCallback(async (cmd: string) => {
    if (!cmd.trim()) return;

    // Add command to history
    setCommandHistory((prev) => {
      const newHistory = [...prev, cmd];
      return newHistory.slice(-100); // Keep last 100 commands
    });

    // Display command
    setOutputs((prev) => [
      ...prev,
      {
        type: 'command',
        content: formatCommandPrompt(currentDir) + cmd,
        timestamp: new Date(),
      },
    ]);

    setIsExecuting(true);

    try {
      const response = await fetch('/api/terminal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: cmd,
          cwd: currentDir,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Handle cd command separately
        if (cmd.trim().startsWith('cd ')) {
          const newDir = cmd.trim().substring(3).trim() || '/home/zencefil';
          setCurrentDir(newDir);
          setOutputs((prev) => [
            ...prev,
            {
              type: 'output',
              content: '',
              timestamp: new Date(),
            },
          ]);
        } else {
          setOutputs((prev) => [
            ...prev,
            {
              type: data.stderr ? 'error' : 'output',
              content: data.stdout || data.stderr || '',
              timestamp: new Date(),
            },
          ]);
        }
      } else {
        setOutputs((prev) => [
          ...prev,
          {
            type: 'error',
            content: data.error || data.stderr || 'Command execution failed',
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      setOutputs((prev) => [
        ...prev,
        {
          type: 'error',
          content: `Error: ${errorMessage}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsExecuting(false);
      setCommand('');
    }
  }, [currentDir]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim() && !isExecuting) {
      executeCommand(command.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Arrow Up - Previous command
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 
          ? commandHistory.length - 1 
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex]);
      }
    }
    // Arrow Down - Next command
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex < commandHistory.length) {
          setHistoryIndex(newIndex);
          setCommand(commandHistory[newIndex]);
        } else {
          setHistoryIndex(-1);
          setCommand('');
        }
      }
    }
    // Tab - Auto-complete
    else if (e.key === 'Tab') {
      e.preventDefault();
      if (autoCompleteSuggestions.length > 0) {
        setCommand(autoCompleteSuggestions[0]);
        setShowSuggestions(false);
      }
    }
    // Escape - Clear suggestions
    else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleCommandChange = (value: string) => {
    setCommand(value);
    setHistoryIndex(-1);
    
    if (value.trim()) {
      const suggestions = getAutoCompleteSuggestions(value, commandHistory);
      setAutoCompleteSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    setOutputs([
      {
        type: 'output',
        content: 'Terminal cleared.\n',
        timestamp: new Date(),
      },
    ]);
  };

  const highlightPythonSyntax = (text: string): React.ReactNode => {
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      // Empty line
      if (!line.trim()) {
        return <div key={lineIndex} className="py-0.5">&nbsp;</div>;
      }

      // Comment line
      if (line.trim().startsWith('#')) {
        return (
          <div key={lineIndex} className="py-0.5 font-mono">
            <span style={{ color: '#6A9955' }}>{line}</span>
          </div>
        );
      }

      // Python keywords
      const keywords = ['print', 'def', 'class', 'import', 'from', 'if', 'elif', 'else', 'for', 'while',
        'try', 'except', 'finally', 'with', 'as', 'return', 'yield', 'pass',
        'break', 'continue', 'lambda', 'and', 'or', 'not', 'in', 'is', 'True',
        'False', 'None', 'assert', 'raise', 'del', 'global', 'nonlocal'];

      // Find strings with regex
      const stringRegex = /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g;
      const parts: Array<{ text: string; type: 'string' | 'keyword' | 'normal' }> = [];
      let lastIndex = 0;
      let match;

      // Reset regex
      stringRegex.lastIndex = 0;
      
      while ((match = stringRegex.exec(line)) !== null) {
        // Add text before string
        if (match.index > lastIndex) {
          const beforeText = line.substring(lastIndex, match.index);
          const words = beforeText.split(/(\b|\W)/);
          
          words.forEach((word) => {
            if (word.trim()) {
              const cleanWord = word.replace(/[()]/g, '').trim();
              if (cleanWord && keywords.includes(cleanWord)) {
                parts.push({ text: word, type: 'keyword' });
              } else {
                parts.push({ text: word, type: 'normal' });
              }
            } else {
              parts.push({ text: word, type: 'normal' });
            }
          });
        }
        
        // Add string
        parts.push({ text: match[0], type: 'string' });
        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < line.length) {
        const remainingText = line.substring(lastIndex);
        const words = remainingText.split(/(\b|\W)/);
        
        words.forEach((word) => {
          if (word.trim()) {
            const cleanWord = word.replace(/[()]/g, '').trim();
            if (cleanWord && keywords.includes(cleanWord)) {
              parts.push({ text: word, type: 'keyword' });
            } else {
              parts.push({ text: word, type: 'normal' });
            }
          } else {
            parts.push({ text: word, type: 'normal' });
          }
        });
      }

      // If no strings found, process whole line
      if (parts.length === 0) {
        const words = line.split(/(\b|\W)/);
        words.forEach((word) => {
          if (word.trim()) {
            const cleanWord = word.replace(/[()]/g, '').trim();
            if (cleanWord && keywords.includes(cleanWord)) {
              parts.push({ text: word, type: 'keyword' });
            } else {
              parts.push({ text: word, type: 'normal' });
            }
          } else {
            parts.push({ text: word, type: 'normal' });
          }
        });
      }

      // Render
      return (
        <div key={lineIndex} className="py-0.5 font-mono">
          {parts.map((part, partIndex) => {
            if (part.type === 'string') {
              return (
                <span 
                  key={partIndex} 
                  style={{ color: '#CE9178' }}
                  className="font-mono"
                >
                  {part.text}
                </span>
              );
            } else if (part.type === 'keyword') {
              return (
                <span 
                  key={partIndex} 
                  style={{ color: '#569CD6' }}
                  className="font-mono font-semibold"
                >
                  {part.text}
                </span>
              );
            } else {
              return (
                <span 
                  key={partIndex} 
                  style={{ color: '#D4D4D4' }}
                  className="font-mono"
                >
                  {part.text}
                </span>
              );
            }
          })}
        </div>
      );
    });
  };

  const formatOutput = (output: TerminalOutput) => {
    if (output.type === 'command') {
      return (
        <div className="flex items-start gap-2 py-1">
          <span className="text-[#00B000] font-mono font-bold select-none">
            {'>_'}
          </span>
          <span className="text-foreground font-mono">{output.content}</span>
        </div>
      );
    } else if (output.type === 'error') {
      return (
        <div className="text-danger-red font-mono whitespace-pre-wrap py-1">
          {output.content}
        </div>
      );
    } else {
      // Check if it's the welcome message and apply Python syntax highlighting
      if (output.content.includes('print(') || output.content.includes('hoşgeldin')) {
        return (
          <div className="font-mono py-1">
            {highlightPythonSyntax(output.content)}
          </div>
        );
      }
      return (
        <div className="text-foreground font-mono whitespace-pre-wrap py-1">
          {output.content}
        </div>
      );
    }
  };

  return (
    <div className="relative glass-strong rounded-2xl overflow-hidden border border-border/50 shadow-2xl">
      {/* Terminal header */}
      <div className="bg-dark-secondary border-b border-border/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-[#00B000]" />
          <span className="text-sm font-medium text-foreground">Terminal</span>
          <span className="text-xs text-muted-foreground">zencefil@cyberstrike</span>
          {isExecuting && (
            <div className="flex items-center gap-2 text-xs text-neon-green">
              <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              <span>Executing...</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Clear terminal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Terminal output area */}
      <div
        ref={terminalRef}
        className="relative p-4 bg-[#0a0a0b] font-mono text-sm overflow-auto max-h-[500px] min-h-[400px]"
        style={{
          background: 'linear-gradient(135deg, #0a0a0b 0%, #0d1117 100%)',
        }}
      >
        {/* Matrix-style background effect */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 65, 0.03) 2px, rgba(0, 255, 65, 0.03) 4px)',
            }}
          />

        {/* Scan line effect */}
        <div className="absolute w-full h-px bg-neon-green/10 animate-scan-line" />
        </div>

        {/* Output content */}
        <div className="relative z-10">
          {outputs.map((output, index) => (
            <div key={index}>{formatOutput(output)}</div>
          ))}
        </div>
      </div>

      {/* Command input area */}
      <div className="bg-dark-secondary border-t border-border/50 px-4 py-3 relative">
        {/* Auto-complete suggestions */}
        {showSuggestions && autoCompleteSuggestions.length > 0 && (
          <div className="absolute bottom-full left-0 right-0 mb-1 bg-dark-secondary border border-border/50 rounded-lg p-2 max-h-32 overflow-auto">
            {autoCompleteSuggestions.slice(0, 5).map((suggestion, index) => (
              <div
                key={index}
                className="px-2 py-1 hover:bg-muted rounded text-xs font-mono text-foreground cursor-pointer"
                onClick={() => {
                  setCommand(suggestion);
                  setShowSuggestions(false);
                  inputRef.current?.focus();
                }}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <span className="text-[#00B000] font-mono font-bold select-none">
            {formatCommandPrompt(currentDir)}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => handleCommandChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isExecuting}
            className="flex-1 bg-transparent border-none outline-none text-foreground font-mono text-sm focus:ring-0"
            placeholder={isExecuting ? 'Executing...' : 'Type command...'}
            autoComplete="off"
            spellCheck={false}
          />
          {command && (
            <button
              type="submit"
              disabled={isExecuting}
              className="px-3 py-1 rounded bg-neon-green/20 hover:bg-neon-green/30 text-neon-green text-xs font-medium disabled:opacity-50 transition-colors"
            >
              Run
            </button>
          )}
        </form>

        {/* Terminal footer */}
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Commands: {commandHistory.length}</span>
            <span>Dir: {currentDir}</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs">↑↓</kbd>
            <span>History</span>
            <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs ml-2">Tab</kbd>
            <span>Auto-complete</span>
          </div>
        </div>
      </div>
    </div>
  );
}
