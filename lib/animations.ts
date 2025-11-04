'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook for typing animation effect
 * @param text - The text to type
 * @param speed - Typing speed in milliseconds
 * @param onComplete - Callback when typing completes
 */
export function useTypingAnimation(
  text: string,
  speed: number = 50,
  onComplete?: () => void
) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTyping = useCallback(() => {
    setDisplayedText('');
    setIsTyping(true);
    let currentIndex = 0;

    intervalRef.current = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        onComplete?.();
      }
    }, speed);
  }, [text, speed, onComplete]);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setDisplayedText('');
    setIsTyping(false);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { displayedText, isTyping, startTyping, reset };
}

/**
 * Hook for terminal cursor blink animation
 */
export function useCursorBlink(speed: number = 530) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible((prev) => !prev);
    }, speed);
    return () => clearInterval(interval);
  }, [speed]);

  return isVisible;
}

/**
 * Hook for 3D card flip animation
 */
export function useCardFlip() {
  const [isFlipped, setIsFlipped] = useState(false);

  const flip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const flipToFront = useCallback(() => {
    setIsFlipped(false);
  }, []);

  const flipToBack = useCallback(() => {
    setIsFlipped(true);
  }, []);

  return { isFlipped, flip, flipToFront, flipToBack };
}

/**
 * Neon glow text animation utility
 * Returns CSS classes and styles for neon glow effect
 */
export function getNeonGlowStyles(
  color: string = '#00FF41',
  intensity: 'low' | 'medium' | 'high' = 'medium'
) {
  const intensities = {
    low: { blur: '5px', spread: '2px', opacity: 0.6 },
    medium: { blur: '10px', spread: '4px', opacity: 0.8 },
    high: { blur: '20px', spread: '8px', opacity: 1 },
  };

  const { blur, spread, opacity } = intensities[intensity];

  return {
    textShadow: `
      0 0 ${blur} ${color},
      0 0 ${blur} ${color},
      0 0 ${blur} ${color},
      0 0 ${blur} ${color}
    `,
    filter: `drop-shadow(0 0 ${spread} ${color})`,
    opacity,
  };
}

/**
 * Glitch effect utility
 * Returns random glitch transform values
 */
export function getGlitchTransform() {
  const x = (Math.random() - 0.5) * 4;
  const y = (Math.random() - 0.5) * 4;
  const hue = Math.random() * 360;

  return {
    transform: `translate(${x}px, ${y}px)`,
    filter: `hue-rotate(${hue}deg)`,
  };
}

// Component exports moved to lib/animations-components.tsx
// Re-export for backwards compatibility
export {
  MatrixRainCanvas,
  NetworkParticles,
  RadarSweep,
  HexagonGrid,
  ScanLineOverlay,
  type MatrixRainProps,
  type NetworkNode,
  type NetworkParticlesProps,
  type RadarSweepProps,
  type HexagonGridProps,
} from './animations-components';

