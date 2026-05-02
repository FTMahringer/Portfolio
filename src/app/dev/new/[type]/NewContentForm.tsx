'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { FormWizard, type WizardStep } from '@/components/ui/FormWizard'
import { MarkdownEditor } from '@/components/ui/MarkdownEditor'
import { RelatedSelector } from '@/components/ui/RelatedSelector'
import { DatePicker } from '@/components/ui/DatePicker'

type ContentType = 'blog' | 'project' | 'experience'

const inputCls = 'w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition'
const textareaCls = `${inputCls} resize-none leading-relaxed`
const checkCls = 'w-4 h-4 rounded accent-[var(--accent)]'

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1">{children}</div>
}
function Row({ children, full }: { children: React.ReactNode; full?: boolean }) {
  return <div className={full ? 'col-span-2' : 'col-span-1'}>{children}</div>
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

/* ─── Image Upload ─────────────────────────────────────────────── */
function ImageUpload({ type, slug, images, onAdd, onRemove }: {
  type: ContentType; slug: string; images: string[]
  onAdd: (p: string[]) => void; onRemove: (p: string) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function upload(files: FileList | null) {
    if (!files?.length) return
    if (!slug) { setError('Set a slug first'); return }
    setUploading(true); setError(null)
    const fd = new FormData()
    Array.from(files).forEach(f => fd.append('images', f))
    const res = await fetch(`/api/dev/upload?type=${type}s&slug=${slug}`, { method: 'POST', body: fd })
    setUploading(false)
    if (res.ok) { const d = await res.json(); onAdd(d.images) }
    else { const d = await res.json().catch(() => ({})); setError(d.error ?? 'Upload failed') }
  }

  return (
    <div className="space-y-3">
      <Label>Images</Label>
      <div
        className="border-2 border-dashed border-[var(--border)] rounded-xl p-8 text-center cursor-pointer hover:border-[var(--accent)]/50 transition-colors"
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); upload(e.dataTransfer.files) }}
      >
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => upload(e.target.files)} />
        <div className="text-3xl mb-2">🖼</div>
        <p className="text-sm text-[var(--foreground)] font-medium">{uploading ? 'Converting to WebP…' : 'Drop images or click to browse'}</p>
        <p className="text-xs text-[var(--muted)] mt-1">Any format accepted → auto-converted to WebP (max 1920×1080)</p>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map(img => (
            <div key={img} className="relative aspect-video rounded-lg overflow-hidden border border-[var(--border)] group">
              <Image src={img} alt="" fill className="object-cover" sizes="200px" />
              <button type="button" onClick={() => onRemove(img)}
                className="absolute top-1 right-1 bg-black/70 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-red-600">×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── BLOG STEPS ─────────────────────────────────────────────────  */
const BLOG_STEPS: WizardStep[] = [
  { id: 'basics',  title: 'Basics',  icon: '📝' },
  { id: 'details', title: 'Details', icon: '🏷' },
  { id: 'content', title: 'Content', icon: '✍️' },
]

function BlogStep({ step, f, set }: { step: number; f: Record<string, string|boolean|string[]>; set: (k: string, v: string|boolean|string[]) => void }) {
  if (step === 0) return (
    <Grid>
      <Row full>
        <Label>Title</Label>
        <input className={inputCls} placeholder="My awesome post" value={f.title as string}
          onChange={e => { set('title', e.target.value); set('slug', slugify(e.target.value)) }} />
      </Row>
      <Row>
        <Label>Slug</Label>
        <input className={inputCls} placeholder="my-awesome-post" value={f.slug as string}
          onChange={e => set('slug', e.target.value)} />
      </Row>
      <Row>
        <Label>Published Date</Label>
        <DatePicker mode="date" value={f.publishedAt as string} onChange={v => set('publishedAt', v)} placeholder="Pick date…" />
      </Row>
      <Row full>
        <label className="flex items-center gap-2 cursor-pointer mt-1">
          <input type="checkbox" className={checkCls} checked={f.draft as boolean} onChange={e => set('draft', e.target.checked)} />
          <span className="text-sm text-[var(--foreground)]">Save as draft (won't appear publicly)</span>
        </label>
      </Row>
    </Grid>
  )
  if (step === 1) return (
    <Grid>
      <Row full>
        <Label>Summary</Label>
        <textarea className={textareaCls} rows={3} placeholder="A short description for previews and meta tags…" value={f.summary as string}
          onChange={e => set('summary', e.target.value)} />
      </Row>
      <Row full>
        <Label>Tags (comma separated)</Label>
        <input className={inputCls} placeholder="next.js, tutorial, web-dev" value={f.tags as string}
          onChange={e => set('tags', e.target.value)} />
      </Row>
    </Grid>
  )
  return (
    <MarkdownEditor value={f._content as string} onChange={v => set('_content', v)} rows={28} placeholder="Write your post…" />
  )
}

/* ─── PROJECT STEPS ──────────────────────────────────────────────  */
const PROJECT_STEPS: WizardStep[] = [
  { id: 'basics',    title: 'Basics',    icon: '📦' },
  { id: 'details',   title: 'Details',   icon: '🔧' },
  { id: 'media',     title: 'Media',     icon: '🖼' },
  { id: 'content',   title: 'Content',   icon: '✍️' },
]

function ProjectStep({ step, f, set }: { step: number; f: Record<string, string|boolean|string[]>; set: (k: string, v: string|boolean|string[]) => void }) {
  if (step === 0) return (
    <Grid>
      <Row full>
        <Label>Project Title</Label>
        <input className={inputCls} placeholder="My Project" value={f.title as string}
          onChange={e => { set('title', e.target.value); set('slug', slugify(e.target.value)) }} />
      </Row>
      <Row>
        <Label>Slug</Label>
        <input className={inputCls} placeholder="my-project" value={f.slug as string}
          onChange={e => set('slug', e.target.value)} />
      </Row>
      <Row>
        <Label>Status</Label>
        <select className={inputCls} value={f.status as string} onChange={e => set('status', e.target.value)}>
          <option value="Work in Progress">Work in Progress</option>
          <option value="Completed">Completed</option>
          <option value="Archived">Archived</option>
          <option value="Idea">Idea</option>
        </select>
      </Row>
      <Row>
        <Label>Category</Label>
        <input className={inputCls} placeholder="Web Development" value={f.category as string}
          onChange={e => set('category', e.target.value)} />
      </Row>
      <Row full>
        <label className="flex items-center gap-2 cursor-pointer mt-1">
          <input type="checkbox" className={checkCls} checked={f.featured as boolean} onChange={e => set('featured', e.target.checked)} />
          <span className="text-sm text-[var(--foreground)]">Featured project (shown on homepage)</span>
        </label>
      </Row>
    </Grid>
  )
  if (step === 1) return (
    <Grid>
      <Row full>
        <Label>Summary</Label>
        <textarea className={textareaCls} rows={3} placeholder="A brief description shown on the project card…" value={f.summary as string}
          onChange={e => set('summary', e.target.value)} />
      </Row>
      <Row full>
        <Label>Tech Stack (comma separated)</Label>
        <input className={inputCls} placeholder="Next.js, TypeScript, Tailwind, PostgreSQL" value={f.stack as string}
          onChange={e => set('stack', e.target.value)} />
      </Row>
      <Row>
        <Label>GitHub URL</Label>
        <input className={inputCls} placeholder="https://github.com/user/repo" value={f.github as string}
          onChange={e => set('github', e.target.value)} />
      </Row>
      <Row>
        <Label>Live Demo URL</Label>
        <input className={inputCls} placeholder="https://myproject.com" value={f.demo as string}
          onChange={e => set('demo', e.target.value)} />
      </Row>
    </Grid>
  )
  if (step === 2) return (
    <div className="space-y-6">
      <ImageUpload type="project" slug={f.slug as string} images={f.images as string[]}
        onAdd={p => set('images', [...(f.images as string[]), ...p])}
        onRemove={p => set('images', (f.images as string[]).filter(x => x !== p))} />
      <RelatedSelector type="experience" selected={f.relatedExperience as string[]} onChange={v => set('relatedExperience', v)} />
    </div>
  )
  return (
    <MarkdownEditor value={f._content as string} onChange={v => set('_content', v)} rows={28} placeholder="Describe your project in detail…" />
  )
}

/* ─── EXPERIENCE STEPS ───────────────────────────────────────────  */
const EXP_STEPS: WizardStep[] = [
  { id: 'basics',   title: 'Basics',   icon: '🏢' },
  { id: 'timeline', title: 'Timeline', icon: '📅' },
  { id: 'details',  title: 'Details',  icon: '🔍' },
  { id: 'content',  title: 'Content',  icon: '✍️' },
]

function ExperienceStep({ step, f, set }: { step: number; f: Record<string, string|boolean|string[]>; set: (k: string, v: string|boolean|string[]) => void }) {
  if (step === 0) return (
    <Grid>
      <Row>
        <Label>Job Title / Role</Label>
        <input className={inputCls} placeholder="Software Developer Intern" value={f.title as string}
          onChange={e => { set('title', e.target.value); set('slug', slugify((f.company as string) + '-' + e.target.value)) }} />
      </Row>
      <Row>
        <Label>Company</Label>
        <input className={inputCls} placeholder="Acme Inc." value={f.company as string}
          onChange={e => { set('company', e.target.value); set('slug', slugify(e.target.value + '-' + (f.title as string))) }} />
      </Row>
      <Row>
        <Label>Slug</Label>
        <input className={inputCls} placeholder="acme-inc-intern" value={f.slug as string}
          onChange={e => set('slug', e.target.value)} />
      </Row>
      <Row>
        <Label>Location</Label>
        <input className={inputCls} placeholder="Vienna, Austria" value={f.location as string}
          onChange={e => set('location', e.target.value)} />
      </Row>
    </Grid>
  )
  if (step === 1) return (
    <Grid>
      <Row>
        <Label>Start Date</Label>
        <DatePicker mode="month" value={f.startDate as string} onChange={v => set('startDate', v)} placeholder="Pick start month…" />
      </Row>
      <Row>
        <Label>End Date</Label>
        <DatePicker mode="month" value={f.endDate as string} onChange={v => set('endDate', v)}
          placeholder={f.present as boolean ? 'Present' : 'Pick end month…'} disabled={f.present as boolean} />
      </Row>
      <Row full>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className={checkCls} checked={f.present as boolean} onChange={e => set('present', e.target.checked)} />
          <span className="text-sm text-[var(--foreground)]">I currently work here</span>
        </label>
      </Row>
      <Row>
        <Label>Employment Type</Label>
        <select className={inputCls} value={f.type as string} onChange={e => set('type', e.target.value)}>
          <option value="Internship">Internship</option>
          <option value="Part-time">Part-time</option>
          <option value="Full-time">Full-time</option>
          <option value="Freelance">Freelance</option>
        </select>
      </Row>
    </Grid>
  )
  if (step === 2) return (
    <div className="space-y-5">
      <Grid>
        <Row full>
          <Label>Tech Stack (comma separated)</Label>
          <input className={inputCls} placeholder="Java, Spring Boot, Docker, Kubernetes" value={f.stack as string}
            onChange={e => set('stack', e.target.value)} />
        </Row>
        <Row full>
          <Label>Key Highlights (one per line)</Label>
          <textarea className={textareaCls} rows={4} placeholder={"Built a CI/CD pipeline reducing deploy time by 60%\nMigrated monolith to microservices"} value={f.highlights as string}
            onChange={e => set('highlights', e.target.value)} />
        </Row>
        <Row>
          <Label>Company / Project Link</Label>
          <input className={inputCls} placeholder="https://company.com" value={f.link as string}
            onChange={e => set('link', e.target.value)} />
        </Row>
        <Row>
          <div className="pt-5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className={checkCls} checked={f.featured as boolean} onChange={e => set('featured', e.target.checked)} />
              <span className="text-sm text-[var(--foreground)]">Featured entry</span>
            </label>
          </div>
        </Row>
      </Grid>
      <RelatedSelector type="project" selected={f.relatedProjects as string[]} onChange={v => set('relatedProjects', v)} />
      <ImageUpload type="experience" slug={f.slug as string} images={f.images as string[]}
        onAdd={p => set('images', [...(f.images as string[]), ...p])}
        onRemove={p => set('images', (f.images as string[]).filter(x => x !== p))} />
    </div>
  )
  return (
    <MarkdownEditor value={f._content as string} onChange={v => set('_content', v)} rows={28} placeholder="Describe your role, responsibilities, and impact…" />
  )
}

/* ─── Wizards config ─────────────────────────────────────────────  */
const STEPS: Record<ContentType, WizardStep[]> = {
  blog:       BLOG_STEPS,
  project:    PROJECT_STEPS,
  experience: EXP_STEPS,
}

const INITIAL: Record<ContentType, Record<string, string|boolean|string[]>> = {
  blog:       { title: '', slug: '', publishedAt: '', summary: '', tags: '', draft: false, images: [] as string[], _content: '# Write your content here\n\nStart typing...\n' },
  project:    { title: '', slug: '', status: 'Work in Progress', summary: '', category: '', stack: '', github: '', demo: '', featured: false, relatedExperience: [] as string[], images: [] as string[], _content: '# Write your content here\n\nStart typing...\n' },
  experience: { title: '', slug: '', company: '', location: '', startDate: '', endDate: '', type: 'Internship', stack: '', highlights: '', link: '', present: false, featured: false, relatedProjects: [] as string[], images: [] as string[], _content: '# Write your content here\n\nStart typing...\n' },
}

// Per-step validation: which field(s) must be non-empty?
const REQUIRED: Record<ContentType, Record<number, string[]>> = {
  blog:       { 0: ['title', 'slug'] },
  project:    { 0: ['title', 'slug'] },
  experience: { 0: ['title', 'slug', 'company'] },
}

/* ─── Main ───────────────────────────────────────────────────────  */
export function NewContentForm({ type }: { type: ContentType }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [fields, setFields] = useState<Record<string, string|boolean|string[]>>(INITIAL[type])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const steps = STEPS[type]
  const required = (REQUIRED[type]?.[step] ?? [])
  const canNext = required.every(k => Boolean(fields[k]))

  function set(k: string, v: string | boolean | string[]) {
    setFields(prev => ({ ...prev, [k]: v }))
  }

  function handlePrev() { setStep(s => Math.max(0, s - 1)); setError(null) }
  function handleNext() {
    if (!canNext) { setError(`Please fill in: ${required.filter(k => !fields[k]).join(', ')}`); return }
    setError(null); setStep(s => s + 1)
  }

  async function handleFinish() {
    setLoading(true); setError(null)

    const { slug, present, _content, ...rest } = fields
    const frontmatter: Record<string, unknown> = { ...rest }

    // comma-separated → arrays
    for (const key of ['tags', 'stack']) {
      if (typeof frontmatter[key] === 'string') {
        const arr = String(frontmatter[key]).split(',').map(s => s.trim()).filter(Boolean)
        if (arr.length) frontmatter[key] = arr; else delete frontmatter[key]
      }
    }
    // highlights: newline-separated
    if (typeof frontmatter.highlights === 'string') {
      const arr = String(frontmatter.highlights).split('\n').map(s => s.trim()).filter(Boolean)
      if (arr.length) frontmatter.highlights = arr; else delete frontmatter.highlights
    }
    // empty arrays → omit
    for (const key of ['images', 'relatedProjects', 'relatedExperience']) {
      if (Array.isArray(frontmatter[key]) && !(frontmatter[key] as string[]).length) delete frontmatter[key]
    }
    if (present) frontmatter.endDate = null

    const res = await fetch(`/api/dev/content/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, frontmatter, content: _content }),
    })
    setLoading(false)
    if (res.ok) {
      const href = type === 'blog' ? `/blog/${slug}` : type === 'project' ? `/projects/${slug}` : `/experience/${slug}`
      router.push(href as string)
    } else {
      const d = await res.json().catch(() => ({}))
      setError(d.error ?? 'Failed to create content'); setStep(steps.length - 1)
    }
  }

  function renderStep() {
    if (type === 'blog')       return <BlogStep       step={step} f={fields} set={set} />
    if (type === 'project')    return <ProjectStep    step={step} f={fields} set={set} />
    if (type === 'experience') return <ExperienceStep step={step} f={fields} set={set} />
    return null
  }

  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1)

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header bar */}
      <div className="border-b border-[var(--border)] bg-[var(--card)] px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-green-400 font-mono text-xs bg-green-400/10 border border-green-400/30 rounded px-2 py-1">DEV</span>
            <h1 className="text-lg font-bold text-[var(--foreground)]">New {typeLabel}</h1>
          </div>
          <button onClick={() => router.back()} className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/></svg>
            Back
          </button>
        </div>
      </div>

      <FormWizard
        steps={steps}
        currentStep={step}
        onPrev={handlePrev}
        onNext={handleNext}
        onFinish={handleFinish}
        loading={loading}
        finishLabel={`Publish ${typeLabel}`}
        canNext={canNext}
        error={error}
      >
        {renderStep()}
      </FormWizard>
    </div>
  )
}