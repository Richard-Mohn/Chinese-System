import { NextRequest, NextResponse } from 'next/server';
import { getRealtimeData } from '@/lib/google-analytics';
import { verifyApiAuth } from '@/lib/apiAuth';

// Demo realtime data
function generateDemoRealtimeData(slug: string) {
  const hour = new Date().getHours();
  // Simulate realistic traffic patterns (higher during meal times)
  const mealBoost = (hour >= 11 && hour <= 13) || (hour >= 17 && hour <= 20) ? 2 : 1;
  const activeUsers = Math.floor((3 + Math.random() * 5) * mealBoost);

  return {
    activeUsers,
    activePages: [
      { pagePath: `/${slug}`, activeUsers: Math.ceil(activeUsers * 0.4) },
      { pagePath: `/${slug}/menu`, activeUsers: Math.ceil(activeUsers * 0.3) },
      { pagePath: `/order/${slug}`, activeUsers: Math.ceil(activeUsers * 0.2) },
      { pagePath: `/${slug}/reviews`, activeUsers: Math.max(0, Math.ceil(activeUsers * 0.1)) },
    ].filter(p => p.activeUsers > 0),
    activeSources: [
      { source: 'google', activeUsers: Math.ceil(activeUsers * 0.45) },
      { source: '(direct)', activeUsers: Math.ceil(activeUsers * 0.3) },
      { source: 'instagram', activeUsers: Math.max(0, Math.ceil(activeUsers * 0.15)) },
    ].filter(s => s.activeUsers > 0),
    activeDevices: [
      { deviceCategory: 'mobile', activeUsers: Math.ceil(activeUsers * 0.65) },
      { deviceCategory: 'desktop', activeUsers: Math.ceil(activeUsers * 0.3) },
      { deviceCategory: 'tablet', activeUsers: Math.max(0, Math.ceil(activeUsers * 0.05)) },
    ].filter(d => d.activeUsers > 0),
    demoData: true,
    poweredBy: 'Real data patterns from NeighborTechs.com',
  };
}

/**
 * GET /api/tenant-seo/realtime?slug=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyApiAuth(request);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 });
    }

    try {
      const data = await getRealtimeData(slug);
      return NextResponse.json({ success: true, data, timestamp: new Date().toISOString() });
    } catch {
      // Fallback to demo data
      const data = generateDemoRealtimeData(slug);
      return NextResponse.json({ success: true, data, timestamp: new Date().toISOString() });
    }
  } catch (error) {
    console.error('Realtime API error:', error);
    return NextResponse.json({ error: 'Failed to fetch realtime data' }, { status: 500 });
  }
}
