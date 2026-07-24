'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

interface ExperienceItem {
  id: string;
  type: 'experience';
  title: string;
  company?: string;
}

interface ExperiencePickerModalProps {
  open: boolean;
  selected: string[];
  onChange: (selected: string[]) => void;
  onClose: () => void;
}

export default function ExperiencePickerModal({ open, selected, onChange, onClose }: ExperiencePickerModalProps) {
  const [items, setItems] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) return;
    let active = true;

    setLoading(true);
    fetch('/api/search/index')
      .then((res) => res.json())
      .then((data: ExperienceItem[]) => {
        if (!active) return;
        setItems((data ?? []).filter((item) => item.type === 'experience'));
      })
      .catch(() => {
        if (!active) return;
        setItems([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const source = items;
    if (!q) return source;
    return source.filter((item) => {
      const haystack = `${item.title} ${item.company ?? ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [items, query]);

  function toggle(item: ExperienceItem) {
    const slug = item.id.replace(/^experience-/, '');
    if (selected.includes(slug)) onChange(selected.filter((entry) => entry !== slug));
    else onChange([...selected, slug]);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center bg-black/70 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex w-full max-w-4xl max-h-[80vh] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] p-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Related Experiences</h2>
            <p className="text-xs text-[var(--muted)]">Pick one or more experiences to link to this project.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/content/new/experience"
              className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--muted-bg)] hover:text-[var(--foreground)]"
            >
              New experience
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="border-b border-[var(--border)] p-4">
          <input
            type="text"
            placeholder="Search experiences…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="text-sm text-[var(--muted)]">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No experiences found.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => {
                const slug = item.id.replace(/^experience-/, '');
                const isSelected = selected.includes(slug);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggle(item)}
                    className={`rounded-xl border p-4 text-left transition-colors ${
                      isSelected
                        ? 'border-[var(--accent)]/50 bg-[var(--accent)]/10'
                        : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--accent)]/40'
                    }`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-[var(--foreground)]">{item.title}</p>
                        <p className="text-xs text-[var(--muted)]">{item.company ?? 'Experience'}</p>
                      </div>
                      <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--muted)]">
                        {isSelected ? 'Selected' : 'Add'}
                      </span>
                    </div>
                    <p className="font-mono text-[10px] text-[var(--muted)]">{slug}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
