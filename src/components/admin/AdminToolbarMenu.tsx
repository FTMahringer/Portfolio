'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { AdminMenuItem } from '@/config/admin-menu';
import AdminMenuSection from './AdminMenuSection';

interface AdminToolbarMenuProps {
  item: AdminMenuItem;
  depth?: number;
  pathname?: string;
}

function isExternalHref(href: string): boolean {
  return /^(?:[a-z]+:)?\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:');
}

export default function AdminToolbarMenu({ item, depth = 0, pathname }: AdminToolbarMenuProps) {
  const [open, setOpen] = useState(false);
  const hasChildren = Boolean(item.children?.length);
  const isSection = hasChildren && depth > 0 && !item.href;
  const active = Boolean(item.href && pathname && (pathname === item.href || pathname.startsWith(`${item.href}/`)));

  const baseClasses =
    'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors whitespace-nowrap';

  const content = useMemo(
    () => (
      <>
        {item.icon && <span className="text-base leading-none">{item.icon}</span>}
        <span className="flex-1">{item.label}</span>
        {hasChildren && depth === 0 && <span className="text-[10px] opacity-70">▾</span>}
      </>
    ),
    [depth, hasChildren, item.icon, item.label],
  );

  if (isSection) {
    return (
      <AdminMenuSection item={item}>
        {item.children!.map((child) => (
          <AdminToolbarMenu key={child.id} item={child} depth={depth + 1} pathname={pathname} />
        ))}
      </AdminMenuSection>
    );
  }

  return (
    <li
      className="relative"
      onMouseEnter={() => hasChildren && setOpen(true)}
      onMouseLeave={() => hasChildren && setOpen(false)}
    >
      {item.href ? (
        item.external || isExternalHref(item.href) ? (
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`${baseClasses} ${active ? 'bg-[var(--muted-bg)] text-[var(--foreground)]' : 'text-[var(--foreground)]/90 hover:bg-[var(--muted-bg)] hover:text-[var(--foreground)]'}`}
          >
            {content}
          </a>
        ) : (
          <Link
            href={item.href}
            className={`${baseClasses} ${active ? 'bg-[var(--muted-bg)] text-[var(--foreground)]' : 'text-[var(--foreground)]/90 hover:bg-[var(--muted-bg)] hover:text-[var(--foreground)]'}`}
          >
            {content}
          </Link>
        )
      ) : (
        <button
          type="button"
          className={`${baseClasses} ${hasChildren ? 'text-[var(--foreground)]/90 hover:bg-[var(--muted-bg)] hover:text-[var(--foreground)]' : 'text-[var(--foreground)]/60'}`}
        >
          {content}
        </button>
      )}

      {hasChildren && open && depth === 0 && (
        <div className="absolute left-0 top-full z-[350] min-w-[18rem] pt-2">
          <ul className="rounded-2xl border border-[var(--border)] bg-[var(--card)] py-1 text-[var(--foreground)] shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
            {item.children!.map((child) => (
              <AdminToolbarMenu key={child.id} item={child} depth={depth + 1} pathname={pathname} />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}
