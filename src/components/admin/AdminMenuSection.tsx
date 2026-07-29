'use client';

import type { ReactNode } from 'react';
import type { AdminMenuItem } from '@/config/admin-menu';

interface AdminMenuSectionProps {
  item: AdminMenuItem;
  children: ReactNode;
}

export default function AdminMenuSection({ item, children }: AdminMenuSectionProps) {
  return (
    <li className="border-t border-[var(--border)] first:border-t-0">
      <div className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
        {item.icon && <span className="mr-2">{item.icon}</span>}
        {item.label}
      </div>
      <ul className="pb-2">{children}</ul>
    </li>
  );
}
