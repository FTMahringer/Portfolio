'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useDevMode } from '@/context/DevContext'
import { useSettings } from '@/context/SettingsContext'
import { usePathname } from 'next/navigation'

type Section = 'create' | 'api' | 'debug'

export function DevPanel() {
  const { isDevMode, loading, logout } = useDevMode()
  const [open, setOpen] = useState(false)
  const [section, setSection] = useState<Section>('create')

  if (loading || !isDevMode) return null

  return (
    <>
      {/* DEV tab handle — left edge */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Open dev panel"
        style={{ writingMode: 'vertical-lr', textOrientation: 'mixed' }}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-1.5 px-2 py-4 bg-[var(--card)] border border-[var(--border)] border-l-0 rounded-r-md text-green-400 hover:text-green-300 transition-colors text-xs font-mono font-semibold tracking-widest cursor-pointer select-none"
      >
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 mb-1 animate-pulse" />
        DEV
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in panel */}
      <div
        className={`fixed left-0 top-0 h-full z-50 w-80 bg-[var(--card)] border-r border-[var(--border)] flex flex-col shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] bg-[var(--card)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
            <span className="font-mono text-sm font-bold text-green-400 tracking-wider">DEV MODE</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={logout}
              className="text-xs text-[var(--muted)] hover:text-red-400 transition-colors cursor-pointer font-mono"
            >
              logout
            </button>
            <button
              onClick={() => setOpen(false)}
              className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer text-lg leading-none"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Section tabs */}
        <div className="flex border-b border-[var(--border)]">
          {(['create', 'api', 'debug'] as Section[]).map(s => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors ${
                section === s
                  ? 'text-green-400 border-b-2 border-green-400'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {section === 'create' && <CreateSection />}
          {section === 'api' && <ApiSection />}
          {section === 'debug' && <DebugSection />}
        </div>
      </div>
    </>
  )
}

function CreateSection() {
  const items = [
    {
      label: 'New Blog Post',
      href: '/dev/new/blog',
      icon: '📝',
      desc: 'Write and publish a blog article',
    },
    {
      label: 'New Project',
      href: '/dev/new/projects',
      icon: '🚀',
      desc: 'Showcase a new project',
    },
    {
      label: 'New Experience',
      href: '/dev/new/experience',
      icon: '💼',
      desc: 'Add work or internship experience',
    },
  ]

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-[var(--muted)] uppercase tracking-widest font-semibold">
        Create Content
      </p>
      {items.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-start gap-3 p-3 rounded-xl border border-[var(--border)] hover:border-green-400/50 hover:bg-green-400/5 transition-all group"
        >
          <span className="text-xl mt-0.5">{item.icon}</span>
          <div>
            <div className="text-sm font-semibold text-[var(--foreground)] group-hover:text-green-400 transition-colors">
              {item.label}
            </div>
            <div className="text-xs text-[var(--muted)] mt-0.5">{item.desc}</div>
          </div>
          <svg
            className="ml-auto mt-1 text-[var(--muted)] group-hover:text-green-400 transition-colors flex-shrink-0"
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z" />
          </svg>
        </Link>
      ))}
    </div>
  )
}

function ApiSection() {
  return (
    <div className="space-y-4">
      <p className="text-[10px] text-[var(--muted)] uppercase tracking-widest font-semibold">
        API &amp; Docs
      </p>

      <div className="space-y-2">
        {[
          { href: '/api-docs', icon: '📖', label: 'API Documentation', desc: 'Interactive OpenAPI docs' },
          { href: '/api/openapi', icon: '📋', label: 'Raw OpenAPI Spec', desc: 'JSON spec at /api/openapi', external: true },
        ].map(link => (
          <a
            key={link.href}
            href={link.href}
            target={link.external ? '_blank' : undefined}
            rel={link.external ? 'noopener noreferrer' : undefined}
            className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] hover:border-green-400/50 hover:bg-green-400/5 transition-all group"
          >
            <span className="text-lg">{link.icon}</span>
            <div>
              <div className="text-sm font-semibold text-[var(--foreground)] group-hover:text-green-400 transition-colors">
                {link.label}
              </div>
              <div className="text-xs text-[var(--muted)]">{link.desc}</div>
            </div>
          </a>
        ))}
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--muted-bg)] overflow-hidden">
        <div className="px-3 py-2 border-b border-[var(--border)]">
          <span className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-wider">Dev Content API</span>
        </div>
        <div className="font-mono text-[11px] px-3 py-2.5 space-y-1.5">
          {[
            { method: 'GET', path: '/api/dev/content/blog', color: 'text-green-400' },
            { method: 'GET', path: '/api/dev/content/projects', color: 'text-green-400' },
            { method: 'GET', path: '/api/dev/content/experience', color: 'text-green-400' },
            { method: 'POST', path: '/api/dev/content/{type}', color: 'text-yellow-400' },
          ].map(e => (
            <div key={e.path} className="flex gap-2">
              <span className={`${e.color} font-bold w-10 flex-shrink-0`}>{e.method}</span>
              <span className="text-[var(--foreground)] opacity-70">{e.path}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function DebugSection() {
  const pathname = usePathname()
  const { settings } = useSettings()
  const [cookies, setCookies] = useState<string[]>([])

  useEffect(() => {
    const devCookies = document.cookie
      .split(';')
      .map(c => c.trim())
      .filter(c => c.startsWith('dev_') || c.startsWith('portfolio_') || c.startsWith('api_'))
    setCookies(devCookies)
  }, [])

  return (
    <div className="space-y-4">
      <p className="text-[10px] text-[var(--muted)] uppercase tracking-widest font-semibold">
        Debug Info
      </p>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--muted-bg)] overflow-hidden">
        <div className="px-3 py-2 border-b border-[var(--border)]">
          <span className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-wider">Environment</span>
        </div>
        <div className="font-mono text-[11px] px-3 py-2.5 space-y-1.5">
          {[
            { key: 'path', val: pathname },
            { key: 'env', val: process.env.NODE_ENV },
            { key: 'next', val: '16.2.4' },
          ].map(row => (
            <div key={row.key} className="flex justify-between gap-4">
              <span className="text-[var(--muted)]">{row.key}</span>
              <span className="text-green-400 text-right truncate max-w-[60%]">{row.val}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--muted-bg)] overflow-hidden">
        <div className="px-3 py-2 border-b border-[var(--border)]">
          <span className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-wider">Settings</span>
        </div>
        <div className="font-mono text-[11px] px-3 py-2.5 space-y-1.5">
          {(Object.entries(settings) as [string, unknown][]).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4">
              <span className="text-[var(--muted)]">{k}</span>
              <span className="text-green-400 text-right truncate max-w-[55%]">{String(v)}</span>
            </div>
          ))}
        </div>
      </div>

      {cookies.length > 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--muted-bg)] overflow-hidden">
          <div className="px-3 py-2 border-b border-[var(--border)]">
            <span className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-wider">Cookies</span>
          </div>
          <div className="font-mono text-[11px] px-3 py-2.5 space-y-1">
            {cookies.map((c, i) => (
              <div key={i} className="text-[var(--foreground)] opacity-60 truncate">{c}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
