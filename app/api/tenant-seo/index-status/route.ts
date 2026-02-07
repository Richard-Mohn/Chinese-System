import { NextRequest, NextResponse } from 'next/server';
import { getUrlIndexStatus } from '@/lib/google-analytics';
import { verifyApiAuth } from '@/lib/apiAuth';

/**
 * GET /api/tenant-seo/index-status?url=xxx
 * 
 * Returns Google index status for a specific URL.
 * Requires authentication.
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyApiAuth(request);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    // Validate URL belongs to mohnmenu.com
    if (!url.startsWith('https://mohnmenu.com')) {
      return NextResponse.json({ error: 'URL must be on mohnmenu.com' }, { status: 400 });
    }

    const data = await getUrlIndexStatus(url);

    return NextResponse.json({
      success: true,
      data,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Index status API error:', error);
    
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json({
      error: 'Failed to check index status',
      details: message,
    }, { status: 500 });
  }
}
