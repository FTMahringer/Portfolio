# Site Control Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add YAML-backed, DB-ready admin controls for portfolio site identity, integrations, feature visibility, and homepage showcase stats.

**Architecture:** Add a `src/lib/site-settings.ts` service as the storage seam. Admin pages talk to `/api/admin/site-settings`, which reads/writes YAML through that service. Public/admin UI reads normalized settings through helper functions so YAML can later be swapped for SQLite.

**Tech Stack:** Next.js App Router route handlers/pages, React client settings forms, TypeScript, `js-yaml`, filesystem-backed `config/site.yaml`.

---

## File Structure

```text
config/site.yaml                                      Extend with features/homepage defaults
src/lib/config.ts                                     Re-export settings-backed config compatibility
src/lib/site-settings.ts                              New settings service, defaults, YAML adapter, helpers
src/lib/homepage-stats.ts                             Resolve computed/manual homepage stat items
src/app/api/admin/site-settings/route.ts              Admin GET/PUT settings API
src/app/settings/layout.tsx                           Add settings navigation links
src/app/settings/site/page.tsx                        Site/social/sidebar skills editor
src/app/settings/integrations/page.tsx                Contact/comments/analytics editor
src/app/settings/features/page.tsx                    Feature visibility editor
src/app/settings/homepage/page.tsx                    Homepage stats editor
src/components/home/PortfolioStats.tsx                Accept resolved stat items
src/app/page.tsx                                      Gate sections and use stats config
src/app/projects/page.tsx                             Gate projects index
src/app/projects/[slug]/page.tsx                      Gate project details and relations
src/app/blog/page.tsx                                 Gate blog index
src/app/blog/[slug]/page.tsx                          Gate blog details
src/app/experience/page.tsx                           Gate experience index
src/app/experience/[slug]/page.tsx                    Gate experience details
src/app/content/page.tsx                              Hide disabled content types
src/app/content/new/[type]/page.tsx                   Reject disabled create types
src/app/content/edit/[type]/[slug]/page.tsx           Reject disabled edit types
src/components/admin/ContentEditor.tsx                Hide experience relation picker when disabled
src/components/admin/AdminToolbarMenu.tsx             Hide disabled create links
src/app/api/search/index/route.ts                     Exclude disabled content types
src/app/content/tags/TagsManager.tsx                  Avoid links for disabled content types
```

---

### Task 1: Add settings service and YAML defaults

**Files:**
- Modify: `config/site.yaml`
- Create: `src/lib/site-settings.ts`
- Modify: `src/lib/config.ts`

- [ ] Add `features` and `homepage.stats` defaults to `config/site.yaml`.
- [ ] Create `src/lib/site-settings.ts` with `SiteSettings`, defaults, `getSiteSettings()`, `saveSiteSettings()`, `isFeatureEnabled()`, `shouldShowFeatureInContentManager()`, and `shouldShowExperienceRelations()`.
- [ ] Update `src/lib/config.ts` to call `getSiteSettings()` so existing imports keep working.

---

### Task 2: Add admin settings API

**Files:**
- Create: `src/app/api/admin/site-settings/route.ts`

- [ ] Add authenticated `GET` returning `{ settings }`.
- [ ] Add authenticated `PUT` accepting `{ settings }`, saving normalized YAML, and returning `{ settings }`.
- [ ] Return structured JSON errors for invalid payloads or write failures.

---

### Task 3: Add reusable settings form helpers

**Files:**
- Create: `src/app/settings/_components/SettingsFormShell.tsx`
- Create: `src/app/settings/_components/settings-form-utils.ts`

- [ ] Add shared card/field/buttons UI matching existing settings styling.
- [ ] Add helpers for string-list parsing and nested immutable updates.

---

### Task 4: Add site identity settings page

**Files:**
- Create: `src/app/settings/site/page.tsx`
- Modify: `src/app/settings/layout.tsx`

- [ ] Add `/settings/site` nav link.
- [ ] Fetch settings from `/api/admin/site-settings`.
- [ ] Edit `site`, `social`, and `sidebar_skills`.
- [ ] Save via `PUT /api/admin/site-settings`.

---

### Task 5: Add integrations settings page

**Files:**
- Create: `src/app/settings/integrations/page.tsx`
- Modify: `src/app/settings/layout.tsx`

- [ ] Add `/settings/integrations` nav link.
- [ ] Edit `contact`, `giscus`, and `analytics`.
- [ ] Save through the shared settings API.

---

### Task 6: Add feature settings page

**Files:**
- Create: `src/app/settings/features/page.tsx`
- Modify: `src/app/settings/layout.tsx`

- [ ] Add `/settings/features` nav link.
- [ ] Edit projects/blog/experience enabled flags and visibility flags.
- [ ] Save through the shared settings API.

---

### Task 7: Add homepage stats settings page

**Files:**
- Create: `src/app/settings/homepage/page.tsx`
- Create: `src/lib/homepage-stats.ts`
- Modify: `src/app/settings/layout.tsx`

- [ ] Add `/settings/homepage` nav link.
- [ ] Add stats enabled toggle.
- [ ] Add stat item add/remove/up/down controls.
- [ ] Support computed keys `yearsOfExperience`, `totalProjects`, `totalBlogPosts`.
- [ ] Support manual value entries.

---

### Task 8: Render homepage stats and gate homepage sections

**Files:**
- Modify: `src/components/home/PortfolioStats.tsx`
- Modify: `src/app/page.tsx`

- [ ] Resolve stats from `homepage.stats.items`.
- [ ] Render enabled stats in configured order.
- [ ] Hide featured projects when projects are disabled or hidden from homepage.
- [ ] Hide latest posts when blog is disabled or hidden from homepage.

---

### Task 9: Gate public routes and navigation

**Files:**
- Modify: `src/app/projects/page.tsx`
- Modify: `src/app/projects/[slug]/page.tsx`
- Modify: `src/app/blog/page.tsx`
- Modify: `src/app/blog/[slug]/page.tsx`
- Modify: `src/app/experience/page.tsx`
- Modify: `src/app/experience/[slug]/page.tsx`
- Modify navigation components discovered during implementation

- [ ] Return `notFound()` from disabled public index/detail routes.
- [ ] Hide disabled feature links from public navigation components.

---

### Task 10: Gate admin content flows and related pickers

**Files:**
- Modify: `src/app/content/page.tsx`
- Modify: `src/app/content/new/[type]/page.tsx`
- Modify: `src/app/content/edit/[type]/[slug]/page.tsx`
- Modify: `src/components/admin/ContentEditor.tsx`
- Modify: `src/components/admin/AdminToolbarMenu.tsx`

- [ ] Hide disabled content types from content list and create menus.
- [ ] Reject disabled create/edit URLs with `notFound()`.
- [ ] Hide project experience picker when experience relations are disabled.

---

### Task 11: Gate search and tags

**Files:**
- Modify: `src/app/api/search/index/route.ts`
- Modify: `src/app/content/tags/TagsManager.tsx`
- Modify tag pages/routes discovered during implementation

- [ ] Exclude disabled content types from search index.
- [ ] Avoid public links to disabled content types from tag usage UI.

---

### Task 12: Validate and prepare PR

**Files:**
- No expected source changes unless validation finds issues.

- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Manually test settings pages.
- [ ] Manually test disabling projects, blog, and experience.
- [ ] Commit logical changes on `feat/site-control-settings`.
- [ ] Push branch and prepare PR instructions or create PR if Forgejo tooling is available.

---

## Self-review

- Spec coverage: Covers YAML service, DB migration seam, settings pages, feature gating, homepage stats, search/tag/admin/public behavior, validation, and PR prep.
- Placeholder scan: No unresolved placeholder sections.
- Type consistency: Uses `SiteSettings`, `features`, and `homepage.stats` consistently with the spec.
