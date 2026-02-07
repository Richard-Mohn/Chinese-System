/**
 * Stripe Connect Account API
 *
 * POST /api/stripe/connect-account
 *   Creates a Stripe Express Connected Account for a business owner OR driver.
 *   Body: { role: 'owner' | 'driver', ...params }
 *
 *   Owner: { role: 'owner', businessId, businessName, email }
 *   Driver: { role: 'driver', driverId, businessId, email, name }
 *
 * GET /api/stripe/connect-account?accountId=acct_xxx
 *   Returns account status.
 *
 * GET /api/stripe/connect-account?accountId=acct_xxx&action=dashboard
 *   Returns a Stripe Express Dashboard login link.
 *
 * GET /api/stripe/connect-account?accountId=acct_xxx&action=balance
 *   Returns available/pending balance.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createOwnerAccount,
  createDriverAccount,
  getAccountStatus,
  createDashboardLink,
  getAccountBalance,
  createOnboardingLink,
} from '@/lib/stripe/platform';
import { verifyApiAuth } from '@/lib/apiAuth';
import { standardLimiter } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const limited = standardLimiter(request);
    if (limited) return limited;

    // Verify authentication
    const auth = await verifyApiAuth(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const { role } = body;
    const origin = request.headers.get('origin') || 'https://mohnmenu.com';

    if (role === 'owner') {
      const { businessId, businessName, email } = body;
      if (!businessId || !email) {
        return NextResponse.json(
          { error: 'Missing required fields: businessId, email' },
          { status: 400 },
        );
      }

      const result = await createOwnerAccount({
        businessId,
        businessName: businessName || 'My Business',
        email,
        returnUrl: `${origin}/owner/settings?stripe=success`,
        refreshUrl: `${origin}/owner/settings?stripe=refresh`,
      });

      return NextResponse.json(result);
    }

    if (role === 'driver') {
      const { driverId, businessId, email, name } = body;
      if (!driverId || !email || !businessId) {
        return NextResponse.json(
          { error: 'Missing required fields: driverId, email, businessId' },
          { status: 400 },
        );
      }

      const result = await createDriverAccount({
        driverId,
        businessId,
        email,
        name: name || '',
        returnUrl: `${origin}/driver?stripe=success&accountId=PLACEHOLDER`,
        refreshUrl: `${origin}/driver?stripe=refresh`,
      });

      return NextResponse.json(result);
    }

    // Legacy: re-onboard an existing account
    if (body.accountId) {
      const url = await createOnboardingLink(
        body.accountId,
        `${origin}/owner/settings?stripe=success`,
        `${origin}/owner/settings?stripe=refresh`,
      );
      return NextResponse.json({ onboardingUrl: url });
    }

    return NextResponse.json({ error: 'role must be "owner" or "driver"' }, { status: 400 });
  } catch (error) {
    console.error('Stripe Connect error:', error);
    return NextResponse.json(
      { error: 'Failed to create connected account' },
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
    const accountId = searchParams.get('accountId');
    const action = searchParams.get('action');

    if (!accountId) {
      return NextResponse.json({ error: 'Missing accountId' }, { status: 400 });
    }

    if (action === 'dashboard') {
      const url = await createDashboardLink(accountId);
      return NextResponse.json({ dashboardUrl: url });
    }

    if (action === 'balance') {
      const balance = await getAccountBalance(accountId);
      return NextResponse.json(balance);
    }

    // Default: return status
    const status = await getAccountStatus(accountId);
    return NextResponse.json(status);
  } catch (error) {
    console.error('Stripe account error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve account info' },
      { status: 500 },
    );
  }
}
