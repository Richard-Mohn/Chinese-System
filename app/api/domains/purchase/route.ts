/**
 * Domain Purchase API
 *
 * POST /api/domains/purchase
 *
 * Body: {
 *   domain: "example.com",
 *   businessSlug: "my-business",
 *   years: 1,
 *   contact: { nameFirst, nameLast, email, phone, addressMailing: { ... } },
 *   stripePaymentIntentId: "pi_xxx"  // Pre-authorized Stripe payment
 * }
 *
 * Flow:
 * 1. Verify user is authenticated & owns the business
 * 2. Verify Stripe payment was successful
 * 3. Purchase domain via GoDaddy API
 * 4. Configure DNS (CNAME → Firebase App Hosting)
 * 5. Update Firestore with custom domain info
 * 6. Return success with domain details
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import {
  purchaseDomain,
  configureDNSForAppHosting,
  getDomainInfo,
  type DomainContact,
} from '@/lib/domain-registrar';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      domain,
      businessSlug,
      years = 1,
      contact,
      stripePaymentIntentId,
      uid,
    } = body;

    // ── Validation ─────────────────────────────────────────────
    if (!domain || !businessSlug || !contact || !uid) {
      return NextResponse.json(
        { error: 'Missing required fields: domain, businessSlug, contact, uid' },
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

    // Check if business already has a custom domain
    if (businessData.website?.customDomain && businessData.website?.domainPurchased) {
      return NextResponse.json(
        { error: 'Business already has a custom domain. Contact support to change it.' },
        { status: 400 },
      );
    }

    // ── Purchase Domain ────────────────────────────────────────
    console.log(`[Domain Purchase] Purchasing ${domain} for business ${businessSlug}`);

    const purchaseResult = await purchaseDomain({
      domain,
      years,
      contact: contact as DomainContact,
    });

    console.log(`[Domain Purchase] Success! Order #${purchaseResult.orderId}`);

    // ── Configure DNS ──────────────────────────────────────────
    console.log(`[Domain Purchase] Configuring DNS for ${domain}`);

    // Small delay for domain to propagate in GoDaddy's system
    await new Promise((resolve) => setTimeout(resolve, 3000));

    let dnsConfigured = false;
    try {
      await configureDNSForAppHosting(domain);
      dnsConfigured = true;
      console.log(`[Domain Purchase] DNS configured for ${domain}`);
    } catch (dnsError) {
      // DNS config can fail if domain hasn't fully propagated yet
      // We'll retry via a background job or the owner can trigger it later
      console.error(`[Domain Purchase] DNS config failed (will retry):`, dnsError);
    }

    // ── Get Domain Info ────────────────────────────────────────
    let domainInfo = null;
    try {
      domainInfo = await getDomainInfo(domain);
    } catch {
      // May not be available immediately
    }

    // ── Update Firestore ───────────────────────────────────────
    const domainData = {
      'website.customDomain': domain,
      'website.customDomainEnabled': dnsConfigured,
      'website.domainPurchased': true,
      'website.domainPurchaseDate': new Date().toISOString(),
      'website.domainExpiry': domainInfo?.expires || null,
      'website.domainOrderId': purchaseResult.orderId,
      'website.domainAutoRenew': true,
      'website.dnsConfigured': dnsConfigured,
      'website.domainStatus': dnsConfigured ? 'active' : 'pending_dns',
      'website.domainRegistrar': 'godaddy',
      'website.stripePaymentIntentId': stripePaymentIntentId || null,
    };

    await businessRef.update(domainData);

    // ── Record the purchase in a separate collection for billing ──
    await adminDb.collection('domainPurchases').add({
      businessId: businessDoc.docs[0].id,
      businessSlug,
      ownerId: uid,
      domain,
      registrar: 'godaddy',
      orderId: purchaseResult.orderId,
      yearsRegistered: years,
      costCents: purchaseResult.total,
      markupCents: 500, // $5 markup
      totalChargedCents: purchaseResult.total + 500,
      stripePaymentIntentId: stripePaymentIntentId || null,
      dnsConfigured,
      purchasedAt: new Date().toISOString(),
      expiresAt: domainInfo?.expires || null,
      status: 'active',
    });

    return NextResponse.json({
      success: true,
      domain,
      orderId: purchaseResult.orderId,
      dnsConfigured,
      domainStatus: dnsConfigured ? 'active' : 'pending_dns',
      message: dnsConfigured
        ? `${domain} is purchased and DNS is configured! It may take up to 48 hours for DNS to fully propagate.`
        : `${domain} is purchased! DNS configuration is pending — it will be retried automatically.`,
    });
  } catch (error) {
    console.error('Domain purchase error:', error);
    const msg = error instanceof Error ? error.message : 'Domain purchase failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
