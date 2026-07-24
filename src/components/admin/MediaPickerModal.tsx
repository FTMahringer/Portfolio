'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface MediaFile {
  name: string;
  url: string;
  size: number;
  createdAt: number;
}

interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  onAddSelected: (urls: string[]) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function MediaPickerModal({ open, onClose, onAddSelected }: MediaPickerModalProps) {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/media');
      const data = await res.json();
      setMedia(data.media ?? []);
    } catch {
      setMedia([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setSelected([]);
    setQuery('');
    load();
  }, [open, load]);

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const formData = new FormData();
    for (const file of files) formData.append('files', file);

    setUploading(true);
    try {
      const res = await fetch('/api/admin/media', { method: 'POST', body: formData });
      if (res.ok) {
        await load();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? 'Upload failed');
      }
    } catch {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  }

  const filtered = media.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));

  function toggleSelection(url: string) {
    setSelected((current) => (current.includes(url) ? current.filter((entry) => entry !== url) : [...current, url]));
  }

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
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Media Library</h2>
            <p className="text-xs text-[var(--muted)]">Select one or more images to add to the editor.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3 border-b border-[var(--border)] p-4 sm:flex-row">
          <input
            type="text"
            placeholder="Search media…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
          />
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/gif,image/webp"
            className="hidden"
            onChange={(event) => void uploadFiles(event.target.files)}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : 'Upload New'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="text-sm text-[var(--muted)]">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No media found.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {filtered.map((file) => {
                const isSelected = selected.includes(file.url);
                return (
                  <button
                    key={file.name}
                    type="button"
                    onClick={() => toggleSelection(file.url)}
                    className={`group rounded-xl border text-left transition-colors ${
                      isSelected
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                        : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--accent)]/50'
                    }`}
                  >
                    <div className="relative aspect-square overflow-hidden rounded-t-xl bg-[var(--muted-bg)]">
                      <Image
                        src={file.url}
                        alt={file.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      />
                      {isSelected && (
                        <span className="absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-[11px] font-semibold text-white shadow-lg">
                          ×
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 p-2">
                      <p className="truncate font-mono text-[10px] text-[var(--muted)]">{file.name}</p>
                      <p className="text-[10px] text-[var(--muted)]">{formatBytes(file.size)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] p-4">
          <p className="text-xs text-[var(--muted)]">{selected.length} selected</p>
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
                if (selected.length === 0) return;
                onAddSelected(selected);
                onClose();
              }}
              disabled={selected.length === 0}
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Add selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
