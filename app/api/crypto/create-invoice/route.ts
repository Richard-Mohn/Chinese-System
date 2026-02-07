/**
 * Crypto Invoice API — NOWPayments
 *
 * POST /api/crypto/create-invoice
 *   Creates a NOWPayments invoice for a crypto payment.
 *   The customer is redirected to NOWPayments' hosted checkout page
 *   where they pick BTC/ETH/USDC/SOL etc. and pay.
 *
 *   Body: { orderId, businessId, amount, businessName?, returnUrl? }
 *
 * GET /api/crypto/create-invoice?paymentId=xxx
 *   Checks the status of an existing NOWPayments payment.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createInvoice, getPaymentStatus } from '@/lib/nowpayments';
import { verifyApiAuth } from '@/lib/apiAuth';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyApiAuth(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const { orderId, businessId, amount, businessName, returnUrl } = body;

    if (!orderId || !businessId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, businessId, amount' },
        { status: 400 }
      );
    }

    if (amount < 1) {
      return NextResponse.json(
        { error: 'Minimum crypto payment is $1.00' },
        { status: 400 }
      );
    }

    // Determine callback URL for IPN
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://mohnmenu.com';
    const ipnCallbackUrl = `${origin}/api/crypto/webhook`;
    const successUrl = returnUrl || `${origin}/track-delivery/${orderId}`;
    const cancelUrl = `${origin}`;

    const invoice = await createInvoice({
      priceAmount: amount,
      priceCurrency: 'usd',
      orderId: `${orderId}__${businessId}`, // Encode both IDs so webhook can split them
      orderDescription: businessName || businessId,
      ipnCallbackUrl,
      successUrl,
      cancelUrl,
      isFeePaidByUser: true,
    });

    return NextResponse.json({
      invoiceId: invoice.id,
      invoiceUrl: invoice.invoice_url,
      orderId,
      businessId,
    });
  } catch (error) {
    console.error('[Crypto] Create invoice error:', error);
    return NextResponse.json(
      { error: 'Failed to create crypto invoice' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 });
    }

    const status = await getPaymentStatus(paymentId);
    return NextResponse.json(status);
  } catch (error) {
    console.error('[Crypto] Payment status error:', error);
    return NextResponse.json(
      { error: 'Failed to get payment status' },
      { status: 500 }
    );
  }
}
