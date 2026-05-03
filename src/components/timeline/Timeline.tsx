'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TimelineEntry } from '@/lib/timeline';

interface TimelineProps {
  entries: TimelineEntry[];
}

export function Timeline({ entries }: TimelineProps) {
  const [filter, setFilter] = useState<'all' | 'experience' | 'education' | 'project'>('all');

  const filtered = filter === 'all' ? entries : entries.filter(e => e.type === filter);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'experience': return 'text-blue-500 dark:text-blue-400';
      case 'education': return 'text-purple-500 dark:text-purple-400';
      case 'project': return 'text-green-500 dark:text-green-400';
      default: return 'text-[var(--accent)]';
    }
  };

  const getTypeBadge = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div>
      {/* Filter buttons */}
      <div className="flex gap-2 mb-8">
        {(['all', 'experience', 'education', 'project'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-0 md:left-8 top-0 bottom-0 w-px bg-[var(--border)]" />

        <div className="space-y-8">
          {filtered.map((entry, index) => (
            <div key={index} className="relative pl-8 md:pl-16">
              {/* Dot */}
              <div className={`absolute left-[-4px] md:left-[28px] top-1 w-2 h-2 rounded-full ${getTypeColor(entry.type)} bg-current`} />

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 hover:border-[var(--accent)] transition-colors">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    {entry.slug ? (
                      <Link
                        href={`/projects/${entry.slug}`}
                        className="text-lg font-semibold text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
                      >
                        {entry.title}
                      </Link>
                    ) : (
                      <h3 className="text-lg font-semibold text-[var(--foreground)]">
                        {entry.title}
                      </h3>
                    )}
                    {entry.subtitle && (
                      <p className="text-sm text-[var(--muted)] mt-1">{entry.subtitle}</p>
                    )}
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${getTypeColor(entry.type)}`}>
                    {getTypeBadge(entry.type)}
                  </span>
                </div>

                <div className="text-sm text-[var(--muted)] mb-2">
                  {formatDate(entry.date)}
                  {entry.endDate && ` - ${formatDate(entry.endDate)}`}
                  {!entry.endDate && entry.type === 'experience' && ' - Present'}
                </div>

                {entry.description && (
                  <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
                    {entry.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
