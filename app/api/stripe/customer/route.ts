/**
 * Stripe Customer API
 *
 * POST /api/stripe/customer
 *   Creates or retrieves a Stripe Customer for the authenticated user.
 *   This is the correct 2026 flow: collect customer info → create Stripe Customer → create payment.
 *   Body: { email, name?, phone? }
 *   Returns: { customerId, created }
 *
 * GET /api/stripe/customer?customerId=cus_xxx
 *   Returns saved payment methods for the customer.
 *
 * GET /api/stripe/customer?customerId=cus_xxx&action=wallet
 *   Returns wallet balance from Firestore.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createOrGetStripeCustomer,
  listCustomerPaymentMethods,
} from '@/lib/stripe/platform';
import { verifyApiAuth } from '@/lib/apiAuth';
import { standardLimiter } from '@/lib/rateLimit';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const limited = standardLimiter(request);
    if (limited) return limited;

    // Verify authentication
    const auth = await verifyApiAuth(request);
    if (auth.error) return auth.error;

    const firebaseUid = auth.uid!;
    const body = await request.json();
    const { email, name, phone } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Missing required field: email' },
        { status: 400 },
      );
    }

    // Check if user already has a Stripe Customer ID in Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUid));
    const existingCustomerId = userDoc.exists()
      ? userDoc.data()?.stripeCustomerId
      : undefined;

    // Create or retrieve Stripe Customer
    const result = await createOrGetStripeCustomer({
      email,
      name,
      phone,
      firebaseUid,
      existingCustomerId,
    });

    // Save stripeCustomerId to Firestore user doc if new
    if (result.created || !existingCustomerId) {
      await updateDoc(doc(db, 'users', firebaseUid), {
        stripeCustomerId: result.customerId,
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Stripe Customer error:', error);
    return NextResponse.json(
      { error: 'Failed to create/retrieve customer' },
      { status: 500 },
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
    const action = searchParams.get('action');

    if (action === 'wallet') {
      // Return wallet balance from Firestore
      const firebaseUid = auth.uid!;
      const userDoc = await getDoc(doc(db, 'users', firebaseUid));
      const walletBalance = userDoc.exists()
        ? userDoc.data()?.walletBalance || 0
        : 0;

      return NextResponse.json({ walletBalanceCents: walletBalance });
    }

    if (!customerId) {
      return NextResponse.json({ error: 'Missing customerId' }, { status: 400 });
    }

    // List saved payment methods
    const paymentMethods = await listCustomerPaymentMethods(customerId);
    return NextResponse.json({ paymentMethods });
  } catch (error) {
    console.error('Stripe Customer GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve customer info' },
      { status: 500 },
    );
  }
}
