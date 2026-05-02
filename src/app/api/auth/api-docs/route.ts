import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { key } = await req.json().catch(() => ({}))
  const secret = process.env.API_DOCS_KEY

  if (!secret) {
    // No key configured — deny by default
    return NextResponse.json({ ok: false, error: 'API docs access not configured.' }, { status: 403 })
  }

  if (!key || key !== secret) {
    return NextResponse.json({ ok: false, error: 'Invalid access key.' }, { status: 401 })
  }

  return NextResponse.json({ ok: true })
}
