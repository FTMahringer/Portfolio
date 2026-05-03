import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, oidcProviders } from '@/db/schema';
import { createSession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { extractClientIP } from '@/lib/cidr';
import { eq } from 'drizzle-orm';

const OIDC_CV_COOKIE = 'oidc_cv';
const OIDC_STATE_COOKIE = 'oidc_state';
const LOGIN_ERROR_URL = '/admin/login?error=sso_failed';

interface OidcDiscovery {
  token_endpoint: string;
  issuer: string;
}

interface TokenResponse {
  id_token?: string;
  error?: string;
}

interface IdTokenPayload {
  iss: string;
  aud: string | string[];
  exp: number;
  email?: string;
  sub?: string;
}

interface StateCookie {
  state: string;
  providerId: number | 'env';
}

async function fetchDiscovery(issuer: string): Promise<OidcDiscovery> {
  const res = await fetch(`${issuer}/.well-known/openid-configuration`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`Discovery fetch failed: ${res.status}`);
  return res.json() as Promise<OidcDiscovery>;
}

function decodeIdToken(idToken: string): IdTokenPayload {
  const parts = idToken.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT format');
  const payload = Buffer.from(parts[1], 'base64url').toString('utf8');
  return JSON.parse(payload) as IdTokenPayload;
}

function parseStateCookie(raw: string): StateCookie {
  try {
    const parsed = JSON.parse(raw) as StateCookie;
    if (typeof parsed.state === 'string') return parsed;
  } catch {
    // fall through
  }
  // backward compat: raw value is just the state string
  return { state: raw, providerId: 'env' };
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');

  const rawStateCookie = request.cookies.get(OIDC_STATE_COOKIE)?.value;
  if (!stateParam || !rawStateCookie) {
    return NextResponse.redirect(new URL(LOGIN_ERROR_URL, request.url));
  }

  const parsedState = parseStateCookie(rawStateCookie);
  if (stateParam !== parsedState.state) {
    console.error('[callback] state mismatch');
    return NextResponse.redirect(new URL(LOGIN_ERROR_URL, request.url));
  }

  const codeVerifier = request.cookies.get(OIDC_CV_COOKIE)?.value;
  if (!code || !codeVerifier) {
    console.error('[callback] missing code or code_verifier');
    return NextResponse.redirect(new URL(LOGIN_ERROR_URL, request.url));
  }

  let issuer: string;
  let clientId: string;
  let clientSecret: string;
  let redirectUri: string;
  let allowedEmail: string | null | undefined;

  if (parsedState.providerId === 'env') {
    const envIssuer = process.env.OIDC_ISSUER;
    const envClientId = process.env.OIDC_CLIENT_ID;
    const envClientSecret = process.env.OIDC_CLIENT_SECRET;
    if (!envIssuer || !envClientId || !envClientSecret) {
      return NextResponse.redirect(new URL(LOGIN_ERROR_URL, request.url));
    }
    issuer = envIssuer;
    clientId = envClientId;
    clientSecret = envClientSecret;
    redirectUri = process.env.OIDC_REDIRECT_URI ?? `${origin}/api/admin/auth/callback`;
    allowedEmail = process.env.OIDC_ALLOWED_EMAIL;
  } else {
    const [p] = await db.select().from(oidcProviders).where(eq(oidcProviders.id, parsedState.providerId)).limit(1);
    if (!p) {
      return NextResponse.redirect(new URL(LOGIN_ERROR_URL, request.url));
    }
    issuer = p.issuerUrl;
    clientId = p.clientId;
    clientSecret = p.clientSecret;
    redirectUri = p.redirectUri ?? `${origin}/api/admin/auth/callback`;
    allowedEmail = p.allowedEmail;
  }

  let discovery: OidcDiscovery;
  try {
    discovery = await fetchDiscovery(issuer);
  } catch (err) {
    console.error('[callback] discovery error', err);
    return NextResponse.redirect(new URL(LOGIN_ERROR_URL, request.url));
  }

  let tokenData: TokenResponse;
  try {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
      code_verifier: codeVerifier,
    });

    const tokenRes = await fetch(discovery.token_endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    tokenData = await tokenRes.json() as TokenResponse;
    if (!tokenRes.ok || tokenData.error) {
      throw new Error(tokenData.error ?? `Token exchange failed: ${tokenRes.status}`);
    }
  } catch (err) {
    console.error('[callback] token exchange error', err);
    return NextResponse.redirect(new URL(LOGIN_ERROR_URL, request.url));
  }

  if (!tokenData.id_token) {
    console.error('[callback] no id_token in response');
    return NextResponse.redirect(new URL(LOGIN_ERROR_URL, request.url));
  }

  let payload: IdTokenPayload;
  try {
    payload = decodeIdToken(tokenData.id_token);
  } catch (err) {
    console.error('[callback] jwt decode error', err);
    return NextResponse.redirect(new URL(LOGIN_ERROR_URL, request.url));
  }

  const now = Math.floor(Date.now() / 1000);
  const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];

  if (payload.iss !== issuer) {
    console.error('[callback] issuer mismatch', payload.iss, issuer);
    return NextResponse.redirect(new URL(LOGIN_ERROR_URL, request.url));
  }
  if (!aud.includes(clientId)) {
    console.error('[callback] audience mismatch');
    return NextResponse.redirect(new URL(LOGIN_ERROR_URL, request.url));
  }
  if (payload.exp <= now) {
    console.error('[callback] token expired');
    return NextResponse.redirect(new URL(LOGIN_ERROR_URL, request.url));
  }
  if (allowedEmail && payload.email !== allowedEmail) {
    console.error('[callback] email not allowed');
    return NextResponse.redirect(new URL(LOGIN_ERROR_URL, request.url));
  }

  const adminUsers = await db.select().from(users).limit(1);
  const adminUser = adminUsers[0];
  if (!adminUser) {
    console.error('[callback] no admin user found in DB');
    return NextResponse.redirect(new URL(LOGIN_ERROR_URL, request.url));
  }

  const ip = extractClientIP(request.headers) ?? undefined;
  const userAgent = request.headers.get('user-agent') ?? undefined;
  const { id: sessionId, expiresAt } = await createSession(adminUser.id, ip, userAgent);

  const response = NextResponse.redirect(new URL('/admin', request.url));

  response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(expiresAt * 1000),
    path: '/',
  });

  response.cookies.set(OIDC_CV_COOKIE, '', { maxAge: 0, path: '/' });
  response.cookies.set(OIDC_STATE_COOKIE, '', { maxAge: 0, path: '/' });

  return response;
}
