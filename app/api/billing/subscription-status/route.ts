import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/apiAuth';
import { standardLimiter } from '@/lib/rateLimit';
import { adminDb } from '@/lib/firebaseAdmin';
import { getStripe } from '@/lib/stripe/platform';

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function readNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function readBoolean(value: unknown): boolean {
  return value === true;
}

function toIsoFromUnix(seconds?: number | null): string | null {
  if (!seconds || Number.isNaN(seconds)) return null;
  return new Date(seconds * 1000).toISOString();
}

export async function GET(request: NextRequest) {
  try {
    const limited = standardLimiter(request);
    if (limited) return limited;

    const auth = await verifyApiAuth(request);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

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

    const stripe = getStripe();

    let stripeSubscriptionId = readString(business.stripeSubscriptionId);
    const stripeCustomerId = readString(business.stripeCustomerId);

    if (!stripeSubscriptionId && stripeCustomerId) {
      const list = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: 'all',
        limit: 10,
      });

      const best =
        list.data.find(sub => ['active', 'trialing', 'past_due', 'incomplete', 'unpaid'].includes(sub.status)) ||
        list.data[0];

      if (best) {
        stripeSubscriptionId = best.id;
      }
    }

    if (!stripeSubscriptionId) {
      return NextResponse.json({
        hasSubscription: false,
        subscriptionStatus: readString(business.subscriptionStatus),
        cancelAtPeriodEnd: business.subscriptionCancelAtPeriodEnd === true,
        currentPeriodEnd: readString(business.subscriptionCurrentPeriodEnd),
        cancelAt: readString(business.subscriptionCancelAt),
        customerId: stripeCustomerId,
      });
    }

    const subscriptionResponse = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    const subscriptionLike = subscriptionResponse as unknown as Record<string, unknown>;

    const subscriptionId = readString(subscriptionLike.id) || stripeSubscriptionId;
    const subscriptionStatus = readString(subscriptionLike.status) || 'active';
    const cancelAtPeriodEnd = readBoolean(subscriptionLike.cancel_at_period_end);
    const currentPeriodEndSeconds = readNumber(subscriptionLike.current_period_end);
    const cancelAtSeconds = readNumber(subscriptionLike.cancel_at);
    const customerRaw = subscriptionLike.customer;
    const customerId =
      readString(customerRaw) ||
      (customerRaw && typeof customerRaw === 'object'
        ? readString((customerRaw as Record<string, unknown>).id)
        : null);

    const payload = {
      hasSubscription: true,
      subscriptionId,
      customerId,
      subscriptionStatus,
      cancelAtPeriodEnd,
      currentPeriodEnd: toIsoFromUnix(currentPeriodEndSeconds),
      cancelAt: toIsoFromUnix(cancelAtSeconds || currentPeriodEndSeconds),
    };

    await businessRef.set(
      {
        stripeSubscriptionId: payload.subscriptionId,
        ...(payload.customerId && { stripeCustomerId: payload.customerId }),
        subscriptionStatus: payload.subscriptionStatus,
        subscriptionCancelAtPeriodEnd: payload.cancelAtPeriodEnd,
        subscriptionCurrentPeriodEnd: payload.currentPeriodEnd,
        subscriptionCancelAt: payload.cancelAt,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json(payload);
  } catch (error) {
    console.error('[API /billing/subscription-status] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to load subscription status.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
