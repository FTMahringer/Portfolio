'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useDevMode } from '@/context/DevContext';
import { adminMenu, type AdminMenuItem } from '@/config/admin-menu';
import type { SiteSettings } from '@/lib/site-settings-types';
import { buildLocalePath, getLocaleFromPath } from '@/lib/locale-routing';
import { DEFAULT_LOCALE_CODE, type LocaleCode } from '@/lib/locale-registry';
import AdminToolbarMenu from './AdminToolbarMenu';
import { useTranslations } from '@/context/TranslationContext';

interface AdminToolbarProps {
  menu?: AdminMenuItem[];
  brand?: string;
}

function isExternalHref(href: string): boolean {
  return /^(?:[a-z]+:)?\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:');
}

const MENU_LABEL_KEYS: Record<string, string> = {
  content: 'toolbar.menu.content.title',
  'content-overview': 'toolbar.menu.content.overview',
  'content-manage': 'toolbar.menu.content.manageContent',
  'content-blog': 'toolbar.menu.content.blog',
  'blog-new': 'toolbar.menu.content.newPost',
  'blog-tags': 'toolbar.menu.content.tags',
  'content-projects': 'toolbar.menu.content.projects',
  'projects-new': 'toolbar.menu.content.newProject',
  'content-experience': 'toolbar.menu.content.experience',
  'experience-new': 'toolbar.menu.content.newEntry',
  'content-media': 'toolbar.menu.content.media',
  'media-library': 'toolbar.menu.content.mediaLibrary',
  tools: 'toolbar.menu.tools.title',
  db: 'toolbar.menu.tools.database',
  sessions: 'toolbar.menu.tools.sessions',
  'auth-providers': 'toolbar.menu.tools.authProviders',
  'api-docs': 'toolbar.menu.tools.apiDocs',
  settings: 'toolbar.menu.settings.title',
  'settings-general': 'toolbar.menu.settings.general',
  'settings-content': 'toolbar.menu.settings.content',
  'settings-publishing': 'toolbar.menu.settings.publishing',
  'settings-system': 'toolbar.menu.settings.system',
  'settings-home': 'toolbar.menu.settings.settings',
  'settings-site': 'toolbar.menu.settings.site',
  'settings-homepage': 'toolbar.menu.settings.homepage',
  'settings-features': 'toolbar.menu.settings.features',
  'settings-integrations': 'toolbar.menu.settings.integrations',
  'settings-git-provider': 'toolbar.menu.settings.gitProvider',
  'settings-auth': 'toolbar.menu.settings.authProviders',
  'settings-sessions': 'toolbar.menu.settings.sessions',
  'settings-db': 'toolbar.menu.settings.database',
  'settings-api': 'toolbar.menu.settings.apiDocs',
};

function translateMenuItem(item: AdminMenuItem, locale: LocaleCode, t: (key: string, fallback?: string) => string): AdminMenuItem {
  return {
    ...item,
    label: t(MENU_LABEL_KEYS[item.id] ?? '', item.label),
    href: item.href
      ? item.external || isExternalHref(item.href)
        ? item.href
        : buildLocalePath(locale, item.href)
      : undefined,
    children: item.children ? item.children.map((child) => translateMenuItem(child, locale, t)) : undefined,
  };
}

function filterMenu(menu: AdminMenuItem[], settings: SiteSettings | null): AdminMenuItem[] {
  if (!settings) return menu;

  const visibleItems: AdminMenuItem[] = [];

  for (const item of menu) {
    if (item.featureKey) {
      const feature = settings.features[item.featureKey];
      if (!feature.enabled || !feature.showInContentManager) continue;
    }

    const children = item.children ? filterMenu(item.children, settings) : undefined;
    if (item.children && children?.length === 0 && !item.href) continue;

    visibleItems.push({ ...item, children });
  }

  return visibleItems;
}

export default function AdminToolbar({ menu = adminMenu, brand }: AdminToolbarProps) {
  const { isDevMode, logout } = useDevMode();
  const pathname = usePathname();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const { locale, t } = useTranslations();

  const routeLocale = getLocaleFromPath(pathname) ?? locale ?? DEFAULT_LOCALE_CODE;

  useEffect(() => {
    if (!isDevMode) return;

    let cancelled = false;
    void fetch('/api/admin/site-settings')
      .then((response) => response.json())
      .then((data: { settings?: SiteSettings }) => {
        if (!cancelled && data.settings) setSettings(data.settings);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [isDevMode]);

  const visibleMenu = useMemo(() => filterMenu(translateMenuItemArray(menu, routeLocale, t), settings), [menu, routeLocale, settings, t]);

  if (!isDevMode) return null;

  return (
    <header className="hidden md:block fixed top-0 inset-x-0 z-[300] border-b border-[var(--border)] bg-[var(--card)]/95 text-[var(--foreground)] shadow-[0_12px_30px_rgba(0,0,0,0.12)] backdrop-blur supports-[backdrop-filter]:bg-[var(--card)]/85">
      <nav className="flex items-center h-11 px-3 gap-1">
        <span className="px-2 text-sm font-semibold text-[var(--muted)]">{brand ?? t('admin.toolbar.brand')}</span>
        <ul className="flex items-center gap-1">
          {visibleMenu.map((item) => (
            <AdminToolbarMenu key={item.id} item={item} pathname={pathname} />
          ))}
        </ul>
        <div className="flex-1" />
        <button
          type="button"
          onClick={logout}
          className="rounded-xl px-3 py-2 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--muted-bg)] hover:text-[var(--foreground)]"
        >
          {t('admin.toolbar.logout')}
        </button>
      </nav>
    </header>
  );
}

function translateMenuItemArray(menu: AdminMenuItem[], locale: LocaleCode, t: (key: string, fallback?: string) => string): AdminMenuItem[] {
  return menu.map((item) => translateMenuItem(item, locale, t));
}
