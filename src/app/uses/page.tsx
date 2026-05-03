import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/mdx/MDXComponents';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export const metadata: Metadata = {
  title: 'Uses',
  description: 'Hardware, software and editor setup I rely on',
};

export default async function UsesPage() {
  const filePath = path.join(process.cwd(), 'content', 'pages', 'uses.mdx');
  let content = '';
  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, 'utf8');
    content = matter(raw).content;
  }
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold mb-3 text-[var(--foreground)]">Uses</h1>
      <hr className="border-[var(--border)] mb-6" />
      {content ? (
        <article className="prose-content">
          <MDXRemote source={content} components={mdxComponents} />
        </article>
      ) : (
        <p className="text-[var(--muted)]">Uses content coming soon.</p>
      )}
    </main>
  );
}
