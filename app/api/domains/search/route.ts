/**
 * Domain Search API
 *
 * GET  /api/domains/search?domain=mybusiness.com         — Check single domain
 * GET  /api/domains/search?keyword=mybusiness&limit=10   — Get suggestions
 * POST /api/domains/search { domains: ["a.com","b.com"] } — Bulk check
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  checkDomainAvailability,
  checkBulkAvailability,
  getDomainSuggestions,
} from '@/lib/domain-registrar';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');
  const keyword = searchParams.get('keyword');
  const limit = parseInt(searchParams.get('limit') || '10');

  try {
    // Single domain availability check
    if (domain) {
      const result = await checkDomainAvailability(domain);
      return NextResponse.json(result);
    }

    // Keyword-based suggestions
    if (keyword) {
      const suggestions = await getDomainSuggestions(keyword, limit);

      // Check availability for top suggestions
      if (suggestions.length > 0) {
        const domains = suggestions.map((s) => s.domain);
        const availability = await checkBulkAvailability(domains);
        return NextResponse.json({ suggestions: availability });
      }

      return NextResponse.json({ suggestions: [] });
    }

    return NextResponse.json(
      { error: 'Provide either ?domain= or ?keyword= parameter' },
      { status: 400 },
    );
  } catch (error) {
    console.error('Domain search error:', error);
    const msg = error instanceof Error ? error.message : 'Domain search failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domains } = body;

    if (!domains || !Array.isArray(domains) || domains.length === 0) {
      return NextResponse.json(
        { error: 'Provide an array of domains to check' },
        { status: 400 },
      );
    }

    if (domains.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 domains per request' },
        { status: 400 },
      );
    }

    const results = await checkBulkAvailability(domains);
    return NextResponse.json({ domains: results });
  } catch (error) {
    console.error('Bulk domain search error:', error);
    const msg = error instanceof Error ? error.message : 'Bulk search failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
