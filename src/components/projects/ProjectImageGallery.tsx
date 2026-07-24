'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProjectImageGalleryProps {
  images: string[];
  title: string;
}

export function ProjectImageGallery({ images, title }: ProjectImageGalleryProps) {
  const [preview, setPreview] = useState<string | null>(null);

  if (images.length === 0) return null;

  return (
    <section className="mt-10 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Images used in content</h2>
        <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px] uppercase tracking-wider text-[var(--muted)]">
          {images.length}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image, index) => (
          <button
            key={image}
            type="button"
            onClick={() => setPreview(image)}
            className="group overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] text-left transition-colors hover:border-[var(--accent)]/50"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-[var(--muted-bg)]">
              <Image
                src={image}
                alt={`${title} image ${index + 1}`}
                fill
                className="object-cover transition-transform group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>
            <div className="px-2 py-1.5">
              <p className="truncate font-mono text-[10px] text-[var(--muted)]">{image}</p>
            </div>
          </button>
        ))}
      </div>

      {preview && (
        <div
          className="fixed inset-0 z-[600] flex items-center justify-center bg-black/80 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) setPreview(null);
          }}
        >
          <div className="flex w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
              <div>
                <h3 className="text-sm font-semibold text-[var(--foreground)]">Image preview</h3>
                <p className="truncate text-xs text-[var(--muted)]">{preview}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="rounded-full border border-[var(--border)] px-3 py-1 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--muted-bg)] hover:text-[var(--foreground)]"
              >
                Close
              </button>
            </div>
            <div className="bg-black/20 p-4">
              <div className="relative h-[72vh] w-full overflow-hidden rounded-xl bg-[var(--background)]">
                <Image src={preview} alt="Preview image" fill className="object-contain p-4" sizes="100vw" />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
