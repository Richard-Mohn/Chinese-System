import type { SubscriptionTier } from '@/lib/types';

export type OfferwallSource = 'mohnmenu';

export type OfferwallPlacement = 'restaurant_menu' | 'checkout' | 'rewards_page' | 'standalone';

export type OfferwallActorRole = 'user' | 'customer' | 'owner' | 'manager' | 'staff' | 'driver';

export type OfferwallDevice = 'desktop' | 'android' | 'ios' | 'web';

export interface OfferwallTrackingContext {
  userId: string;
  source: OfferwallSource;
  placement: OfferwallPlacement;
  businessId: string;
  role: OfferwallActorRole;
  device: OfferwallDevice;
  sessionId: string;
}

export interface OGAdsOffer {
  offerid: string;
  name: string;
  name_short?: string;
  payout: string;
  description?: string;
  adcopy?: string;
  picture?: string;
  link: string;
  ctype?: string;
  country?: string;
}

export interface OGAdsPostback {
  id: string;
  offer_name: string;
  offer_id: string;
  payout: number;
  ip: string;
  conversion_time: string;
  aff_sub: string;
  aff_sub2: string;
  aff_sub3: string;
  aff_sub4: string;
  aff_sub5: string;
}

export interface OfferwallCompletion {
  userId: string;
  source: OfferwallSource;
  placement: OfferwallPlacement;
  businessId: string;
  role: OfferwallActorRole;
  device: OfferwallDevice;
  sessionId: string;
  ogadsTransactionId: string;
  offerId: string;
  offerName: string;
  payoutUsd: number;
  userPayoutUsd: number;
  businessRevenueUsd: number;
  platformRevenueUsd: number;
  businessTier: SubscriptionTier;
  status: 'credited' | 'skipped';
  createdAt: FirebaseFirestore.FieldValue;
  creditedAt: FirebaseFirestore.FieldValue | null;
}
