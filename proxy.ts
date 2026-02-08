/**
 * proxy.ts — Next.js 16 convention (replaces middleware.ts)
 * 
 * Custom domain routing for multi-tenant SEO websites.
 * 
 * Flow:
 * 1. Customer visits chinawok.com
 * 2. DNS CNAME → Firebase App Hosting URL
 * 3. Cloud Run receives request with x-forwarded-host: chinawok.com
 * 4. proxy.ts detects it's NOT the main domain
 * 5. Resolves domain → slug via /api/resolve-domain
 * 6. Rewrites all URLs to the /{slug}/* route tree
 * 7. Sets x-custom-domain and x-business-slug headers
 * 
 * On the main platform domain, requests pass through unchanged.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isMainDomain } from '@/lib/tenant-links';

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next (Next.js internals)
     * - api (API routes — except we intercept sitemap/robots before this)
     * - static files (favicon.ico, images, etc.)
     */
    '/((?!_next|api|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)).*)',
  ],
};

// Cache for domain → slug lookups (avoids re-fetching on every request)
const slugCache = new Map<string, { slug: string; ts: number }>();
const SLUG_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function resolveSlug(hostname: string, request: NextRequest): Promise<string | null> {
  const clean = hostname.split(':')[0].replace(/^www\./, '');
  
  // Check local cache
  const cached = slugCache.get(clean);
  if (cached && Date.now() - cached.ts < SLUG_CACHE_TTL) {
    return cached.slug;
  }

  try {
    const resolveUrl = new URL('/api/resolve-domain', request.url);
    resolveUrl.searchParams.set('domain', clean);

    const response = await fetch(resolveUrl.toString(), {
      headers: { 'x-proxy-request': '1' },
    });

    if (!response.ok) return null;

    const { slug } = await response.json();
    if (slug) {
      slugCache.set(clean, { slug, ts: Date.now() });
    }
    return slug || null;
  } catch (error) {
    console.error('Proxy error resolving domain:', error);
    return null;
  }
}

export default async function proxy(request: NextRequest) {
  const hostname = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  const { pathname } = request.nextUrl;

  // If this is the main platform domain, pass through
  if (isMainDomain(hostname)) {
    return NextResponse.next();
  }

  // ─── Custom Domain Detected ───────────────────────────────────────

  // Handle sitemap.xml and robots.txt for custom domains → rewrite to API routes
  if (pathname === '/sitemap.xml' || pathname === '/sitemap/0.xml') {
    const slug = await resolveSlug(hostname, request);
    if (slug) {
      const url = request.nextUrl.clone();
      url.pathname = '/api/tenant-sitemap';
      url.searchParams.set('slug', slug);
      url.searchParams.set('domain', hostname.split(':')[0].replace(/^www\./, ''));
      return NextResponse.rewrite(url);
    }
  }

  if (pathname === '/robots.txt') {
    const slug = await resolveSlug(hostname, request);
    if (slug) {
      const url = request.nextUrl.clone();
      url.pathname = '/api/tenant-robots';
      url.searchParams.set('slug', slug);
      url.searchParams.set('domain', hostname.split(':')[0].replace(/^www\./, ''));
      return NextResponse.rewrite(url);
    }
  }

  // Protect platform-only routes on custom domains
  const platformRoutes = ['/login', '/register', '/dashboard', '/owner', '/driver', '/customer', '/admin', '/logout', '/onboarding', '/signup'];
  if (platformRoutes.some(route => pathname.startsWith(route))) {
    // Redirect to main platform domain
    const mainUrl = new URL(pathname, `https://mohnmenu.com`);
    mainUrl.search = request.nextUrl.search;
    return NextResponse.redirect(mainUrl, 307);
  }

  // Resolve the custom domain to a business slug
  const slug = await resolveSlug(hostname, request);

  if (!slug) {
    return NextResponse.next();
  }

  // ─── Rewrite Rules ─────────────────────────────────────────────
  const url = request.nextUrl.clone();

  if (pathname === '/' || pathname === '') {
    url.pathname = `/${slug}`;
  } else if (pathname === '/about' || pathname === '/about/') {
    url.pathname = `/${slug}/about`;
  } else if (pathname === '/contact' || pathname === '/contact/') {
    url.pathname = `/${slug}/contact`;
  } else if (pathname === '/menu' || pathname === '/menu/') {
    url.pathname = `/${slug}/menu`;
  } else if (pathname.startsWith('/services/')) {
    url.pathname = `/${slug}${pathname}`;
  } else if (pathname === '/order' || pathname === '/order/') {
    url.pathname = `/order/${slug}`;
  } else if (pathname === '/reserve' || pathname === '/reserve/') {
    url.pathname = `/${slug}/reserve`;
  } else {
    // Catch-all: could be a location page like /richmond-va
    url.pathname = `/${slug}${pathname}`;
  }

  // Set headers so server components know this is a custom domain request
  const rewriteResponse = NextResponse.rewrite(url);
  rewriteResponse.headers.set('x-custom-domain', '1');
  rewriteResponse.headers.set('x-business-slug', slug);

  return rewriteResponse;
}
