import { NextResponse } from 'next/server';
import { syncAndGetAllTags } from '@/lib/tags';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const allTags = await syncAndGetAllTags();
    return NextResponse.json(allTags, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch (e) {
    console.error('GET /api/tags', e);
    return NextResponse.json([], { status: 500 });
  }
}
