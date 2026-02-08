/**
 * TIER_FEATURES — Single source of truth for subscription-based feature gating
 *
 * Maps each SubscriptionTier to the features and owner pages it unlocks.
 * Used by useFeatureGate(), <FeatureLock>, and <GatedPage> to enforce access.
 *
 * Feature keys correspond to owner dashboard pages and tenant storefront features.
 */

import type { SubscriptionTier } from './types';

// ─── Feature Keys ────────────────────────────────────────────

export type FeatureKey =
  // Pages (owner dashboard routes)
  | 'dashboard'
  | 'orders'
  | 'menu'
  | 'website'
  | 'settings'
  | 'staff'
  | 'kds'
  | 'analytics'
  | 'reservations'
  | 'drivers'
  | 'dispatch'
  | 'chef-cam'
  | 'entertainment'
  | 'floor-plan'
  | 'auctions'
  | 'domain'
  // Functional features
  | 'quick-order'
  | 'qr-ordering'
  | 'card-payments'
  | 'crypto-payments'
  | 'cash-payments'
  | 'real-time-tracking'
  | 'gps-fleet-tracking'
  | 'live-streaming'
  | 'driver-management'
  | 'advanced-analytics'
  | 'loyalty-program'
  | 'api-access'
  | 'custom-integrations'
  | 'staff-marketplace'
  | 'inventory-tracking'
  | 'flash-sales';

// ─── Feature Metadata ────────────────────────────────────────

export interface FeatureMeta {
  label: string;
  description: string;
  /** Minimum tier required to unlock this feature */
  minTier: SubscriptionTier;
  /** The tier name to display in upgrade prompts */
  upgradeTo: string;
  /** Price of the required tier for display */
  upgradePrice: string;
}

// ─── Tier Hierarchy (for comparison) ─────────────────────────

const TIER_RANK: Record<SubscriptionTier, number> = {
  free: 0,
  starter: 1,
  growth: 2,
  professional: 3,
  reseller: 4,
};

/**
 * Normalize tier aliases (e.g. 'pro' → 'professional') to canonical names.
 * Handles legacy or shorthand tier values stored in Firestore.
 */
const TIER_ALIASES: Record<string, SubscriptionTier> = {
  pro: 'professional',
  basic: 'starter',
  premium: 'growth',
  enterprise: 'reseller',
};

function normalizeTier(tier: string | undefined): SubscriptionTier {
  if (!tier) return 'free';
  if (tier in TIER_RANK) return tier as SubscriptionTier;
  return TIER_ALIASES[tier] || 'free';
}

/**
 * Check if a given tier meets or exceeds the required tier level.
 */
export function tierMeetsRequirement(
  currentTier: SubscriptionTier | string | undefined,
  requiredTier: SubscriptionTier
): boolean {
  const current = TIER_RANK[normalizeTier(currentTier)] ?? 0;
  const required = TIER_RANK[requiredTier] ?? 0;
  return current >= required;
}

// ─── Feature Registry ────────────────────────────────────────

export const FEATURE_REGISTRY: Record<FeatureKey, FeatureMeta> = {
  // ── Always available (starter+) ──
  dashboard:       { label: 'Dashboard',           description: 'Business overview and quick stats',          minTier: 'starter', upgradeTo: 'Starter',       upgradePrice: '$19.99/mo' },
  orders:          { label: 'Orders',               description: 'View and manage incoming orders',            minTier: 'starter', upgradeTo: 'Starter',       upgradePrice: '$19.99/mo' },
  menu:            { label: 'Menu Editor',           description: 'Create and manage your menu items',          minTier: 'starter', upgradeTo: 'Starter',       upgradePrice: '$19.99/mo' },
  website:         { label: 'Website Builder',       description: 'Build your branded online storefront',       minTier: 'starter', upgradeTo: 'Starter',       upgradePrice: '$19.99/mo' },
  settings:        { label: 'Settings',              description: 'Configure your business settings',           minTier: 'starter', upgradeTo: 'Starter',       upgradePrice: '$19.99/mo' },
  'quick-order':   { label: 'Quick Order',           description: 'One-click ordering widget for customers',    minTier: 'starter', upgradeTo: 'Starter',       upgradePrice: '$19.99/mo' },
  'qr-ordering':   { label: 'QR Code Ordering',      description: 'Table QR codes for dine-in ordering',        minTier: 'starter', upgradeTo: 'Starter',       upgradePrice: '$19.99/mo' },
  'card-payments':  { label: 'Card Payments',         description: 'Accept card payments via Stripe',            minTier: 'starter', upgradeTo: 'Starter',       upgradePrice: '$19.99/mo' },
  'crypto-payments':{ label: 'Crypto Payments',       description: 'Accept BTC, ETH, and 6+ cryptocurrencies',  minTier: 'starter', upgradeTo: 'Starter',       upgradePrice: '$19.99/mo' },
  'cash-payments':  { label: 'Cash Payments',         description: 'Allow cash-on-delivery orders',              minTier: 'starter', upgradeTo: 'Starter',       upgradePrice: '$19.99/mo' },

  // ── Growth tier ($49.99/mo) ──
  staff:             { label: 'Staff Management',     description: 'Manage your team, roles, and schedules',     minTier: 'growth', upgradeTo: 'Growth',        upgradePrice: '$49.99/mo' },
  kds:               { label: 'Kitchen Display',      description: 'Real-time kitchen order display system',     minTier: 'growth', upgradeTo: 'Growth',        upgradePrice: '$49.99/mo' },
  analytics:         { label: 'Analytics',            description: 'Sales analytics and traffic insights',       minTier: 'growth', upgradeTo: 'Growth',        upgradePrice: '$49.99/mo' },
  reservations:      { label: 'Reservations',         description: 'Online table and event reservations',        minTier: 'growth', upgradeTo: 'Growth',        upgradePrice: '$49.99/mo' },
  domain:            { label: 'Custom Domain',        description: 'Use your own domain (e.g. yourbiz.com)',     minTier: 'growth', upgradeTo: 'Growth',        upgradePrice: '$49.99/mo' },
  'real-time-tracking': { label: 'Real-Time Tracking', description: 'Live order status updates for customers',   minTier: 'growth', upgradeTo: 'Growth',        upgradePrice: '$49.99/mo' },
  'inventory-tracking': { label: 'Inventory Tracking', description: 'Track stock levels and low-stock alerts',   minTier: 'growth', upgradeTo: 'Growth',        upgradePrice: '$49.99/mo' },
  'flash-sales':     { label: 'Flash Sales',          description: 'Time-limited sale prices on menu items',     minTier: 'growth', upgradeTo: 'Growth',        upgradePrice: '$49.99/mo' },

  // ── Professional tier ($99.99/mo) ──
  drivers:           { label: 'Driver Management',    description: 'Manage your in-house delivery drivers',      minTier: 'professional', upgradeTo: 'Professional', upgradePrice: '$99.99/mo' },
  dispatch:          { label: 'Live Dispatch',         description: 'GPS fleet tracking and driver dispatch',     minTier: 'professional', upgradeTo: 'Professional', upgradePrice: '$99.99/mo' },
  'chef-cam':        { label: 'Chef Cam',             description: 'Live kitchen camera streaming',              minTier: 'professional', upgradeTo: 'Professional', upgradePrice: '$99.99/mo' },
  entertainment:     { label: 'Entertainment',         description: 'Jukebox, karaoke, and music management',     minTier: 'professional', upgradeTo: 'Professional', upgradePrice: '$99.99/mo' },
  'floor-plan':      { label: 'Floor Plan',           description: 'Interactive floor plan and table editor',     minTier: 'professional', upgradeTo: 'Professional', upgradePrice: '$99.99/mo' },
  auctions:          { label: 'Auctions',              description: 'Real-time product and item auctions',        minTier: 'professional', upgradeTo: 'Professional', upgradePrice: '$99.99/mo' },
  'gps-fleet-tracking': { label: 'GPS Fleet Tracking', description: 'Sub-second driver location tracking',       minTier: 'professional', upgradeTo: 'Professional', upgradePrice: '$99.99/mo' },
  'live-streaming':  { label: 'Live Streaming',       description: 'Stream live video to customers',             minTier: 'professional', upgradeTo: 'Professional', upgradePrice: '$99.99/mo' },
  'driver-management': { label: 'Driver Management',  description: 'Full driver fleet management tools',         minTier: 'professional', upgradeTo: 'Professional', upgradePrice: '$99.99/mo' },
  'advanced-analytics': { label: 'Advanced Analytics', description: 'Deep reporting, exports, and BI tools',     minTier: 'professional', upgradeTo: 'Professional', upgradePrice: '$99.99/mo' },
  'loyalty-program': { label: 'Loyalty Program',      description: 'Customer loyalty and rewards program',       minTier: 'professional', upgradeTo: 'Professional', upgradePrice: '$99.99/mo' },
  'api-access':      { label: 'API Access',           description: 'REST API for custom integrations',           minTier: 'professional', upgradeTo: 'Professional', upgradePrice: '$99.99/mo' },
  'custom-integrations': { label: 'Custom Integrations', description: 'Connect third-party tools and services', minTier: 'professional', upgradeTo: 'Professional', upgradePrice: '$99.99/mo' },
  'staff-marketplace': { label: 'Staff Marketplace',  description: 'Hire shared staff from the platform',        minTier: 'professional', upgradeTo: 'Professional', upgradePrice: '$99.99/mo' },
};

// ─── Owner page → feature key mapping ────────────────────────

export const OWNER_PAGE_FEATURE: Record<string, FeatureKey> = {
  '/owner':              'dashboard',
  '/owner/orders':       'orders',
  '/owner/menu':         'menu',
  '/owner/website':      'website',
  '/owner/settings':     'settings',
  '/owner/staff':        'staff',
  '/owner/kds':          'kds',
  '/owner/analytics':    'analytics',
  '/owner/reservations': 'reservations',
  '/owner/drivers':      'drivers',
  '/owner/dispatch':     'dispatch',
  '/owner/chef-cam':     'chef-cam',
  '/owner/entertainment':'entertainment',
  '/owner/floor-plan':   'floor-plan',
  '/owner/auctions':     'auctions',
  '/owner/domain':       'domain',
};

// ─── Helper: get all features available at a tier ────────────

export function getFeaturesForTier(tier: SubscriptionTier): FeatureKey[] {
  return (Object.keys(FEATURE_REGISTRY) as FeatureKey[]).filter(
    key => tierMeetsRequirement(tier, FEATURE_REGISTRY[key].minTier)
  );
}

// ─── Helper: get all locked features for a tier ──────────────

export function getLockedFeatures(tier: SubscriptionTier): FeatureKey[] {
  return (Object.keys(FEATURE_REGISTRY) as FeatureKey[]).filter(
    key => !tierMeetsRequirement(tier, FEATURE_REGISTRY[key].minTier)
  );
}
