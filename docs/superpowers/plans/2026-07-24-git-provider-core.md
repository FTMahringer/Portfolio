# Git Provider Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an isolated TypeScript git-provider library under `packages/git-provider-core` with one public client API and internal Forgejo/GitHub adapters.

**Architecture:** The package is framework-agnostic and self-contained. Consumers call `createGitProviderClient()` from the package entrypoint; the client detects or accepts a provider override, creates an internal adapter, and exposes normalized `getRepo()`, `getReadme()`, `getDocs()`, and `getActivity()` methods. Provider-specific endpoint and response mapping logic stays inside adapter files.

**Tech Stack:** TypeScript 6, native `fetch`, ESM package output, Node's built-in `node:test` for package-level tests.

---

## File Structure

Create a standalone package folder:

```text
packages/git-provider-core/
  package.json                    Package metadata, build/test scripts, npm exports
  tsconfig.json                   Standalone TS config for library builds
  README.md                       Public usage docs and extraction notes
  src/
    index.ts                      Public exports only
    types.ts                      Public normalized types and option types
    errors.ts                     Typed `GitProviderError`
    detect-provider.ts            URL parsing and provider detection
    client.ts                     Public client factory and routing
    adapters/
      base.ts                     Internal adapter contract and config
      forgejo.ts                  Forgejo/Gitea-compatible public HTTPS adapter
      github.ts                   GitHub public HTTPS adapter
    utils/
      fetch.ts                    Shared fetch helpers and HTTP error mapping
      url.ts                      Repo path and URL helpers
  test/
    detect-provider.test.mjs      Built-output provider detection tests
    client.test.mjs               Built-output client routing and adapter tests
```

Do not modify the portfolio app to consume the package in this first slice.

---

### Task 1: Scaffold the standalone package

**Files:**
- Create: `packages/git-provider-core/package.json`
- Create: `packages/git-provider-core/tsconfig.json`
- Create: `packages/git-provider-core/README.md`
- Create: `packages/git-provider-core/src/index.ts`

- [ ] **Step 1: Create the package manifest**

Create `packages/git-provider-core/package.json`:

```json
{
  "name": "@portfolio/git-provider-core",
  "version": "0.1.0",
  "description": "Framework-agnostic git provider client with adapter-based Forgejo and GitHub support.",
  "type": "module",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "files": ["dist", "README.md"],
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "npm run build && node --test test/*.test.mjs"
  },
  "devDependencies": {
    "typescript": "^6.0.3"
  }
}
```

- [ ] **Step 2: Create the package TS config**

Create `packages/git-provider-core/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "src",
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["dist", "node_modules"]
}
```

- [ ] **Step 3: Create the README**

Create `packages/git-provider-core/README.md` with usage, scope, and extraction notes.

- [ ] **Step 4: Create the initial entrypoint**

Create `packages/git-provider-core/src/index.ts` and export the public API once later tasks define it.

---

### Task 2: Define public types and typed errors

**Files:**
- Create: `packages/git-provider-core/src/types.ts`
- Create: `packages/git-provider-core/src/errors.ts`
- Modify: `packages/git-provider-core/src/index.ts`

- [ ] **Step 1: Add normalized public types**

Create `src/types.ts` with:

```ts
export type GitProvider = 'forgejo' | 'github';
export type GitProviderSelection = GitProvider | 'auto';

export interface CreateGitProviderClientOptions {
  repoUrl: string;
  repoName: string;
  sshKey?: string;
  token?: string;
  provider?: GitProviderSelection;
  docsUrl?: string;
  fetch?: typeof fetch;
}

export interface ProviderSupport {
  readme: boolean;
  docs: boolean;
  activity: boolean;
  ssh: boolean;
  tokenAuth: boolean;
}

export interface ProviderInfo {
  provider: GitProvider;
  host: string;
  baseUrl: string;
  repoUrl: string;
  repoName: string;
  supports: ProviderSupport;
}

export interface RepoSummary {
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  defaultBranch: string | null;
  stars: number | null;
  forks: number | null;
  language: string | null;
  updatedAt: string | null;
}

export interface ReadmeResult {
  source: 'default-branch' | 'docs-path' | 'explicit-url';
  path?: string;
  url?: string;
  content: string;
  contentType: 'markdown' | 'text' | 'html';
}

export interface DocsResult {
  url: string | null;
  content: string | null;
  source: 'explicit-url' | 'provider-discovery' | 'unavailable';
}

export interface ActivityCommit {
  sha: string;
  message: string;
  authorName: string | null;
  authorDate: string | null;
  url: string | null;
}

export interface ActivityResult {
  commits: ActivityCommit[];
  source: 'repo-activity' | 'provider-api' | 'unavailable';
}

export interface GitProviderClient {
  getProviderInfo(): Promise<ProviderInfo>;
  getRepo(): Promise<RepoSummary>;
  getReadme(): Promise<ReadmeResult>;
  getDocs(): Promise<DocsResult>;
  getActivity(): Promise<ActivityResult>;
}
```

- [ ] **Step 2: Add typed errors**

Create `src/errors.ts` with `GitProviderErrorCode`, `GitProviderErrorOptions`, and `GitProviderError`.

- [ ] **Step 3: Re-export public types and errors**

Update `src/index.ts` to export types and `GitProviderError`.

---

### Task 3: Implement URL parsing and provider detection

**Files:**
- Create: `packages/git-provider-core/src/utils/url.ts`
- Create: `packages/git-provider-core/src/detect-provider.ts`
- Create: `packages/git-provider-core/test/detect-provider.test.mjs`

- [ ] **Step 1: Add URL helpers**

Implement helpers that parse HTTPS URLs and SCP-style SSH URLs such as `git@example.com:owner/repo.git`, normalize `.git` suffixes, and split `owner/repo` repo names.

- [ ] **Step 2: Add provider detection**

Implement `detectProvider(options)` so:
- `provider: 'github'` or `'forgejo'` is honored directly
- `github.com` maps to GitHub
- common Forgejo/Gitea hosts such as `codeberg.org`, `git.sr.ht`, `git.fsfe.org`, and hosts containing `forgejo` or `gitea` map to Forgejo
- unknown hosts without override throw `UNSUPPORTED_PROVIDER`

- [ ] **Step 3: Add detection tests**

Test GitHub detection, Forgejo detection, explicit override, SSH-style URL parsing, invalid URL errors, and unknown host errors.

---

### Task 4: Implement shared fetch helpers and adapter contract

**Files:**
- Create: `packages/git-provider-core/src/utils/fetch.ts`
- Create: `packages/git-provider-core/src/adapters/base.ts`

- [ ] **Step 1: Add fetch helpers**

Implement `fetchJson()` and `fetchText()` wrappers that:
- use injected `fetch` when provided
- add token auth headers when `token` exists
- map `401`/`403` to `AUTH_REQUIRED`
- map `404` to `NOT_FOUND`
- map other non-OK statuses to `FETCH_FAILED`
- map invalid JSON to `INVALID_RESPONSE`

- [ ] **Step 2: Add adapter base types**

Define `AdapterConfig` and `GitProviderAdapter` so provider adapters share one contract.

---

### Task 5: Implement Forgejo-compatible adapter

**Files:**
- Create: `packages/git-provider-core/src/adapters/forgejo.ts`

- [ ] **Step 1: Add Forgejo API URL construction**

Use Forgejo/Gitea-style API endpoints:
- repo metadata: `/api/v1/repos/{owner}/{repo}`
- README: `/api/v1/repos/{owner}/{repo}/contents/README.md`
- commits: `/api/v1/repos/{owner}/{repo}/commits`

- [ ] **Step 2: Normalize Forgejo repo metadata**

Map raw payload fields into `RepoSummary`.

- [ ] **Step 3: Normalize Forgejo README content**

Decode base64 content from the contents API. If README is unavailable, return an `UNSUPPORTED_FEATURE` or mapped `NOT_FOUND` error from the fetch layer.

- [ ] **Step 4: Normalize Forgejo activity**

Map commit payloads into `ActivityResult`.

- [ ] **Step 5: Implement docs fallback**

If `docsUrl` is provided, fetch it as text and return `source: 'explicit-url'`. Otherwise return `{ url: null, content: null, source: 'unavailable' }`.

---

### Task 6: Implement GitHub adapter

**Files:**
- Create: `packages/git-provider-core/src/adapters/github.ts`

- [ ] **Step 1: Add GitHub API URL construction**

Use GitHub public API endpoints:
- repo metadata: `https://api.github.com/repos/{owner}/{repo}`
- README: `https://api.github.com/repos/{owner}/{repo}/readme`
- commits: `https://api.github.com/repos/{owner}/{repo}/commits`

- [ ] **Step 2: Normalize GitHub responses**

Map GitHub repo, README, and commit payloads into the same shared return types as Forgejo.

- [ ] **Step 3: Implement docs fallback**

Use the same `docsUrl` explicit text-fetch behavior and unavailable fallback as Forgejo.

---

### Task 7: Implement public client factory and routing tests

**Files:**
- Create: `packages/git-provider-core/src/client.ts`
- Modify: `packages/git-provider-core/src/index.ts`
- Create: `packages/git-provider-core/test/client.test.mjs`

- [ ] **Step 1: Implement `createGitProviderClient()`**

The factory should:
- validate input
- detect the provider
- create the correct adapter
- return an object exposing only the public client methods

- [ ] **Step 2: Re-export the client factory**

Update `src/index.ts` to export `createGitProviderClient`.

- [ ] **Step 3: Add routing tests**

Use injected mock `fetch` responses to verify:
- GitHub client returns normalized repo/readme/activity data
- Forgejo client returns normalized repo/readme/activity data
- `docsUrl` fetch is routed through the adapter and returns explicit docs

---

### Task 8: Validate package and root type checks

**Files:**
- No expected source changes unless validation finds package-owned errors.

- [ ] **Step 1: Run package tests**

Run from `packages/git-provider-core`:

```bash
npm test
```

Expected: all package tests pass.

- [ ] **Step 2: Run package build**

Run from `packages/git-provider-core`:

```bash
npm run build
```

Expected: TypeScript build emits `dist/` without errors.

- [ ] **Step 3: Run root lint if package changes affect repo-wide checks**

Run from repo root:

```bash
npm run lint
```

Expected: no lint errors caused by the new package.

---

## Self-review

- Spec coverage: The plan covers package isolation, public API, provider detection, internal adapters, Forgejo/GitHub support, normalized types, auth placeholders, typed errors, tests, and extraction notes.
- Placeholder scan: No `TBD`, `TODO`, or unresolved implementation placeholders remain.
- Type consistency: Public methods and type names match the design spec and are used consistently across tasks.
