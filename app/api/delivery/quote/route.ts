/**
 * Delivery Quote API — GET /api/delivery/quote
 * 
 * Gets the community courier delivery quote for the specified pickup/dropoff.
 * 
 * Query params: businessId, orderId, dropoffAddress, dropoffPhone, dropoffName
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/apiAuth';
import { adminDb } from '@/lib/firebaseAdmin';

export async function GET(request: NextRequest) {
  const auth = await verifyApiAuth(request);
  if ('error' in auth) return auth.error;

  const { searchParams } = request.nextUrl;
  const businessId = searchParams.get('businessId');
  const dropoffAddress = searchParams.get('dropoffAddress');
  const dropoffPhone = searchParams.get('dropoffPhone') || '';
  const dropoffName = searchParams.get('dropoffName') || 'Customer';

  if (!businessId || !dropoffAddress) {
    return NextResponse.json({ error: 'businessId and dropoffAddress are required' }, { status: 400 });
  }

  try {
    // Get business info for pickup address
    const businessDoc = await adminDb.collection('businesses').doc(businessId).get();
    if (!businessDoc.exists) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const business = businessDoc.data()!;
    const pickupAddress = [business.address, business.city, business.state, business.zipCode]
      .filter(Boolean)
      .join(', ');

    const deliveryFee = business.settings?.pricing?.deliveryFee || 3.99;
    const quotes = [{
      provider: 'community',
      fee: Math.round(deliveryFee * 100), // Convert to cents
      estimatedMinutes: 30,
      quoteId: 'community',
      expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
    }];

    return NextResponse.json({
      quotes,
      available: ['community'],
    });
  } catch (err) {
    console.error('[API] Delivery quote error:', err);
    return NextResponse.json({ error: 'Failed to get delivery quotes' }, { status: 500 });
  }
}
