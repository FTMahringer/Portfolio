'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { FeatureSettings } from '@/lib/site-settings-types';
import { VersionInfo } from './VersionInfo';
import { buildLocalePath } from '@/lib/locale-routing';
import { useTranslations } from '@/context/TranslationContext';

type PublicNavigationSettings = {
  features: Record<'projects' | 'blog' | 'experience', FeatureSettings>;
};

export default function Footer() {
  const { locale, t } = useTranslations();
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

  return (
    <footer className="border-t border-[var(--border)] mt-auto bg-[var(--muted-bg)]/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-12">
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">{t('chrome.footer.navigation')}</h3>
            <Link href={buildLocalePath(locale, '/')} className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors">{t('nav.home')}</Link>
            {settings && settings.features.projects.enabled && settings.features.projects.showInNavigation && <Link href={buildLocalePath(locale, settings.features.projects.route)} className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors">{settings.features.projects.label}</Link>}
            {settings && settings.features.blog.enabled && settings.features.blog.showInNavigation && <Link href={buildLocalePath(locale, settings.features.blog.route)} className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors">{settings.features.blog.label}</Link>}
            {settings && settings.features.experience.enabled && settings.features.experience.showInNavigation && <Link href={buildLocalePath(locale, settings.features.experience.route)} className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors">{settings.features.experience.label}</Link>}
            <Link href={buildLocalePath(locale, '/skills')} className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors">{t('nav.skills')}</Link>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">{t('chrome.footer.discovery')}</h3>
            <Link href={buildLocalePath(locale, '/about')} className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors">{t('nav.about')}</Link>
            <Link href={buildLocalePath(locale, '/now')} className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors">{t('nav.now')}</Link>
            <Link href={buildLocalePath(locale, '/uses')} className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors">{t('nav.uses')}</Link>
            <Link href={buildLocalePath(locale, '/homelab')} className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors">{t('nav.homelab')}</Link>
            <Link href="/feed.xml" className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors">{t('nav.rss')}</Link>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">{t('chrome.footer.legal')}</h3>
            <Link href={buildLocalePath(locale, '/impressum')} className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors">{t('nav.impressum')}</Link>
            <Link href={buildLocalePath(locale, '/datenschutz')} className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors">{t('nav.datenschutz')}</Link>
            <div className="h-px bg-[var(--border)] my-1" />
            <Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors">{t('nav.github')}</Link>
            <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors">{t('nav.linkedin')}</Link>
          </div>
        </div>

        <div className="pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <p className="text-xs text-[var(--muted)]">
              © {new Date().getFullYear()} Fynn M. {t('chrome.footer.builtWith')}
            </p>
            <span className="hidden sm:inline text-xs text-[var(--muted)]">•</span>
            <VersionInfo />
          </div>
          <div className="flex items-center gap-4">
            <Link href={buildLocalePath(locale, '/contact')} className="text-xs font-medium text-[var(--muted)] hover:text-[var(--accent)] transition-colors">
              {t('chrome.footer.getInTouch')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
