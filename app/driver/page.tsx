'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FaSignOutAlt, FaMapMarkerAlt, FaCheckCircle,
  FaBicycle, FaWalking, FaCar, FaMotorcycle
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
  type DriverLocation,
} from '@/lib/realTimeTracking';

interface ActiveDelivery {
  orderId: string;
  businessId: string;
  businessName: string;
  customerName: string;
  deliveryAddress: string;
  items: { name: string; quantity: number }[];
  total: number;
  status: string;
}

interface CourierProfile {
  courierVehicle?: string;
  deliveryRadiusMiles?: number;
  totalDeliveries: number;
  totalEarnings: number;
  rating: number;
  stripeAccountId?: string;
  backgroundCheckStatus?: 'pending' | 'approved' | 'rejected';
}

export default function DriverDashboard() {
  const { user, MohnMenuUser, loading, isDriver, logout } = useAuth();
  const router = useRouter();

  const [driverStatus, setDriverStatus] = useState<'offline' | 'online' | 'on_delivery' | 'on_break'>('offline');
  const [currentLocation, setCurrentLocation] = useState<DriverLocation | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [activeDelivery, setActiveDelivery] = useState<ActiveDelivery | null>(null);
  const [availableOrders, setAvailableOrders] = useState<ActiveDelivery[]>([]);
  const [profile, setProfile] = useState<CourierProfile | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const trackingCleanup = useRef<(() => void) | null>(null);
  const businessId = MohnMenuUser?.activeBusinessId || MohnMenuUser?.businessIds?.[0] || '';
  const isCourier = !businessId; // Community couriers have no businessId

  // Auth guard
  useEffect(() => {
    if (!loading && (!user || !isDriver())) {
      router.push('/login');
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
          });
        }
      }
    };

    loadProfile();
  }, [user, businessId]);

  // Listen for available orders when online
  useEffect(() => {
    if (driverStatus !== 'online') return;

    // In-house drivers: query their single business
    // Community couriers: query ALL businesses with courierDelivery enabled
    setLoadingOrders(true);

    if (!isCourier && businessId) {
      // In-house driver — single business query
      const ordersRef = collection(db, 'businesses', businessId, 'orders');
      const q = query(ordersRef, where('status', '==', 'ready'), where('orderType', '==', 'delivery'));

      const unsub = onSnapshot(q, async (snap) => {
        const businessDoc = await getDoc(doc(db, 'businesses', businessId));
        const bizName = businessDoc.exists() ? businessDoc.data().name : 'Business';

        const orders: ActiveDelivery[] = snap.docs
          .filter(d => !d.data().assignedDriverId)
          .map(d => {
            const data = d.data();
            return {
              orderId: d.id,
              businessId,
              businessName: bizName,
              customerName: data.customerName || 'Customer',
              deliveryAddress: data.deliveryAddress || data.address || 'Address TBD',
              items: (data.items || []).map((item: any) => ({
                name: item.name,
                quantity: item.quantity,
              })),
              total: data.total || 0,
              status: data.status,
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

          const bizIds = bizSnap.docs.map(d => ({ id: d.id, name: d.data().name || 'Business' }));

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
                    deliveryAddress: data.deliveryAddress || data.address || 'Address TBD',
                    items: (data.items || []).map((item: any) => ({
                      name: item.name,
                      quantity: item.quantity,
                    })),
                    total: data.total || 0,
                    status: data.status,
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
                  deliveryAddress: data.dropoffAddress || 'Address TBD',
                  items: [{ name: data.description || data.packageSize || 'Package', quantity: 1 }],
                  total: data.deliveryFee || 3.99,
                  status: data.status,
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

  // Go online — start GPS tracking
  const goOnline = useCallback(async () => {
    if (!user) return;
    try {
      let cleanup: () => void;
      if (isCourier) {
        // Community courier — use shared courier RTDB path
        cleanup = await startCourierTracking(
          user.uid,
          (location) => setCurrentLocation(location)
        );
        await updateCourierStatus(user.uid, 'idle');
      } else {
        // In-house driver — use business-specific path
        cleanup = await startDriverTracking(
          businessId,
          user.uid,
          (location) => setCurrentLocation(location)
        );
        await updateDriverStatus(businessId, user.uid, 'idle');
      }
      trackingCleanup.current = cleanup;
      setIsTracking(true);
      setDriverStatus('online');
    } catch {
      alert('Failed to start GPS. Enable location services.');
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
    setActiveDelivery(null);
  }, []);

  // Accept a delivery
  const acceptDelivery = useCallback(async (order: ActiveDelivery) => {
    if (!user) return;
    try {
      if (order.businessId === '__quickDelivery') {
        // Quick delivery — update quickDeliveries collection
        const deliveryRef = doc(db, 'quickDeliveries', order.orderId);
        await updateDoc(deliveryRef, {
          assignedCourierId: user.uid,
          status: 'picked_up',
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Restaurant order — update business orders collection
        const orderRef = doc(db, 'businesses', order.businessId, 'orders', order.orderId);
        await updateDoc(orderRef, {
          assignedDriverId: user.uid,
          assignedDriverType: isCourier ? 'courier' : 'inhouse',
          status: 'out_for_delivery',
          updatedAt: new Date().toISOString(),
        });
      }
      // Update RTDB status
      if (isCourier) {
        await updateCourierStatus(user.uid, 'in_transit');
      } else {
        await updateDriverStatus(order.businessId, user.uid, 'in_transit');
      }
      setActiveDelivery(order);
      setDriverStatus('on_delivery');
      setAvailableOrders(prev => prev.filter(o => o.orderId !== order.orderId));
    } catch {
      alert('Failed to accept delivery');
    }
  }, [user, isCourier]);

  // Complete delivery
  const handleCompleteDelivery = useCallback(async () => {
    if (!user || !activeDelivery) return;
    try {
      if (activeDelivery.businessId === '__quickDelivery') {
        // Quick delivery — update quickDeliveries collection
        const deliveryRef = doc(db, 'quickDeliveries', activeDelivery.orderId);
        await updateDoc(deliveryRef, {
          status: 'delivered',
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Restaurant order — update business orders collection
        const orderRef = doc(db, 'businesses', activeDelivery.businessId, 'orders', activeDelivery.orderId);
        await updateDoc(orderRef, {
          status: 'delivered',
          updatedAt: new Date().toISOString(),
        });
      }

      // Update RTDB
      if (isCourier) {
        await completeCourierDelivery(user.uid);
        // Update courier stats in Firestore — courier earns deliveryFee minus platform fee ($0.25)
        const courierRef = doc(db, 'couriers', user.uid);
        const courierSnap = await getDoc(courierRef);
        if (courierSnap.exists()) {
          const prev = courierSnap.data();
          let deliveryFee = 3.99; // default
          if (activeDelivery.businessId === '__quickDelivery') {
            // Quick delivery — fee is the order total displayed
            deliveryFee = activeDelivery.total;
          } else {
            // Restaurant order — fetch the business's delivery fee
            const bizDoc = await getDoc(doc(db, 'businesses', activeDelivery.businessId));
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
        await completeDelivery(activeDelivery.businessId, user.uid);
      }
      setActiveDelivery(null);
      setDriverStatus('online');
      // Update local counter
      if (profile) {
        setProfile({ ...profile, totalDeliveries: profile.totalDeliveries + 1 });
      }
    } catch {
      alert('Failed to complete delivery');
    }
  }, [user, activeDelivery, profile, isCourier]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (trackingCleanup.current) trackingCleanup.current();
    };
  }, []);

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
            className="bg-gradient-to-r from-emerald-50 to-green-50 p-5 rounded-2xl border border-emerald-100 mb-6"
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
          className="bg-white p-6 rounded-[2rem] border border-zinc-100 mb-6"
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
        {activeDelivery && (
          <motion.div
            className="bg-zinc-900 rounded-[2rem] p-6 text-white shadow-2xl mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-600/30">
                  Active Delivery
                </span>
                <h2 className="text-2xl font-black mt-3">
                  {activeDelivery.businessName}
                </h2>
              </div>
              <div>
                <span className="text-xs text-zinc-500 block">You earn</span>
                <span className="text-2xl font-black text-emerald-400">
                  ${isCourier ? Math.max(activeDelivery.total - 0.25, 0).toFixed(2) : activeDelivery.total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2">
                <FaMapMarkerAlt className="text-zinc-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-zinc-500">Drop-off</p>
                  <p className="text-sm font-bold">{activeDelivery.deliveryAddress}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Items</p>
                {activeDelivery.items.map((item, i) => (
                  <p key={i} className="text-sm text-zinc-300">
                    {item.quantity}× {item.name}
                  </p>
                ))}
              </div>
            </div>

            <button
              onClick={handleCompleteDelivery}
              className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all active:scale-[0.98] shadow-xl shadow-emerald-900/30 flex items-center justify-center gap-2"
            >
              <FaCheckCircle />
              Delivery Complete
            </button>
          </motion.div>
        )}

        {/* Available Orders */}
        {driverStatus === 'online' && !activeDelivery && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">
              Available Deliveries
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
