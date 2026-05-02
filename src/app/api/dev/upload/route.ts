import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

function checkAuth(req: NextRequest): boolean {
  const cookie = req.headers.get('cookie') ?? ''
  return cookie.split(';').some(c => c.trim() === 'dev_session=1')
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
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
