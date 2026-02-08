/**
 * Tenant Sitemap API — Serves sitemap.xml for custom domains
 *
 * GET /api/tenant-sitemap?slug=china-wok&domain=chinawok.com
 *
 * Called by proxy.ts when a custom domain requests /sitemap.xml.
 * Generates a sitemap with all pages for the tenant's website.
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const domain = searchParams.get('domain');

  if (!slug) {
    return new NextResponse('Missing slug parameter', { status: 400 });
  }

  try {
    // Look up business data
    const businessDoc = await adminDb
      .collection('businesses')
      .where('slug', '==', slug)
      .limit(1)
      .get();

    const business = businessDoc.empty ? null : businessDoc.docs[0].data();
    const baseUrl = domain ? `https://${domain}` : `https://mohnmenu.com/${slug}`;

    // Core pages
    const pages = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/menu', priority: '0.9', changefreq: 'daily' },
      { path: '/about', priority: '0.7', changefreq: 'monthly' },
      { path: '/contact', priority: '0.7', changefreq: 'monthly' },
    ];

    // Add service pages if available
    const services = business?.services || [];
    for (const service of services) {
      pages.push({
        path: `/services/${service}`,
        priority: '0.6',
        changefreq: 'monthly',
      });
    }

    // Add location pages
    const cities = business?.website?.selectedCities || [];
    const states = business?.website?.selectedStates || [];
    for (const city of cities) {
      for (const state of states) {
        const locationSlug = `${city.toLowerCase().replace(/\s+/g, '-')}-${state.toLowerCase()}`;
        pages.push({
          path: `/${locationSlug}`,
          priority: '0.6',
          changefreq: 'weekly',
        });
      }
    }

    const now = new Date().toISOString().split('T')[0];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${baseUrl}${page.path === '/' ? '' : page.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Tenant sitemap error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
