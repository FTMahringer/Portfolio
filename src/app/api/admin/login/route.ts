import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import argon2 from 'argon2';
import { createSession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { extractClientIP } from '@/lib/cidr';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = result[0];

    if (!user) {
      // Constant-time response to prevent user enumeration
      await argon2.hash('dummy-constant-time-check');
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const ip = extractClientIP(request.headers) ?? undefined;
    const userAgent = request.headers.get('user-agent') ?? undefined;
    const { id: sessionId, expiresAt } = await createSession(user.id, ip, userAgent);

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(expiresAt * 1000),
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('[admin/login]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
