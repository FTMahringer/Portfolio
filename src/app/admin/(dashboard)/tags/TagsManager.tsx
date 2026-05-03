'use client'

import { useState, useEffect } from 'react'
import { TagBadge } from '@/components/ui/TagBadge'
import { getTagColor, slugifyTag, TAG_COLORS } from '@/lib/tag-utils'

type TagRow = {
  id: number
  name: string
  slug: string
  colorIndex: number
  usageCount: number
  createdAt: number
}

type UsageItem = { slug: string; title: string; type: 'project' | 'post' }

interface Props {
  initialTags: TagRow[]
}

export default function TagsManager({ initialTags }: Props) {
  const [tagsList, setTagsList] = useState<TagRow[]>(initialTags)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<TagRow | null>(null)
  const [usageItems, setUsageItems] = useState<UsageItem[]>([])
  const [loadingUsage, setLoadingUsage] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')

  const filtered = tagsList.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  async function openUsageModal(tag: TagRow) {
    setSelected(tag)
    setLoadingUsage(true)
    setUsageItems([])
    try {
      const res = await fetch(`/api/admin/tags/usage?slug=${tag.slug}`)
      if (res.ok) setUsageItems(await res.json())
    } catch { /* ignore */ }
    setLoadingUsage(false)
  }

  async function handleAdd() {
    if (!newTagName.trim()) return
    setAdding(true)
    setAddError('')
    try {
      const res = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTagName.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        setAddError(data.error ?? 'Failed to create tag')
      } else {
        const tag = await res.json()
        setTagsList(prev => [tag, ...prev])
        setNewTagName('')
        setShowAddModal(false)
      }
    } catch {
      setAddError('Network error')
    }
    setAdding(false)
  }

  async function handleDelete(tag: TagRow) {
    if (!confirm(`Delete tag "${tag.name}"? This won't change MDX files.`)) return
    await fetch('/api/admin/tags', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: tag.id }),
    })
    setTagsList(prev => prev.filter(t => t.id !== tag.id))
    if (selected?.id === tag.id) setSelected(null)
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search tags…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        />
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-400/10 text-green-400 border border-green-400/30 rounded-lg text-sm font-medium hover:bg-green-400/20 transition-colors cursor-pointer"
        >
          + New Tag
        </button>
      </div>

      {/* Stats */}
      <p className="text-xs text-[var(--muted)]">
        {filtered.length} tag{filtered.length !== 1 ? 's' : ''}
        {search ? ` matching "${search}"` : ' total'}
      </p>

      {/* Tag table */}
      <div className="border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--muted-bg)] text-[var(--muted)] text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3 font-semibold">Tag</th>
              <th className="text-left px-4 py-3 font-semibold">Slug</th>
              <th className="text-right px-4 py-3 font-semibold">Used</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-10 text-[var(--muted)]">
                  No tags found.
                </td>
              </tr>
            )}
            {filtered.map(tag => (
              <tr
                key={tag.id}
                className="hover:bg-[var(--muted-bg)] transition-colors"
              >
                <td className="px-4 py-3">
                  <TagBadge name={tag.name} colorIndex={tag.colorIndex} href={false} />
                </td>
                <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">{tag.slug}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`font-mono text-sm ${tag.usageCount > 0 ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`}>
                    {tag.usageCount}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => openUsageModal(tag)}
                      className="text-xs px-2.5 py-1 rounded border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)] transition-colors cursor-pointer"
                    >
                      Usage
                    </button>
                    <button
                      onClick={() => handleDelete(tag)}
                      className="text-xs px-2.5 py-1 rounded border border-[var(--border)] text-[var(--muted)] hover:text-red-400 hover:border-red-400/50 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Usage modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="relative z-10 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <TagBadge name={selected.name} colorIndex={selected.colorIndex} href={false} />
                <span className="text-sm text-[var(--muted)]">usage</span>
              </div>
              <button onClick={() => setSelected(null)} className="text-[var(--muted)] hover:text-[var(--foreground)] text-xl cursor-pointer">✕</button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-4">
              {loadingUsage ? (
                <p className="text-[var(--muted)] text-sm animate-pulse">Loading…</p>
              ) : usageItems.length === 0 ? (
                <p className="text-[var(--muted)] text-sm">Not used in any content yet.</p>
              ) : (
                <ul className="space-y-2">
                  {usageItems.map(item => (
                    <li key={`${item.type}-${item.slug}`} className="flex items-center gap-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--muted-bg)] text-[var(--muted)] border border-[var(--border)] capitalize">
                        {item.type}
                      </span>
                      <a
                        href={item.type === 'project' ? `/projects/${item.slug}` : `/blog/${item.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[var(--foreground)] hover:text-[var(--accent)] transition-colors flex-1 truncate"
                      >
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add tag modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
          <div className="relative z-10 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <span className="font-semibold text-[var(--foreground)]">New Tag</span>
              <button onClick={() => setShowAddModal(false)} className="text-[var(--muted)] hover:text-[var(--foreground)] text-xl cursor-pointer">✕</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] block mb-1">
                  Tag name
                </label>
                <input
                  type="text"
                  autoFocus
                  value={newTagName}
                  onChange={e => setNewTagName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                  placeholder="e.g. kubernetes"
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
                {newTagName && (
                  <p className="text-xs text-[var(--muted)] mt-1.5">
                    Slug: <span className="font-mono">{slugifyTag(newTagName)}</span>
                    {' · '}
                    Preview: <TagBadge name={newTagName} href={false} className="ml-0.5" />
                  </p>
                )}
              </div>
              {addError && <p className="text-xs text-red-400">{addError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  disabled={adding || !newTagName.trim()}
                  className="flex-1 py-2 bg-green-400/10 text-green-400 border border-green-400/30 rounded-lg text-sm font-medium hover:bg-green-400/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {adding ? 'Creating…' : 'Create'}
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
