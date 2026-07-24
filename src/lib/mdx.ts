import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { cache } from 'react';
import type { Project, BlogPost, Experience, ProjectFrontmatter, BlogFrontmatter, ExperienceFrontmatter } from './types';

export type { BlogPost, Project, Experience };

const contentDir = path.join(process.cwd(), 'content');

function getFiles(dir: string): string[] {
  const fullPath = path.join(contentDir, dir);
  if (!fs.existsSync(fullPath)) return [];
  return fs.readdirSync(fullPath).filter(f => f.endsWith('.mdx') || f.endsWith('.md'));
}

function parseFile<T>(filePath: string): { frontmatter: T; content: string; slug: string } {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const slug = path.basename(filePath).replace(/\.(mdx|md)$/, '');
  return { frontmatter: data as T, content, slug };
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }

  return [];
}

function normalizeProject(frontmatter: ProjectFrontmatter): ProjectFrontmatter {
  return {
    ...frontmatter,
    stack: asStringArray(frontmatter.stack),
    tags: asStringArray(frontmatter.tags),
    images: asStringArray(frontmatter.images),
    relatedExperience: asStringArray(frontmatter.relatedExperience),
    github: frontmatter.github ?? null,
    demo: frontmatter.demo ?? null,
    image: frontmatter.image ?? null,
    endDate: frontmatter.endDate ?? null,
  };
}

function normalizeExperience(frontmatter: ExperienceFrontmatter): ExperienceFrontmatter {
  return {
    ...frontmatter,
    stack: asStringArray(frontmatter.stack),
    highlights: asStringArray(frontmatter.highlights),
    images: asStringArray(frontmatter.images),
    relatedProjects: asStringArray(frontmatter.relatedProjects),
    endDate: frontmatter.endDate ?? null,
    link: frontmatter.link ?? undefined,
    featured: Boolean(frontmatter.featured),
  };
}

// React.cache deduplicates calls within a single render pass — prevents
// multiple server components from triggering redundant FS reads.
export const getAllProjects = cache((): Project[] => {
  return getFiles('projects')
    .map((f) => {
      const parsed = parseFile<ProjectFrontmatter>(path.join(contentDir, 'projects', f));
      return { ...parsed, frontmatter: normalizeProject(parsed.frontmatter) };
    })
    .sort((a, b) => (a.frontmatter.startDate < b.frontmatter.startDate ? 1 : -1));
});

export const getProjectBySlug = cache((slug: string): Project | null => {
  const filePath = path.join(contentDir, 'projects', `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const parsed = parseFile<ProjectFrontmatter>(filePath);
  return { ...parsed, frontmatter: normalizeProject(parsed.frontmatter) };
});

export function getFeaturedProjects(): Project[] {
  return getAllProjects().filter(p => p.frontmatter.featured);
}

export const getAllBlogPosts = cache((): BlogPost[] => {
  return getFiles('blog')
    .map(f => {
      const parsed = parseFile<BlogFrontmatter>(path.join(contentDir, 'blog', f));
      return { ...parsed, readingTime: readingTime(parsed.content).text };
    })
    .filter(p => !p.frontmatter.draft)
    .sort((a, b) => (a.frontmatter.publishedAt < b.frontmatter.publishedAt ? 1 : -1));
});

export const getBlogPostBySlug = cache((slug: string): BlogPost | null => {
  const filePath = path.join(contentDir, 'blog', `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const parsed = parseFile<BlogFrontmatter>(filePath);
  return { ...parsed, readingTime: readingTime(parsed.content).text };
});

export const getAllExperience = cache((): Experience[] => {
  return getFiles('experience')
    .map((f) => {
      const parsed = parseFile<ExperienceFrontmatter>(path.join(contentDir, 'experience', f));
      return { ...parsed, frontmatter: normalizeExperience(parsed.frontmatter) };
    })
    .sort((a, b) => {
      const aEnd = a.frontmatter.endDate ?? '9999';
      const bEnd = b.frontmatter.endDate ?? '9999';
      return aEnd < bEnd ? 1 : -1;
    });
});

export const getExperienceBySlug = cache((slug: string): Experience | null => {
  const filePath = path.join(contentDir, 'experience', `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    const mdPath = path.join(contentDir, 'experience', `${slug}.md`);
    if (!fs.existsSync(mdPath)) return null;
    const parsed = parseFile<ExperienceFrontmatter>(mdPath);
    return { ...parsed, frontmatter: normalizeExperience(parsed.frontmatter) };
  }
  const parsed = parseFile<ExperienceFrontmatter>(filePath);
  return { ...parsed, frontmatter: normalizeExperience(parsed.frontmatter) };
});
