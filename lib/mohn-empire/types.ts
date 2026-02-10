// ============================================================================
// Mohn Empire — Unified Type Definitions
// ============================================================================

import type { Timestamp } from 'firebase/firestore';

/** Unified Mohn Empire user profile (stored in mohnmint Firestore) */
export interface MohnEmpireUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  phone: string | null;

  // Points & Rewards
  mohnPoints: number;
  totalPointsEarned: number;
  totalPointsSpent: number;
  tier: EmpireTier;

  // Membership
  memberSince: Timestamp | Date;
  lastLoginAt: Timestamp | Date;
  lastActiveProject: string;
  linkedProjects: string[];
  loginCount: number;

  // Referrals
  referralCode: string;
  referredBy: string | null;
  referralCount: number;

  // Demographics (for analytics)
  demographics: {
    city: string | null;
    state: string | null;
    country: string | null;
    timezone: string | null;
  };

  // Account
  isVerified: boolean;
  isAdmin: boolean;
}

/** Points transaction record */
export interface PointsTransaction {
  id: string;
  userId: string;
  type: 'earn' | 'spend' | 'transfer' | 'bonus' | 'referral';
  amount: number;
  balance: number;
  source: string;
  reason: PointsReason;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: Timestamp | Date;
}

/** Empire membership tiers */
export type EmpireTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

/** Reasons for earning/spending points */
export type PointsReason =
  | 'signup_bonus'
  | 'daily_login'
  | 'referral_signup'
  | 'referral_use'
  | 'order_placed'
  | 'order_completed'
  | 'review_left'
  | 'profile_complete'
  | 'first_purchase'
  | 'search_completed'
  | 'game_played'
  | 'social_share'
  | 'streak_bonus'
  | 'tier_upgrade'
  | 'manual_adjustment'
  | 'redemption';

/** Points earning rules — how many points per action */
export const POINTS_RULES: Record<PointsReason, number> = {
  signup_bonus: 100,
  daily_login: 5,
  referral_signup: 250,
  referral_use: 50,
  order_placed: 10,
  order_completed: 25,
  review_left: 15,
  profile_complete: 50,
  first_purchase: 100,
  search_completed: 5,
  game_played: 10,
  social_share: 15,
  streak_bonus: 50,
  tier_upgrade: 500,
  manual_adjustment: 0,
  redemption: 0,
};

/** Tier thresholds — total points earned to reach each tier */
export const TIER_THRESHOLDS: Record<EmpireTier, number> = {
  bronze: 0,
  silver: 500,
  gold: 2000,
  platinum: 10000,
  diamond: 50000,
};

/** Calculate tier from total points earned */
export function calculateTier(totalPointsEarned: number): EmpireTier {
  if (totalPointsEarned >= TIER_THRESHOLDS.diamond) return 'diamond';
  if (totalPointsEarned >= TIER_THRESHOLDS.platinum) return 'platinum';
  if (totalPointsEarned >= TIER_THRESHOLDS.gold) return 'gold';
  if (totalPointsEarned >= TIER_THRESHOLDS.silver) return 'silver';
  return 'bronze';
}

/** Tier display info */
export const TIER_INFO: Record<EmpireTier, { label: string; color: string; icon: string }> = {
  bronze: { label: 'Bronze', color: '#cd7f32', icon: '🥉' },
  silver: { label: 'Silver', color: '#c0c0c0', icon: '🥈' },
  gold: { label: 'Gold', color: '#ffd700', icon: '🥇' },
  platinum: { label: 'Platinum', color: '#e5e4e2', icon: '💎' },
  diamond: { label: 'Diamond', color: '#b9f2ff', icon: '👑' },
};

/** Auth state shape for the context */
export interface EmpireAuthState {
  user: MohnEmpireUser | null;
  firebaseUser: import('firebase/auth').User | null;
  loading: boolean;
  error: string | null;
}

/** Platform analytics snapshot */
export interface PlatformAnalytics {
  platformId: string;
  totalUsers: number;
  activeUsers30d: number;
  totalPointsInCirculation: number;
  totalRevenue: number;
  lastUpdated: Timestamp | Date;
}

/** Generate a referral code from uid */
export function generateReferralCode(uid: string): string {
  const hash = uid.slice(-6).toUpperCase();
  return `MOHN-${hash}`;
}
