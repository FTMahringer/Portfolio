# Portfolio Roadmap

> Last updated: 2026-05-03

## Current State ✅

The portfolio is fully built and deployed. **Phases 1-4 complete**.

**Stack:** Next.js 16, TypeScript, Tailwind CSS, MDX, SQLite + Drizzle ORM, Docker, Framer Motion

**Completed features:**
- All public pages: Home, About, Projects (grid/list/filter), Experience (expandable detail), Skills, Blog, Contact (form + email), Resume, Tags (`/tags/[tag]`)
- Content pages: Now (`/now`), Uses (`/uses`), Homelab (`/homelab`) — nownownow.com style pages
- Legal pages: Datenschutz (`/datenschutz`), Impressum (`/impressum`)
- RSS feed: `/feed.xml` with blog post syndication and `<link rel="alternate">` in layout
- Table of contents: Auto-generated from MDX headings, sticky sidebar on desktop, intersection observer for active state
- Admin dashboard (`/admin`): session + OIDC auth, content creation wizards (blog/project/experience), DB viewer, API docs, auth providers, tag management
- Tag system: centralized DB, color-coded pills, filter bars on /projects and /blog, CSV import/export, `config/initial-tags.csv` seed file
- Settings drawer: theme (dark/light/auto), accent color, **font family (serif/sans/mono)**, font size slider, reduced motion, project view (grid/list/card size), colorblind modes, **comments toggle** — saved in cookies, draggable panel
- **Page transitions**: Smooth route changes with framer-motion AnimatePresence, respects reduced motion
- **Comments**: Giscus (GitHub Discussions) on blog posts and project pages with theme sync and settings toggle
- Site-wide search: Cmd+K command palette + Fuse.js
- OpenGraph images (next/og), sitemap.xml, JSON-LD structured data
- Docker + GHCR/Docker Hub publishing, auto-release CI/CD on `package.json` version bump
- `config/site.yaml`: central config for name, title, contact links, social URLs, giscus settings

---

## Future Ideas

See `IDEAS.md` for additional feature ideas and enhancements.

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
