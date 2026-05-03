import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/auth'
import { SESSION_COOKIE_NAME } from '@/lib/auth'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

async function checkAuth(req: NextRequest): Promise<boolean> {
  const cookie = req.headers.get('cookie') ?? ''
  const match = cookie.split(';').map(c => c.trim()).find(c => c.startsWith(`${SESSION_COOKIE_NAME}=`))
  if (!match) return false
  const sid = match.split('=')[1]
  const session = await validateSession(sid)
  return session !== null
}

export async function POST(req: NextRequest) {
  if (!await checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const type = url.searchParams.get('type') ?? 'projects'
  const slug = url.searchParams.get('slug') ?? 'misc'

  const formData = await req.formData()
  const files = formData.getAll('images') as File[]

  if (!files.length) {
    return NextResponse.json({ error: 'No images provided' }, { status: 400 })
  }

  const dir = path.join(process.cwd(), 'public', 'images', type, slug)
  fs.mkdirSync(dir, { recursive: true })

  const saved: string[] = []

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer())
    const originalName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9-_]/gi, '-').toLowerCase()
    const filename = `${originalName}-${Date.now()}.webp`
    const dest = path.join(dir, filename)

    await sharp(buffer)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(dest)

    saved.push(`/images/${type}/${slug}/${filename}`)
  }

  return NextResponse.json({ images: saved })
}
