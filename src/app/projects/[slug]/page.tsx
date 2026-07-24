import { getProjectBySlug, getAllProjects, getExperienceBySlug } from '@/lib/mdx';
import { notFound } from 'next/navigation';
import Badge from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDateRange } from '@/lib/utils';
import Link from 'next/link';
import type { Metadata } from 'next';
import { GiscusComments } from '@/components/comments/GiscusComments';
import { getSiteConfig } from '@/lib/config';
import { ProjectImageGallery } from '@/components/projects/ProjectImageGallery';
import ProjectContentWrapper from './ProjectContentWrapper';
import { extractImageUrls } from '@/lib/markdown';
import { extractHeadings } from '@/lib/toc-utils';
import { TableOfContents } from '@/components/mdx/TableOfContents';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.frontmatter.title,
    description: project.frontmatter.summary,
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const { frontmatter, content } = project;
  const { giscus } = getSiteConfig();
  const stack = frontmatter.stack ?? [];
  const headings = extractHeadings(content);
  const relatedExperience = (frontmatter.relatedExperience ?? [])
    .map((entry) => getExperienceBySlug(entry))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  const inlineImages = extractImageUrls(content).filter((url) => url !== (frontmatter.image ?? ''));

  return (
    <main className="mx-auto max-w-[96rem] px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(280px,320px)_minmax(0,1fr)_minmax(280px,320px)]">
        <aside className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm xl:sticky xl:top-6 xl:h-fit">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Metadata</h2>
              <p className="mt-1 text-xs text-[var(--muted)]">Project overview and facts.</p>
            </div>
            <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px] uppercase tracking-wider text-[var(--muted)]">
              Project
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="status" status={frontmatter.status}>{frontmatter.status}</Badge>
                <Badge>{frontmatter.category || 'Uncategorized'}</Badge>
              </div>
              <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">{frontmatter.title}</h1>
            </div>

            {frontmatter.summary && (
              <p className="text-sm leading-relaxed text-[var(--muted)]">{frontmatter.summary}</p>
            )}

            <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 text-sm text-[var(--muted)]">
              {formatDateRange(frontmatter.startDate, frontmatter.endDate)}
            </div>

            {stack.length > 0 && (
              <div>
                <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">Stack</h3>
                <div className="flex flex-wrap gap-1.5">
                  {stack.map((tech) => (
                    <Badge key={tech}>{tech}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {frontmatter.github && (
                <Button href={frontmatter.github} external variant="secondary">↗ GitHub</Button>
              )}
              {frontmatter.demo && (
                <Button href={frontmatter.demo} external>↗ Live Demo</Button>
              )}
            </div>
          </div>
        </aside>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
          <div className="border-b border-[var(--border)] px-5 py-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Content</h2>
              <p className="mt-1 text-xs text-[var(--muted)]">Markdown and HTML render inline.</p>
            </div>
            <Button href="/projects" variant="ghost" className="-mr-2">
              ← Back to Projects
            </Button>
          </div>

          <div className="px-5 py-6 sm:px-6 lg:px-8">
            <ProjectContentWrapper content={content} />

            {inlineImages.length > 0 && (
              <ProjectImageGallery images={inlineImages} title={frontmatter.title} />
            )}

            <div className="mt-10 border-t border-[var(--border)] pt-8">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Related Experience</h2>
              {relatedExperience.length > 0 ? (
                <div className="space-y-3">
                  {relatedExperience.map((entry) => {
                    const title = entry.frontmatter.title ?? entry.frontmatter.role ?? 'Role';
                    return (
                      <Link
                        key={entry.slug}
                        href={`/experience/${entry.slug}`}
                        className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 transition-colors hover:border-[var(--accent)]/50"
                      >
                        <div>
                          <div className="font-medium text-[var(--foreground)]">{title}</div>
                          <div className="text-sm text-[var(--muted)]">{entry.frontmatter.company}</div>
                        </div>
                        <svg className="shrink-0 text-[var(--muted)]" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"/>
                        </svg>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-[var(--muted)]">No related experience linked yet.</p>
              )}
            </div>
          </div>
        </section>

        <aside className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm xl:sticky xl:top-6 xl:h-fit">
          <TableOfContents headings={headings} depth={3} variant="panel" />
        </aside>
      </div>

      <div className="mt-10">
        <GiscusComments config={giscus} />
      </div>
    </main>
  );
}
