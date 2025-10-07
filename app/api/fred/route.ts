import { NextRequest, NextResponse } from 'next/server';

const FRED_API_KEY = process.env.NEXT_PUBLIC_FRED_API_KEY;
const FRED_API_BASE = 'https://api.stlouisfed.org/fred/series/observations';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const seriesId = searchParams.get('series_id');
  const limit = searchParams.get('limit') || '100';

  if (!seriesId) {
    return NextResponse.json(
      { error: 'series_id is required' },
      { status: 400 }
    );
  }

  if (!FRED_API_KEY) {
    return NextResponse.json(
      { error: 'FRED API key not configured' },
      { status: 500 }
    );
  }

  try {
    const url = `${FRED_API_BASE}?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&limit=${limit}&sort_order=desc`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`FRED API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error(`Error fetching FRED data for ${seriesId}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch FRED data' },
      { status: 500 }
    );
  }
}
