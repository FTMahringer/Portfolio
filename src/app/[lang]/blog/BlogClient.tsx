'use client'

import { useState } from 'react'
import BlogCard from '@/components/blog/BlogCard'
import { TagBadge } from '@/components/ui/TagBadge'
import type { BlogPost } from '@/lib/types'
import { slugifyTag } from '@/lib/constants'

interface Props {
  posts: BlogPost[]
  allTags: string[]
}

export default function BlogClient({ posts, allTags }: Props) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const filtered = selectedTag
    ? posts.filter(p => p.frontmatter.tags.some(t => slugifyTag(t) === selectedTag))
    : posts

  return (
    <div className="space-y-8">
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setSelectedTag(null)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors cursor-pointer ${
              selectedTag === null
                ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                : 'bg-[var(--muted-bg)] text-[var(--muted)] border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--foreground)]'
            }`}
          >
            All
          </button>
          {allTags.map(tag => (
            <TagBadge
              key={tag}
              name={tag}
              href={false}
              onClick={(e) => { e.preventDefault(); setSelectedTag(slugifyTag(tag) === selectedTag ? null : slugifyTag(tag)) }}
              className={`cursor-pointer ${slugifyTag(tag) === selectedTag ? 'ring-2 ring-offset-1 ring-[var(--accent)]' : ''}`}
            />
          ))}
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map(post => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-[var(--muted)]">No posts with this tag.</p>
      )}
    </div>
  )
}
