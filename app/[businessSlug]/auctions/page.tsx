'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { AuctionBrowser } from '@/components/AuctionBidding';

/**
 * Public auction browsing page for a tenant storefront.
 * Accessible at /{businessSlug}/auctions
 * Real-time bidding powered by Firestore onSnapshot.
 */
export default function TenantAuctionsPage() {
  const params = useParams();
  const slug = params?.businessSlug as string;

  // We need the businessId from the slug — the AuctionBrowser accepts businessId
  // For now we pass slug as businessId since tenant pages resolve via slug
  // In production this should do a lookup, but the component listens on the collection path

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <AuctionBrowser businessId={slug} />
      </div>
    </div>
  );
}
