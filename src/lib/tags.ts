import { db } from "@/db";
import { tags } from "@/db/schema";
import { eq } from "drizzle-orm";
import path from "path";
import fs from "fs";
import { getAllProjects, getAllBlogPosts } from "./mdx";
import { slugifyTag, hashTagColor } from "./constants";
export { TAG_COLORS, hashTagColor, slugifyTag, getTagColor } from "./constants";
export type { TagColor } from "./constants";

// Seeds tags from config/initial-tags.csv (name-only, one per line, # = comment)
export async function seedInitialTags() {
  const csvPath = path.join(process.cwd(), "config", "initial-tags.csv");
  if (!fs.existsSync(csvPath)) return;
  const lines = fs.readFileSync(csvPath, "utf-8").split("\n");
  for (const raw of lines) {
    const name = raw.trim();
    if (!name || name.startsWith("#")) continue;
    const slug = slugifyTag(name);
    const colorIndex = hashTagColor(slug);
    await db
      .insert(tags)
      .values({
        name,
        slug,
        colorIndex,
        usageCount: 0,
        createdAt: Math.floor(Date.now() / 1000),
      })
      .onConflictDoNothing();
  }
}

// Syncs all tags found in MDX frontmatter into the DB (upsert).
// Also seeds from initial-tags.csv on first call.
// Returns the full list sorted by usage_count desc.
export async function syncAndGetAllTags() {
  await seedInitialTags();

  const counts = new Map<string, number>();
  try {
    for (const p of getAllProjects()) {
      for (const t of p.frontmatter.tags ?? []) {
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }
    for (const p of getAllBlogPosts()) {
      for (const t of p.frontmatter.tags ?? []) {
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
      .values({
        name,
        slug,
        colorIndex,
        usageCount: count,
        createdAt: Math.floor(Date.now() / 1000),
      })
      .onConflictDoUpdate({
        target: tags.slug,
        set: { usageCount: count, name },
      });
  }

  return getAllTagsFromDb();
}

export async function getAllTagsFromDb() {
  const rows = await db.select().from(tags);
  return rows.sort((a, b) => b.usageCount - a.usageCount);
}

export async function getTagBySlug(slug: string) {
  const result = await db
    .select()
    .from(tags)
    .where(eq(tags.slug, slug))
    .limit(1);
  return result[0] ?? null;
}

export async function createTag(
  name: string,
): Promise<typeof tags.$inferSelect> {
  const slug = slugifyTag(name);
  const colorIndex = hashTagColor(slug);
  await db
    .insert(tags)
    .values({
      name,
      slug,
      colorIndex,
      usageCount: 0,
      createdAt: Math.floor(Date.now() / 1000),
    })
    .onConflictDoUpdate({ target: tags.slug, set: { name } });
  const result = await db
    .select()
    .from(tags)
    .where(eq(tags.slug, slug))
    .limit(1);
  return result[0];
}

export async function deleteTag(id: number) {
  await db.delete(tags).where(eq(tags.id, id));
}

// Bulk-import from a CSV string (name-only, one per line, # = comment).
// Returns { created, skipped }.
export async function importTagsFromCsv(
  csv: string,
): Promise<{ created: number; skipped: number }> {
  let created = 0;
  let skipped = 0;
  const lines = csv.split("\n");
  for (const raw of lines) {
    const name = raw.trim();
    if (!name || name.startsWith("#")) {
      skipped++;
      continue;
    }
    const slug = slugifyTag(name);
    const colorIndex = hashTagColor(slug);
    const result = await db
      .insert(tags)
      .values({
        name,
        slug,
        colorIndex,
        usageCount: 0,
        createdAt: Math.floor(Date.now() / 1000),
      })
      .onConflictDoNothing();
    if ((result as { changes?: number }).changes) created++;
    else skipped++;
  }
  return { created, skipped };
}

// Returns { projects: string[], posts: string[] } of slugs that use a given tag name
export function getTagUsage(tagName: string) {
  const slug = slugifyTag(tagName);
  const projects = getAllProjects()
    .filter((p) =>
      (p.frontmatter.tags ?? []).some((t) => slugifyTag(t) === slug),
    )
    .map((p) => ({
      slug: p.slug,
      title: p.frontmatter.title,
      type: "project" as const,
    }));
  const posts = getAllBlogPosts()
    .filter((p) => p.frontmatter.tags.some((t) => slugifyTag(t) === slug))
    .map((p) => ({
      slug: p.slug,
      title: p.frontmatter.title,
      type: "post" as const,
    }));
  return [...projects, ...posts];
}
