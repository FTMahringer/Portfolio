import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/mdx/MDXComponents';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { Metadata } from 'next';
import { AboutSidebar } from '@/components/about/AboutSidebar';

export const metadata: Metadata = {
  title: 'About Me',
  description: 'Learn more about Fynn M. – Software Developer & Systems Engineer.',
};

export default async function AboutPage() {
  const filePath = path.join(process.cwd(), 'content', 'pages', 'about.mdx');
  let content = '';
  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    content = matter(raw).content;
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <div className="flex flex-col md:flex-row gap-10">
        <AboutSidebar />
        <div className="flex-1 min-w-0">
          {content ? (
            <article className="prose-content">
              <MDXRemote source={content} components={mdxComponents} />
            </article>
          ) : (
            <p className="text-[var(--muted)]">About content coming soon.</p>
          )}
        </div>
      </div>
    </main>
  );
}
