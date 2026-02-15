import type { SubscriptionTier } from '@/lib/types';

export interface OfferwallSplit {
  userSharePct: number;
  businessSharePct: number;
  platformSharePct: number;
}

const SPLITS_BY_TIER: Record<SubscriptionTier, OfferwallSplit> = {
  free: { userSharePct: 0.2, businessSharePct: 0.05, platformSharePct: 0.75 },
  starter: { userSharePct: 0.2, businessSharePct: 0.15, platformSharePct: 0.65 },
  growth: { userSharePct: 0.3, businessSharePct: 0.15, platformSharePct: 0.55 },
  professional: { userSharePct: 0.35, businessSharePct: 0.15, platformSharePct: 0.5 },
  reseller: { userSharePct: 0.3, businessSharePct: 0.2, platformSharePct: 0.5 },
};

export function getOfferwallSplitForTier(tier: SubscriptionTier | string | undefined): OfferwallSplit {
  if (!tier) return SPLITS_BY_TIER.free;
  return SPLITS_BY_TIER[tier as SubscriptionTier] || SPLITS_BY_TIER.free;
}

export function computeOfferwallPayout(
  payoutUsd: number,
  tier: SubscriptionTier | string | undefined,
): {
  userPayoutUsd: number;
  businessRevenueUsd: number;
  platformRevenueUsd: number;
  split: OfferwallSplit;
} {
  const split = getOfferwallSplitForTier(tier);
  const userPayoutUsd = round2(payoutUsd * split.userSharePct);
  const businessRevenueUsd = round2(payoutUsd * split.businessSharePct);
  const platformRevenueUsd = round2(payoutUsd - userPayoutUsd - businessRevenueUsd);

  return { userPayoutUsd, businessRevenueUsd, platformRevenueUsd, split };
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
