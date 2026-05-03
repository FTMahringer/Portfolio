import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { revalidatePath } from 'next/cache'
import { ALLOWED_TYPES, TYPE_PATHS, ROUTE_PATHS, resolveType, serializeFrontmatter } from '@/lib/content-api'

function checkAuth(req: NextRequest): boolean {
  const secret = process.env.API_SECRET
  if (!secret) return false
  const auth = req.headers.get('authorization') ?? ''
  return auth === `Bearer ${secret}`
}

// GET /api/content/[type] — list all entries
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { type } = await params
  const contentType = resolveType(type)
  if (!contentType) {
    return NextResponse.json({ error: `Unknown type. Use: ${ALLOWED_TYPES.join(', ')}` }, { status: 400 })
  }

  const dir = path.join(process.cwd(), TYPE_PATHS[contentType])
  if (!fs.existsSync(dir)) {
    return NextResponse.json([])
  }

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx') || f.endsWith('.md'))
  const entries = files.map(f => {
    const raw = fs.readFileSync(path.join(dir, f), 'utf-8')
    const { data } = matter(raw)
    return { slug: f.replace(/\.(mdx|md)$/, ''), frontmatter: data }
  })

  return NextResponse.json(entries)
}

// POST /api/content/[type] — create or update an MDX file
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { type } = await params
  const contentType = resolveType(type)
  if (!contentType) {
    return NextResponse.json({ error: `Unknown type. Use: ${ALLOWED_TYPES.join(', ')}` }, { status: 400 })
  }

  let body: { slug: string; frontmatter: Record<string, unknown>; content: string; overwrite?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const { slug, frontmatter, content, overwrite = false } = body
  if (!slug || typeof slug !== 'string') {
    return NextResponse.json({ error: '`slug` is required.' }, { status: 400 })
  }
  if (!content || typeof content !== 'string') {
    return NextResponse.json({ error: '`content` is required.' }, { status: 400 })
  }

  const dir = path.join(process.cwd(), TYPE_PATHS[contentType])
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  const filePath = path.join(dir, `${slug}.mdx`)
  if (fs.existsSync(filePath) && !overwrite) {
    return NextResponse.json({ error: `File "${slug}.mdx" already exists. Set overwrite: true to replace.` }, { status: 409 })
  }

  const fm = serializeFrontmatter(frontmatter ?? {})
  const mdxContent = `---\n${fm}\n---\n\n${content}`

  fs.writeFileSync(filePath, mdxContent, 'utf-8')

  revalidatePath(ROUTE_PATHS[contentType])
  revalidatePath(`${ROUTE_PATHS[contentType]}/${slug}`)

  return NextResponse.json({ success: true, slug, path: `${TYPE_PATHS[contentType]}/${slug}.mdx` })
}