import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/auth'
import { SESSION_COOKIE_NAME } from '@/lib/auth'
import { sqlite } from '@/db'

async function checkAuth(req: NextRequest): Promise<boolean> {
  const cookie = req.headers.get('cookie') ?? ''
  const match = cookie.split(';').map(c => c.trim()).find(c => c.startsWith(`${SESSION_COOKIE_NAME}=`))
  if (!match) return false
  const sid = match.split('=')[1]
  return (await validateSession(sid)) !== null
}

/** GET /api/admin/db — list tables with row counts */
export async function GET(req: NextRequest) {
  if (!await checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tables = sqlite.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '__drizzle%' ORDER BY name`
  ).all() as { name: string }[]

  const result: { name: string; count: number }[] = []
  for (const t of tables) {
    const row = sqlite.prepare(`SELECT COUNT(*) as c FROM "${t.name}"`).get() as { c: number }
    result.push({ name: t.name, count: row?.c ?? 0 })
  }

  return NextResponse.json({ tables: result })
}

/** POST /api/admin/db — execute a SQL query and return results */
export async function POST(req: NextRequest) {
  if (!await checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({})) as { query?: string }
  const query = (body.query ?? '').trim()

  if (!query) {
    return NextResponse.json({ error: 'query is required' }, { status: 400 })
  }

  const upper = query.toUpperCase().replace(/\s+/g, ' ')
  const blocked = ['DROP TABLE', 'DROP DATABASE', 'TRUNCATE', 'ATTACH DATABASE', 'DETACH DATABASE']
  for (const b of blocked) {
    if (upper.includes(b)) {
      return NextResponse.json({ error: `Statement "${b}" is not allowed from the UI editor.` }, { status: 400 })
    }
  }

  try {
    const isSelect = upper.startsWith('SELECT') || upper.startsWith('WITH') || upper.startsWith('PRAGMA')
    if (isSelect) {
      const rows = sqlite.prepare(query).all() as Record<string, unknown>[]
      const columns = rows.length > 0 ? Object.keys(rows[0]) : []
      return NextResponse.json({ columns, rows, rowCount: rows.length })
    } else {
      const result = sqlite.prepare(query).run()
      return NextResponse.json({
        columns: [],
        rows: [],
        rowCount: result.changes,
        message: `${result.changes} row(s) affected`,
      })
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
