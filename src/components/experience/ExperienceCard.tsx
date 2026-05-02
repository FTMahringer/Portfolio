import Link from 'next/link'
import type { Experience } from '@/lib/types'

interface Props {
  experience: Experience
}

function formatPeriod(start?: string, end?: string): string {
  if (!start) return ''
  const fmt = (d: string) => {
    const [y, m] = d.split('-')
    if (!m) return y
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    return `${months[parseInt(m, 10) - 1]} ${y}`
  }
  const endStr = !end || end === 'present' ? 'present' : fmt(end)
  return `${fmt(start)} – ${endStr}`
}

const TYPE_LABELS: Record<string, string> = {
  'full-time': 'full-time',
  'part-time': 'part-time',
  internship: 'internship',
  freelance: 'freelance',
  contract: 'contract',
}

export function ExperienceCard({ experience }: Props) {
  const { frontmatter, slug } = experience
  const title = frontmatter.title ?? frontmatter.role ?? 'Role'

  return (
    <Link
      href={`/experience/${slug}`}
      className="block group border border-[var(--border)] rounded-xl overflow-hidden hover:border-[var(--accent)] transition-colors"
    >
      {/* Top bar — colored accent strip */}
      <div className="h-1 bg-[var(--accent)] opacity-60 group-hover:opacity-100 transition-opacity" />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors leading-tight">
              {title}
            </h3>
            <p className="text-sm text-[var(--muted)] mt-0.5">
              {frontmatter.company}
              {frontmatter.location && ` · ${frontmatter.location}`}
            </p>
          </div>
          <div className="text-right flex-shrink-0 text-sm text-[var(--muted)] space-y-1">
            <div>{formatPeriod(frontmatter.startDate, frontmatter.endDate ?? undefined)}</div>
            {frontmatter.type && (
              <span className="inline-block text-[var(--accent)] bg-[var(--muted-bg)] rounded px-1.5 py-0.5">
                {TYPE_LABELS[frontmatter.type] ?? frontmatter.type}
              </span>
            )}
          </div>
        </div>

        {/* Structured code-style preview */}
        <div className="font-mono text-[13px] text-[var(--muted)] bg-[var(--muted-bg)] rounded-lg px-4 py-3 mb-3 border border-[var(--border)] space-y-1">
          <div><span className="text-[var(--accent)] opacity-70">role</span>       <span className="opacity-50">:</span> <span className="text-[var(--foreground)] opacity-80">&quot;{title}&quot;</span></div>
          <div><span className="text-[var(--accent)] opacity-70">company</span>    <span className="opacity-50">:</span> <span className="text-[var(--foreground)] opacity-80">&quot;{frontmatter.company}&quot;</span></div>
          <div><span className="text-[var(--accent)] opacity-70">period</span>     <span className="opacity-50">:</span> <span className="text-[var(--foreground)] opacity-80">&quot;{formatPeriod(frontmatter.startDate, frontmatter.endDate ?? undefined)}&quot;</span></div>
          {frontmatter.stack && frontmatter.stack.length > 0 && (
            <div><span className="text-[var(--accent)] opacity-70">stack</span>      <span className="opacity-50">:</span> <span className="text-[var(--foreground)] opacity-80">[{frontmatter.stack.slice(0, 4).map(t => `"${t}"`).join(', ')}{frontmatter.stack.length > 4 ? ', …' : ''}]</span></div>
          )}
        </div>

        {/* Highlights */}
        {frontmatter.highlights && frontmatter.highlights.length > 0 && (
          <ul className="space-y-1 mb-3">
            {frontmatter.highlights.slice(0, 3).map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--muted)]">
                <span className="text-[var(--accent)] mt-0.5 flex-shrink-0">▸</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between mt-2">
          {/* Stack badges (small) */}
          <div className="flex flex-wrap gap-1">
            {(frontmatter.stack ?? []).slice(0, 5).map(tech => (
              <span key={tech} className="text-xs bg-[var(--muted-bg)] text-[var(--muted)] rounded px-1.5 py-0.5">
                {tech}
              </span>
            ))}
          </div>
          <div className="text-xs text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 whitespace-nowrap">
            View details
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"/>
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}
