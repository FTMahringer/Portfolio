'use client';

import Link from 'next/link';
import { useState } from 'react';
import NavLink from './NavLink';
import { SearchButton } from '@/components/search/SearchButton';
import { useDevMode } from '@/context/DevContext';
import AdminLoginModal from '@/components/admin/AdminLoginModal';

const NAV_LINKS = [
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const { isDevMode, loading } = useDevMode();
  const [loginOpen, setLoginOpen] = useState(false);

  const showLogin = !loading && !isDevMode;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="font-mono text-sm font-semibold text-[var(--accent)] hover:opacity-80 transition-opacity shrink-0"
          >
            fynn.dev
          </Link>
          <nav className="flex items-center gap-4 sm:gap-5">
            {NAV_LINKS.map(link => (
              <NavLink key={link.href} href={link.href}>
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <SearchButton />
            {showLogin && (
              <button
                type="button"
                onClick={() => setLoginOpen(true)}
                className="hidden md:inline-flex items-center rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-[var(--muted-bg)]"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>
      <AdminLoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
