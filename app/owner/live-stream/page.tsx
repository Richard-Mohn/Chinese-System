'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import GatedPage from '@/components/GatedPage';
import LiveStreamManager, { StreamContext } from '@/components/LiveStreamManager';

// Map business type to stream context
function getStreamContext(businessType?: string): StreamContext {
  switch (businessType) {
    case 'music_artist':
      return 'performance';
    case 'church':
      return 'worship';
    case 'bakery':
      return 'baking';
    case 'restaurant':
    case 'chinese_restaurant':
    case 'food_truck':
      return 'kitchen';
    case 'antique_store':
    case 'retail':
      return 'storefront';
    default:
      return 'general';
  }
}

export default function LiveStreamSetupGated() {
  return (
    <GatedPage feature="live-streaming">
      <LiveStreamSetup />
    </GatedPage>
  );
}

function LiveStreamSetup() {
  const { currentBusiness } = useAuth();
  const businessId = currentBusiness?.id || '';
  const context = getStreamContext(currentBusiness?.type);

  if (!businessId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-zinc-400 font-medium">No business selected.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <LiveStreamManager businessId={businessId} context={context} />
    </div>
  );
}
