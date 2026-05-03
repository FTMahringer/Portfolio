'use client'

import { useDevMode } from '@/context/DevContext'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

const NAV: { label: string | null; items: { href: string; label: string; icon: string; exact?: boolean; external?: boolean }[] }[] = [
  {
    label: null,
    items: [
      { href: '/admin', label: 'Overview', icon: '⚡', exact: true },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/new/blog',       label: 'New Blog Post',    icon: '📝' },
      { href: '/admin/new/projects',   label: 'New Project',      icon: '🚀' },
      { href: '/admin/new/experience', label: 'New Experience',   icon: '💼' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { href: '/admin/api-docs',  label: 'API Docs',  icon: '📖' },
      { href: '/admin/db',        label: 'Database',  icon: '🗄️' },
      { href: '/admin/content',   label: 'Content',   icon: '📂' },
    ],
  },
  {
    label: 'Security',
    items: [
      { href: '/admin/auth-providers', label: 'Auth Providers', icon: '🔒' },
      { href: '/admin/sessions',  label: 'Sessions',  icon: '🔑' },
      { href: '/admin/settings',  label: 'Settings',  icon: '⚙️' },
    ],
  },
]

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { isDevMode, loading, logout } = useDevMode()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isDevMode) {
      router.replace('/admin/login')
    }
  }, [loading, isDevMode, router])

  if (loading || !isDevMode) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[var(--background)]">
        <span className="text-[var(--muted)] text-sm animate-pulse font-mono">
          {loading ? 'Checking auth…' : 'Redirecting…'}
        </span>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[200] flex bg-[var(--background)]">

      {/* ── Left sidebar ────────────────────────────────────────── */}
      <aside className="w-56 flex-shrink-0 h-full flex flex-col border-r border-[var(--border)] bg-[var(--card)]">

        {/* Wordmark */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[var(--border)]">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
          <span className="font-mono text-sm font-bold text-green-400 tracking-widest">DEV</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {NAV.map((section, i) => (
            <div key={i}>
              {section.label && (
                <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href)
                  const Tag = item.external ? 'a' : Link
                  return (
                    <Tag
                      key={item.href}
                      href={item.href}
                      {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? 'bg-green-400/10 text-green-400 font-medium'
                          : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)]'
                      }`}
                    >
                      <span className="text-base leading-none w-5 flex-shrink-0 text-center">{item.icon}</span>
                      {item.label}
                    </Tag>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 pb-4 pt-3 border-t border-[var(--border)] space-y-0.5">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)] transition-colors"
          >
            <span className="text-base leading-none w-5 text-center">←</span>
            Back to site
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--muted)] hover:text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer"
          >
            <span className="text-base leading-none w-5 text-center">⏻</span>
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
