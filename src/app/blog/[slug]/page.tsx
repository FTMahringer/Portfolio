import { getBlogPostBySlug, getAllBlogPosts } from '@/lib/mdx';
import { TableOfContents } from '@/components/mdx/TableOfContents';
import { extractHeadings } from '@/lib/toc-utils';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/mdx/MDXComponents';
import Badge from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import type { Metadata } from 'next';
import { GiscusComments } from '@/components/comments/GiscusComments';
import { getSiteConfig } from '@/lib/config';
import { getRelatedPosts } from '@/lib/related';
import { RelatedPosts } from '@/components/blog/RelatedPosts';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllBlogPosts().map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return {};
  return { title: post.frontmatter.title, description: post.frontmatter.summary };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return null;
  const headings = extractHeadings(post.content);
  const { giscus } = getSiteConfig();
  const relatedPosts = getRelatedPosts(slug, post.frontmatter.tags || []);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <TableOfContents headings={headings} />
      <Button href="/blog" variant="ghost" className="mb-8 -ml-1">
        ← Back to Blog
      </Button>

      <header className="mb-10">
        <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-3">
          <time dateTime={post.frontmatter.publishedAt}>{formatDate(post.frontmatter.publishedAt)}</time>
          <span>·</span>
          <span>{post.readingTime}</span>
        </div>
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3">{post.frontmatter.title}</h1>
        <p className="text-[var(--muted)] leading-relaxed mb-4">{post.frontmatter.summary}</p>
        <div className="flex flex-wrap gap-1.5">
          {post.frontmatter.tags.map(tag => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      </header>

      <hr className="border-[var(--border)] mb-10" />

      <article>
        <MDXRemote source={post.content} components={mdxComponents} />
      </article>

      {/* Related Posts */}
      <RelatedPosts posts={relatedPosts} />

      {/* Comments */}
      {giscus?.enabled && (
        <div className="mt-16">
          <GiscusComments config={giscus} />
        </div>
      )}
    </main>
  );
}
