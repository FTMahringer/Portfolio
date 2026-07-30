import ProjectCard from './ProjectCard';
import type { Project } from '@/lib/types';
import type { LocaleCode } from '@/lib/locale-registry';

interface ProjectGridProps {
  projects: Project[];
  locale: LocaleCode;
  colsClass?: string;
}

export default function ProjectGrid({ projects, locale, colsClass = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' }: ProjectGridProps) {
  if (projects.length === 0) {
    return <p className="text-[var(--muted)] text-center py-12">No projects found.</p>;
  }

  return (
    <div className={`grid gap-4 ${colsClass}`}>
      {projects.map(project => (
        <ProjectCard key={project.slug} project={project} locale={locale} />
      ))}
    </div>
  );
}
