import { NextRequest, NextResponse } from 'next/server';

import { SESSION_COOKIE_NAME } from './constants';
import { isInternalIP, extractClientIP } from './cidr';
import { localeForPath, stripLocaleFromPath } from './locale-routing';

const PROTECTED_PAGE_PREFIXES = new Set(['/admin', '/content', '/settings']);

export function adminMiddleware(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';
  const pathWithoutLocale = stripLocaleFromPath(normalizedPath);
  const isAdminPage =
    PROTECTED_PAGE_PREFIXES.has(pathWithoutLocale) ||
    Array.from(PROTECTED_PAGE_PREFIXES).some((prefix) => pathWithoutLocale.startsWith(`${prefix}/`));
  const isAdminApi = normalizedPath.startsWith('/api/admin');

  if (!isAdminPage && !isAdminApi) return null;

  // Allow public auth/status endpoints without an existing admin session.
  const publicAdminApi = new Set([
    '/api/admin/login',
    '/api/admin/status',
    '/api/admin/auth/sso',
    '/api/admin/auth/callback',
    '/api/admin/auth/sso-available',
  ]);
  const isPublicApi = publicAdminApi.has(normalizedPath);

  if (isPublicApi) return null;

  // CIDR bypass — skip cookie check for internal IPs
  const clientIP = extractClientIP(request.headers);
  if (clientIP && isInternalIP(clientIP)) return null;

  // Check session cookie existence (no DB lookup — Edge runtime limitation)
  // Real DB validation happens in each server component / API route
  const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionId) {
    if (isAdminApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const locale = localeForPath(normalizedPath);
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  return null; // Cookie present — let the request through; server components will validate DB
}
