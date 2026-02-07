/**
 * Crypto Customer Management API — NOWPayments Custody
 *
 * POST /api/crypto/customer
 *   Creates a NOWPayments custody sub-partner account for a business tenant.
 *   Called during business onboarding or when crypto is first enabled.
 *   Body: { businessId, businessSlug }
 *
 * GET /api/crypto/customer?customerId=xxx
 *   Gets a custody customer's balance across all cryptocurrencies.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createCustodyCustomer,
  getCustodyCustomerBalance,
} from '@/lib/nowpayments';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyApiAuth } from '@/lib/apiAuth';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyApiAuth(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const { businessId, businessSlug } = body;

    if (!businessId) {
      return NextResponse.json(
        { error: 'Missing required field: businessId' },
        { status: 400 }
      );
    }

    // Check if business already has a custody customer
    const bizRef = adminDb.doc(`businesses/${businessId}`);
    const bizSnap = await bizRef.get();

    if (!bizSnap.exists) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const existingCustomerId = bizSnap.data()?.nowPaymentsCustomerId;
    if (existingCustomerId) {
      // Already has a custody account — return existing info
      try {
        const balance = await getCustodyCustomerBalance(existingCustomerId);
        return NextResponse.json({
          customerId: existingCustomerId,
          isNew: false,
          balance: balance.result,
        });
      } catch {
        return NextResponse.json({
          customerId: existingCustomerId,
          isNew: false,
          balance: null,
        });
      }
    }

    // Create unique name for NOWPayments (max 30 chars, NOT email)
    // Format: "mohn_{slug}" truncated to 30 chars
    const slug = businessSlug || businessId;
    const customerName = `mohn_${slug}`.slice(0, 30);

    const result = await createCustodyCustomer(customerName);
    const customerId = result.result.id;

    // Save the NOWPayments customer ID to the business document
    await bizRef.update({
      nowPaymentsCustomerId: customerId,
      nowPaymentsCustomerName: customerName,
      updatedAt: new Date().toISOString(),
    });

    console.log(
      `[Crypto] Created custody customer for business ${businessId}: ${customerId} (${customerName})`
    );

    return NextResponse.json({
      customerId,
      customerName,
      isNew: true,
    });
  } catch (error) {
    console.error('[Crypto] Create customer error:', error);
    return NextResponse.json(
      { error: 'Failed to create crypto customer account' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyApiAuth(request);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json({ error: 'Missing customerId' }, { status: 400 });
    }

    const balance = await getCustodyCustomerBalance(customerId);
    return NextResponse.json(balance.result);
  } catch (error) {
    console.error('[Crypto] Get customer balance error:', error);
    return NextResponse.json(
      { error: 'Failed to get customer balance' },
      { status: 500 }
    );
  }
}
