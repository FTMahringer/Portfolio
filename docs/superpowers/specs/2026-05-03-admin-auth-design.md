# Admin Authentication System — Design Spec

**Date:** 2026-05-03  
**Status:** Approved  
**Scope:** Replace static `DEV_KEY` token auth with a proper SQLite-backed admin login system

---

## Problem

The current dev-mode auth relies on a static `DEV_KEY` environment variable checked against a plain-text POST body. The resulting `dev_session=1` cookie is:

- Not httpOnly (readable by JavaScript → XSS risk)
- Not tied to a real user identity
- Impossible to revoke without restarting the server
- Provides no audit trail (no IP, no session list)

---

## Solution

A hidden `/admin` route with username/password login, backed by a Drizzle ORM + SQLite database. Sessions are stored in the DB, enabling listing, inspection, and per-session revocation. A CIDR-based internal-network bypass allows homelab access without a cookie. The existing floating DEV panel remains on the portfolio site once authenticated.

---

## Tech Stack

| Concern | Library |
|---|---|
| ORM | Drizzle ORM |
| Database | SQLite via `better-sqlite3` |
| Password hashing | `argon2` |
| DB file location | `./data/portfolio.db` |
| Session identifier | `crypto.randomUUID()` |

---

## Database Schema

### `users`

| Column | Type | Notes |
|---|---|---|
| `id` | integer (PK, autoincrement) | |
| `email` | text, unique, not null | login identifier |
| `password_hash` | text, not null | argon2 hash |
| `created_at` | integer | Unix timestamp |

### `sessions`

| Column | Type | Notes |
|---|---|---|
| `id` | text (PK) | `crypto.randomUUID()` |
| `user_id` | integer (FK → users.id) | |
| `expires_at` | integer | Unix timestamp, default +7 days |
| `created_at` | integer | Unix timestamp |
| `ip` | text, nullable | client IP at login |
| `user_agent` | text, nullable | browser UA at login |

---

## File Structure

```
src/
  db/
    schema.ts           — Drizzle table definitions
    index.ts            — singleton better-sqlite3 + Drizzle client
    seed.ts             — upsert admin user from ADMIN_EMAIL/ADMIN_PASSWORD
  lib/
    auth.ts             — createSession(), validateSession(), deleteSession()
    cidr.ts             — parseCIDR(), isInternalIP() for network bypass
  app/
    admin/
      layout.tsx        — minimal shell layout (no public site nav)
      page.tsx          — login page (redirects to /admin/dashboard if session valid)
      dashboard/
        page.tsx        — stats, quick-create buttons, site link, logout
      content/
        page.tsx        — table: all MDX content by type (title/slug/date/link)
      sessions/
        page.tsx        — active sessions + per-row revoke button
      settings/
        page.tsx        — change email, change password
    api/
      admin/
        login/route.ts      — POST: verify credentials → create session → set cookie
        logout/route.ts     — POST: delete session → clear cookie
        sessions/route.ts   — GET list active sessions / DELETE one by ID
        password/route.ts   — PUT: verify current password → hash + store new one
src/lib/proxy.ts            — middleware auth logic + CIDR bypass (imported by middleware.ts)
middleware.ts               — Next.js middleware entry; delegates to proxy.ts
drizzle.config.ts           — points to ./data/portfolio.db
```

---

## Authentication Flow

### Login
1. User submits email + password to `POST /api/admin/login`
2. Server loads user row by email; returns 401 if not found
3. `argon2.verify(storedHash, submittedPassword)` — returns 401 on mismatch
4. Insert row into `sessions`: UUID id, user_id, expires_at = now + 7 days, ip, user_agent
5. Set `admin_sid=<uuid>` cookie: **httpOnly, Secure (prod), SameSite=Lax, path=/, maxAge=7d**
6. Return `{ ok: true }` → client redirects to `/admin/dashboard`

### Request protection (middleware)
For every request to `/admin/*` or `/api/admin/*`:

1. Read `admin_sid` cookie from request
2. **CIDR bypass**: if `X-Real-IP` / `X-Forwarded-For` IP is within any `INTERNAL_CIDRS` range → allow without cookie check
3. If no cookie → redirect to `/admin` (or 403 JSON for API routes)
4. DB lookup: `SELECT * FROM sessions WHERE id = ? AND expires_at > now()`
5. Not found or expired → redirect / 403
6. Valid → attach user_id to request headers (for use in server components) → proceed

### Logout
1. `POST /api/admin/logout` (from admin dashboard or dev panel)
2. Delete session row where `id = cookie_value`
3. Set cookie `admin_sid=; maxAge=0` to clear it
4. Redirect to `/admin`

---

## CIDR Bypass

`INTERNAL_CIDRS` env var: comma-separated CIDR ranges (e.g. `10.0.0.0/8,192.168.0.0/16`).

IP extraction order: `X-Real-IP` → first entry of `X-Forwarded-For` → socket remote address.

If the resolved IP falls within any configured CIDR, the middleware passes the request regardless of cookie state. This allows unauth'd access from the homelab LAN without logging in.

**Security note:** This only works safely behind a trusted reverse proxy (Nginx Proxy Manager / Caddy / Traefik) that sets these headers. Never trust `X-Forwarded-For` from untrusted origins.

---

## Reverse Proxy Headers

The app expects the following headers to be set by the reverse proxy:

```
X-Real-IP         $remote_addr
X-Forwarded-For   $proxy_add_x_forwarded_for
X-Forwarded-Proto $scheme
Host              $host
```

---

## Admin Dashboard Pages

### `/admin` — Login
- Email + password form
- Error message on failure
- Auto-redirect to `/admin/dashboard` if already authenticated

### `/admin/dashboard`
- Stats: total projects / blog posts / experience entries / active sessions
- Quick-create buttons → `/dev/new/blog`, `/dev/new/projects`, `/dev/new/experience`
- "View site →" link
- Logout button

### `/admin/content`
- Flat table of all MDX content across all types
- Columns: Type badge, Title, Slug, Date, Status (draft/published)
- Row links to the public detail page

### `/admin/sessions`
- Table: Session ID (truncated), IP, User Agent, Created, Expires
- "Revoke" button per row (calls `DELETE /api/admin/sessions?id=<uuid>`)
- "Revoke all other sessions" action

### `/admin/settings`
- Change email form
- Change password form (requires current password confirmation)

---

## Migration from Old Auth

| Old | New |
|---|---|
| `DEV_KEY` env var | Removed |
| `POST /api/auth/dev` | Removed (replaced by `/api/admin/login`) |
| `dev_session=1` cookie (non-httpOnly, JS-readable) | `admin_sid=<uuid>` (httpOnly, secure) |
| Server-side `checkDevSession()` string check | `validateSession(cookie)` DB lookup |
| `DevContext.login(key)` | `DevContext.login(email, password)` |

The floating DEV panel remains unchanged in behaviour — it just reads the new `admin_sid` cookie to determine visibility, and the login/logout actions hit the new API routes.

---

## Environment Variables

```env
DATABASE_URL=file:./data/portfolio.db
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change_me_before_first_run
SESSION_SECRET=at_least_32_random_chars
INTERNAL_CIDRS=10.0.0.0/8,192.168.0.0/16
```

---

## npm Scripts Added

```json
"db:generate": "drizzle-kit generate",
"db:migrate":  "drizzle-kit migrate",
"db:studio":   "drizzle-kit studio",
"db:seed":     "tsx src/db/seed.ts"
```

Run order on first deploy:
```
npm run db:migrate   # creates data/portfolio.db and applies schema
npm run db:seed      # creates admin user from .env
```

---

## Security Notes

- `hidden` path ≠ secure — all routes are middleware-protected regardless
- Passwords stored as argon2id hashes (never plaintext)
- Sessions stored server-side — compromised cookie can be revoked immediately
- `admin_sid` is httpOnly → not accessible to JavaScript
- CIDR bypass is safe only behind a trusted reverse proxy
- Consider VPN (e.g. NetBird) as an additional layer for the `/admin` route
- `data/` directory should be in `.gitignore` and backed up separately
