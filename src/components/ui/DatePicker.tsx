'use client'

import { useState, useRef, useEffect } from 'react'

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MONTHS_FULL  = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS_ABBR    = ['Su','Mo','Tu','We','Th','Fr','Sa']

export interface DatePickerProps {
  value: string                  // 'YYYY-MM' (month) or 'YYYY-MM-DD' (date)
  onChange: (v: string) => void
  mode?: 'date' | 'month'
  placeholder?: string
  disabled?: boolean
  id?: string
}

interface Parsed { year: number; month: number; day: number }

function parse(value: string, mode: 'date' | 'month'): Parsed | null {
  if (!value) return null
  const parts = value.split('-').map(Number)
  if (mode === 'month') {
    const [y, m] = parts
    if (!y || !m || isNaN(y) || isNaN(m)) return null
    return { year: y, month: m - 1, day: 1 }
  }
  const [y, m, d] = parts
  if (!y || !m || isNaN(y) || isNaN(m)) return null
  return { year: y, month: m - 1, day: d ?? 1 }
}

function fmt(value: string, mode: 'date' | 'month'): string {
  const p = parse(value, mode)
  if (!p) return ''
  if (mode === 'month') return `${MONTHS_FULL[p.month]} ${p.year}`
  return `${String(p.day).padStart(2, '0')} ${MONTHS_FULL[p.month]} ${p.year}`
}

function daysIn(year: number, month: number) { return new Date(year, month + 1, 0).getDate() }
function firstDay(year: number, month: number) { return new Date(year, month, 1).getDay() }

export function DatePicker({ value, onChange, mode = 'date', placeholder, disabled, id }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const now = new Date()

  const parsed = parse(value, mode)
  const [navYear,  setNavYear]  = useState(parsed?.year  ?? now.getFullYear())
  const [navMonth, setNavMonth] = useState(parsed?.month ?? now.getMonth())

  useEffect(() => {
    const p = parse(value, mode)
    if (p) { setNavYear(p.year); setNavMonth(p.month) }
  }, [value, mode])

  useEffect(() => {
    function h(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  function prevYear() { setNavYear(y => y - 1) }
  function nextYear() { setNavYear(y => y + 1) }
  function prevMonth() {
    if (navMonth === 0) { setNavMonth(11); setNavYear(y => y - 1) }
    else setNavMonth(m => m - 1)
  }
  function nextMonth() {
    if (navMonth === 11) { setNavMonth(0); setNavYear(y => y + 1) }
    else setNavMonth(m => m + 1)
  }

  function pickMonth(m: number) {
    if (mode === 'month') {
      onChange(`${navYear}-${String(m + 1).padStart(2, '0')}`)
      setOpen(false)
    } else {
      setNavMonth(m)
    }
  }

  function pickDay(day: number) {
    const mm = String(navMonth + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    onChange(`${navYear}-${mm}-${dd}`)
    setOpen(false)
  }

  // Build calendar cells
  const totalDays = daysIn(navYear, navMonth)
  const offset    = firstDay(navYear, navMonth)
  const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)

  const display = fmt(value, mode)

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        className={[
          'w-full flex items-center gap-2 bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-left transition',
          'focus:outline-none focus:ring-1 focus:ring-[var(--accent)]',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[var(--accent)]/50',
          display ? 'text-[var(--foreground)]' : 'text-[var(--muted)]',
        ].join(' ')}
      >
        <svg className="text-[var(--muted)] flex-shrink-0" width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
          <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
        </svg>
        <span className="flex-1 truncate">{display || placeholder || `Select ${mode === 'month' ? 'month' : 'date'}…`}</span>
        {value && !disabled && (
          <span
            role="button"
            tabIndex={0}
            onClick={e => { e.stopPropagation(); onChange('') }}
            onKeyDown={e => e.key === 'Enter' && onChange('')}
            className="text-[var(--muted)] hover:text-red-400 transition-colors leading-none"
            aria-label="Clear date"
          >
            <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </span>
        )}
        <svg className={`text-[var(--muted)] flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
          <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-40 top-full mt-1.5 left-0 w-72 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden">
          {/* Year nav */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)] bg-[var(--muted-bg)]">
            <button type="button" onClick={prevYear} className="p-1 rounded hover:bg-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/></svg>
            </button>
            <span className="font-bold text-sm text-[var(--foreground)]">{navYear}</span>
            <button type="button" onClick={nextYear} className="p-1 rounded hover:bg-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>
            </button>
          </div>

          {/* Month mode: 4×3 grid */}
          {mode === 'month' && (
            <div className="grid grid-cols-3 gap-1.5 p-3">
              {MONTHS_SHORT.map((m, i) => {
                const sel = parsed && parsed.year === navYear && parsed.month === i
                return (
                  <button key={m} type="button" onClick={() => pickMonth(i)}
                    className={`py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      sel ? 'bg-[var(--accent)] text-white' : 'hover:bg-[var(--muted-bg)] text-[var(--foreground)]'
                    }`}>
                    {m}
                  </button>
                )
              })}
            </div>
          )}

          {/* Date mode: month nav + day grid */}
          {mode === 'date' && (
            <>
              <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)]">
                <button type="button" onClick={prevMonth} className="p-1 rounded hover:bg-[var(--muted-bg)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/></svg>
                </button>
                <span className="text-sm font-semibold text-[var(--foreground)]">{MONTHS_FULL[navMonth]}</span>
                <button type="button" onClick={nextMonth} className="p-1 rounded hover:bg-[var(--muted-bg)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>
                </button>
              </div>
              <div className="px-3 pt-2">
                <div className="grid grid-cols-7 mb-1">
                  {DAYS_ABBR.map(d => (
                    <div key={d} className="text-center text-[10px] font-bold text-[var(--muted)] py-1">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-0.5 pb-3">
                  {cells.map((day, i) => {
                    if (!day) return <div key={`_${i}`} />
                    const sel   = parsed?.year === navYear && parsed?.month === navMonth && parsed?.day === day
                    const today = now.getFullYear() === navYear && now.getMonth() === navMonth && now.getDate() === day
                    return (
                      <button key={day} type="button" onClick={() => pickDay(day)}
                        className={`aspect-square flex items-center justify-center text-xs rounded-lg transition-colors cursor-pointer font-medium ${
                          sel   ? 'bg-[var(--accent)] text-white' :
                          today ? 'border border-[var(--accent)] text-[var(--accent)]' :
                                  'hover:bg-[var(--muted-bg)] text-[var(--foreground)]'
                        }`}>
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