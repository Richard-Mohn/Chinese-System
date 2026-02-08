/**
 * Tenant Robots.txt API — Serves robots.txt for custom domains
 *
 * GET /api/tenant-robots?slug=china-wok&domain=chinawok.com
 *
 * Called by proxy.ts when a custom domain requests /robots.txt.
 * Generates a robots.txt with the tenant's sitemap URL.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const domain = searchParams.get('domain');

  if (!slug || !domain) {
    return new NextResponse('Missing slug or domain parameter', { status: 400 });
  }

  const robotsTxt = `# Robots.txt for ${domain}
User-agent: *
Allow: /

Sitemap: https://${domain}/sitemap.xml
`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
