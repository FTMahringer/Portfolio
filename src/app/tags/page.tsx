import { syncAndGetAllTags } from '@/lib/tags';
import { TagBadge } from '@/components/ui/TagBadge';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tags',
  description: 'Browse all content by topic.',
};

export default async function TagsPage() {
  const allTags = await syncAndGetAllTags();

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold mb-2 text-[var(--foreground)]">Tags</h1>
      <p className="text-[var(--muted)] mb-10">Browse all content by topic.</p>
      {allTags.length === 0 ? (
        <p className="text-[var(--muted)]">No tags yet.</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {allTags.map(tag => (
            <TagBadge
              key={tag.id}
              name={tag.name}
              colorIndex={tag.colorIndex}
              count={tag.usageCount}
            />
          ))}
        </div>
      )}
    </main>
  );
}
