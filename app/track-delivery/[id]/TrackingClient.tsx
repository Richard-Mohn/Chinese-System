'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { subscribeToDriverLocation, subscribeToCourierLocation, calculateETA, type DriverLocation } from '@/lib/realTimeTracking';

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
  assignedDriverType?: string;
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

/** Play a short notification chime via Web Audio API */
function playProximityChime() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch { /* audio not available */ }
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
  const [distance, setDistance] = useState<number | null>(null);
  const [driverStatus, setDriverStatus] = useState('');
  const [proximityAlert, setProximityAlert] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [driverSpeed, setDriverSpeed] = useState<number | null>(null);
  const proximityAlertShown = useRef<Set<string>>(new Set());
  const locationHistory = useRef<[number, number][]>([]);
  const routeSource = useRef<boolean>(false);
  const pathHistorySource = useRef<boolean>(false);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Auto dark mode based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    setIsDarkMode(hour >= 19 || hour < 6); // Dark mode 7PM - 6AM
  }, []);

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
          driverId: d.driverId || d.assignedDriverId || '',
          assignedDriverType: d.assignedDriverType || '',
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

  // ── 2. Initialize Enhanced Mapbox with 3D & Terrain ───────────────────────────
  useEffect(() => {
    if (!mapContainer.current || !order) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

    const centerLat = (order.restaurantLat + order.deliveryLat) / 2;
    const centerLng = (order.restaurantLng + order.deliveryLng) / 2;

    const mapStyle = isDarkMode 
      ? 'mapbox://styles/mapbox/navigation-night-v1' 
      : 'mapbox://styles/mapbox/navigation-day-v1';

    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [centerLng, centerLat],
      zoom: 13,
      pitch: 60, // 3D perspective
      bearing: -20,
      antialias: true,
    });

    m.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
    m.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    // Enable 3D buildings, terrain, and traffic when map loads
    m.on('load', () => {
      // Add 3D terrain
      m.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14,
      });
      m.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

      // Add 3D buildings
      const layers = m.getStyle().layers;
      const labelLayerId = layers?.find(
        (layer) => layer.type === 'symbol' && layer.layout && (layer.layout as any)['text-field']
      )?.id;

      if (labelLayerId && !m.getLayer('3d-buildings')) {
        m.addLayer(
          {
            id: '3d-buildings',
            source: 'composite',
            'source-layer': 'building',
            filter: ['==', 'extrude', 'true'],
            type: 'fill-extrusion',
            minzoom: 15,
            paint: {
              'fill-extrusion-color': isDarkMode ? '#1a1a2e' : '#aaa',
              'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'height'],
              ],
              'fill-extrusion-base': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'min_height'],
              ],
              'fill-extrusion-opacity': 0.6,
            },
          },
          labelLayerId
        );
      }

      // Add traffic layer
      if (!m.getLayer('traffic')) {
        m.addSource('traffic', {
          type: 'vector',
          url: 'mapbox://mapbox.mapbox-traffic-v1',
        });
        m.addLayer({
          id: 'traffic',
          type: 'line',
          source: 'traffic',
          'source-layer': 'traffic',
          paint: {
            'line-width': 4,
            'line-color': [
              'case',
              ['==', ['get', 'congestion'], 'low'], '#4CAF50',
              ['==', ['get', 'congestion'], 'moderate'], '#FFC107',
              ['==', ['get', 'congestion'], 'heavy'], '#FF5722',
              ['==', ['get', 'congestion'], 'severe'], '#D50000',
              '#999',
            ],
          },
        });
      }
    });

    // Enhanced restaurant marker
    const restEl = document.createElement('div');
    restEl.style.cssText = `
      width: 48px;
      height: 48px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    restEl.innerHTML = `
      <div style="
        position: relative;
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, #3b82f6, #6366f1);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        box-shadow: 0 4px 16px rgba(59, 130, 246, 0.6);
        border: 3px solid white;
      ">🍽️</div>
    `;
    new mapboxgl.Marker({ element: restEl })
      .setLngLat([order.restaurantLng, order.restaurantLat])
      .setPopup(new mapboxgl.Popup().setHTML(`<strong>${order.businessName}</strong>`))
      .addTo(m);

    // Enhanced customer delivery marker with pulsing
    const custEl = document.createElement('div');
    custEl.style.cssText = `
      width: 48px;
      height: 48px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    custEl.innerHTML = `
      <style>
        @keyframes pulse-delivery {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.4); }
        }
      </style>
      <div style="
        position: absolute;
        width: 100%;
        height: 100%;
        background: rgba(34, 197, 94, 0.3);
        border-radius: 50%;
        animation: pulse-delivery 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      "></div>
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #10b981, #22c55e);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.5);
        border: 3px solid white;
      ">📍</div>
    `;
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
  }, [order, isDarkMode]);

  // ── 3. Subscribe to driver GPS ─────────────────────
  useEffect(() => {
    if (!order?.driverId || !order?.businessId) return;

    // Use courier-specific RTDB path if driver is a courier
    const isCourierDriver = order.assignedDriverType === 'courier';

    const locationCallback = (loc: DriverLocation | null) => {
        if (!loc) return;
        setDriverLoc(loc);
        setDriverSpeed(loc.speed !== undefined ? loc.speed * 2.237 : null); // Convert m/s to mph

        // Add to path history
        locationHistory.current.push([loc.lng, loc.lat]);
        if (locationHistory.current.length > 100) {
          locationHistory.current.shift();
        }

        // Update ETA with speed consideration
        const speedMph = loc.speed && loc.speed > 0 ? loc.speed * 2.237 : 25;
        const mins = calculateETA(loc.lat, loc.lng, order.deliveryLat, order.deliveryLng, speedMph);
        setEta(mins);

        // Calculate distance
        const R = 3959; // Earth's radius in miles
        const dLat = ((order.deliveryLat - loc.lat) * Math.PI) / 180;
        const dLng = ((order.deliveryLng - loc.lng) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) ** 2 +
          Math.cos((loc.lat * Math.PI) / 180) * Math.cos((order.deliveryLat * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;
        const distMiles = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        setDistance(distMiles);

        // ── Proximity alerts ──
        if (distMiles <= 0.1 && !proximityAlertShown.current.has('arriving')) {
          proximityAlertShown.current.add('arriving');
          setProximityAlert('🎉 Your driver is arriving!');
          playProximityChime();
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Driver Arriving!', { body: 'Your delivery is almost here!', icon: '/icon.png' });
          }
        } else if (distMiles <= 0.5 && !proximityAlertShown.current.has('nearby')) {
          proximityAlertShown.current.add('nearby');
          setProximityAlert('🚗 Your driver is nearby! Less than half a mile away.');
          playProximityChime();
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Driver Nearby!', { body: 'Your driver is less than half a mile away.', icon: '/icon.png' });
          }
        } else if (distMiles <= 1.0 && !proximityAlertShown.current.has('close')) {
          proximityAlertShown.current.add('close');
          setProximityAlert('📍 Your driver is about 1 mile away.');
        }

        // Enhanced driver marker with rotation and pulsing
        if (mapRef.current) {
          if (!driverMarkerRef.current) {
            const el = document.createElement('div');
            el.style.cssText = `
              width: 56px;
              height: 56px;
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: transform 0.5s ease-out;
            `;
            el.innerHTML = `
              <style>
                @keyframes pulse-driver {
                  0%, 100% { opacity: 1; transform: scale(1); }
                  50% { opacity: 0.3; transform: scale(1.4); }
                }
              </style>
              <div style="
                position: absolute;
                width: 100%;
                height: 100%;
                background: rgba(239, 68, 68, 0.25);
                border-radius: 50%;
                animation: pulse-driver 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
              "></div>
              <div style="
                position: relative;
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #ef4444, #dc2626);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                box-shadow: 0 6px 20px rgba(239, 68, 68, 0.6), 0 0 0 4px rgba(255,255,255,0.9);
                transform: rotate(${loc.heading || 0}deg);
                transition: transform 0.3s ease-out;
              ">🚗</div>
            `;
            driverMarkerRef.current = new mapboxgl.Marker({ element: el, rotationAlignment: 'map' })
              .setLngLat([loc.lng, loc.lat])
              .addTo(mapRef.current);
          } else {
            driverMarkerRef.current.setLngLat([loc.lng, loc.lat]);
            
            // Update rotation
            if (loc.heading !== undefined && loc.heading !== null) {
              const el = driverMarkerRef.current.getElement();
              const carIcon = el.querySelector('div > div') as HTMLElement;
              if (carIcon) {
                carIcon.style.transform = `rotate(${loc.heading}deg)`;
              }
            }
          }

          // Smooth camera follow with bearing
          if (loc.heading !== undefined) {
            mapRef.current.easeTo({
              center: [loc.lng, loc.lat],
              zoom: 16,
              pitch: 65,
              bearing: loc.heading || 0,
              duration: 1000,
              essential: true,
            });
          } else {
            // Fit bounds if no heading
            const bounds = new mapboxgl.LngLatBounds();
            bounds.extend([order.restaurantLng, order.restaurantLat]);
            bounds.extend([order.deliveryLng, order.deliveryLat]);
            bounds.extend([loc.lng, loc.lat]);
            mapRef.current.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 1000 });
          }

          // Draw path history trail
          if (locationHistory.current.length > 1 && !pathHistorySource.current) {
            mapRef.current.addSource('path-history', {
              type: 'geojson',
              data: {
                type: 'FeatureCollection',
                features: [{
                  type: 'Feature',
                  geometry: {
                    type: 'LineString',
                    coordinates: locationHistory.current,
                  },
                  properties: {},
                }],
              },
            });
            mapRef.current.addLayer({
              id: 'path-history',
              type: 'line',
              source: 'path-history',
              layout: { 'line-join': 'round', 'line-cap': 'round' },
              paint: {
                'line-color': '#ef4444',
                'line-width': 3,
                'line-opacity': 0.4,
                'line-dasharray': [1, 2],
              },
            });
            pathHistorySource.current = true;
          } else if (pathHistorySource.current && locationHistory.current.length > 1) {
            const source = mapRef.current.getSource('path-history') as mapboxgl.GeoJSONSource;
            if (source) {
              source.setData({
                type: 'FeatureCollection',
                features: [{
                  type: 'Feature',
                  geometry: {
                    type: 'LineString',
                    coordinates: locationHistory.current,
                  },
                  properties: {},
                }],
              } as GeoJSON.FeatureCollection);
            }
          }

          // Draw actual route using Mapbox Directions API
          drawActualRoute(loc, order.deliveryLat, order.deliveryLng);
        }
    };

    // Helper: Draw actual road route
    const drawActualRoute = async (loc: DriverLocation, destLat: number, destLng: number) => {
      if (!mapRef.current) return;

      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
      const coords = `${loc.lng},${loc.lat};${destLng},${destLat}`;
      
      try {
        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?geometries=geojson&overview=full&access_token=${token}`
        );
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0].geometry;

          if (!routeSource.current) {
            mapRef.current.addSource('route', {
              type: 'geojson',
              data: { type: 'FeatureCollection', features: [] },
            });
            mapRef.current.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: { 'line-join': 'round', 'line-cap': 'round' },
              paint: {
                'line-color': isDarkMode ? '#60a5fa' : '#3b82f6',
                'line-width': 6,
                'line-opacity': 0.8,
              },
            });
            mapRef.current.addLayer({
              id: 'route-dash',
              type: 'line',
              source: 'route',
              layout: { 'line-join': 'round', 'line-cap': 'round' },
              paint: {
                'line-color': '#ffffff',
                'line-width': 4,
                'line-opacity': 0.5,
                'line-dasharray': [0, 2, 3],
              },
            });
            routeSource.current = true;
          }

          const source = mapRef.current.getSource('route') as mapboxgl.GeoJSONSource;
          if (source) {
            source.setData({
              type: 'FeatureCollection',
              features: [{ type: 'Feature', geometry: route, properties: {} }],
            } as GeoJSON.FeatureCollection);
          }
        }
      } catch (error) {
        console.error('Failed to fetch route:', error);
      }
    };

    const statusCallback = (status: string) => setDriverStatus(status);

    const unsub = isCourierDriver
      ? subscribeToCourierLocation(order.driverId, locationCallback, statusCallback)
      : subscribeToDriverLocation(order.businessId, order.driverId, locationCallback, statusCallback);

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

      {/* Proximity Alert Banner */}
      {proximityAlert && (
        <div className="bg-emerald-500 text-white px-4 py-3 animate-pulse">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <p className="font-black text-sm">{proximityAlert}</p>
            <button
              onClick={() => setProximityAlert(null)}
              className="text-white/80 hover:text-white text-lg font-bold px-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto p-4 space-y-6">
        {/* Enhanced Map with Overlays */}
        <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden shadow-lg relative">
          <div ref={mapContainer} className="w-full h-80 sm:h-96" />
          
          {/* Enhanced ETA & Stats Panel Overlay */}
          {eta && !isDelivered && driverLoc && (
            <div className={`absolute top-4 left-4 ${isDarkMode ? 'bg-zinc-900/95' : 'bg-white/95'} backdrop-blur-xl rounded-2xl shadow-2xl p-5 z-10 max-w-xs border ${isDarkMode ? 'border-zinc-700' : 'border-zinc-200'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-xl ${isDarkMode ? 'bg-gradient-to-br from-blue-600 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-indigo-500'} flex items-center justify-center text-2xl shadow-lg`}>
                  🚗
                </div>
                <div>
                  <div className={`text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>Arriving In</div>
                  <div className={`text-4xl font-black ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{eta}<span className="text-xl ml-1">min</span></div>
                </div>
              </div>
              
              {distance !== null && (
                <div className={`flex items-center justify-between py-2.5 px-3 ${isDarkMode ? 'bg-zinc-800/50' : 'bg-zinc-50'} rounded-xl mb-2`}>
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Distance</span>
                  <span className={`text-sm font-bold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>{distance.toFixed(1)} mi</span>
                </div>
              )}
              
              {driverSpeed !== null && driverSpeed > 0 && (
                <div className={`flex items-center justify-between py-2.5 px-3 ${isDarkMode ? 'bg-zinc-800/50' : 'bg-zinc-50'} rounded-xl mb-2`}>
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Speed</span>
                  <span className={`text-sm font-bold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>{driverSpeed.toFixed(0)} mph</span>
                </div>
              )}

              <div className={`mt-3 pt-3 border-t ${isDarkMode ? 'border-zinc-700' : 'border-zinc-200'}`}>
                <div className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'} flex items-center gap-2`}>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                  </span>
                  <span className="font-semibold">Live tracking active</span>
                </div>
              </div>
            </div>
          )}

          {/* Traffic Legend */}
          <div className={`absolute top-4 right-4 ${isDarkMode ? 'bg-zinc-900/95' : 'bg-white/95'} backdrop-blur-xl rounded-xl shadow-lg px-4 py-3 z-10 border ${isDarkMode ? 'border-zinc-700' : 'border-zinc-200'}`}>
            <div className={`text-xs font-bold uppercase tracking-wide mb-2 ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>Traffic</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-green-500 rounded-full"></div>
                <span className={isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}>Light</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-yellow-500 rounded-full"></div>
                <span className={isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}>Moderate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-orange-500 rounded-full"></div>
                <span className={isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}>Heavy</span>
              </div>
            </div>
          </div>
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
