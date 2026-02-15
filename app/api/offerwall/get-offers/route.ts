import { NextRequest, NextResponse } from 'next/server';
import { buildAffSubParams, detectDevice, generateSessionId } from '@/lib/offerwall/ogads-tracking';
import type {
  OfferwallActorRole,
  OfferwallPlacement,
  OfferwallSource,
  OfferwallTrackingContext,
  OGAdsOffer,
} from '@/lib/offerwall/ogads-types';

const OGADS_API_URL = 'https://unlockcontent.net/api/v2';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const apiKey = process.env.OGADS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { success: false, offers: [] as OGAdsOffer[], error: 'Offer wall not configured' },
      { status: 500 },
    );
  }

  const userId = url.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json(
      { success: false, offers: [] as OGAdsOffer[], error: 'Missing userId' },
      { status: 400 },
    );
  }

  const source = (url.searchParams.get('source') || 'mohnmenu') as OfferwallSource;
  const placement = (url.searchParams.get('placement') || 'rewards_page') as OfferwallPlacement;
  const businessId = url.searchParams.get('businessId') || 'none';
  const role = (url.searchParams.get('role') || 'customer') as OfferwallActorRole;
  const sessionId = url.searchParams.get('sessionId') || generateSessionId();

  const userAgent = req.headers.get('user-agent') || '';
  const userIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';

  const context: OfferwallTrackingContext = {
    userId,
    source,
    placement,
    businessId,
    role,
    device: detectDevice(userAgent),
    sessionId,
  };

  const affSubParams = buildAffSubParams(context);

  try {
    const ogadsUrl = new URL(OGADS_API_URL);
    ogadsUrl.searchParams.set('affiliateid', apiKey);

    if (userIp) {
      ogadsUrl.searchParams.set('ip', userIp.split(',')[0].trim());
    }

    if (userAgent) {
      ogadsUrl.searchParams.set('user_agent', userAgent);
    }

    if (context.device === 'android') ogadsUrl.searchParams.set('device', 'android');
    else if (context.device === 'ios') ogadsUrl.searchParams.set('device', 'iphone');
    else ogadsUrl.searchParams.set('device', 'desktop');

    ogadsUrl.searchParams.set('max', '20');

    const response = await fetch(ogadsUrl.toString(), {
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Offerwall Get Offers] OGAds API ${response.status}: ${errorText}`);
      return NextResponse.json(
        { success: false, offers: [] as OGAdsOffer[], error: 'Offer provider unavailable' },
        { status: 502 },
      );
    }

    const data = await response.json();
    if (data.error) {
      return NextResponse.json(
        { success: false, offers: [] as OGAdsOffer[], error: 'No offers available' },
        { status: 200 },
      );
    }

    const rawOffers: OGAdsOffer[] = data.offers || [];

    const trackedOffers = rawOffers.map((offer) => {
      const offerUrl = new URL(offer.link);
      for (const [key, value] of Object.entries(affSubParams)) {
        offerUrl.searchParams.set(key, value);
      }
      return { ...offer, link: offerUrl.toString() };
    });

    return NextResponse.json({
      success: true,
      offers: trackedOffers,
      trackingContext: { source, placement, businessId, sessionId },
    });
  } catch (err: any) {
    console.error('[Offerwall Get Offers] Failed:', err?.message || err);
    return NextResponse.json(
      { success: false, offers: [] as OGAdsOffer[], error: 'Failed to load offers' },
      { status: 500 },
    );
  }
}
