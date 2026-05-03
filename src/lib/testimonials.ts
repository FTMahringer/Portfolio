import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const TESTIMONIALS_DIR = path.join(process.cwd(), 'content', 'testimonials');

export interface TestimonialFrontmatter {
  name: string;
  role: string;
  company: string;
  date: string;
  avatar?: string;
  linkedin?: string;
  featured?: boolean;
}

export interface Testimonial {
  frontmatter: TestimonialFrontmatter;
  content: string;
  slug: string;
}

export function getAllTestimonials(): Testimonial[] {
  if (!fs.existsSync(TESTIMONIALS_DIR)) {
    return [];
  }

  const files = fs.readdirSync(TESTIMONIALS_DIR)
    .filter(f => f.endsWith('.mdx') && !f.startsWith('_'));

  return files.map(filename => {
    const slug = filename.replace('.mdx', '');
    const filePath = path.join(TESTIMONIALS_DIR, filename);
    const source = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(source);

    return {
      frontmatter: data as TestimonialFrontmatter,
      content,
      slug,
    };
  }).sort((a, b) => {
    // Featured first, then by date (newest first)
    if (a.frontmatter.featured && !b.frontmatter.featured) return -1;
    if (!a.frontmatter.featured && b.frontmatter.featured) return 1;
    return new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime();
  });
}

export function getFeaturedTestimonials(limit = 3): Testimonial[] {
  const all = getAllTestimonials();
  return all.filter(t => t.frontmatter.featured).slice(0, limit);
}
