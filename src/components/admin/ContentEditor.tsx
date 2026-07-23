'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { renderMarkdown, containsScript } from '@/lib/markdown';
import MediaPickerModal from './MediaPickerModal';

export type EditorType = 'blog' | 'project' | 'experience';

interface ContentEditorProps {
  type: EditorType;
  slug: string;
  frontmatter: Record<string, unknown>;
  content: string;
}

function formatFieldValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

function fieldEntries(type: EditorType, frontmatter: Record<string, unknown>): { label: string; key: string }[] {
  const common = [
    { label: 'Title', key: 'title' },
    { label: 'Slug', key: 'slug' },
  ];

  if (type === 'blog') {
    return [
      ...common,
      { label: 'Published Date', key: 'publishedAt' },
      { label: 'Summary', key: 'summary' },
      { label: 'Tags', key: 'tags' },
      { label: 'Draft', key: 'draft' },
    ];
  }

  if (type === 'project') {
    return [
      ...common,
      { label: 'Status', key: 'status' },
      { label: 'Category', key: 'category' },
      { label: 'Summary', key: 'summary' },
      { label: 'Tech Stack', key: 'stack' },
      { label: 'Tags', key: 'tags' },
      { label: 'GitHub', key: 'github' },
      { label: 'Demo', key: 'demo' },
      { label: 'Featured', key: 'featured' },
    ];
  }

  return [
    ...common,
    { label: 'Company', key: 'company' },
    { label: 'Location', key: 'location' },
    { label: 'Start Date', key: 'startDate' },
    { label: 'End Date', key: 'endDate' },
    { label: 'Present', key: 'present' },
    { label: 'Type', key: 'type' },
    { label: 'Tech Stack', key: 'stack' },
    { label: 'Highlights', key: 'highlights' },
    { label: 'Link', key: 'link' },
    { label: 'Featured', key: 'featured' },
  ];
}

export default function ContentEditor({ type, slug, frontmatter, content: initialContent }: ContentEditorProps) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const hasScript = containsScript(content);
  const previewHtml = hasScript ? '' : renderMarkdown(content);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  function insertImage(url: string) {
    const imageMarkdown = `\n![image](${url})\n`;
    setContent((c) => c + imageMarkdown);
  }

  function addSelected(url: string) {
    setSelected((prev) => (prev.includes(url) ? prev : [...prev, url]));
  }

  function copyUrl(url: string) {
    void navigator.clipboard.writeText(url).then(() => {
      setCopied(url);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    const apiType = type === 'project' ? 'projects' : type;

    const res = await fetch(`/api/dev/content/${apiType}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, frontmatter, content, overwrite: true }),
    });

    setSaving(false);

    if (res.ok) {
      const redirectPath = type === 'blog' ? `/blog/${slug}` : type === 'project' ? `/projects/${slug}` : `/experience/${slug}`;
      router.push(redirectPath);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Failed to save content');
    }
  }

  const typeName = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Header */}
      <div className="border-b border-[var(--border)] bg-[var(--card)] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-green-400 font-mono text-xs bg-green-400/10 border border-green-400/30 rounded px-2 py-1">
            DEV
          </span>
          <h1 className="text-lg font-bold">Edit {typeName}</h1>
          <span className="text-xs text-[var(--muted)] font-mono">{slug}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={type === 'blog' ? `/blog/${slug}` : type === 'project' ? `/projects/${slug}` : `/experience/${slug}`}
            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            View →
          </Link>
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            className="rounded-lg border px-3 py-1.5 text-sm transition-colors hover:bg-[var(--muted-bg)]"
            style={{ borderColor: 'var(--border)' }}
          >
            {preview ? 'Write' : 'Preview'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || hasScript}
            className="rounded-lg bg-[var(--accent)] px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-4 rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {hasScript && (
        <div className="mx-4 mt-4 rounded-lg border border-yellow-400/30 bg-yellow-400/10 px-4 py-3 text-sm text-yellow-400">
          JavaScript or &lt;script&gt; tags detected. Preview and save are disabled until removed.
        </div>
      )}

      {/* Three-column layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* Left: metadata */}
        <aside className="lg:col-span-3 border-r border-[var(--border)] bg-[var(--card)] overflow-y-auto p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">Metadata</h2>
          <div className="space-y-3">
            {fieldEntries(type, frontmatter).map(({ label, key }) => (
              <div key={key}>
                <label className="block text-[10px] uppercase tracking-wider text-[var(--muted)] mb-0.5">{label}</label>
                <div className="text-sm text-[var(--foreground)] break-words">
                  {formatFieldValue(frontmatter[key]) || <span className="text-[var(--muted)]">—</span>}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-[var(--muted)]">
            Metadata can be edited in the create wizard for now.
          </p>
        </aside>

        {/* Center: editor / preview */}
        <main className="lg:col-span-6 flex flex-col overflow-hidden">
          {preview ? (
            <div
              className="flex-1 overflow-y-auto p-6 prose-content"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 w-full resize-none bg-[var(--background)] p-6 font-mono text-sm leading-relaxed text-[var(--foreground)] outline-none"
              placeholder="Write markdown or HTML here…"
              spellCheck={false}
            />
          )}
        </main>

        {/* Right: media panel */}
        <aside className="lg:col-span-3 border-l border-[var(--border)] bg-[var(--card)] overflow-y-auto p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">Media</h2>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="w-full rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--muted-bg)] mb-4"
            style={{ borderColor: 'var(--border)' }}
          >
            🖼 Open Media Library
          </button>

          {selected.length > 0 && (
            <>
              <h3 className="text-[10px] uppercase tracking-wider text-[var(--muted)] mb-2">Pre-selected</h3>
              <div className="space-y-2 mb-4">
                {selected.map((url) => (
                  <div key={url} className="rounded-lg border p-2" style={{ borderColor: 'var(--border)' }}>
                    <div className="aspect-video bg-[var(--muted-bg)] rounded overflow-hidden mb-2">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => copyUrl(url)}
                        className="flex-1 rounded border px-2 py-1 text-[10px] transition-colors hover:bg-[var(--muted-bg)]"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        {copied === url ? 'Copied!' : 'Copy URL'}
                      </button>
                      <button
                        type="button"
                        onClick={() => insertImage(url)}
                        className="flex-1 rounded bg-[var(--accent)] px-2 py-1 text-[10px] text-white"
                      >
                        Insert
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <p className="text-xs text-[var(--muted)]">
            Select media from the library to keep them handy, then insert or copy the URL into your content.
          </p>
        </aside>
      </div>

      <MediaPickerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={(url) => {
          addSelected(url);
          insertImage(url);
        }}
      />
    </div>
  );
}
