/**
 * Stripe Connect Platform Utilities
 *
 * Architecture:
 *   Platform (MohnMenu - Richard's account)
 *     └─ Business Owner Connected Accounts (Express)
 *         └─ Driver Connected Accounts (Express, linked via metadata)
 *
 * Payment Flow:
 *   1. Customer pays → Destination Charge to business owner's connected account
 *   2. Platform application fee (1%) auto-deducted
 *   3. Business owner receives payment minus platform fee
 *   4. For drivers: Platform creates Transfers to driver connected accounts
 *      based on completed deliveries
 */

import Stripe from 'stripe';
import { PLATFORM_FEE_PERCENT, CURRENCY, calculateCourierFee } from './config';

// ─── Singleton ───────────────────────────────────────────────

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
    _stripe = new Stripe(key, { apiVersion: '2025-04-30.basil' as Stripe.LatestApiVersion });
  }
  return _stripe;
}

// ─── Business Owner Onboarding ───────────────────────────────

export interface CreateOwnerAccountParams {
  businessId: string;
  businessName: string;
  email: string;
  /** URL to redirect to after onboarding completes */
  returnUrl: string;
  /** URL to redirect to if onboarding is abandoned */
  refreshUrl: string;
}

/**
 * Create a Stripe Express Connected Account for a Business Owner.
 * Returns the account ID and an onboarding link.
 */
export async function createOwnerAccount(params: CreateOwnerAccountParams) {
  const stripe = getStripe();

  const account = await stripe.accounts.create({
    type: 'express',
    email: params.email,
    business_type: 'individual',
    metadata: {
      mohn_business_id: params.businessId,
      mohn_role: 'owner',
      business_name: params.businessName,
    },
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    settings: {
      payouts: {
        schedule: { interval: 'daily' },
      },
    },
  });

  const link = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: params.refreshUrl,
    return_url: params.returnUrl,
    type: 'account_onboarding',
  });

  return { accountId: account.id, onboardingUrl: link.url };
}

// ─── Driver Onboarding ───────────────────────────────────────

export interface CreateDriverAccountParams {
  driverId: string;
  businessId: string;
  email: string;
  name: string;
  returnUrl: string;
  refreshUrl: string;
}

/**
 * Create a Stripe Express Connected Account for a Driver.
 * Drivers are linked to a business via metadata.
 */
export async function createDriverAccount(params: CreateDriverAccountParams) {
  const stripe = getStripe();

  const account = await stripe.accounts.create({
    type: 'express',
    email: params.email,
    business_type: 'individual',
    metadata: {
      mohn_driver_id: params.driverId,
      mohn_business_id: params.businessId,
      mohn_role: 'driver',
    },
    capabilities: {
      transfers: { requested: true },
    },
  });

  const link = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: params.refreshUrl,
    return_url: params.returnUrl,
    type: 'account_onboarding',
  });

  return { accountId: account.id, onboardingUrl: link.url };
}

// ─── Reusable Onboarding Link ────────────────────────────────

/**
 * Generate a fresh onboarding link for an existing connected account.
 * Useful when the previous link expires.
 */
export async function createOnboardingLink(
  accountId: string,
  returnUrl: string,
  refreshUrl: string,
) {
  const stripe = getStripe();
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  });
  return link.url;
}

/**
 * Generate a Stripe Express Dashboard login link for a connected account.
 * Lets owners/drivers view their Stripe dashboard.
 */
export async function createDashboardLink(accountId: string) {
  const stripe = getStripe();
  const link = await stripe.accounts.createLoginLink(accountId);
  return link.url;
}

// ─── Account Status ──────────────────────────────────────────

export interface AccountStatus {
  accountId: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requiresAction: boolean;
}

export async function getAccountStatus(accountId: string): Promise<AccountStatus> {
  const stripe = getStripe();
  const account = await stripe.accounts.retrieve(accountId);
  return {
    accountId: account.id,
    chargesEnabled: account.charges_enabled ?? false,
    payoutsEnabled: account.payouts_enabled ?? false,
    detailsSubmitted: account.details_submitted ?? false,
    requiresAction: !account.charges_enabled || !account.details_submitted,
  };
}

// ─── Destination Charge (Customer → Owner) ───────────────────

export interface CreatePaymentParams {
  /** Amount in cents */
  amountCents: number;
  /** Business owner's Stripe connected account ID */
  ownerStripeAccountId: string;
  /** Order reference */
  orderId: string;
  businessId: string;
  customerEmail?: string;
  description?: string;
  /** Whether this is a courier delivery (flat $0.25 fee instead of percentage) */
  isCourierDelivery?: boolean;
}

/**
 * Create a PaymentIntent using Destination Charges.
 *
 * Money flows:  Customer → Platform → Owner (minus application fee)
 *
 * The platform (MohnMenu) automatically keeps the application_fee_amount.
 * For courier deliveries, the platform fee is a flat $0.25.
 * For regular orders, the platform fee is 1% of the order total.
 * The rest is transferred to the business owner's connected account.
 */
export async function createDestinationCharge(params: CreatePaymentParams) {
  const stripe = getStripe();

  // Courier deliveries: flat $0.25 fee. Regular orders: 1% of total.
  const applicationFee = params.isCourierDelivery
    ? calculateCourierFee()
    : Math.round(params.amountCents * (PLATFORM_FEE_PERCENT / 100));

  const paymentIntent = await stripe.paymentIntents.create({
    amount: params.amountCents,
    currency: CURRENCY,
    application_fee_amount: applicationFee,
    transfer_data: {
      destination: params.ownerStripeAccountId,
    },
    metadata: {
      mohn_order_id: params.orderId,
      mohn_business_id: params.businessId,
      platform_fee_cents: applicationFee.toString(),
      delivery_type: params.isCourierDelivery ? 'courier' : 'standard',
    },
    receipt_email: params.customerEmail,
    description: params.description || `MohnMenu Order ${params.orderId}`,
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    applicationFee,
  };
}

// ─── Driver Payout (Platform → Driver) ───────────────────────

export interface DriverPayoutParams {
  /** Driver's Stripe connected account ID */
  driverStripeAccountId: string;
  /** Amount in cents to transfer */
  amountCents: number;
  /** Delivery/order reference */
  orderId: string;
  driverId: string;
  businessId: string;
}

/**
 * Transfer funds from the platform's balance to a driver's connected account.
 * This is called after a delivery is completed and the business owner
 * approves the payout.
 */
export async function transferToDriver(params: DriverPayoutParams) {
  const stripe = getStripe();

  const transfer = await stripe.transfers.create({
    amount: params.amountCents,
    currency: CURRENCY,
    destination: params.driverStripeAccountId,
    metadata: {
      mohn_order_id: params.orderId,
      mohn_driver_id: params.driverId,
      mohn_business_id: params.businessId,
      type: 'driver_delivery_payout',
    },
    description: `Delivery payout – Order ${params.orderId}`,
  });

  return { transferId: transfer.id };
}

// ─── Balance Check ───────────────────────────────────────────

/**
 * Get the balance of a connected account (for owners to see their earnings).
 */
export async function getAccountBalance(accountId: string) {
  const stripe = getStripe();
  const balance = await stripe.balance.retrieve({
    stripeAccount: accountId,
  });

  const available = balance.available
    .filter(b => b.currency === CURRENCY)
    .reduce((sum, b) => sum + b.amount, 0);

  const pending = balance.pending
    .filter(b => b.currency === CURRENCY)
    .reduce((sum, b) => sum + b.amount, 0);

  return { availableCents: available, pendingCents: pending };
}
