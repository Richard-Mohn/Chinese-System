'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { subscribeToDriverLocation, calculateETA, type DriverLocation } from '@/lib/realTimeTracking';

/**
 * Customer-facing real-time delivery tracking.
 *
 * URL: /track-delivery/[orderId]
 *
 * Flow:
 *  1. Fetch order from Firestore (businesses/{biz}/orders/{id}) via a
 *     lightweight lookup collection `trackingLinks/{orderId}` that stores
 *     { businessId, driverId }.
 *  2. Subscribe to driver GPS via Firebase RTDB.
 *  3. Render Mapbox map with driver marker + delivery address + restaurant.
 */

interface OrderInfo {
  orderId: string;
  businessId: string;
  businessName: string;
  driverId: string;
  status: string;
  customerName: string;
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
  restaurantLat: number;
  restaurantLng: number;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  createdAt: string;
}

const STATUS_STEPS = [
  { key: 'confirmed', label: 'Order Confirmed', icon: '✓' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
  { key: 'ready', label: 'Ready for Pickup', icon: '📦' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚗' },
  { key: 'delivered', label: 'Delivered', icon: '🎉' },
];

export default function TrackingClient() {
  const params = useParams();
  const orderId = typeof params.id === 'string' ? params.id : '';

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const driverMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [driverLoc, setDriverLoc] = useState<DriverLocation | null>(null);
  const [eta, setEta] = useState<number | null>(null);
  const [driverStatus, setDriverStatus] = useState('');

  // ── 1. Listen to tracking link + order ─────────────
  useEffect(() => {
    if (!orderId) return;

    // Listen to trackingLinks/{orderId} for businessId + driverId mapping
    const unsub = onSnapshot(
      doc(db, 'trackingLinks', orderId),
      async (snap) => {
        if (!snap.exists()) {
          // Try interpreting orderId as "businessId__orderId" (fallback)
          const parts = orderId.split('__');
          if (parts.length === 2) {
            subscribeToOrder(parts[0], parts[1]);
          } else {
            setError('Tracking link not found. Please check the URL.');
            setLoading(false);
          }
          return;
        }
        const data = snap.data();
        subscribeToOrder(data.businessId, data.orderId || orderId);
      },
      () => {
        setError('Unable to load tracking information.');
        setLoading(false);
      },
    );

    return unsub;
  }, [orderId]);

  // Subscribe to the actual order document
  function subscribeToOrder(businessId: string, oid: string) {
    onSnapshot(
      doc(db, 'businesses', businessId, 'orders', oid),
      (snap) => {
        if (!snap.exists()) {
          setError('Order not found.');
          setLoading(false);
          return;
        }
        const d = snap.data();
        setOrder({
          orderId: oid,
          businessId,
          businessName: d.businessName || d.restaurantName || 'Restaurant',
          driverId: d.driverId || '',
          status: d.status || 'confirmed',
          customerName: d.customerName || d.customer?.name || 'Customer',
          deliveryAddress: d.deliveryAddress || d.customer?.address || '',
          deliveryLat: d.deliveryLat || d.customer?.lat || 37.5407,
          deliveryLng: d.deliveryLng || d.customer?.lng || -77.436,
          restaurantLat: d.restaurantLat || d.restaurant?.lat || 37.5407,
          restaurantLng: d.restaurantLng || d.restaurant?.lng || -77.436,
          items: (d.items || []).map((i: Record<string, unknown>) => ({
            name: (i.name as string) || 'Item',
            quantity: (i.quantity as number) || 1,
            price: (i.price as number) || 0,
          })),
          total: d.total || d.pricing?.total || 0,
          createdAt: d.createdAt || '',
        });
        setLoading(false);
      },
      () => {
        setError('Unable to load order.');
        setLoading(false);
      },
    );
  }

  // ── 2. Initialize Mapbox ───────────────────────────
  useEffect(() => {
    if (!mapContainer.current || !order) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

    const centerLat = (order.restaurantLat + order.deliveryLat) / 2;
    const centerLng = (order.restaurantLng + order.deliveryLng) / 2;

    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [centerLng, centerLat],
      zoom: 13,
    });

    m.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Restaurant marker
    const restEl = document.createElement('div');
    restEl.innerHTML = '🍽️';
    restEl.style.fontSize = '28px';
    new mapboxgl.Marker({ element: restEl })
      .setLngLat([order.restaurantLng, order.restaurantLat])
      .setPopup(new mapboxgl.Popup().setHTML(`<strong>${order.businessName}</strong>`))
      .addTo(m);

    // Customer delivery marker
    const custEl = document.createElement('div');
    custEl.innerHTML = '📍';
    custEl.style.fontSize = '28px';
    new mapboxgl.Marker({ element: custEl })
      .setLngLat([order.deliveryLng, order.deliveryLat])
      .setPopup(new mapboxgl.Popup().setHTML('<strong>Your Location</strong>'))
      .addTo(m);

    // Fit bounds to show both markers
    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([order.restaurantLng, order.restaurantLat]);
    bounds.extend([order.deliveryLng, order.deliveryLat]);
    m.fitBounds(bounds, { padding: 80, maxZoom: 15 });

    mapRef.current = m;
    return () => {
      m.remove();
      mapRef.current = null;
      driverMarkerRef.current = null;
    };
  }, [order]);

  // ── 3. Subscribe to driver GPS ─────────────────────
  useEffect(() => {
    if (!order?.driverId || !order?.businessId) return;

    const unsub = subscribeToDriverLocation(
      order.businessId,
      order.driverId,
      (loc) => {
        if (!loc) return;
        setDriverLoc(loc);

        // Update ETA
        const mins = calculateETA(loc.lat, loc.lng, order.deliveryLat, order.deliveryLng);
        setEta(mins);

        // Update driver marker on map
        if (mapRef.current) {
          if (!driverMarkerRef.current) {
            const el = document.createElement('div');
            el.innerHTML = '🚗';
            el.style.fontSize = '32px';
            el.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))';
            driverMarkerRef.current = new mapboxgl.Marker({ element: el })
              .setLngLat([loc.lng, loc.lat])
              .addTo(mapRef.current);
          } else {
            driverMarkerRef.current.setLngLat([loc.lng, loc.lat]);
          }

          // Pan to include driver
          const bounds = new mapboxgl.LngLatBounds();
          bounds.extend([order.restaurantLng, order.restaurantLat]);
          bounds.extend([order.deliveryLng, order.deliveryLat]);
          bounds.extend([loc.lng, loc.lat]);
          mapRef.current.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 1000 });
        }
      },
      (status) => setDriverStatus(status),
    );

    return unsub;
  }, [order?.driverId, order?.businessId, order?.deliveryLat, order?.deliveryLng, order?.restaurantLat, order?.restaurantLng]);

  // ── Loading / Error states ─────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500 font-bold">Loading tracking info...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-zinc-200 p-8 max-w-md text-center">
          <p className="text-4xl mb-4">🔍</p>
          <h1 className="text-xl font-black text-black mb-2">Tracking Not Found</h1>
          <p className="text-zinc-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  // Current step index
  const currentStepIdx = STATUS_STEPS.findIndex(s => s.key === order.status);
  const isDelivered = order.status === 'delivered';
  const hasDriver = !!order.driverId && !!driverLoc;

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-black text-white px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black">Track Your Order</h1>
            <p className="text-zinc-400 text-sm">{order.businessName}</p>
          </div>
          {eta && !isDelivered && (
            <div className="text-right">
              <p className="text-2xl font-black text-emerald-400">{eta} min</p>
              <p className="text-[10px] uppercase text-zinc-400 font-bold tracking-wider">Est. Arrival</p>
            </div>
          )}
          {isDelivered && (
            <div className="bg-emerald-500 px-4 py-2 rounded-xl">
              <p className="font-black text-sm">Delivered ✓</p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 space-y-6">
        {/* Map */}
        <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden shadow-sm">
          <div ref={mapContainer} className="w-full h-80 sm:h-96" />
        </div>

        {/* Status Progress */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-5">
          <div className="flex items-center justify-between overflow-x-auto gap-2">
            {STATUS_STEPS.map((step, i) => {
              const isActive = i <= currentStepIdx;
              const isCurrent = i === currentStepIdx;
              return (
                <div key={step.key} className="flex flex-col items-center flex-1 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mb-2 transition-colors ${
                      isActive
                        ? isCurrent
                          ? 'bg-black text-white ring-4 ring-black/10'
                          : 'bg-emerald-500 text-white'
                        : 'bg-zinc-100 text-zinc-400'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <p
                    className={`text-[10px] font-bold text-center leading-tight ${
                      isActive ? 'text-black' : 'text-zinc-400'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Order Items */}
          <div className="bg-white rounded-2xl border border-zinc-100 p-5">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">
              Your Order
            </h2>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="font-medium text-black">
                    {item.quantity}× {item.name}
                  </span>
                  <span className="text-zinc-500 font-bold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="border-t border-zinc-100 pt-2 mt-2 flex justify-between">
                <span className="font-black text-black">Total</span>
                <span className="font-black text-emerald-600">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Driver / Delivery Info */}
          <div className="bg-white rounded-2xl border border-zinc-100 p-5 space-y-4">
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">
                Delivery Details
              </h2>
              <p className="text-sm text-black font-medium">{order.deliveryAddress || '—'}</p>
            </div>

            {hasDriver && (
              <div className="bg-indigo-50 rounded-xl p-4">
                <p className="text-[10px] font-black uppercase text-indigo-500 mb-1">
                  Your Driver
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-200 rounded-full flex items-center justify-center text-lg">
                    🚗
                  </div>
                  <div>
                    <p className="font-bold text-indigo-900 text-sm capitalize">
                      {driverStatus.replace(/_/g, ' ') || 'En route'}
                    </p>
                    {driverLoc?.speed != null && (
                      <p className="text-xs text-indigo-500">
                        {(driverLoc.speed * 2.237).toFixed(0)} mph
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!hasDriver && !isDelivered && (
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="text-sm text-amber-700 font-medium">
                  Waiting for a driver to be assigned...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
