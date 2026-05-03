import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/mdx/MDXComponents';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { Metadata } from 'next';
import { AboutSidebar } from '@/components/about/AboutSidebar';
import { SpotifyTopArtists, SpotifyTopTracks } from '@/components/spotify';

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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="lg:w-64 flex-shrink-0">
          <AboutSidebar />
        </div>
        <div className="flex-1 min-w-0">
          {content ? (
            <article className="prose-content">
              <MDXRemote source={content} components={mdxComponents} />
            </article>
          ) : (
            <p className="text-[var(--muted)]">About content coming soon.</p>
          )}
        </div>
        <div className="lg:w-80 flex-shrink-0 space-y-6">
          <h3 className="text-lg font-semibold mb-4">Music Taste</h3>
          <SpotifyTopArtists limit={5} timeRange="medium_term" />
          <SpotifyTopTracks limit={5} timeRange="medium_term" />
        </div>
      </div>
    </main>
  );
}
