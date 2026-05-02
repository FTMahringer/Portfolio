import ProjectCard from './ProjectCard';
import type { Project } from '@/lib/types';

interface ProjectGridProps {
  projects: Project[];
  colsClass?: string;
}

export default function ProjectGrid({ projects, colsClass = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' }: ProjectGridProps) {
  if (projects.length === 0) {
    return <p className="text-[var(--muted)] text-center py-12">No projects found.</p>;
  }

  return (
    <div className={`grid gap-4 ${colsClass}`}>
      {projects.map(project => (
        <ProjectCard key={project.slug} project={project} />
      ))}
    </div>
  );
}
