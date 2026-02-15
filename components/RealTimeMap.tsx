'use client';

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { DriverLocation, subscribeToDriverLocation, calculateETA } from '@/lib/realTimeTracking';

interface RealTimeMapProps {
  restaurantId: string;
  driverId: string;
  deliveryAddress: { lat: number; lng: number };
  restaurantLocation: { lat: number; lng: number };
  className?: string;
  showRoute?: boolean;
}

/**
 * Enhanced Real-Time Driver Tracking Map
 * Features beyond Uber:
 * - 3D buildings & terrain visualization
 * - Actual road routing via Mapbox Directions API
 * - Smooth driver rotation based on heading
 * - Real-time traffic overlay
 * - Pulsing driver marker with smooth animations
 * - Path history trail
 * - Distance rings around destination
 * - Dark mode for night deliveries
 * - Smart camera following with bearing
 * - Speed-based ETA with traffic
 */
export const RealTimeMap: React.FC<RealTimeMapProps> = ({
  restaurantId,
  driverId,
  deliveryAddress,
  restaurantLocation,
  className = 'w-full h-96',
  showRoute = true,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const driverMarker = useRef<mapboxgl.Marker | null>(null);
  const customerMarker = useRef<mapboxgl.Marker | null>(null);
  const restaurantMarker = useRef<mapboxgl.Marker | null>(null);
  const routeSource = useRef<boolean>(false);
  const pathHistorySource = useRef<boolean>(false);
  const locationHistory = useRef<[number, number][]>([]);

  const [eta, setEta] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [lastLocation, setLastLocation] = useState<DriverLocation | null>(null);
  const [driverStatus, setDriverStatus] = useState<string>('waiting');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Auto dark mode based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    setIsDarkMode(hour >= 19 || hour < 6); // Dark mode 7PM - 6AM
  }, []);

  // Initialize enhanced map with 3D & terrain
  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

    const mapStyle = isDarkMode 
      ? 'mapbox://styles/mapbox/navigation-night-v1' 
      : 'mapbox://styles/mapbox/navigation-day-v1';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [restaurantLocation.lng, restaurantLocation.lat],
      zoom: 14,
      pitch: 60, // 3D Perspective
      bearing: -20,
      antialias: true, // Smooth 3D rendering
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    // Enable 3D buildings, terrain, and traffic when map loads
    map.current.on('load', () => {
      // Add 3D terrain
      map.current!.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14,
      });
      map.current!.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

      // Add 3D buildings layer
      const layers = map.current!.getStyle().layers;
      const labelLayerId = layers?.find(
        (layer) => layer.type === 'symbol' && layer.layout && (layer.layout as any)['text-field']
      )?.id;

      if (labelLayerId && !map.current!.getLayer('3d-buildings')) {
        map.current!.addLayer(
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

      // Add real-time traffic layer
      if (!map.current!.getLayer('traffic')) {
        map.current!.addSource('traffic', {
          type: 'vector',
          url: 'mapbox://mapbox.mapbox-traffic-v1',
        });
        map.current!.addLayer({
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

      // Add distance rings around destination
      addDistanceRings();
    });

    // Create animated customer marker with pulsing effect
    const customerEl = document.createElement('div');
    customerEl.style.cssText = `
      width: 48px;
      height: 48px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    customerEl.innerHTML = `
      <div style="
        position: absolute;
        width: 100%;
        height: 100%;
        background: rgba(34, 197, 94, 0.3);
        border-radius: 50%;
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
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

    customerMarker.current = new mapboxgl.Marker({ element: customerEl })
      .setLngLat([deliveryAddress.lng, deliveryAddress.lat])
      .addTo(map.current);

    // Create animated restaurant marker
    const restaurantEl = document.createElement('div');
    restaurantEl.style.cssText = `
      width: 48px;
      height: 48px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    restaurantEl.innerHTML = `
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

    restaurantMarker.current = new mapboxgl.Marker({ element: restaurantEl })
      .setLngLat([restaurantLocation.lng, restaurantLocation.lat])
      .addTo(map.current);

    // Add pulsing animation CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.3;
          transform: scale(1.4);
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (map.current) {
        map.current.remove();
      }
      document.head.removeChild(style);
    };
  }, [deliveryAddress, restaurantLocation, isDarkMode]);

  // Add distance rings around destination
  const addDistanceRings = () => {
    if (!map.current) return;

    const center = [deliveryAddress.lng, deliveryAddress.lat];
    const radiusInKm = [0.5, 1, 2]; // 0.5km, 1km, 2km rings

    radiusInKm.forEach((radius, index) => {
      const options = { steps: 64, units: 'kilometers' as const };
      const circle = createCircle(center, radius, options);

      if (!map.current!.getSource(`ring-${index}`)) {
        map.current!.addSource(`ring-${index}`, {
          type: 'geojson',
          data: circle as GeoJSON.FeatureCollection,
        });

        map.current!.addLayer({
          id: `ring-${index}`,
          type: 'line',
          source: `ring-${index}`,
          paint: {
            'line-color': isDarkMode ? '#60a5fa' : '#3b82f6',
            'line-width': 2,
            'line-opacity': 0.3 - index * 0.1,
            'line-dasharray': [2, 2],
          },
        });
      }
    });
  };

  // Helper: Create circle GeoJSON for distance rings
  const createCircle = (center: number[], radiusInKm: number, options: { steps: number; units: string }) => {
    const steps = options.steps;
    const coords: [number, number][] = [];
    const distanceX = radiusInKm / (111.32 * Math.cos((center[1] * Math.PI) / 180));
    const distanceY = radiusInKm / 110.574;

    for (let i = 0; i < steps; i++) {
      const theta = (i / steps) * (2 * Math.PI);
      const x = distanceX * Math.cos(theta);
      const y = distanceY * Math.sin(theta);
      coords.push([center[0] + x, center[1] + y]);
    }
    coords.push(coords[0]);

    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: coords,
          },
          properties: {},
        },
      ],
    };
  };

  // Subscribe to real-time driver location with enhanced features
  useEffect(() => {
    const unsubscribe = subscribeToDriverLocation(
      restaurantId,
      driverId,
      (location) => {
        if (!location || !map.current) return;

        // Add to path history
        locationHistory.current.push([location.lng, location.lat]);
        if (locationHistory.current.length > 100) {
          locationHistory.current.shift(); // Keep last 100 points
        }

        // Create or update driver marker with smooth rotation
        if (!driverMarker.current) {
          const driverEl = document.createElement('div');
          driverEl.style.cssText = `
            width: 56px;
            height: 56px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.5s ease-out;
          `;
          driverEl.innerHTML = `
            <div style="
              position: absolute;
              width: 100%;
              height: 100%;
              background: rgba(239, 68, 68, 0.25);
              border-radius: 50%;
              animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
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
              transform: rotate(${location.heading || 0}deg);
              transition: transform 0.3s ease-out;
            ">🚗</div>
          `;

          driverMarker.current = new mapboxgl.Marker({ element: driverEl, rotationAlignment: 'map' })
            .setLngLat([location.lng, location.lat])
            .addTo(map.current);
        } else {
          // Smoothly animate driver to new position
          const lngLat: [number, number] = [location.lng, location.lat];
          driverMarker.current.setLngLat(lngLat);
          
          // Update rotation based on heading
          if (location.heading !== undefined && location.heading !== null) {
            const driverEl = driverMarker.current.getElement();
            const carIcon = driverEl.querySelector('div > div') as HTMLElement;
            if (carIcon) {
              carIcon.style.transform = `rotate(${location.heading}deg)`;
            }
          }
        }

        // Calculate ETA and distance
        const newEta = calculateETA(
          location.lat,
          location.lng,
          deliveryAddress.lat,
          deliveryAddress.lng,
          location.speed
        );
        setEta(newEta);

        // Calculate distance in miles
        const dist = haversineDistance(
          location.lat,
          location.lng,
          deliveryAddress.lat,
          deliveryAddress.lng
        );
        setDistance(dist);

        setLastLocation(location);

        // Smoothly follow driver with camera (like Uber)
        if (map.current && location.heading !== undefined) {
          map.current.easeTo({
            center: [location.lng, location.lat],
            zoom: 16,
            pitch: 65,
            bearing: location.heading || 0, // Rotate map to match driving direction
            duration: 1000,
            essential: true,
          });
        }

        // Draw path history trail
        if (locationHistory.current.length > 1) {
          drawPathHistory();
        }

        // Draw route if enabled
        if (showRoute) {
          drawActualRoute(location, deliveryAddress);
        }
      },
      (status) => {
        setDriverStatus(status);
      }
    );

    return unsubscribe;
  }, [restaurantId, driverId, deliveryAddress, restaurantLocation, showRoute]);

  // Helper: Calculate distance in miles using Haversine formula
  const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 3958.8; // Earth radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Draw path history trail (where driver has been)
  const drawPathHistory = () => {
    if (!map.current || locationHistory.current.length < 2) return;

    if (!pathHistorySource.current) {
      map.current.addSource('path-history', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      map.current.addLayer({
        id: 'path-history',
        type: 'line',
        source: 'path-history',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#ef4444',
          'line-width': 3,
          'line-opacity': 0.4,
          'line-dasharray': [1, 2],
        },
      });

      pathHistorySource.current = true;
    }

    const source = map.current.getSource('path-history') as mapboxgl.GeoJSONSource;
    source.setData({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: locationHistory.current,
          },
          properties: {},
        },
      ],
    } as GeoJSON.FeatureCollection);
  };

  // Draw actual road route using Mapbox Directions API
  const drawActualRoute = async (
    driverLocation: DriverLocation,
    destination: { lat: number; lng: number }
  ) => {
    if (!map.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    const coords = `${driverLocation.lng},${driverLocation.lat};${destination.lng},${destination.lat}`;
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?geometries=geojson&overview=full&access_token=${token}`
      );
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0].geometry;
        const durationMinutes = Math.ceil(data.routes[0].duration / 60);
        const distanceMiles = (data.routes[0].distance * 0.000621371).toFixed(1);

        // Update ETA with actual route duration
        setEta(durationMinutes);
        setDistance(parseFloat(distanceMiles));

        // Add/update route source
        if (!routeSource.current) {
          map.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [],
            },
          });

          // Animated route layer (main line)
          map.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': isDarkMode ? '#60a5fa' : '#3b82f6',
              'line-width': 6,
              'line-opacity': 0.8,
            },
          });

          // Animated dashed overlay (gives movement effect)
          map.current.addLayer({
            id: 'route-dash',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#ffffff',
              'line-width': 4,
              'line-opacity': 0.5,
              'line-dasharray': [0, 2, 3],
            },
          });

          routeSource.current = true;
        }

        const source = map.current.getSource('route') as mapboxgl.GeoJSONSource;
        source.setData({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: route,
              properties: {},
            },
          ],
        } as GeoJSON.FeatureCollection);
      }
    } catch (error) {
      console.error('Failed to fetch route:', error);
      // Fallback to straight line if API fails
      drawStraightRoute(driverLocation, destination);
    }
  };

  // Fallback: Draw straight route if Directions API fails
  const drawStraightRoute = (
    driverLocation: DriverLocation,
    destination: { lat: number; lng: number }
  ) => {
    if (!map.current) return;

    if (!routeSource.current) {
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#ef4444',
          'line-width': 3,
          'line-opacity': 0.7,
        },
      });

      routeSource.current = true;
    }

    const source = map.current.getSource('route') as mapboxgl.GeoJSONSource;
    source.setData({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [driverLocation.lng, driverLocation.lat],
              [destination.lng, destination.lat],
            ],
          },
          properties: {},
        },
      ],
    } as GeoJSON.FeatureCollection);
  };

  return (
    <div className={className}>
      <div
        ref={mapContainer}
        className="w-full h-full rounded-xl overflow-hidden shadow-2xl relative"
      >
        {/* Enhanced ETA & Stats Panel */}
        {eta && (
          <div className={`absolute top-4 left-4 ${isDarkMode ? 'bg-zinc-900/95' : 'bg-white/95'} backdrop-blur-xl rounded-2xl shadow-2xl p-5 z-10 max-w-xs border ${isDarkMode ? 'border-zinc-700' : 'border-zinc-200'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-12 h-12 rounded-xl ${isDarkMode ? 'bg-gradient-to-br from-blue-600 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-indigo-500'} flex items-center justify-center text-2xl shadow-lg`}>
                🚗
              </div>
              <div>
                <div className={`text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>Arrival In</div>
                <div className={`text-4xl font-black ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{eta}<span className="text-xl ml-1">min</span></div>
              </div>
            </div>
            
            {distance !== null && (
              <div className={`flex items-center justify-between py-2.5 px-3 ${isDarkMode ? 'bg-zinc-800/50' : 'bg-zinc-50'} rounded-xl mb-2`}>
                <span className={`text-xs font-medium ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Distance</span>
                <span className={`text-sm font-bold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>{distance.toFixed(1)} mi</span>
              </div>
            )}
            
            {lastLocation?.speed !== undefined && lastLocation.speed > 0 && (
              <div className={`flex items-center justify-between py-2.5 px-3 ${isDarkMode ? 'bg-zinc-800/50' : 'bg-zinc-50'} rounded-xl mb-2`}>
                <span className={`text-xs font-medium ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Speed</span>
                <span className={`text-sm font-bold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>{(lastLocation.speed * 2.237).toFixed(0)} mph</span>
              </div>
            )}

            <div className={`mt-3 pt-3 border-t ${isDarkMode ? 'border-zinc-700' : 'border-zinc-200'}`}>
              <div className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'} flex items-center gap-2`}>
                {driverStatus === 'in_transit' && (
                  <>
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                    <span className="font-semibold">Driver is en route</span>
                  </>
                )}
                {driverStatus === 'at_restaurant' && (
                  <>
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
                    </span>
                    <span className="font-semibold">Picking up your order</span>
                  </>
                )}
                {driverStatus === 'delivering' && (
                  <>
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                    </span>
                    <span className="font-semibold">Delivering now</span>
                  </>
                )}
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

        {/* Enhanced Legend */}
        <div className={`absolute bottom-4 left-4 ${isDarkMode ? 'bg-zinc-900/95' : 'bg-white/95'} backdrop-blur-xl rounded-xl shadow-lg p-4 z-10 border ${isDarkMode ? 'border-zinc-700' : 'border-zinc-200'}`}>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🚗</div>
              <span className={`font-medium ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>Your Driver</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-2xl">📍</div>
              <span className={`font-medium ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>Your Location</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-2xl">🍽️</div>
              <span className={`font-medium ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>Restaurant</span>
            </div>
          </div>
        </div>

        {/* 3D/Map Mode Toggle */}
        <button
          onClick={() => {
            if (map.current) {
              const currentPitch = map.current.getPitch();
              map.current.easeTo({
                pitch: currentPitch > 30 ? 0 : 65,
                duration: 1000,
              });
            }
          }}
          className={`absolute bottom-4 right-4 ${isDarkMode ? 'bg-zinc-900/95 hover:bg-zinc-800' : 'bg-white/95 hover:bg-zinc-50'} backdrop-blur-xl rounded-xl shadow-lg px-4 py-2.5 z-10 border ${isDarkMode ? 'border-zinc-700' : 'border-zinc-200'} transition-all text-sm font-semibold ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}
        >
          Toggle 3D
        </button>
      </div>
    </div>
  );
};

export default RealTimeMap;
