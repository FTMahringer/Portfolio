'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface MediaFile {
  name: string;
  url: string;
  size: number;
  createdAt: number;
}

interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function MediaPickerModal({ open, onClose, onSelect }: MediaPickerModalProps) {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [uploading, setUploading] = useState(false);
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
    if (open) load();
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

  const filtered = media.filter((m) => m.name.toLowerCase().includes(query.toLowerCase()));

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center bg-black/70 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-4xl max-h-[80vh] rounded-xl border flex flex-col"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Media Library</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            ✕
          </button>
        </div>

        <div className="p-4 border-b flex flex-col sm:flex-row gap-3" style={{ borderColor: 'var(--border)' }}>
          <input
            type="text"
            placeholder="Search media…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
            style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/gif,image/webp"
            className="hidden"
            onChange={(e) => void uploadFiles(e.target.files)}
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
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filtered.map((file) => (
                <button
                  key={file.name}
                  type="button"
                  onClick={() => {
                    onSelect(file.url);
                    onClose();
                  }}
                  className="group rounded-lg border overflow-hidden text-left transition-colors hover:border-[var(--accent)]"
                  style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
                >
                  <div className="aspect-square bg-[var(--muted-bg)] flex items-center justify-center overflow-hidden">
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-2">
                    <p className="text-[10px] truncate font-mono" style={{ color: 'var(--muted)' }}>{file.name}</p>
                    <p className="text-[10px]" style={{ color: 'var(--muted)' }}>{formatBytes(file.size)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
