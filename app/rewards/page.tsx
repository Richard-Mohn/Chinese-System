'use client';

import { useAuth } from '@/context/AuthContext';
import OGAdsOfferWall from '@/components/OGAdsOfferWall';
import { useMemo } from 'react';

export default function RewardsPage() {
  const { user, MohnMenuUser, currentBusiness, loading } = useAuth();

  const role = useMemo(() => {
    if (MohnMenuUser?.role === 'owner') return 'owner' as const;
    if (MohnMenuUser?.role === 'manager') return 'manager' as const;
    if (MohnMenuUser?.role === 'staff') return 'staff' as const;
    if (MohnMenuUser?.role === 'driver_inhouse' || MohnMenuUser?.role === 'driver_marketplace') return 'driver' as const;
    return 'customer' as const;
  }, [MohnMenuUser?.role]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 pt-28 px-4">
        <div className="max-w-4xl mx-auto bg-white border border-zinc-100 rounded-3xl p-10 text-center">
          <div className="w-8 h-8 border-4 border-zinc-200 border-t-black rounded-full animate-spin mx-auto mb-3" />
          <p className="font-bold text-zinc-500">Loading rewards...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-50 pt-28 px-4">
        <div className="max-w-2xl mx-auto bg-white border border-zinc-100 rounded-3xl p-10 text-center">
          <p className="text-2xl font-black text-black mb-2">Sign in to earn credits</p>
          <p className="text-zinc-500">Create an account, complete offers, and spend your credits at participating stores.</p>
          <a href="/login" className="inline-block mt-5 px-6 py-3 bg-black text-white rounded-full font-bold hover:bg-zinc-800 transition-all">Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-28 pb-12 px-4">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="bg-white border border-zinc-100 rounded-3xl p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">MohnMenu Rewards</p>
          <h1 className="text-4xl font-black tracking-tight text-black mt-1">Earn Ad Credits</h1>
          <p className="text-zinc-500 mt-2">
            Complete offers, earn wallet credits, and spend them at {currentBusiness?.name || 'participating convenience stores'}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white border border-zinc-100 rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">How It Works</p>
            <p className="text-sm font-bold text-black mt-1">1) Complete offers</p>
          </div>
          <div className="bg-white border border-zinc-100 rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Credits</p>
            <p className="text-sm font-bold text-black mt-1">2) Credits hit your wallet</p>
          </div>
          <div className="bg-white border border-zinc-100 rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Spend</p>
            <p className="text-sm font-bold text-black mt-1">3) Use credits at checkout</p>
          </div>
        </div>

        <OGAdsOfferWall
          userId={user.uid}
          source="mohnmenu"
          placement="rewards_page"
          businessId={currentBusiness?.businessId || MohnMenuUser?.activeBusinessId || 'none'}
          role={role}
          maxOffers={12}
        />
      </div>
    </div>
  );
}
