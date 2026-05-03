'use client';

import { useEffect, useState } from 'react';

interface PortfolioStatsProps {
  totalProjects: number;
  totalBlogPosts: number;
  yearsOfExperience: number;
}

export function PortfolioStats({ totalProjects, totalBlogPosts, yearsOfExperience }: PortfolioStatsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = [
    { label: 'Years Experience', value: yearsOfExperience },
    { label: 'Projects', value: totalProjects },
    { label: 'Blog Posts', value: totalBlogPosts },
  ];

  return (
    <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
      {stats.map((stat, index) => {
        const delay = index * 0.1;
        return (
          <div
            key={stat.label}
            className="text-center"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(10px)',
              transition: `opacity 0.5s ease-out ${delay}s, transform 0.5s ease-out ${delay}s`,
            }}
          >
            <div className="text-4xl md:text-5xl font-bold text-[var(--accent)] mb-2">
              {stat.value}+
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
