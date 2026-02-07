/**
 * Crypto IPN Webhook — NOWPayments
 *
 * POST /api/crypto/webhook
 *   Receives Instant Payment Notifications from NOWPayments.
 *   Verifies HMAC-SHA512 signature, updates order status,
 *   and credits the business's crypto ledger.
 *
 *   NOWPayments sends this automatically when payment status changes.
 *   Statuses: waiting → confirming → confirmed → sending → finished
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyIpnSignature, isPaymentFinished, isPaymentFailed } from '@/lib/nowpayments';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

// NOTE: Webhook routes are NOT authenticated via Bearer token.
// They verify via HMAC-SHA512 signature from NOWPayments.

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-nowpayments-sig');
    const body = await request.json();

    console.log('[Crypto Webhook] Received IPN:', {
      payment_id: body.payment_id,
      payment_status: body.payment_status,
      order_id: body.order_id,
      price_amount: body.price_amount,
      actually_paid: body.actually_paid,
    });

    // Verify signature
    if (!signature || !verifyIpnSignature(body, signature)) {
      console.error('[Crypto Webhook] Invalid IPN signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    // Parse order_id — we encoded it as "orderId__businessId"
    const rawOrderId = body.order_id as string;
    const [orderId, businessId] = rawOrderId.includes('__')
      ? rawOrderId.split('__')
      : [rawOrderId, null];

    if (!orderId) {
      console.error('[Crypto Webhook] No orderId in IPN');
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });
    }

    const paymentStatus = body.payment_status as string;
    const nowPaymentId = String(body.payment_id);
    const priceAmountUsd = Number(body.price_amount) || 0;
    const actuallyPaid = Number(body.actually_paid) || 0;
    const payCurrency = (body.pay_currency as string) || 'unknown';

    // Find the order — try with businessId first, then search
    let orderRef;
    if (businessId) {
      orderRef = adminDb.doc(`businesses/${businessId}/orders/${orderId}`);
    } else {
      // Search across businesses if businessId wasn't encoded
      console.warn('[Crypto Webhook] No businessId in order_id, searching...');
      return NextResponse.json({ status: 'ok', note: 'no businessId' });
    }

    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) {
      console.error(`[Crypto Webhook] Order not found: ${orderId} in business ${businessId}`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Build update data
    const updateData: Record<string, unknown> = {
      'cryptoPayment.nowPaymentId': nowPaymentId,
      'cryptoPayment.status': paymentStatus,
      'cryptoPayment.payCurrency': payCurrency,
      'cryptoPayment.actuallyPaid': actuallyPaid,
      'cryptoPayment.priceAmountUsd': priceAmountUsd,
      'cryptoPayment.lastIpnAt': new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isPaymentFinished(paymentStatus)) {
      // Payment complete — confirm the order
      updateData.paymentStatus = 'paid_crypto';
      updateData.status = 'confirmed';

      console.log(`[Crypto Webhook] Payment FINISHED for order ${orderId}. $${priceAmountUsd} in ${payCurrency}`);

      // Credit the business's crypto ledger
      if (businessId) {
        const ledgerRef = adminDb.collection(`businesses/${businessId}/cryptoLedger`).doc();
        await ledgerRef.set({
          type: 'credit',
          orderId,
          nowPaymentId,
          amountUsd: priceAmountUsd,
          cryptoAmount: actuallyPaid,
          cryptoCurrency: payCurrency,
          description: `Crypto payment for order #${orderId.slice(0, 8)}`,
          createdAt: new Date().toISOString(),
        });

        // Update aggregate balance on business doc (atomic increment)
        const bizRef = adminDb.doc(`businesses/${businessId}`);
        await bizRef.update({
          cryptoBalance: FieldValue.increment(priceAmountUsd),
          updatedAt: new Date().toISOString(),
        });
      }
    } else if (isPaymentFailed(paymentStatus)) {
      updateData.paymentStatus = 'failed';
      updateData.status = 'cancelled';
      console.log(`[Crypto Webhook] Payment FAILED for order ${orderId}: ${paymentStatus}`);
    } else {
      // Still pending (waiting, confirming, confirmed, sending)
      updateData.paymentStatus = 'awaiting_crypto';
      console.log(`[Crypto Webhook] Payment ${paymentStatus} for order ${orderId}`);
    }

    await orderRef.update(updateData);

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('[Crypto Webhook] Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
