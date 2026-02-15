/**
 * Staff Activity Logging & Tracking System
 *
 * Logs every meaningful staff action to Firestore so owners can track
 * performance at the end of the day — who prepared what, how many orders,
 * drinks made, meals cooked, etc.
 *
 * Collection: businesses/{businessId}/staffActivity
 */

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

/* ─── Types ─── */

export type StaffActionType =
  | 'order_status_changed'   // Server/manager advanced an order status
  | 'item_prepared'          // Chef/bartender marked item(s) as done on KDS
  | 'order_bumped'           // Staff bumped an order from their KDS station
  | 'delivery_accepted'      // Server-driver accepted a delivery
  | 'delivery_picked_up'     // Driver picked up the order
  | 'delivery_completed'     // Driver completed the delivery
  | 'order_created'          // Staff created/placed an order
  | 'order_cancelled';       // Staff cancelled an order

export interface StaffActivityEntry {
  /** Firebase Auth UID of the staff member */
  staffId: string;
  /** Display name */
  staffName: string;
  /** Staff role: server, bartender, cook, manager, etc. */
  staffRole: string;
  /** What they did */
  action: StaffActionType;
  /** Associated order ID (if any) */
  orderId?: string;
  /** Detail about what changed: e.g. "pending → preparing" */
  detail?: string;
  /** Individual items involved (for KDS item tracking) */
  items?: { name: string; quantity: number; category?: string }[];
  /** KDS station name (Kitchen, Bar, Expo, etc.) */
  station?: string;
  /** Counts for quick aggregation */
  foodItemCount?: number;   // # of food items in this action
  drinkItemCount?: number;  // # of drink items in this action
  /** ISO timestamp */
  timestamp: string;
}

/* ─── Classification helpers ─── */

const DRINK_KEYWORDS = /\b(beer|ale|ipa|lager|stout|cocktail|margarita|martini|shot|wine|whiskey|bourbon|vodka|rum|tequila|gin|spritz|mule|sour|negroni|mojito|daiquiri|bloody mary|mimosa|cider|seltzer|claw|juice|smoothie|coffee|tea|latte|espresso|cappuccino|mocha|soda|lemonade)\b/i;

const DRINK_CATEGORIES = new Set([
  'signature cocktails', 'cocktails', 'draft beer', 'beer', 'bottled & canned',
  'wine', 'whiskey & bourbon', 'shots', 'non-alcoholic', 'drinks',
  'spirits', 'mocktails', 'hot drinks', 'coffee', 'tea',
  'beverages', 'smoothies', 'juice',
]);

export function isDrinkItem(item: { name: string; category?: string }): boolean {
  if (item.category && DRINK_CATEGORIES.has(item.category.toLowerCase())) return true;
  return DRINK_KEYWORDS.test(item.name);
}

/* ─── Main log function ─── */

export async function logStaffActivity(
  businessId: string,
  entry: StaffActivityEntry,
): Promise<void> {
  if (!businessId) return;

  // Auto-compute item counts if items are provided
  if (entry.items && entry.items.length > 0) {
    let foodCount = 0;
    let drinkCount = 0;
    for (const item of entry.items) {
      const qty = item.quantity || 1;
      if (isDrinkItem(item)) {
        drinkCount += qty;
      } else {
        foodCount += qty;
      }
    }
    entry.foodItemCount = foodCount;
    entry.drinkItemCount = drinkCount;
  }

  try {
    await addDoc(
      collection(db, 'businesses', businessId, 'staffActivity'),
      {
        ...entry,
        createdAt: serverTimestamp(),
      },
    );
  } catch (err) {
    console.error('[staffActivity] Failed to log activity:', err);
  }
}

/* ─── Convenience wrappers ─── */

/** Log when a staff member changes an order status */
export function logOrderStatusChange(
  businessId: string,
  staffId: string,
  staffName: string,
  staffRole: string,
  orderId: string,
  fromStatus: string,
  toStatus: string,
) {
  return logStaffActivity(businessId, {
    staffId,
    staffName,
    staffRole,
    action: 'order_status_changed',
    orderId,
    detail: `${fromStatus} → ${toStatus}`,
    timestamp: new Date().toISOString(),
  });
}

/** Log when a staff member bumps an order from their KDS station */
export function logKdsBump(
  businessId: string,
  staffId: string,
  staffName: string,
  staffRole: string,
  orderId: string,
  stationName: string,
  items: { name: string; quantity: number; category?: string }[],
) {
  return logStaffActivity(businessId, {
    staffId,
    staffName,
    staffRole,
    action: 'order_bumped',
    orderId,
    station: stationName,
    items,
    detail: `Bumped from ${stationName}`,
    timestamp: new Date().toISOString(),
  });
}

/** Log when individual items are marked complete on KDS */
export function logItemsPrepared(
  businessId: string,
  staffId: string,
  staffName: string,
  staffRole: string,
  orderId: string,
  stationName: string,
  items: { name: string; quantity: number; category?: string }[],
) {
  return logStaffActivity(businessId, {
    staffId,
    staffName,
    staffRole,
    action: 'item_prepared',
    orderId,
    station: stationName,
    items,
    detail: items.map(i => `${i.quantity}× ${i.name}`).join(', '),
    timestamp: new Date().toISOString(),
  });
}
