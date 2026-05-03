import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { deleteSession, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(_request: NextRequest) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionId) {
    await deleteSession(sessionId).catch(() => {});
  }

  const response = NextResponse.redirect(
    new URL('/admin', _request.url),
  );
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
