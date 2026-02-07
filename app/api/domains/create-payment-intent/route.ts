/**
 * Domain Payment Intent API
 *
 * POST /api/domains/create-payment-intent
 *
 * Creates a Stripe PaymentIntent for a domain purchase.
 * The total includes GoDaddy wholesale price + $5 markup.
 *
 * Body: { domain: "example.com" }
 * Returns: { clientSecret, totalCents, breakdown }
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { checkDomainAvailability, formatPrice } from '@/lib/domain-registrar';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-04-30.basil' as Stripe.LatestApiVersion,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain } = body;

    if (!domain) {
      return NextResponse.json({ error: 'Missing domain' }, { status: 400 });
    }

    // Check availability and get pricing
    const availability = await checkDomainAvailability(domain);

    if (!availability.available) {
      return NextResponse.json(
        { error: `${domain} is not available for purchase` },
        { status: 400 },
      );
    }

    const totalCents = availability.totalPrice;

    if (totalCents <= 0) {
      return NextResponse.json(
        { error: 'Could not determine domain pricing' },
        { status: 400 },
      );
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'usd',
      metadata: {
        type: 'domain_purchase',
        domain,
        wholesaleCents: String(availability.price),
        markupCents: String(availability.markup),
      },
      description: `Domain purchase: ${domain} (1 year)`,
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      totalCents,
      breakdown: {
        domainCost: formatPrice(availability.price),
        platformFee: formatPrice(availability.markup),
        total: formatPrice(totalCents),
      },
      domain: availability.domain,
    });
  } catch (error) {
    console.error('Domain payment intent error:', error);
    const msg = error instanceof Error ? error.message : 'Payment creation failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
