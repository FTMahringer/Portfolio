export type ProjectStatus = 'Completed' | 'Work in Progress' | 'Archived' | 'Idea';
export type ExperienceType = 'Internship' | 'Part-time' | 'Freelance' | 'Full-time';

export interface ProjectFrontmatter {
  title: string;
  slug: string;
  summary: string;
  category: string;
  status: ProjectStatus;
  featured: boolean;
  startDate: string;
  endDate: string | null;
  stack: string[];
  github: string | null;
  demo: string | null;
  image: string | null;
  images?: string[];
  relatedExperience?: string[];
}

export interface Project {
  frontmatter: ProjectFrontmatter;
  content: string;
  slug: string;
}

export interface BlogFrontmatter {
  title: string;
  slug: string;
  summary: string;
  publishedAt: string;
  tags: string[];
  image: string | null;
  draft: boolean;
}

export interface BlogPost {
  frontmatter: BlogFrontmatter;
  content: string;
  slug: string;
  readingTime: string;
}

export interface ExperienceFrontmatter {
  title?: string;      // preferred field name
  role?: string;       // legacy alias for title
  company: string;
  startDate: string;
  endDate: string | null;
  location: string;
  type: string;
  stack: string[];
  featured?: boolean;
  highlights?: string[];   // Key achievements shown as bullet points
  link?: string;           // External URL (company website, project page, etc.)
  images?: string[];
  relatedProjects?: string[];
}

export interface Experience {
  frontmatter: ExperienceFrontmatter;
  content: string;
  slug: string;
}

export interface SkillCategory {
  name: string;
  skills: string[];
}
