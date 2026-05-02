import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { SearchItem } from '@/lib/search-types'

function readDir(dir: string, type: SearchItem['type'], hrefPrefix: string): SearchItem[] {
  if (!fs.existsSync(dir)) return []
  const results: (SearchItem | null)[] = fs.readdirSync(dir)
    .filter(f => f.endsWith('.mdx') || f.endsWith('.md'))
    .map(f => {
      const slug = f.replace(/\.(mdx|md)$/, '')
      const { data } = matter(fs.readFileSync(path.join(dir, f), 'utf-8'))
      if (data.draft) return null
      return {
        id: `${type}-${slug}`,
        type,
        title: (data.title ?? data.role ?? slug) as string,
        summary: data.summary as string | undefined,
        company: data.company as string | undefined,
        tags: data.tags as string[] | undefined,
        stack: data.stack as string[] | undefined,
        href: `${hrefPrefix}/${slug}`,
      } satisfies SearchItem
    })
  return results.filter((x): x is SearchItem => x !== null)
}

export async function GET() {
  const cwd = process.cwd()
  const items: SearchItem[] = [
    ...readDir(path.join(cwd, 'content/projects'), 'project', '/projects'),
    ...readDir(path.join(cwd, 'content/blog'), 'blog', '/blog'),
    ...readDir(path.join(cwd, 'content/experience'), 'experience', '/experience'),
  ]

  return NextResponse.json(items, {
    headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120' },
  })
}
