import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { validateSession, SESSION_COOKIE_NAME } from './auth';

export async function requireAdminSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = await validateSession(sessionId);
  if (!session) {
    redirect('/admin');
  }
  return session;
}
