'use client';

import { useEffect, useState } from 'react';
import type { ResolvedHomepageStat } from '@/lib/homepage-stats';

interface PortfolioStatsProps {
  stats: ResolvedHomepageStat[];
}

export function PortfolioStats({ stats }: PortfolioStatsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (stats.length === 0) return null;

  return (
    <div className="grid gap-6 max-w-2xl mx-auto sm:grid-cols-2 md:grid-cols-3">
      {stats.map((stat, index) => {
        const delay = index * 0.1;
        return (
          <div
            key={stat.id}
            className="text-center"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(10px)',
              transition: `opacity 0.5s ease-out ${delay}s, transform 0.5s ease-out ${delay}s`,
            }}
          >
            <div className="text-4xl md:text-5xl font-bold text-[var(--accent)] mb-2">
              {stat.value}{stat.suffix}
            </div>
            <div className="text-sm md:text-base text-[var(--muted)] uppercase tracking-wide">
              {stat.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
