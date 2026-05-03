import { NextRequest, NextResponse } from 'next/server';
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/auth';

// Publicly accessible — no middleware auth (excluded in proxy.ts)
// Returns whether the current request has a valid admin session
export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionId) {
    return NextResponse.json({ authenticated: false });
  }

  const session = await validateSession(sessionId);
  if (!session) {
    const response = NextResponse.json({ authenticated: false });
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  return NextResponse.json({ authenticated: true, userId: session.userId });
}
