import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsData, daysAgo, today } from '@/lib/google-analytics';

/**
 * GET /api/tenant-seo/analytics?slug=xxx&days=28
 * 
 * Returns GA4 analytics data for a tenant's pages.
 * Filters by slug to only return data for that business.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const days = parseInt(searchParams.get('days') || '28');

    if (!slug) {
      return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 });
    }

    if (days < 1 || days > 90) {
      return NextResponse.json({ error: 'Days must be between 1 and 90' }, { status: 400 });
    }

    const startDate = daysAgo(days);
    const endDate = today();

    const data = await getAnalyticsData(slug, startDate, endDate);

    return NextResponse.json({
      success: true,
      data,
      cached: false,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    if (message.includes('GA4_PROPERTY_ID') || message.includes('property') || message.includes('404')) {
      return NextResponse.json({
        error: 'Analytics not configured',
        details: 'GA4 property ID needs to be set in environment variables (GA4_PROPERTY_ID).',
        setup: true,
      }, { status: 503 });
    }

    return NextResponse.json({
      error: 'Failed to fetch analytics data',
      details: message,
    }, { status: 500 });
  }
}
