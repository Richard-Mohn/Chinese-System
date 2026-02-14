export type OfferwallDevice = 'desktop' | 'android' | 'web';

export interface OfferwallTier {
  min: number;
  max: number;
  defaultSharePct: number;
}

export interface OfferwallConfig {
  enabled: boolean;
  defaultDeviceShares: Record<OfferwallDevice, number>;
  payoutTiers: OfferwallTier[];
  perOfferSharePct: Record<string, number>;
  perDevicePerOfferSharePct: Partial<Record<OfferwallDevice, Record<string, number>>>;
  minUserPayoutUsd: number;
  maxUserSharePct: number;
}

export const DEFAULT_OFFERWALL_CONFIG: OfferwallConfig = {
  enabled: true,
  defaultDeviceShares: { desktop: 0.5, android: 0.5, web: 0.5 },
  payoutTiers: [
    { min: 0, max: 2, defaultSharePct: 0.45 },
    { min: 2, max: 5, defaultSharePct: 0.5 },
    { min: 5, max: 10, defaultSharePct: 0.5 },
    { min: 10, max: 999999, defaultSharePct: 0.4 },
  ],
  perOfferSharePct: {},
  perDevicePerOfferSharePct: {},
  minUserPayoutUsd: 0.01,
  maxUserSharePct: 0.8,
};

export function computeUserSharePct(
  payoutUsd: number,
  device: OfferwallDevice,
  offerId: string,
  config: OfferwallConfig,
): number {
  const byDeviceOffer = config.perDevicePerOfferSharePct?.[device]?.[offerId];
  if (typeof byDeviceOffer === 'number') return clampShare(byDeviceOffer, config.maxUserSharePct);

  const byOffer = config.perOfferSharePct?.[offerId];
  if (typeof byOffer === 'number') return clampShare(byOffer, config.maxUserSharePct);

  const tier =
    config.payoutTiers.find(t => payoutUsd >= t.min && payoutUsd < t.max) ||
    config.payoutTiers[config.payoutTiers.length - 1];

  const tierPct = tier?.defaultSharePct ?? 0.5;
  const devicePct = config.defaultDeviceShares[device] ?? 0.5;
  return clampShare((tierPct + devicePct) / 2, config.maxUserSharePct);
}

export function computeUserPayoutUsd(
  payoutUsd: number,
  device: OfferwallDevice,
  offerId: string,
  config: OfferwallConfig,
): number {
  if (payoutUsd <= 0) return 0;
  const pct = computeUserSharePct(payoutUsd, device, offerId, config);
  return round2(Math.max(config.minUserPayoutUsd ?? 0.01, payoutUsd * pct));
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function clampShare(value: number, maxShare: number): number {
  return Math.max(0, Math.min(value, maxShare));
}
