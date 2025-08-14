import { NextRequest, NextResponse } from 'next/server';
import { searchLocationsWithGoogle } from '@/lib/googleMapsService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  try {
    const locations = await searchLocationsWithGoogle(query);
    return NextResponse.json({ 
      success: true, 
      query,
      count: locations.length,
      locations 
    });
  } catch (error) {
    console.error('Location search error:', error);
    return NextResponse.json({ 
      error: 'Failed to search locations',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
