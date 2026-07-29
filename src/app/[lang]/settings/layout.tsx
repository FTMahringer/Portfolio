'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { buildLocalePath, getLocaleFromPath } from '@/lib/locale-routing';
import { DEFAULT_LOCALE_CODE } from '@/lib/locale-registry';
import { useTranslations } from '@/context/TranslationContext';

type SettingsNavLink = {
  href: string;
  icon: string;
};


type SettingsNavGroup = {
  labelKey: string;
  icon: string;
  items: Array<SettingsNavLink & { labelKey: string }>;
};

const SETTINGS_NAV: SettingsNavGroup[] = [
  {
    labelKey: 'settings.layout.groups.general',
    icon: '🧭',
    items: [{ href: '/settings/settings', labelKey: 'settings.layout.items.general', icon: '⚙️' }],
  },
  {
    labelKey: 'settings.layout.groups.site',
    icon: '🌐',
    items: [
      { href: '/settings/site', labelKey: 'settings.layout.items.site', icon: '🌐' },
      { href: '/settings/homepage', labelKey: 'settings.layout.items.homepage', icon: '🏠' },
    ],
  },
  {
    labelKey: 'settings.layout.groups.publishing',
    icon: '📣',
    items: [
      { href: '/settings/features', labelKey: 'settings.layout.items.features', icon: '🧩' },
      { href: '/settings/integrations', labelKey: 'settings.layout.items.integrations', icon: '🔗' },
      { href: '/settings/git-provider', labelKey: 'settings.layout.items.gitProvider', icon: '🔌' },
    ],
  },
  {
    labelKey: 'settings.layout.groups.system',
    icon: '🛡️',
    items: [
      { href: '/settings/auth-providers', labelKey: 'settings.layout.items.authProviders', icon: '🔒' },
      { href: '/settings/sessions', labelKey: 'settings.layout.items.sessions', icon: '🔑' },
      { href: '/settings/db', labelKey: 'settings.layout.items.database', icon: '🗄️' },
      { href: '/settings/api-docs', labelKey: 'settings.layout.items.apiDocs', icon: '📖' },
    ],
  },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname) ?? DEFAULT_LOCALE_CODE;
  const { t } = useTranslations();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="w-full md:w-60 flex-shrink-0 border-b md:border-b-0 md:border-r border-[var(--border)] bg-[var(--card)]">
        <div className="p-4 border-b border-[var(--border)]">
          <Link
            href={buildLocalePath(locale, '/')}
            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            ← {t('settings.layout.back')}
          </Link>
          <h2 className="mt-2 font-semibold text-[var(--foreground)]">{t('settings.layout.title')}</h2>
        </div>
        <nav className="p-3 space-y-4">
          {SETTINGS_NAV.map((group) => (
            <section key={group.labelKey}>
              <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                <span className="mr-2">{group.icon}</span>
                {t(group.labelKey)}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const localizedHref = buildLocalePath(locale, item.href);
                  const active = pathname === localizedHref || pathname.startsWith(`${localizedHref}/`);
                  return (
                    <Link
                      key={item.href}
                      href={localizedHref}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${
                        active
                          ? 'bg-[var(--accent)]/10 text-[var(--accent)] font-medium'
                          : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)]'
                      }`}
                    >
                      <span>{item.icon}</span>
                      {t(item.labelKey)}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>
      </aside>
      <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
    </div>
  );
}
