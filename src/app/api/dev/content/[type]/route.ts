import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { revalidatePath } from 'next/cache'

const ALLOWED_TYPES = ['projects', 'blog', 'experience'] as const
type ContentType = (typeof ALLOWED_TYPES)[number]

const TYPE_PATHS: Record<ContentType, string> = {
  projects: 'content/projects',
  blog: 'content/blog',
  experience: 'content/experience',
}

const ROUTE_PATHS: Record<ContentType, string> = {
  projects: '/projects',
  blog: '/blog',
  experience: '/experience',
}

function checkDevSession(req: NextRequest): boolean {
  const cookieHeader = req.headers.get('cookie') ?? ''
  return cookieHeader.split(';').some(c => c.trim().startsWith('dev_session=1'))
}

function resolveType(type: string): ContentType | null {
  return ALLOWED_TYPES.includes(type as ContentType) ? (type as ContentType) : null
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  if (!checkDevSession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { type } = await params
  const contentType = resolveType(type)
  if (!contentType) {
    return NextResponse.json({ error: `Unknown type. Use: ${ALLOWED_TYPES.join(', ')}` }, { status: 400 })
  }

  const dir = path.join(process.cwd(), TYPE_PATHS[contentType])
  if (!fs.existsSync(dir)) return NextResponse.json([])

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx') || f.endsWith('.md'))
  const entries = files.map(f => {
    const raw = fs.readFileSync(path.join(dir, f), 'utf-8')
    const { data } = matter(raw)
    return { slug: f.replace(/\.(mdx|md)$/, ''), frontmatter: data }
  })

  return NextResponse.json(entries)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  if (!checkDevSession(req)) {
    return NextResponse.json({ error: 'Unauthorized — dev session required.' }, { status: 401 })
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
    return NextResponse.json(
      { error: `File "${slug}.mdx" already exists. Set overwrite: true to replace.` },
      { status: 409 }
    )
  }

  // Serialize frontmatter to YAML
  const fm = Object.entries(frontmatter ?? {})
    .map(([k, v]) => {
      if (Array.isArray(v)) {
        if (v.length === 0) return `${k}: []`
        return `${k}:\n${v.map(i => `  - ${JSON.stringify(i)}`).join('\n')}`
      }
      if (v === null || v === undefined) return `${k}: null`
      if (typeof v === 'boolean') return `${k}: ${v}`
      if (typeof v === 'number') return `${k}: ${v}`
      return `${k}: ${JSON.stringify(String(v))}`
    })
    .join('\n')

  const mdxContent = `---\n${fm}\n---\n\n${content}`
  fs.writeFileSync(filePath, mdxContent, 'utf-8')

  revalidatePath(ROUTE_PATHS[contentType])
  revalidatePath(`${ROUTE_PATHS[contentType]}/${slug}`)

  return NextResponse.json({
    success: true,
    slug,
    path: `${TYPE_PATHS[contentType]}/${slug}.mdx`,
    url: `${ROUTE_PATHS[contentType]}/${slug}`,
  })
}
