# Locale UI Cleanup and Language System — Design Spec

**Date:** 2026-07-26  
**Status:** Draft  
**Scope:** Refactor admin chrome and public settings UI, and add a locale-first translation system backed by nested YAML files.

---

## Problem

The portfolio UI has grown into several separate control surfaces:

- the admin toolbar is functional but visually flat and not organized like a CMS
- the current settings trigger on the public site is awkward and feels bolted on
- theme state is not applied consistently to every chrome element, especially the admin toolbar
- UI copy is still hardcoded across many pages and components
- there is no clean locale-based routing model for the full site

The next step is to make the UI feel more structured and to introduce a single language system that can cover the entire site without touching content bodies.

---

## Goals

1. **Cleaner admin chrome**
   - Keep the toolbar organized around a small number of top-level groups.
   - Use nested submenus for content types and related actions.
   - Separate `Tools` and `Settings` clearly.

2. **Better public settings trigger**
   - Replace the right-edge tab with a small cookie-style pill.
   - Open a modal/popup-style panel for public preferences.
   - Keep theme, accessibility, and language controls together.

3. **Theme consistency everywhere**
   - The selected theme must affect the admin toolbar, settings UI, and all app chrome.
   - Avoid hardcoded dark-only admin styling.

4. **Locale-first routing**
   - The canonical public URL should be `/en`.
   - `/` redirects to `/en`.
   - Locale is part of the route for the whole site, not just a client-side preference.

5. **Nested YAML language files**
   - Store UI translations in `config/lang/*.yaml`.
   - Keep the YAML nested and organized.
   - Flatten keys at runtime for lookup convenience.
   - Support short URL codes such as `en` while storing files as full locales such as `en_US.yaml`.

6. **Whole-site UI coverage**
   - Translate UI text across public pages, admin pages, settings pages, menus, labels, buttons, and modal copy.
   - Do **not** translate content bodies, blog/project markdown, or custom homepage stat values.

---

## Non-goals

- No translation of blog markdown, project markdown, or other content bodies.
- No translation of user-authored homepage stat values.
- No cookie banner implementation in this phase.
- No database migration for language files.
- No redesign of content editing itself beyond the menu and label surfaces.

---

## Phased Rollout

This work is split into two implementation phases.

### Phase 1 — UI cleanup

- restructure the admin toolbar menus
- replace the public settings edge tab with a cookie-style pill and popup
- make the theme application consistent across admin/public chrome
- prepare the settings UI for language controls

### Phase 2 — Locale system

- move the site to locale-based routing
- add nested YAML language packs
- add translation lookup helpers and provider/context plumbing
- add a language switcher that updates both URL and persistent preference
- translate the whole UI layer

---

## Recommended Architecture

### Top-level route model

Use the App Router with a locale segment at the top of the tree:

```text
src/app/[lang]/...
```

Examples:

- `/en`
- `/en/projects`
- `/en/settings/site`
- `/en/content`
- `/en/admin`

A root route should redirect `/` to `/en`.

Unsupported or malformed locales should fall back to the default locale and/or redirect cleanly to `/en`.

### Locale registry

Keep a small registry in code that maps short route codes to full locale file names, for example:

```ts
{ en: 'en_US', de: 'de_DE' }
```

This registry is used by:

- the router guard/redirect logic
- the translation loader
- the language switcher
- any locale-aware metadata helpers

### Translation loading

Language files live under:

```text
config/lang/
```

Examples:

```text
config/lang/en_US.yaml
config/lang/de_DE.yaml
```

The YAML should stay nested and readable. Example shape:

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

At runtime, the translation layer flattens nested keys into a dot-path map such as:

- `nav.projects`
- `settings.appearance.theme.label`
- `admin.toolbar.content.newProject`

This keeps the file structure organized while making lookup simple in code.

### Shared translation API

Introduce a shared translation service with:

- server-side loader for current locale
- flat dictionary cache per locale file
- `t(key)` / `translate(key)` helper for components
- client provider for interactive areas
- graceful fallback to English when a key is missing

The important rule is that components should not directly read YAML files.
They should consume a loader/helper so the storage format can evolve later.

---

## UI Structure

### Admin toolbar

Keep the toolbar to three main groups:

- `Content`
- `Tools`
- `Settings`

#### Content group

Organize content by type and action. Example structure:

- `Blog`
  - Show all
  - Create new
  - Tags, if relevant
- `Projects`
  - Show all
  - Create new
- `Experience`
  - Show all
  - Create new
- `Media`
- other content utilities only if they are genuinely part of content management

This should feel more like a CMS menu and less like a flat list of links.

#### Tools group

Administrative infrastructure goes here:

- Database
- Sessions
- Auth Providers
- API Docs
- Git Provider

#### Settings group

Site configuration belongs here:

- Site
- Integrations
- Features
- Homepage
- Language / localization controls
- appearance/accessibility settings where they belong in admin

### Public settings trigger

Replace the current right-edge handle with a small floating pill, similar to a cookie consent trigger.

Behavior:

- pinned to the bottom-right corner
- opens a modal/popup or drawer-style overlay
- contains theme, accessibility, and language controls
- closes on backdrop click or escape
- stays visually subtle but discoverable

### Theme consistency

The theme selector already exists in the public settings context. The redesign should ensure:

- the admin toolbar uses CSS variables instead of fixed dark colors
- light mode is visible everywhere, including admin chrome
- public settings popup and admin settings pages inherit the same theme state

The goal is to remove any component that assumes the UI is always dark.

---

## Locale Coverage Rules

### Translate

- navigation labels
- button labels
- section headings
- menu item labels
- settings page labels and hints
- modal titles and descriptions
- admin toolbar labels
- empty states and helper text

### Do not translate

- blog post content
- project content
- experience markdown/content
- homepage stat numeric values and custom labels entered by the user
- other author-written content that is already part of the portfolio data

### Edge cases

- editable labels that live in settings YAML are still configuration, not translation content
- translation files should cover the UI around those values, not replace them

---

## Persistence and Preference Rules

- The URL is the source of truth for the current locale.
- A cookie or local preference can remember the user’s choice.
- If the cookie and URL differ, navigation should resolve to the URL locale.
- The language switcher should update both:
  - the current route
  - the stored preference

This keeps shareable URLs and user preference aligned.

---

## Error Handling

- Missing locale segment: redirect to `/en`
- Unsupported locale segment: redirect to `/en`
- Missing translation file: fall back to English
- Missing translation key: fall back to English key or a clearly marked dev fallback
- Broken YAML: fail loudly in development and avoid crashing the entire app if a fallback locale is available

---

## Data Flow

1. Request hits `/` or `/<lang>/...`
2. Locale guard validates the short code
3. The translation loader resolves the matching full locale YAML file
4. The loader flattens nested keys into a lookup table
5. Layouts/providers expose `t()` to server and client components
6. Language switcher updates the route and preference
7. UI components render translated strings from the active locale

---

## Files and Structure

### Translation files

```text
config/lang/en_US.yaml
config/lang/de_DE.yaml
```

### Suggested code modules

```text
src/lib/i18n.ts
src/lib/locale-registry.ts
src/components/settings/SettingsDrawer.tsx
src/components/settings/LanguageSwitcher.tsx
src/components/admin/AdminToolbar.tsx
src/components/admin/AdminToolbarMenu.tsx
src/app/[lang]/...
```

The exact module names can shift, but the boundaries should remain:

- locale registry
- translation loader
- translation context/hook
- UI consumers

---

## Testing Plan

### Routing tests

- `/` redirects to `/en`
- invalid locale redirects to `/en`
- valid locale renders the localized app

### Translation loader tests

- nested YAML loads correctly
- flattening preserves dot-path keys
- fallback behavior returns English when needed

### UI tests

- admin toolbar menu groups render correctly
- public settings pill opens and closes the modal/popup
- theme changes affect admin chrome and public chrome
- language switching updates route and preference

### Coverage tests

- a representative public page
- a representative admin/settings page
- a content page
- a modal/popup surface

---

## Rollout Notes

This is a broad UI change, so it should be implemented in small steps:

1. menu and settings-shell cleanup
2. theme consistency fixes
3. locale routing skeleton and redirects
4. translation loader and language files
5. switch the remaining UI copy to translations
6. verify all major public/admin flows still work

A short project rule note should also be added to the repo docs so future changes remember:

- UI strings come from `config/lang`
- content bodies stay out of translation files
- new UI text should be added to the language files, not hardcoded

---

## Open Questions Resolved

- URL uses short code: yes
- language file uses full locale: yes
- canonical root locale: `/en`
- root path redirects to `/en`: yes
- nested YAML structure: yes
- flat runtime lookup: yes
- entire UI covered, but not content bodies: yes
