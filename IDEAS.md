# Portfolio – Ideas & Future Improvements

A living document of ideas for future iterations.

---

## Content & Features

- ✅ **RSS feed** — `/feed.xml` for blog posts; useful for syndication and Hermes/OpenClaw subscriptions
- ✅ **Print / PDF resume** — Dedicated `/resume` route that renders a print-optimized view; download button triggers `window.print()`
- ✅ **Homelab page** — `/homelab` showcasing self-hosted services, hardware, and network topology diagrams
- ✅ **Skills page** — Radar chart or visual skill matrix grouped by category with self-assessed proficiency
- ✅ **Now page** — `/now` inspired by nownownow.com; what you're currently working on / reading / learning
- ✅ **Uses page** — `/uses` listing hardware, software, editor setup, and preferred tools
- **Recommendations / References** — Section on `/about` or separate page for testimonials and peer reviews

---

## Search & Discovery

- ✅ **Site-wide search** — Fuzzy search across projects, blog posts, and experience (e.g. using Fuse.js or Pagefind)
- ✅ **Tag-based filtering** — Unified tag system across blog + projects with tag index pages `/tags/[tag]`
- ✅ **Project status badges** — Visual indicators (Completed / WIP / Archived) with filter in project grid

---

## UX & Design

- **Animated page transitions** — Smooth route transitions using `framer-motion` `AnimatePresence`
- ✅ **Reading progress bar** — Thin bar at top of blog/experience detail pages
- ✅ **Table of contents** — Auto-generated from headings in long MDX pages (sticky sidebar on desktop)
- **Dark mode image variants** — Serve `/images/project-dark.png` when in dark mode using `<picture>` + `prefers-color-scheme`
- ✅ **Spotlight / command palette** — `Cmd+K` opens a searchable command palette (projects, pages, settings)
- **Confetti easter egg** — Hidden interaction (e.g., Konami code) that triggers a fun confetti animation

---

## Performance & SEO

- ✅ **OpenGraph images** — Dynamic OG image generation per-page using `next/og` with `ImageResponse`
- ✅ **Sitemap** — Auto-generated `sitemap.xml` from all routes and MDX content
- ✅ **JSON-LD structured data** — `Person`, `WebSite`, `SoftwareSourceCode` schemas on relevant pages
- ✅ **Image optimization pipeline** — Images auto-converted to WebP + resized on upload via `sharp`

---

## Automation & Integration

- ✅ **Hermes / OpenClaw integration** — Agents POST to `/api/content/projects` with frontmatter + body to auto-create MDX files; already partially specced
- **GitHub repo auto-import** — Agent reads GitHub API for pinned/starred repos, generates project MDX from README + topics + language stats
- **Blog auto-draft from notes** — Agent converts Obsidian/Logseq notes into blog post drafts via the content API
- **Notion CMS adapter** — Alternative content backend: sync Notion database pages into `content/` as MDX on build
- **Webhook on deploy** — Notify Discord/Telegram when a new deploy succeeds with a summary of changes

---

## Settings & Personalization

- **Language / i18n** — German + English toggle; content in `content/de/` and `content/en/`; detect browser language on first visit
- **Font family selector** — Let users pick between serif, sans-serif, and monospace for body text
- ✅ **Motion reduced mode** — Honour `prefers-reduced-motion` globally; toggle in accessibility settings (`SettingsDrawer` + `SettingsContext`)
- **Custom accent color per page** — Allow MDX frontmatter to specify an accent color override for that page

---

## Analytics & Engagement

- **Privacy-respecting analytics** — Self-hosted Plausible or Umami for page views / popular content
- **Comment system** — Giscus (GitHub Discussions-backed) comments on blog posts and project pages
- **View counter** — Simple Redis/KV-backed view counter per blog post (Vercel KV or Upstash)
- **"Sponsor me" / support links** — Ko-fi or GitHub Sponsors link in footer / settings

---

## Developer Experience

- **Storybook** — Component library documentation for all UI components
- **Playwright E2E tests** — Critical path tests: homepage loads, contact form submits, settings persist
- **Lighthouse CI** — Automated Lighthouse score checks on every PR
- **Content validation script** — Pre-commit hook that validates MDX frontmatter against TypeScript types

---

## Infrastructure

- ✅ **Edge caching for API routes** — Cache `/api/content/projects` (GET) with `Cache-Control` or Vercel Edge Config
- **Image CDN** — Move project/blog images to Cloudflare R2 or similar for better performance globally
- ✅ **Self-hosted deployment** — Dockerfile + docker-compose for running on a VPS/homelab; published to Docker Hub + GHCR

---

## Security & Auth

- ✅ **SSO / OIDC admin login** — Generic OIDC integration for admin login; works with PocketID, Authentik, and any standard OIDC provider (PKCE flow, see `docs/SSO.md`)
