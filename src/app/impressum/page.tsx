import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/mdx/MDXComponents';

export const metadata: Metadata = {
  title: 'Impressum',
  description: 'Legal notice and contact information.',
};

export default async function ImpressumPage() {
  const filePath = path.join(process.cwd(), 'content', 'pages', 'impressum.mdx');
  let content = '';
  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    content = matter(raw).content;
  }
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold mb-6 text-[var(--foreground)]">Impressum</h1>
      <section className="prose-content">
        {content ? (
          <MDXRemote source={content} components={mdxComponents} />
        ) : (
          <p className="text-[var(--muted)]">Impressum content coming soon.</p>
        )}
      </section>
    </main>
  );
}
