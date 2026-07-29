import { NextRequest, NextResponse } from 'next/server';

import { adminMiddleware } from '@/lib/proxy';
import { normalizeLocalePath } from '@/lib/locale-routing';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/api/')) {
    const normalizedPath = normalizeLocalePath(pathname);
    if (normalizedPath && normalizedPath !== pathname) {
      const url = request.nextUrl.clone();
      url.pathname = normalizedPath;
      return NextResponse.redirect(url);
    }
  }

  const result = adminMiddleware(request);
  return result ?? NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)', '/api/admin/:path*'],
};
