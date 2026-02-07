// Google Analytics 4 — helpers
// Measurement ID lives here so every import shares one source of truth.
// When you add Facebook Pixel or other trackers, extend this file.

export const GA_MEASUREMENT_ID = 'G-LQC1CSJGP6';

// ---------------------------------------------------------------------------
// Typings for the global gtag function
// ---------------------------------------------------------------------------
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

// ---------------------------------------------------------------------------
// Core helpers
// ---------------------------------------------------------------------------

/** Send a manual page_view (App Router already fires one on load via gtag config). */
export function pageview(url: string) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('config', GA_MEASUREMENT_ID, { page_path: url });
}

/** Fire an arbitrary GA4 event. */
export function event(action: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', action, params);
}

/** Identify a logged-in user so GA4 links sessions across devices. */
export function setUserId(userId: string | null) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('config', GA_MEASUREMENT_ID, { user_id: userId });
}

// ---------------------------------------------------------------------------
// GA4 Ecommerce helpers  (maps to Google's recommended events)
// https://developers.google.com/analytics/devguides/collection/ga4/ecommerce
// ---------------------------------------------------------------------------

export interface GtagItem {
  item_id: string;
  item_name: string;
  price?: number;
  quantity?: number;
  item_category?: string;
  item_brand?: string;      // business name / slug
  item_variant?: string;    // options joined
}

/** User views a product / menu item. */
export function viewItem(item: GtagItem, currency = 'USD') {
  event('view_item', {
    currency,
    value: (item.price ?? 0) * (item.quantity ?? 1),
    items: [item],
  });
}

/** User adds an item to the cart. */
export function addToCartEvent(item: GtagItem, currency = 'USD') {
  event('add_to_cart', {
    currency,
    value: (item.price ?? 0) * (item.quantity ?? 1),
    items: [item],
  });
}

/** User removes an item from the cart. */
export function removeFromCartEvent(item: GtagItem, currency = 'USD') {
  event('remove_from_cart', {
    currency,
    value: (item.price ?? 0) * (item.quantity ?? 1),
    items: [item],
  });
}

/** User views their cart. */
export function viewCart(items: GtagItem[], value: number, currency = 'USD') {
  event('view_cart', { currency, value, items });
}

/** User begins checkout. */
export function beginCheckout(items: GtagItem[], value: number, currency = 'USD') {
  event('begin_checkout', { currency, value, items });
}

/** Checkout completed / payment received. */
export function purchase(
  transactionId: string,
  items: GtagItem[],
  value: number,
  currency = 'USD',
  extra: Record<string, unknown> = {},
) {
  event('purchase', {
    transaction_id: transactionId,
    currency,
    value,
    items,
    ...extra,
  });
}

// ---------------------------------------------------------------------------
// Auth / engagement events
// ---------------------------------------------------------------------------

export function signUpEvent(method: string) {
  event('sign_up', { method });
}

export function loginEvent(method: string) {
  event('login', { method });
}

// ---------------------------------------------------------------------------
// Business / tenant context helper
// ---------------------------------------------------------------------------

/** Wrap a GtagItem with the tenant / business info so owner-level reports work. */
export function makeGtagItem(
  id: string,
  name: string,
  price: number,
  quantity: number,
  businessSlug: string,
  options?: string[],
): GtagItem {
  return {
    item_id: id,
    item_name: name,
    price,
    quantity,
    item_brand: businessSlug,
    item_variant: options?.join(', '),
  };
}
