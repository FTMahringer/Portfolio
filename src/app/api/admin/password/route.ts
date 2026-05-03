import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import argon2 from 'argon2';
import { requireAdminSession } from '@/lib/session';

export async function PUT(request: NextRequest) {
  const session = await requireAdminSession();

  const body = await request.json().catch(() => ({})) as {
    currentPassword?: string;
    newPassword?: string;
    newEmail?: string;
  };

  const userRow = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  if (!userRow[0]) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (body.newPassword) {
    if (!body.currentPassword) {
      return NextResponse.json({ error: 'currentPassword required' }, { status: 400 });
    }
    const valid = await argon2.verify(userRow[0].passwordHash, body.currentPassword);
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }
    if (body.newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }
    const hash = await argon2.hash(body.newPassword);
    await db.update(users).set({ passwordHash: hash }).where(eq(users.id, session.userId));
  }

  if (body.newEmail) {
    if (!body.currentPassword) {
      return NextResponse.json({ error: 'currentPassword required' }, { status: 400 });
    }
    const valid = await argon2.verify(userRow[0].passwordHash, body.currentPassword);
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }
    await db.update(users).set({ email: body.newEmail }).where(eq(users.id, session.userId));
  }

  return NextResponse.json({ ok: true });
}
