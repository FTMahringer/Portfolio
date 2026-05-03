'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Fuse from 'fuse.js'
import { MarkdownEditor } from '@/components/ui/MarkdownEditor'
import { TagPill } from '@/components/ui/TagBadge'
import { slugifyTag } from '@/lib/tag-utils'

export type FormType = 'blog' | 'project' | 'experience'

// ─── Step configs ────────────────────────────────────────────────────────────

interface Step {
  id: string
  title: string
  icon?: string
}

const STEPS: Record<FormType, Step[]> = {
  blog: [
    { id: 'basics', title: 'Basics', icon: '📝' },
    { id: 'details', title: 'Details', icon: '🏷' },
    { id: 'content', title: 'Content', icon: '✍️' },
  ],
  project: [
    { id: 'basics', title: 'Basics', icon: '📦' },
    { id: 'details', title: 'Details', icon: '🔧' },
    { id: 'media', title: 'Media', icon: '🖼' },
    { id: 'content', title: 'Content', icon: '✍️' },
  ],
  experience: [
    { id: 'basics', title: 'Basics', icon: '🏢' },
    { id: 'timeline', title: 'Timeline', icon: '📅' },
    { id: 'details', title: 'Details', icon: '🔍' },
    { id: 'content', title: 'Content', icon: '✍️' },
  ],
}

// ─── Initial form state ───────────────────────────────────────────────────────

type FormState = Record<string, unknown>

const INITIAL_STATE: Record<FormType, FormState> = {
  blog: {
    title: '',
    slug: '',
    publishedAt: '',
    summary: '',
    tags: '',
    draft: false,
    images: [] as string[],
    _content: '# Write your content here\n\nStart typing...\n',
  },
  project: {
    title: '',
    slug: '',
    status: 'Work in Progress',
    summary: '',
    category: '',
    stack: '',
    tags: '',
    github: '',
    demo: '',
    featured: false,
    relatedExperience: [] as string[],
    images: [] as string[],
    _content: '# Write your content here\n\nStart typing...\n',
  },
  experience: {
    title: '',
    slug: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    type: 'Internship',
    stack: '',
    highlights: '',
    link: '',
    present: false,
    featured: false,
    relatedProjects: [] as string[],
    images: [] as string[],
    _content: '# Write your content here\n\nStart typing...\n',
  },
}

// Required fields that must be non-empty to advance past each step (by step index)
const REQUIRED_FIELDS: Record<FormType, Record<number, string[]>> = {
  blog: { 0: ['title', 'slug'] },
  project: { 0: ['title', 'slug'] },
  experience: { 0: ['title', 'slug', 'company'] },
}

// ─── Field helpers ────────────────────────────────────────────────────────────

const inputCls =
  'w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition'
const textareaCls = `${inputCls} resize-none leading-relaxed`
const checkboxCls = 'w-4 h-4 rounded accent-[var(--accent)]'

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1">
      {children}
    </div>
  )
}

function FieldWrapper({ children, full }: { children: React.ReactNode; full?: boolean }) {
  return <div className={full ? 'col-span-2' : 'col-span-1'}>{children}</div>
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// ─── TagAutocomplete ──────────────────────────────────────────────────────────

interface TagAutocompleteProps {
  value: string        // comma-separated
  onChange: (v: string) => void
}

function TagAutocomplete({ value, onChange }: TagAutocompleteProps) {
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [allTags, setAllTags] = useState<string[]>([])

  const selected = value ? value.split(',').map(t => t.trim()).filter(Boolean) : []

  useEffect(() => {
    fetch('/api/tags')
      .then(r => r.json())
      .then((data: { name: string }[]) => setAllTags(data.map(t => t.name)))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!input.trim()) { setSuggestions([]); return }
    const q = input.toLowerCase()
    const filtered = allTags.filter(t => t.toLowerCase().includes(q) && !selected.includes(t))
    setSuggestions(filtered.slice(0, 8))
  }, [input, allTags, selected])

  function addTag(name: string) {
    const trimmed = name.trim()
    if (!trimmed || selected.includes(trimmed)) return
    const next = [...selected, trimmed]
    onChange(next.join(', '))
    setInput('')
    setSuggestions([])
  }

  function removeTag(name: string) {
    onChange(selected.filter(t => t !== name).join(', '))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      addTag(input)
    }
    if (e.key === 'Backspace' && !input && selected.length > 0) {
      removeTag(selected[selected.length - 1])
    }
  }

  const isNew = input.trim() && !allTags.some(t => t.toLowerCase() === input.trim().toLowerCase())

  return (
    <div className="space-y-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1">
              <TagPill name={tag} />
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-[var(--muted)] hover:text-red-400 transition-colors cursor-pointer text-xs leading-none"
              >✕</button>
            </span>
          ))}
        </div>
      )}
      <div className="relative">
        <input
          className={inputCls}
          placeholder="Type a tag and press Enter or comma…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {(suggestions.length > 0 || isNew) && (
          <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-xl overflow-hidden">
            {suggestions.map(s => (
              <button
                key={s}
                type="button"
                onMouseDown={e => { e.preventDefault(); addTag(s) }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--muted-bg)] text-[var(--foreground)] transition-colors cursor-pointer flex items-center gap-2"
              >
                <TagPill name={s} />
              </button>
            ))}
            {isNew && (
              <button
                type="button"
                onMouseDown={e => { e.preventDefault(); addTag(input.trim()) }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--muted-bg)] text-[var(--muted)] transition-colors cursor-pointer"
              >
                + Add &ldquo;{input.trim()}&rdquo; as new tag
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── DatePicker ───────────────────────────────────────────────────────────────

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const LONG_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

interface ParsedDate {
  year: number
  month: number
  day: number
}

function parseDate(value: string | undefined, mode: 'date' | 'month'): ParsedDate | null {
  if (!value) return null
  const parts = value.split('-').map(Number)
  if (mode === 'month') {
    const [year, month] = parts
    if (!year || !month || isNaN(year) || isNaN(month)) return null
    return { year, month: month - 1, day: 1 }
  }
  const [year, month, day] = parts
  if (!year || !month || isNaN(year) || isNaN(month)) return null
  return { year, month: month - 1, day: day ?? 1 }
}

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  mode?: 'date' | 'month'
  placeholder?: string
  disabled?: boolean
  id?: string
}

function DatePicker({ value, onChange, mode = 'date', placeholder, disabled, id }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const today = new Date()
  const parsed = parseDate(value, mode)
  const [year, setYear] = useState(parsed?.year ?? today.getFullYear())
  const [month, setMonth] = useState(parsed?.month ?? today.getMonth())

  useEffect(() => {
    const p = parseDate(value, mode)
    if (p) { setYear(p.year); setMonth(p.month) }
  }, [value, mode])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const calDays: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (calDays.length % 7 !== 0) calDays.push(null)

  const displayValue = parsed
    ? mode === 'month'
      ? `${LONG_MONTHS[parsed.month]} ${parsed.year}`
      : `${String(parsed.day).padStart(2, '0')} ${LONG_MONTHS[parsed.month]} ${parsed.year}`
    : ''

  return (
    <div ref={ref} className="relative w-full">
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={[
          'w-full flex items-center gap-2 bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-left transition focus:outline-none focus:ring-1 focus:ring-[var(--accent)]',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[var(--accent)]/50',
          displayValue ? 'text-[var(--foreground)]' : 'text-[var(--muted)]',
        ].join(' ')}
      >
        <svg className="text-[var(--muted)] flex-shrink-0" width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
          <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
        </svg>
        <span className="flex-1 truncate">
          {displayValue || placeholder || `Select ${mode === 'month' ? 'month' : 'date'}…`}
        </span>
        {value && !disabled && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onChange('') }}
            onKeyDown={(e) => e.key === 'Enter' && onChange('')}
            className="text-[var(--muted)] hover:text-red-400 transition-colors leading-none"
            aria-label="Clear date"
          >
            <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
            </svg>
          </span>
        )}
        <svg
          className={`text-[var(--muted)] flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          width="11"
          height="11"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-40 top-full mt-1.5 left-0 w-72 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden">
          {/* Year navigation */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)] bg-[var(--muted-bg)]">
            <button
              type="button"
              onClick={() => setYear((y) => y - 1)}
              className="p-1 rounded hover:bg-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
              </svg>
            </button>
            <span className="font-bold text-sm text-[var(--foreground)]">{year}</span>
            <button
              type="button"
              onClick={() => setYear((y) => y + 1)}
              className="p-1 rounded hover:bg-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
              </svg>
            </button>
          </div>

          {/* Month picker */}
          {mode === 'month' && (
            <div className="grid grid-cols-3 gap-1.5 p-3">
              {SHORT_MONTHS.map((m, i) => {
                const isSelected = parsed && parsed.year === year && parsed.month === i
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      onChange(`${year}-${String(i + 1).padStart(2, '0')}`)
                      setOpen(false)
                    }}
                    className={`py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      isSelected ? 'bg-[var(--accent)] text-white' : 'hover:bg-[var(--muted-bg)] text-[var(--foreground)]'
                    }`}
                  >
                    {m}
                  </button>
                )
              })}
            </div>
          )}

          {/* Date picker */}
          {mode === 'date' && (
            <>
              <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => {
                    if (month === 0) { setMonth(11); setYear((y) => y - 1) } else setMonth((m) => m - 1)
                  }}
                  className="p-1 rounded hover:bg-[var(--muted-bg)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
                  </svg>
                </button>
                <span className="text-sm font-semibold text-[var(--foreground)]">{LONG_MONTHS[month]}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (month === 11) { setMonth(0); setYear((y) => y + 1) } else setMonth((m) => m + 1)
                  }}
                  className="p-1 rounded hover:bg-[var(--muted-bg)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
                  </svg>
                </button>
              </div>
              <div className="px-3 pt-2">
                <div className="grid grid-cols-7 mb-1">
                  {DAY_LABELS.map((d) => (
                    <div key={d} className="text-center text-[10px] font-bold text-[var(--muted)] py-1">
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-0.5 pb-3">
                  {calDays.map((day, i) => {
                    if (!day) return <div key={`_${i}`} />
                    const isSelected = parsed?.year === year && parsed?.month === month && parsed?.day === day
                    const isToday =
                      today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          const mm = String(month + 1).padStart(2, '0')
                          const dd = String(day).padStart(2, '0')
                          onChange(`${year}-${mm}-${dd}`)
                          setOpen(false)
                        }}
                        className={`aspect-square flex items-center justify-center text-xs rounded-lg transition-colors cursor-pointer font-medium ${
                          isSelected
                            ? 'bg-[var(--accent)] text-white'
                            : isToday
                            ? 'border border-[var(--accent)] text-[var(--accent)]'
                            : 'hover:bg-[var(--muted-bg)] text-[var(--foreground)]'
                        }`}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── RelatedPicker ────────────────────────────────────────────────────────────

interface SearchIndexItem {
  id: string
  type: string
  title: string
  company?: string
}

interface RelatedPickerProps {
  type: 'project' | 'experience'
  selected: string[]
  onChange: (selected: string[]) => void
}

function RelatedPicker({ type, selected, onChange }: RelatedPickerProps) {
  const [index, setIndex] = useState<SearchIndexItem[] | null>(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/search/index')
      .then((r) => r.json())
      .then((data: SearchIndexItem[]) =>
        setIndex(data.filter((item) => item.type === type))
      )
      .catch(() => setIndex([]))
  }, [type])

  const fuse = useMemo(
    () =>
      index
        ? new Fuse(index, {
            keys: [
              { name: 'title', weight: 0.6 },
              { name: 'company', weight: 0.4 },
            ],
            threshold: 0.4,
          })
        : null,
    [index]
  )

  const results =
    query.length >= 1
      ? fuse?.search(query, { limit: 8 }).map((r) => r.item) ?? []
      : index?.slice(0, 8) ?? []

  const selectedItems = (index ?? []).filter((item) =>
    selected.includes(item.id.replace(`${type}-`, ''))
  )

  function toggle(item: SearchIndexItem) {
    const slug = item.id.replace(`${type}-`, '')
    if (selected.includes(slug)) {
      onChange(selected.filter((s) => s !== slug))
    } else {
      onChange([...selected, slug])
      setQuery('')
    }
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="col-span-2 space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
        {type === 'project' ? 'Related Projects' : 'Related Experience'}
      </label>

      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedItems.map((item) => (
            <span
              key={item.id}
              className="flex items-center gap-1.5 text-xs bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30 rounded-full px-3 py-1"
            >
              {item.title}
              {item.company && <span className="opacity-60">· {item.company}</span>}
              <button
                type="button"
                onClick={() => toggle(item)}
                className="hover:text-red-400 transition-colors cursor-pointer ml-0.5 leading-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <div className="flex items-center gap-2 bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 focus-within:ring-1 focus-within:ring-[var(--accent)] transition">
          <svg className="text-[var(--muted)] flex-shrink-0" width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.242 1.656a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            placeholder={
              index === null
                ? 'Loading…'
                : type === 'project'
                ? 'Search projects…'
                : 'Search experience…'
            }
            disabled={index === null}
            className="flex-1 bg-transparent text-sm text-[var(--foreground)] placeholder-[var(--muted)] outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
              </svg>
            </button>
          )}
        </div>

        {open && results.length > 0 && (
          <div className="absolute z-20 top-full mt-1 w-full bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden">
            {results.map((item) => {
              const slug = item.id.replace(`${type}-`, '')
              const isSelected = selected.includes(slug)
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { toggle(item); setOpen(false) }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                      : 'hover:bg-[var(--muted-bg)] text-[var(--foreground)]'
                  }`}
                >
                  <span className="flex-1 truncate font-medium">{item.title}</span>
                  {item.company && (
                    <span className="text-xs text-[var(--muted)] truncate">{item.company}</span>
                  )}
                  {isSelected && (
                    <svg
                      className="flex-shrink-0 text-[var(--accent)]"
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── ImageUpload ──────────────────────────────────────────────────────────────

interface ImageUploadProps {
  type: string
  slug: string
  images: string[]
  onAdd: (images: string[]) => void
  onRemove: (image: string) => void
}

function ImageUpload({ type, slug, images, onAdd, onRemove }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    if (!slug) return void setUploadError('Set a slug first')
    setUploading(true)
    setUploadError(null)
    const form = new FormData()
    Array.from(files).forEach((f) => form.append('images', f))
    const res = await fetch(`/api/dev/upload?type=${type}s&slug=${slug}`, {
      method: 'POST',
      body: form,
    })
    setUploading(false)
    if (res.ok) {
      onAdd((await res.json()).images as string[])
    } else {
      setUploadError(
        ((await res.json().catch(() => ({}))) as { error?: string }).error ?? 'Upload failed'
      )
    }
  }

  return (
    <div className="space-y-3">
      <FieldLabel>Images</FieldLabel>
      <div
        className="border-2 border-dashed border-[var(--border)] rounded-xl p-8 text-center cursor-pointer hover:border-[var(--accent)]/50 transition-colors"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="text-3xl mb-2">🖼</div>
        <p className="text-sm text-[var(--foreground)] font-medium">
          {uploading ? 'Converting to WebP…' : 'Drop images or click to browse'}
        </p>
        <p className="text-xs text-[var(--muted)] mt-1">
          Any format accepted → auto-converted to WebP (max 1920×1080)
        </p>
      </div>
      {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((src) => (
            <div
              key={src}
              className="relative aspect-video rounded-lg overflow-hidden border border-[var(--border)] group"
            >
              <Image src={src} alt="" fill className="object-cover" sizes="200px" />
              <button
                type="button"
                onClick={() => onRemove(src)}
                className="absolute top-1 right-1 bg-black/70 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Wizard ───────────────────────────────────────────────────────────────────

interface WizardProps {
  steps: Step[]
  currentStep: number
  onPrev: () => void
  onNext: () => void
  onFinish: () => void
  loading?: boolean
  finishLabel?: string
  canNext?: boolean
  error?: string | null
  className?: string
  children: React.ReactNode
}

function Wizard({
  steps,
  currentStep,
  onPrev,
  onNext,
  onFinish,
  loading = false,
  finishLabel = 'Publish',
  canNext = true,
  error,
  className,
  children,
}: WizardProps) {
  const isLast = currentStep === steps.length - 1

  return (
    <div className={className ?? 'bg-[var(--background)] text-[var(--foreground)] flex flex-col'}>
      {/* Step progress bar */}
      <div className="border-b border-[var(--border)] bg-[var(--card)] px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-0">
          {steps.map((step, i) => {
            const isPast = i < currentStep
            const isCurrent = i === currentStep
            const isLastStep = i === steps.length - 1
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center gap-2.5 relative">
                  <div
                    className={[
                      'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 flex-shrink-0',
                      isPast
                        ? 'bg-[var(--accent)] text-white'
                        : isCurrent
                        ? 'bg-[var(--accent)]/20 border-2 border-[var(--accent)] text-[var(--accent)]'
                        : 'bg-[var(--muted-bg)] border-2 border-[var(--border)] text-[var(--muted)]',
                    ].join(' ')}
                  >
                    {isPast ? (
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                      </svg>
                    ) : step.icon ? (
                      <span className="text-base leading-none">{step.icon}</span>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <div
                      className={`text-xs font-semibold leading-tight transition-colors ${
                        isCurrent
                          ? 'text-[var(--foreground)]'
                          : isPast
                          ? 'text-[var(--accent)]'
                          : 'text-[var(--muted)]'
                      }`}
                    >
                      {step.title}
                    </div>
                  </div>
                </div>
                {!isLastStep && (
                  <div
                    className={`h-px w-8 sm:w-12 mx-2 flex-shrink-0 transition-colors ${
                      i < currentStep ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
                    }`}
                  />
                )}
              </div>
            )
          })}
          <div className="ml-auto text-xs text-[var(--muted)] sm:hidden">
            {currentStep + 1} / {steps.length}
          </div>
        </div>
      </div>

      {/* Content + navigation */}
      <div className="flex-1 px-4 sm:px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-6">
              {steps[currentStep].icon && (
                <span className="text-xl">{steps[currentStep].icon}</span>
              )}
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                {steps[currentStep].title}
              </h2>
              <span className="ml-auto text-xs text-[var(--muted)] font-mono">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            {children}
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onPrev}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
              </svg>
              Back
            </button>

            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all ${
                    i === currentStep
                      ? 'w-5 h-2 bg-[var(--accent)]'
                      : i < currentStep
                      ? 'w-2 h-2 bg-[var(--accent)]/50'
                      : 'w-2 h-2 bg-[var(--border)]'
                  }`}
                />
              ))}
            </div>

            {isLast ? (
              <button
                type="button"
                onClick={onFinish}
                disabled={loading || !canNext}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="10" />
                    </svg>
                    Publishing…
                  </>
                ) : (
                  <>
                    {finishLabel}
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                    </svg>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={onNext}
                disabled={!canNext}
                className="flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent)]/90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Next
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Step renderers ───────────────────────────────────────────────────────────

interface StepProps {
  step: number
  form: FormState
  set: (key: string, value: unknown) => void
}

function BlogSteps({ step, form, set }: StepProps) {
  if (step === 0) {
    return (
      <Grid>
        <FieldWrapper full>
          <FieldLabel>Title</FieldLabel>
          <input
            className={inputCls}
            placeholder="My awesome post"
            value={form.title as string}
            onChange={(e) => { set('title', e.target.value); set('slug', slugify(e.target.value)) }}
          />
        </FieldWrapper>
        <FieldWrapper>
          <FieldLabel>Slug</FieldLabel>
          <input
            className={inputCls}
            placeholder="my-awesome-post"
            value={form.slug as string}
            onChange={(e) => set('slug', e.target.value)}
          />
        </FieldWrapper>
        <FieldWrapper>
          <FieldLabel>Published Date</FieldLabel>
          <DatePicker
            mode="date"
            value={form.publishedAt as string}
            onChange={(v) => set('publishedAt', v)}
            placeholder="Pick date…"
          />
        </FieldWrapper>
        <FieldWrapper full>
          <label className="flex items-center gap-2 cursor-pointer mt-1">
            <input
              type="checkbox"
              className={checkboxCls}
              checked={form.draft as boolean}
              onChange={(e) => set('draft', e.target.checked)}
            />
            <span className="text-sm text-[var(--foreground)]">
              Save as draft (won&apos;t appear publicly)
            </span>
          </label>
        </FieldWrapper>
      </Grid>
    )
  }

  if (step === 1) {
    return (
      <Grid>
        <FieldWrapper full>
          <FieldLabel>Summary</FieldLabel>
          <textarea
            className={textareaCls}
            rows={3}
            placeholder="A short description for previews and meta tags…"
            value={form.summary as string}
            onChange={(e) => set('summary', e.target.value)}
          />
        </FieldWrapper>
        <FieldWrapper full>
          <FieldLabel>Tags</FieldLabel>
          <TagAutocomplete
            value={form.tags as string}
            onChange={(v) => set('tags', v)}
          />
        </FieldWrapper>
      </Grid>
    )
  }

  return (
    <MarkdownEditor
      value={form._content as string}
      onChange={(v) => set('_content', v)}
      rows={28}
      placeholder="Write your post…"
    />
  )
}

function ProjectSteps({ step, form, set }: StepProps) {
  if (step === 0) {
    return (
      <Grid>
        <FieldWrapper full>
          <FieldLabel>Project Title</FieldLabel>
          <input
            className={inputCls}
            placeholder="My Project"
            value={form.title as string}
            onChange={(e) => { set('title', e.target.value); set('slug', slugify(e.target.value)) }}
          />
        </FieldWrapper>
        <FieldWrapper>
          <FieldLabel>Slug</FieldLabel>
          <input
            className={inputCls}
            placeholder="my-project"
            value={form.slug as string}
            onChange={(e) => set('slug', e.target.value)}
          />
        </FieldWrapper>
        <FieldWrapper>
          <FieldLabel>Status</FieldLabel>
          <select
            className={inputCls}
            value={form.status as string}
            onChange={(e) => set('status', e.target.value)}
          >
            <option value="Work in Progress">Work in Progress</option>
            <option value="Completed">Completed</option>
            <option value="Archived">Archived</option>
            <option value="Idea">Idea</option>
          </select>
        </FieldWrapper>
        <FieldWrapper>
          <FieldLabel>Category</FieldLabel>
          <input
            className={inputCls}
            placeholder="Web Development"
            value={form.category as string}
            onChange={(e) => set('category', e.target.value)}
          />
        </FieldWrapper>
        <FieldWrapper full>
          <label className="flex items-center gap-2 cursor-pointer mt-1">
            <input
              type="checkbox"
              className={checkboxCls}
              checked={form.featured as boolean}
              onChange={(e) => set('featured', e.target.checked)}
            />
            <span className="text-sm text-[var(--foreground)]">Featured project (shown on homepage)</span>
          </label>
        </FieldWrapper>
      </Grid>
    )
  }

  if (step === 1) {
    return (
      <Grid>
        <FieldWrapper full>
          <FieldLabel>Summary</FieldLabel>
          <textarea
            className={textareaCls}
            rows={3}
            placeholder="A brief description shown on the project card…"
            value={form.summary as string}
            onChange={(e) => set('summary', e.target.value)}
          />
        </FieldWrapper>
        <FieldWrapper full>
          <FieldLabel>Tech Stack (comma separated)</FieldLabel>
          <input
            className={inputCls}
            placeholder="Next.js, TypeScript, Tailwind, PostgreSQL"
            value={form.stack as string}
            onChange={(e) => set('stack', e.target.value)}
          />
        </FieldWrapper>
        <FieldWrapper full>
          <FieldLabel>Tags</FieldLabel>
          <TagAutocomplete
            value={form.tags as string}
            onChange={(v) => set('tags', v)}
          />
        </FieldWrapper>
        <FieldWrapper>
          <FieldLabel>GitHub URL</FieldLabel>
          <input
            className={inputCls}
            placeholder="https://github.com/user/repo"
            value={form.github as string}
            onChange={(e) => set('github', e.target.value)}
          />
        </FieldWrapper>
        <FieldWrapper>
          <FieldLabel>Live Demo URL</FieldLabel>
          <input
            className={inputCls}
            placeholder="https://myproject.com"
            value={form.demo as string}
            onChange={(e) => set('demo', e.target.value)}
          />
        </FieldWrapper>
      </Grid>
    )
  }

  if (step === 2) {
    return (
      <div className="space-y-6">
        <ImageUpload
          type="project"
          slug={form.slug as string}
          images={form.images as string[]}
          onAdd={(imgs) => set('images', [...(form.images as string[]), ...imgs])}
          onRemove={(img) => set('images', (form.images as string[]).filter((i) => i !== img))}
        />
        <RelatedPicker
          type="experience"
          selected={form.relatedExperience as string[]}
          onChange={(v) => set('relatedExperience', v)}
        />
      </div>
    )
  }

  return (
    <MarkdownEditor
      value={form._content as string}
      onChange={(v) => set('_content', v)}
      rows={28}
      placeholder="Describe your project in detail…"
    />
  )
}

function ExperienceSteps({ step, form, set }: StepProps) {
  if (step === 0) {
    return (
      <Grid>
        <FieldWrapper>
          <FieldLabel>Job Title / Role</FieldLabel>
          <input
            className={inputCls}
            placeholder="Software Developer Intern"
            value={form.title as string}
            onChange={(e) => {
              set('title', e.target.value)
              set('slug', slugify((form.company as string) + '-' + e.target.value))
            }}
          />
        </FieldWrapper>
        <FieldWrapper>
          <FieldLabel>Company</FieldLabel>
          <input
            className={inputCls}
            placeholder="Acme Inc."
            value={form.company as string}
            onChange={(e) => {
              set('company', e.target.value)
              set('slug', slugify(e.target.value + '-' + (form.title as string)))
            }}
          />
        </FieldWrapper>
        <FieldWrapper>
          <FieldLabel>Slug</FieldLabel>
          <input
            className={inputCls}
            placeholder="acme-inc-intern"
            value={form.slug as string}
            onChange={(e) => set('slug', e.target.value)}
          />
        </FieldWrapper>
        <FieldWrapper>
          <FieldLabel>Location</FieldLabel>
          <input
            className={inputCls}
            placeholder="Vienna, Austria"
            value={form.location as string}
            onChange={(e) => set('location', e.target.value)}
          />
        </FieldWrapper>
      </Grid>
    )
  }

  if (step === 1) {
    return (
      <Grid>
        <FieldWrapper>
          <FieldLabel>Start Date</FieldLabel>
          <DatePicker
            mode="month"
            value={form.startDate as string}
            onChange={(v) => set('startDate', v)}
            placeholder="Pick start month…"
          />
        </FieldWrapper>
        <FieldWrapper>
          <FieldLabel>End Date</FieldLabel>
          <DatePicker
            mode="month"
            value={form.endDate as string}
            onChange={(v) => set('endDate', v)}
            placeholder={(form.present as boolean) ? 'Present' : 'Pick end month…'}
            disabled={form.present as boolean}
          />
        </FieldWrapper>
        <FieldWrapper full>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className={checkboxCls}
              checked={form.present as boolean}
              onChange={(e) => set('present', e.target.checked)}
            />
            <span className="text-sm text-[var(--foreground)]">I currently work here</span>
          </label>
        </FieldWrapper>
        <FieldWrapper>
          <FieldLabel>Employment Type</FieldLabel>
          <select
            className={inputCls}
            value={form.type as string}
            onChange={(e) => set('type', e.target.value)}
          >
            <option value="Internship">Internship</option>
            <option value="Part-time">Part-time</option>
            <option value="Full-time">Full-time</option>
            <option value="Freelance">Freelance</option>
          </select>
        </FieldWrapper>
      </Grid>
    )
  }

  if (step === 2) {
    return (
      <div className="space-y-5">
        <Grid>
          <FieldWrapper full>
            <FieldLabel>Tech Stack (comma separated)</FieldLabel>
            <input
              className={inputCls}
              placeholder="Java, Spring Boot, Docker, Kubernetes"
              value={form.stack as string}
              onChange={(e) => set('stack', e.target.value)}
            />
          </FieldWrapper>
          <FieldWrapper full>
            <FieldLabel>Key Highlights (one per line)</FieldLabel>
            <textarea
              className={textareaCls}
              rows={4}
              placeholder={
                'Built a CI/CD pipeline reducing deploy time by 60%\nMigrated monolith to microservices'
              }
              value={form.highlights as string}
              onChange={(e) => set('highlights', e.target.value)}
            />
          </FieldWrapper>
          <FieldWrapper>
            <FieldLabel>Company / Project Link</FieldLabel>
            <input
              className={inputCls}
              placeholder="https://company.com"
              value={form.link as string}
              onChange={(e) => set('link', e.target.value)}
            />
          </FieldWrapper>
          <FieldWrapper>
            <div className="pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className={checkboxCls}
                  checked={form.featured as boolean}
                  onChange={(e) => set('featured', e.target.checked)}
                />
                <span className="text-sm text-[var(--foreground)]">Featured entry</span>
              </label>
            </div>
          </FieldWrapper>
        </Grid>
        <RelatedPicker
          type="project"
          selected={form.relatedProjects as string[]}
          onChange={(v) => set('relatedProjects', v)}
        />
        <ImageUpload
          type="experience"
          slug={form.slug as string}
          images={form.images as string[]}
          onAdd={(imgs) => set('images', [...(form.images as string[]), ...imgs])}
          onRemove={(img) => set('images', (form.images as string[]).filter((i) => i !== img))}
        />
      </div>
    )
  }

  return (
    <MarkdownEditor
      value={form._content as string}
      onChange={(v) => set('_content', v)}
      rows={28}
      placeholder="Describe your role, responsibilities, and impact…"
    />
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function NewContentForm({ type }: { type: FormType }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setFormState] = useState<FormState>(() => ({ ...INITIAL_STATE[type] }))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const steps = STEPS[type]
  const requiredForStep = REQUIRED_FIELDS[type]?.[step] ?? []
  const canNext = requiredForStep.every((k) => !!form[k])

  function set(key: string, value: unknown) {
    setFormState((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)

    const { slug, present, _content, ...rest } = form as {
      slug: string
      present: boolean
      _content: string
      [key: string]: unknown
    }
    const frontmatter: Record<string, unknown> = { ...rest }

    for (const k of ['tags', 'stack'] as const) {
      if (typeof frontmatter[k] === 'string') {
        const arr = String(frontmatter[k])
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
        if (arr.length) frontmatter[k] = arr
        else delete frontmatter[k]
      }
    }

    if (typeof frontmatter.highlights === 'string') {
      const arr = String(frontmatter.highlights)
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
      if (arr.length) frontmatter.highlights = arr
      else delete frontmatter.highlights
    }

    for (const k of ['images', 'relatedProjects', 'relatedExperience']) {
      if (Array.isArray(frontmatter[k]) && !(frontmatter[k] as unknown[]).length) {
        delete frontmatter[k]
      }
    }

    if (present) frontmatter.endDate = null

    // Map singular 'project' to plural 'projects' for the API
    const apiType = type === 'project' ? 'projects' : type

    const res = await fetch(`/api/dev/content/${apiType}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, frontmatter, content: _content }),
    })

    setLoading(false)

    if (res.ok) {
      const redirectPath =
        type === 'blog'
          ? `/blog/${slug}`
          : type === 'project'
          ? `/projects/${slug}`
          : `/experience/${slug}`
      router.push(redirectPath)
    } else {
      setError(
        ((await res.json().catch(() => ({}))) as { error?: string }).error ??
          'Failed to create content'
      )
      setStep(steps.length - 1)
    }
  }

  const typeName = type.charAt(0).toUpperCase() + type.slice(1)

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Page header */}
      <div className="border-b border-[var(--border)] bg-[var(--card)] px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-green-400 font-mono text-xs bg-green-400/10 border border-green-400/30 rounded px-2 py-1">
              DEV
            </span>
            <h1 className="text-lg font-bold text-[var(--foreground)]">New {typeName}</h1>
          </div>
          <button
            onClick={() => router.back()}
            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer flex items-center gap-1"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
            </svg>
            Back
          </button>
        </div>
      </div>

      {/* Multi-step wizard */}
      <Wizard
        steps={steps}
        currentStep={step}
        onPrev={() => { setStep((s) => Math.max(0, s - 1)); setError(null) }}
        onNext={() => {
          if (canNext) {
            setError(null)
            setStep((s) => s + 1)
          } else {
            setError(`Please fill in: ${requiredForStep.filter((k) => !form[k]).join(', ')}`)
          }
        }}
        onFinish={handleSubmit}
        loading={loading}
        finishLabel={`Publish ${typeName}`}
        canNext={canNext}
        error={error}
      >
        {type === 'blog' && <BlogSteps step={step} form={form} set={set} />}
        {type === 'project' && <ProjectSteps step={step} form={form} set={set} />}
        {type === 'experience' && <ExperienceSteps step={step} form={form} set={set} />}
      </Wizard>
    </div>
  )
}