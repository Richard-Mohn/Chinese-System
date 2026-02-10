/**
 * Real-Time Driver Location Tracking Service
 * 
 * Architecture:
 * - Driver sends GPS every 1-2 seconds (Firebase Realtime DB - ultra-fast)
 * - Customer/Restaurant subscribes to real-time listener (WebSocket-style)
 * - Map animates driver smoothly between positions
 * - Sub-second latency (no polling, true push updates)
 */

import { realtimeDb, ref, set, onValue, off, update } from './realtimeDb';

export interface DriverLocation {
  lat: number;
  lng: number;
  timestamp: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
}

export interface DriverTrackingData {
  location: DriverLocation;
  status: 'idle' | 'in_transit' | 'at_restaurant' | 'delivering';
  currentOrderId?: string;
  totalOrders?: number;
  averageRating?: number;
}

/**
 * Start tracking driver location
 * Call from driver's phone/app - sends location every 1-2 seconds
 */
export async function startDriverTracking(
  restaurantId: string,
  driverId: string,
  onLocationUpdate?: (location: DriverLocation) => void
): Promise<() => void> {
  let watchId: number | null = null;
  let lastUpdate = 0;
  const MIN_UPDATE_INTERVAL = 1000; // 1 second minimum between updates

  const watchOptions = {
    enableHighAccuracy: true, // Use GPS for accuracy
    maximumAge: 2000, // Allow slightly cached location on first read
    timeout: 15000, // 15s timeout to avoid premature failures
  };

  watchId = navigator.geolocation.watchPosition(
    (position) => {
      const now = Date.now();
      
      // Throttle updates to avoid Firebase quota issues (but keep 1-2 second frequency)
      if (now - lastUpdate < MIN_UPDATE_INTERVAL) {
        return;
      }
      lastUpdate = now;

      const { latitude, longitude, accuracy, speed, heading } = position.coords;
      const timestamp = position.timestamp;

      const location: DriverLocation = {
        lat: latitude,
        lng: longitude,
        timestamp,
        accuracy: accuracy || 0,
        speed: speed != null ? speed : 0,
        heading: heading != null ? heading : 0,
      };

      // Update Firebase Realtime DB (ultra-fast, no polling needed)
      const locationRef = ref(
        realtimeDb,
        `restaurants/${restaurantId}/drivers/${driverId}/location`
      );
      set(locationRef, location).catch((error) => {
        console.error('Failed to update driver location:', error);
      });

      // Optional: call local callback for debugging
      if (onLocationUpdate) {
        onLocationUpdate(location);
      }
    },
    (error) => {
      console.error('Geolocation error:', error);
    },
    watchOptions
  );

  // Return cleanup function
  return () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }
    // Mark driver as offline
    const statusRef = ref(
      realtimeDb,
      `restaurants/${restaurantId}/drivers/${driverId}/status`
    );
    set(statusRef, 'offline').catch(() => {});
  };
}

/**
 * Stop tracking a driver
 */
export function stopDriverTracking(restaurantId: string, driverId: string) {
  const statusRef = ref(
    realtimeDb,
    `restaurants/${restaurantId}/drivers/${driverId}/status`
  );
  set(statusRef, 'offline');
}

/**
 * Subscribe to real-time driver location updates
 * This is called from customer/restaurant dashboard
 * Returns unsubscribe function
 */
export function subscribeToDriverLocation(
  restaurantId: string,
  driverId: string,
  onLocationUpdate: (location: DriverLocation | null) => void,
  onStatusChange?: (status: string) => void
): () => void {
  const locationRef = ref(
    realtimeDb,
    `restaurants/${restaurantId}/drivers/${driverId}/location`
  );

  const statusRef = ref(
    realtimeDb,
    `restaurants/${restaurantId}/drivers/${driverId}/status`
  );

  // Listen for location changes (sub-second updates)
  const unsubscribeLocation = onValue(locationRef, (snapshot) => {
    if (snapshot.exists()) {
      onLocationUpdate(snapshot.val() as DriverLocation);
    } else {
      onLocationUpdate(null);
    }
  });

  // Listen for status changes
  let unsubscribeStatus = () => {};
  if (onStatusChange) {
    unsubscribeStatus = onValue(statusRef, (snapshot) => {
      if (snapshot.exists()) {
        onStatusChange(snapshot.val());
      }
    });
  }

  // Return combined unsubscribe function
  return () => {
    unsubscribeLocation();
    unsubscribeStatus();
  };
}

/**
 * Subscribe to all drivers for a restaurant (for admin dashboard)
 */
export function subscribeToAllDrivers(
  restaurantId: string,
  onUpdate: (drivers: Record<string, DriverTrackingData>) => void
): () => void {
  const driversRef = ref(realtimeDb, `restaurants/${restaurantId}/drivers`);

  return onValue(driversRef, (snapshot) => {
    if (snapshot.exists()) {
      onUpdate(snapshot.val() as Record<string, DriverTrackingData>);
    } else {
      onUpdate({});
    }
  });
}

/**
 * Update driver status (idle, in_transit, at_restaurant, delivering)
 */
export async function updateDriverStatus(
  restaurantId: string,
  driverId: string,
  status: 'idle' | 'in_transit' | 'at_restaurant' | 'delivering'
): Promise<void> {
  const statusRef = ref(
    realtimeDb,
    `restaurants/${restaurantId}/drivers/${driverId}/status`
  );
  return set(statusRef, status);
}

/**
 * Assign order to driver and update their status
 */
export async function assignOrderToDriver(
  restaurantId: string,
  driverId: string,
  orderId: string
): Promise<void> {
  const driverRef = ref(
    realtimeDb,
    `restaurants/${restaurantId}/drivers/${driverId}`
  );
  return update(driverRef, {
    currentOrderId: orderId,
    status: 'in_transit',
  });
}

/**
 * Complete delivery and mark driver as idle
 */
export async function completeDelivery(
  restaurantId: string,
  driverId: string
): Promise<void> {
  const driverRef = ref(
    realtimeDb,
    `restaurants/${restaurantId}/drivers/${driverId}`
  );
  return update(driverRef, {
    currentOrderId: null,
    status: 'idle',
  });
}

// ─── Community Courier Functions (cross-business) ─────────────────

/**
 * Start tracking a community courier's location.
 * Uses shared `couriers/{courierId}` RTDB path instead of business-specific path.
 */
export async function startCourierTracking(
  courierId: string,
  onLocationUpdate?: (location: DriverLocation) => void
): Promise<() => void> {
  let watchId: number | null = null;
  let lastUpdate = 0;
  const MIN_UPDATE_INTERVAL = 1000;

  watchId = navigator.geolocation.watchPosition(
    (position) => {
      const now = Date.now();
      if (now - lastUpdate < MIN_UPDATE_INTERVAL) return;
      lastUpdate = now;

      const { latitude, longitude, accuracy, speed, heading } = position.coords;
      const location: DriverLocation = {
        lat: latitude,
        lng: longitude,
        timestamp: position.timestamp,
        accuracy: accuracy || 0,
        speed: speed != null ? speed : 0,
        heading: heading != null ? heading : 0,
      };

      const locationRef = ref(realtimeDb, `couriers/${courierId}/location`);
      set(locationRef, location).catch(() => {});

      if (onLocationUpdate) onLocationUpdate(location);
    },
    (error) => console.error('Geolocation error:', error),
    { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
  );

  // Mark online
  const statusRef = ref(realtimeDb, `couriers/${courierId}/status`);
  await set(statusRef, 'idle');

  return () => {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    set(statusRef, 'offline').catch(() => {});
  };
}

/**
 * Update community courier status
 */
export async function updateCourierStatus(
  courierId: string,
  status: 'idle' | 'in_transit' | 'delivering' | 'offline'
): Promise<void> {
  const statusRef = ref(realtimeDb, `couriers/${courierId}/status`);
  return set(statusRef, status);
}

/**
 * Complete a courier delivery
 */
export async function completeCourierDelivery(courierId: string): Promise<void> {
  const courierRef = ref(realtimeDb, `couriers/${courierId}`);
  return update(courierRef, {
    currentOrderId: null,
    status: 'idle',
  });
}

/**
 * Subscribe to a community courier's location (for customer tracking)
 */
export function subscribeToCourierLocation(
  courierId: string,
  onLocationUpdate: (location: DriverLocation | null) => void,
  onStatusChange?: (status: string) => void
): () => void {
  const locationRef = ref(realtimeDb, `couriers/${courierId}/location`);
  const statusRef = ref(realtimeDb, `couriers/${courierId}/status`);

  const unsubLoc = onValue(locationRef, (snapshot) => {
    onLocationUpdate(snapshot.exists() ? snapshot.val() as DriverLocation : null);
  });

  let unsubStatus = () => {};
  if (onStatusChange) {
    unsubStatus = onValue(statusRef, (snapshot) => {
      if (snapshot.exists()) onStatusChange(snapshot.val());
    });
  }

  return () => { unsubLoc(); unsubStatus(); };
}

/**
 * Subscribe to all online community couriers (for owner dispatch view)
 */
export function subscribeToAllCouriers(
  onUpdate: (couriers: Record<string, DriverTrackingData>) => void
): () => void {
  const couriersRef = ref(realtimeDb, 'couriers');
  return onValue(couriersRef, (snapshot) => {
    onUpdate(snapshot.exists() ? snapshot.val() as Record<string, DriverTrackingData> : {});
  });
}

/**
 * Get real-time ETA between two coordinates
 * Note: For production, you'd integrate with Google Maps Distance Matrix API
 * This is a placeholder using straight-line distance
 */
export function calculateETA(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  averageSpeed: number = 25 // mph, typical city speed
): number {
  // Haversine formula for distance between two coordinates
  const R = 3959; // Earth's radius in miles
  const dLat = ((toLat - fromLat) * Math.PI) / 180;
  const dLng = ((toLng - fromLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((fromLat * Math.PI) / 180) *
      Math.cos((toLat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in miles
  const minutes = (distance / averageSpeed) * 60;
  return Math.max(1, Math.round(minutes)); // Minimum 1 minute
}
