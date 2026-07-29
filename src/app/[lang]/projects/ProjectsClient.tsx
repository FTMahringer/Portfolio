'use client'

import { useState } from 'react'
import { useSettings } from '@/context/SettingsContext'
import ProjectGrid from '@/components/projects/ProjectGrid'
import { ProjectList } from '@/components/projects/ProjectList'
import { TagBadge } from '@/components/ui/TagBadge'
import type { Project } from '@/lib/types'
import { slugifyTag } from '@/lib/constants'

interface Props {
  projects: Project[]
  allTags: string[]
}

const SIZE_COLS: Record<string, string> = {
  sm: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  md: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  lg: 'grid-cols-1 sm:grid-cols-2',
}

export default function ProjectsClient({ projects, allTags }: Props) {
  const { settings } = useSettings()
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const filtered = selectedTag
    ? projects.filter(p => (p.frontmatter.tags ?? []).some(t => slugifyTag(t) === selectedTag))
    : projects

  return (
    <div className="space-y-6">
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setSelectedTag(null)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors cursor-pointer ${
              selectedTag === null
                ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                : 'bg-[var(--muted-bg)] text-[var(--muted)] border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--foreground)]'
            }`}
          >
            All
          </button>
          {allTags.map(tag => (
            <TagBadge
              key={tag}
              name={tag}
              href={false}
              onClick={(e) => { e.preventDefault(); setSelectedTag(slugifyTag(tag) === selectedTag ? null : slugifyTag(tag)) }}
              className={`cursor-pointer ${slugifyTag(tag) === selectedTag ? 'ring-2 ring-offset-1 ring-[var(--accent)]' : ''}`}
            />
          ))}
        </div>
      )}

      {settings.projectsView === 'list' ? (
        <ProjectList projects={filtered} />
      ) : (
        <ProjectGrid projects={filtered} colsClass={SIZE_COLS[settings.projectsCardSize]} />
      )}
    </div>
  )
}
