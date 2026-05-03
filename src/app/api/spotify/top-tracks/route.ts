import { NextRequest, NextResponse } from 'next/server';
import { getTopTracks } from '@/lib/spotify';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const timeRange = (searchParams.get('time_range') || 'medium_term') as 'short_term' | 'medium_term' | 'long_term';

    const data = await getTopTracks(limit, timeRange);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in top-tracks API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top tracks' },
      { status: 500 }
    );
  }
}
