'use client';

import { useState, useEffect } from 'react';
import { Database, Server, Activity } from 'lucide-react';
import { getGlitchTransform } from '@/lib/animations';

interface DatabaseStats {
  name: string;
  icon: React.ReactNode;
  count: number;
  color: string;
}

export default function PwnedDatabases() {
  const [databases, setDatabases] = useState<DatabaseStats[]>([
    {
      name: 'MongoDB',
      icon: <Database className="w-8 h-8" />,
      count: 47283,
      color: '#00FF41',
    },
    {
      name: 'MySQL',
      icon: <Server className="w-8 h-8" />,
      count: 128456,
      color: '#00D4FF',
    },
    {
      name: 'PostgreSQL',
      icon: <Database className="w-8 h-8" />,
      count: 89234,
      color: '#FF0040',
    },
  ]);

  const [glitchIndex, setGlitchIndex] = useState<number | null>(null);

  useEffect(() => {
    // Random glitch effect
    const glitchInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * databases.length);
      setGlitchIndex(randomIndex);
      setTimeout(() => setGlitchIndex(null), 300);
    }, 3000 + Math.random() * 2000);

    // Update counts (simulate real-time changes)
    const updateInterval = setInterval(() => {
      setDatabases((prev) =>
        prev.map((db) => ({
          ...db,
          count: db.count + Math.floor(Math.random() * 10) - 5, // Random change ±5
        }))
      );
    }, 2000);

    return () => {
      clearInterval(glitchInterval);
      clearInterval(updateInterval);
    };
  }, [databases.length]);

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US');
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-danger-red/20 text-danger-red">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Pwned Databases</h3>
            <p className="text-xs text-muted-foreground">Live database breach counter</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {databases.map((db, index) => {
          const isGlitching = glitchIndex === index;
          const glitchStyle = isGlitching ? getGlitchTransform() : {};

          return (
            <div
              key={db.name}
              className="relative glass rounded-xl p-8 text-center transition-all duration-300 hover:scale-105"
              style={{
                borderColor: `${db.color}40`,
                borderWidth: '1px',
                ...glitchStyle,
              }}
            >
              {/* Glitch overlay */}
              {isGlitching && (
                <div className="absolute inset-0 rounded-xl bg-danger-red/10 animate-glitch" />
              )}

              <div className="relative z-10">
                {/* Icon */}
                <div
                  className="inline-flex items-center justify-center w-20 h-20 rounded-xl mb-6"
                  style={{
                    backgroundColor: `${db.color}20`,
                    color: db.color,
                  }}
                >
                  {db.icon}
                </div>

                {/* Database name */}
                <h4 className="text-lg font-semibold text-foreground mb-4">{db.name}</h4>

                {/* Count */}
                <div className="relative">
                  <div
                    className="text-5xl font-bold font-mono mb-2"
                    style={{
                      color: db.color,
                      textShadow: `0 0 15px ${db.color}, 0 0 30px ${db.color}, 0 0 45px ${db.color}`,
                    }}
                  >
                    {formatNumber(db.count)}
                  </div>
                  {isGlitching && (
                    <div
                      className="absolute inset-0 text-5xl font-bold font-mono opacity-50"
                      style={{
                        color: '#FF0040',
                        transform: 'translate(2px, -2px)',
                      }}
                    >
                      {formatNumber(db.count + Math.floor(Math.random() * 1000))}
                    </div>
                  )}
                </div>

                {/* Subtitle */}
                <p className="text-sm text-muted-foreground mt-3">Records Exposed</p>

                {/* Pulse indicator */}
                <div className="mt-6 flex justify-center">
                  <div
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{ backgroundColor: db.color }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total count */}
      <div className="mt-8 pt-6 border-t border-border/50">
        <div className="flex items-center justify-between">
          <span className="text-base font-medium text-muted-foreground">Total Pwned Records</span>
          <span className="text-4xl font-bold text-danger-red font-mono" style={{
            textShadow: '0 0 15px #FF0040, 0 0 30px #FF0040',
          }}>
            {formatNumber(databases.reduce((sum, db) => sum + db.count, 0))}
          </span>
        </div>
      </div>
    </div>
  );
}

