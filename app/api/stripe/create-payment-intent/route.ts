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
  createOrGetStripeCustomer,
} from '@/lib/stripe/platform';
import { MINIMUM_ORDER_AMOUNT } from '@/lib/stripe/config';
import { verifyApiAuth } from '@/lib/apiAuth';
import { paymentLimiter } from '@/lib/rateLimit';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const limited = paymentLimiter(request);
    if (limited) return limited;

    // Verify authentication
    const auth = await verifyApiAuth(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const { amount, orderId, businessId, ownerStripeAccountId, customerEmail, customerName, customerPhone, deliveryProvider } = body;

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

    // ─── Step 1: Create or retrieve Stripe Customer ─────────
    // This is the correct 2026 flow: customer info → Stripe Customer → PaymentIntent
    let stripeCustomerId: string | undefined;
    const firebaseUid = auth.uid;

    if (firebaseUid && customerEmail) {
      try {
        // Check if user already has a Stripe Customer
        const userDoc = await getDoc(doc(db, 'users', firebaseUid));
        const existingCustomerId = userDoc.exists()
          ? userDoc.data()?.stripeCustomerId
          : undefined;

        const { customerId, created } = await createOrGetStripeCustomer({
          email: customerEmail,
          name: customerName,
          phone: customerPhone,
          firebaseUid,
          existingCustomerId,
        });

        stripeCustomerId = customerId;

        // Persist to user's Firestore doc if new
        if (created || !existingCustomerId) {
          await updateDoc(doc(db, 'users', firebaseUid), {
            stripeCustomerId: customerId,
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn('Failed to create Stripe Customer (continuing without):', err);
      }
    }

    // If the business owner has a Stripe connected account, use destination charges.
    // Otherwise fall back to a direct charge (money stays in platform account).
    if (ownerStripeAccountId) {
      const isCourierDelivery = deliveryProvider === 'community';
      const result = await createDestinationCharge({
        amountCents: amount,
        ownerStripeAccountId,
        orderId,
        businessId,
        customerEmail,
        stripeCustomerId,
        isCourierDelivery,
      });
      return NextResponse.json({ ...result, stripeCustomerId });
    }

    // Fallback: direct charge (owner hasn't connected Stripe yet)
    const { getStripe } = await import('@/lib/stripe/platform');
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      ...(stripeCustomerId && { customer: stripeCustomerId }),
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