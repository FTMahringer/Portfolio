import { NextRequest, NextResponse } from 'next/server';
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { getTagUsage } from '@/lib/tags';

async function requireAuth(req: NextRequest) {
  const cookie = req.headers.get('cookie') ?? '';
  const match = cookie.split(';').map(c => c.trim()).find(c => c.startsWith(`${SESSION_COOKIE_NAME}=`));
  if (!match) return false;
  const sid = match.split('=')[1];
  return (await validateSession(sid)) !== null;
}

export async function GET(req: NextRequest) {
  if (!await requireAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const slug = new URL(req.url).searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });
  const items = getTagUsage(slug);
  return NextResponse.json(items);
}
