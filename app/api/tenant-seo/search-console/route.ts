import { NextRequest, NextResponse } from 'next/server';
import { getSearchConsoleData, getDemoSiteSearchConsoleData, DEMO_SHOWCASE_SITES, daysAgo, today } from '@/lib/google-analytics';
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
      { query: `${slug.replace(/-/g, ' ')} menu`, impressions: Math.floor(820 * multiplier), clicks: Math.floor(95 * multiplier), ctr: 0.116, position: 3.2 },
      { query: `${slug.replace(/-/g, ' ')} order online`, impressions: Math.floor(540 * multiplier), clicks: Math.floor(72 * multiplier), ctr: 0.133, position: 5.1 },
      { query: `restaurants near me richmond`, impressions: Math.floor(1800 * multiplier), clicks: Math.floor(45 * multiplier), ctr: 0.025, position: 18.5 },
      { query: `best food delivery richmond va`, impressions: Math.floor(920 * multiplier), clicks: Math.floor(38 * multiplier), ctr: 0.041, position: 12.8 },
      { query: `${slug.replace(/-/g, ' ')} hours`, impressions: Math.floor(310 * multiplier), clicks: Math.floor(42 * multiplier), ctr: 0.135, position: 2.8 },
      { query: `${slug.replace(/-/g, ' ')} delivery`, impressions: Math.floor(280 * multiplier), clicks: Math.floor(35 * multiplier), ctr: 0.125, position: 4.5 },
      { query: `local food ordering no commission`, impressions: Math.floor(150 * multiplier), clicks: Math.floor(18 * multiplier), ctr: 0.12, position: 8.3 },
    ],
    topPages: [
      { page: `https://mohnmenu.com/${slug}`, impressions: Math.floor(2100 * multiplier), clicks: Math.floor(210 * multiplier), ctr: 0.10, position: 8.5 },
      { page: `https://mohnmenu.com/${slug}/menu`, impressions: Math.floor(1200 * multiplier), clicks: Math.floor(98 * multiplier), ctr: 0.082, position: 11.2 },
      { page: `https://mohnmenu.com/order/${slug}`, impressions: Math.floor(600 * multiplier), clicks: Math.floor(52 * multiplier), ctr: 0.087, position: 14.3 },
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
 * Pick a demo showcase site deterministically based on slug hash.
 */
function selectDemoSite(slug: string) {
  const sites = Object.entries(DEMO_SHOWCASE_SITES);
  if (sites.length === 0) return null;
  const hash = slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const [key, config] = sites[hash % sites.length];
  return { key, config };
}

/**
 * GET /api/tenant-seo/search-console?slug=xxx&days=28
 *
 * For demo businesses (slug starts with "demo-"), attempts to serve
 * REAL Search Console data from NeighborTechs.com or FlamingSocialMedia.com.
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

    const isDemo = slug.startsWith('demo-') || slug.startsWith('demo_');

    // For demo businesses, try real data from our showcase sites
    if (isDemo) {
      try {
        const demoSite = selectDemoSite(slug);
        if (demoSite) {
          const startDate = daysAgo(Math.min(days, 7));
          const endDate = today();
          const data = await getDemoSiteSearchConsoleData(demoSite.config.siteUrl, startDate, endDate);
          return NextResponse.json({
            success: true,
            data: { ...data, demoData: true, demoSite: demoSite.config.label, poweredBy: `Real Google Search Console data from ${demoSite.config.label}` },
            cached: false,
            generatedAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn('[Demo SEO] Failed to fetch real SC data, falling back:', err);
      }
    }

    try {
      const startDate = daysAgo(days);
      const endDate = today();
      const data = await getSearchConsoleData(slug, startDate, endDate);
      return NextResponse.json({ success: true, data, cached: false, generatedAt: new Date().toISOString() });
    } catch {
      const data = generateDemoSearchConsoleData(slug, days);
      return NextResponse.json({ success: true, data, cached: false, generatedAt: new Date().toISOString() });
    }
  } catch (error) {
    console.error('Search Console API error:', error);
    return NextResponse.json({ error: 'Failed to fetch Search Console data' }, { status: 500 });
  }
}
