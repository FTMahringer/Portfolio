import { syncAndGetAllTags } from '@/lib/tags';
import { requireAdminSession } from '@/lib/session';
import TagsManager from './TagsManager';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Tags — Admin' };

export default async function AdminTagsPage() {
  await requireAdminSession();
  const initialTags = await syncAndGetAllTags();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] px-6 py-6 shadow-sm">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-1">Tags</h1>
        <p className="max-w-3xl text-sm text-[var(--muted)]">
          All content tags synced from MDX frontmatter. Create, browse, and manage tags from one place.
        </p>
      </div>
      <TagsManager initialTags={initialTags} />
    </div>
  );
}
