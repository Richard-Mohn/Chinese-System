/**
 * Delivery Webhook — POST /api/delivery/webhook
 * 
 * Community courier webhook endpoint.
 *
 * External provider webhooks are intentionally unsupported.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await request.json();
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[Delivery Webhook] Error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
