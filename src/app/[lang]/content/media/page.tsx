'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface MediaFile {
  name: string;
  url: string;
  size: number;
  createdAt: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
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
    load();
  }, [load]);

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }

    setUploading(true);
    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });
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

  async function deleteFile(name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/media?name=${encodeURIComponent(name)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await load();
      }
    } catch {
      // ignore
    }
  }

  function copyUrl(url: string) {
    void navigator.clipboard.writeText(url).then(() => {
      setCopied(url);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  return (
    <div className="min-h-screen p-8" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/content" className="text-sm mb-2 block" style={{ color: 'var(--muted)' }}>
              ← Manage Content
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight">Media Library</h1>
          </div>
          <span className="text-sm" style={{ color: 'var(--muted)' }}>
            {media.length} files
          </span>
        </div>

        <div
          className={`mb-8 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
            dragOver ? 'border-[var(--accent)] bg-[var(--accent)]/5' : ''
          }`}
          style={{ borderColor: dragOver ? undefined : 'var(--border)' }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            void uploadFiles(e.dataTransfer.files);
          }}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/gif,image/webp"
            className="hidden"
            onChange={(e) => void uploadFiles(e.target.files)}
          />
          <p className="text-sm mb-2" style={{ color: 'var(--muted)' }}>
            Drag and drop images here, or{' '}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-[var(--accent)] hover:underline"
            >
              browse
            </button>
          </p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            Supports PNG, JPG, SVG, GIF. Uploaded files are converted to WebP.
          </p>
          {uploading && <p className="mt-2 text-sm" style={{ color: 'var(--accent)' }}>Uploading…</p>}
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading…</p>
        ) : media.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>No media uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {media.map((file) => (
              <div
                key={file.name}
                className="group rounded-xl border overflow-hidden flex flex-col"
                style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
              >
                <div className="relative aspect-square bg-[var(--muted-bg)] flex items-center justify-center overflow-hidden">
                  <Image
                    src={file.url}
                    alt={file.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                </div>
                <div className="p-3 flex flex-col gap-2">
                  <p className="text-xs truncate font-mono" style={{ color: 'var(--muted)' }}>
                    {file.name}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--muted)' }}>
                    {formatBytes(file.size)}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copyUrl(file.url)}
                      className="flex-1 rounded-lg border px-2 py-1 text-xs font-medium transition-colors hover:bg-[var(--muted-bg)]"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      {copied === file.url ? 'Copied!' : 'Copy URL'}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteFile(file.name)}
                      className="rounded-lg border px-2 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-400/10"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
