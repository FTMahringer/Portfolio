'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { AdminMenuItem } from '@/config/admin-menu';

interface AdminToolbarMenuProps {
  item: AdminMenuItem;
  depth?: number;
}

export default function AdminToolbarMenu({ item, depth = 0 }: AdminToolbarMenuProps) {
  const [open, setOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const baseClasses =
    'block px-3 py-2 text-sm text-white/90 hover:bg-white/10 hover:text-white transition-colors whitespace-nowrap';

  const content = (
    <>
      {item.icon && <span className="mr-2">{item.icon}</span>}
      <span>{item.label}</span>
      {hasChildren && <span className="ml-2 text-[10px] opacity-70">▾</span>}
    </>
  );

  return (
    <li
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {item.href ? (
        item.external ? (
          <a href={item.href} target="_blank" rel="noopener noreferrer" className={baseClasses}>
            {content}
          </a>
        ) : (
          <Link href={item.href} className={baseClasses}>
            {content}
          </Link>
        )
      ) : (
        <button type="button" className={`${baseClasses} w-full text-left`}>
          {content}
        </button>
      )}

      {hasChildren && open && (
        <ul
          className={`absolute top-full left-0 min-w-[12rem] rounded-b-md bg-[#1a1a1a] shadow-lg border border-white/10 ${
            depth > 0 ? 'left-full top-0 rounded-r-md rounded-bl-md' : ''
          }`}
        >
          {item.children!.map((child) => (
            <AdminToolbarMenu key={child.id} item={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}
