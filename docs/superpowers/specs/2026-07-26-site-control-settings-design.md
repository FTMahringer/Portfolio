# Site Control Settings — Design Spec

**Date:** 2026-07-26  
**Status:** Approved  
**Scope:** Add YAML-backed, DB-ready admin settings for site identity, integrations, feature visibility, and homepage showcase stats.

---

## Problem

The portfolio has several settings in `config/site.yaml`, but many important presentation and feature decisions are still hardcoded in routes/components. The admin should be able to control what the portfolio shows without editing code or YAML manually.

Needed controls:

- edit main `site`, `social`, and `sidebar_skills` config from settings UI
- edit integrations such as contact, comments, and analytics from settings UI
- disable major features such as projects, blog, and experience everywhere they appear
- hide disabled features from public UI, admin create/edit flows, pickers, search, tags, and related-content selectors
- manage homepage showcase/stat numbers through settings, including sortable computed and manual entries

Settings should use YAML for now but be structured so storage can later move to SQLite without rewriting UI and routes.

---

## Goals

1. **YAML now, DB-ready later**
   - Continue storing settings in `config/site.yaml` initially.
   - Add a service layer so callers do not directly couple to YAML storage.

2. **Admin settings pages**
   - Add dedicated settings pages for site identity, integrations, feature flags, and homepage stats.

3. **Feature gating**
   - Disabled features should disappear from public navigation, homepage sections, content manager create flows, search, tags, and relationship pickers.
   - Disabled public routes should return `notFound()` where appropriate.

4. **Homepage stats editor**
   - Existing stats remain available as computed entries.
   - New manual stat entries can be added without code/YAML editing.
   - Stats can be enabled/disabled and reordered.

5. **Stable route/API contract**
   - UI talks to admin API routes.
   - API routes talk to the settings service.
   - Later DB migration should keep the route contract mostly unchanged.

---

## Non-goals

- No immediate SQLite migration.
- No visual page builder.
- No arbitrary route editor.
- No authentication redesign.
- No full redesign of the existing settings UI.

---

## Storage Model

Settings continue to live in:

```text
config/site.yaml
```

All application code should read through:

```text
src/lib/site-settings.ts
```

This service owns:

- default settings
- YAML parsing/writing
- normalization/merge behavior
- feature helpers
- cache invalidation after save

Later, this file can become an adapter over a DB-backed implementation while keeping function names stable.

---

## YAML Shape

Extend `config/site.yaml` with:

```yaml
features:
  projects:
    enabled: true
    label: "Projects"
    route: "/projects"
    showInNavigation: true
    showInContentManager: true
    showOnHomepage: true
  blog:
    enabled: true
    label: "Blog"
    route: "/blog"
    showInNavigation: true
    showInContentManager: true
    showOnHomepage: true
  experience:
    enabled: true
    label: "Experience"
    route: "/experience"
    showInNavigation: true
    showInContentManager: true
    showOnHomepage: true
    showInProjectRelations: true

homepage:
  stats:
    enabled: true
    items:
      - id: "years-experience"
        label: "Years Experience"
        source: "computed"
        computedKey: "yearsOfExperience"
        suffix: "+"
        enabled: true
      - id: "projects"
        label: "Projects"
        source: "computed"
        computedKey: "totalProjects"
        suffix: "+"
        enabled: true
      - id: "blog-posts"
        label: "Blog Posts"
        source: "computed"
        computedKey: "totalBlogPosts"
        suffix: "+"
        enabled: true
```

Manual stat entries use:

```yaml
      - id: "custom-open-source"
        label: "Open Source PRs"
        source: "manual"
        value: 12
        suffix: "+"
        enabled: true
```

---

## Settings Pages

### `/settings/site`

Controls:

- `site.title`
- `site.tagline`
- `site.url`
- `site.email`
- `site.location`
- `site.avatar`
- `site.bio`
- `social.github`
- `social.linkedin`
- `social.twitter`
- `social.instagram`
- `social.youtube`
- `social.email`
- `sidebar_skills` categories and comma-separated items

### `/settings/integrations`

Controls:

- `contact.resend_from`
- `contact.to`
- all `giscus` fields
- `analytics.provider`
- `analytics.umami.*`
- `analytics.plausible.*`

### `/settings/features`

Controls per feature:

- enabled
- label
- route
- show in navigation
- show in content manager
- show on homepage
- for experience: show in project relation picker

### `/settings/homepage`

Controls:

- homepage stats enabled
- stat items enabled
- stat label
- stat suffix
- stat source: computed/manual
- computed key for computed items
- manual value for manual items
- add stat item
- remove stat item
- move stat item up/down

---

## API Design

Use admin-only route handlers:

```text
GET /api/admin/site-settings
PUT /api/admin/site-settings
```

Payload shape:

```ts
interface SiteSettingsPayload {
  settings: SiteSettings;
}
```

`PUT` accepts the full settings object for now. The server normalizes/merges it with defaults before writing YAML.

---

## Feature Gating Rules

### Public pages

If disabled:

- `/projects` and `/projects/[slug]` return `notFound()` when projects are disabled.
- `/blog` and `/blog/[slug]` return `notFound()` when blog is disabled.
- `/experience` and `/experience/[slug]` return `notFound()` when experience is disabled.

### Homepage

- Featured projects section renders only when `features.projects.enabled && features.projects.showOnHomepage`.
- Latest posts section renders only when `features.blog.enabled && features.blog.showOnHomepage`.
- Stats section renders only when `homepage.stats.enabled` and has at least one enabled stat item.

### Navigation

Public navigation should hide disabled features or features where `showInNavigation` is false.

### Admin/content

- Content dashboard excludes disabled content types when `showInContentManager` is false or `enabled` is false.
- Create-new menus hide disabled types.
- `/content/new/[type]` and `/content/edit/[type]/[slug]` reject disabled types with `notFound()`.
- Experience relation selector inside project editor is hidden when experience is disabled or `showInProjectRelations` is false.

### Search and tags

- Search index excludes disabled content types.
- Tag usage and tag links should not expose disabled content types.

---

## Homepage Stats Rendering

Use existing computed stats from `src/lib/stats.ts` for:

- `yearsOfExperience`
- `totalProjects`
- `totalBlogPosts`

Add a new resolver:

```ts
resolveHomepageStats(settings, computedStats)
```

It returns sorted enabled display items:

```ts
Array<{
  id: string;
  label: string;
  value: number | string;
  suffix: string;
}>
```

Manual stat items use `value`. Computed stat items use `computedKey`.

---

## DB Migration Path

The service layer is the migration seam.

Current implementation:

```text
UI -> API route -> site-settings service -> YAML
```

Future implementation:

```text
UI -> API route -> site-settings service -> SQLite
```

The API payload and UI components should stay mostly unchanged during migration.

---

## Implementation Phases

### Phase 1: Settings service and API

- Add normalized settings types/defaults.
- Add YAML read/write service.
- Add admin API route.
- Extend `config/site.yaml` with defaults.

### Phase 2: Admin settings pages

- Add `/settings/site`.
- Add `/settings/integrations`.
- Add `/settings/features`.
- Add `/settings/homepage`.
- Update settings navigation.

### Phase 3: Feature gating

- Gate public routes.
- Gate homepage sections.
- Gate admin content dashboard and create/edit routes.
- Gate project experience picker.
- Gate search/tag exposure.

### Phase 4: Homepage stats

- Render homepage stats from settings.
- Support computed and manual entries.
- Support sorting through move up/down controls.

---

## Success Criteria

- Admin can edit site identity/social/sidebar skills without touching YAML manually.
- Admin can edit comments/contact/analytics settings without touching YAML manually.
- Admin can disable projects/blog/experience and those features disappear from relevant public/admin UI.
- Admin can change homepage stat items, add manual stat entries, and reorder stats.
- Settings persist to `config/site.yaml`.
- The app reads through the settings service so future DB migration has one clear seam.
- Lint and production build pass.
