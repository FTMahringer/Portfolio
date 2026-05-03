import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const EDUCATION_DIR = path.join(process.cwd(), 'content', 'education');

export interface EducationFrontmatter {
  school: string;
  degree: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  location?: string;
  grade?: string;
  description?: string;
  highlights?: string[];
}

export interface Education {
  frontmatter: EducationFrontmatter;
  content: string;
  slug: string;
}

export function getAllEducation(): Education[] {
  if (!fs.existsSync(EDUCATION_DIR)) {
    return [];
  }

  const files = fs.readdirSync(EDUCATION_DIR)
    .filter(f => f.endsWith('.mdx') && !f.startsWith('_'));

  return files.map(filename => {
    const slug = filename.replace('.mdx', '');
    const filePath = path.join(EDUCATION_DIR, filename);
    const source = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(source);

    return {
      frontmatter: data as EducationFrontmatter,
      content,
      slug,
    };
  }).sort((a, b) => {
    // Sort by start date, newest first
    return new Date(b.frontmatter.startDate).getTime() - new Date(a.frontmatter.startDate).getTime();
  });
}
