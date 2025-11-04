'use client';

import { useEffect, useState } from 'react';
import { useTypingAnimation } from '@/lib/animations';

const CYBER_STRIKE_ASCII = `
 ██████╗██╗   ██╗██████╗ ███████╗██████╗     ███████╗████████╗██████╗ ██╗██╗  ██╗███████╗
██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗    ██╔════╝╚══██╔══╝██╔══██╗██║██║ ██╔╝██╔════╝
██║      ╚████╔╝ ██████╔╝█████╗  ██████╔╝    ███████╗   ██║   ██████╔╝██║█████╔╝ █████╗  
██║       ╚██╔╝  ██╔══██╗██╔══╝  ██╔══██╗    ╚════██║   ██║   ██╔══██╗██║██╔═██╗ ██╔══╝  
╚██████╗   ██║   ██████╔╝███████╗██║  ██║    ███████║   ██║   ██║  ██║██║██║  ██╗███████╗
 ╚═════╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝  ╚═╝    ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝
`;

interface ASCIIBannerProps {
  onComplete?: () => void;
  autoStart?: boolean;
  speed?: number;
}

export default function ASCIIBanner({ 
  onComplete, 
  autoStart = true,
  speed = 20 
}: ASCIIBannerProps) {
  const { displayedText, startTyping, isTyping } = useTypingAnimation(CYBER_STRIKE_ASCII, speed);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (autoStart) {
      startTyping();
    }
  }, [autoStart, startTyping]);

  useEffect(() => {
    if (!isTyping && onComplete) {
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  }, [isTyping, onComplete]);

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full flex items-center justify-center p-8">
      <div className="relative">
        {/* Glow effect */}
        <div 
          className="absolute inset-0 blur-xl opacity-30"
          style={{
            textShadow: '0 0 20px #00FF41, 0 0 40px #00FF41, 0 0 60px #00FF41',
          }}
        >
          <pre className="font-mono text-neon-green text-sm leading-tight whitespace-pre">
            {displayedText}
          </pre>
        </div>

        {/* Main text */}
        <pre 
          className="relative font-mono text-neon-green text-sm leading-tight whitespace-pre"
          style={{
            textShadow: '0 0 10px #00FF41, 0 0 20px #00FF41',
          }}
        >
          {displayedText}
          {showCursor && (
            <span className="inline-block w-2 h-4 bg-neon-green ml-1 animate-pulse" />
          )}
        </pre>

        {/* Scan line effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div 
            className="absolute w-full h-px bg-neon-green/30 animate-scan-line"
            style={{
              animation: 'scan-line 3s linear infinite',
            }}
          />
        </div>
      </div>

      {/* Matrix rain overlay (subtle) */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 65, 0.03) 2px, rgba(0, 255, 65, 0.03) 4px)',
        }} />
      </div>
    </div>
  );
}

