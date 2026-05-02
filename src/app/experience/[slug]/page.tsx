import { getExperienceBySlug, getAllExperience, getProjectBySlug } from '@/lib/mdx';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/mdx/MDXComponents';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllExperience().map(e => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const exp = getExperienceBySlug(slug);
  if (!exp) return {};
  return {
    title: `${exp.frontmatter.title ?? exp.frontmatter.role} @ ${exp.frontmatter.company}`,
    description: `${exp.frontmatter.title ?? exp.frontmatter.role} at ${exp.frontmatter.company}`,
  };
}

const TYPE_LABELS: Record<string, string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  internship: 'Internship',
  freelance: 'Freelance',
  contract: 'Contract',
}

function formatPeriod(start?: string, end?: string): string {
  if (!start) return '';
  const fmt = (d: string) => {
    const [y, m] = d.split('-');
    if (!m) return y;
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(m, 10) - 1]} ${y}`;
  };
  const endStr = !end || end === 'present' ? 'Present' : fmt(end);
  return `${fmt(start)} – ${endStr}`;
}

export default async function ExperienceDetailPage({ params }: Props) {
  const { slug } = await params;
  const exp = getExperienceBySlug(slug);
  if (!exp) notFound();

  const { frontmatter, content } = exp;
  const title = frontmatter.title ?? frontmatter.role ?? 'Role';

  // Resolve related projects
  const relatedProjects = (frontmatter.relatedProjects ?? [])
    .map(s => getProjectBySlug(s))
    .filter(Boolean)

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <Link
        href="/experience"
        className="inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors mb-8"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5A.5.5 0 0 1 12 8z"/>
        </svg>
        Back to Experience
      </Link>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="border-l-2 border-[var(--accent)] pl-6 mb-6">
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">{title}</h1>
            <p className="text-[var(--accent)] font-medium mb-2">
              {frontmatter.company}
              {frontmatter.location && <span className="text-[var(--muted)] font-normal"> · {frontmatter.location}</span>}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
              <span>{formatPeriod(frontmatter.startDate, frontmatter.endDate ?? undefined)}</span>
              {frontmatter.type && (
                <>
                  <span>·</span>
                  <span>{TYPE_LABELS[frontmatter.type] ?? frontmatter.type}</span>
                </>
              )}
            </div>
          </div>

          {frontmatter.stack && frontmatter.stack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-8">
              {frontmatter.stack.map((tech: string) => (
                <Badge key={tech}>{tech}</Badge>
              ))}
            </div>
          )}

          <article className="prose-content">
            <MDXRemote source={content} components={mdxComponents} />
          </article>
        </div>

        {/* Sidebar */}
        <aside className="lg:w-64 xl:w-72 flex-shrink-0 space-y-6">
          {/* Structured data card */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--muted-bg)] overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[var(--border)] bg-[var(--card-bg)]">
              <span className="text-xs font-mono text-[var(--muted)]">experience.json</span>
            </div>
            <div className="font-mono text-[11px] text-[var(--muted)] px-4 py-3 space-y-1">
              <div><span className="text-[var(--accent)]">&quot;role&quot;</span><span className="opacity-50">: </span><span className="text-[var(--foreground)]">&quot;{title}&quot;</span></div>
              <div><span className="text-[var(--accent)]">&quot;company&quot;</span><span className="opacity-50">: </span><span className="text-[var(--foreground)]">&quot;{frontmatter.company}&quot;</span></div>
              <div><span className="text-[var(--accent)]">&quot;type&quot;</span><span className="opacity-50">: </span><span className="text-[var(--foreground)]">&quot;{TYPE_LABELS[frontmatter.type] ?? frontmatter.type}&quot;</span></div>
              <div><span className="text-[var(--accent)]">&quot;start&quot;</span><span className="opacity-50">: </span><span className="text-[var(--foreground)]">&quot;{frontmatter.startDate}&quot;</span></div>
              <div><span className="text-[var(--accent)]">&quot;end&quot;</span><span className="opacity-50">: </span><span className="text-[var(--foreground)]">&quot;{frontmatter.endDate ?? 'present'}&quot;</span></div>
              {frontmatter.location && (
                <div><span className="text-[var(--accent)]">&quot;location&quot;</span><span className="opacity-50">: </span><span className="text-[var(--foreground)]">&quot;{frontmatter.location}&quot;</span></div>
              )}
            </div>
          </div>

          {/* Key Highlights */}
          {frontmatter.highlights && frontmatter.highlights.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">Key Highlights</h2>
              <ul className="space-y-2">
                {frontmatter.highlights.map((h: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--foreground)]">
                    <span className="text-[var(--accent)] mt-0.5 flex-shrink-0 font-bold">▸</span>
                    <span className="leading-snug">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tech stack */}
          {frontmatter.stack && frontmatter.stack.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">Tech Stack</h2>
              <div className="flex flex-wrap gap-1.5">
                {frontmatter.stack.map((tech: string) => (
                  <Badge key={tech}>{tech}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* External link */}
          {frontmatter.link && (
            <Link
              href={frontmatter.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-[var(--accent)] hover:underline"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
                <path d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
              </svg>
              Visit company website
            </Link>
          )}

          {/* Related Projects */}
          {relatedProjects.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">Related Projects</h2>
              <div className="space-y-2">
                {relatedProjects.map(proj => {
                  if (!proj) return null
                  return (
                    <Link
                      key={proj.slug}
                      href={`/projects/${proj.slug}`}
                      className="flex items-center justify-between gap-2 p-3 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:border-[var(--accent)]/50 transition-colors group text-sm"
                    >
                      <span className="text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors truncate font-medium">
                        {proj.frontmatter.title}
                      </span>
                      <svg className="text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors flex-shrink-0" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"/>
                      </svg>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
