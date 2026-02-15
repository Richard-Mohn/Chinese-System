import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/apiAuth';
import { standardLimiter } from '@/lib/rateLimit';
import { adminDb } from '@/lib/firebaseAdmin';
import { getStripe } from '@/lib/stripe/platform';

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
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

    const stripe = getStripe();
    let customerId = readString(business.stripeCustomerId);

    if (!customerId) {
      const stripeSubscriptionId = readString(business.stripeSubscriptionId);
      if (stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer?.id || null;
      }
    }

    if (!customerId) {
      return NextResponse.json({ error: 'Stripe customer not found for this business.' }, { status: 400 });
    }

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://mohnmenu.com').trim();
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/owner/settings#subscription`,
    });

    await businessRef.set(
      {
        stripeCustomerId: customerId,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('[API /billing/create-portal-session] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create portal session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
