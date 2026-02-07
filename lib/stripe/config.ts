/**
 * Stripe Configuration for MohnMenu Platform
 * Marketplace model via Stripe Connect
 */

// ─── Platform Constants ──────────────────────────────────────────

/** Minimum order amount in cents */
export const MINIMUM_ORDER_AMOUNT = 500; // $5.00

/** Default currency */
export const CURRENCY = 'usd';

/** Platform fee percentage (MohnMenu takes this cut from each order) */
export const PLATFORM_FEE_PERCENT = 1; // 1%

/** Flat platform fee for courier deliveries (cents) */
export const COURIER_PLATFORM_FEE_CENTS = 25; // $0.25 flat per courier delivery

/** Stripe processing fee estimate (display purposes only) */
export const STRIPE_PROCESSING_FEE_PERCENT = 2.9;
export const STRIPE_PROCESSING_FEE_FIXED = 30; // 30 cents

// Legacy compat
export const STRIPE_CONFIG = {
  PLATFORM_FEE_PERCENT,
  MINIMUM_ORDER_AMOUNT,
  CURRENCY,
};

// ─── Fee Calculation ──────────────────────────────────────────

/**
 * Calculate the platform application fee for a Stripe Connect payment.
 * This is the amount MohnMenu receives from each order.
 * For courier deliveries, use calculateCourierFee() instead.
 */
export function calculatePlatformFee(amountCents: number): number {
  return Math.round(amountCents * (PLATFORM_FEE_PERCENT / 100));
}

/**
 * Calculate the flat platform fee for a courier delivery.
 * Returns 25 cents ($0.25) regardless of order size.
 */
export function calculateCourierFee(): number {
  return COURIER_PLATFORM_FEE_CENTS;
}

/** Convert dollars to cents for Stripe */
export function toCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/** Convert cents to dollar display string */
export function toDisplay(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
