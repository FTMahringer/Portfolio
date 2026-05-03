import { getAllProjects } from '@/lib/mdx';
import type { Metadata } from 'next';
import ProjectsClient from './ProjectsClient';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'A showcase of my software projects — web apps, backend systems, and infrastructure.',
};

export default function ProjectsPage() {
  const projects = getAllProjects();
  const allTags = [...new Set(projects.flatMap(p => p.frontmatter.tags ?? []))].sort();

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold mb-2 text-[var(--foreground)]">Projects</h1>
      <p className="text-[var(--muted)] mb-10">
        Things I&apos;ve built, am building, or plan to build.
      </p>
      <ProjectsClient projects={projects} allTags={allTags} />
    </main>
  );
}
