import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import type { Project } from '@/lib/types';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const { frontmatter, slug } = project;

  return (
    <Link href={`/projects/${slug}`} className="group block h-full">
      <div className="h-full border border-[var(--border)] rounded-lg p-5 bg-[var(--card)] hover:border-[var(--accent)]/50 transition-all duration-200 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors line-clamp-1">
            {frontmatter.title}
          </h3>
          <Badge variant="status" status={frontmatter.status} className="shrink-0">
            {frontmatter.status}
          </Badge>
        </div>

        <p className="text-base text-[var(--muted)] line-clamp-2 mb-4 flex-1">
          {frontmatter.summary}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {frontmatter.stack.slice(0, 4).map(tech => (
            <Badge key={tech}>{tech}</Badge>
          ))}
          {frontmatter.stack.length > 4 && (
            <Badge>+{frontmatter.stack.length - 4}</Badge>
          )}
        </div>

        {frontmatter.github && (
          <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center gap-1 text-xs text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors">
            <span>↗</span>
            <span>View on GitHub</span>
          </div>
        )}
      </div>
    </Link>
  );
}
