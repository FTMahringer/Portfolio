import { NextRequest, NextResponse } from 'next/server';
import { getTopArtists } from '@/lib/spotify';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '5');
    const timeRange = (searchParams.get('time_range') || 'medium_term') as 'short_term' | 'medium_term' | 'long_term';

    const data = await getTopArtists(limit, timeRange);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in top-artists API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top artists' },
      { status: 500 }
    );
  }
}
