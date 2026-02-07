import { NextRequest, NextResponse } from 'next/server';
import { getSearchConsoleData, daysAgo, today } from '@/lib/google-analytics';
import { verifyApiAuth } from '@/lib/apiAuth';

/**
 * GET /api/tenant-seo/search-console?slug=xxx&days=28
 * 
 * Returns Search Console performance data for a tenant's pages.
 * Requires authentication.
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyApiAuth(request);
    if (auth.error) return auth.error;

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

    const data = await getSearchConsoleData(slug, startDate, endDate);

    return NextResponse.json({
      success: true,
      data,
      cached: false,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Search Console API error:', error);
    
    // Provide helpful error messages
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    if (message.includes('not verified') || message.includes('403')) {
      return NextResponse.json({
        error: 'Search Console not configured',
        details: 'mohnmenu.com needs to be verified in Google Search Console with the service account added as a user.',
        setup: true,
      }, { status: 503 });
    }

    return NextResponse.json({
      error: 'Failed to fetch Search Console data',
      details: message,
    }, { status: 500 });
  }
}
