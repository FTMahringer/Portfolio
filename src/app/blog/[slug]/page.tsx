import { getBlogPostBySlug, getAllBlogPosts } from '@/lib/mdx';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/mdx/MDXComponents';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { blogPostSchema } from '@/lib/jsonld';

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
  if (!post) notFound();

  const { frontmatter, content, readingTime } = post;

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <JsonLd data={blogPostSchema(post)} />
      <Button href="/blog" variant="ghost" className="mb-8 -ml-1">
        ← Back to Blog
      </Button>

      <header className="mb-10">
        <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-3">
          <time dateTime={frontmatter.publishedAt}>{formatDate(frontmatter.publishedAt)}</time>
          <span>·</span>
          <span>{readingTime}</span>
        </div>
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3">{frontmatter.title}</h1>
        <p className="text-[var(--muted)] leading-relaxed mb-4">{frontmatter.summary}</p>
        <div className="flex flex-wrap gap-1.5">
          {frontmatter.tags.map(tag => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      </header>

      <hr className="border-[var(--border)] mb-10" />

      <article>
        <MDXRemote source={content} components={mdxComponents} />
      </article>
    </main>
  );
}
