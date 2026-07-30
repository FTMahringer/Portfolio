import Link from 'next/link';
import type { BlogPost } from '@/lib/types';
import { buildLocalePath } from '@/lib/locale-routing';
import type { LocaleCode } from '@/lib/locale-registry';

interface RelatedPostsProps {
  posts: BlogPost[];
  locale: LocaleCode;
}

export function RelatedPosts({ posts, locale }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateString));
  };

  return (
    <div className="mt-16 pt-8 border-t border-[var(--border)]">
      <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">
        Related Posts
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={buildLocalePath(locale, `/blog/${post.slug}`)}
            className="group block p-4 bg-[var(--card)] border border-[var(--border)] rounded-lg hover:border-[var(--accent)] transition-all"
          >
            <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors mb-2">
              {post.frontmatter.title}
            </h3>
            <p className="text-sm text-[var(--muted)] line-clamp-2 mb-3">
              {post.frontmatter.summary}
            </p>
            <time className="text-xs text-[var(--muted)]" dateTime={post.frontmatter.publishedAt}>
              {formatDate(post.frontmatter.publishedAt)}
            </time>
          </Link>
        ))}
      </div>
    </div>
  );
}
