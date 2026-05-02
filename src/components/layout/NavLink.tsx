'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

export default function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`text-sm transition-colors ${
        isActive
          ? 'text-[var(--accent)] font-medium'
          : 'text-[var(--muted)] hover:text-[var(--foreground)]'
      }`}
    >
      {children}
    </Link>
  );
}
