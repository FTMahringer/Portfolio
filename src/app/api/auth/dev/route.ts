import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { key } = body as { key?: string }

  // Accept DEV_KEY (primary) or legacy API_DOCS_KEY
  const secret = process.env.DEV_KEY || process.env.API_DOCS_KEY

  if (!secret) {
    return NextResponse.json(
      { ok: false, error: 'Dev access not configured. Set DEV_KEY in .env.local.' },
      { status: 403 }
    )
  }

  if (!key || key !== secret) {
    return NextResponse.json({ ok: false, error: 'Invalid key.' }, { status: 401 })
  }

  return NextResponse.json({ ok: true })
}
