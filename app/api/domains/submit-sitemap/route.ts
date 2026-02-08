/**
 * GSC Sitemap Submission API — Manual trigger for domain owners
 *
 * POST /api/domains/submit-sitemap
 *
 * Allows owners to manually trigger sitemap submission for their custom domain.
 * Useful if auto-submit during domain setup failed, or for re-submitting after
 * adding content.
 *
 * Body: { businessSlug: "china-wok" }
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyApiAuth } from '@/lib/apiAuth';

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyApiAuth(request);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { businessSlug } = body;
    const uid = authResult.uid;

    if (!businessSlug || !uid) {
      return NextResponse.json(
        { error: 'Missing required field: businessSlug' },
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

    const businessData = businessDoc.docs[0].data();
    const domain = businessData.website?.customDomain;

    if (!domain) {
      return NextResponse.json(
        { error: 'Business does not have a custom domain configured' },
        { status: 400 },
      );
    }

    // Ping Google to request indexing of the sitemap
    const sitemapUrl = `https://${domain}/sitemap.xml`;
    let pingSuccess = false;

    try {
      const pingResponse = await fetch(
        `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
      );
      pingSuccess = pingResponse.ok;
    } catch (pingError) {
      console.warn(`[Sitemap Submit] Google ping failed for ${domain}:`, pingError);
    }

    // Update business with submission status
    await businessDoc.docs[0].ref.update({
      'website.sitemapSubmittedAt': new Date().toISOString(),
      'website.sitemapPingSuccess': pingSuccess,
    });

    return NextResponse.json({
      success: true,
      domain,
      sitemapUrl,
      pingSuccess,
      message: pingSuccess
        ? `Sitemap for ${domain} has been submitted to Google.`
        : `Sitemap URL generated at ${sitemapUrl}. Google ping may take time to process.`,
    });
  } catch (error) {
    console.error('[Sitemap Submit] Error:', error);
    const msg = error instanceof Error ? error.message : 'Sitemap submission failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
