'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FaSignOutAlt, FaMapMarkerAlt, FaCheckCircle,
  FaBicycle, FaWalking, FaCar, FaMotorcycle, FaClipboardList,
  FaDirections, FaExternalLinkAlt, FaRoute,
} from 'react-icons/fa';
import {
  collection, query, where, getDocs, doc, getDoc, onSnapshot, updateDoc, collectionGroup,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { authFetch } from '@/lib/authFetch';
import {
  startDriverTracking,
  startCourierTracking,
  updateDriverStatus,
  updateCourierStatus,
  completeDelivery,
  completeCourierDelivery,
  calculateETA,
  type DriverLocation,
} from '@/lib/realTimeTracking';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface ActiveDelivery {
  orderId: string;
  businessId: string;
  businessName: string;
  customerName: string;
  pickupAddress?: string;
  deliveryAddress: string;
  pickupLat?: number | null;
  pickupLng?: number | null;
  deliveryLat?: number | null;
  deliveryLng?: number | null;
  workflowPhase?: string;
  items: { name: string; quantity: number }[];
  total: number;
  status: string;
  source?: 'restaurant' | 'quick';
  deliveryVerification?: {
    pickupCode?: string | null;
    dropoffCode?: string | null;
    pickupVerifiedAt?: string | null;
    dropoffVerifiedAt?: string | null;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface CourierProfile {
  courierVehicle?: string;
  deliveryRadiusMiles?: number;
  totalDeliveries: number;
  totalEarnings: number;
  rating: number;
  stripeAccountId?: string;
  backgroundCheckStatus?: 'pending' | 'approved' | 'rejected';
  licenseVerified?: boolean;
  insuranceVerified?: boolean;
  isActive?: boolean;
}

function haversineMiles(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function DriverDashboard() {
  const { user, MohnMenuUser, loading, isDriver, logout } = useAuth();
  const router = useRouter();

  const [driverStatus, setDriverStatus] = useState<'offline' | 'online' | 'on_delivery' | 'on_break'>('offline');
  const [currentLocation, setCurrentLocation] = useState<DriverLocation | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [activeDeliveries, setActiveDeliveries] = useState<ActiveDelivery[]>([]);
  const [availableOrders, setAvailableOrders] = useState<ActiveDelivery[]>([]);
  const [profile, setProfile] = useState<CourierProfile | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [pickupVerificationCode, setPickupVerificationCode] = useState('');
  const [dropoffVerificationCode, setDropoffVerificationCode] = useState('');

  const trackingCleanup = useRef<(() => void) | null>(null);
  const driverMapContainer = useRef<HTMLDivElement>(null);
  const driverMapRef = useRef<mapboxgl.Map | null>(null);
  const driverMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const pickupMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const dropoffMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const routeSourceAdded = useRef(false);
  const businessId = MohnMenuUser?.activeBusinessId || MohnMenuUser?.businessIds?.[0] || '';
  const isCourier = !businessId; // Community couriers have no businessId
  const currentDelivery = activeDeliveries[0] || null;
  const queuedDeliveries = activeDeliveries.slice(1);
  const [deliveryEta, setDeliveryEta] = useState<number | null>(null);

  // Auth guard
  useEffect(() => {
    if (!loading && !user) {
      console.log('❌ Driver page: No user, redirecting to login');
      router.push('/login');
      return;
    }
    
    if (!loading && user && !isDriver()) {
      console.log('⚠️ Driver page: User is not a driver, showing error');
      alert('You need a driver role to access this page. Contact your business manager.');
      router.push('/dashboard');
    }
  }, [user, loading, isDriver, router]);

  // Load courier profile (from couriers collection or business driver doc)
  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      // Try couriers collection first (community couriers)
      const courierDoc = await getDoc(doc(db, 'couriers', user.uid));
      if (courierDoc.exists()) {
        const data = courierDoc.data();
        setProfile({
          courierVehicle: data.courierVehicle,
          deliveryRadiusMiles: data.deliveryRadiusMiles || 2,
          totalDeliveries: data.totalDeliveries || 0,
          totalEarnings: data.totalEarnings || 0,
          rating: data.rating || 5.0,
          stripeAccountId: data.stripeAccountId,
          backgroundCheckStatus: data.backgroundCheckStatus || 'pending',
        });
        return;
      }

      // Fallback: try business driver doc
      if (businessId) {
        const driverQuery = query(
          collection(db, 'businesses', businessId, 'drivers'),
          where('userId', '==', user.uid)
        );
        const snap = await getDocs(driverQuery);
        if (!snap.empty) {
          const data = snap.docs[0].data();
          setProfile({
            totalDeliveries: data.totalDeliveries || 0,
            totalEarnings: data.totalEarnings || 0,
            rating: data.rating || 5.0,
            stripeAccountId: data.stripeAccountId,
            backgroundCheckStatus: data.backgroundCheckStatus || 'pending',
            licenseVerified: Boolean(data.licenseVerified),
            insuranceVerified: Boolean(data.insuranceVerified),
            isActive: data.isActive ?? true,
          });
        }
      }
    };

    loadProfile();
  }, [user, businessId]);

  // Listen for available orders when online
  useEffect(() => {
    if (!['online', 'on_delivery'].includes(driverStatus)) return;

    // In-house drivers: query their single business
    // Community couriers: query ALL businesses with courierDelivery enabled
    setLoadingOrders(true);

    if (!isCourier && businessId) {
      // In-house driver — single business query
      const ordersRef = collection(db, 'businesses', businessId, 'orders');
      const q = query(ordersRef, where('status', '==', 'ready'), where('orderType', '==', 'delivery'));

      const unsub = onSnapshot(q, async (snap) => {
        const businessDoc = await getDoc(doc(db, 'businesses', businessId));
        const bizData = businessDoc.exists() ? businessDoc.data() : {};
        const bizName = bizData?.name || 'Business';
        const bizAddress = [bizData?.address, bizData?.city, bizData?.state, bizData?.zipCode].filter(Boolean).join(', ');
        const bizLat = Number(bizData?.latitude ?? bizData?.lat ?? NaN);
        const bizLng = Number(bizData?.longitude ?? bizData?.lng ?? NaN);

        const orders: ActiveDelivery[] = snap.docs
          .filter(d => !d.data().assignedDriverId)
          .map(d => {
            const data = d.data();
            return {
              orderId: d.id,
              businessId,
              businessName: bizName,
              customerName: data.customerName || 'Customer',
              pickupAddress: bizAddress || bizName,
              deliveryAddress: data.deliveryAddress || data.address || 'Address TBD',
              pickupLat: Number.isFinite(bizLat) ? bizLat : null,
              pickupLng: Number.isFinite(bizLng) ? bizLng : null,
              deliveryLat: Number.isFinite(Number(data.deliveryLat)) ? Number(data.deliveryLat) : null,
              deliveryLng: Number.isFinite(Number(data.deliveryLng)) ? Number(data.deliveryLng) : null,
              workflowPhase: data.deliveryWorkflow?.phase || 'ready_for_assignment',
              items: (data.items || []).map((item: any) => ({
                name: item.name,
                quantity: item.quantity,
              })),
              total: data.total || 0,
              status: data.status,
              createdAt: data.createdAt || '',
              updatedAt: data.updatedAt || '',
            };
          });
        setAvailableOrders(orders);
        setLoadingOrders(false);
      });

      return () => unsub();
    } else {
      // Community courier — discover orders across businesses with courier delivery enabled
      // ALSO discover quick deliveries (letters, packages)
      let cancelled = false;

      const discoverOrders = async () => {
        try {
          // Step 1: Find all businesses that have courier delivery enabled
          const bizSnap = await getDocs(
            query(collection(db, 'businesses'), where('settings.courierDelivery.enabled', '==', true))
          );
          if (cancelled) return;

          const bizIds = bizSnap.docs.map(d => {
            const b = d.data() as Record<string, any>;
            return {
              id: d.id,
              name: b.name || 'Business',
              address: [b.address, b.city, b.state, b.zipCode].filter(Boolean).join(', '),
              lat: Number.isFinite(Number(b.latitude ?? b.lat)) ? Number(b.latitude ?? b.lat) : null,
              lng: Number.isFinite(Number(b.longitude ?? b.lng)) ? Number(b.longitude ?? b.lng) : null,
            };
          });

          // Step 2: For each business, listen for ready delivery orders
          const unsubs: (() => void)[] = [];
          const ordersByBiz: Record<string, ActiveDelivery[]> = {};

          for (const biz of bizIds) {
            const ordersRef = collection(db, 'businesses', biz.id, 'orders');
            const q = query(ordersRef, where('status', '==', 'ready'), where('orderType', '==', 'delivery'));

            const unsub = onSnapshot(q, (snap) => {
              if (cancelled) return;
              ordersByBiz[biz.id] = snap.docs
                .filter(d => !d.data().assignedDriverId)
                .map(d => {
                  const data = d.data();
                  return {
                    orderId: d.id,
                    businessId: biz.id,
                    businessName: biz.name,
                    customerName: data.customerName || 'Customer',
                    pickupAddress: biz.address || biz.name,
                    deliveryAddress: data.deliveryAddress || data.address || 'Address TBD',
                    pickupLat: biz.lat,
                    pickupLng: biz.lng,
                    deliveryLat: Number.isFinite(Number(data.deliveryLat)) ? Number(data.deliveryLat) : null,
                    deliveryLng: Number.isFinite(Number(data.deliveryLng)) ? Number(data.deliveryLng) : null,
                    workflowPhase: data.deliveryWorkflow?.phase || 'ready_for_assignment',
                    items: (data.items || []).map((item: any) => ({
                      name: item.name,
                      quantity: item.quantity,
                    })),
                    total: data.total || 0,
                    status: data.status,
                    createdAt: data.createdAt || '',
                    updatedAt: data.updatedAt || '',
                  };
                });
              // Merge all business orders + quick deliveries
              const bizOrders = Object.values(ordersByBiz).flat();
              const quickOrders = ordersByBiz['__quickDeliveries'] || [];
              setAvailableOrders([...bizOrders, ...quickOrders]);
              setLoadingOrders(false);
            });
            unsubs.push(unsub);
          }

          // Step 3: Also listen for quick deliveries (letters/packages)
          const quickRef = collection(db, 'quickDeliveries');
          const quickQ = query(quickRef, where('status', '==', 'pending'));
          const quickUnsub = onSnapshot(quickQ, (snap) => {
            if (cancelled) return;
            ordersByBiz['__quickDeliveries'] = snap.docs
              .filter(d => !d.data().assignedCourierId)
              .map(d => {
                const data = d.data();
                return {
                  orderId: d.id,
                  businessId: '__quickDelivery',
                  businessName: `📦 Quick Delivery`,
                  customerName: data.senderName || 'Sender',
                  pickupAddress: data.pickupAddress || data.pickupLocation || 'Pickup TBD',
                  deliveryAddress: data.dropoffAddress || 'Address TBD',
                  pickupLat: Number.isFinite(Number(data.pickupLat)) ? Number(data.pickupLat) : null,
                  pickupLng: Number.isFinite(Number(data.pickupLng)) ? Number(data.pickupLng) : null,
                  deliveryLat: Number.isFinite(Number(data.dropoffLat)) ? Number(data.dropoffLat) : null,
                  deliveryLng: Number.isFinite(Number(data.dropoffLng)) ? Number(data.dropoffLng) : null,
                  workflowPhase: data.deliveryWorkflow?.phase || 'ready_for_assignment',
                  items: [{ name: data.description || data.packageSize || 'Package', quantity: 1 }],
                  total: data.deliveryFee || 3.99,
                  status: data.status,
                  createdAt: data.createdAt || '',
                  updatedAt: data.updatedAt || '',
                };
              });
            const bizOrders = Object.values(ordersByBiz).flat().filter(o => o.businessId !== '__quickDeliveries');
            const quickOrders = ordersByBiz['__quickDeliveries'] || [];
            setAvailableOrders([...bizOrders, ...quickOrders]);
            setLoadingOrders(false);
          });
          unsubs.push(quickUnsub);

          // If no businesses found, still show quick deliveries
          if (bizIds.length === 0) {
            setLoadingOrders(false);
          }

          return () => { unsubs.forEach(u => u()); };
        } catch {
          setLoadingOrders(false);
        }
      };

      let cleanupFn: (() => void) | undefined;
      discoverOrders().then(fn => { cleanupFn = fn; });

      return () => {
        cancelled = true;
        if (cleanupFn) cleanupFn();
      };
    }
  }, [driverStatus, businessId, isCourier]);

  // Listen for currently assigned deliveries (supports multiple active orders)
  useEffect(() => {
    if (!user) return;

    let restaurantAssigned: ActiveDelivery[] = [];
    let quickAssigned: ActiveDelivery[] = [];

    const flush = () => {
      const rankFor = (row: ActiveDelivery) => {
        const normalized = String(row.status || '').toLowerCase();
        const headingToPickup = normalized === 'driver_en_route_pickup';
        const targetLat = headingToPickup ? row.pickupLat : row.deliveryLat;
        const targetLng = headingToPickup ? row.pickupLng : row.deliveryLng;
        const fallbackTime = new Date(row.createdAt || row.updatedAt || 0).getTime();

        if (currentLocation && typeof targetLat === 'number' && typeof targetLng === 'number') {
          const miles = haversineMiles(currentLocation.lat, currentLocation.lng, targetLat, targetLng);
          return miles;
        }

        return 999999 + fallbackTime / 10000000000;
      };

      const rows = [...restaurantAssigned, ...quickAssigned]
        .filter((row) => !['delivered', 'completed', 'cancelled'].includes(String(row.status || '').toLowerCase()))
        .sort((a, b) => rankFor(a) - rankFor(b));

      setActiveDeliveries(rows);

      if (rows.length > 0) {
        setDriverStatus('on_delivery');
      } else if (driverStatus === 'on_delivery') {
        setDriverStatus('online');
      }
    };

    const orderUnsub = onSnapshot(
      query(collectionGroup(db, 'orders'), where('assignedDriverId', '==', user.uid)),
      (snap) => {
        restaurantAssigned = snap.docs.map((docSnap) => {
          const data = docSnap.data() as Record<string, any>;
          const path = docSnap.ref.path.split('/');
          const bizId = data.businessId || (path.length >= 2 ? path[1] : businessId);
          return {
            orderId: docSnap.id,
            businessId: bizId,
            businessName: data.businessName || data.restaurantName || 'Business',
            customerName: data.customerName || 'Customer',
            pickupAddress: data.pickupAddress || data.businessAddress || data.restaurantAddress || '',
            deliveryAddress: data.deliveryAddress || data.address || 'Address TBD',
            pickupLat: Number.isFinite(Number(data.pickupLat)) ? Number(data.pickupLat) : null,
            pickupLng: Number.isFinite(Number(data.pickupLng)) ? Number(data.pickupLng) : null,
            deliveryLat: Number.isFinite(Number(data.deliveryLat)) ? Number(data.deliveryLat) : null,
            deliveryLng: Number.isFinite(Number(data.deliveryLng)) ? Number(data.deliveryLng) : null,
            workflowPhase: data.deliveryWorkflow?.phase || '',
            items: (data.items || []).map((item: any) => ({ name: item.name, quantity: item.quantity || 1 })),
            total: Number(data.total || 0),
            status: data.status || 'pending',
            source: 'restaurant',
            createdAt: data.createdAt || '',
            updatedAt: data.updatedAt || '',
          };
        });
        flush();
      },
    );

    const quickUnsub = onSnapshot(
      query(collection(db, 'quickDeliveries'), where('assignedCourierId', '==', user.uid)),
      (snap) => {
        quickAssigned = snap.docs.map((docSnap) => {
          const data = docSnap.data() as Record<string, any>;
          return {
            orderId: docSnap.id,
            businessId: '__quickDelivery',
            businessName: '📦 Quick Delivery',
            customerName: data.senderName || 'Sender',
            pickupAddress: data.pickupAddress || data.pickupLocation || 'Pickup TBD',
            deliveryAddress: data.dropoffAddress || 'Address TBD',
            pickupLat: Number.isFinite(Number(data.pickupLat)) ? Number(data.pickupLat) : null,
            pickupLng: Number.isFinite(Number(data.pickupLng)) ? Number(data.pickupLng) : null,
            deliveryLat: Number.isFinite(Number(data.dropoffLat)) ? Number(data.dropoffLat) : null,
            deliveryLng: Number.isFinite(Number(data.dropoffLng)) ? Number(data.dropoffLng) : null,
            workflowPhase: data.deliveryWorkflow?.phase || '',
            items: [{ name: data.description || data.packageSize || 'Package', quantity: 1 }],
            total: Number(data.deliveryFee || 3.99),
            status: data.status || 'pending',
            source: 'quick',
            createdAt: data.createdAt || '',
            updatedAt: data.updatedAt || '',
          };
        });
        flush();
      },
    );

    return () => {
      orderUnsub();
      quickUnsub();
    };
  }, [user, businessId, currentLocation, driverStatus]);

  // Go online — start GPS tracking
  const goOnline = useCallback(async () => {
    if (!user) {
      console.error('❌ Go Online: No user');
      alert('Please log in first');
      return;
    }
    
    console.log('🚀 Go Online clicked', { isCourier, businessId, userId: user.uid });
    
    try {
      let cleanup: () => void;
      if (isCourier) {
        // Community courier — use shared courier RTDB path
        console.log('📍 Starting courier tracking...');
        cleanup = await startCourierTracking(
          user.uid,
          (location) => {
            console.log('📍 Courier location updated:', location);
            setCurrentLocation(location);
          }
        );
        await updateCourierStatus(user.uid, 'idle');
        console.log('✅ Courier tracking started');
      } else {
        // In-house driver — use business-specific path
        if (!businessId) {
          console.error('❌ No businessId for in-house driver');
          alert('No business assigned. Contact your manager.');
          return;
        }
        console.log('📍 Starting driver tracking for business:', businessId);
        cleanup = await startDriverTracking(
          businessId,
          user.uid,
          (location) => {
            console.log('📍 Driver location updated:', location);
            setCurrentLocation(location);
          }
        );
        await updateDriverStatus(businessId, user.uid, 'idle');
        console.log('✅ Driver tracking started');
      }
      trackingCleanup.current = cleanup;
      setIsTracking(true);
      setDriverStatus('online');
      console.log('✅ Successfully went online');
    } catch (error) {
      console.error('❌ Failed to go online:', error);
      alert(`Failed to start GPS: ${error instanceof Error ? error.message : 'Enable location services'}`);
    }
  }, [user, businessId, isCourier]);

  // Go offline — stop GPS
  const goOffline = useCallback(() => {
    if (trackingCleanup.current) {
      trackingCleanup.current();
      trackingCleanup.current = null;
    }
    setIsTracking(false);
    setDriverStatus('offline');
    setActiveDeliveries([]);
  }, []);

  // Accept a delivery
  const acceptDelivery = useCallback(async (order: ActiveDelivery) => {
    if (!user) return;
    try {
      const source = order.businessId === '__quickDelivery' || order.businessId === '__quickDeliveries'
        ? 'quick'
        : 'restaurant';
      const response = await authFetch('/api/dispatch/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'accept',
          source,
          businessId: source === 'quick' ? '__quickDelivery' : order.businessId,
          orderId: order.orderId,
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || 'Failed to accept delivery');
      }
      // Update RTDB status
      if (isCourier) {
        await updateCourierStatus(user.uid, 'in_transit');
      } else {
        await updateDriverStatus(order.businessId, user.uid, 'in_transit');
      }
      setDriverStatus('on_delivery');
      setAvailableOrders(prev => prev.filter(o => o.orderId !== order.orderId));
    } catch {
      alert('Failed to accept delivery');
    }
  }, [user, isCourier]);

  const handleMarkPickedUp = useCallback(async () => {
    if (!user || !currentDelivery || currentDelivery.businessId === '__quickDelivery' || currentDelivery.businessId === '__quickDeliveries') return;

    try {
      const response = await authFetch('/api/dispatch/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'pickup',
          source: 'restaurant',
          businessId: currentDelivery.businessId,
          orderId: currentDelivery.orderId,
          verificationCode: pickupVerificationCode,
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || 'Failed to mark picked up');
      }

      if (isCourier) {
        await updateCourierStatus(user.uid, 'in_transit');
      } else {
        await updateDriverStatus(currentDelivery.businessId, user.uid, 'delivering');
      }
      setPickupVerificationCode('');
    } catch {
      alert('Failed to mark picked up');
    }
  }, [user, currentDelivery, isCourier, pickupVerificationCode]);

  // Complete delivery
  const handleCompleteDelivery = useCallback(async () => {
    if (!user || !currentDelivery) return;
    try {
      const source = currentDelivery.businessId === '__quickDelivery' || currentDelivery.businessId === '__quickDeliveries'
        ? 'quick'
        : 'restaurant';
      const response = await authFetch('/api/dispatch/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete',
          source,
          businessId: source === 'quick' ? '__quickDelivery' : currentDelivery.businessId,
          orderId: currentDelivery.orderId,
          verificationCode: dropoffVerificationCode,
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || 'Failed to complete delivery');
      }

      // Update RTDB
      const hasMoreQueued = activeDeliveries.length > 1;
      if (isCourier) {
        if (hasMoreQueued) {
          await updateCourierStatus(user.uid, 'in_transit');
        } else {
          await completeCourierDelivery(user.uid);
        }
        // Update courier stats in Firestore — courier earns deliveryFee minus platform fee ($0.25)
        const courierRef = doc(db, 'couriers', user.uid);
        const courierSnap = await getDoc(courierRef);
        if (courierSnap.exists()) {
          const prev = courierSnap.data();
          let deliveryFee = 3.99; // default
          if (currentDelivery.businessId === '__quickDelivery') {
            // Quick delivery — fee is the order total displayed
            deliveryFee = currentDelivery.total;
          } else {
            // Restaurant order — fetch the business's delivery fee
            const bizDoc = await getDoc(doc(db, 'businesses', currentDelivery.businessId));
            deliveryFee = bizDoc.exists()
              ? (bizDoc.data().settings?.pricing?.deliveryFee ?? 3.99)
              : 3.99;
          }
          const courierEarnings = Math.max(deliveryFee - 0.25, 0); // Courier keeps deliveryFee minus $0.25 platform fee
          await updateDoc(courierRef, {
            totalDeliveries: (prev.totalDeliveries || 0) + 1,
            totalEarnings: (prev.totalEarnings || 0) + courierEarnings,
          });
        }
      } else {
        if (hasMoreQueued) {
          await updateDriverStatus(currentDelivery.businessId, user.uid, 'in_transit');
        } else {
          await completeDelivery(currentDelivery.businessId, user.uid);
        }
      }
      if (!hasMoreQueued) setDriverStatus('online');
      setDropoffVerificationCode('');
      // Update local counter
      if (profile) {
        setProfile({ ...profile, totalDeliveries: profile.totalDeliveries + 1 });
      }
    } catch {
      alert('Failed to complete delivery');
    }
  }, [user, currentDelivery, activeDeliveries.length, profile, isCourier, dropoffVerificationCode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (trackingCleanup.current) trackingCleanup.current();
      if (driverMapRef.current) { driverMapRef.current.remove(); driverMapRef.current = null; }
    };
  }, []);

  // ── In-app Mapbox map for active delivery ──
  useEffect(() => {
    if (!currentDelivery || !driverMapContainer.current) {
      // Tear down map if no active delivery
      if (driverMapRef.current) { driverMapRef.current.remove(); driverMapRef.current = null; }
      driverMarkerRef.current = null;
      pickupMarkerRef.current = null;
      dropoffMarkerRef.current = null;
      routeSourceAdded.current = false;
      return;
    }

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    if (!token) return;
    mapboxgl.accessToken = token;

    // Default center: pickup or delivery or fallback
    const centerLat = currentDelivery.pickupLat || currentDelivery.deliveryLat || 37.54;
    const centerLng = currentDelivery.pickupLng || currentDelivery.deliveryLng || -77.44;

    const m = new mapboxgl.Map({
      container: driverMapContainer.current,
      style: 'mapbox://styles/mapbox/navigation-night-v1',
      center: [centerLng, centerLat],
      zoom: 14,
      pitch: 45,
    });

    m.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Pickup marker
    if (currentDelivery.pickupLat && currentDelivery.pickupLng) {
      const el = document.createElement('div');
      el.innerHTML = '🍽️';
      el.style.fontSize = '28px';
      el.style.filter = 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))';
      pickupMarkerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat([currentDelivery.pickupLng, currentDelivery.pickupLat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML('<strong>Pickup</strong>'))
        .addTo(m);
    }

    // Drop-off marker
    if (currentDelivery.deliveryLat && currentDelivery.deliveryLng) {
      const el = document.createElement('div');
      el.innerHTML = '📍';
      el.style.fontSize = '28px';
      el.style.filter = 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))';
      dropoffMarkerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat([currentDelivery.deliveryLng, currentDelivery.deliveryLat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML('<strong>Drop-off</strong>'))
        .addTo(m);
    }

    // Driver marker (will update in real-time)
    const driverEl = document.createElement('div');
    driverEl.style.cssText = 'width:40px;height:40px;background:#10b981;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;border:3px solid white;box-shadow:0 4px 12px rgba(16,185,129,0.5);';
    driverEl.innerHTML = '🚗';
    driverMarkerRef.current = new mapboxgl.Marker({ element: driverEl, rotationAlignment: 'map' });
    if (currentLocation) {
      driverMarkerRef.current.setLngLat([currentLocation.lng, currentLocation.lat]).addTo(m);
    }

    // Fit bounds
    m.on('load', () => {
      const bounds = new mapboxgl.LngLatBounds();
      if (currentDelivery.pickupLat && currentDelivery.pickupLng) bounds.extend([currentDelivery.pickupLng, currentDelivery.pickupLat]);
      if (currentDelivery.deliveryLat && currentDelivery.deliveryLng) bounds.extend([currentDelivery.deliveryLng, currentDelivery.deliveryLat]);
      if (currentLocation) bounds.extend([currentLocation.lng, currentLocation.lat]);
      if (!bounds.isEmpty()) m.fitBounds(bounds, { padding: 60, maxZoom: 15 });
    });

    driverMapRef.current = m;

    return () => {
      m.remove();
      driverMapRef.current = null;
      driverMarkerRef.current = null;
      pickupMarkerRef.current = null;
      dropoffMarkerRef.current = null;
      routeSourceAdded.current = false;
    };
  }, [currentDelivery?.orderId]);

  // ── Update driver marker + ETA on GPS change ──
  useEffect(() => {
    if (!currentLocation || !driverMapRef.current) return;

    // Move driver marker
    if (driverMarkerRef.current) {
      driverMarkerRef.current.setLngLat([currentLocation.lng, currentLocation.lat]);
      if (!driverMarkerRef.current.getLngLat()) {
        driverMarkerRef.current.addTo(driverMapRef.current);
      }
    }

    // Calculate ETA to destination (drop-off if delivering, else pickup)
    const destLat = currentDelivery?.status !== 'driver_en_route_pickup'
      ? currentDelivery?.deliveryLat : currentDelivery?.pickupLat;
    const destLng = currentDelivery?.status !== 'driver_en_route_pickup'
      ? currentDelivery?.deliveryLng : currentDelivery?.pickupLng;

    if (destLat && destLng) {
      const speed = currentLocation.speed && currentLocation.speed > 0
        ? currentLocation.speed * 2.237 // m/s to mph
        : 25;
      const mins = calculateETA(currentLocation.lat, currentLocation.lng, destLat, destLng, speed);
      setDeliveryEta(mins);
    }

    // Draw route line from driver → destination via Mapbox Directions
    const map = driverMapRef.current;
    if (destLat && destLng && map.isStyleLoaded()) {
      const coords = [
        [currentLocation.lng, currentLocation.lat],
        ...(currentDelivery?.status === 'driver_en_route_pickup' && currentDelivery?.pickupLng && currentDelivery?.pickupLat
          ? [[currentDelivery.pickupLng, currentDelivery.pickupLat]]
          : []),
        ...(currentDelivery?.deliveryLng && currentDelivery?.deliveryLat
          ? [[currentDelivery.deliveryLng, currentDelivery.deliveryLat]]
          : []),
      ];

      // Fetch route from Mapbox Directions API
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
      if (coords.length >= 2 && token) {
        const coordStr = coords.map(c => c.join(',')).join(';');
        fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${coordStr}?geometries=geojson&overview=full&access_token=${token}`)
          .then(r => r.json())
          .then(data => {
            if (data.routes?.[0]?.geometry && map.getSource('driver-route')) {
              (map.getSource('driver-route') as mapboxgl.GeoJSONSource).setData({
                type: 'Feature',
                properties: {},
                geometry: data.routes[0].geometry,
              });
            } else if (data.routes?.[0]?.geometry && !routeSourceAdded.current) {
              routeSourceAdded.current = true;
              map.addSource('driver-route', {
                type: 'geojson',
                data: { type: 'Feature', properties: {}, geometry: data.routes[0].geometry },
              });
              map.addLayer({
                id: 'driver-route-line',
                type: 'line',
                source: 'driver-route',
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: { 'line-color': '#10b981', 'line-width': 5, 'line-opacity': 0.85 },
              });
            }
          })
          .catch(() => {});
      }

      // Fit bounds to show everything
      const bounds = new mapboxgl.LngLatBounds();
      coords.forEach(c => bounds.extend(c as [number, number]));
      map.fitBounds(bounds, { padding: 60, maxZoom: 16, duration: 1000 });
    }
  }, [currentLocation?.lat, currentLocation?.lng, currentDelivery?.status]);

  // Google Maps external navigation fallback
  const openGoogleMapsNavigation = useCallback(() => {
    if (!currentDelivery) return;
    const destLat = currentDelivery.status !== 'driver_en_route_pickup'
      ? currentDelivery.deliveryLat : currentDelivery.pickupLat;
    const destLng = currentDelivery.status !== 'driver_en_route_pickup'
      ? currentDelivery.deliveryLng : currentDelivery.pickupLng;
    const destAddr = currentDelivery.status !== 'driver_en_route_pickup'
      ? currentDelivery.deliveryAddress : (currentDelivery.pickupAddress || currentDelivery.businessName);

    if (destLat && destLng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=driving`, '_blank');
    } else if (destAddr) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destAddr)}&travelmode=driving`, '_blank');
    }
  }, [currentDelivery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white/90">
        <div className="text-lg font-black text-zinc-400 animate-pulse uppercase tracking-widest">Loading...</div>
      </div>
    );
  }

  // Approval gate — community couriers must be approved before accessing the dashboard
  if (isCourier && profile && profile.backgroundCheckStatus !== 'approved') {
    return (
      <div className="min-h-screen bg-transparent pt-28 pb-20 px-4">
        <div className="container mx-auto max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] border border-zinc-100 p-10 text-center shadow-[0_20px_80px_rgba(0,0,0,0.04)]"
          >
            {profile.backgroundCheckStatus === 'rejected' ? (
              <>
                <div className="text-5xl mb-4">❌</div>
                <h1 className="text-3xl font-black text-black mb-3">
                  Application Not Approved
                </h1>
                <p className="text-sm text-zinc-500 mb-6">
                  Unfortunately, your courier application was not approved at this time.
                  If you believe this is an error, please contact support.
                </p>
                <a
                  href="mailto:support@mohnmenu.com"
                  className="inline-block px-6 py-3 bg-black text-white rounded-full font-bold text-sm hover:bg-zinc-800 transition-all"
                >
                  Contact Support
                </a>
              </>
            ) : (
              <>
                <div className="text-5xl mb-4">⏳</div>
                <h1 className="text-3xl font-black text-black mb-3">
                  Application Under Review
                </h1>
                <p className="text-sm text-zinc-500 mb-4">
                  Your courier application has been received! Our team is reviewing your
                  information. This typically takes 1-2 business days.
                </p>
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mb-6 text-left">
                  <p className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-2">What happens next?</p>
                  <ul className="space-y-2">
                    {[
                      'We review your application',
                      'You get approved and can go online',
                      'Start earning $3+ per delivery!',
                    ].map((step, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-zinc-600">
                        <span className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs font-black shrink-0">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => logout()}
                  className="px-6 py-3 bg-zinc-100 text-zinc-600 rounded-full font-bold text-sm hover:bg-zinc-200 transition-all"
                >
                  Sign Out
                </button>
              </>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // Verification gate — in-house drivers (including staff servers) must be approved + license verified
  if (!isCourier && profile && (profile.backgroundCheckStatus !== 'approved' || profile.licenseVerified !== true)) {
    const rejected = profile.backgroundCheckStatus === 'rejected';
    return (
      <div className="min-h-screen bg-transparent pt-28 pb-20 px-4">
        <div className="container mx-auto max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] border border-zinc-100 p-10 text-center shadow-[0_20px_80px_rgba(0,0,0,0.04)]"
          >
            <div className="text-5xl mb-4">{rejected ? '❌' : '⏳'}</div>
            <h1 className="text-3xl font-black text-black mb-3">
              {rejected ? 'Driver Access Not Approved' : 'Driver Verification Pending'}
            </h1>
            <p className="text-sm text-zinc-500 mb-6">
              {rejected
                ? 'Your driver profile was not approved. If you believe this is an error, ask the business owner to review your driver record.'
                : 'To go online and accept deliveries, your business owner must approve your background check and verify your driver\'s license.'}
            </p>
            <button
              onClick={() => logout()}
              className="px-6 py-3 bg-zinc-100 text-zinc-600 rounded-full font-bold text-sm hover:bg-zinc-200 transition-all"
            >
              Sign Out
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const vehicleIcon = profile?.courierVehicle === 'bike' ? FaBicycle
    : profile?.courierVehicle === 'walk' ? FaWalking
    : profile?.courierVehicle === 'scooter' ? FaMotorcycle
    : FaCar;
  const VehicleIcon = vehicleIcon;

  return (
    <div className="min-h-screen bg-transparent pt-28 pb-20 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-black mb-1">
              Driver Dashboard<span className="text-emerald-600">.</span>
            </h1>
            <p className="text-sm font-medium text-zinc-500">
              {MohnMenuUser?.displayName || user?.email}
              {profile?.courierVehicle && (
                <span className="ml-2 inline-flex items-center gap-1 text-zinc-400">
                  <VehicleIcon className="text-xs" /> {profile.courierVehicle}
                </span>
              )}
            </p>
            <Link
              href="/driver/orders"
              className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full border border-zinc-200 text-zinc-600 text-xs font-black hover:bg-zinc-50"
            >
              <FaClipboardList /> My Delivery Orders
            </Link>
          </motion.div>
          <motion.button
            onClick={() => logout()}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-5 py-2.5 bg-zinc-50 text-zinc-600 rounded-full font-bold text-sm hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <FaSignOutAlt />
            Logout
          </motion.button>
        </div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white p-5 rounded-2xl border border-zinc-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Deliveries</p>
            <p className="text-3xl font-black text-black">{profile?.totalDeliveries || 0}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-zinc-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Total Earned</p>
            <p className="text-3xl font-black text-emerald-600">${(profile?.totalEarnings || 0).toFixed(2)}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-zinc-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Per Delivery</p>
            <p className="text-3xl font-black text-blue-600">
              ${(profile?.totalDeliveries && profile.totalDeliveries > 0
                ? (profile.totalEarnings / profile.totalDeliveries).toFixed(2)
                : '3.74')}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-zinc-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Rating</p>
            <p className="text-3xl font-black text-indigo-600">{(profile?.rating || 5.0).toFixed(1)}</p>
          </div>
        </motion.div>

        {/* Earnings breakdown for couriers */}
        {isCourier && profile && driverStatus === 'offline' && (profile?.totalDeliveries || 0) > 0 && (
          <motion.div
            className="bg-linear-to-r from-emerald-50 to-green-50 p-5 rounded-2xl border border-emerald-100 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <p className="text-xs font-black uppercase tracking-widest text-emerald-700 mb-3">💰 Earnings Breakdown</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600">Total deliveries completed</span>
                <span className="font-bold text-black">{profile.totalDeliveries}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600">Total earned</span>
                <span className="font-bold text-emerald-700">${profile.totalEarnings.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600">Average per delivery</span>
                <span className="font-bold text-blue-600">${(profile.totalEarnings / profile.totalDeliveries).toFixed(2)}</span>
              </div>
              <div className="border-t border-emerald-200 pt-2 mt-2">
                <p className="text-[10px] text-emerald-600">
                  You keep the delivery fee minus $0.25 platform fee on each delivery. Standard rate: $3.74+ per delivery.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Status Control */}
        <motion.div
          className="bg-white p-6 rounded-4xl border border-zinc-100 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full animate-pulse ${
                driverStatus === 'online' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                driverStatus === 'on_delivery' ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' :
                driverStatus === 'on_break' ? 'bg-yellow-500' :
                'bg-red-500'
              }`} />
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Status</p>
                <p className="text-xl font-black text-black capitalize">{driverStatus.replace(/_/g, ' ')}</p>
              </div>
            </div>
            {isTracking && currentLocation && (
              <div className="text-right">
                <p className="text-[10px] font-bold text-emerald-600">GPS Active</p>
                <p className="text-[10px] text-zinc-400 font-mono">
                  {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            {driverStatus === 'offline' ? (
              <button
                onClick={goOnline}
                className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm hover:bg-emerald-700 transition-all active:scale-[0.98] shadow-lg shadow-emerald-600/20"
              >
                Go Online
              </button>
            ) : driverStatus === 'on_delivery' ? (
              <div className="w-full text-center py-2 text-sm text-blue-600 font-bold">
                Delivering — complete below to go back online
              </div>
            ) : (
              <>
                <button
                  onClick={() => { setDriverStatus('on_break'); }}
                  className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all ${
                    driverStatus === 'on_break' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  Break
                </button>
                <button
                  onClick={goOffline}
                  className="flex-1 py-3 bg-red-50 text-red-600 rounded-2xl font-bold text-sm hover:bg-red-100 transition-all border border-red-100"
                >
                  Go Offline
                </button>
              </>
            )}
          </div>
        </motion.div>

        {/* Active Delivery */}
        {currentDelivery && (
          <motion.div
            className="bg-zinc-900 rounded-4xl p-6 text-white shadow-2xl mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-600/30">
                  Active Delivery
                </span>
                <h2 className="text-2xl font-black mt-3">
                  {currentDelivery.businessName}
                </h2>
              </div>
              <div className="text-right">
                {deliveryEta && (
                  <div className="mb-1">
                    <span className="text-2xl font-black text-emerald-400">{deliveryEta} min</span>
                    <span className="block text-[10px] text-zinc-500 uppercase font-bold tracking-wider">ETA</span>
                  </div>
                )}
                <span className="text-xs text-zinc-500 block">You earn</span>
                <span className="text-2xl font-black text-emerald-400">
                  ${isCourier ? Math.max(currentDelivery.total - 0.25, 0).toFixed(2) : currentDelivery.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* ── In-App Live Map ── */}
            <div className="mb-4 rounded-2xl overflow-hidden border border-white/10">
              <div ref={driverMapContainer} className="w-full h-56 sm:h-72" />
            </div>

            {/* ── Navigation Actions ── */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={openGoogleMapsNavigation}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/10 border border-white/15 rounded-2xl text-sm font-bold text-white hover:bg-white/20 transition-all"
              >
                <FaDirections className="text-blue-400" />
                Open in Google Maps
                <FaExternalLinkAlt className="text-[10px] text-zinc-500" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {currentDelivery.status === 'driver_en_route_pickup' && (
                <div className="flex items-start gap-2">
                  <FaRoute className="text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-zinc-500">Heading to Pickup</p>
                    <p className="text-sm font-bold">{currentDelivery.pickupAddress || currentDelivery.businessName}</p>
                  </div>
                </div>
              )}
              {currentDelivery.status !== 'driver_en_route_pickup' && (
                <div className="flex items-start gap-2">
                  <FaRoute className="text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-zinc-500">Delivering to</p>
                    <p className="text-sm font-bold">{currentDelivery.deliveryAddress}</p>
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs text-zinc-500 mb-1">Items</p>
                {currentDelivery.items.map((item, i) => (
                  <p key={i} className="text-sm text-zinc-300">
                    {item.quantity}× {item.name}
                  </p>
                ))}
              </div>
            </div>

            {queuedDeliveries.length > 0 && (
              <div className="mb-6 p-4 rounded-2xl bg-white/10 border border-white/15">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300 mb-2">Next Stops ({queuedDeliveries.length})</p>
                <div className="space-y-1.5">
                  {queuedDeliveries.slice(0, 3).map((delivery) => (
                    <p key={`${delivery.businessId}:${delivery.orderId}`} className="text-xs text-zinc-200 truncate">
                      {delivery.businessName} → {delivery.deliveryAddress}
                    </p>
                  ))}
                  {queuedDeliveries.length > 3 && (
                    <p className="text-xs text-zinc-400">+{queuedDeliveries.length - 3} more queued</p>
                  )}
                </div>
              </div>
            )}

            {currentDelivery.status === 'driver_en_route_pickup' && (
              <div className="mb-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2">
                  Pickup Verification Code
                </label>
                <input
                  value={pickupVerificationCode}
                  onChange={(e) => setPickupVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter customer/store code"
                  className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-sm font-bold tracking-widest text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}

            {currentDelivery.status !== 'driver_en_route_pickup' && (
              <div className="mb-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2">
                  Drop-off Verification Code
                </label>
                <input
                  value={dropoffVerificationCode}
                  onChange={(e) => setDropoffVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter customer drop-off code"
                  className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-sm font-bold tracking-widest text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}

            <button
              onClick={currentDelivery.status === 'driver_en_route_pickup' ? handleMarkPickedUp : handleCompleteDelivery}
              className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all active:scale-[0.98] shadow-xl shadow-emerald-900/30 flex items-center justify-center gap-2"
            >
              <FaCheckCircle />
              {currentDelivery.status === 'driver_en_route_pickup' ? 'Mark Picked Up' : 'Delivery Complete'}
            </button>
          </motion.div>
        )}

        {/* Available Orders */}
        {(driverStatus === 'online' || driverStatus === 'on_delivery') && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">
              {driverStatus === 'on_delivery' ? 'Add-on Deliveries' : 'Available Deliveries'}
            </h2>

            {loadingOrders ? (
              <div className="bg-white rounded-2xl border border-zinc-100 p-8 text-center">
                <div className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-zinc-400 text-sm font-bold">Looking for orders...</p>
              </div>
            ) : availableOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-zinc-100 p-10 text-center">
                <div className="text-3xl mb-3">📡</div>
                <p className="text-zinc-600 font-bold">No deliveries right now</p>
                <p className="text-zinc-400 text-sm mt-1">Stay online — orders will appear here instantly.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableOrders.map((order) => (
                  <div
                    key={order.orderId}
                    className="bg-white rounded-2xl border border-zinc-100 p-5 hover:border-emerald-200 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-black text-sm">{order.businessName}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{order.customerName}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-emerald-600">${isCourier ? Math.max(order.total - 0.25, 0).toFixed(2) : order.total.toFixed(2)}</span>
                        {isCourier && <p className="text-[10px] text-zinc-400">you earn</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mb-3">
                      <FaMapMarkerAlt className="text-zinc-300 text-xs" />
                      <p className="text-xs text-zinc-500 truncate">{order.deliveryAddress}</p>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      {order.items.slice(0, 3).map((item, i) => (
                        <span key={i} className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full font-bold">
                          {item.quantity}× {item.name}
                        </span>
                      ))}
                      {order.items.length > 3 && (
                        <span className="text-[10px] text-zinc-400">+{order.items.length - 3} more</span>
                      )}
                    </div>
                    <button
                      onClick={() => acceptDelivery(order)}
                      className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all active:scale-[0.98]"
                    >
                      Accept Delivery
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Stripe Connect CTA */}
        {profile && !profile.stripeAccountId && driverStatus === 'offline' && (
          <motion.div
            className="mt-6 bg-amber-50 border border-amber-100 rounded-2xl p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="font-bold text-amber-800 text-sm mb-1">Set Up Payouts</p>
            <p className="text-xs text-amber-600 mb-3">
              Connect your Stripe account to receive delivery earnings directly to your bank.
            </p>
            <button
              onClick={async () => {
                try {
                  const res = await authFetch('/api/stripe/connect-account', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      role: 'driver',
                      email: user?.email,
                    }),
                  });
                  const data = await res.json();
                  if (data.onboardingUrl) window.open(data.onboardingUrl, '_blank');
                } catch {
                  alert('Failed to start Stripe setup');
                }
              }}
              className="px-6 py-2.5 bg-black text-white rounded-full font-bold text-sm hover:bg-zinc-800 transition-all"
            >
              Connect Stripe
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
