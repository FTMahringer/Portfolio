# Slug, Title, and Project Safety Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Auto-generate valid project slugs from titles, warn on unsupported title characters, and prevent project pages from crashing when old content is missing array frontmatter.

**Architecture:** Keep editor-specific title/slug behavior in `src/lib/content-editor.ts` and `src/components/admin/ContentEditor.tsx`. Normalize parsed frontmatter in `src/lib/mdx.ts` so old content is safe everywhere, then add defensive fallbacks in the project views as a second line of protection. Investigate the gray-out separately in the settings layer so any persisted color mode state cannot unexpectedly dim the whole site.

**Tech Stack:** Next.js app router, React client components, TypeScript, gray-matter-backed MDX frontmatter, existing settings context and CSS variable theme system.

---

### Task 1: Add title validation and slug derivation for new projects

**Files:**
- Modify: `src/lib/content-editor.ts`
- Modify: `src/components/admin/ContentEditor.tsx`

- [ ] **Step 1: Write the failing behavior check by reasoning through the current editor flow**

Create a quick local repro in create mode:
1. Open `/content/new/project`.
2. Type only `My Project` in the title field.
3. Confirm the slug stays empty today.
4. Type `Project-Test #1` and note that the current slug does not match the desired underscore-only separator behavior.

Expected after the fix:
- title input keeps only allowed characters
- a warning appears when unsupported characters are entered
- slug auto-fills to a normalized value while creating

- [ ] **Step 2: Add helper functions for title sanitation and slug generation**

In `src/lib/content-editor.ts`, add helpers like:

```ts
const TITLE_ALLOWED_CHARS = /[^a-zA-Z0-9 _#-]/g;

export function sanitizeProjectTitle(value: string): string {
  return value.replace(TITLE_ALLOWED_CHARS, '');
}

export function hasDisallowedProjectTitleChars(value: string): boolean {
  return TITLE_ALLOWED_CHARS.test(value);
}

export function slugFromProjectTitle(value: string): string {
  return sanitizeProjectTitle(value)
    .toLowerCase()
    .replace(/[\s_-]+/g, '_')
    .replace(/[^a-z0-9_#]/g, '')
    .replace(/^_+|_+$/g, '');
}
```

- [ ] **Step 3: Wire the helpers into the create editor**

In `src/components/admin/ContentEditor.tsx`, add a small create-mode state flag so the slug keeps following the title until the slug field is edited manually.

Example shape:

```ts
const [slugTouched, setSlugTouched] = useState(false);

function handleTitleChange(raw: string) {
  const title = sanitizeProjectTitle(raw);
  setField('title', title);

  if (mode === 'create' && !slugTouched) {
    setField('slug', slugFromProjectTitle(title));
  }
}
```

Also add a live warning under the title field:

```ts
const titleHasWarnings = hasDisallowedProjectTitleChars(String(form.title ?? ''));
const titleWarning = 'Only these characters are allowed: a-z, A-Z, 0-9, space, -, _, #';
```

- [ ] **Step 4: Make the slug field stop auto-syncing once the user edits it**

Use the slug input `onChange` to mark the slug as user-controlled:

```ts
onChange={(event) => {
  setSlugTouched(true);
  setField('slug', event.target.value.toLowerCase().replace(/[\s_-]+/g, '_').replace(/[^a-z0-9_#]/g, ''));
}}
```

- [ ] **Step 5: Validate the manual repro**

Re-test `/content/new/project`:
- typing `My Project` should fill the slug automatically
- `Project-Test #1` should normalize to `project_test_#1`
- entering `Project@Test` should show the warning and remove `@`
- manually editing the slug should stop further title-driven syncing

---

### Task 2: Normalize parsed frontmatter so old projects do not crash pages

**Files:**
- Modify: `src/lib/mdx.ts`
- Modify: `src/lib/types.ts` only if the current type definitions need to reflect optional raw frontmatter inputs

- [ ] **Step 1: Write the failing repro for missing arrays**

Use the existing project that crashes on `/projects/[slug]` and confirm the current error comes from:

```tsx
frontmatter.stack.map(tech => (
```

and the project card crash comes from:

```tsx
frontmatter.stack.slice(0, 4).map(tech => (
```

- [ ] **Step 2: Add normalization helpers to the MDX parser layer**

In `src/lib/mdx.ts`, add a small coercion helper so all project and experience frontmatter comes out with stable array fields:

```ts
function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}
```

Then normalize parsed objects before returning them:

```ts
function normalizeProject(frontmatter: ProjectFrontmatter): ProjectFrontmatter {
  return {
    ...frontmatter,
    stack: asStringArray(frontmatter.stack),
    tags: asStringArray(frontmatter.tags),
    images: asStringArray(frontmatter.images),
    relatedExperience: asStringArray(frontmatter.relatedExperience),
    github: frontmatter.github ?? null,
    demo: frontmatter.demo ?? null,
    image: frontmatter.image ?? null,
    endDate: frontmatter.endDate ?? null,
  };
}
```

Do the same for experiences so `stack`, `images`, `relatedProjects`, and `highlights` are safe arrays.

- [ ] **Step 3: Confirm the parser returns stable types**

Ensure `getAllProjects()`, `getProjectBySlug()`, `getAllExperience()`, and `getExperienceBySlug()` all return normalized objects so downstream components no longer need to guess.

- [ ] **Step 4: Re-run the crashing project pages**

Open:
- `/projects`
- `/projects/newtest`

Expected:
- no `map` or `slice` runtime errors
- projects with missing `stack` render without crashing
- the gallery falls back cleanly when `images` is empty

---

### Task 3: Add defensive rendering in the project UI

**Files:**
- Modify: `src/components/projects/ProjectCard.tsx`
- Modify: `src/app/projects/[slug]/page.tsx`

- [ ] **Step 1: Patch the project card to avoid direct array assumptions**

Update the stack section to use a local array fallback:

```tsx
const stack = project.frontmatter.stack ?? [];

{stack.slice(0, 4).map((tech) => (
  <Badge key={tech}>{tech}</Badge>
))}
```

- [ ] **Step 2: Patch the detail page to avoid direct array assumptions**

In `src/app/projects/[slug]/page.tsx`, use defensive locals for every array-like field:

```tsx
const stack = frontmatter.stack ?? [];
const relatedExperience = (frontmatter.relatedExperience ?? [])
  .map((slug) => getExperienceBySlug(slug))
  .filter(Boolean);
const gallery = (frontmatter.images ?? []).length > 0
  ? (frontmatter.images ?? [])
  : frontmatter.image ? [frontmatter.image] : [];
```

Then render from those locals instead of the raw frontmatter properties.

- [ ] **Step 3: Verify the project pages again**

Reload the failing pages after the parser fix and confirm there are no crashes even if one project file is still missing `stack` or `images`.

---

### Task 4: Investigate and remove the unexpected gray-out

**Files:**
- Modify: `src/context/SettingsContext.tsx`
- Modify: `src/components/settings/SettingsDrawer.tsx`
- Modify: `src/app/globals.css` only if the dimming is coming from a CSS filter or theme override

- [ ] **Step 1: Check for a persisted colorblind mode**

Confirm whether the site is loading with `data-colorblind="deuteranopia"`, `protanopia`, `tritanopia`, or `high-contrast` on `<html>`.

Expected safe state:

```ts
root.removeAttribute('data-colorblind');
```

when `settings.colorBlindMode === 'none'`.

- [ ] **Step 2: Harden settings hydration against stale cookie values**

In `src/context/SettingsContext.tsx`, sanitize the saved cookie before applying it:

```ts
const VALID_COLOR_BLIND_MODES = new Set(['none', 'deuteranopia', 'protanopia', 'tritanopia', 'high-contrast'] as const);
```

Then coerce invalid values back to `none` before `setSettings` runs.

- [ ] **Step 3: Surface the active mode in the drawer**

If the gray look is actually user-selected, make the active state obvious in `src/components/settings/SettingsDrawer.tsx` so it is clear that the setting is intentional and not a bug.

- [ ] **Step 4: Verify the homepage contrast**

Reload `/` with settings reset to `none` and confirm the page is no longer dimmed or filtered.

---

### Task 5: Run validation and capture the result

**Files:**
- None

- [ ] **Step 1: Run lint**

Run: `npm run lint`

Expected: pass with no parsing errors.

- [ ] **Step 2: Run production build**

Run: `npm run build`

Expected:
- build succeeds
- the project crash pages no longer throw runtime errors
- only the existing Turbopack filesystem warnings remain

- [ ] **Step 3: Manual smoke test**

Check these routes in the browser:
- `/content/new/project`
- `/projects`
- `/projects/newtest`
- `/`

Expected:
- title warning appears for unsupported characters
- slug auto-fills from title
- no project page crashes from missing arrays
- the site is not unexpectedly gray unless a colorblind mode is explicitly selected
