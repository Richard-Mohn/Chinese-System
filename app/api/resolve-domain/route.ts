/**
 * Domain Resolution API
 * 
 * Maps custom domains to business slugs.
 * GET /api/resolve-domain?domain=chinawok.com → { slug: "china-wok" }
 * 
 * Uses Firebase Admin SDK (server-side) + in-memory cache with 5-minute TTL.
 * Also checks the customDomains collection for fast BYOD domain lookups.
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

// In-memory cache: domain → { slug, cachedAt }
const domainCache = new Map<string, { slug: string; cachedAt: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');
  
  if (!domain) {
    return NextResponse.json({ error: 'Missing domain parameter' }, { status: 400 });
  }

  // Clean the domain
  const cleanDomain = domain.split(':')[0].replace(/^www\./, '');

  // Check cache first
  const cached = domainCache.get(cleanDomain);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL) {
    return NextResponse.json({ slug: cached.slug });
  }

  try {
    // Query Firestore for business with this custom domain (Admin SDK)
    const businessesRef = adminDb.collection('businesses');
    let snapshot = await businessesRef
      .where('website.customDomain', '==', cleanDomain)
      .where('website.customDomainEnabled', '==', true)
      .limit(1)
      .get();
    
    if (!snapshot.empty) {
      const business = snapshot.docs[0].data();
      const slug = business.slug;
      
      // Cache the result
      domainCache.set(cleanDomain, { slug, cachedAt: Date.now() });
      
      return NextResponse.json({ slug });
    }

    // Fallback: try with www. prefix if original didn't have it
    if (!domain.includes('www.')) {
      snapshot = await businessesRef
        .where('website.customDomain', '==', `www.${cleanDomain}`)
        .where('website.customDomainEnabled', '==', true)
        .limit(1)
        .get();
      
      if (!snapshot.empty) {
        const business = snapshot.docs[0].data();
        const slug = business.slug;
        
        domainCache.set(cleanDomain, { slug, cachedAt: Date.now() });
        return NextResponse.json({ slug });
      }
    }

    // Also check the customDomains collection (created by domain purchase/connect flow)
    const customDomainDoc = await adminDb.collection('customDomains').doc(cleanDomain).get();
    if (customDomainDoc.exists) {
      const data = customDomainDoc.data()!;
      const slug = data.businessSlug || data.slug;
      domainCache.set(cleanDomain, { slug, cachedAt: Date.now() });
      return NextResponse.json({ slug });
    }

    return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
  } catch (error) {
    console.error('Domain resolution error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
