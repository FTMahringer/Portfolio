import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/session';
import { getSiteSettings, normalizeSiteSettings, saveSiteSettings } from '@/lib/site-settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  await requireAdminSession();
  return NextResponse.json({ settings: getSiteSettings() });
}

export async function PUT(request: Request) {
  await requireAdminSession();

  try {
    const body = (await request.json()) as { settings?: unknown };

    if (!body || !body.settings) {
      return NextResponse.json({ error: 'Missing settings payload.' }, { status: 400 });
    }

    const settings = saveSiteSettings(normalizeSiteSettings(body.settings));
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save site settings.' },
      { status: 500 },
    );
  }
}
