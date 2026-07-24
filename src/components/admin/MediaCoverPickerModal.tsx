'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface MediaCoverPickerModalProps {
  open: boolean;
  urls: string[];
  selectedUrl: string | null;
  onClose: () => void;
  onConfirm: (url: string) => void;
}

export default function MediaCoverPickerModal({ open, urls, selectedUrl, onClose, onConfirm }: MediaCoverPickerModalProps) {
  const [selected, setSelected] = useState<string | null>(selectedUrl ?? urls[0] ?? null);

  useEffect(() => {
    if (!open) return;
    setSelected(selectedUrl ?? urls[0] ?? null);
  }, [open, selectedUrl, urls]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[600] flex items-center justify-center bg-black/70 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] p-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Choose cover image</h2>
            <p className="text-xs text-[var(--muted)]">Pick one of the already selected gallery images.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {urls.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No selected images yet.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {urls.map((url) => {
                const isSelected = selected === url;
                const fileName = url.split('/').pop() ?? url;
                return (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setSelected(url)}
                    className={`group rounded-xl border text-left transition-colors ${
                      isSelected
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                        : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--accent)]/50'
                    }`}
                  >
                    <div className="relative aspect-square overflow-hidden rounded-t-xl bg-[var(--muted-bg)]">
                      <Image src={url} alt={fileName} fill className="object-cover" sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw" />
                      {isSelected && (
                        <span className="absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-[11px] font-semibold text-white shadow-lg">
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 p-2">
                      <p className="truncate font-mono text-[10px] text-[var(--muted)]">{fileName}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] p-4">
          <p className="text-xs text-[var(--muted)]">Only selected gallery images appear here.</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--muted-bg)] hover:text-[var(--foreground)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (!selected) return;
                onConfirm(selected);
                onClose();
              }}
              disabled={!selected}
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Use as cover
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
