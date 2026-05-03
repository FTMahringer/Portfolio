import { db } from '@/db';
import { sessions } from '@/db/schema';
import { eq, and, gt } from 'drizzle-orm';

export { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from './constants';
import { SESSION_MAX_AGE_SECONDS } from './constants';

const SESSION_MAX_AGE = SESSION_MAX_AGE_SECONDS;

export async function createSession(userId: number, ip?: string, userAgent?: string) {
  const id = crypto.randomUUID();
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;

  await db.insert(sessions).values({
    id,
    userId,
    expiresAt,
    createdAt: Math.floor(Date.now() / 1000),
    ip: ip ?? null,
    userAgent: userAgent ?? null,
  });

  return { id, expiresAt };
}

export async function validateSession(sessionId: string | undefined) {
  if (!sessionId) return null;

  const now = Math.floor(Date.now() / 1000);
  const result = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, now)))
    .limit(1);

  return result[0] ?? null;
}

export async function deleteSession(sessionId: string) {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function deleteAllSessionsForUser(userId: number) {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}
