/**
 * React Hooks for Real-Time Driver Tracking
 * Easy integration into any component
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  DriverLocation,
  subscribeToDriverLocation,
  subscribeToAllDrivers,
  updateDriverStatus,
  assignOrderToDriver,
  completeDelivery,
  startDriverTracking,
  stopDriverTracking,
  calculateETA,
  DriverTrackingData,
} from './realTimeTracking';

/**
 * Hook: Track a single driver in real-time
 * Usage: const { location, eta, status } = useDriverTracking(restaurantId, driverId, destLat, destLng)
 */
export function useDriverTracking(
  restaurantId: string | null,
  driverId: string | null,
  destinationLat?: number | null,
  destinationLng?: number | null
) {
  const [location, setLocation] = useState<DriverLocation | null>(null);
  const [status, setStatus] = useState<string>('idle');
  const [eta, setEta] = useState<number | null>(null);

  useEffect(() => {
    if (!restaurantId || !driverId) return;

    const unsubscribe = subscribeToDriverLocation(
      restaurantId,
      driverId,
      (loc) => {
        if (loc) {
          setLocation(loc);
          // Calculate real ETA if we have destination coordinates
          if (destinationLat && destinationLng) {
            const speed = loc.speed ? loc.speed * 2.237 : 25; // Convert m/s to mph, default 25mph
            setEta(calculateETA(loc.lat, loc.lng, destinationLat, destinationLng, Math.max(5, speed)));
          } else {
            // No destination provided — estimate based on status
            setEta(status === 'delivering' ? 10 : null);
          }
        }
      },
      setStatus
    );

    return unsubscribe;
  }, [restaurantId, driverId, destinationLat, destinationLng]);

  return { location, status, eta };
}

/**
 * Hook: Track all drivers for a restaurant (admin dashboard)
 * Usage: const { drivers, loading } = useAllDrivers(restaurantId)
 */
export function useAllDrivers(restaurantId: string | null) {
  const [drivers, setDrivers] = useState<Record<string, DriverTrackingData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurantId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToAllDrivers(restaurantId, (driversData) => {
      setDrivers(driversData);
      setLoading(false);
    });

    return unsubscribe;
  }, [restaurantId]);

  return { drivers, loading };
}

/**
 * Hook: Manage driver status updates
 * Usage: const { updateStatus, loading, error } = useDriverStatus(restaurantId, driverId)
 */
export function useDriverStatus(
  restaurantId: string | null,
  driverId: string | null
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = useCallback(
    async (newStatus: 'idle' | 'in_transit' | 'at_restaurant' | 'delivering') => {
      if (!restaurantId || !driverId) return;

      setLoading(true);
      setError(null);

      try {
        await updateDriverStatus(restaurantId, driverId, newStatus);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Update failed');
      } finally {
        setLoading(false);
      }
    },
    [restaurantId, driverId]
  );

  return { updateStatus, loading, error };
}

/**
 * Hook: Manage order assignment to driver
 * Usage: const { assignOrder, complete, loading } = useOrderAssignment(restaurantId, driverId)
 */
export function useOrderAssignment(
  restaurantId: string | null,
  driverId: string | null
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignOrder = useCallback(
    async (orderId: string) => {
      if (!restaurantId || !driverId) return;

      setLoading(true);
      setError(null);

      try {
        await assignOrderToDriver(restaurantId, driverId, orderId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Assignment failed');
      } finally {
        setLoading(false);
      }
    },
    [restaurantId, driverId]
  );

  const completeOrder = useCallback(async () => {
    if (!restaurantId || !driverId) return;

    setLoading(true);
    setError(null);

    try {
      await completeDelivery(restaurantId, driverId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Completion failed');
    } finally {
      setLoading(false);
    }
  }, [restaurantId, driverId]);

  return { assignOrder, completeOrder, loading, error };
}

/**
 * Hook: Manage driver GPS tracking
 * Usage: const { isTracking, start, stop } = useGPSTracking(restaurantId, driverId)
 */
export function useGPSTracking(
  restaurantId: string | null,
  driverId: string | null
) {
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const start = useCallback(async () => {
    if (!restaurantId || !driverId) return;

    try {
      setError(null);
      const cleanup = await startDriverTracking(restaurantId, driverId);
      cleanupRef.current = cleanup;
      setIsTracking(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'GPS tracking failed');
    }
  }, [restaurantId, driverId]);

  const stop = useCallback(() => {
    if (!restaurantId || !driverId) return;

    if (cleanupRef.current) {
      cleanupRef.current();
    }
    stopDriverTracking(restaurantId, driverId);
    setIsTracking(false);
  }, [restaurantId, driverId]);

  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  return { isTracking, start, stop, error };
}
