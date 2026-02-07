/**
 * Domain Purchase API — Stripe-First Flow with DomainNameAPI
 *
 * POST /api/domains/purchase
 *
 * Body: {
 *   domain: "example.com",
 *   businessSlug: "my-business",
 *   years: 1,
 *   contact: { nameFirst, nameLast, email, phone, addressMailing: { ... } },
 *   stripePaymentIntentId: "pi_xxx"  // Confirmed Stripe payment
 * }
 *
 * Flow:
 * 1. Verify user is authenticated & owns the business
 * 2. Verify Stripe payment was successful
 * 3. Register domain via DomainNameAPI (white-label, WHOIS privacy included)
 * 4. Nameservers auto-configured during registration
 * 5. Update Firestore with custom domain info
 * 6. Website automatically serves on custom domain via proxy.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyApiAuth } from '@/lib/apiAuth';
import { paymentLimiter } from '@/lib/rateLimit';
import {
  registerDomain,
  getDomainInfo,
  enablePrivacyProtection,
  DOMAIN_PRICE_CENTS,
  type DomainContact,
} from '@/lib/domain-registrar';

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) console.error('STRIPE_SECRET_KEY is not set for domain purchase');
const stripe = new Stripe(stripeKey || 'missing', {
  apiVersion: '2025-04-30.basil' as Stripe.LatestApiVersion,
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const limited = paymentLimiter(request);
    if (limited) return limited;

    // Verify authentication — use token UID instead of client-supplied uid
    const authResult = await verifyApiAuth(request);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const {
      domain,
      businessSlug,
      years = 1,
      contact,
      stripePaymentIntentId,
    } = body;
    const uid = authResult.uid; // Use verified UID, not client-supplied

    // ── Validation ─────────────────────────────────────────────
    if (!domain || !businessSlug || !contact || !uid) {
      return NextResponse.json(
        { error: 'Missing required fields: domain, businessSlug, contact, uid' },
        { status: 400 },
      );
    }

    if (!stripePaymentIntentId) {
      return NextResponse.json(
        { error: 'Payment is required before domain registration' },
        { status: 400 },
      );
    }

    // ── Verify Stripe Payment ──────────────────────────────────
    console.log(`[Domain Purchase] Verifying Stripe payment ${stripePaymentIntentId}`);

    const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: `Payment not completed. Status: ${paymentIntent.status}` },
        { status: 400 },
      );
    }

    // Verify the payment amount matches our price
    if (paymentIntent.amount !== DOMAIN_PRICE_CENTS * years) {
      console.warn(
        `[Domain Purchase] Payment amount mismatch: expected ${DOMAIN_PRICE_CENTS * years}, got ${paymentIntent.amount}`,
      );
    }

    // ── Verify Business Ownership ──────────────────────────────
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

    // ── Register Domain via DomainNameAPI ───────────────────────
    console.log(`[Domain Purchase] Registering ${domain} for business ${businessSlug}`);

    const purchaseResult = await registerDomain({
      domain,
      years,
      contact: contact as DomainContact,
    });

    console.log(`[Domain Purchase] Registered! Order: ${purchaseResult.orderId}`);

    // ── Enable Privacy Protection (free) ───────────────────────
    try {
      await enablePrivacyProtection(domain);
    } catch (privacyError) {
      // Non-critical — privacy was already requested during registration
      console.warn('[Domain Purchase] Privacy protection post-enable failed (may already be active):', privacyError);
    }

    // ── Get Domain Info ────────────────────────────────────────
    // Small delay to let registration propagate
    await new Promise((resolve) => setTimeout(resolve, 2000));

    let domainInfo = null;
    try {
      domainInfo = await getDomainInfo(domain);
    } catch {
      // May not be available immediately
    }

    // ── Update Firestore ───────────────────────────────────────
    const domainData = {
      'website.customDomain': domain,
      'website.customDomainEnabled': true,
      'website.domainPurchased': true,
      'website.domainPurchaseDate': new Date().toISOString(),
      'website.domainExpiry': domainInfo?.expires || purchaseResult.expirationDate || null,
      'website.domainOrderId': purchaseResult.orderId,
      'website.domainAutoRenew': true,
      'website.dnsConfigured': true, // Nameservers set during registration
      'website.domainStatus': 'active',
      'website.domainRegistrar': 'domainnameapi',
      'website.domainPrivacy': true,
      'website.stripePaymentIntentId': stripePaymentIntentId,
    };

    await businessRef.update(domainData);

    // ── Record Domain in resolve-domain collection ─────────────
    // This allows proxy.ts to route the custom domain to the business
    await adminDb.collection('customDomains').doc(domain).set({
      businessSlug,
      businessId: businessDoc.docs[0].id,
      ownerId: uid,
      domain,
      createdAt: new Date().toISOString(),
      status: 'active',
    });

    // ── Record the purchase for billing history ────────────────
    await adminDb.collection('domainPurchases').add({
      businessId: businessDoc.docs[0].id,
      businessSlug,
      ownerId: uid,
      domain,
      registrar: 'domainnameapi',
      orderId: purchaseResult.orderId,
      yearsRegistered: years,
      retailCents: DOMAIN_PRICE_CENTS,
      stripePaymentIntentId,
      dnsConfigured: true,
      privacyEnabled: true,
      purchasedAt: new Date().toISOString(),
      expiresAt: domainInfo?.expires || purchaseResult.expirationDate || null,
      status: 'active',
    });

    return NextResponse.json({
      success: true,
      domain,
      orderId: purchaseResult.orderId,
      dnsConfigured: true,
      domainStatus: 'active',
      message: `${domain} is registered and configured! Your website is now accessible at ${domain}. DNS may take up to 48 hours to fully propagate worldwide.`,
    });
  } catch (error) {
    console.error('Domain purchase error:', error);
    const msg = error instanceof Error ? error.message : 'Domain purchase failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
