'use client';

import { useState } from 'react';
import { DollarSign, TrendingUp, Target, Award } from 'lucide-react';

interface BountyCardProps {
  totalEarned?: number;
  targetAmount?: number;
  vulnerabilitiesFound?: number;
  topBounty?: number;
}

export default function BountyCard({
  totalEarned = 125000,
  targetAmount = 200000,
  vulnerabilitiesFound = 47,
  topBounty = 50000,
}: BountyCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const progress = (totalEarned / targetAmount) * 100;
  const remaining = targetAmount - totalEarned;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative glass-card rounded-xl p-6 overflow-hidden
        transition-all duration-500
        ${isHovered ? 'scale-105' : ''}
      `}
      style={{
        transform: isHovered 
          ? 'perspective(1000px) rotateY(5deg) rotateX(-5deg) scale(1.05)' 
          : 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* 3D effect background */}
      <div className={`
        absolute inset-0 bg-gradient-to-br from-neon-green/10 via-cyber-blue/10 to-transparent
        transition-opacity duration-500
        ${isHovered ? 'opacity-100' : 'opacity-50'}
      `} />

      {/* Glow effect on hover */}
      {isHovered && (
        <div className="absolute inset-0 bg-neon-green/5 blur-xl animate-pulse-neon" />
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-neon-green/20 text-neon-green">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Bounty Earnings</h3>
              <p className="text-xs text-muted-foreground">Total rewards collected</p>
            </div>
          </div>
          <Award className="w-6 h-6 text-cyber-blue" />
        </div>

        {/* Main earnings display */}
        <div className="mb-6">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-bold text-neon-green">
              ${totalEarned.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">USD</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="w-4 h-4 text-neon-green" />
            <span>Target: ${targetAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="relative h-3 bg-dark-secondary rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-neon-green to-cyber-blue rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] animate-shimmer" />
            </div>
            <div 
              className="absolute top-0 bottom-0 w-1 bg-neon-green shadow-[0_0_10px_rgba(0,255,65,0.8)]"
              style={{ left: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            ${remaining.toLocaleString()} remaining to reach target
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyber-blue/20 text-cyber-blue">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Vulnerabilities</div>
              <div className="text-lg font-bold text-foreground">{vulnerabilitiesFound}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-danger-red/20 text-danger-red">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Top Bounty</div>
              <div className="text-lg font-bold text-foreground">
                ${topBounty.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

