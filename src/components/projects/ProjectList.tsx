'use client'

import Link from 'next/link'
import type { Project } from '@/lib/types'

interface Props {
  projects: Project[]
}

export function ProjectList({ projects }: Props) {
  if (projects.length === 0) {
    return <p className="text-[var(--muted)]">No projects found.</p>
  }

  return (
    <div className="space-y-4">
      {projects.map(project => (
        <Link
          key={project.slug}
          href={`/projects/${project.slug}`}
          className="group flex gap-5 border border-[var(--border)] rounded-lg p-5 hover:border-[var(--accent)] transition-colors bg-[var(--card)]"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                {project.frontmatter.title}
              </h3>
              {project.frontmatter.status && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  project.frontmatter.status === 'Work in Progress' ? 'bg-green-900/40 text-green-400' :
                  project.frontmatter.status === 'Completed' ? 'bg-blue-900/40 text-blue-400' :
                  'bg-[var(--muted-bg)] text-[var(--muted)]'
                }`}>
                  {project.frontmatter.status}
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--muted)] mb-3 line-clamp-2">
              {project.frontmatter.summary}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {project.frontmatter.stack?.slice(0, 6).map(tech => (
                <span key={tech} className="text-[10px] bg-[var(--muted-bg)] text-[var(--muted)] rounded px-1.5 py-0.5">
                  {tech}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"/>
            </svg>
          </div>
        </Link>
      ))}
    </div>
  )
}
