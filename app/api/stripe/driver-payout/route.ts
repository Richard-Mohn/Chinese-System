/**
 * Driver Payout API
 *
 * POST /api/stripe/driver-payout
 *   Transfer funds from the platform to a driver's connected account
 *   after a delivery is completed.
 *
 *   Body: { driverStripeAccountId, amountCents, orderId, driverId, businessId }
 */

import { NextRequest, NextResponse } from 'next/server';
import { transferToDriver } from '@/lib/stripe/platform';
import { verifyApiAuth } from '@/lib/apiAuth';
import { paymentLimiter } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const limited = paymentLimiter(request);
    if (limited) return limited;

    // Verify authentication — only business owners should trigger payouts
    const auth = await verifyApiAuth(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const { driverStripeAccountId, amountCents, orderId, driverId, businessId } = body;

    if (!driverStripeAccountId || !amountCents || !orderId || !driverId || !businessId) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: driverStripeAccountId, amountCents, orderId, driverId, businessId',
        },
        { status: 400 },
      );
    }

    if (amountCents < 100) {
      return NextResponse.json(
        { error: 'Minimum payout is $1.00' },
        { status: 400 },
      );
    }

    const result = await transferToDriver({
      driverStripeAccountId,
      amountCents,
      orderId,
      driverId,
      businessId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Driver payout error:', error);
    return NextResponse.json(
      { error: 'Failed to process driver payout' },
      { status: 500 },
    );
  }
}
