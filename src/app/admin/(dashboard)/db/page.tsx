'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

interface TableMeta { name: string; count: number }
interface QueryResult { columns: string[]; rows: Record<string, unknown>[]; rowCount: number; message?: string; error?: string }

const DEFAULT_QUERIES: Record<string, string> = {
  users:    'SELECT id, email, createdAt FROM users;',
  sessions: 'SELECT id, userId, ip, userAgent, createdAt, expiresAt FROM sessions ORDER BY createdAt DESC;',
}

export default function DevDbPage() {
  const [tables, setTables]       = useState<TableMeta[]>([])
  const [activeTable, setActiveTable] = useState<string | null>(null)
  const [query, setQuery]         = useState('SELECT * FROM users LIMIT 50;')
  const [result, setResult]       = useState<QueryResult | null>(null)
  const [running, setRunning]     = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load table list
  useEffect(() => {
    fetch('/api/admin/db')
      .then(r => r.json())
      .then(d => setTables(d.tables ?? []))
      .catch(() => {})
  }, [])

  const runQuery = useCallback(async (q?: string) => {
    const sql = q ?? query
    if (!sql.trim()) return
    setRunning(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sql }),
      })
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ columns: [], rows: [], rowCount: 0, error: 'Network error' })
    }
    setRunning(false)
  }, [query])

  function selectTable(name: string) {
    setActiveTable(name)
    const q = DEFAULT_QUERIES[name] ?? `SELECT * FROM "${name}" LIMIT 50;`
    setQuery(q)
    runQuery(q)
  }

  // Ctrl+Enter to run
  function onKeyDown(e: React.KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      runQuery()
    }
  }

  return (
    <div className="h-full flex flex-col">

      {/* Page header */}
      <div className="px-8 pt-8 pb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-0.5">Database</h1>
        <p className="text-sm text-[var(--muted)]">Browse tables and run SQL queries against the SQLite database.</p>
      </div>

      <div className="flex flex-1 overflow-hidden px-8 pb-8 gap-5">

        {/* Left: table list */}
        <aside className="w-44 flex-shrink-0 flex flex-col gap-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)] mb-1.5">Tables</p>
          {tables.length === 0 && (
            <p className="text-xs text-[var(--muted)] italic">Loading…</p>
          )}
          {tables.map(t => (
            <button
              key={t.name}
              onClick={() => selectTable(t.name)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                activeTable === t.name
                  ? 'bg-green-400/10 text-green-400 font-medium'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)]'
              }`}
            >
              <span className="font-mono truncate">{t.name}</span>
              <span className="text-xs opacity-60 flex-shrink-0 ml-1">{t.count}</span>
            </button>
          ))}
        </aside>

        {/* Right: editor + results */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">

          {/* SQL Editor */}
          <div className="rounded-xl border border-[var(--border)] overflow-hidden flex-shrink-0">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-[var(--card)]">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[var(--muted)]">SQL Editor</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[var(--muted)]">Ctrl+Enter to run</span>
                <button
                  onClick={() => runQuery()}
                  disabled={running}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-green-500/20 text-green-400 text-xs font-semibold hover:bg-green-500/30 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  {running ? (
                    <span className="animate-spin text-xs">◌</span>
                  ) : (
                    <span>▶</span>
                  )}
                  Run
                </button>
              </div>
            </div>
            <textarea
              ref={textareaRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              rows={6}
              spellCheck={false}
              className="w-full font-mono text-sm px-4 py-3 bg-[var(--muted-bg)] text-[var(--foreground)] resize-none outline-none"
              placeholder="SELECT * FROM users LIMIT 10;"
            />
          </div>

          {/* Results */}
          {result && (
            <div className="rounded-xl border border-[var(--border)] overflow-hidden flex-1 min-h-0 flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-[var(--card)] flex-shrink-0">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[var(--muted)]">
                  Results
                </span>
                {!result.error && (
                  <span className="text-xs text-[var(--muted)]">
                    {result.message ?? `${result.rowCount} row${result.rowCount !== 1 ? 's' : ''}`}
                  </span>
                )}
              </div>

              {result.error ? (
                <div className="px-4 py-3 text-sm text-red-400 font-mono bg-red-900/10">
                  {result.error}
                </div>
              ) : result.columns.length === 0 && result.message ? (
                <div className="px-4 py-3 text-sm text-green-400 font-mono">
                  ✓ {result.message}
                </div>
              ) : (
                <div className="overflow-auto flex-1">
                  <table className="w-full text-xs font-mono">
                    <thead className="sticky top-0 bg-[var(--card)]">
                      <tr>
                        {result.columns.map(col => (
                          <th key={col} className="px-4 py-2 text-left font-semibold text-[var(--muted)] border-b border-[var(--border)] whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.map((row, i) => (
                        <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted-bg)]">
                          {result.columns.map(col => {
                            const val = row[col]
                            const display = val === null ? <span className="text-[var(--muted)] italic">NULL</span>
                              : typeof val === 'string' && val.length > 80 ? val.slice(0, 80) + '…'
                              : String(val)
                            return (
                              <td key={col} className="px-4 py-1.5 text-[var(--foreground)] whitespace-nowrap max-w-xs overflow-hidden text-ellipsis">
                                {display}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
