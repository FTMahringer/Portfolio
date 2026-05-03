# Docker Compose Environment Variables

This file documents the environment variables used in the portfolio Docker container.

## Required Variables

- `ADMIN_EMAIL` - Email for the admin account (created on first start)
- `ADMIN_PASSWORD` - Password for the admin account
- `API_SECRET` - Bearer token for the content API

## Optional: OIDC/SSO Authentication

- `OIDC_ISSUER` - OIDC provider URL
- `OIDC_CLIENT_ID` - OIDC client ID
- `OIDC_CLIENT_SECRET` - OIDC client secret
- `OIDC_REDIRECT_URI` - OAuth callback URL
- `OIDC_ALLOWED_EMAIL` - Allowed email address

## Optional: Spotify Integration

To enable Spotify "Now Playing" widget:

1. Get credentials from https://developer.spotify.com/dashboard
2. Add the redirect URI to your Spotify app settings:
   - `https://your-domain.com/api/spotify/callback`
3. Set these environment variables:

- `SPOTIFY_CLIENT_ID` - Spotify app client ID
- `SPOTIFY_CLIENT_SECRET` - Spotify app client secret
- `SPOTIFY_REFRESH_TOKEN` - OAuth refresh token (see below)

### Getting the Refresh Token

After setting `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`, visit:

```
https://your-domain.com/api/spotify/callback?code=<authorize-first>
```

Or use the authorization flow:
1. Go to: `https://accounts.spotify.com/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=https://your-domain.com/api/spotify/callback&scope=user-read-currently-playing+user-read-recently-played+user-top-read`
2. Authorize the app
3. Copy the refresh token from the success page
4. Add to your environment variables

## Optional: Analytics

### Umami Analytics

- `NEXT_PUBLIC_UMAMI_WEBSITE_ID` - Umami website ID
- `NEXT_PUBLIC_UMAMI_URL` - Umami analytics server URL

### Plausible Analytics

- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` - Your domain for Plausible

## Volume Mounts

- `/app/data` - SQLite database and persistent data
- `/app/content` - (Optional) MDX content files for live editing
- `/app/config` - (Optional) Configuration files for live editing
