# Portfolio

A modern, self-hosted portfolio website built with Next.js 16, featuring a full admin dashboard, MDX-based content management, and comprehensive SEO optimization.

[![CI](https://github.com/FTMahringer/Portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/FTMahringer/Portfolio/actions/workflows/ci.yml)
[![Docker Pulls](https://img.shields.io/docker/pulls/ftmahringer/portfolio)](https://hub.docker.com/r/ftmahringer/portfolio)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## ✨ Features

### 🎨 Public Portfolio
- **Responsive Design** — Mobile-first, accessible UI with dark mode support
- **MDX-Powered Content** — Write blog posts, projects, and experiences in Markdown with React components
- **Advanced Search** — Fuzzy search across all content with keyboard shortcuts (`Cmd/Ctrl+K`)
- **SEO Optimized** — OpenGraph images, JSON-LD structured data, dynamic sitemap, robots.txt
- **GitHub Integration** — Contribution calendar visualization
- **Contact Form** — Email submissions with file attachments via Resend API

### 🛠️ Admin Dashboard (`/admin`)
- **Content Management** — Create, edit, and manage all content types through a visual editor
- **Markdown Editor** — Live preview with syntax highlighting and drag-and-drop image upload
- **Database Viewer** — SQL editor and table inspector for SQLite database
- **Session Management** — View and revoke active admin sessions
- **SSO/OIDC Support** — Configure multiple identity providers (Google, Microsoft, Okta, PocketID, Authentik, Keycloak, etc.)
- **OpenAPI Documentation** — Interactive API docs for all admin endpoints

### 🔐 Authentication
- **Local Auth** — Argon2-based password hashing, session cookies
- **SSO/OIDC** — Database-backed provider configuration with env var fallback
- **Session Management** — SQLite-backed sessions with configurable expiry

### 🐳 Production-Ready
- **Docker** — Multi-platform images (amd64, arm64) on Docker Hub and GitHub Container Registry
- **CI/CD** — Automated linting, type-checking, builds, and releases via GitHub Actions
- **CodeQL Security Scanning** — Automated vulnerability detection
- **Dependabot** — Auto-merge for minor/patch dependency updates

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Pull the latest image
docker pull ftmahringer/portfolio:latest

# Run with required environment variables
docker run -d \
  -p 3000:3000 \
  -v portfolio-data:/app/data \
  -e ADMIN_EMAIL=admin@example.com \
  -e ADMIN_PASSWORD=secure-password \
  -e API_SECRET=random-secret-key \
  --name portfolio \
  ftmahringer/portfolio:latest
```

Or use **docker-compose.yml**:

```yaml
version: ''3.8''
services:
  portfolio:
    image: ftmahringer/portfolio:latest
    ports:
      - "3000:3000"
    environment:
      ADMIN_EMAIL: admin@example.com
      ADMIN_PASSWORD: secure-password
      API_SECRET: random-secret-key
      # Optional: SSO via env vars
      # OIDC_ISSUER: https://accounts.google.com
      # OIDC_CLIENT_ID: your-client-id
      # OIDC_CLIENT_SECRET: your-client-secret
    volumes:
      - portfolio-data:/app/data
    restart: unless-stopped

volumes:
  portfolio-data:
```

### Option 2: Local Development

```bash
# Clone the repository
git clone https://github.com/FTMahringer/Portfolio.git
cd Portfolio

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your values

# Initialize the database
npm run db:push

# Run the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) for the public site and [http://localhost:3000/admin](http://localhost:3000/admin) for the admin dashboard.

## 📋 Environment Variables

### Required
| Variable | Description | Example |
|----------|-------------|---------|
| `ADMIN_EMAIL` | Default admin email (auto-seeded on first start) | `admin@example.com` |
| `ADMIN_PASSWORD` | Default admin password | `secure-password` |
| `API_SECRET` | Secret for API authentication | `random-secret-key` |

### Optional
| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database path | `file:./data/portfolio.db` |
| `NEXT_PUBLIC_BASE_URL` | Public URL for OG images and canonical links | `http://localhost:3000` |
| `RESEND_API_KEY` | API key for email submissions | - |
| `CONTACT_EMAIL` | Email address to receive contact form submissions | - |
| `OIDC_ISSUER` | OIDC provider issuer URL (env var fallback) | - |
| `OIDC_CLIENT_ID` | OIDC client ID (env var fallback) | - |
| `OIDC_CLIENT_SECRET` | OIDC client secret (env var fallback) | - |

## 🐳 Docker Tags

We publish multi-platform images (amd64, arm64) to both Docker Hub and GitHub Container Registry:

| Tag | Description | Example |
|-----|-------------|---------|
| `latest` | Latest stable release | `ftmahringer/portfolio:latest` |
| `X.Y.Z` | Exact version | `ftmahringer/portfolio:0.1.0` |
| `X.Y` | Latest patch in X.Y.* | `ftmahringer/portfolio:0.1` |
| `X` | Latest minor/patch in X.* | `ftmahringer/portfolio:0` |

**Recommendation:** Use `X.Y` for production (e.g., `0.1`) to get patch updates automatically while avoiding breaking changes.

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Database:** [SQLite](https://www.sqlite.org/) + [Drizzle ORM](https://orm.drizzle.team/)
- **Auth:** [Argon2](https://github.com/ranisalt/node-argon2) + [jose](https://github.com/panva/jose) (OIDC)
- **Content:** [MDX](https://mdxjs.com/) + [gray-matter](https://github.com/jonschlinkert/gray-matter)
- **Search:** [Fuse.js](https://fusejs.io/)
- **Email:** [Resend](https://resend.com/)

## 🐛 Troubleshooting

### Port 3000 already in use
```bash
# Change port in docker run
docker run -p 8080:3000 ...

# Or in docker-compose.yml
ports:
  - "8080:3000"
```

### Database locked errors
The SQLite database is in `/app/data/portfolio.db` inside the container. Make sure it''s persisted in a volume and not shared across multiple container instances.

### Admin login not working
If you changed `ADMIN_EMAIL` or `ADMIN_PASSWORD` after the first start, the admin user was already seeded. Either:
1. Delete the volume and restart (resets database), or
2. Use the existing credentials, or
3. Manually update the password via SQL: `npm run db:studio` → users table

## 📄 License

[MIT](LICENSE) — Feel free to use this template for your own portfolio!

---

**Need help?** Open an issue on [GitHub](https://github.com/FTMahringer/Portfolio/issues).
