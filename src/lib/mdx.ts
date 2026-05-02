import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { cache } from 'react';
import type { Project, BlogPost, Experience, ProjectFrontmatter, BlogFrontmatter, ExperienceFrontmatter } from './types';

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

// React.cache deduplicates calls within a single render pass — prevents
// multiple server components from triggering redundant FS reads.
export const getAllProjects = cache((): Project[] => {
  return getFiles('projects')
    .map(f => parseFile<ProjectFrontmatter>(path.join(contentDir, 'projects', f)))
    .sort((a, b) => (a.frontmatter.startDate < b.frontmatter.startDate ? 1 : -1));
});

export const getProjectBySlug = cache((slug: string): Project | null => {
  const filePath = path.join(contentDir, 'projects', `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  return parseFile<ProjectFrontmatter>(filePath);
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
    .map(f => parseFile<ExperienceFrontmatter>(path.join(contentDir, 'experience', f)))
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
    return parseFile<ExperienceFrontmatter>(mdPath);
  }
  return parseFile<ExperienceFrontmatter>(filePath);
});
