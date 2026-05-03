import { db } from '@/db';
import { tags } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getAllProjects, getAllBlogPosts } from './mdx';
import { slugifyTag, hashTagColor } from './tag-utils';

// Re-export client-safe utilities so server code can import from one place
export { TAG_COLORS, hashTagColor, slugifyTag, getTagColor } from './tag-utils';
export type { TagColor } from './tag-utils';

// Syncs all tags found in MDX frontmatter into the DB (upsert).
// Returns the full list sorted by usage_count desc.
export async function syncAndGetAllTags() {
  // Collect all tags from content
  const counts = new Map<string, number>();
  try {
    for (const p of getAllProjects()) {
      for (const t of (p.frontmatter.tags ?? [])) {
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }
    for (const p of getAllBlogPosts()) {
      for (const t of (p.frontmatter.tags ?? [])) {
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }
  } catch {
    // content may not exist yet
  }

  for (const [name, count] of counts) {
    const slug = slugifyTag(name);
    const colorIndex = hashTagColor(slug);
    await db
      .insert(tags)
      .values({ name, slug, colorIndex, usageCount: count, createdAt: Math.floor(Date.now() / 1000) })
      .onConflictDoUpdate({ target: tags.slug, set: { usageCount: count, name } });
  }

  return getAllTagsFromDb();
}

export async function getAllTagsFromDb() {
  const rows = await db.select().from(tags);
  return rows.sort((a, b) => b.usageCount - a.usageCount);
}

export async function getTagBySlug(slug: string) {
  const result = await db.select().from(tags).where(eq(tags.slug, slug)).limit(1);
  return result[0] ?? null;
}

export async function createTag(name: string): Promise<typeof tags.$inferSelect> {
  const slug = slugifyTag(name);
  const colorIndex = hashTagColor(slug);
  await db
    .insert(tags)
    .values({ name, slug, colorIndex, usageCount: 0, createdAt: Math.floor(Date.now() / 1000) })
    .onConflictDoUpdate({ target: tags.slug, set: { name } });
  const result = await db.select().from(tags).where(eq(tags.slug, slug)).limit(1);
  return result[0];
}

export async function deleteTag(id: number) {
  await db.delete(tags).where(eq(tags.id, id));
}

// Returns { projects: string[], posts: string[] } of slugs that use a given tag name
export function getTagUsage(tagName: string) {
  const slug = slugifyTag(tagName);
  const projects = getAllProjects()
    .filter(p => (p.frontmatter.tags ?? []).some(t => slugifyTag(t) === slug))
    .map(p => ({ slug: p.slug, title: p.frontmatter.title, type: 'project' as const }));
  const posts = getAllBlogPosts()
    .filter(p => p.frontmatter.tags.some(t => slugifyTag(t) === slug))
    .map(p => ({ slug: p.slug, title: p.frontmatter.title, type: 'post' as const }));
  return [...projects, ...posts];
}
