import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

export function renderMarkdown(src: string): string {
  const raw = marked.parse(src, { async: false }) as string;
  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: [
      'p', 'br', 'hr',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'strong', 'em', 'b', 'i', 's', 'del',
      'a', 'img',
      'blockquote', 'code', 'pre',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span', 'sup', 'sub',
    ],
    ALLOWED_ATTR: ['href', 'title', 'src', 'alt', 'class', 'id'],
    ALLOW_DATA_ATTR: false,
  });
}

export function containsScript(src: string): boolean {
  const lower = src.toLowerCase();
  if (lower.includes('<script')) return true;
  if (/javascript:/i.test(lower)) return true;
  if (/on\w+\s*=/i.test(lower)) return true;
  return false;
}
