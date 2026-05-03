export const ALLOWED_TYPES = ['projects', 'blog', 'experience'] as const;
export type ContentType = (typeof ALLOWED_TYPES)[number];

export const TYPE_PATHS: Record<ContentType, string> = {
  projects: 'content/projects',
  blog: 'content/blog',
  experience: 'content/experience',
};

export const ROUTE_PATHS: Record<ContentType, string> = {
  projects: '/projects',
  blog: '/blog',
  experience: '/experience',
};

export function resolveType(type: string): ContentType | null {
  return ALLOWED_TYPES.includes(type as ContentType) ? (type as ContentType) : null;
}

export function serializeFrontmatter(fm: Record<string, unknown>): string {
  return Object.entries(fm ?? {})
    .map(([k, v]) => {
      if (Array.isArray(v)) {
        if (v.length === 0) return `${k}: []`;
        return `${k}:\n${v.map(i => `  - ${JSON.stringify(i)}`).join('\n')}`;
      }
      if (v === null || v === undefined) return `${k}: null`;
      if (typeof v === 'boolean') return `${k}: ${v}`;
      if (typeof v === 'number') return `${k}: ${v}`;
      return `${k}: ${JSON.stringify(String(v))}`;
    })
    .join('\n');
}
