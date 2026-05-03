'use client';

import { useEffect, useState } from 'react';
import { TocHeading } from '@/lib/toc-utils';

export function TableOfContents({ headings }: { headings: TocHeading[] }) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -75% 0px', threshold: 0 },
    );

    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav
      className="hidden xl:block fixed top-20 w-48 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-none"
      style={{ left: 'calc(50% + 26rem)' }}
      aria-label="Table of contents"
    >
      <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)] mb-3">
        On this page
      </div>
      <ul className="space-y-1.5 border-l border-[var(--border)]">
        {headings.map(h => (
          <li key={h.id} style={{ paddingLeft: `${(h.level - 2) * 12 + 12}px` }}>
            <a
              href={`#${h.id}`}
              onClick={e => {
                e.preventDefault();
                document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`block text-xs leading-snug py-0.5 transition-colors ${
                activeId === h.id
                  ? 'text-[var(--accent)] font-medium'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
