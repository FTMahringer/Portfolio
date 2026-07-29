# Locale UI Cleanup and Language System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the site locale-first with `/en` as the canonical public URL, reorganize the admin toolbar and public settings UI, and translate all UI text through nested YAML language files.

**Architecture:** Keep translation data in nested YAML files under `config/lang/`, flatten them at runtime into dot-path keys, and expose them through a shared translation loader plus locale-aware routing. Use the URL locale as the source of truth for public pages, while persisting the user preference so the language switcher can sync both the route and the cookie. Refactor the admin toolbar and public settings popup into smaller, structured pieces so the UI feels CMS-like and theme-aware everywhere.

**Tech Stack:** Next.js App Router, React, TypeScript, YAML (`js-yaml`), cookies, existing theme/settings context, existing admin toolbar components.

---

### Task 1: Build locale and translation foundations

**Files:**
- Modify: `Portfolio/AGENTS.md`
- Create: `Portfolio/config/lang/en_US.yaml`
- Create: `Portfolio/config/lang/de_DE.yaml`
- Create: `Portfolio/src/lib/locale-registry.ts`
- Create: `Portfolio/src/lib/i18n.ts`
- Create: `Portfolio/src/lib/flatten-translations.ts`

- [ ] **Step 1: Add the project rule for UI translations**

Update `Portfolio/AGENTS.md` with a short rule saying that all UI strings must come from `config/lang/*.yaml`, while content bodies, markdown, and custom stat values stay out of translation files.

- [ ] **Step 2: Seed the language files with nested structure**

Create `Portfolio/config/lang/en_US.yaml` and `Portfolio/config/lang/de_DE.yaml` with nested sections for the whole UI, for example:

```yaml
nav:
  projects: "Projects"
  blog: "Blog"
  about: "About"
  contact: "Contact"

settings:
  appearance:
    title: "Appearance"
    theme:
      label: "Theme"
      hint: "Color scheme"
```

Keep the files organized into sub-sections such as `nav`, `admin`, `settings`, `content`, `home`, `forms`, `errors`, `language`, `toolbar`, and `public_settings`.

- [ ] **Step 3: Add the locale registry and flattening helpers**

Create a registry that maps short URL codes to full locale file names:

```ts
export const LOCALES = {
  en: 'en_US',
  de: 'de_DE',
} as const;
```

Add a flatten helper that converts nested YAML objects into dot-path keys like `settings.appearance.theme.label`.

- [ ] **Step 4: Add the translation loader**

Create `Portfolio/src/lib/i18n.ts` with server-side helpers that:

- resolve a short locale code to a full locale file
- read the matching YAML file from `config/lang/`
- flatten nested keys into a lookup map
- fall back to `en_US.yaml` when a file or key is missing
- expose a simple `t(locale, key)` helper for server code

- [ ] **Step 5: Validate the loader and registry by inspection**

Run:

```bash
npm run lint
```

Expected: no new lint errors from the new helpers or YAML-related code.

- [ ] **Step 6: Commit**

```bash
git add AGENTS.md config/lang src/lib/locale-registry.ts src/lib/i18n.ts src/lib/flatten-translations.ts
git commit -m "feat(i18n): add locale translation foundation"
```

---

### Task 2: Make routing locale-first with `/en` as canonical

**Files:**
- Modify: `Portfolio/middleware.ts`
- Modify: `Portfolio/src/app/layout.tsx`
- Modify: `Portfolio/src/app/page.tsx`
- Create: `Portfolio/src/app/[lang]/layout.tsx`
- Move/modify: `Portfolio/src/app/about/page.tsx`
- Move/modify: `Portfolio/src/app/blog/page.tsx`
- Move/modify: `Portfolio/src/app/blog/[slug]/page.tsx`
- Move/modify: `Portfolio/src/app/contact/page.tsx`
- Move/modify: `Portfolio/src/app/datenschutz/page.tsx`
- Move/modify: `Portfolio/src/app/experience/page.tsx`
- Move/modify: `Portfolio/src/app/experience/[slug]/page.tsx`
- Move/modify: `Portfolio/src/app/homelab/page.tsx`
- Move/modify: `Portfolio/src/app/impressum/page.tsx`
- Move/modify: `Portfolio/src/app/now/page.tsx`
- Move/modify: `Portfolio/src/app/projects/page.tsx`
- Move/modify: `Portfolio/src/app/projects/[slug]/page.tsx`
- Move/modify: `Portfolio/src/app/resume/page.tsx`
- Move/modify: `Portfolio/src/app/settings/api-docs/page.tsx`
- Move/modify: `Portfolio/src/app/settings/auth-providers/page.tsx`
- Move/modify: `Portfolio/src/app/settings/db/page.tsx`
- Move/modify: `Portfolio/src/app/settings/features/page.tsx`
- Move/modify: `Portfolio/src/app/settings/git-provider/page.tsx`
- Move/modify: `Portfolio/src/app/settings/homepage/page.tsx`
- Move/modify: `Portfolio/src/app/settings/integrations/page.tsx`
- Move/modify: `Portfolio/src/app/settings/sessions/page.tsx`
- Move/modify: `Portfolio/src/app/settings/settings/page.tsx`
- Move/modify: `Portfolio/src/app/settings/site/page.tsx`
- Move/modify: `Portfolio/src/app/skills/page.tsx`
- Move/modify: `Portfolio/src/app/tags/page.tsx`
- Move/modify: `Portfolio/src/app/tags/[tag]/page.tsx`
- Move/modify: `Portfolio/src/app/testimonials/page.tsx`
- Move/modify: `Portfolio/src/app/timeline/page.tsx`
- Move/modify: `Portfolio/src/app/uses/page.tsx`
- Move/modify: `Portfolio/src/app/admin/page.tsx`
- Move/modify: `Portfolio/src/app/admin/layout.tsx`
- Move/modify: `Portfolio/src/app/content/layout.tsx`
- Move/modify: `Portfolio/src/app/content/page.tsx`
- Move/modify: `Portfolio/src/app/content/media/page.tsx`
- Move/modify: `Portfolio/src/app/content/new/[type]/page.tsx`
- Move/modify: `Portfolio/src/app/content/edit/[type]/[slug]/page.tsx`
- Move/modify: `Portfolio/src/app/content/tags/page.tsx`

- [ ] **Step 1: Make `/` redirect to `/en`**

Update `Portfolio/src/app/page.tsx` so the root route is only a redirect entrypoint. The canonical public home must become `/en`.

Example behavior:

```ts
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/en');
}
```

- [ ] **Step 2: Add locale validation in middleware**

Update `Portfolio/middleware.ts` so public routes validate the locale segment and redirect invalid or missing locales to `/en`. Keep the existing admin middleware behavior intact.

- [ ] **Step 3: Add a locale-aware layout**

Create `Portfolio/src/app/[lang]/layout.tsx` to load the active locale, provide translated strings to the tree, and keep the selected language synchronized for nested routes.

- [ ] **Step 4: Move the app routes under the locale segment**

Recreate the existing route structure under `src/app/[lang]/...` so public pages, admin pages, content pages, settings pages, and detail pages all live beneath the locale segment.

- [ ] **Step 5: Keep metadata and canonical URLs aligned**

Update the affected route files so metadata generation, canonical URLs, and locale-aware paths all use the short language code from the URL.

- [ ] **Step 6: Validate the redirect behavior**

Run:

```bash
npm run build
```

Expected:
- `/` redirects to `/en`
- `/<unsupported>` redirects to `/en`
- localized routes build successfully

- [ ] **Step 7: Commit**

```bash
git add middleware.ts src/app src/lib config/lang
git commit -m "feat(routing): add locale-first app routes"
```

---

### Task 3: Refactor the admin toolbar into structured menu groups

**Files:**
- Modify: `Portfolio/src/config/admin-menu.ts`
- Modify: `Portfolio/src/components/admin/AdminToolbar.tsx`
- Modify: `Portfolio/src/components/admin/AdminToolbarMenu.tsx`
- Modify: `Portfolio/src/app/settings/layout.tsx`
- Create: `Portfolio/src/components/admin/AdminMenuGroup.tsx`
- Create: `Portfolio/src/components/admin/AdminMenuSection.tsx`

- [ ] **Step 1: Rework the menu model**

Update the menu config so the toolbar explicitly supports grouped submenus for content types and actions, while keeping the top-level items limited to `Content`, `Tools`, and `Settings`.

Suggested shape:

```ts
export interface AdminMenuItem {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  children?: AdminMenuItem[];
  external?: boolean;
  featureKey?: ContentFeatureKey;
  section?: string;
}
```

- [ ] **Step 2: Split content into nested categories**

Organize `Content` so it can show sections such as:

- Blog: show all, create new, tags
- Projects: show all, create new
- Experience: show all, create new
- Media / utilities

Only include actions that are actually useful; do not overfill the menu.

- [ ] **Step 3: Separate tools from settings**

Keep the current tools links under `Tools`, and keep configuration links under `Settings`. Do not bundle public settings with tools.

- [ ] **Step 4: Make the toolbar theme-aware**

Replace hardcoded dark-only toolbar styling with CSS-variable-based colors so light mode actually changes the toolbar appearance too.

- [ ] **Step 5: Update the settings side navigation**

Ensure `Portfolio/src/app/settings/layout.tsx` reflects the cleaner settings structure and the future language section.

- [ ] **Step 6: Validate the menu hierarchy**

Run:

```bash
npm run lint
```

Expected: no TypeScript or ESLint errors in the toolbar/menu files.

- [ ] **Step 7: Commit**

```bash
git add src/config/admin-menu.ts src/components/admin src/app/settings/layout.tsx
git commit -m "refactor(admin): organize toolbar menus"
```

---

### Task 4: Replace the public settings tab with a popup-style pill

**Files:**
- Modify: `Portfolio/src/components/settings/SettingsDrawer.tsx`
- Create: `Portfolio/src/components/settings/PublicSettingsTrigger.tsx`
- Create: `Portfolio/src/components/settings/PublicSettingsPanel.tsx`
- Create: `Portfolio/src/components/settings/PublicSettingsSection.tsx`
- Modify: `Portfolio/src/app/layout.tsx`
- Modify: `Portfolio/src/components/layout/Header.tsx`
- Modify: `Portfolio/src/components/layout/Footer.tsx`
- Modify: `Portfolio/src/components/admin/AdminToolbar.tsx`

- [ ] **Step 1: Split the big settings drawer into smaller pieces**

Extract the current public settings UI into a small trigger component and a popup/panel component so the drawer logic is easier to maintain.

- [ ] **Step 2: Change the trigger to a cookie-style pill**

Render the trigger as a floating pill near the bottom-right corner instead of a vertical right-edge tab.

- [ ] **Step 3: Keep the popup modal-like**

Use backdrop closing, escape handling, and a focused panel so it feels closer to a cookie consent widget than a permanent sidebar.

- [ ] **Step 4: Make theme styles flow everywhere**

Update the shell components that still rely on fixed dark visuals so the selected theme affects:

- the public settings trigger
- the popup panel
- the admin toolbar
- any chrome that currently assumes dark mode

- [ ] **Step 5: Validate the visual shell behavior**

Run:

```bash
npm run build
```

Expected: the app still builds with the new popup shell and no new styling-related errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/settings src/app/layout.tsx src/components/layout/Header.tsx src/components/layout/Footer.tsx src/components/admin/AdminToolbar.tsx
git commit -m "feat(ui): redesign public settings trigger"
```

---

### Task 5: Add language switching and locale sync

**Files:**
- Create: `Portfolio/src/components/settings/LanguageSwitcher.tsx`
- Modify: `Portfolio/src/components/settings/PublicSettingsPanel.tsx`
- Modify: `Portfolio/src/context/SettingsContext.tsx`
- Modify: `Portfolio/src/lib/i18n.ts`
- Create: `Portfolio/src/lib/locale-routing.ts`

- [ ] **Step 1: Add a locale switcher component**

Create a language selector that changes the current URL locale and persists the selected preference.

Behavior:

- switching to `en` sends the user to `/en/...`
- the cookie updates to match the chosen language
- the switcher can live inside the public settings popup and anywhere else appropriate later

- [ ] **Step 2: Add locale routing helpers**

Create helpers that can:

- read the short locale code from the current path
- map `en` to `en_US`
- map any future route locale to its corresponding file locale
- build the next localized URL when the user changes language

- [ ] **Step 3: Sync cookie and route state**

Update the settings context so the selected locale persists, but the current URL always wins when the user is explicitly navigating to a locale.

- [ ] **Step 4: Validate the switching flow**

Run:

```bash
npm run lint
```

Expected: the switcher and locale helpers type-check and lint cleanly.

- [ ] **Step 5: Commit**

```bash
git add src/components/settings src/context/SettingsContext.tsx src/lib/i18n.ts src/lib/locale-routing.ts
git commit -m "feat(i18n): add language switching"
```

---

### Task 6: Translate the UI layer and keep content untouched

**Files:**
- Modify: `Portfolio/src/app/layout.tsx`
- Modify: `Portfolio/src/components/layout/Header.tsx`
- Modify: `Portfolio/src/components/layout/Footer.tsx`
- Modify: `Portfolio/src/components/admin/AdminToolbar.tsx`
- Modify: `Portfolio/src/components/admin/AdminToolbarMenu.tsx`
- Modify: `Portfolio/src/components/settings/SettingsDrawer.tsx`
- Modify: `Portfolio/src/components/settings/PublicSettingsPanel.tsx`
- Modify: `Portfolio/src/components/settings/LanguageSwitcher.tsx`
- Modify: all localized route files under `Portfolio/src/app/[lang]/...`

- [ ] **Step 1: Translate the shared chrome first**

Replace hardcoded labels in the header, footer, admin toolbar, and settings shell with keys from the translation loader.

- [ ] **Step 2: Translate settings and admin pages**

Move the visible text in admin/settings screens to translation keys, but keep the underlying field names and payloads unchanged.

- [ ] **Step 3: Translate the main public pages**

Update the localized route pages so page titles, section headings, button labels, empty states, and helper copy come from the translation files.

- [ ] **Step 4: Leave authored content alone**

Do not touch blog content, project markdown, experience content, or homepage stat values. These stay user-authored and non-translated.

- [ ] **Step 5: Validate the full site**

Run:

```bash
npm run build
```

Expected:
- the UI renders from translation keys
- content bodies remain unchanged
- locale routing and popup/theme changes still work together

- [ ] **Step 6: Commit**

```bash
git add src/app src/components src/lib config/lang
git commit -m "feat(i18n): translate site ui"
```

---

### Task 7: Final docs, review, and cleanup

**Files:**
- Modify: `Portfolio/README.md` if the project uses it for user-facing setup notes
- Modify: `Portfolio/AGENTS.md` if the rule needs a stronger reminder
- Modify: `Portfolio/docs/superpowers/specs/2026-07-26-locale-ui-cleanup-design.md` only if implementation revealed a required spec correction

- [ ] **Step 1: Add a short maintainer note**

Document that all new UI text should go into `config/lang/*.yaml`, and that content bodies/homepage stats are not part of the translation layer.

- [ ] **Step 2: Re-run validation**

Run:

```bash
npm run lint
npm run build
```

Expected: both pass, with the existing Turbopack filesystem warnings still acceptable if they are unchanged.

- [ ] **Step 3: Commit the docs cleanup**

```bash
git add README.md AGENTS.md docs/superpowers/specs/2026-07-26-locale-ui-cleanup-design.md
git commit -m "docs: record locale ui rules"
```

---

## Self-Review Checklist

- [ ] Every spec requirement maps to at least one task
- [ ] No task contains placeholders like TBD or TODO
- [ ] Locale routing is explicitly covered with `/` -> `/en`
- [ ] Nested YAML files are explicitly covered
- [ ] Flat runtime translation lookup is explicitly covered
- [ ] Content bodies and homepage stat values are explicitly excluded from translation
- [ ] Admin toolbar cleanup and public settings popup are separated into focused tasks
- [ ] Theme consistency is called out where it matters
- [ ] Docs/rules update is included so future UI work stays aligned
