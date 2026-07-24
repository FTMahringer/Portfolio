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

export interface TocNode extends TocHeading {
  children: TocNode[];
}

/** Extract h1–h4 headings from raw markdown/MDX source. */
export function extractHeadings(content: string): TocHeading[] {
  const regex = /^(#{1,4})\s+(.+)$/gm;
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

export function buildTocTree(headings: TocHeading[], depth: 2 | 3): TocNode[] {
  if (headings.length === 0) return [];

  const minLevel = Math.min(...headings.map((heading) => heading.level));
  const maxLevel = minLevel + depth - 1;
  const filtered = headings.filter((heading) => heading.level <= maxLevel);
  const roots: TocNode[] = [];
  const stack: TocNode[] = [];

  for (const heading of filtered) {
    const node: TocNode = { ...heading, children: [] };

    while (stack.length > 0 && stack[stack.length - 1].level >= node.level) {
      stack.pop();
    }

    const parent = stack[stack.length - 1];
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }

    stack.push(node);
  }

  return roots;
}
