/**
 * useFeatureGate — Hook for checking feature access based on subscription tier
 *
 * Usage:
 *   const { hasFeature, featureMeta, isLocked } = useFeatureGate('kds');
 *   if (isLocked) { show upgrade prompt }
 */

'use client';

import { useAuth } from '@/context/AuthContext';
import { useMemo } from 'react';
import {
  type FeatureKey,
  type FeatureMeta,
  FEATURE_REGISTRY,
  tierMeetsRequirement,
} from './tier-features';
import type { SubscriptionTier } from './types';

export interface FeatureGateResult {
  /** Whether the current business has access to this feature */
  hasFeature: boolean;
  /** Whether this feature is locked (inverse of hasFeature) */
  isLocked: boolean;
  /** Metadata about the feature (label, description, upgrade tier, price) */
  featureMeta: FeatureMeta;
  /** The current business tier */
  currentTier: SubscriptionTier;
}

export function useFeatureGate(feature: FeatureKey): FeatureGateResult {
  const { currentBusiness } = useAuth();

  return useMemo(() => {
    const tier: SubscriptionTier = currentBusiness?.tier || 'free';
    const meta = FEATURE_REGISTRY[feature];
    const has = tierMeetsRequirement(tier, meta.minTier);

    return {
      hasFeature: has,
      isLocked: !has,
      featureMeta: meta,
      currentTier: tier,
    };
  }, [currentBusiness?.tier, feature]);
}

/**
 * Check multiple features at once.
 * Returns an object keyed by feature name.
 */
export function useFeatureGates(features: FeatureKey[]): Record<FeatureKey, FeatureGateResult> {
  const { currentBusiness } = useAuth();

  return useMemo(() => {
    const tier: SubscriptionTier = currentBusiness?.tier || 'free';
    const results = {} as Record<FeatureKey, FeatureGateResult>;

    for (const feature of features) {
      const meta = FEATURE_REGISTRY[feature];
      const has = tierMeetsRequirement(tier, meta.minTier);
      results[feature] = {
        hasFeature: has,
        isLocked: !has,
        featureMeta: meta,
        currentTier: tier,
      };
    }

    return results;
  }, [currentBusiness?.tier, features]);
}
