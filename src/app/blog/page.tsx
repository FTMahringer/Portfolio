import { getAllBlogPosts } from '@/lib/mdx';
import type { Metadata } from 'next';
import BlogClient from './BlogClient';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Thoughts on tech, home lab infrastructure, and software development.',
};

export default function BlogPage() {
  const posts = getAllBlogPosts();
  const allTags = [...new Set(posts.flatMap(p => p.frontmatter.tags))].sort();

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold mb-2 text-[var(--foreground)]">Blog</h1>
      <p className="text-[var(--muted)] mb-10">
        Thoughts on tech, home lab, and software development.
      </p>
      {posts.length > 0 ? (
        <BlogClient posts={posts} allTags={allTags} />
      ) : (
        <p className="text-[var(--muted)]">No posts yet — coming soon.</p>
      )}
    </main>
  );
}
