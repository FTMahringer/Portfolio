'use client';

import { useEffect, useState } from 'react';

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > 320);

    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateVisibility);
    };
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-4 right-4 z-[260] inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-medium text-[var(--foreground)] shadow-[0_12px_30px_rgba(15,23,42,0.12)] backdrop-blur-md transition-transform hover:-translate-y-0.5 hover:bg-[var(--muted-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] sm:bottom-6 sm:right-6"
    >
      <span className="grid size-8 place-items-center rounded-full bg-[var(--muted-bg)] text-[var(--accent)]">
        ↑
      </span>
      <span className="whitespace-nowrap">Top</span>
    </button>
  );
}
