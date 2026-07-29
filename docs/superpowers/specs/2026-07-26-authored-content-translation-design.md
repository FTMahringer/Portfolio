# Authored Content Translation Pipeline — Design Spec

**Date:** 2026-07-26  
**Status:** Approved  
**Scope:** Add a SQLite-backed prototype for translating authored/non-fixed content through configurable translation providers, starting with LibreTranslate and a small test surface.

---

## Problem

The portfolio now separates fixed UI strings from authored content:

- fixed UI strings live in `config/lang/*.yaml`
- authored content lives in settings, config values, markdown/MDX, and content frontmatter

This is intentional: authored content should not be copied into the fixed language files. However, when the UI language changes, authored text such as `site.bio` remains in the source language. The site needs a separate translation pipeline for authored text that can generate, cache, and reuse translated values without mixing them into UI language files.

---

## Goals

1. **Keep fixed UI translations separate**
   - Continue using `config/lang/*.yaml` for fixed app/UI strings.
   - Do not put blog/project markdown, config-authored text, or custom homepage stat values into language files.

2. **Prototype authored-content translation**
   - Start small with a feature-flagged prototype.
   - First test surface: homepage/self-written config text, especially `site.bio`.
   - Do not translate full markdown/MDX bodies in v1.

3. **Provider abstraction**
   - Design for LibreTranslate, DeepL, and Google Cloud Translation.
   - Implement LibreTranslate first.
   - Keep DeepL and Google as provider types/config options for later implementation.

4. **SQLite-backed cache/storage**
   - Store sources, translations, provider config, schedule settings, and job history in SQLite.
   - Keep the app single-instance/self-hosted friendly.

5. **Change detection**
   - Hash source content.
   - Only translate missing or stale entries.
   - Do not rerun translation jobs when nothing changed.

6. **Manual and scheduled runs**
   - Admin settings should support a manual "run translations now" action.
   - Admin settings should support an optional schedule.
   - Schedule should be structured: daily/weekly/custom day + fixed time.

7. **Locale eligibility rule**
   - Only translate into locales that already have fixed UI language files and are present in the locale registry.
   - Do not generate translations for non-selectable languages.

---

## Non-goals

- No full markdown/MDX body translation in v1.
- No real-time per-request machine translation.
- No browser-triggered Google Translate integration.
- No multi-instance distributed queue.
- No Postgres migration in this phase.
- No DeepL/Google provider implementation in v1 beyond schema/config placeholders.

---

## Architecture

The authored-content translation system is downstream from the existing locale system.

```text
config/lang/*.yaml
        │
        ▼
locale registry ──► eligible target locales
        │
        ▼
authored translation scheduler/manual runner
        │
        ▼
provider adapter: LibreTranslate first
        │
        ▼
SQLite cache entries
        │
        ▼
render helper returns translated text or source fallback
```

The current locale from the route still controls which translated content may be shown. If no valid cached translation exists, rendering falls back to the original authored text.

---

## Provider Model

### Supported provider types

The system should model these provider types:

- `libretranslate`
- `deepl`
- `google`

### v1 implementation

Only LibreTranslate is implemented in v1.

LibreTranslate config:

- enabled
- endpoint URL, for example `https://translate.example.com`
- optional API key
- source language
- request timeout

DeepL and Google config can be saved for later, but provider runs should reject them with a clear "provider not implemented" error until implemented.

### Provider interface

All providers should implement one internal adapter shape:

```ts
interface AuthoredTranslationProvider {
  type: 'libretranslate' | 'deepl' | 'google';
  translate(input: {
    text: string;
    sourceLocale: string;
    targetLocale: string;
  }): Promise<{ text: string }>;
}
```

The caller should not know which API is used.

---

## SQLite Storage

Add a small translation domain to the existing SQLite DB.

### `translation_provider_settings`

Stores provider settings and feature flags.

Suggested fields:

- `id`
- `provider_type`
- `enabled`
- `endpoint_url`
- `api_key`
- `source_locale`
- `timeout_ms`
- `created_at`
- `updated_at`
- `last_test_status`
- `last_test_message`

API keys should not be exposed in public endpoints. If shown in admin UI, return only whether a key exists.

### `translation_settings`

Stores global authored-content translation settings.

Suggested fields:

- `id`
- `enabled`
- `provider_type`
- `source_locale`
- `scope`
- `schedule_enabled`
- `schedule_frequency`
- `schedule_time`
- `schedule_weekday`
- `last_run_at`
- `next_run_at`
- `created_at`
- `updated_at`

For v1, `scope` can be `site_bio` or another small enum-like text value.

### `translation_sources`

Represents source fields eligible for translation.

Suggested fields:

- `id`
- `source_type`, e.g. `site_config`
- `source_key`, e.g. `site.bio`
- `source_locale`, e.g. `en`
- `source_text`
- `source_hash`
- `enabled`
- `last_seen_at`
- `created_at`
- `updated_at`

### `translation_entries`

Stores translated/cached output.

Suggested fields:

- `id`
- `source_id`
- `target_locale`
- `provider_type`
- `translated_text`
- `source_hash`
- `status`, e.g. `valid`, `stale`, `failed`
- `error_message`
- `created_at`
- `updated_at`

Unique key:

```text
source_id + target_locale
```

### `translation_jobs`

Tracks manual and scheduled runs.

Suggested fields:

- `id`
- `trigger_type`, e.g. `manual`, `scheduled`
- `status`, e.g. `queued`, `running`, `completed`, `failed`, `skipped`
- `provider_type`
- `source_locale`
- `target_locales_json`
- `started_at`
- `finished_at`
- `sources_checked`
- `translations_created`
- `translations_skipped`
- `translations_failed`
- `error_message`

---

## Change Detection

Each source field should be normalized and hashed before translation.

Normalization rules:

- trim surrounding whitespace
- normalize line endings to `\n`
- preserve internal text content

Hashing:

- use SHA-256
- store as hex string

Translation run behavior:

1. discover current source fields for the configured scope
2. calculate current source hash
3. upsert `translation_sources`
4. find eligible target locales from the fixed UI locale registry
5. exclude the source locale
6. for each target locale:
   - if no entry exists, translate
   - if entry source hash differs, translate and replace/update
   - if entry status is failed and source hash is current, retry only when manually requested or when retry policy allows
   - otherwise skip

This ensures nightly jobs do not waste provider calls when content has not changed.

---

## Locale Eligibility

The authored translation system must only translate into locales that are already supported by the fixed UI locale system.

Rules:

- read supported locales from the locale registry
- require matching `config/lang/<full-locale>.yaml`
- exclude the source locale
- admin UI must only offer eligible locales
- manual/API runs must reject unsupported target locales

Example:

- if registry supports `en` and `de`, only `de` is eligible when source is `en`
- do not translate to `fr` unless `fr` is added to the registry and a fixed UI language file exists

---

## Prototype Scope

V1 should translate only a tiny safe surface.

Recommended first source:

```text
site_config: site.bio
```

Rendering usage:

- homepage hero keeps using `site.title` unchanged
- homepage hero can use translated `site.bio` when:
  - authored-content translation is enabled
  - current locale is not the source locale
  - a valid cached translation exists for current locale and current source hash
- otherwise it falls back to `site.bio`

This proves the pipeline without translating markdown bodies yet.

---

## Admin Settings UI

Add an authored-content translation area under admin settings.

Controls:

- enable/disable authored-content translation
- provider type select: LibreTranslate, DeepL, Google
- provider endpoint URL
- API key field, optional for LibreTranslate
- source locale
- scope selector, v1: `site.bio`
- schedule enabled toggle
- schedule frequency: manual only, daily, weekly
- schedule time: `HH:mm`
- weekly day selector when frequency is weekly
- manual "Run translations now" button
- provider test button
- last run status summary
- next scheduled run summary

DeepL/Google can be selectable but clearly marked as not implemented until their adapters are added.

---

## Scheduling

Because the app is single-instance/self-hosted, scheduling can be simple.

V1 options:

- manual button always available
- optional structured schedule stored in SQLite
- a server-side check endpoint or startup/background loop can determine whether a run is due

Recommended first implementation:

- create an admin route to run due jobs
- optionally call it from an external cron/container scheduler
- later add an in-process timer only if needed

Why: this avoids long-running assumptions inside Next.js request workers and works well in Docker/Podman.

Example external cron command:

```text
curl -H "Authorization: Bearer <secret>" https://site.example.com/api/admin/translations/run-due
```

For manual testing, admin UI calls:

```text
POST /api/admin/translations/run
```

---

## API Design

Admin-only endpoints:

```text
GET  /api/admin/translations/settings
PUT  /api/admin/translations/settings
POST /api/admin/translations/test-provider
POST /api/admin/translations/run
POST /api/admin/translations/run-due
GET  /api/admin/translations/jobs
GET  /api/admin/translations/sources
```

Rendering helper does not need a public API. Server components can query SQLite directly through a service layer.

---

## Service Layer

Add a service layer so UI/routes do not couple directly to the DB schema.

Suggested files:

```text
src/lib/authored-translations/settings.ts
src/lib/authored-translations/sources.ts
src/lib/authored-translations/cache.ts
src/lib/authored-translations/jobs.ts
src/lib/authored-translations/providers/index.ts
src/lib/authored-translations/providers/libretranslate.ts
src/lib/authored-translations/render.ts
```

Responsibilities:

- settings service: load/save provider and schedule config
- source service: discover enabled source fields and hashes
- cache service: read/write translated entries
- job service: run manual/scheduled translation jobs
- provider service: instantiate the selected provider adapter
- render helper: return translated authored text when valid, otherwise source text

---

## Error Handling

Provider failures should not break public rendering.

Rules:

- failed provider calls mark entries/job counts as failed
- public rendering falls back to source text
- admin UI shows last error message
- unsupported providers return a clear admin error
- missing API endpoint/config prevents runs and records a failed/skipped job
- invalid schedule config is rejected in admin settings

---

## Testing Plan

### Unit-level checks

- source hash changes when source text changes
- unchanged source skips translation
- unsupported locale is rejected
- source locale is excluded from targets
- valid cached entry is returned for non-source locale
- stale cached entry falls back or is marked for refresh

### Provider checks

- LibreTranslate request payload is correct
- provider timeout/error is recorded as failed
- provider test endpoint reports success/failure

### Integration checks

- enable prototype translation
- configure LibreTranslate endpoint
- run manual job
- verify `site.bio` translation is stored
- switch to `/de`
- verify translated `site.bio` appears
- modify `site.bio`
- run job again
- verify only stale translation is refreshed

### Validation commands

```bash
npm run lint
npm run build
```

---

## Rollout Plan

1. Add DB schema and service layer.
2. Add LibreTranslate provider adapter.
3. Add admin settings UI and API routes.
4. Add manual run action.
5. Add structured schedule settings and run-due endpoint.
6. Wire homepage `site.bio` through the render helper behind the feature flag.
7. Validate the prototype with a small LibreTranslate instance.
8. Later expand sources to content frontmatter, then markdown/MDX bodies.

---

## Future Expansion

After the prototype works:

- add DeepL provider adapter
- add Google Cloud Translation adapter
- add more source fields: project/blog/experience frontmatter
- add markdown/MDX body translation with segment-level caching
- add admin review/edit UI for machine translations
- add per-source opt-in/out controls
- add retry/backoff policy
