# Git Provider Core Library — Design Spec

**Date:** 2026-07-24  
**Status:** Draft  
**Scope:** Build a reusable, framework-agnostic TypeScript library for connecting to git hosting providers through a single client API and internal provider adapters.

---

## Problem

The portfolio currently needs a way to talk to git hosting providers such as GitHub and Forgejo-compatible servers, but the logic should not be embedded in the Next.js app. The desired behavior is:

- accept an initial git URL to detect the provider/domain
- accept a repository name or path
- optionally accept SSH key input now so the public API does not need to change later
- expose a small set of client methods that route requests to the selected provider internally
- keep readme/docs/activity fetching behind the provider layer
- stay reusable in other projects later as a standalone npm package

If this logic is mixed into the portfolio app, it becomes harder to reuse, harder to test independently, and harder to publish later as a separate package.

---

## Goals

1. **Reusable core library**
   - Pure TypeScript package with no Next.js, React, or app-specific code.
   - Can later be published to npm or extracted into its own repository with minimal changes.

2. **Single public client API**
   - Consumers create one client and call methods on it.
   - Provider details stay internal.

3. **Provider detection from the initial URL**
   - Detect the host and provider family from the supplied git URL.
   - Support explicit override if detection is ambiguous.

4. **Adapter-based architecture**
   - Each provider implements the same internal interface.
   - The client routes all calls to the selected adapter.

5. **Public HTTPS first**
   - Start with unauthenticated public repository support.
   - Accept SSH key input in the API, but do not require it for the first version.

6. **Normalized return types**
   - The client returns consistent shapes regardless of provider.
   - Callers do not need provider-specific parsing.

---

## Non-goals

- No React components in the first version.
- No Next.js integration in the first version.
- No portfolio-specific content model inside the library.
- No private repository auth implementation in the first version beyond carrying auth configuration through the API shape.
- No attempt to support every git host immediately.

---

## Package Boundary

The library should live as a separate package folder inside the current repo, but remain isolated from the portfolio application.

Recommended layout:

```text
packages/
  git-provider-core/
    package.json
    tsconfig.json
    src/
      index.ts
      client.ts
      detect-provider.ts
      types.ts
      errors.ts
      adapters/
        base.ts
        forgejo.ts
        github.ts
      utils/
        url.ts
        fetch.ts
```

### Isolation rules

- The portfolio app must not import internal adapter files directly.
- The app, if it uses the library later, should only import from the package entrypoint.
- The package should depend only on standard TypeScript/JavaScript runtime APIs and small utility dependencies if absolutely needed.
- No UI-specific code should live in the package.

This keeps the package extractable later without rewriting its public interface.

---

## Public API

The public surface should be small and stable.

### Factory

```ts
createGitProviderClient(options)
```

### Input options

```ts
interface CreateGitProviderClientOptions {
  repoUrl: string;
  repoName: string;
  sshKey?: string;
  token?: string;
  provider?: 'forgejo' | 'github' | 'auto';
  docsUrl?: string;
}
```

### Why these fields

- `repoUrl`: used to identify host, provider family, and base API URL.
- `repoName`: repository path or name used in provider requests.
- `sshKey?`: accepted now so the library API does not need to change later.
- `token?`: placeholder for future private auth support; not required for public repositories.
- `provider?`: allows explicit override when detection is not enough.
- `docsUrl?`: optional explicit docs/wiki URL override when provider discovery is insufficient.

### Client methods

The first version should expose methods along these lines:

```ts
interface GitProviderClient {
  getProviderInfo(): Promise<ProviderInfo>;
  getRepo(): Promise<RepoSummary>;
  getReadme(): Promise<ReadmeResult>;
  getDocs(): Promise<DocsResult>;
  getActivity(): Promise<ActivityResult>;
}
```

The method names are intentionally generic so callers can use the same API across providers.

---

## Data Model

The library should normalize provider responses into shared shapes.

### Provider info

```ts
interface ProviderInfo {
  provider: 'forgejo' | 'github';
  host: string;
  baseUrl: string;
  repoUrl: string;
  repoName: string;
  supports: {
    readme: boolean;
    docs: boolean;
    activity: boolean;
    ssh: boolean;
    tokenAuth: boolean;
  };
}
```

### Repo summary

```ts
interface RepoSummary {
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
```

### Readme result

```ts
interface ReadmeResult {
  source: 'default-branch' | 'docs-path' | 'explicit-url';
  path?: string;
  url?: string;
  content: string;
  contentType: 'markdown' | 'text' | 'html';
}
```

### Docs result

```ts
interface DocsResult {
  url: string | null;
  content: string | null;
  source: 'explicit-url' | 'provider-discovery' | 'unavailable';
}
```

### Activity result

```ts
interface ActivityResult {
  commits: Array<{
    sha: string;
    message: string;
    authorName: string | null;
    authorDate: string | null;
    url: string | null;
  }>;
  source: 'repo-activity' | 'provider-api' | 'unavailable';
}
```

These shapes are intentionally conservative so the library can normalize different provider responses without exposing raw provider payloads to consumers.

---

## Provider Detection

The client should determine the provider from the supplied `repoUrl` when `provider` is not explicitly set.

### Detection rules

1. Parse the URL host.
2. Map known hosts to a provider family when possible.
3. Default to a Forgejo-compatible adapter for hosts that behave like Forgejo/Gitea and expose matching endpoints.
4. Allow explicit `provider` override when the host is custom or detection is wrong.

### Detection priorities

- `github.com` → GitHub adapter
- known Forgejo/Gitea-compatible hosts → Forgejo adapter
- unknown host + explicit override → chosen adapter
- unknown host without override → error

This keeps the first version practical while leaving room for custom self-hosted domains.

---

## Adapter Interface

The internal adapter contract should be the real boundary of the package.

```ts
interface GitProviderAdapter {
  readonly provider: 'forgejo' | 'github';
  supports: {
    readme: boolean;
    docs: boolean;
    activity: boolean;
    ssh: boolean;
    tokenAuth: boolean;
  };

  getRepo(): Promise<RepoSummary>;
  getReadme(): Promise<ReadmeResult>;
  getDocs(): Promise<DocsResult>;
  getActivity(): Promise<ActivityResult>;
}
```

### Adapter responsibilities

Each adapter should:

- build provider-specific API URLs
- perform fetches
- map raw responses into the shared shapes above
- hide provider quirks from the client
- report unsupported features consistently

### Base client responsibilities

The client should:

- parse the initial URL
- choose the adapter
- validate config
- provide common error handling
- expose a stable public API

The client should not contain provider-specific endpoint logic.

---

## Provider Coverage for Version 1

### Forgejo-compatible hosts

Start here first.

Why:
- matches the recommendation to start with Forgejo public HTTPS
- likely covers Forgejo and many Forgejo/Gitea-style installations with similar API behavior
- useful for self-hosted repos, which often need reusable host-agnostic tooling

Initial implementation should support:
- repo metadata
- README fetch
- docs/wiki-style fetch when available
- commit activity fetch

### GitHub

Add GitHub as the second provider in the same adapter system.

Even if Forgejo is the immediate focus, GitHub detection helps validate the abstraction and makes the library more broadly reusable.

---

## Auth Strategy

The first version is public HTTPS only.

### Supported now

- anonymous public fetches
- optional `sshKey` accepted by the API but not required for the first implementation

### Deferred

- token-based auth for private repositories
- SSH transport for repo cloning or authenticated access
- secret storage or credential management

### Why accept `sshKey` now

Accepting the field now keeps the public API stable for later private-repo support. The first version can ignore it or store it in the client config without using it yet, as long as the shape is preserved.

---

## Error Handling

The library should use typed errors so consuming apps can make decisions without parsing raw messages.

### Error types

```ts
type GitProviderErrorCode =
  | 'INVALID_URL'
  | 'UNSUPPORTED_PROVIDER'
  | 'UNSUPPORTED_FEATURE'
  | 'NOT_FOUND'
  | 'AUTH_REQUIRED'
  | 'FETCH_FAILED'
  | 'INVALID_RESPONSE';
```

```ts
class GitProviderError extends Error {
  code: GitProviderErrorCode;
  provider?: 'forgejo' | 'github';
  status?: number;
}
```

### Error rules

- Invalid input should fail early with `INVALID_URL`.
- Unknown or unmapped hosts should fail with `UNSUPPORTED_PROVIDER` unless explicitly overridden.
- Provider endpoints that are missing or incompatible should fail with `UNSUPPORTED_FEATURE`.
- Network or HTTP failures should carry enough context to debug, but not expose secrets.

This makes the package predictable for any future consumer.

---

## File Structure

The package should be internally organized by responsibility.

```text
packages/git-provider-core/
  package.json
  tsconfig.json
  README.md
  src/
    index.ts
    client.ts
    detect-provider.ts
    errors.ts
    types.ts
    adapters/
      base.ts
      forgejo.ts
      github.ts
    utils/
      url.ts
      fetch.ts
      normalize.ts
  test/
    detect-provider.test.ts
    forgejo.test.ts
    github.test.ts
    client.test.ts
```

### Entry point

`src/index.ts` should export only the stable public API:

- `createGitProviderClient`
- public types
- `GitProviderError`

It should not expose provider internals.

---

## Testing Strategy

The library should be tested independently from the portfolio app.

### Test coverage

1. **Provider detection**
   - GitHub host maps correctly
   - Forgejo-compatible host maps correctly
   - invalid URLs fail clearly

2. **Client routing**
   - client calls the correct adapter
   - client returns normalized shapes

3. **Provider adapters**
   - Forgejo adapter fetches and normalizes repo metadata
   - Forgejo adapter fetches README/activity from the expected endpoints
   - GitHub adapter follows the same normalized contract

4. **Error cases**
   - 404 returns `NOT_FOUND`
   - unsupported endpoint returns `UNSUPPORTED_FEATURE`
   - malformed API payload returns `INVALID_RESPONSE`

### Preferred test style

- mock fetch responses at the adapter boundary
- avoid live network calls in unit tests
- keep provider-specific fixtures small and explicit

---

## Extraction Strategy Later

Even though the package lives in the current repo for now, it should be written as if it may be moved out later.

### To make extraction easy

- keep the package self-contained
- avoid imports from `src/` of the portfolio app
- avoid shared path aliases into app code
- use a dedicated package `package.json`
- keep the public API in one entrypoint
- keep provider adapters internal and private to the package

### Expected future move

When ready, the package folder can be copied into a separate repository and published as an npm package with minimal change. The portfolio app can then depend on it the same way any other project would.

---

## Success Criteria

The design is successful when:

- a consumer can create one client with `repoUrl` and `repoName`
- the client chooses the correct provider adapter automatically or via explicit override
- the package can fetch repo data, README, docs, and activity through one API
- the library works without portfolio app integration
- the package remains suitable for future npm publication or repo extraction

---

## Recommended First Implementation Slice

Implement the first version in this order:

1. package scaffolding and entrypoint
2. shared types and error class
3. URL/provider detection
4. base adapter interface
5. Forgejo adapter for public HTTPS
6. GitHub adapter using the same normalized shapes
7. client factory and routing
8. tests for detection, routing, and adapter normalization

This keeps the first working version focused while preserving the long-term reusable architecture.
