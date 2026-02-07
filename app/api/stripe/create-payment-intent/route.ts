/**
 * Stripe Payment Intent API — Destination Charges via Stripe Connect
 *
 * POST /api/stripe/create-payment-intent
 * Creates a PaymentIntent that routes funds to the business owner's
 * connected account, while the platform automatically keeps the
 * application fee (1%).
 *
 * Body: { amount, orderId, businessId, ownerStripeAccountId, customerEmail? }
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createDestinationCharge,
} from '@/lib/stripe/platform';
import { MINIMUM_ORDER_AMOUNT } from '@/lib/stripe/config';
import { verifyApiAuth } from '@/lib/apiAuth';
import { paymentLimiter } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const limited = paymentLimiter(request);
    if (limited) return limited;

    // Verify authentication
    const auth = await verifyApiAuth(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const { amount, orderId, businessId, ownerStripeAccountId, customerEmail } = body;

    if (!amount || !orderId || !businessId) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, orderId, businessId' },
        { status: 400 },
      );
    }

    if (amount < MINIMUM_ORDER_AMOUNT) {
      return NextResponse.json(
        { error: `Minimum order amount is $${(MINIMUM_ORDER_AMOUNT / 100).toFixed(2)}` },
        { status: 400 },
      );
    }

    // If the business owner has a Stripe connected account, use destination charges.
    // Otherwise fall back to a direct charge (money stays in platform account).
    if (ownerStripeAccountId) {
      const result = await createDestinationCharge({
        amountCents: amount,
        ownerStripeAccountId,
        orderId,
        businessId,
        customerEmail,
      });
      return NextResponse.json(result);
    }

    // Fallback: direct charge (owner hasn't connected Stripe yet)
    const { getStripe } = await import('@/lib/stripe/platform');
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        mohn_order_id: orderId,
        mohn_business_id: businessId,
        platform: 'mohnmenu',
        note: 'owner_not_connected',
      },
      receipt_email: customerEmail || undefined,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      applicationFee: 0,
    });
  } catch (error) {
    console.error('Stripe PaymentIntent error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 },
    );
  }
}