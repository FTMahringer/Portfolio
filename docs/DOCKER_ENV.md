# Docker Compose Environment Variables

This file documents the environment variables used in the portfolio Docker container.

## Required Variables

- `ADMIN_EMAIL` - Email for the admin account (seeded on first start)
- `ADMIN_PASSWORD` - Password for the admin account (seeded on first start)
- `API_SECRET` - Bearer token for the content API

> Admin seeding runs only when the database has no users yet. Changing these vars later does not automatically rotate credentials.

## Optional: OIDC/SSO Authentication

- `OIDC_ISSUER` - OIDC provider URL
- `OIDC_CLIENT_ID` - OIDC client ID
- `OIDC_CLIENT_SECRET` - OIDC client secret
- `OIDC_REDIRECT_URI` - OAuth callback URL
- `OIDC_ALLOWED_EMAIL` - Allowed email address



## Optional: Analytics

### Umami Analytics

- `NEXT_PUBLIC_UMAMI_WEBSITE_ID` - Umami website ID
- `NEXT_PUBLIC_UMAMI_URL` - Umami analytics server URL

### Plausible Analytics

- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` - Your domain for Plausible

## Local Development Note

For non-Docker local development, after setting `ADMIN_EMAIL` and `ADMIN_PASSWORD`, run:

- `npm run db:push`
- `npm run db:seed`

## Volume Mounts

- `/app/data` - SQLite database and persistent data
- `/app/content` - (Optional) MDX content files for live editing
- `/app/config` - (Optional) Configuration files for live editing
