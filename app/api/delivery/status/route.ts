/**
 * Delivery Status API — GET /api/delivery/status
 * 
 * Gets the current delivery status from the provider.
 * Query params: provider, deliveryId
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/apiAuth';
import { getDeliveryStatus, type DeliveryProvider } from '@/lib/deliveryProviders';

export async function GET(request: NextRequest) {
  const auth = await verifyApiAuth(request);
  if ('error' in auth) return auth.error;

  const { searchParams } = request.nextUrl;
  const provider = searchParams.get('provider') as DeliveryProvider;
  const deliveryId = searchParams.get('deliveryId');

  if (!provider || !deliveryId) {
    return NextResponse.json({ error: 'provider and deliveryId are required' }, { status: 400 });
  }

  if (provider !== 'community') {
    return NextResponse.json({ error: 'Only community delivery is supported' }, { status: 400 });
  }

  try {
    const status = await getDeliveryStatus(provider, deliveryId);
    return NextResponse.json(status);
  } catch (err) {
    console.error('[API] Delivery status error:', err);
    return NextResponse.json({ error: 'Failed to get delivery status' }, { status: 500 });
  }
}
