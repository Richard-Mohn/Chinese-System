import { NextRequest, NextResponse } from 'next/server';
import { getSearchConsoleData, daysAgo, today } from '@/lib/google-analytics';
import { verifyApiAuth } from '@/lib/apiAuth';

// Demo Search Console data with realistic local business patterns
function generateDemoSearchConsoleData(slug: string, days: number) {
  const multiplier = days / 28;
  const impressions = Math.floor(4200 * multiplier);
  const clicks = Math.floor(380 * multiplier);
  return {
    impressions,
    clicks,
    ctr: parseFloat(((clicks / impressions)).toFixed(3)),
    position: 14.2,
    topQueries: [
      { query: `${slug.replace(/-/g, ' ')} menu`, impressions: Math.floor(820 * multiplier), clicks: Math.floor(95 * multiplier), ctr: 11.6, position: 3.2 },
      { query: `${slug.replace(/-/g, ' ')} order online`, impressions: Math.floor(540 * multiplier), clicks: Math.floor(72 * multiplier), ctr: 13.3, position: 5.1 },
      { query: `restaurants near me richmond`, impressions: Math.floor(1800 * multiplier), clicks: Math.floor(45 * multiplier), ctr: 2.5, position: 18.5 },
      { query: `best food delivery richmond va`, impressions: Math.floor(920 * multiplier), clicks: Math.floor(38 * multiplier), ctr: 4.1, position: 12.8 },
      { query: `${slug.replace(/-/g, ' ')} hours`, impressions: Math.floor(310 * multiplier), clicks: Math.floor(42 * multiplier), ctr: 13.5, position: 2.8 },
      { query: `${slug.replace(/-/g, ' ')} delivery`, impressions: Math.floor(280 * multiplier), clicks: Math.floor(35 * multiplier), ctr: 12.5, position: 4.5 },
      { query: `local food ordering no commission`, impressions: Math.floor(150 * multiplier), clicks: Math.floor(18 * multiplier), ctr: 12.0, position: 8.3 },
    ],
    topPages: [
      { page: `https://mohnmenu.com/${slug}`, impressions: Math.floor(2100 * multiplier), clicks: Math.floor(210 * multiplier), ctr: 10.0, position: 8.5 },
      { page: `https://mohnmenu.com/${slug}/menu`, impressions: Math.floor(1200 * multiplier), clicks: Math.floor(98 * multiplier), ctr: 8.2, position: 11.2 },
      { page: `https://mohnmenu.com/order/${slug}`, impressions: Math.floor(600 * multiplier), clicks: Math.floor(52 * multiplier), ctr: 8.7, position: 14.3 },
    ],
    devices: [
      { device: 'MOBILE', impressions: Math.floor(impressions * 0.68), clicks: Math.floor(clicks * 0.72) },
      { device: 'DESKTOP', impressions: Math.floor(impressions * 0.26), clicks: Math.floor(clicks * 0.22) },
      { device: 'TABLET', impressions: Math.floor(impressions * 0.06), clicks: Math.floor(clicks * 0.06) },
    ],
    demoData: true,
    poweredBy: 'Real data patterns from NeighborTechs.com',
  };
}

/**
 * GET /api/tenant-seo/search-console?slug=xxx&days=28
 */
export async function GET(request: NextRequest) {
  try {
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

    try {
      const startDate = daysAgo(days);
      const endDate = today();
      const data = await getSearchConsoleData(slug, startDate, endDate);
      return NextResponse.json({ success: true, data, cached: false, generatedAt: new Date().toISOString() });
    } catch {
      // Fallback to demo data when Google APIs aren't configured
      const data = generateDemoSearchConsoleData(slug, days);
      return NextResponse.json({ success: true, data, cached: false, generatedAt: new Date().toISOString() });
    }
  } catch (error) {
    console.error('Search Console API error:', error);
    return NextResponse.json({ error: 'Failed to fetch Search Console data' }, { status: 500 });
  }
}
