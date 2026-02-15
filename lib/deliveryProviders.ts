/**
 * Delivery Provider Integration — Community Marketplace Only
 *
 * MohnMenu runs on its own delivery marketplace and community couriers.
 * External competitor APIs (Uber/DoorDash) are intentionally not integrated.
 */

export type DeliveryProvider = 'community';

export interface DeliveryQuote {
  provider: DeliveryProvider;
  fee: number;
  estimatedMinutes: number;
  quoteId: string;
  expiresAt: string;
}

export interface DeliveryRequest {
  orderId: string;
  businessId: string;
  pickupAddress: string;
  pickupPhone: string;
  pickupBusinessName: string;
  pickupInstructions?: string;
  dropoffAddress: string;
  dropoffPhone: string;
  dropoffName: string;
  dropoffInstructions?: string;
  orderValue: number;
  tip: number;
  items: { name: string; quantity: number }[];
}

export interface DeliveryStatus {
  provider: DeliveryProvider;
  providerDeliveryId: string;
  status: 'created' | 'assigned' | 'picking_up' | 'picked_up' | 'delivering' | 'delivered' | 'cancelled' | 'returned';
  driverName?: string;
  driverPhone?: string;
  driverLat?: number;
  driverLng?: number;
  trackingUrl?: string;
  estimatedDeliveryTime?: string;
  fee?: number;
}

export async function getDeliveryQuotes(
  _req: DeliveryRequest,
  _providers: DeliveryProvider[] = ['community'],
): Promise<DeliveryQuote[]> {
  return [];
}

export async function createDelivery(
  provider: DeliveryProvider,
  req: DeliveryRequest,
): Promise<DeliveryStatus> {
  if (provider !== 'community') {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  return {
    provider: 'community',
    providerDeliveryId: `community-${req.orderId}`,
    status: 'created',
  };
}

export async function getDeliveryStatus(
  provider: DeliveryProvider,
  providerDeliveryId: string,
): Promise<DeliveryStatus> {
  if (provider !== 'community') {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  return {
    provider: 'community',
    providerDeliveryId,
    status: 'created',
  };
}

export async function cancelDelivery(
  provider: DeliveryProvider,
  providerDeliveryId: string,
): Promise<void> {
  if (provider !== 'community') {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  void providerDeliveryId;
}

export function getAvailableProviders(): DeliveryProvider[] {
  return ['community'];
}
