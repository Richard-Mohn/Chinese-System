/**
 * Domain Payment Intent API — Flat $14.99/yr Pricing
 *
 * POST /api/domains/create-payment-intent
 *
 * Creates a Stripe PaymentIntent for a domain purchase.
 * Flat price of $14.99/yr — no variable markup, no hidden fees.
 *
 * Body: { domain: "example.com", years?: 1 }
 * Returns: { clientSecret, paymentIntentId, totalCents, breakdown }
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import {
  checkDomainAvailability,
  DOMAIN_PRICE_CENTS,
  formatPrice,
  getCompetitorComparison,
} from '@/lib/domain-registrar';
import { verifyApiAuth } from '@/lib/apiAuth';

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) console.error('STRIPE_SECRET_KEY is not set for domain payments');
const stripe = new Stripe(stripeKey || 'missing', {
  apiVersion: '2025-04-30.basil' as Stripe.LatestApiVersion,
});

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyApiAuth(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const { domain, years = 1 } = body;

    if (!domain) {
      return NextResponse.json({ error: 'Missing domain' }, { status: 400 });
    }

    // Check availability
    const availability = await checkDomainAvailability(domain);

    if (!availability.available) {
      return NextResponse.json(
        { error: `${domain} is not available for purchase` },
        { status: 400 },
      );
    }

    // Flat pricing — $14.99/yr × years
    const totalCents = DOMAIN_PRICE_CENTS * years;

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'usd',
      metadata: {
        type: 'domain_purchase',
        domain,
        years: String(years),
        pricePerYear: String(DOMAIN_PRICE_CENTS),
      },
      description: `Domain: ${domain} (${years} year${years > 1 ? 's' : ''})`,
      automatic_payment_methods: { enabled: true },
    });

    // Get competitor comparison for UI
    const competitors = getCompetitorComparison();

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      totalCents,
      breakdown: {
        domain: domain,
        years,
        pricePerYear: formatPrice(DOMAIN_PRICE_CENTS),
        total: formatPrice(totalCents),
        includes: [
          'Domain registration',
          'Free WHOIS privacy',
          'Auto DNS configuration',
          'SSL certificate',
          'Custom domain routing',
          'Auto-renewal',
        ],
      },
      competitors,
    });
  } catch (error) {
    console.error('Domain payment intent error:', error);
    const msg = error instanceof Error ? error.message : 'Payment creation failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
