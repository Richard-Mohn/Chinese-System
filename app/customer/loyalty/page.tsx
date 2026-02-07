'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaGift, FaStar, FaCrown } from 'react-icons/fa';

const tiers = [
  { name: 'Bronze', minPoints: 0, icon: FaStar, color: 'text-amber-600', bg: 'bg-amber-50', perks: ['Free delivery on 5th order', 'Birthday reward'] },
  { name: 'Silver', minPoints: 500, icon: FaStar, color: 'text-zinc-400', bg: 'bg-zinc-50', perks: ['10% off every 3rd order', 'Priority support', 'Double points weekends'] },
  { name: 'Gold', minPoints: 1500, icon: FaCrown, color: 'text-yellow-500', bg: 'bg-yellow-50', perks: ['15% off all orders', 'Free delivery always', 'Exclusive menu items', 'VIP support'] },
];

export default function CustomerLoyaltyPage() {
  const { user, MohnMenuUser, loading, isCustomer } = useAuth();
  const router = useRouter();
  const [points, setPoints] = useState(0);
  const [loadingPoints, setLoadingPoints] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !isCustomer())) {
      router.push('/login');
    }
  }, [user, loading, isCustomer, router]);

  // Fetch loyalty points from Firestore user document
  useEffect(() => {
    const fetchPoints = async () => {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setPoints(userDoc.data()?.loyaltyPoints || 0);
        }
      } catch (err) {
        console.error('Error fetching loyalty points:', err);
      } finally {
        setLoadingPoints(false);
      }
    };
    if (user) fetchPoints();
  }, [user]);

  if (loading || loadingPoints) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-bold text-zinc-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  const currentTier = tiers.reduce((acc, tier) => (points >= tier.minPoints ? tier : acc), tiers[0]);

  return (
    <div className="min-h-screen bg-transparent pt-32 pb-20 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link href="/customer" className="w-10 h-10 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors">
            <FaArrowLeft className="text-sm text-zinc-600" />
          </Link>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-black">
              Rewards<span className="text-orange-600">.</span>
            </h1>
            <p className="text-sm text-zinc-500 font-medium">Earn points with every order</p>
          </div>
        </div>

        {/* Points Display */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-orange-500 to-red-600 rounded-[2.5rem] p-10 text-white mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <FaGift className="text-2xl opacity-80" />
            <span className="text-sm font-bold uppercase tracking-widest opacity-80">Your Points</span>
          </div>
          <p className="text-6xl font-black mb-2">{points}</p>
          <p className="text-white/70 font-medium">
            Current tier: <span className="font-bold text-white">{currentTier.name}</span>
          </p>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[2.5rem] border border-zinc-100 p-10 mb-8"
        >
          <h2 className="text-2xl font-black text-black mb-6">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🛒</span>
              </div>
              <p className="font-bold text-black text-sm">Order</p>
              <p className="text-xs text-zinc-400 mt-1">Earn 1 point per $1 spent</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⭐</span>
              </div>
              <p className="font-bold text-black text-sm">Collect</p>
              <p className="text-xs text-zinc-400 mt-1">Points add up automatically</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🎁</span>
              </div>
              <p className="font-bold text-black text-sm">Redeem</p>
              <p className="text-xs text-zinc-400 mt-1">Unlock discounts & perks</p>
            </div>
          </div>
        </motion.div>

        {/* Tiers */}
        <div className="space-y-4">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className={`bg-white rounded-2xl border p-6 ${
                tier.name === currentTier.name ? 'border-orange-200 ring-2 ring-orange-100' : 'border-zinc-100'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 ${tier.bg} rounded-xl flex items-center justify-center`}>
                  <tier.icon className={`text-lg ${tier.color}`} />
                </div>
                <div>
                  <p className="font-black text-black">{tier.name}</p>
                  <p className="text-xs text-zinc-400 font-medium">{tier.minPoints}+ points</p>
                </div>
                {tier.name === currentTier.name && (
                  <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                    Current
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {tier.perks.map(perk => (
                  <span key={perk} className="text-[11px] font-medium text-zinc-500 bg-zinc-50 px-3 py-1.5 rounded-full">
                    {perk}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
