/**
 * Stripe Webhook Handler
 *
 * POST /api/stripe/webhook
 *
 * Handles Stripe events for reliable payment confirmation:
 * - payment_intent.succeeded → Update order to paid/confirmed
 * - payment_intent.payment_failed → Mark order payment as failed
 * - account.updated → Track Connect onboarding status
 *
 * IMPORTANT: This endpoint must receive the raw body (not JSON-parsed)
 * for signature verification
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe } from '@/lib/stripe/platform';
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  const stripe = getStripe();

  // Read raw body for signature verification
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  // If no webhook secret configured, log warning and accept (for initial setup)
  if (!webhookSecret) {
    console.warn('[Stripe Webhook] STRIPE_WEBHOOK_SECRET not set — skipping signature verification');
    try {
      const event = JSON.parse(body) as Stripe.Event;
      await handleEvent(event);
      return NextResponse.json({ received: true });
    } catch (err) {
      console.error('[Stripe Webhook] Parse error:', err);
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
  }

  // Verify signature
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`[Stripe Webhook] Signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  await handleEvent(event);
  return NextResponse.json({ received: true });
}

// ─── Event Handler ────────────────────────────────────────────

async function handleEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
      break;

    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
      break;

    case 'account.updated':
      await handleAccountUpdated(event.data.object as Stripe.Account);
      break;

    case 'transfer.created':
      console.log(`[Stripe Webhook] Transfer created: ${(event.data.object as Stripe.Transfer).id}`);
      break;

    default:
      console.log(`[Stripe Webhook] Unhandled event: ${event.type}`);
  }
}

// ─── Payment Succeeded ─────────────────────────────────────────

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.mohn_order_id;
  const businessId = paymentIntent.metadata?.mohn_business_id;
  const type = paymentIntent.metadata?.type;

  console.log(`[Stripe Webhook] Payment succeeded: ${paymentIntent.id}, order: ${orderId}, business: ${businessId}`);

  // Domain purchases
  if (type === 'domain_purchase') {
    console.log(`[Stripe Webhook] Domain purchase confirmed: ${paymentIntent.id}`);
    return;
  }

  // Order payments
  if (orderId && businessId) {
    try {
      const orderRef = doc(db, 'businesses', businessId, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);

      if (orderSnap.exists()) {
        const data = orderSnap.data();
        // Only update if not already marked paid (avoid double-update from client + webhook)
        if (data.paymentStatus !== 'paid') {
          await updateDoc(orderRef, {
            paymentStatus: 'paid',
            status: data.status === 'pending' ? 'confirmed' : data.status,
            stripePaymentIntentId: paymentIntent.id,
            paidAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          console.log(`[Stripe Webhook] Order ${orderId} marked as paid`);
        }
      } else {
        console.warn(`[Stripe Webhook] Order ${orderId} not found in business ${businessId}`);
      }
    } catch (err) {
      console.error(`[Stripe Webhook] Failed to update order ${orderId}:`, err);
    }
  }
}

// ─── Payment Failed ─────────────────────────────────────────────

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.mohn_order_id;
  const businessId = paymentIntent.metadata?.mohn_business_id;

  console.log(`[Stripe Webhook] Payment failed: ${paymentIntent.id}, order: ${orderId}`);

  if (orderId && businessId) {
    try {
      const orderRef = doc(db, 'businesses', businessId, 'orders', orderId);
      await updateDoc(orderRef, {
        paymentStatus: 'failed',
        paymentError: paymentIntent.last_payment_error?.message || 'Payment failed',
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error(`[Stripe Webhook] Failed to update failed order ${orderId}:`, err);
    }
  }
}

// ─── Account Updated (Connect Onboarding) ─────────────────────

async function handleAccountUpdated(account: Stripe.Account) {
  const businessId = account.metadata?.mohn_business_id;
  const role = account.metadata?.mohn_role;

  console.log(`[Stripe Webhook] Account updated: ${account.id}, role: ${role}, charges: ${account.charges_enabled}, payouts: ${account.payouts_enabled}`);

  if (!businessId) return;

  if (role === 'owner') {
    try {
      await updateDoc(doc(db, 'businesses', businessId), {
        stripeChargesEnabled: account.charges_enabled ?? false,
        stripePayoutsEnabled: account.payouts_enabled ?? false,
        stripeDetailsSubmitted: account.details_submitted ?? false,
        stripeUpdatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error(`[Stripe Webhook] Failed to update business ${businessId}:`, err);
    }
  }

  if (role === 'driver') {
    const driverId = account.metadata?.mohn_driver_id;
    if (driverId) {
      try {
        await updateDoc(doc(db, 'businesses', businessId, 'drivers', driverId), {
          stripeChargesEnabled: account.charges_enabled ?? false,
          stripePayoutsEnabled: account.payouts_enabled ?? false,
          stripeDetailsSubmitted: account.details_submitted ?? false,
          stripeUpdatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error(`[Stripe Webhook] Failed to update driver ${driverId}:`, err);
      }
    }
  }
}
