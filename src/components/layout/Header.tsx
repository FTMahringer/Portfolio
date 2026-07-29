'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { ContentFeatureKey, FeatureSettings } from '@/lib/site-settings-types';
import NavLink from './NavLink';
import { SearchButton } from '@/components/search/SearchButton';
import { useDevMode } from '@/context/DevContext';
import AdminLoginModal from '@/components/admin/AdminLoginModal';
import { buildLocalePath } from '@/lib/locale-routing';
import { useTranslations } from '@/context/TranslationContext';

type PublicNavigationSettings = {
  features: Record<ContentFeatureKey, FeatureSettings>;
};

const NAV_LINKS: Array<{ href: string; labelKey: string; featureKey?: ContentFeatureKey }> = [
  { href: '/projects', labelKey: 'nav.projects', featureKey: 'projects' },
  { href: '/blog', labelKey: 'nav.blog', featureKey: 'blog' },
  { href: '/about', labelKey: 'nav.about' },
  { href: '/contact', labelKey: 'nav.contact' },
];

export default function Header() {
  const { isDevMode, loading } = useDevMode();
  const { locale, t } = useTranslations();
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
    href: buildLocalePath(locale, settings.features[link.featureKey].route),
    label: settings.features[link.featureKey].label,
  } : {
    href: buildLocalePath(locale, link.href),
    label: t(link.labelKey),
  }), [locale, settings, t]);

  const showLogin = !loading && !isDevMode;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link
            href={buildLocalePath(locale, '/')}
            className="font-mono text-sm font-semibold text-[var(--accent)] hover:opacity-80 transition-opacity shrink-0"
          >
            fynn.dev
          </Link>
          <nav className="flex items-center gap-4 sm:gap-5">
            {navLinks.map((link) => (
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
                {t('chrome.header.login')}
              </button>
            )}
          </div>
        </div>
      </header>
      <AdminLoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
