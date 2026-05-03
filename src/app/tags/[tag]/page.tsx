import { notFound } from 'next/navigation';
import { getAllProjects, getAllBlogPosts } from '@/lib/mdx';
import { getTagBySlug, slugifyTag } from '@/lib/tags';
import { TagBadge } from '@/components/ui/TagBadge';
import ProjectCard from '@/components/projects/ProjectCard';
import BlogCard from '@/components/blog/BlogCard';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ tag: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  return { title: `#${tag}`, description: `Content tagged with "${tag}"` };
}

export default async function TagPage({ params }: Props) {
  const { tag: tagSlug } = await params;

  const projects = getAllProjects().filter(p =>
    (p.frontmatter.tags ?? []).some(t => slugifyTag(t) === tagSlug)
  );
  const posts = getAllBlogPosts().filter(p =>
    p.frontmatter.tags.some(t => slugifyTag(t) === tagSlug)
  );

  if (projects.length === 0 && posts.length === 0) notFound();

  const tagInfo = await getTagBySlug(tagSlug);
  const displayName =
    tagInfo?.name ??
    projects[0]?.frontmatter.tags?.find(t => slugifyTag(t) === tagSlug) ??
    posts[0]?.frontmatter.tags?.find(t => slugifyTag(t) === tagSlug) ??
    tagSlug;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-16">
      <div>
        <p className="text-sm text-[var(--muted)] mb-3">Topic</p>
        <div className="flex items-center gap-3 flex-wrap">
          <TagBadge
            name={displayName}
            colorIndex={tagInfo?.colorIndex}
            href={false}
            className="text-sm px-3 py-1"
          />
          <span className="text-[var(--muted)] text-sm">
            {projects.length + posts.length} item{projects.length + posts.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {projects.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            Projects <span className="text-[var(--muted)] font-normal text-base">({projects.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(p => <ProjectCard key={p.slug} project={p} />)}
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            Blog Posts <span className="text-[var(--muted)] font-normal text-base">({posts.length})</span>
          </h2>
          <div className="space-y-4">
            {posts.map(p => <BlogCard key={p.slug} post={p} />)}
          </div>
        </section>
      )}
    </main>
  );
}
