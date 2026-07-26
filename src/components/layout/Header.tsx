'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { ContentFeatureKey, FeatureSettings } from '@/lib/site-settings';
import NavLink from './NavLink';
import { SearchButton } from '@/components/search/SearchButton';
import { useDevMode } from '@/context/DevContext';
import AdminLoginModal from '@/components/admin/AdminLoginModal';

type PublicNavigationSettings = {
  features: Record<ContentFeatureKey, FeatureSettings>;
};

const NAV_LINKS: Array<{ href: string; label: string; featureKey?: ContentFeatureKey }> = [
  { href: '/projects', label: 'Projects', featureKey: 'projects' },
  { href: '/blog', label: 'Blog', featureKey: 'blog' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const { isDevMode, loading } = useDevMode();
  const [loginOpen, setLoginOpen] = useState(false);
  const [settings, setSettings] = useState<PublicNavigationSettings | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch('/api/site-settings')
      .then((response) => response.json())
      .then((data: { settings?: PublicNavigationSettings }) => {
        if (!cancelled && data.settings) setSettings(data.settings);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  const navLinks = useMemo(() => NAV_LINKS.filter((link) => {
    if (!link.featureKey || !settings) return true;
    const feature = settings.features[link.featureKey];
    return feature.enabled && feature.showInNavigation;
  }).map((link) => link.featureKey && settings ? {
    ...link,
    href: settings.features[link.featureKey].route,
    label: settings.features[link.featureKey].label,
  } : link), [settings]);

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
            {navLinks.map(link => (
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
