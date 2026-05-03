import { syncAndGetAllTags } from '@/lib/tags';
import { requireAdminSession } from '@/lib/session';
import TagsManager from './TagsManager';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Tags — Admin' };

export default async function AdminTagsPage() {
  await requireAdminSession();
  const initialTags = await syncAndGetAllTags();

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">Tags</h1>
        <p className="text-sm text-[var(--muted)]">
          All content tags synced from MDX frontmatter. Create, browse, and manage tags.
        </p>
      </div>
      <TagsManager initialTags={initialTags} />
    </div>
  );
}
