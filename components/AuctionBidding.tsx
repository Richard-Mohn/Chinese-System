'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, doc, addDoc, updateDoc, onSnapshot, query, orderBy, where, serverTimestamp, Timestamp, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import {
  FaGavel, FaClock, FaTag, FaUser, FaHistory,
  FaArrowUp, FaTrophy, FaExclamationTriangle,
  FaEye, FaHeart, FaShare, FaImage,
} from 'react-icons/fa';

// ── Types ──

export interface AuctionItem {
  id: string;
  businessId: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  condition: 'mint' | 'excellent' | 'good' | 'fair' | 'poor' | 'as-is';
  startingPrice: number;
  reservePrice?: number;
  currentBid: number;
  bidCount: number;
  highestBidderId?: string;
  highestBidderName?: string;
  startTime: Timestamp;
  endTime: Timestamp;
  status: 'upcoming' | 'active' | 'ended' | 'sold' | 'cancelled';
  buyNowPrice?: number;
  shippingOptions: ('local_pickup' | 'standard' | 'express')[];
  views: number;
  watchers: number;
  createdAt: Timestamp;
}

export interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  bidderName: string;
  amount: number;
  timestamp: Timestamp;
  isAutoBid: boolean;
  maxAutoBid?: number;
}

// ── Condition labels ──
const CONDITION_LABELS: Record<string, { label: string; color: string }> = {
  mint: { label: 'Mint', color: 'bg-emerald-100 text-emerald-800' },
  excellent: { label: 'Excellent', color: 'bg-blue-100 text-blue-800' },
  good: { label: 'Good', color: 'bg-indigo-100 text-indigo-800' },
  fair: { label: 'Fair', color: 'bg-amber-100 text-amber-800' },
  poor: { label: 'Poor', color: 'bg-orange-100 text-orange-800' },
  'as-is': { label: 'As-Is', color: 'bg-red-100 text-red-800' },
};

const CATEGORIES = [
  'Furniture', 'Jewelry', 'Art & Paintings', 'Pottery & Ceramics',
  'Glassware', 'Books & Manuscripts', 'Coins & Currency', 'Stamps',
  'Watches & Clocks', 'Textiles & Rugs', 'Silver & Metalwork',
  'Toys & Games', 'Musical Instruments', 'Tools & Hardware',
  'Lighting', 'Collectibles', 'Other',
];

// ── Countdown Timer ──

function CountdownTimer({ endTime }: { endTime: Timestamp }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const end = endTime.toMillis();
      const diff = end - now;
      if (diff <= 0) { setTimeLeft('Ended'); return; }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setUrgent(diff < 3600000); // Under 1 hour
      setTimeLeft(days > 0 ? `${days}d ${hours}h ${mins}m` : `${hours}h ${mins}m ${secs}s`);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <span className={`font-bold ${urgent ? 'text-red-600 animate-pulse' : 'text-zinc-600'}`}>
      <FaClock className="inline mr-1 text-xs" />{timeLeft}
    </span>
  );
}

// ── Auction Card (for grid listing) ──

export function AuctionCard({
  item,
  onClick,
}: {
  item: AuctionItem;
  onClick?: () => void;
}) {
  const condition = CONDITION_LABELS[item.condition] || CONDITION_LABELS.good;
  const isActive = item.status === 'active';
  const isEnded = item.status === 'ended' || item.status === 'sold';

  return (
    <motion.div
      className={`bg-white rounded-2xl border overflow-hidden cursor-pointer group hover:shadow-lg transition-all ${
        isActive ? 'border-zinc-200' : 'border-zinc-100 opacity-80'
      }`}
      onClick={onClick}
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Image */}
      <div className="relative aspect-square bg-zinc-100 overflow-hidden">
        {item.images[0] ? (
          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-300">
            <FaImage className="text-4xl" />
          </div>
        )}

        {/* Status badge */}
        {isActive && (
          <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Live
          </div>
        )}
        {isEnded && (
          <div className="absolute top-3 left-3 bg-zinc-700 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase">
            {item.status === 'sold' ? 'Sold' : 'Ended'}
          </div>
        )}

        {/* Buy Now badge */}
        {item.buyNowPrice && isActive && (
          <div className="absolute top-3 right-3 bg-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-full">
            Buy Now ${item.buyNowPrice.toLocaleString()}
          </div>
        )}

        {/* Stats overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          <div className="flex items-center gap-3 text-white text-[10px] font-bold">
            <span><FaEye className="inline mr-1" />{item.views}</span>
            <span><FaGavel className="inline mr-1" />{item.bidCount} bids</span>
            <span><FaHeart className="inline mr-1" />{item.watchers}</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="font-bold text-black text-sm truncate mb-1">{item.title}</p>
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${condition.color}`}>{condition.label}</span>
          <span className="text-[10px] text-zinc-400">{item.category}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-400 font-bold uppercase">
              {item.bidCount > 0 ? 'Current Bid' : 'Starting At'}
            </p>
            <p className="text-lg font-black text-black">
              ${(item.currentBid || item.startingPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          {isActive && <CountdownTimer endTime={item.endTime} />}
        </div>
      </div>
    </motion.div>
  );
}

// ── Auction Detail Modal ──

export function AuctionDetail({
  item,
  bids,
  onBid,
  onClose,
  onBuyNow,
}: {
  item: AuctionItem;
  bids: Bid[];
  onBid: (amount: number) => Promise<void>;
  onClose: () => void;
  onBuyNow?: () => Promise<void>;
}) {
  const { user } = useAuth();
  const [bidAmount, setBidAmount] = useState('');
  const [bidding, setBidding] = useState(false);
  const [bidError, setBidError] = useState('');
  const [activeImage, setActiveImage] = useState(0);

  const condition = CONDITION_LABELS[item.condition] || CONDITION_LABELS.good;
  const isActive = item.status === 'active';
  const minBid = (item.currentBid || item.startingPrice) + (item.currentBid >= 100 ? 5 : item.currentBid >= 25 ? 2 : 1);
  const isHighestBidder = user && item.highestBidderId === user.uid;

  const handleBid = async () => {
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount < minBid) {
      setBidError(`Minimum bid is $${minBid.toFixed(2)}`);
      return;
    }
    setBidding(true);
    setBidError('');
    try {
      await onBid(amount);
      setBidAmount('');
    } catch (e) {
      setBidError(e instanceof Error ? e.message : 'Bid failed');
    } finally { setBidding(false); }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Images */}
        <div className="relative aspect-[16/10] bg-zinc-100 rounded-t-3xl overflow-hidden">
          {item.images[activeImage] ? (
            <img src={item.images[activeImage]} alt={item.title} className="w-full h-full object-contain bg-zinc-50" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-300">
              <FaImage className="text-6xl" />
            </div>
          )}
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center font-bold text-black hover:bg-white transition-colors">✕</button>

          {item.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {item.images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${i === activeImage ? 'bg-white' : 'bg-white/40'}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8">
          {/* Title row */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-black text-black mb-2">{item.title}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${condition.color}`}>{condition.label}</span>
                <span className="text-xs text-zinc-400">{item.category}</span>
                <span className="text-xs text-zinc-400">·</span>
                <span className="text-xs text-zinc-400"><FaEye className="inline mr-1" />{item.views} views</span>
                <span className="text-xs text-zinc-400"><FaGavel className="inline mr-1" />{item.bidCount} bids</span>
              </div>
            </div>
            <button className="p-2 text-zinc-300 hover:text-red-500 transition-colors" title="Share">
              <FaShare />
            </button>
          </div>

          {/* Description */}
          <p className="text-sm text-zinc-600 mb-6 whitespace-pre-wrap">{item.description}</p>

          {/* Bidding area */}
          {isActive && (
            <div className="bg-zinc-50 rounded-2xl p-6 mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    {item.bidCount > 0 ? 'Current Bid' : 'Starting Price'}
                  </p>
                  <p className="text-3xl font-black text-black">
                    ${(item.currentBid || item.startingPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  {item.bidCount > 0 && (
                    <p className="text-xs text-zinc-400 mt-1">
                      <FaUser className="inline mr-1" />{item.highestBidderName || 'Anonymous'}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Time Left</p>
                  <div className="text-xl mt-1"><CountdownTimer endTime={item.endTime} /></div>
                </div>
              </div>

              {isHighestBidder && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4 flex items-center gap-2">
                  <FaTrophy className="text-emerald-600" />
                  <span className="text-emerald-800 text-sm font-bold">You&apos;re the highest bidder!</span>
                </div>
              )}

              {user ? (
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">$</span>
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={e => { setBidAmount(e.target.value); setBidError(''); }}
                      placeholder={minBid.toFixed(2)}
                      step="0.01"
                      min={minBid}
                      className="w-full pl-8 pr-4 py-3 border-2 border-zinc-200 rounded-xl font-bold focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleBid}
                    disabled={bidding}
                    className="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0"
                  >
                    {bidding ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FaGavel />
                    )}
                    Place Bid
                  </button>
                </div>
              ) : (
                <p className="text-center text-zinc-500 text-sm font-medium py-2">
                  <a href="/login" className="text-orange-600 font-bold hover:underline">Sign in</a> to place a bid
                </p>
              )}

              {bidError && (
                <p className="text-red-600 text-sm font-bold mt-2 flex items-center gap-1">
                  <FaExclamationTriangle className="text-xs" /> {bidError}
                </p>
              )}

              {/* Buy Now */}
              {item.buyNowPrice && onBuyNow && (
                <button
                  onClick={onBuyNow}
                  className="w-full mt-3 px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                >
                  <FaTag /> Buy Now — ${item.buyNowPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </button>
              )}
            </div>
          )}

          {/* Ended state */}
          {(item.status === 'ended' || item.status === 'sold') && (
            <div className={`rounded-2xl p-6 mb-6 ${item.status === 'sold' ? 'bg-emerald-50 border border-emerald-200' : 'bg-zinc-100'}`}>
              <div className="text-center">
                <FaTrophy className={`text-3xl mx-auto mb-2 ${item.status === 'sold' ? 'text-emerald-600' : 'text-zinc-400'}`} />
                <p className="font-black text-lg text-black mb-1">
                  {item.status === 'sold' ? 'Sold!' : 'Auction Ended'}
                </p>
                {item.currentBid > 0 && (
                  <p className="text-2xl font-black text-black">
                    ${item.currentBid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Shipping */}
          <div className="mb-6">
            <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">Shipping</p>
            <div className="flex gap-2 flex-wrap">
              {item.shippingOptions.map(opt => (
                <span key={opt} className="text-xs font-bold bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full capitalize">
                  {opt.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>

          {/* Bid History */}
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-1">
              <FaHistory /> Bid History ({bids.length})
            </p>
            {bids.length === 0 ? (
              <p className="text-zinc-400 text-sm">No bids yet. Be the first!</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {bids.slice(0, 20).map((bid, i) => (
                  <div key={bid.id} className={`flex items-center justify-between py-2 px-3 rounded-lg ${i === 0 ? 'bg-emerald-50' : 'bg-zinc-50'}`}>
                    <div className="flex items-center gap-2">
                      {i === 0 && <FaTrophy className="text-emerald-500 text-xs" />}
                      <span className="text-sm font-bold text-black">{bid.bidderName}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-black">
                        ${bid.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <p className="text-[10px] text-zinc-400">
                        {bid.timestamp?.toDate?.()?.toLocaleString?.() || ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Auction Browser (for tenant storefront) ──

export function AuctionBrowser({ businessId, businessName }: { businessId: string; businessName?: string }) {
  const { user, MohnMenuUser } = useAuth();
  const [items, setItems] = useState<AuctionItem[]>([]);
  const [selected, setSelected] = useState<AuctionItem | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [filter, setFilter] = useState<'active' | 'upcoming' | 'ended'>('active');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  // Real-time auction items
  useEffect(() => {
    const q = query(
      collection(db, 'businesses', businessId, 'auctions'),
      orderBy('endTime', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as AuctionItem[];
      setItems(data);
      setLoading(false);
    });
    return () => unsub();
  }, [businessId]);

  // Real-time bids for selected item
  useEffect(() => {
    if (!selected) { setBids([]); return; }
    const q = query(
      collection(db, 'businesses', businessId, 'auctions', selected.id, 'bids'),
      orderBy('amount', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      setBids(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Bid[]);
    });
    return () => unsub();
  }, [selected, businessId]);

  const handleBid = async (amount: number) => {
    if (!selected || !user) throw new Error('Please sign in');

    // Add bid
    await addDoc(collection(db, 'businesses', businessId, 'auctions', selected.id, 'bids'), {
      auctionId: selected.id,
      bidderId: user.uid,
      bidderName: MohnMenuUser?.displayName || user.displayName || user.email?.split('@')[0] || 'Anonymous',
      amount,
      timestamp: serverTimestamp(),
      isAutoBid: false,
    });

    // Update auction
    await updateDoc(doc(db, 'businesses', businessId, 'auctions', selected.id), {
      currentBid: amount,
      bidCount: (selected.bidCount || 0) + 1,
      highestBidderId: user.uid,
      highestBidderName: MohnMenuUser?.displayName || user.displayName || 'Anonymous',
    });
  };

  const filtered = items.filter(i => {
    if (filter !== 'all' as string && i.status !== filter) {
      // Map 'ended' filter to include 'sold'
      if (filter === 'ended' && i.status !== 'sold') return false;
      if (filter !== 'ended') return false;
    }
    if (category !== 'all' && i.category !== category) return false;
    return true;
  });

  const usedCategories = [...new Set(items.map(i => i.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-black flex items-center gap-2">
            <FaGavel className="text-orange-600" /> Auctions
            <span className="bg-orange-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Beta</span>
          </h2>
          {businessName && <p className="text-zinc-400 text-sm">{businessName}</p>}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['active', 'upcoming', 'ended'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
              filter === f ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        {usedCategories.length > 1 && (
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="px-4 py-2 border border-zinc-200 rounded-full text-sm font-bold bg-white focus:outline-none"
          >
            <option value="all">All Categories</option>
            {usedCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-zinc-100 animate-pulse">
              <div className="aspect-square bg-zinc-200 rounded-t-2xl" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-2/3 bg-zinc-200 rounded" />
                <div className="h-6 w-1/2 bg-zinc-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-zinc-400">
          <FaGavel className="text-4xl mx-auto mb-3 text-zinc-300" />
          <p className="font-bold mb-1">No {filter} auctions</p>
          <p className="text-sm">Check back later for new items.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(item => (
            <AuctionCard key={item.id} item={item} onClick={() => setSelected(item)} />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <AuctionDetail
            item={selected}
            bids={bids}
            onBid={handleBid}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export { CATEGORIES, CONDITION_LABELS, CountdownTimer };
