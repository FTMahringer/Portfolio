# Git Provider Settings Test Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install `@portfolio/git-provider-core` into the portfolio app via npm local file dependency and add a settings page that tests the package through its public API.

**Architecture:** The app consumes the library only through `@portfolio/git-provider-core`, never through package source paths. A server route creates the client and performs network calls so browser UI does not expose future credentials. A settings page posts test input and renders normalized package results.

**Tech Stack:** npm local file dependency, Next.js App Router route handlers, React client settings page, TypeScript.

---

## File Structure

```text
package.json                                      Add local file dependency
package-lock.json                                 Updated by npm install
packages/git-provider-core/package.json           Add prepare script so file installs build dist
src/app/api/admin/git-provider/test/route.ts      Server-side package test endpoint
src/app/settings/git-provider/page.tsx            Admin settings UI to run test calls
src/app/settings/layout.tsx                       Add settings nav link
```

---

### Task 1: Make package installable through npm

**Files:**
- Modify: `packages/git-provider-core/package.json`
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] Add `prepare: npm run build` to `packages/git-provider-core/package.json`.
- [ ] Run `npm install ./packages/git-provider-core --save` from repo root.
- [ ] Confirm root `package.json` contains `"@portfolio/git-provider-core": "file:packages/git-provider-core"`.

---

### Task 2: Add server-side test route

**Files:**
- Create: `src/app/api/admin/git-provider/test/route.ts`

- [ ] Import `createGitProviderClient` and `GitProviderError` from `@portfolio/git-provider-core`.
- [ ] Accept POST JSON with `repoUrl`, `repoName`, `provider`, and `docsUrl`.
- [ ] Call `getProviderInfo()`, `getRepo()`, `getReadme()`, `getDocs()`, and `getActivity()`.
- [ ] Return trimmed README/docs previews and typed error JSON.

---

### Task 3: Add settings page UI

**Files:**
- Create: `src/app/settings/git-provider/page.tsx`
- Modify: `src/app/settings/layout.tsx`

- [ ] Add a nav item for `/settings/git-provider`.
- [ ] Create a client page with inputs for repo URL, repo name, provider override, and docs URL.
- [ ] POST to `/api/admin/git-provider/test`.
- [ ] Render provider info, repo metadata, README preview, docs result, and activity commits.

---

### Task 4: Validate

**Files:**
- No expected source changes unless validation finds issues.

- [ ] Run `npm test` in `packages/git-provider-core`.
- [ ] Run `npm run lint` in repo root.
- [ ] Optionally run `npm run build` in repo root if lint passes and time allows.

---

## Self-review

- Spec coverage: Package install, public package import, server route, settings page, and validation are covered.
- Placeholder scan: No unresolved placeholders.
- Type consistency: Route input fields match the settings form and package options.
