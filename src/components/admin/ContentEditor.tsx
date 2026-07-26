'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { containsScript, extractImageUrls, removeImageFromContent, renderMarkdown } from '@/lib/markdown';
import { buildInitialFrontmatter } from '@/lib/content-editor';
import MediaPickerModal from './MediaPickerModal';
import MediaCoverPickerModal from './MediaCoverPickerModal';
import MediaPreviewModal from './MediaPreviewModal';
import ExperiencePickerModal from './ExperiencePickerModal';

export type EditorType = 'blog' | 'project' | 'experience';
export type EditorMode = 'create' | 'edit';

type PublishAction = 'draft' | 'release' | 'save';

type FieldKind = 'text' | 'textarea' | 'checkbox' | 'select' | 'date' | 'list';

interface FieldDef {
  key: string;
  label: string;
  kind: FieldKind;
  placeholder?: string;
  help?: string;
  options?: string[];
  rows?: number;
  span?: 1 | 2;
}

interface ContentEditorProps {
  mode: EditorMode;
  type: EditorType;
  slug: string;
  frontmatter: Record<string, unknown>;
  content: string;
  showExperienceRelations?: boolean;
}

const PROJECT_STATUS_OPTIONS = ['Completed', 'Work in Progress', 'Archived', 'Idea'];
const EXPERIENCE_TYPE_OPTIONS = ['Internship', 'Part-time', 'Freelance', 'Full-time'];

function typeName(type: EditorType) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}



function formatFieldValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

function splitCommaList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value !== 'string') return [];

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitLineList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value !== 'string') return [];

  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getFieldDefinitions(type: EditorType): FieldDef[] {
  if (type === 'blog') {
    return [
      { key: 'title', label: 'Title', kind: 'text', placeholder: 'My awesome post', span: 2 },
      { key: 'slug', label: 'Slug', kind: 'text', placeholder: 'my-awesome-post' },
      { key: 'publishedAt', label: 'Published date', kind: 'date', span: 2 },
      { key: 'summary', label: 'Summary', kind: 'textarea', rows: 4, placeholder: 'Short summary shown in listings', span: 2 },
      { key: 'tags', label: 'Tags', kind: 'list', rows: 3, placeholder: 'next.js, typescript, mdx', help: 'Comma-separated tags', span: 2 },
      { key: 'draft', label: 'Draft', kind: 'checkbox', help: 'Keep the post hidden for now', span: 2 },
    ];
  }

  if (type === 'project') {
    return [
      { key: 'title', label: 'Title', kind: 'text', placeholder: 'My project', span: 2 },
      { key: 'status', label: 'Status', kind: 'select', options: PROJECT_STATUS_OPTIONS },
      { key: 'summary', label: 'Summary', kind: 'textarea', rows: 4, placeholder: 'Short project summary', span: 2 },
      { key: 'category', label: 'Category', kind: 'text', placeholder: 'Web App', span: 2 },
      { key: 'stack', label: 'Tech stack', kind: 'list', rows: 3, placeholder: 'Next.js, TypeScript, Tailwind CSS', help: 'Comma-separated stack items', span: 2 },
      { key: 'tags', label: 'Tags', kind: 'list', rows: 3, placeholder: 'frontend, cms, media library', help: 'Comma-separated tags', span: 2 },
      { key: 'github', label: 'GitHub URL', kind: 'text', placeholder: 'https://github.com/...' },
      { key: 'demo', label: 'Demo URL', kind: 'text', placeholder: 'https://...' },
      { key: 'featured', label: 'Featured', kind: 'checkbox', help: 'Show on the homepage', span: 2 },
      { key: 'startDate', label: 'Start date', kind: 'date' },
      { key: 'endDate', label: 'End date', kind: 'date', help: 'Leave empty if ongoing' },
    ];
  }

  return [
    { key: 'title', label: 'Title', kind: 'text', placeholder: 'Role title', span: 2 },
    { key: 'slug', label: 'Slug', kind: 'text', placeholder: 'role-slug' },
    { key: 'company', label: 'Company', kind: 'text', placeholder: 'Company name' },
    { key: 'location', label: 'Location', kind: 'text', placeholder: 'Remote / City' },
    { key: 'type', label: 'Type', kind: 'select', options: EXPERIENCE_TYPE_OPTIONS },
    { key: 'startDate', label: 'Start date', kind: 'date' },
    { key: 'endDate', label: 'End date', kind: 'date', help: 'Leave empty if ongoing' },
    { key: 'present', label: 'Currently here', kind: 'checkbox', help: 'Use when this role is ongoing', span: 2 },
    { key: 'stack', label: 'Tech stack', kind: 'list', rows: 3, placeholder: 'TypeScript, React, Node.js', help: 'Comma-separated stack items', span: 2 },
    { key: 'highlights', label: 'Highlights', kind: 'textarea', rows: 5, placeholder: 'One highlight per line', span: 2 },
    { key: 'link', label: 'Link', kind: 'text', placeholder: 'https://...', span: 2 },
    { key: 'featured', label: 'Featured', kind: 'checkbox', help: 'Show on the homepage', span: 2 },
  ];
}

function normalizeFrontmatterForSave(
  type: EditorType,
  form: Record<string, unknown>,
  action: PublishAction,
): Record<string, unknown> {
  const next: Record<string, unknown> = { ...form };

  if (type === 'project') {
    next.title = String(next.title ?? '');
    next.slug = String(next.slug ?? '');
  }

  if (type === 'blog') {
    next.draft = action === 'draft';
  }

  if (type === 'experience' && Boolean(next.present)) {
    next.endDate = null;
  }

  for (const key of ['tags', 'stack', 'images', 'relatedProjects', 'relatedExperience'] as const) {
    if (key in next) {
      const values = splitCommaList(next[key]);
      if (values.length > 0) next[key] = values;
      else delete next[key];
    }
  }

  if ('highlights' in next) {
    const values = splitLineList(next.highlights);
    if (values.length > 0) next.highlights = values;
    else delete next.highlights;
  }

  if (type === 'blog' && typeof next.draft !== 'boolean') {
    next.draft = action === 'draft';
  }

  if (type !== 'blog') {
    delete next.draft;
  }

  return next;
}

function requiredFieldsForType(type: EditorType): string[] {
  if (type === 'blog') return ['title', 'slug'];
  if (type === 'project') return ['title'];
  return ['title', 'slug', 'company'];
}

export default function ContentEditor({
  mode,
  type,
  slug,
  frontmatter,
  content: initialContent,
  showExperienceRelations = true,
}: ContentEditorProps) {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, unknown>>(() => {
    if (mode === 'create') return { ...buildInitialFrontmatter(type), ...frontmatter };
    return { ...frontmatter };
  });
  const [content, setContent] = useState(initialContent);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [coverModalOpen, setCoverModalOpen] = useState(false);
  const [relatedModalOpen, setRelatedModalOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const base = mode === 'create' ? { ...buildInitialFrontmatter(type), ...frontmatter } : { ...frontmatter };
    setForm(type === 'project' ? { ...base, slug } : base);
  }, [frontmatter, mode, slug, type]);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const hasScript = containsScript(content);
  const previewHtml = hasScript ? '' : renderMarkdown(content);

  function setField(key: string, value: unknown) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleProjectTitleChange(value: string) {
    setField('title', value);
  }


  function insertImage(url: string) {
    setContent((current) => `${current.trimEnd()}\n\n![image](${url})\n`);
  }

  function insertImages(urls: string[]) {
    if (urls.length === 0) return;
    const block = urls.map((url) => `![image](${url})`).join('\n\n');
    setContent((current) => {
      const trimmed = current.trimEnd();
      return trimmed ? `${trimmed}\n\n${block}\n` : `${block}\n`;
    });
  }

  function removeImage(url: string) {
    setContent((current) => removeImageFromContent(current, url));
    if (String(form.image ?? '') === url) {
      setField('image', '');
    }
  }

  function copyUrl(url: string) {
    void navigator.clipboard.writeText(url).then(() => {
      setCopied(url);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  async function handleSave(action: PublishAction) {
    const missing = requiredFieldsForType(type).filter((key) => {
      const value = form[key];
      return value === null || value === undefined || String(value).trim() === '';
    });

    if (missing.length > 0) {
      setError(`Please fill in: ${missing.join(', ')}`);
      return;
    }

    setSaving(true);
    setError(null);

    const normalizedFrontmatter = normalizeFrontmatterForSave(type, form, action);
    const usedImages = extractImageUrls(content).filter((url) => url !== String(form.image ?? ''));
    normalizedFrontmatter.image = String(form.image ?? '');
    normalizedFrontmatter.images = usedImages;
    const apiType = type === 'project' ? 'projects' : type;

    const res = await fetch(`/api/dev/content/${apiType}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: String(form.slug ?? slug),
        frontmatter: normalizedFrontmatter,
        content,
        overwrite: mode === 'edit',
      }),
    });

    setSaving(false);

    if (res.ok) {
      const redirectPath =
        type === 'blog' ? `/blog/${String(form.slug ?? slug)}` : type === 'project' ? `/projects/${String(form.slug ?? slug)}` : `/experience/${String(form.slug ?? slug)}`;
      router.push(redirectPath);
      return;
    }

    const data = await res.json().catch(() => ({}));
    setError(data.error ?? 'Failed to save content');
  }

  const routePath = type === 'blog' ? `/blog/${slug}` : type === 'project' ? `/projects/${slug}` : `/experience/${slug}`;
  const editorTitle = mode === 'create' ? `New ${typeName(type)}` : `Edit ${typeName(type)}`;
  const fieldDefs = getFieldDefinitions(type);
  const coverImage = String(form.image ?? '');
  const usedImages = extractImageUrls(content).filter((url) => url !== coverImage);
  const relatedExperiences = splitCommaList(form.relatedExperience);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--card)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="rounded border border-green-400/30 bg-green-400/10 px-2 py-1 font-mono text-xs text-green-400">
              DEV
            </span>
            <div>
              <h1 className="text-lg font-bold">{editorTitle}</h1>
              <p className="text-xs text-[var(--muted)]">
                {mode === 'create' ? 'Create and publish from one screen.' : 'Edit content without leaving the page.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/content"
              className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
            >
              ← Back
            </Link>
            {mode === 'edit' && (
              <Link
                href={routePath}
                className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
              >
                View
              </Link>
            )}
            <button
              type="button"
              onClick={() => setPreview((current) => !current)}
              className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm transition-colors hover:bg-[var(--muted-bg)]"
            >
              {preview ? 'Write' : 'Preview'}
            </button>
            {mode === 'create' ? (
              <>
                <button
                  type="button"
                  onClick={() => void handleSave('draft')}
                  disabled={saving || hasScript}
                  className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm transition-colors hover:bg-[var(--muted-bg)] disabled:opacity-50"
                >
                  Save draft
                </button>
                <button
                  type="button"
                  onClick={() => void handleSave('release')}
                  disabled={saving || hasScript}
                  className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Release'}
                </button>
                <button
                  type="button"
                  disabled
                  title="Templates are coming soon"
                  className="cursor-not-allowed rounded-lg border border-dashed border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)] opacity-60"
                >
                  Template
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => void handleSave('save')}
                disabled={saving || hasScript}
                className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-auto mt-4 max-w-7xl px-4 sm:px-6">
          <div className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        </div>
      )}

      {hasScript && (
        <div className="mx-auto mt-4 max-w-7xl px-4 sm:px-6">
          <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-3 text-sm text-yellow-400">
            JavaScript or &lt;script&gt; tags detected. Preview and save are disabled until removed.
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-[96rem] grid-cols-1 gap-6 px-4 py-6 sm:px-6 xl:grid-cols-[minmax(280px,320px)_minmax(0,2.5fr)_minmax(280px,320px)]">
        <aside className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Metadata</h2>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {mode === 'create' ? 'Editable while creating new content.' : 'Read-only in edit mode for now.'}
              </p>
            </div>
            <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px] uppercase tracking-wider text-[var(--muted)]">
              {type}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {fieldDefs.map((field) => {
              const value = form[field.key];
              const spanClass = field.span === 2 ? 'md:col-span-2' : '';
              const label = (
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                    {field.label}
                  </span>
                  {field.help && <span className="text-[10px] text-[var(--muted)]">{field.help}</span>}
                </div>
              );

              if (mode === 'edit') {
                return (
                  <div key={field.key} className={spanClass}>
                    {label}
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]">
                      {formatFieldValue(value) || <span className="text-[var(--muted)]">—</span>}
                    </div>
                  </div>
                );
              }

              if (field.key === 'title' && type === 'project') {
                return (
                  <div key={field.key} className={spanClass}>
                    {label}
                    <input
                      type="text"
                      value={String(value ?? '')}
                      onChange={(event) => handleProjectTitleChange(event.target.value)}
                      placeholder={field.placeholder}
                      disabled={false}
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-70"
                    />
                  </div>
                );
              }


              if (field.kind === 'checkbox') {
                return (
                  <label key={field.key} className={`${spanClass} flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3`}>
                    <input
                      type="checkbox"
                      checked={Boolean(value)}
                      onChange={(event) => setField(field.key, event.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded accent-[var(--accent)]"
                    />
                    <div>
                      <div className="text-sm font-medium text-[var(--foreground)]">{field.label}</div>
                      {field.help && <div className="mt-0.5 text-xs text-[var(--muted)]">{field.help}</div>}
                    </div>
                  </label>
                );
              }

              if (field.kind === 'select') {
                return (
                  <div key={field.key} className={spanClass}>
                    {label}
                    <select
                      value={String(value ?? '')}
                      onChange={(event) => setField(field.key, event.target.value)}
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)]"
                    >
                      {(field.options ?? []).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              if (field.kind === 'textarea' || field.kind === 'list') {
                return (
                  <div key={field.key} className={spanClass}>
                    {label}
                    <textarea
                      value={String(value ?? '')}
                      onChange={(event) => setField(field.key, event.target.value)}
                      placeholder={field.placeholder}
                      rows={field.rows ?? (field.kind === 'list' ? 3 : 4)}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                    />
                  </div>
                );
              }

              if (field.kind === 'date') {
                return (
                  <div key={field.key} className={spanClass}>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                        {field.label}
                      </span>
                    </div>
                    <input
                      type="date"
                      value={String(value ?? '')}
                      onChange={(event) => setField(field.key, event.target.value)}
                      placeholder={field.placeholder}
                      disabled={false}
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-70"
                    />
                    {field.help && <div className="mt-1 text-[10px] text-[var(--muted)]">{field.help}</div>}
                  </div>
                );
              }

              return (
                <div key={field.key} className={spanClass}>
                  {label}
                  <input
                    type="text"
                    value={String(value ?? '')}
                    onChange={(event) => setField(field.key, event.target.value)}
                    placeholder={field.placeholder}
                    disabled={false}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </div>
              );
            })}
          </div>
        </aside>

        <main className="flex min-h-[60vh] flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Content</h2>
              <p className="mt-1 text-xs text-[var(--muted)]">Markdown and HTML are supported. Script content is blocked.</p>
            </div>
            <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px] uppercase tracking-wider text-[var(--muted)]">
              {preview ? 'Preview' : 'Editor'}
            </span>
          </div>

          {preview ? (
            <div className="prose-content flex-1 overflow-y-auto p-6" dangerouslySetInnerHTML={{ __html: previewHtml }} />
          ) : (
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="min-h-[60vh] flex-1 w-full resize-none rounded-b-2xl bg-[var(--background)] p-6 font-mono text-sm leading-relaxed text-[var(--foreground)] outline-none"
              placeholder="Write markdown or HTML here…"
              spellCheck={false}
            />
          )}
        </main>

        <aside className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Media</h2>
              <p className="mt-1 text-xs text-[var(--muted)]">Reuse uploaded files without leaving the editor.</p>
            </div>
            <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px] uppercase tracking-wider text-[var(--muted)]">
              {usedImages.length}
            </span>
          </div>

          <div className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">Cover image</h3>
              <button
                type="button"
                onClick={() => setCoverModalOpen(true)}
                className="text-[10px] text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
              >
                Choose cover
              </button>
            </div>
            {coverImage ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setPreviewImageUrl(coverImage)}
                  className="relative block aspect-video w-full overflow-hidden rounded-lg bg-[var(--muted-bg)]"
                >
                  <Image src={coverImage} alt="Cover image" fill className="object-cover" sizes="(max-width: 1280px) 100vw, 340px" />
                </button>
                <p className="truncate font-mono text-[10px] text-[var(--muted)]">{coverImage}</p>
                <button
                  type="button"
                  onClick={() => setField('image', '')}
                  className="text-[10px] text-[var(--muted)] transition-colors hover:text-red-400"
                >
                  Clear cover
                </button>
              </div>
            ) : (
              <p className="text-xs text-[var(--muted)]">No cover image selected yet.</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mb-4 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--muted-bg)]"
          >
            🖼 Open Media Library
          </button>

          {usedImages.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">Images used in content</h3>
              <div className="space-y-2">
                {usedImages.map((url) => (
                  <div key={url} className="flex gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-2">
                    <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md bg-[var(--muted-bg)]">
                      <button
                        type="button"
                        onClick={() => setPreviewImageUrl(url)}
                        className="group absolute inset-0"
                      >
                        <Image src={url} alt="" fill className="object-cover transition-transform group-hover:scale-[1.02]" sizes="96px" />
                      </button>
                      <button
                        type="button"
                        aria-label="Remove image"
                        onClick={() => removeImage(url)}
                        className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-red-400/40 bg-black/80 text-[10px] font-semibold text-red-300 shadow-lg transition-colors hover:bg-red-500 hover:text-white"
                      >
                        ×
                      </button>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-[10px] text-[var(--muted)]">{url}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => copyUrl(url)}
                          className="rounded-md border border-[var(--border)] px-2 py-1 text-[11px] font-medium transition-colors hover:bg-[var(--muted-bg)]"
                        >
                          {copied === url ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                          type="button"
                          onClick={() => insertImage(url)}
                          className="rounded-md bg-[var(--accent)] px-2 py-1 text-[11px] font-medium text-white"
                        >
                          Insert
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {type === 'project' && showExperienceRelations && (
            <div className="mt-5 border-t border-[var(--border)] pt-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">Related experiences</h3>
                  <p className="mt-1 text-xs text-[var(--muted)]">Link existing experiences to this project.</p>
                </div>
                <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px] uppercase tracking-wider text-[var(--muted)]">
                  {relatedExperiences.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setRelatedModalOpen(true)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--muted-bg)]"
              >
                ➕ Add related experience
              </button>

              {relatedExperiences.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {relatedExperiences.map((slug) => (
                    <span
                      key={slug}
                      className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--muted-bg)] px-3 py-1 text-xs text-[var(--foreground)]"
                    >
                      {slug}
                      <button
                        type="button"
                        onClick={() => setField('relatedExperience', relatedExperiences.filter((item) => item !== slug))}
                        className="text-[var(--muted)] hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <p className="mt-4 text-xs text-[var(--muted)]">
            Selected media is only temporary until you click <span className="font-medium text-[var(--foreground)]">Add selected</span>. Only images actually used in the content are saved.
          </p>
        </aside>
      </div>

      <MediaPickerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAddSelected={(urls) => {
          insertImages(urls);
        }}
      />

      <MediaCoverPickerModal
        open={coverModalOpen}
        urls={usedImages}
        selectedUrl={coverImage || null}
        onClose={() => setCoverModalOpen(false)}
        onConfirm={(url) => setField('image', url)}
      />

      <MediaPreviewModal open={Boolean(previewImageUrl)} url={previewImageUrl} onClose={() => setPreviewImageUrl(null)} />

      {showExperienceRelations && (
        <ExperiencePickerModal
          open={relatedModalOpen}
          selected={splitCommaList(form.relatedExperience)}
          onChange={(next) => setField('relatedExperience', next)}
          onClose={() => setRelatedModalOpen(false)}
        />
      )}
    </div>
  );
}
