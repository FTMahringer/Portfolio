import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { TagPill } from "@/components/ui/TagBadge";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@/lib/types";

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  const { frontmatter, slug, readingTime } = post;

  return (
    <Link href={`/blog/${slug}`} className="group block">
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
        <p className="text-base text-[var(--muted)] line-clamp-2 mb-3">
          {frontmatter.summary}
        </p>
        {frontmatter.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {frontmatter.tags.map((tag) => (
              <TagPill key={tag} name={tag} />
            ))}
          </div>
        )}
      </article>
    </Link>
  );
}
