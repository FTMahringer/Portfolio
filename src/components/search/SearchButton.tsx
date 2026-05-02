'use client'

import { useSearch } from '@/context/SearchContext'

export function SearchButton() {
  const { open } = useSearch()

  return (
    <button
      onClick={open}
      aria-label="Search"
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--muted-bg)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/50 transition-all text-sm cursor-pointer group"
    >
      <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.242 1.656a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z" />
      </svg>
      <span className="hidden sm:inline">Search</span>
      <kbd className="hidden lg:inline-flex items-center text-[10px] bg-[var(--card)] border border-[var(--border)] rounded px-1 py-0.5 font-mono group-hover:border-[var(--accent)]/50 transition-colors">
        ⌘K
      </kbd>
    </button>
  )
}
