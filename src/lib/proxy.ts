import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from './auth';
import { isInternalIP, extractClientIP } from './cidr';

export function adminMiddleware(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  const isAdminPage = pathname.startsWith('/admin');
  const isAdminApi = pathname.startsWith('/api/admin');

  if (!isAdminPage && !isAdminApi) return null;

  // Allow login page and public API endpoints without auth
  const isLoginPage = pathname === '/admin' || pathname === '/admin/';
  const isPublicApi = pathname === '/api/admin/login' || pathname === '/api/admin/status';
  if (isLoginPage || isPublicApi) return null;

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
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return null; // Cookie present — let the request through; server components will validate DB
}
