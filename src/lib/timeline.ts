import { getAllExperience } from './mdx';
import { getAllEducation } from './education';
import { getAllProjects } from './mdx';

export interface TimelineEntry {
  type: 'experience' | 'education' | 'project';
  title: string;
  subtitle?: string;
  date: Date;
  endDate?: Date;
  description?: string;
  slug?: string;
}

export function getAllTimelineEntries(): TimelineEntry[] {
  const entries: TimelineEntry[] = [];

  // Add experience entries
  const experiences = getAllExperience();
  experiences.forEach((exp) => {
    entries.push({
      type: 'experience',
      title: exp.frontmatter.company,
      subtitle: exp.frontmatter.role,
      date: new Date(exp.frontmatter.startDate),
      endDate: exp.frontmatter.endDate ? new Date(exp.frontmatter.endDate) : undefined,
    });
  });

  // Add education entries
  const education = getAllEducation();
  education.forEach((edu) => {
    entries.push({
      type: 'education',
      title: edu.frontmatter.degree,
      subtitle: edu.frontmatter.school,
      date: new Date(edu.frontmatter.startDate),
      endDate: edu.frontmatter.endDate ? new Date(edu.frontmatter.endDate) : undefined,
      description: edu.frontmatter.description,
    });
  });

  // Add project entries
  const projects = getAllProjects();
  projects.forEach((project) => {
    entries.push({
      type: 'project',
      title: project.frontmatter.title,
      subtitle: project.frontmatter.summary,
      date: new Date(project.frontmatter.startDate),
      slug: project.slug,
    });
  });

  // Sort by date descending (newest first)
  return entries.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function getTimelineEntriesByType(type?: 'experience' | 'education' | 'project'): TimelineEntry[] {
  const all = getAllTimelineEntries();
  return type ? all.filter(entry => entry.type === type) : all;
}
