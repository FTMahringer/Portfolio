import { getProjectBySlug, getAllProjects, getExperienceBySlug } from '@/lib/mdx';
// TableOfContents and extractHeadings are now handled by ProjectContentWrapper
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/mdx/MDXComponents';
import Badge from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDateRange } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { softwareSchema } from '@/lib/jsonld';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllProjects().map(p => ({ slug: p.slug }));
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

import ProjectContentWrapper from './ProjectContentWrapper';

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();
  const { frontmatter, content } = project;

  // Resolve related experience
  const relatedExperience = (frontmatter.relatedExperience ?? [])
    .map(s => getExperienceBySlug(s))
    .filter(Boolean)

  // All images: dedicated gallery or fallback to cover
  const gallery = frontmatter.images && frontmatter.images.length > 0
    ? frontmatter.images
    : frontmatter.image ? [frontmatter.image] : []

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <ProjectContentWrapper content={content} frontmatter={frontmatter} />
      {/* TableOfContents is inside ProjectContentWrapper */}
      <Button href="/projects" variant="ghost" className="mb-8 -ml-1">
        ← Back to Projects
      </Button>

      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="status" status={frontmatter.status}>{frontmatter.status}</Badge>
          <Badge>{frontmatter.category}</Badge>
        </div>
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3">{frontmatter.title}</h1>
        <p className="text-[var(--muted)] leading-relaxed mb-3">{frontmatter.summary}</p>
        <p className="text-sm text-[var(--muted)] mb-4">
          {formatDateRange(frontmatter.startDate, frontmatter.endDate)}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-6">
          {frontmatter.stack.map(tech => (
            <Badge key={tech}>{tech}</Badge>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          {frontmatter.github && (
            <Button href={frontmatter.github} external variant="secondary">↗ GitHub</Button>
          )}
          {frontmatter.demo && (
            <Button href={frontmatter.demo} external>↗ Live Demo</Button>
          )}
        </div>
      </header>

      {/* Image gallery */}
      {gallery.length > 0 && (
        <div className="mb-10">
          {gallery.length === 1 ? (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[var(--border)]">
              <Image
                src={gallery[0]}
                alt={frontmatter.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {gallery.map((img, i) => (
                <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-[var(--border)]">
                  <Image
                    src={img}
                    alt={`${frontmatter.title} image ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 384px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <hr className="border-[var(--border)] mb-10" />

      {/* Content and TableOfContents are handled by ProjectContentWrapper above */}

      {/* Related Experience */}
      {relatedExperience.length > 0 && (
        <div className="mt-12 pt-8 border-t border-[var(--border)]">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] mb-4">
            Related Experience
          </h2>
          <div className="space-y-3">
            {relatedExperience.map(exp => {
              if (!exp) return null
              const title = exp.frontmatter.title ?? exp.frontmatter.role ?? 'Role'
              return (
                <Link
                  key={exp.slug}
                  href={`/experience/${exp.slug}`}
                  className="flex items-center justify-between gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)]/50 transition-colors group"
                >
                  <div>
                    <div className="font-medium text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">{title}</div>
                    <div className="text-sm text-[var(--muted)]">{exp.frontmatter.company}</div>
                  </div>
                  <svg className="text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors flex-shrink-0" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"/>
                  </svg>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </main>
  );
}
