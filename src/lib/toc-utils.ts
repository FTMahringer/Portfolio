/** Slugify text the same way the MDX heading components do. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export interface TocHeading {
  level: number;
  text: string;
  id: string;
}

/** Extract h2–h4 headings from raw markdown/MDX source. */
export function extractHeadings(content: string): TocHeading[] {
  const regex = /^(#{2,4})\s+(.+)$/gm;
  const headings: TocHeading[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(content)) !== null) {
    const raw = m[2]
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .replace(/\[(.+?)\]\(.+?\)/g, '$1');
    headings.push({ level: m[1].length, text: raw, id: slugify(raw) });
  }
  return headings;
}
