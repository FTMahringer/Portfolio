import type { EditorType } from '@/components/admin/ContentEditor';

const PROJECT_TITLE_DISALLOWED = /[^a-zA-Z0-9 _#-]/;
const PROJECT_TITLE_STRIP = /[^a-zA-Z0-9 _#-]/g;
const PROJECT_SLUG_DISALLOWED = /[^a-z0-9_#]/g;

export function buildInitialContent() {
  return '# Write your content here\n\nStart typing...\n';
}

export function sanitizeProjectTitle(value: string) {
  return value.replace(PROJECT_TITLE_STRIP, '');
}

export function hasDisallowedProjectTitleChars(value: string) {
  return PROJECT_TITLE_DISALLOWED.test(value);
}

function collapseSlugUnderscores(value: string) {
  return value.replace(/_+/g, '_').replace(/^_+|_+$/g, '');
}

export function slugFromProjectTitle(value: string) {
  return collapseSlugUnderscores(
    sanitizeProjectTitle(value)
      .toLowerCase()
      .replace(/[\s_-]+/g, '_')
      .replace(/#/g, '')
      .replace(PROJECT_SLUG_DISALLOWED, ''),
  );
}

export function normalizeProjectSlug(value: string) {
  return collapseSlugUnderscores(
    value
      .toLowerCase()
      .replace(/[\s_-]+/g, '_')
      .replace(/#/g, '')
      .replace(PROJECT_SLUG_DISALLOWED, ''),
  );
}

export function buildInitialFrontmatter(type: EditorType): Record<string, unknown> {
  if (type === 'blog') {
    return {
      title: '',
      slug: '',
      publishedAt: '',
      summary: '',
      tags: '',
      draft: true,
      image: '',
      images: [],
    };
  }

  if (type === 'project') {
    return {
      title: '',
      slug: '',
      status: 'Work in Progress',
      summary: '',
      category: '',
      stack: '',
      tags: '',
      github: '',
      demo: '',
      featured: false,
      startDate: '',
      endDate: '',
      image: '',
      images: [],
      relatedExperience: [],
    };
  }

  return {
    title: '',
    slug: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    present: false,
    type: 'Internship',
    stack: '',
    highlights: '',
    link: '',
    featured: false,
    image: '',
    images: [],
    relatedProjects: [],
  };
}
