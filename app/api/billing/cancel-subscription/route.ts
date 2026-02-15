import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/apiAuth';
import { standardLimiter } from '@/lib/rateLimit';
import { adminDb } from '@/lib/firebaseAdmin';
import { getStripe } from '@/lib/stripe/platform';

function readNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function readBoolean(value: unknown): boolean {
  return value === true;
}

async function resolveStripeSubscriptionId(stripeCustomerId: string | null, stripeSubscriptionId: string | null) {
  if (stripeSubscriptionId) return stripeSubscriptionId;
  if (!stripeCustomerId) return null;

  const stripe = getStripe();
  const list = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: 'all',
    limit: 10,
  });

  const best =
    list.data.find(sub => ['active', 'trialing', 'past_due', 'incomplete', 'unpaid'].includes(sub.status)) ||
    list.data[0];

  return best?.id || null;
}

export async function POST(request: NextRequest) {
  try {
    const limited = standardLimiter(request);
    if (limited) return limited;

    const auth = await verifyApiAuth(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const businessId = readString(body?.businessId);

    if (!businessId) {
      return NextResponse.json({ error: 'Missing businessId' }, { status: 400 });
    }

    const businessRef = adminDb.collection('businesses').doc(businessId);
    const businessSnap = await businessRef.get();

    if (!businessSnap.exists) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const business = businessSnap.data() || {};
    if (business.ownerId !== auth.uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const stripeCustomerId = readString(business.stripeCustomerId);
    const existingSubscriptionId = readString(business.stripeSubscriptionId);
    const stripeSubscriptionId = await resolveStripeSubscriptionId(stripeCustomerId, existingSubscriptionId);

    if (!stripeSubscriptionId) {
      return NextResponse.json({ error: 'No subscription found for this business.' }, { status: 404 });
    }

    const stripe = getStripe();
    const subscriptionResponse = await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    const subscriptionLike = subscriptionResponse as unknown as Record<string, unknown>;
    const subscriptionId = readString(subscriptionLike.id) || stripeSubscriptionId;
    const subscriptionStatus = readString(subscriptionLike.status) || 'canceled';
    const cancelAtPeriodEnd = readBoolean(subscriptionLike.cancel_at_period_end);
    const currentPeriodEndSeconds = readNumber(subscriptionLike.current_period_end);
    const cancelAtSeconds = readNumber(subscriptionLike.cancel_at);

    const currentPeriodEnd = currentPeriodEndSeconds
      ? new Date(currentPeriodEndSeconds * 1000).toISOString()
      : null;

    const cancelAt = cancelAtSeconds
      ? new Date(cancelAtSeconds * 1000).toISOString()
      : currentPeriodEnd;

    await businessRef.set(
      {
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus,
        subscriptionCancelAtPeriodEnd: cancelAtPeriodEnd,
        subscriptionCurrentPeriodEnd: currentPeriodEnd,
        subscriptionCancelAt: cancelAt,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({
      message: 'Subscription will cancel at the end of the current billing period.',
      subscriptionId,
      cancelAtPeriodEnd,
      currentPeriodEnd,
      cancelAt,
    });
  } catch (error) {
    console.error('[API /billing/cancel-subscription] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to cancel subscription.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
