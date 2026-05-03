# SSO / OIDC Login for Admin

The portfolio admin supports generic OpenID Connect (OIDC) single sign-on as an alternative to email+password login. Any standard OIDC provider works — this guide covers PocketID and Authentik specifically.

---

## Environment Variables

Add these to your `.env.local` (or production environment):

```env
# Required — all three must be set to enable SSO
OIDC_ISSUER=https://your-provider.example.com
OIDC_CLIENT_ID=portfolio-admin
OIDC_CLIENT_SECRET=your-secret
OIDC_REDIRECT_URI=https://your-portfolio.example.com/api/admin/auth/callback

# Optional — restrict login to a specific email address.
# If unset, any successfully authenticated user from the provider is granted admin access.
OIDC_ALLOWED_EMAIL=admin@example.com
```

> **Note:** `OIDC_REDIRECT_URI` must exactly match the redirect URI registered in your OIDC provider.

---

## How It Works

1. User clicks **Continue with SSO** on `/admin/login`.
2. App fetches `{OIDC_ISSUER}/.well-known/openid-configuration` to discover endpoints.
3. A PKCE code verifier + challenge (S256) and a random state token are generated.
4. User is redirected to the provider's authorization endpoint.
5. After login, the provider redirects back to `/api/admin/auth/callback?code=...&state=...`.
6. The app exchanges the code for an `id_token`, validates `iss`, `aud`, and `exp`, optionally checks the email.
7. A session is created with `createSession()` and the `admin_sid` cookie is set — identical to password login.

---

## Configuring PocketID

1. Open PocketID → **Applications** → **New Application**.
2. Set **Name**: `Portfolio Admin`.
3. Set **Redirect URI**: `https://your-portfolio.example.com/api/admin/auth/callback`.
4. Copy the **Client ID** and **Client Secret**.
5. The issuer is your PocketID base URL (e.g. `https://id.example.com`).

```env
OIDC_ISSUER=https://id.example.com
OIDC_CLIENT_ID=<client-id-from-pocketid>
OIDC_CLIENT_SECRET=<client-secret-from-pocketid>
OIDC_REDIRECT_URI=https://your-portfolio.example.com/api/admin/auth/callback
```

---

## Configuring Authentik

1. Open Authentik → **Applications** → **Create** (type: **OAuth2/OpenID Provider**).
2. Set **Name**: `Portfolio Admin`.
3. **Client Type**: Confidential.
4. **Redirect URIs**: `https://your-portfolio.example.com/api/admin/auth/callback`.
5. **Signing Key**: select your default key.
6. Copy **Client ID** and **Client Secret** from the provider page.
7. The issuer is displayed in the provider metadata — typically `https://authentik.example.com/application/o/<slug>/`.

```env
OIDC_ISSUER=https://authentik.example.com/application/o/portfolio-admin/
OIDC_CLIENT_ID=<client-id>
OIDC_CLIENT_SECRET=<client-secret>
OIDC_REDIRECT_URI=https://your-portfolio.example.com/api/admin/auth/callback
```

> Authentik appends a trailing slash to the issuer. Make sure `OIDC_ISSUER` matches exactly what appears in `iss` in the id_token (check the discovery doc at `{OIDC_ISSUER}/.well-known/openid-configuration`).

---

## Testing

1. Set all four `OIDC_*` env vars and restart the dev server.
2. Visit `/admin/login` — a **Continue with SSO** button should appear above the password form.
3. Click it and complete login at your provider.
4. You should be redirected to `/admin` and be logged in.

To verify the discovery endpoint works before testing end-to-end:
```bash
curl https://your-provider.example.com/.well-known/openid-configuration
```

---

## Security Notes

- **PKCE (S256)** is used on every SSO flow, preventing authorization code interception attacks.
- **State parameter** is validated to prevent CSRF.
- The `id_token` payload is decoded without full signature verification — this is safe because the token is obtained directly from the provider's token endpoint over HTTPS (not from a URL parameter or untrusted source). The `iss`, `aud`, and `exp` claims are still validated.
- PKCE and state values are stored in short-lived (10 min) `httpOnly`, `SameSite=Lax` cookies and cleared after use.
- Set `OIDC_ALLOWED_EMAIL` to lock down SSO to a specific account, especially if your provider has multiple users.
- SSO sessions use the same `admin_sid` cookie and TTL as password-based sessions (7 days by default).
