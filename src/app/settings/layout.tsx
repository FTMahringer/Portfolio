'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SETTINGS_NAV = [
  { href: '/settings/settings', label: 'Settings', icon: '⚙️' },
  { href: '/settings/site', label: 'Site', icon: '🌐' },
  { href: '/settings/integrations', label: 'Integrations', icon: '🔗' },
  { href: '/settings/features', label: 'Features', icon: '🧩' },
  { href: '/settings/homepage', label: 'Homepage', icon: '🏠' },
  { href: '/settings/auth-providers', label: 'Auth Providers', icon: '🔒' },
  { href: '/settings/sessions', label: 'Sessions', icon: '🔑' },
  { href: '/settings/db', label: 'Database', icon: '🗄️' },
  { href: '/settings/git-provider', label: 'Git Provider', icon: '🔌' },
  { href: '/settings/api-docs', label: 'API Docs', icon: '📖' },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="w-full md:w-56 flex-shrink-0 border-b md:border-b-0 md:border-r border-[var(--border)] bg-[var(--card)]">
        <div className="p-4 border-b border-[var(--border)]">
          <Link
            href="/"
            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            ← Back to site
          </Link>
          <h2 className="mt-2 font-semibold text-[var(--foreground)]">Admin Settings</h2>
        </div>
        <nav className="p-2 space-y-0.5">
          {SETTINGS_NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-[var(--accent)]/10 text-[var(--accent)] font-medium'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)]'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
    </div>
  );
}
