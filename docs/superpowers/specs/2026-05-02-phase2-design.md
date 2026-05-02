# Portfolio Phase 2 — Design Spec
_2026-05-02_

## 1. Overview

Phase 2 adds six interconnected features on top of the Phase 1 Next.js 16 / Tailwind v4 / MDX portfolio:

| # | Feature | Key decisions |
|---|---------|---------------|
| 1 | Central config file | `config/site.yaml` parsed server-side with `js-yaml` |
| 2 | About page — GitHub profile layout | Sidebar (avatar, name, bio, quick facts) + prose right column |
| 3 | Settings side drawer | Slides in from right, tab handle, cookie-persisted, React context |
| 4 | Projects view toggle | Grid / List + card size slider, state in settings context + cookie |
| 5 | Experience detail pages | `/experience/[slug]` — cards are now clickable previews |
| 6 | Contact page — split layout | Left: form (markdown editor + file upload → Resend); Right: social links from config |
| 7 | Content API | `POST /api/content/[type]` secured with `Authorization: Bearer` static key |

---

## 2. Central Config File

**File:** `config/site.yaml`

```yaml
site:
  title: "Your Name"
  tagline: "Full-stack developer & open-source contributor"
  url: "https://yoursite.dev"
  email: "you@example.com"
  location: "Berlin, Germany"
  avatar: "/images/avatar.jpg"

social:
  github: "yourusername"
  linkedin: "yourusername"
  twitter: ""          # leave blank to hide
  instagram: ""
  youtube: ""
  email: "you@example.com"

contact:
  resend_from: "Portfolio Contact <noreply@yourdomain.com>"
  to: "you@example.com"
```

**Reading:** A server-side utility `src/lib/config.ts` reads and parses the YAML once with `js-yaml`. Result is typed as `SiteConfig`. All pages/components import from this utility — never from the YAML directly.

```ts
// src/lib/config.ts
import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

export type SiteConfig = { site: {...}, social: {...}, contact: {...} }
let _config: SiteConfig | null = null

export function getSiteConfig(): SiteConfig {
  if (!_config) {
    const raw = fs.readFileSync(path.join(process.cwd(), 'config/site.yaml'), 'utf8')
    _config = yaml.load(raw) as SiteConfig
  }
  return _config
}
```

Header, Footer, About sidebar, and Contact right-column all consume `getSiteConfig()`.

---

## 3. About Page — GitHub Profile Layout

**Layout:** Two columns at `md:` breakpoint, single column on mobile.

```
┌─────────────────────────────────────────────────────┐
│  [sidebar 280px]   │  [content flex-1]              │
│                    │                                 │
│  avatar (128px)    │  ## About Me                   │
│  Name              │  <prose MDX content>            │
│  @handle           │                                 │
│  Short bio         │  ## Currently Working On        │
│  ─────────         │  <MDX section>                  │
│  📍 Location       │                                 │
│  ✉ email          │  ## Fun Facts                   │
│  🔗 GitHub         │  <MDX section>                  │
│  🔗 LinkedIn       │                                 │
│  ─────────         │                                 │
│  Languages block   │                                 │
│  Skills pills      │                                 │
└─────────────────────────────────────────────────────┘
```

- Sidebar pulls all data from `getSiteConfig()` (no hardcoding).
- About prose content still lives in `content/pages/about.mdx` — just the right column.
- Sidebar quick-facts (location, email, social links) rendered from config, links hidden if blank.

---

## 4. Settings Side Drawer

### Architecture

- **`src/context/SettingsContext.tsx`** — React context holding all settings + setter.
- **`src/hooks/useSettings.ts`** — hook to read/write settings; persists to cookies with `js-cookie`.
- **`src/components/settings/SettingsDrawer.tsx`** — client component; the visible UI.
- **`src/components/settings/SettingsTab.tsx`** — the persistent right-edge tab that opens/closes the drawer.
- Mounted once in `src/app/layout.tsx` so it's available on all pages.

### Settings Schema

```ts
type Settings = {
  // Appearance
  theme: 'dark' | 'light' | 'system'
  accentColor: 'cyan' | 'purple' | 'orange' | 'green'
  reduceMotion: boolean
  // Projects page
  projectsView: 'grid' | 'list'
  projectsCardSize: 'sm' | 'md' | 'lg'
  // Experience page
  experienceExpanded: boolean   // auto-expand all previews
  // Language (future)
  locale: 'en'                  // only 'en' for now; kept for forward compat
}
```

### Drawer UI

- Slides in from right, 280px wide, full viewport height.
- Fixed position, `z-50`, semi-transparent backdrop does NOT close it (clicking the tab closes it).
- Tab handle: vertical text "⚙ Settings" on the right edge, always visible, toggles drawer.
- Sections: **Appearance**, **Projects**, **Experience** (collapsible with `<details>` or custom accordion).
- Cookie key: `portfolio_settings`, JSON-encoded, 365-day expiry.
- No drag needed (Option C is fixed position).

---

## 5. Projects View Toggle

Driven entirely by the Settings context — no separate local state needed.

- `ProjectsPage` reads `settings.projectsView` and `settings.projectsCardSize`.
- Grid view: existing `ProjectGrid` component, card size maps to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (md) or always `grid-cols-2` (lg), etc.
- List view: new `ProjectList` component — full-width cards with horizontal layout (image thumbnail left, text right).
- Card size slider in the drawer maps `sm/md/lg` to CSS class adjustments.
- The toggle buttons (Grid / List icons) also live inside the settings drawer under "Projects".

---

## 6. Experience Detail Pages

### Current state
`/experience` page renders all MDX entries inline in a timeline.

### Changes
- Experience cards become clickable preview cards (title, company, date, first 100 words of description).
- Full content lives at `/experience/[slug]` — same MDXRemote rendering as project detail pages.
- `getAllExperience()` already exists; add `getExperienceBySlug(slug)` to `src/lib/mdx.ts`.
- Add `src/app/experience/[slug]/page.tsx` — identical pattern to `projects/[slug]/page.tsx`.
- `ExperienceCard` component — new, replaces the inline MDX on the list page.

### Frontmatter addition
```yaml
---
title: "Job Title"
company: "Company Name"
location: "City, Country"
startDate: "2023-01"
endDate: "2024-06"       # or "present"
type: "full-time"        # full-time | part-time | internship | freelance | contract
stack: [TypeScript, React, Node.js]
featured: false
slug: "company-role-2023"
---
```

---

## 7. Contact Page — Split Layout

```
┌──────────────────────────┬────────────────────────┐
│   Contact Form (left)    │   Get In Touch (right)  │
│                          │                         │
│  Name ________________   │   📧 email              │
│  Subject _____________   │   🐙 GitHub             │
│  ┌────────────────────┐  │   💼 LinkedIn           │
│  │  Markdown editor   │  │   🐦 Twitter            │
│  │  (textarea+preview)│  │   📷 Instagram          │
│  └────────────────────┘  │   ▶  YouTube            │
│  📎 Attach file(s)       │                         │
│  [Send Message →]        │   (only shown if        │
│                          │    configured in yaml)  │
└──────────────────────────┴────────────────────────┘
```

### Form details
- Fields: `name`, `email`, `subject`, `message` (markdown), `files[]`
- Markdown editor: no split-pane textarea (do a button with preview, to look)
- File upload: `<input type="file" multiple>`, files sent as `FormData`, max 10MB total (enforced client + server).
- Submit: `POST /api/contact` (Next.js route handler).

### API route `/api/contact`
- Parses `FormData`.
- Validates required fields; returns `400` with field errors if invalid.
- Sends email via **Resend** SDK (`resend.emails.send`). Attachments forwarded as base64.
- `RESEND_API_KEY` in `.env.local`; `CONTACT_TO` and `CONTACT_FROM` read from `getSiteConfig()`.
- Returns `200 { success: true }` or `500 { error: "..." }`.

### Right column
- Social links rendered from `getSiteConfig().social`.
- Each link: icon + label + handle/URL.
- Links with empty value in YAML are hidden automatically.

---

## 8. Content API

**Base:** `src/app/api/content/[type]/route.ts`  
**Auth:** `Authorization: Bearer <API_SECRET>` header; `API_SECRET` env var.

| Method | Route | Action |
|--------|-------|--------|
| `POST` | `/api/content/projects` | Create/update a project MDX file |
| `POST` | `/api/content/blog` | Create/update a blog post MDX file |
| `POST` | `/api/content/experience` | Create/update an experience MDX file |
| `GET` | `/api/content/projects` | List all project slugs + frontmatter |
| `GET` | `/api/content/blog` | List all blog slugs + frontmatter |
| `GET` | `/api/content/experience` | List all experience slugs + frontmatter |

**POST body (JSON):**
```json
{
  "slug": "my-new-project",
  "frontmatter": { "title": "...", "stack": [...], ... },
  "content": "MDX body as a string"
}
```

**Behaviour:**
- If file exists and `overwrite: false` (default), returns `409 Conflict`.
- Writes to `content/{type}/{slug}.mdx` on disk.
- Triggers Next.js on-demand revalidation for the affected path.
- GET returns JSON array of `{ slug, frontmatter }` objects (no content body).

---

## 9. Dependencies to Add

| Package | Purpose |
|---------|---------|
| `js-yaml` + `@types/js-yaml` | Parse `site.config.yaml` |
| `resend` | Email sending from contact form |
| `js-cookie` + `@types/js-cookie` | Cookie persistence for settings |
| `marked` | Markdown → HTML in contact form preview |

---

## 10. File / Folder Changes

```
config/
  site.yaml                          ← NEW: central site config

src/
  lib/
    config.ts                        ← NEW: typed YAML loader
    mdx.ts                           ← EXTEND: getExperienceBySlug()
  context/
    SettingsContext.tsx               ← NEW
  hooks/
    useSettings.ts                   ← NEW
  components/
    settings/
      SettingsDrawer.tsx             ← NEW
      SettingsTab.tsx                ← NEW
    about/
      AboutSidebar.tsx               ← NEW
    experience/
      ExperienceCard.tsx             ← NEW
    projects/
      ProjectList.tsx                ← NEW (list view)
    contact/
      ContactForm.tsx                ← NEW
      SocialLinks.tsx                ← NEW
  app/
    about/page.tsx                   ← REWRITE: add sidebar layout
    experience/
      page.tsx                       ← MODIFY: use ExperienceCard, link to slug
      [slug]/page.tsx                ← NEW
    contact/page.tsx                 ← REWRITE: split layout
    api/
      contact/route.ts               ← NEW
      content/[type]/route.ts        ← NEW
    layout.tsx                       ← MODIFY: add SettingsDrawer + SettingsProvider
```
