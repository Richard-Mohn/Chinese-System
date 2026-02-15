import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebaseAdmin';
import { parsePostbackContext } from '@/lib/offerwall/ogads-tracking';
import { computeOfferwallPayout } from '@/lib/offerwall/revenue-splits';
import type { OGAdsPostback, OfferwallCompletion } from '@/lib/offerwall/ogads-types';
import type { SubscriptionTier } from '@/lib/types';

export async function GET(req: NextRequest) {
  return handlePostback(req);
}

export async function POST(req: NextRequest) {
  return handlePostback(req);
}

async function handlePostback(req: NextRequest) {
  const url = new URL(req.url);
  const secret = url.searchParams.get('secret');
  const expectedSecret = process.env.OGADS_POSTBACK_SECRET;

  if (!expectedSecret) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  if (secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let postback: OGAdsPostback;
  try {
    postback = await parsePostbackData(req, url);
  } catch {
    return NextResponse.json({ error: 'Invalid postback data' }, { status: 400 });
  }

  const context = parsePostbackContext({
    aff_sub: postback.aff_sub,
    aff_sub2: postback.aff_sub2,
    aff_sub3: postback.aff_sub3,
    aff_sub4: postback.aff_sub4,
    aff_sub5: postback.aff_sub5,
  });

  if (!context) {
    return NextResponse.json({ error: 'Missing tracking context' }, { status: 400 });
  }

  const existingSnap = await adminDb
    .collection('offerwallCompletions')
    .where('ogadsTransactionId', '==', postback.id)
    .limit(1)
    .get();

  if (!existingSnap.empty) {
    return NextResponse.json({ status: 'duplicate', txnId: postback.id });
  }

  let tier: SubscriptionTier | 'free' = 'free';
  if (context.businessId && context.businessId !== 'none') {
    const bizSnap = await adminDb.doc(`businesses/${context.businessId}`).get();
    if (bizSnap.exists) {
      const bizTier = (bizSnap.data()?.tier as SubscriptionTier | undefined);
      if (bizTier) tier = bizTier;
    }
  }

  const split = computeOfferwallPayout(postback.payout, tier);
  if (split.userPayoutUsd < 0.01) {
    return NextResponse.json({ status: 'skipped', reason: 'payout_too_low' });
  }

  const completion: OfferwallCompletion = {
    userId: context.userId,
    source: 'mohnmenu',
    placement: context.placement,
    businessId: context.businessId,
    role: context.role,
    device: 'web',
    sessionId: context.sessionId,
    ogadsTransactionId: postback.id,
    offerId: postback.offer_id,
    offerName: postback.offer_name,
    payoutUsd: postback.payout,
    userPayoutUsd: split.userPayoutUsd,
    businessRevenueUsd: split.businessRevenueUsd,
    platformRevenueUsd: split.platformRevenueUsd,
    businessTier: tier,
    status: 'credited',
    createdAt: FieldValue.serverTimestamp(),
    creditedAt: FieldValue.serverTimestamp(),
  };

  await adminDb.collection('offerwallCompletions').add(completion);

  const userRef = adminDb.doc(`users/${context.userId}`);
  await userRef.set(
    {
      walletBalance: FieldValue.increment(Math.round(split.userPayoutUsd * 100)),
      mohnBalance: FieldValue.increment(Math.round(split.userPayoutUsd * 100)),
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );

  if (context.businessId && context.businessId !== 'none' && split.businessRevenueUsd > 0) {
    const businessRef = adminDb.doc(`businesses/${context.businessId}`);
    await businessRef.set(
      {
        offerwallRevenueUsd: FieldValue.increment(split.businessRevenueUsd),
        offerwallCompletions: FieldValue.increment(1),
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );
  }

  return NextResponse.json({
    status: 'credited',
    userId: context.userId,
    payoutUsd: postback.payout,
    userPayoutUsd: split.userPayoutUsd,
    businessRevenueUsd: split.businessRevenueUsd,
    platformRevenueUsd: split.platformRevenueUsd,
    tier,
  });
}

async function parsePostbackData(req: NextRequest, url: URL): Promise<OGAdsPostback> {
  const isPost = req.method === 'POST';
  let body: Record<string, any> = {};
  if (isPost) {
    try {
      body = await req.json();
    } catch {
      body = {};
    }
  }

  const getParam = (key: string): string => {
    const queryValue = url.searchParams.get(key);
    if (queryValue !== null && queryValue !== '') return queryValue;

    const bodyValue = body[key];
    if (bodyValue !== undefined && bodyValue !== null) return String(bodyValue);

    return '';
  };

  const payout = parseFloat(getParam('payout'));
  if (Number.isNaN(payout) || payout <= 0) throw new Error('Invalid payout');

  return {
    id: getParam('id') || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    offer_name: getParam('offer_name') || 'Unknown Offer',
    offer_id: getParam('offer_id') || 'unknown',
    payout,
    ip: getParam('ip') || 'unknown',
    conversion_time: getParam('conversion_time') || new Date().toISOString(),
    aff_sub: getParam('user_id') || getParam('aff_sub'),
    aff_sub2: getParam('aff_sub2'),
    aff_sub3: getParam('aff_sub3'),
    aff_sub4: getParam('aff_sub4'),
    aff_sub5: getParam('aff_sub5'),
  };
}
