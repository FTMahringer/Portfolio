import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/db';
import { oidcProviders } from '@/db/schema';
import { eq } from 'drizzle-orm';

const OIDC_CV_COOKIE = 'oidc_cv';
const OIDC_STATE_COOKIE = 'oidc_state';
const PKCE_MAX_AGE = 60 * 10;

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const providerIdParam = searchParams.get('provider_id');

  let issuer: string | undefined;
  let clientId: string | undefined;
  let clientSecret: string | undefined;
  let redirectUri: string | undefined;
  let dbProviderId: number | 'env' = 'env';

  if (providerIdParam) {
    const numericId = parseInt(providerIdParam, 10);
    if (!isNaN(numericId)) {
      const [p] = await db.select().from(oidcProviders).where(eq(oidcProviders.id, numericId)).limit(1);
      if (p) {
        issuer = p.issuerUrl;
        clientId = p.clientId;
        clientSecret = p.clientSecret;
        redirectUri = p.redirectUri ?? undefined;
        dbProviderId = p.id;
      }
    }
  }

  if (!issuer) {
    const [p] = await db.select().from(oidcProviders).where(eq(oidcProviders.enabled, 1)).limit(1);
    if (p) {
      issuer = p.issuerUrl;
      clientId = p.clientId;
      clientSecret = p.clientSecret;
      redirectUri = p.redirectUri ?? undefined;
      dbProviderId = p.id;
    } else {
      issuer = process.env.OIDC_ISSUER;
      clientId = process.env.OIDC_CLIENT_ID;
      clientSecret = process.env.OIDC_CLIENT_SECRET;
      redirectUri = process.env.OIDC_REDIRECT_URI;
      dbProviderId = 'env';
    }
  }

  if (!issuer || !clientId || !clientSecret) {
    return NextResponse.json({ error: 'SSO not configured' }, { status: 503 });
  }

  const callbackUri = redirectUri ?? `${origin}/api/admin/auth/callback`;

  let authorizationEndpoint: string;
  try {
    const disc = await fetch(`${issuer}/.well-known/openid-configuration`, { next: { revalidate: 0 } });
    if (!disc.ok) throw new Error(`Discovery fetch failed: ${disc.status}`);
    const config = await disc.json() as { authorization_endpoint: string };
    authorizationEndpoint = config.authorization_endpoint;
  } catch (err) {
    console.error('[sso] discovery error', err);
    return NextResponse.json({ error: 'Failed to fetch OIDC discovery document' }, { status: 502 });
  }

  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
  const state = crypto.randomBytes(16).toString('hex');

  const stateCookieValue = JSON.stringify({ state, providerId: dbProviderId });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUri,
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
  response.cookies.set(OIDC_STATE_COOKIE, stateCookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: PKCE_MAX_AGE,
    path: '/',
  });
  return response;
}
