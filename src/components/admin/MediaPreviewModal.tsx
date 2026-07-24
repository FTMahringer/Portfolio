'use client';

import Image from 'next/image';

interface MediaPreviewModalProps {
  open: boolean;
  url: string | null;
  onClose: () => void;
}

export default function MediaPreviewModal({ open, url, onClose }: MediaPreviewModalProps) {
  if (!open || !url) return null;

  return (
    <div
      className="fixed inset-0 z-[600] flex items-center justify-center bg-black/75 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
          <div>
            <h2 className="text-base font-semibold text-[var(--foreground)]">Image preview</h2>
            <p className="truncate text-xs text-[var(--muted)]">{url}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[var(--border)] px-3 py-1 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--muted-bg)] hover:text-[var(--foreground)]"
          >
            Close
          </button>
        </div>

        <div className="bg-black/20 p-4">
          <div className="relative h-[70vh] w-full overflow-hidden rounded-xl bg-[var(--background)]">
            <Image src={url} alt="Preview image" fill className="object-contain p-4" sizes="100vw" />
          </div>
        </div>
      </div>
    </div>
  );
}
