/**
 * Domain DNS Configuration API
 *
 * POST /api/domains/configure-dns
 * 
 * Retry DNS configuration for a domain that was purchased but DNS setup failed.
 * Also used to verify DNS propagation status.
 * 
 * Body: { domain: "example.com", businessSlug: "my-business", uid: "..." }
 *
 * GET /api/domains/configure-dns?domain=example.com
 * 
 * Check current DNS records for a domain.
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import {
  configureDNSForAppHosting,
  getDNSRecords,
  getDomainInfo,
} from '@/lib/domain-registrar';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain, businessSlug, uid } = body;

    if (!domain || !businessSlug || !uid) {
      return NextResponse.json(
        { error: 'Missing required fields: domain, businessSlug, uid' },
        { status: 400 },
      );
    }

    // Verify business ownership
    const businessDoc = await adminDb
      .collection('businesses')
      .where('slug', '==', businessSlug)
      .where('ownerId', '==', uid)
      .limit(1)
      .get();

    if (businessDoc.empty) {
      return NextResponse.json(
        { error: 'Business not found or you are not the owner' },
        { status: 403 },
      );
    }

    const businessRef = businessDoc.docs[0].ref;
    const businessData = businessDoc.docs[0].data();

    // Verify this domain belongs to the business
    if (businessData.website?.customDomain !== domain) {
      return NextResponse.json(
        { error: 'Domain does not belong to this business' },
        { status: 403 },
      );
    }

    // Configure DNS
    const result = await configureDNSForAppHosting(domain);

    if (result.success) {
      await businessRef.update({
        'website.customDomainEnabled': true,
        'website.dnsConfigured': true,
        'website.domainStatus': 'active',
      });
    }

    return NextResponse.json({
      success: result.success,
      records: result.records,
      message: 'DNS configured. Changes may take up to 48 hours to propagate worldwide.',
    });
  } catch (error) {
    console.error('DNS configuration error:', error);
    const msg = error instanceof Error ? error.message : 'DNS configuration failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');

  if (!domain) {
    return NextResponse.json({ error: 'Missing domain parameter' }, { status: 400 });
  }

  try {
    const [records, info] = await Promise.all([
      getDNSRecords(domain).catch(() => []),
      getDomainInfo(domain).catch(() => null),
    ]);

    return NextResponse.json({
      domain,
      records,
      info,
      message: 'Current DNS records for this domain',
    });
  } catch (error) {
    console.error('DNS lookup error:', error);
    const msg = error instanceof Error ? error.message : 'DNS lookup failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
