import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sessions } from '@/db/schema';
import { eq, gt, and, ne } from 'drizzle-orm';
import { requireAdminSession } from '@/lib/session';
import { SESSION_COOKIE_NAME } from '@/lib/auth';

export async function GET() {
  await requireAdminSession();

  const now = Math.floor(Date.now() / 1000);
  const active = await db
    .select()
    .from(sessions)
    .where(gt(sessions.expiresAt, now))
    .orderBy(sessions.createdAt);

  return NextResponse.json({ sessions: active });
}

export async function DELETE(request: NextRequest) {
  const current = await requireAdminSession();

  const { searchParams } = new URL(request.url);
  const targetId = searchParams.get('id');
  const revokeOthers = searchParams.get('others') === '1';

  if (revokeOthers) {
    await db.delete(sessions).where(
      and(eq(sessions.userId, current.userId), ne(sessions.id, current.id))
    );
    return NextResponse.json({ ok: true });
  }

  if (!targetId) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  await db.delete(sessions).where(
    and(eq(sessions.id, targetId), eq(sessions.userId, current.userId))
  );

  const response = NextResponse.json({ ok: true });
  if (targetId === current.id) {
    response.cookies.delete(SESSION_COOKIE_NAME);
  }
  return response;
}
