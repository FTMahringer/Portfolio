'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Fuse from 'fuse.js'
import { useSearch } from '@/context/SearchContext'
import type { SearchItem } from '@/lib/search-types'

const TYPE_CONFIG: Record<SearchItem['type'], { label: string; color: string }> = {
  blog:       { label: 'Blog',       color: 'text-purple-400  bg-purple-400/10  border-purple-400/30' },
  project:    { label: 'Project',    color: 'text-[var(--accent)] bg-[var(--accent)]/10 border-[var(--accent)]/30' },
  experience: { label: 'Experience', color: 'text-orange-400  bg-orange-400/10  border-orange-400/30' },
}

interface SearchContentProps {
  close: () => void
}

function SearchContent({ close }: SearchContentProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [allItems, setAllItems] = useState<SearchItem[] | null>(null)
  const [fuse, setFuse] = useState<Fuse<SearchItem> | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch index once
  useEffect(() => {
    fetch('/api/search/index')
      .then(r => r.json())
      .then((data: SearchItem[]) => {
        setAllItems(data)
        setFuse(new Fuse(data, {
          keys: [
            { name: 'title',   weight: 0.5 },
            { name: 'summary', weight: 0.3 },
            { name: 'company', weight: 0.2 },
            { name: 'tags',    weight: 0.15 },
            { name: 'stack',   weight: 0.1 },
          ],
          threshold: 0.4,
          includeScore: true,
          minMatchCharLength: 2,
        }))
      })
      .catch(() => {})
  }, [])

  // Auto-focus input
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 30)
    return () => clearTimeout(t)
  }, [])

  const results: SearchItem[] = query.length >= 2
    ? (fuse?.search(query, { limit: 12 }).map(r => r.item) ?? [])
    : (allItems?.slice(0, 8) ?? [])

  const navigate = useCallback((item: SearchItem) => {
    close()
    router.push(item.href)
  }, [close, router])

  function handleKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(i => Math.min(i + 1, results.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(i => Math.max(i - 1, 0))
        break
      case 'Enter':
        if (results[selectedIndex]) navigate(results[selectedIndex])
        break
      case 'Escape':
        close()
        break
    }
  }

  // Reset selection when results change
  useEffect(() => { setSelectedIndex(0) }, [results.length])

  // Group items by type for empty query state
  const grouped = !query.trim() ? {
    project:    results.filter(r => r.type === 'project'),
    blog:       results.filter(r => r.type === 'blog'),
    experience: results.filter(r => r.type === 'experience'),
  } : null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
      onMouseDown={e => { if (e.target === e.currentTarget) close() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onMouseDown={close} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search input row */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)]">
          <svg className="text-[var(--muted)] flex-shrink-0" width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.242 1.656a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search projects, blog, experience…"
            className="flex-1 bg-transparent text-[var(--foreground)] placeholder-[var(--muted)] text-base outline-none"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); inputRef.current?.focus() }}
              className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
              </svg>
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center text-[11px] text-[var(--muted)] bg-[var(--muted-bg)] border border-[var(--border)] rounded px-1.5 py-0.5 font-mono">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div className="overflow-y-auto max-h-[440px]">
          {allItems === null ? (
            <div className="px-5 py-8 text-center text-[var(--muted)] text-sm">Loading…</div>
          ) : grouped ? (
            /* Grouped view when no query */
            <div>
              {(Object.entries(grouped) as [SearchItem['type'], SearchItem[]][])
                .filter(([, items]) => items.length > 0)
                .map(([type, items]) => (
                  <div key={type}>
                    <div className="px-5 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
                      {TYPE_CONFIG[type].label}s
                    </div>
                    {items.map((item) => {
                      const flatIndex = results.indexOf(item)
                      return (
                        <ResultRow
                          key={item.id}
                          item={item}
                          selected={flatIndex === selectedIndex}
                          onClick={() => navigate(item)}
                          onHover={() => setSelectedIndex(flatIndex)}
                        />
                      )
                    })}
                  </div>
                ))}
              {results.length === 0 && (
                <div className="px-5 py-10 text-center text-[var(--muted)] text-sm">
                  No content found.
                </div>
              )}
            </div>
          ) : results.length === 0 ? (
            <div className="px-5 py-10 text-center space-y-2">
              <div className="text-2xl">🔍</div>
              <p className="text-sm text-[var(--muted)]">No results for <span className="text-[var(--foreground)]">&quot;{query}&quot;</span></p>
            </div>
          ) : (
            results.map((item, i) => (
              <ResultRow
                key={item.id}
                item={item}
                selected={i === selectedIndex}
                onClick={() => navigate(item)}
                onHover={() => setSelectedIndex(i)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-5 py-2.5 border-t border-[var(--border)] text-[11px] text-[var(--muted)]">
          <span>
            <kbd className="bg-[var(--muted-bg)] border border-[var(--border)] rounded px-1 font-mono">↑</kbd>
            {' '}<kbd className="bg-[var(--muted-bg)] border border-[var(--border)] rounded px-1 font-mono">↓</kbd>
            {' '}navigate
          </span>
          <span>
            <kbd className="bg-[var(--muted-bg)] border border-[var(--border)] rounded px-1 font-mono">↵</kbd>
            {' '}open
          </span>
          {results.length > 0 && query && (
            <span className="ml-auto">{results.length} result{results.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
    </div>
  )
}

function ResultRow({
  item,
  selected,
  onClick,
  onHover,
}: {
  item: SearchItem
  selected: boolean
  onClick: () => void
  onHover: () => void
}) {
  const cfg = TYPE_CONFIG[item.type]
  const pills = [...(item.tags ?? []), ...(item.stack ?? [])].slice(0, 3)

  return (
    <button
      className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors cursor-pointer border-b border-[var(--border)] last:border-b-0 ${selected ? 'bg-[var(--accent)]/10' : 'hover:bg-[var(--muted-bg)]'}`}
      onClick={onClick}
      onMouseEnter={onHover}
    >
      <span className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wider border rounded px-1.5 py-0.5 ${cfg.color}`}>
        {cfg.label}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[var(--foreground)] truncate">{item.title}</div>
        {item.company ? (
          <div className="text-xs text-[var(--muted)] truncate">{item.company}</div>
        ) : item.summary ? (
          <div className="text-xs text-[var(--muted)] truncate">{item.summary}</div>
        ) : null}
      </div>
      <div className="hidden sm:flex flex-shrink-0 gap-1">
        {pills.map(p => (
          <span key={p} className="text-[10px] bg-[var(--muted-bg)] text-[var(--muted)] rounded px-1.5 py-0.5">
            {p}
          </span>
        ))}
      </div>
      {selected && (
        <svg className="text-[var(--accent)] flex-shrink-0" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z" />
        </svg>
      )}
    </button>
  )
}

/* ── Main export — always mounted, keyboard shortcut always active ── */
export function SearchModal() {
  const { isOpen, open, close } = useSearch()

  // Global Cmd+K / Ctrl+K
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        open()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  if (!isOpen) return null
  return <SearchContent close={close} />
}