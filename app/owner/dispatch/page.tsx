'use client';

import { useAuth } from '@/context/AuthContext';
import GatedPage from '@/components/GatedPage';
import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  subscribeToAllDrivers,
  subscribeToAllCouriers,
  assignOrderToDriver,
  completeDelivery,
  updateDriverStatus,
  type DriverTrackingData,
} from '@/lib/realTimeTracking';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface OrderData {
  id: string;
  customerName: string;
  address: string;
  total: number;
  status: string;
  lat?: number;
  lng?: number;
}

const STATUS_COLORS: Record<string, string> = {
  idle: '#10b981',
  in_transit: '#6366f1',
  at_restaurant: '#f59e0b',
  delivering: '#ef4444',
  offline: '#9ca3af',
};

const STATUS_LABELS: Record<string, string> = {
  idle: 'Available',
  in_transit: 'In Transit',
  at_restaurant: 'At Restaurant',
  delivering: 'Delivering',
  offline: 'Offline',
};

export default function OwnerDispatchPageGated() {
  return (
    <GatedPage feature="dispatch">
      <OwnerDispatchPage />
    </GatedPage>
  );
}

function OwnerDispatchPage() {
  const { currentBusiness } = useAuth();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Record<string, mapboxgl.Marker>>({});

  const [drivers, setDrivers] = useState<Record<string, DriverTrackingData & { name?: string }>>({});
  const [pendingOrders, setPendingOrders] = useState<OrderData[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [assigningOrder, setAssigningOrder] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const businessId = currentBusiness?.businessId;

  // ── Initialize Mapbox ──────────────────────────────
  useEffect(() => {
    if (!mapContainer.current || !currentBusiness) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

    const businessLat = currentBusiness.location?.lat || 37.5407;
    const businessLng = currentBusiness.location?.lng || -77.4360;

    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [businessLng, businessLat],
      zoom: 12,
    });

    m.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add business location marker
    const businessEl = document.createElement('div');
    businessEl.innerHTML = '🏪';
    businessEl.style.fontSize = '28px';
    businessEl.style.cursor = 'pointer';
    new mapboxgl.Marker({ element: businessEl })
      .setLngLat([businessLng, businessLat])
      .setPopup(new mapboxgl.Popup().setHTML(`<strong>${currentBusiness.name}</strong>`))
      .addTo(m);

    m.on('load', () => setMapReady(true));
    mapRef.current = m;

    return () => {
      m.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, [currentBusiness]);

  // ── Subscribe to driver locations (RTDB) ───────────
  useEffect(() => {
    if (!businessId) return;
    const unsubscribe = subscribeToAllDrivers(businessId, (data) => {
      setDrivers(prev => ({ ...prev, ...data }));
    });
    return unsubscribe;
  }, [businessId]);

  // ── Subscribe to community couriers (RTDB) ─────────
  useEffect(() => {
    if (!currentBusiness?.settings?.courierDelivery?.enabled) return;
    const unsubscribe = subscribeToAllCouriers((courierData) => {
      // Merge couriers into drivers map with a "courier:" prefix to distinguish
      const courierEntries: Record<string, DriverTrackingData & { name?: string }> = {};
      for (const [id, data] of Object.entries(courierData)) {
        if (data.status && data.status !== 'offline') {
          courierEntries[`courier:${id}`] = { ...data, name: `Courier ${id.slice(0, 6)}` } as any;
        }
      }
      setDrivers(prev => {
        // Remove old courier entries, add new ones
        const cleaned: Record<string, any> = {};
        for (const [k, v] of Object.entries(prev)) {
          if (!k.startsWith('courier:')) cleaned[k] = v;
        }
        return { ...cleaned, ...courierEntries };
      });
    });
    return unsubscribe;
  }, [currentBusiness?.settings?.courierDelivery?.enabled]);

  // ── Fetch driver names from Firestore ──────────────
  const [driverNames, setDriverNames] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!businessId) return;
    const fetchNames = async () => {
      try {
        const snap = await getDocs(collection(db, 'businesses', businessId, 'drivers'));
        const names: Record<string, string> = {};
        snap.forEach(d => {
          names[d.id] = d.data().name || d.id;
        });
        setDriverNames(names);
      } catch { /* silent */ }
    };
    fetchNames();
  }, [businessId]);

  // ── Subscribe to pending orders (Firestore) ────────
  useEffect(() => {
    if (!businessId) return;
    const q = query(
      collection(db, 'businesses', businessId, 'orders'),
      where('status', 'in', ['pending', 'confirmed', 'preparing', 'ready']),
      orderBy('createdAt', 'desc'),
      limit(50),
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const list: OrderData[] = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          customerName: data.customerName || data.customer?.name || 'Customer',
          address: data.deliveryAddress || data.customer?.address || '',
          total: data.total || data.pricing?.total || 0,
          status: data.status || 'pending',
          lat: data.deliveryLat || data.customer?.lat,
          lng: data.deliveryLng || data.customer?.lng,
        };
      });
      setPendingOrders(list);
    });
    return unsubscribe;
  }, [businessId]);

  // ── Update map markers when drivers change ─────────
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    const current = new Set(Object.keys(drivers));

    // Remove markers for drivers that no longer exist
    Object.keys(markersRef.current).forEach(id => {
      if (!current.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Add/update markers
    Object.entries(drivers).forEach(([driverId, data]) => {
      if (!data.location) return;
      const { lat, lng } = data.location;
      const status = data.status || 'offline';
      const name = driverNames[driverId] || driverId.slice(0, 8);

      if (markersRef.current[driverId]) {
        markersRef.current[driverId].setLngLat([lng, lat]);
        // Update popup
        markersRef.current[driverId].setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div style="font-family:sans-serif; padding:4px 0;">
              <strong>${name}</strong><br/>
              <span style="color:${STATUS_COLORS[status]}; font-weight:600;">${STATUS_LABELS[status] || status}</span>
              ${data.currentOrderId ? `<br/><small>Order: ${data.currentOrderId.slice(0, 8)}...</small>` : ''}
            </div>`
          )
        );
      } else {
        const el = document.createElement('div');
        el.style.width = '36px';
        el.style.height = '36px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = STATUS_COLORS[status] || '#9ca3af';
        el.style.border = '3px solid white';
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.4)';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.fontSize = '16px';
        el.style.cursor = 'pointer';
        el.innerHTML = '🚗';
        el.onclick = () => setSelectedDriver(driverId);

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([lng, lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<div style="font-family:sans-serif; padding:4px 0;">
                <strong>${name}</strong><br/>
                <span style="color:${STATUS_COLORS[status]}; font-weight:600;">${STATUS_LABELS[status] || status}</span>
              </div>`
            )
          )
          .addTo(mapRef.current!);

        markersRef.current[driverId] = marker;
      }
    });
  }, [drivers, driverNames, mapReady]);

  // ── Actions ────────────────────────────────────────
  const handleAssign = useCallback(
    async (driverId: string, orderId: string) => {
      if (!businessId) return;
      try {
        await assignOrderToDriver(businessId, driverId, orderId);
        setAssigningOrder(null);
      } catch {
        alert('Failed to assign order');
      }
    },
    [businessId],
  );

  const handleComplete = useCallback(
    async (driverId: string) => {
      if (!businessId) return;
      try {
        await completeDelivery(businessId, driverId);
      } catch {
        alert('Failed to complete delivery');
      }
    },
    [businessId],
  );

  const handleStatusChange = useCallback(
    async (driverId: string, status: 'idle' | 'in_transit' | 'at_restaurant' | 'delivering') => {
      if (!businessId) return;
      await updateDriverStatus(businessId, driverId, status);
    },
    [businessId],
  );

  if (!currentBusiness) return null;

  const driverList = Object.entries(drivers);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeDrivers = driverList.filter(([, d]) => {
    const s: string = d.status || 'offline';
    return s !== 'offline';
  });
  const selectedData = selectedDriver ? drivers[selectedDriver] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-black">Dispatch</h1>
          <p className="text-zinc-400 font-medium mt-1">
            {activeDrivers.length} active driver{activeDrivers.length !== 1 ? 's' : ''} ·{' '}
            {pendingOrders.length} pending order{pendingOrders.length !== 1 ? 's' : ''}
          </p>
        </div>
        <a
          href="/owner/drivers"
          className="bg-zinc-100 hover:bg-zinc-200 text-black px-4 py-2 rounded-xl font-bold text-sm transition-colors"
        >
          Manage Drivers →
        </a>
      </div>

      {/* Map + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ minHeight: '600px' }}>
        {/* Map */}
        <div className="lg:col-span-2 bg-zinc-900 rounded-2xl overflow-hidden relative">
          <div ref={mapContainer} className="w-full h-full min-h-125" />

          {/* Quick Stats Overlay */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 z-10 flex gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Drivers</p>
              <p className="text-lg font-black text-black">{driverList.length}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Active</p>
              <p className="text-lg font-black text-emerald-600">{activeDrivers.length}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Orders</p>
              <p className="text-lg font-black text-indigo-600">{pendingOrders.length}</p>
            </div>
          </div>
        </div>

        {/* Sidebar — driver list + assignment */}
        <div className="space-y-4 overflow-y-auto max-h-175">
          {/* Selected Driver Detail */}
          {selectedDriver && selectedData && (
            <div className="bg-white rounded-2xl border border-zinc-100 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-black">
                  {driverNames[selectedDriver] || selectedDriver.slice(0, 8)}
                </h3>
                <button
                  onClick={() => setSelectedDriver(null)}
                  className="text-zinc-400 hover:text-black text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[selectedData.status || 'offline'] }}
                />
                <span className="text-sm font-bold text-zinc-600">
                  {STATUS_LABELS[selectedData.status || 'offline']}
                </span>
              </div>

              {selectedData.location && (
                <p className="text-xs text-zinc-400">
                  📍 {selectedData.location.lat.toFixed(4)}, {selectedData.location.lng.toFixed(4)}
                  {selectedData.location.speed != null && (
                    <> · {(selectedData.location.speed * 2.237).toFixed(0)} mph</>
                  )}
                </p>
              )}

              {selectedData.currentOrderId && (
                <div className="bg-indigo-50 rounded-lg p-3">
                  <p className="text-[10px] font-black uppercase text-indigo-500 mb-1">
                    Current Order
                  </p>
                  <p className="text-sm font-bold text-indigo-700">
                    {selectedData.currentOrderId}
                  </p>
                  <button
                    onClick={() => handleComplete(selectedDriver)}
                    className="mt-2 bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors cursor-pointer"
                  >
                    ✓ Mark Delivered
                  </button>
                </div>
              )}

              {/* Status Buttons */}
              <div className="grid grid-cols-2 gap-2">
                {(['idle', 'in_transit', 'at_restaurant', 'delivering'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(selectedDriver, s)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      selectedData.status === s
                        ? 'bg-black text-white'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>

              {/* Assign Order */}
              {!selectedData.currentOrderId && pendingOrders.length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase text-zinc-400 mb-2">
                    Assign an Order
                  </p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {pendingOrders.filter(o => o.status === 'ready').map(order => (
                      <button
                        key={order.id}
                        onClick={() => handleAssign(selectedDriver, order.id)}
                        className="w-full text-left bg-zinc-50 hover:bg-zinc-100 rounded-lg p-2.5 transition-colors cursor-pointer"
                      >
                        <p className="text-sm font-bold text-black">{order.customerName}</p>
                        <p className="text-xs text-zinc-400 truncate">{order.address || 'No address'}</p>
                        <p className="text-xs font-bold text-emerald-600">${order.total.toFixed(2)}</p>
                      </button>
                    ))}
                    {pendingOrders.filter(o => o.status === 'ready').length === 0 && (
                      <p className="text-xs text-zinc-400">No orders ready for pickup</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Driver List */}
          <div className="bg-white rounded-2xl border border-zinc-100 p-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">
              All Drivers
            </h3>
            {driverList.length === 0 ? (
              <p className="text-sm text-zinc-400 py-4 text-center">
                No drivers are online. GPS tracking must be started from the driver app.
              </p>
            ) : (
              <div className="space-y-2">
                {driverList.map(([id, data]) => (
                  <button
                    key={id}
                    onClick={() => setSelectedDriver(id)}
                    className={`w-full text-left flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer ${
                      selectedDriver === id ? 'bg-black text-white' : 'hover:bg-zinc-50'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: STATUS_COLORS[data.status || 'offline'] }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${
                        selectedDriver === id ? 'text-white' : 'text-black'
                      }`}>
                        {driverNames[id] || id.slice(0, 8)}
                      </p>
                      <p className={`text-[10px] uppercase font-black ${
                        selectedDriver === id ? 'text-zinc-300' : 'text-zinc-400'
                      }`}>
                        {STATUS_LABELS[data.status || 'offline']}
                        {data.currentOrderId ? ' · Has order' : ''}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pending Orders List */}
          <div className="bg-white rounded-2xl border border-zinc-100 p-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">
              Pending Orders ({pendingOrders.length})
            </h3>
            {pendingOrders.length === 0 ? (
              <p className="text-sm text-zinc-400 py-2 text-center">No pending orders</p>
            ) : (
              <div className="space-y-2">
                {pendingOrders.map(order => (
                  <div
                    key={order.id}
                    className="bg-zinc-50 rounded-xl p-3 flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-black truncate">
                        {order.customerName}
                      </p>
                      <p className="text-xs text-zinc-400 truncate">{order.address || '—'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          order.status === 'ready'
                            ? 'bg-emerald-100 text-emerald-700'
                            : order.status === 'preparing'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {order.status}
                        </span>
                        <span className="text-xs font-bold text-emerald-600">
                          ${order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    {order.status === 'ready' && (
                      <button
                        onClick={() => setAssigningOrder(order.id)}
                        className="bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-600 transition-colors shrink-0 ml-2 cursor-pointer"
                      >
                        Assign
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Assign Order Modal ──────────────────────────── */}
      {assigningOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setAssigningOrder(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-black text-black">Assign Order to Driver</h2>
            <p className="text-sm text-zinc-400">
              Order: <strong>{assigningOrder.slice(0, 12)}...</strong>
            </p>
            {driverList.filter(([, d]) => d.status === 'idle' || d.status === 'at_restaurant').length === 0 ? (
              <p className="text-sm text-zinc-400 py-4 text-center">No available drivers</p>
            ) : (
              <div className="space-y-2">
                {driverList
                  .filter(([, d]) => d.status === 'idle' || d.status === 'at_restaurant')
                  .map(([id]) => (
                    <button
                      key={id}
                      onClick={() => handleAssign(id, assigningOrder)}
                      className="w-full text-left bg-zinc-50 hover:bg-zinc-100 rounded-xl p-3 transition-colors cursor-pointer flex items-center gap-3"
                    >
                      <span className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-sm font-bold text-black">
                        {driverNames[id] || id.slice(0, 8)}
                      </span>
                    </button>
                  ))}
              </div>
            )}
            <button
              onClick={() => setAssigningOrder(null)}
              className="w-full bg-zinc-100 text-black py-2.5 rounded-xl font-bold text-sm hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
