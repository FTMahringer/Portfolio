'use client';

import Link from 'next/link';
import { TAG_COLORS, hashTagColor, slugifyTag, getTagColor } from '@/lib/tag-utils';

interface TagBadgeProps {
  name: string;
  colorIndex?: number;
  href?: string | false; // false = no link (for use inside other links)
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  count?: number;
}

export function TagBadge({ name, colorIndex, href, onClick, className = '', count }: TagBadgeProps) {
  const slug = slugifyTag(name);
  const ci = colorIndex ?? hashTagColor(slug);
  const color = getTagColor(ci);
  const to = href === false ? null : (href ?? `/tags/${slug}`);

  const inner = (
    <>
      {name}
      {count !== undefined && (
        <span className="ml-1.5 opacity-70 font-normal">{count}</span>
      )}
    </>
  );

  const commonCls = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-opacity hover:opacity-75 ${className}`;
  const style = { background: color.bg, borderColor: color.border, color: color.text };

  if (!to) {
    return (
      <span className={commonCls} style={style}>
        {inner}
      </span>
    );
  }

  return (
    <Link href={to} onClick={onClick} className={commonCls} style={style}>
      {inner}
    </Link>
  );
}

// Non-linked variant (for inside card links)
export function TagPill({ name, colorIndex, className = '' }: { name: string; colorIndex?: number; className?: string }) {
  const slug = slugifyTag(name);
  const ci = colorIndex ?? hashTagColor(slug);
  const color = TAG_COLORS[ci % TAG_COLORS.length] ?? TAG_COLORS[0];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}
      style={{ background: color.bg, borderColor: color.border, color: color.text }}
    >
      {name}
    </span>
  );
}
