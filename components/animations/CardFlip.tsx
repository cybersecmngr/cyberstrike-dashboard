'use client';

import { useCardFlip } from '@/lib/animations';
import { ReactNode } from 'react';

interface CardFlipProps {
  front: ReactNode;
  back: ReactNode;
  className?: string;
  flipTrigger?: 'hover' | 'click';
}

export default function CardFlip({ front, back, className = '', flipTrigger = 'hover' }: CardFlipProps) {
  const { isFlipped, flip, flipToFront, flipToBack } = useCardFlip();

  const handleInteraction = () => {
    if (flipTrigger === 'click') {
      flip();
    }
  };

  const handleMouseEnter = () => {
    if (flipTrigger === 'hover') {
      flipToBack();
    }
  };

  const handleMouseLeave = () => {
    if (flipTrigger === 'hover') {
      flipToFront();
    }
  };

  return (
    <div
      className={`relative w-full h-full ${className}`}
      style={{
        perspective: '1000px',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleInteraction}
    >
      <div
        className="relative w-full h-full transition-transform duration-700 ease-in-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front side */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {front}
        </div>

        {/* Back side */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {back}
        </div>
      </div>
    </div>
  );
}

