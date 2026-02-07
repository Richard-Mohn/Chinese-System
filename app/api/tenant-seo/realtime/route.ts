import { NextRequest, NextResponse } from 'next/server';
import { getRealtimeData } from '@/lib/google-analytics';

/**
 * GET /api/tenant-seo/realtime?slug=xxx
 * 
 * Returns real-time GA4 data for a tenant's pages.
 * Shows active visitors, pages being viewed, traffic sources.
 * Professional tier only.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 });
    }

    const data = await getRealtimeData(slug);

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Realtime API error:', error);
    
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json({
      error: 'Failed to fetch realtime data',
      details: message,
    }, { status: 500 });
  }
}
