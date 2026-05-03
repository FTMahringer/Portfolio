# Next.js Admin System Prompt (SQLite + Drizzle)

Build a secure hidden admin system for my Next.js 16.2.4 portfolio website using Drizzle ORM with SQLite.

---

## Context
- Next.js App Router
- Use `proxy.ts`
- Reverse proxy setup (Nginx Proxy Manager, Caddy, Traefik)
- Public vs Admin separation
- Self-hosted (homelab)

---

## Tech Stack
- Drizzle ORM
- SQLite
- better-sqlite3
- argon2 (password hashing)

---

## Core Features

### Database
- SQLite file: `./data/portfolio.db`
- Tables:
  - users (id, email, password_hash, created_at)
  - sessions (id, user_id, expires_at, created_at)

### Scripts
- db:generate
- db:migrate
- db:studio

### Seed
- Create admin user from `.env`
- Hash password
- Avoid duplicates

---

## Authentication
- `/admin` login page
- Session cookie (httpOnly)
- Logout support

---

## Protection
- Protect:
  - `/admin/*`
  - `/api/admin/*`
- Use `proxy.ts`
- Redirect or 403 if unauthorized

---

## Optional Internal Network
- CIDR detection
- Combine:
  - session OR internal IP

---

## Reverse Proxy Setup

### Nginx Proxy Manager
```
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header Host $host;
```

### Caddy
```
reverse_proxy nextjs:3000 {
  header_up X-Real-IP {remote_host}
  header_up X-Forwarded-For {remote_host}
  header_up X-Forwarded-Proto {scheme}
  header_up Host {host}
}
```

### Traefik
- Uses X-Forwarded-* automatically

---

## Environment Example
```
DATABASE_URL=file:./data/portfolio.db
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change_me
SESSION_SECRET=super_secret
INTERNAL_CIDRS=10.0.0.0/8,192.168.0.0/16
```

---

## Structure
```
/src
  /app/admin
  /api/admin
  /lib
  /db
proxy.ts
drizzle.config.ts
```

---

## Security Notes
- Hidden != secure
- Always protect API routes
- Use reverse proxy restrictions
- Consider VPN (NetBird)

---

## Recommended Model
Access = (Session valid) OR (Internal Network)
