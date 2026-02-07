/**
 * Inline Crypto Payment API — NOWPayments White-Label
 *
 * POST /api/crypto/create-payment
 *   Creates a NOWPayments payment with a specific crypto currency.
 *   Returns a deposit address + amount for inline display (no redirect).
 *   Body: { orderId, businessId, amount, payCurrency, businessName? }
 *
 * GET /api/crypto/create-payment?paymentId=xxx
 *   Polls the status of an existing payment (used for live updates).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createPayment, getPaymentStatus } from '@/lib/nowpayments';
import { verifyApiAuth } from '@/lib/apiAuth';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyApiAuth(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const { orderId, businessId, amount, payCurrency, businessName } = body;

    if (!orderId || !businessId || !amount || !payCurrency) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, businessId, amount, payCurrency' },
        { status: 400 }
      );
    }

    if (amount < 0.5) {
      return NextResponse.json(
        { error: 'Minimum crypto payment is $0.50' },
        { status: 400 }
      );
    }

    // Determine callback URL for IPN
    const origin =
      request.headers.get('origin') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://mohnmenu.com';
    const ipnCallbackUrl = `${origin}/api/crypto/webhook`;

    // Create payment — returns deposit address for inline display
    const payment = await createPayment({
      priceAmount: parseFloat(amount.toFixed(2)),
      priceCurrency: 'usd',
      payCurrency,
      orderId: `${orderId}__${businessId}`, // Encode both IDs for webhook
      orderDescription: businessName || businessId,
      ipnCallbackUrl,
      isFeePaidByUser: true,
    });

    return NextResponse.json({
      paymentId: String(payment.payment_id),
      payAddress: payment.pay_address,
      payAmount: payment.pay_amount,
      payCurrency: payment.pay_currency,
      priceCurrency: payment.price_currency,
      priceAmount: payment.price_amount,
      payinExtraId: payment.payin_extra_id, // Memo/tag for XRP, XLM, etc.
      expirationEstimate: payment.expiration_estimate_date,
      status: payment.payment_status,
      orderId,
      businessId,
    });
  } catch (error) {
    console.error('[Crypto] Create inline payment error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to create crypto payment';
    return NextResponse.json({ error: message }, { status: 500 });
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

    return NextResponse.json({
      paymentId: String(status.payment_id),
      status: status.payment_status,
      payAddress: status.pay_address,
      payAmount: status.pay_amount,
      payCurrency: status.pay_currency,
      priceAmount: status.price_amount,
      priceCurrency: status.price_currency,
      actuallyPaid: status.actually_paid,
      actuallyPaidFiat: status.actually_paid_at_fiat,
      outcomeAmount: status.outcome_amount,
      outcomeCurrency: status.outcome_currency,
    });
  } catch (error) {
    console.error('[Crypto] Payment status poll error:', error);
    return NextResponse.json(
      { error: 'Failed to get payment status' },
      { status: 500 }
    );
  }
}
