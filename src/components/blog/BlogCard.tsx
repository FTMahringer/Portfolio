import Link from 'next/link';
import type { BlogPost } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { buildLocalePath } from '@/lib/locale-routing';
import type { LocaleCode } from '@/lib/locale-registry';

interface BlogCardProps {
  post: BlogPost;
  locale: LocaleCode;
}

export default function BlogCard({ post, locale }: BlogCardProps) {
  const { frontmatter, slug, readingTime } = post;

  return (
    <Link href={buildLocalePath(locale, `/blog/${slug}`)} className="group block">
      <article className="border border-[var(--border)] rounded-lg p-5 bg-[var(--card)] hover:border-[var(--accent)]/50 transition-all duration-200">
        <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-2">
          <time dateTime={frontmatter.publishedAt}>
            {formatDate(frontmatter.publishedAt)}
          </time>
          <span>·</span>
          <span>{readingTime}</span>
        </div>
        <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors mb-2">
          {frontmatter.title}
        </h3>
        <p className="text-base text-[var(--muted)] line-clamp-2">
          {frontmatter.summary}
        </p>
      </article>
    </Link>
  );
}
