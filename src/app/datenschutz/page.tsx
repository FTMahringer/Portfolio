import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/mdx/MDXComponents';

export const metadata: Metadata = {
  title: 'Datenschutz',
  description: 'Privacy policy and data protection information.',
};

export default async function DatenschutzPage() {
  const filePath = path.join(process.cwd(), 'content', 'pages', 'datenschutz.mdx');
  let content = '';
  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    content = matter(raw).content;
  }
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold mb-6 text-[var(--foreground)]">Datenschutzerklärung</h1>
      <section className="prose-content">
        {content ? (
          <MDXRemote source={content} components={mdxComponents} />
        ) : (
          <p className="text-[var(--muted)]">Datenschutz content coming soon.</p>
        )}
      </section>
    </main>
  );
}
