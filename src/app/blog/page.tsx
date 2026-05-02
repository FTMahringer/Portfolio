import { getAllBlogPosts } from '@/lib/mdx';
import BlogCard from '@/components/blog/BlogCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Thoughts on tech, home lab infrastructure, and software development.',
};

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold mb-2 text-[var(--foreground)]">Blog</h1>
      <p className="text-[var(--muted)] mb-10">
        Thoughts on tech, home lab, and software development.
      </p>
      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map(post => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-[var(--muted)]">No posts yet — coming soon.</p>
      )}
    </main>
  );
}
