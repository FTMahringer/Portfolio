import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const OIDC_CV_COOKIE = 'oidc_cv';
const OIDC_STATE_COOKIE = 'oidc_state';
const PKCE_MAX_AGE = 60 * 10; // 10 minutes

export async function GET(_req: NextRequest) {
  const issuer = process.env.OIDC_ISSUER;
  const clientId = process.env.OIDC_CLIENT_ID;
  const clientSecret = process.env.OIDC_CLIENT_SECRET;
  const redirectUri = process.env.OIDC_REDIRECT_URI;

  if (!issuer || !clientId || !clientSecret) {
    return NextResponse.json({ error: 'SSO not configured' }, { status: 503 });
  }

  // Fetch OIDC discovery document
  let authorizationEndpoint: string;
  try {
    const disc = await fetch(`${issuer}/.well-known/openid-configuration`, {
      next: { revalidate: 0 },
    });
    if (!disc.ok) throw new Error(`Discovery fetch failed: ${disc.status}`);
    const config = await disc.json() as { authorization_endpoint: string };
    authorizationEndpoint = config.authorization_endpoint;
  } catch (err) {
    console.error('[sso] discovery error', err);
    return NextResponse.json({ error: 'Failed to fetch OIDC discovery document' }, { status: 502 });
  }

  // PKCE
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');

  // State
  const state = crypto.randomBytes(16).toString('hex');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri ?? `${process.env.NEXTAUTH_URL ?? ''}/api/admin/auth/callback`,
    response_type: 'code',
    scope: 'openid profile email',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  const response = NextResponse.redirect(`${authorizationEndpoint}?${params.toString()}`);

  response.cookies.set(OIDC_CV_COOKIE, codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: PKCE_MAX_AGE,
    path: '/',
  });

  response.cookies.set(OIDC_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: PKCE_MAX_AGE,
    path: '/',
  });

  return response;
}
