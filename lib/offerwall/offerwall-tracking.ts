import type { OfferwallDevice } from './offerwall-engine';

export type OfferwallActorRole =
  | 'owner'
  | 'manager'
  | 'staff'
  | 'driver'
  | 'customer'
  | 'church-admin'
  | 'church-member'
  | 'volunteer';

export interface OfferwallTrackingContext {
  uid: string;
  role: OfferwallActorRole;
  businessId: string;
  businessSlug?: string;
  roleId?: string;
  device: OfferwallDevice;
  source?: string;
}

export interface OfferwallLedgerEntry {
  uid: string;
  role: OfferwallActorRole;
  businessId: string;
  businessSlug: string;
  roleId: string;
  offerId: string;
  offerName: string;
  networkPayoutUsd: number;
  userPayoutUsd: number;
  businessRevenueUsd: number;
  device: OfferwallDevice;
  status: 'pending' | 'credited' | 'reversed';
  createdAt: string;
}

export function buildOfferwallQuery(context: OfferwallTrackingContext): URLSearchParams {
  const params = new URLSearchParams();
  params.set('userId', context.uid);
  params.set('device', context.device);
  params.set('aff_sub', context.uid);
  params.set('aff_sub2', context.device);
  params.set('aff_sub3', context.businessId);
  params.set('aff_sub4', context.role);
  params.set('aff_sub5', context.roleId || context.uid);

  if (context.businessSlug) params.set('businessSlug', context.businessSlug);
  if (context.source) params.set('source', context.source);

  return params;
}

export function buildOfferwallGetOffersUrl(baseApiUrl: string, context: OfferwallTrackingContext): string {
  const normalizedBase = baseApiUrl.endsWith('/') ? baseApiUrl.slice(0, -1) : baseApiUrl;
  return `${normalizedBase}/api/offerwall/get-offers?${buildOfferwallQuery(context).toString()}`;
}

export function createOfferwallLedgerEntry(input: {
  context: OfferwallTrackingContext;
  offerId: string;
  offerName: string;
  networkPayoutUsd: number;
  userPayoutUsd: number;
}): OfferwallLedgerEntry {
  return {
    uid: input.context.uid,
    role: input.context.role,
    businessId: input.context.businessId,
    businessSlug: input.context.businessSlug || '',
    roleId: input.context.roleId || input.context.uid,
    offerId: input.offerId,
    offerName: input.offerName,
    networkPayoutUsd: input.networkPayoutUsd,
    userPayoutUsd: input.userPayoutUsd,
    businessRevenueUsd: Math.max(0, input.networkPayoutUsd - input.userPayoutUsd),
    device: input.context.device,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
}
