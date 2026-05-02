'use client'

import { useSettings } from '@/context/SettingsContext'
import ProjectGrid from '@/components/projects/ProjectGrid'
import { ProjectList } from '@/components/projects/ProjectList'
import type { Project } from '@/lib/types'

interface Props {
  projects: Project[]
}

const SIZE_COLS: Record<string, string> = {
  sm: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  md: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  lg: 'grid-cols-1 sm:grid-cols-2',
}

export default function ProjectsClient({ projects }: Props) {
  const { settings } = useSettings()

  if (settings.projectsView === 'list') {
    return <ProjectList projects={projects} />
  }

  return <ProjectGrid projects={projects} colsClass={SIZE_COLS[settings.projectsCardSize]} />
}
