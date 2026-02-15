'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { generateSessionId } from '@/lib/offerwall/ogads-tracking';
import type {
  OGAdsOffer,
  OfferwallActorRole,
  OfferwallPlacement,
  OfferwallSource,
} from '@/lib/offerwall/ogads-types';

interface OGAdsOfferWallProps {
  userId: string;
  source?: OfferwallSource;
  placement?: OfferwallPlacement;
  businessId?: string;
  role?: OfferwallActorRole;
  maxOffers?: number;
  className?: string;
}

export default function OGAdsOfferWall({
  userId,
  source = 'mohnmenu',
  placement = 'rewards_page',
  businessId = 'none',
  role = 'customer',
  maxOffers = 12,
  className = '',
}: OGAdsOfferWallProps) {
  const [offers, setOffers] = useState<OGAdsOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef(generateSessionId());

  const fetchOffers = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        userId,
        source,
        placement,
        businessId,
        role,
        sessionId: sessionRef.current,
      });

      const res = await fetch(`/api/offerwall/get-offers?${params.toString()}`);
      const data = await res.json();

      if (data.success && data.offers?.length) {
        setOffers(data.offers.slice(0, maxOffers));
      } else {
        setOffers([]);
        setError(data.error || 'No offers available right now');
      }
    } catch {
      setOffers([]);
      setError('Failed to load offers');
    } finally {
      setLoading(false);
    }
  }, [userId, source, placement, businessId, role, maxOffers]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  if (loading) {
    return (
      <div className={`bg-white border border-zinc-100 rounded-3xl p-5 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-black text-black">Loading offers...</p>
          <div className="w-5 h-5 border-2 border-zinc-200 border-t-black rounded-full animate-spin" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-zinc-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-zinc-100 rounded-3xl p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Offer Wall</p>
          <h3 className="text-xl font-black text-black">Earn Credits</h3>
        </div>
        <button
          onClick={() => {
            sessionRef.current = generateSessionId();
            fetchOffers();
          }}
          className="px-3 py-1.5 bg-zinc-100 text-zinc-700 text-xs rounded-full font-bold hover:bg-zinc-200 transition-all"
        >
          Refresh
        </button>
      </div>

      {offers.length === 0 ? (
        <div className="bg-zinc-50 rounded-2xl p-5 text-center">
          <p className="font-bold text-zinc-600">No offers right now.</p>
          <p className="text-sm text-zinc-400 mt-1">{error || 'Please check back in a few minutes.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {offers.map((offer) => {
            const payout = Number.parseFloat(offer.payout || '0') || 0;
            const points = Math.max(1, Math.floor(payout * 100));

            return (
              <button
                key={offer.offerid}
                onClick={() => window.open(offer.link, '_blank', 'noopener,noreferrer')}
                className="text-left bg-zinc-50 hover:bg-zinc-100 rounded-2xl border border-zinc-200 p-4 transition-all"
              >
                <div className="flex items-start gap-3">
                  {offer.picture ? (
                    <img src={offer.picture} alt="" className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-zinc-200 flex items-center justify-center text-xl">💰</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-black truncate">{offer.name_short || offer.name}</p>
                    <p className="text-xs text-zinc-500 line-clamp-2 mt-0.5">{offer.adcopy || offer.description || 'Complete this offer to earn wallet credits.'}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded-full">
                        {offer.ctype?.toUpperCase() || 'CPA'}
                      </span>
                      <span className="text-xs font-black text-emerald-600">+{points} pts</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
