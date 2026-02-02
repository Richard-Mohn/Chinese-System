'use client';

import React, { useEffect, useState } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface DeliveryMapProps {
  driverLocation?: { latitude: number; longitude: number };
  customerLocation?: { latitude: number; longitude: number };
}

const DeliveryMap: React.FC<DeliveryMapProps> = ({ driverLocation, customerLocation }) => {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

  if (!mapboxToken) {
    return (
      <div className="bg-zinc-100 dark:bg-zinc-800 rounded-[2.5rem] h-[400px] flex items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-700">
        <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">
          Mapbox Token Missing
        </p>
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white dark:border-zinc-800 relative group">
      <Map
        initialViewState={{
          longitude: driverLocation?.longitude || -77.436, // Default to Virginia area
          latitude: driverLocation?.latitude || 37.540,
          zoom: 13
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={mapboxToken}
      >
        <NavigationControl position="bottom-right" />
        
        {driverLocation && (
          <Marker longitude={driverLocation.longitude} latitude={driverLocation.latitude} anchor="bottom">
            <div className="text-3xl animate-bounce drop-shadow-lg">🛵</div>
          </Marker>
        )}

        {customerLocation && (
          <Marker longitude={customerLocation.longitude} latitude={customerLocation.latitude} anchor="bottom">
            <div className="text-3xl drop-shadow-lg">🏠</div>
          </Marker>
        )}
      </Map>
      
      <div className="absolute top-6 left-6 bg-zinc-900/80 backdrop-blur text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">
        Live Driver Tracking
      </div>
    </div>
  );
};

export default DeliveryMap;
