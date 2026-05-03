# Portfolio Roadmap

> Last updated: 2026-05-03

## Current State ✅

The portfolio is fully built and deployed. All core phases are complete.

**Stack:** Next.js 16, TypeScript, Tailwind CSS, MDX, SQLite + Drizzle ORM, Docker

**Completed features:**
- All public pages: Home, About, Projects (grid/list/filter), Experience (expandable detail), Skills, Blog, Contact (form + email), Resume, Tags (`/tags/[tag]`)
- Admin dashboard (`/admin`): session + OIDC auth, content creation wizards (blog/project/experience), DB viewer, API docs, auth providers, tag management
- Tag system: centralized DB, color-coded pills, filter bars on /projects and /blog, CSV import/export, `config/initial-tags.csv` seed file
- Settings drawer: theme (dark/light/auto), accent color, font size slider, reduced motion, project view (grid/list/card size), colorblind modes — saved in cookies, draggable panel
- Site-wide search: Cmd+K command palette + Fuse.js
- OpenGraph images (next/og), sitemap.xml, JSON-LD structured data
- Docker + GHCR/Docker Hub publishing, auto-release CI/CD on `package.json` version bump
- `config/site.yaml`: central config for name, title, contact links, social URLs

---

## Planned: Phase 3 — Content & Discovery

| ID | Feature | Description |
|----|---------|-------------|
| `rss-feed` | **RSS feed** `/feed.xml` | Blog posts syndication. Add `<link rel="alternate">` to layout. |
| `toc-mdx` | **Table of contents** | Auto-generated from MDX headings, sticky sidebar on desktop. |
| `homelab-page` | **Homelab page** `/homelab` | Self-hosted services, hardware, network topology. Content via MDX/YAML. |
| `now-page` | **Now page** `/now` | nownownow.com style — current projects/reading/learning. Content in `content/pages/now.mdx`. |
| `uses-page` | **Uses page** `/uses` | Hardware, software, editor, tools list. Content in `content/pages/uses.mdx`. |

## Planned: Phase 4 — Settings & Polish

| ID | Feature | Description |
|----|---------|-------------|
| `font-selector` | **Font family selector** | Serif / sans / mono toggle in SettingsDrawer. CSS variable on body. |
| `page-transitions` | **Page transitions** | framer-motion `AnimatePresence` for route changes. |
| `giscus-comments` | **Comments** | Giscus (GitHub Discussions) on `/blog/[slug]`. Config in `site.yaml`. Toggle in settings. |

---

## Key Files & Architecture

```
config/
  site.yaml          # Central config: name, email, social links, skills_highlight
  initial-tags.csv   # Pre-seed tags on fresh DB startup (one name per line, # = comment)

src/
  app/
    admin/(dashboard)/  # Admin pages (auth-gated)
    api/admin/tags/     # Tag CRUD + CSV import/export
    tags/[tag]/         # Public tag detail page
  lib/
    tags.ts             # Server-side tag logic (DB + CSV seed)
    tag-utils.ts        # Client-safe tag utilities (colors, slugify)
    mdx.ts              # MDX content loading
  db/
    index.ts            # DB bootstrap (sqlite.exec for table creation)
    schema.ts           # Drizzle schema
  components/
    ui/TagBadge.tsx     # TagBadge (linked) + TagPill (non-linked, for inside card links)
    settings/SettingsDrawer.tsx

content/
  projects/   # *.mdx — project pages
  blog/       # *.mdx — blog posts
  experience/ # *.mdx — experience entries
  pages/      # about.mdx, now.mdx, uses.mdx (planned)

data/
  portfolio.db  # SQLite (gitignored — tables: users, sessions, oidc_providers, tags)
```

## Tag System Notes

- Tags live in DB (`tags` table), auto-synced from MDX frontmatter on each `/api/tags` call
- `config/initial-tags.csv` is seeded on startup (new rows only, existing untouched)
- Filter bars on `/projects` and `/blog` — tags are NOT shown on individual cards or in main nav
- Admin `/admin/tags`: search, create, delete, usage modal, CSV import/export

## Release Process

- Bump `version` in `package.json` → push to `main`
- CI checks if version changed; if yes, auto-creates GitHub Release + builds/pushes Docker image
- Docker tags: `X.Y.Z`, `X.Y`, `X`, `latest`
- Images: `ghcr.io/ftmahringer/portfolio` + `ftmahringer/portfolio` (Docker Hub)
