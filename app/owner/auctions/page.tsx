'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy,
  serverTimestamp, Timestamp, getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AuctionItem, CATEGORIES, CONDITION_LABELS, CountdownTimer } from '@/components/AuctionBidding';
import {
  FaGavel, FaPlus, FaTrash, FaEdit, FaPause, FaPlay,
  FaEye, FaTag, FaDollarSign, FaClock, FaSave, FaTrophy,
  FaImage, FaExternalLinkAlt,
} from 'react-icons/fa';

type AuctionForm = {
  title: string;
  description: string;
  images: string[];
  category: string;
  condition: string;
  startingPrice: string;
  reservePrice: string;
  buyNowPrice: string;
  durationDays: string;
  shippingOptions: string[];
};

const EMPTY_FORM: AuctionForm = {
  title: '', description: '', images: [], category: 'Collectibles',
  condition: 'good', startingPrice: '', reservePrice: '', buyNowPrice: '',
  durationDays: '7', shippingOptions: ['local_pickup'],
};

export default function OwnerAuctionsPage() {
  const { user, currentBusiness, loading, isOwner } = useAuth();
  const router = useRouter();
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<AuctionForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'active' | 'ended' | 'all'>('active');
  const [stats, setStats] = useState({ totalBids: 0, totalRevenue: 0, activeCount: 0, soldCount: 0 });
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    if (!loading && (!user || !isOwner())) router.push('/login');
  }, [user, loading, isOwner, router]);

  // Real-time auctions
  useEffect(() => {
    if (!currentBusiness) return;
    const q = query(
      collection(db, 'businesses', currentBusiness.businessId, 'auctions'),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as AuctionItem[];
      setAuctions(data);

      // Compute stats
      let totalBids = 0, totalRevenue = 0, activeCount = 0, soldCount = 0;
      data.forEach(a => {
        totalBids += a.bidCount || 0;
        if (a.status === 'sold') { totalRevenue += a.currentBid || 0; soldCount++; }
        if (a.status === 'active') activeCount++;
      });
      setStats({ totalBids, totalRevenue, activeCount, soldCount });
    });
    return () => unsub();
  }, [currentBusiness]);

  const handleSubmit = async () => {
    if (!currentBusiness || !form.title || !form.startingPrice) return;
    setSaving(true);
    try {
      const now = Timestamp.now();
      const endMs = now.toMillis() + (parseInt(form.durationDays) || 7) * 86400000;

      const auctionData = {
        businessId: currentBusiness.businessId,
        title: form.title,
        description: form.description,
        images: form.images,
        category: form.category,
        condition: form.condition,
        startingPrice: parseFloat(form.startingPrice) || 0,
        reservePrice: form.reservePrice ? parseFloat(form.reservePrice) : null,
        currentBid: 0,
        bidCount: 0,
        buyNowPrice: form.buyNowPrice ? parseFloat(form.buyNowPrice) : null,
        startTime: now,
        endTime: Timestamp.fromMillis(endMs),
        status: 'active',
        shippingOptions: form.shippingOptions,
        views: 0,
        watchers: 0,
        createdAt: serverTimestamp(),
      };

      if (editing) {
        await updateDoc(doc(db, 'businesses', currentBusiness.businessId, 'auctions', editing), auctionData);
      } else {
        await addDoc(collection(db, 'businesses', currentBusiness.businessId, 'auctions'), auctionData);
      }

      setCreating(false);
      setEditing(null);
      setForm(EMPTY_FORM);
    } catch { /* */ }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!currentBusiness || !confirm('Delete this auction? This cannot be undone.')) return;
    await deleteDoc(doc(db, 'businesses', currentBusiness.businessId, 'auctions', id));
  };

  const handleEndAuction = async (a: AuctionItem) => {
    if (!currentBusiness) return;
    const newStatus = a.bidCount > 0 && (!a.reservePrice || a.currentBid >= a.reservePrice) ? 'sold' : 'ended';
    await updateDoc(doc(db, 'businesses', currentBusiness.businessId, 'auctions', a.id), { status: newStatus });
  };

  const startEditing = (a: AuctionItem) => {
    setForm({
      title: a.title,
      description: a.description,
      images: a.images || [],
      category: a.category,
      condition: a.condition,
      startingPrice: a.startingPrice.toString(),
      reservePrice: a.reservePrice?.toString() || '',
      buyNowPrice: a.buyNowPrice?.toString() || '',
      durationDays: '7',
      shippingOptions: a.shippingOptions || ['local_pickup'],
    });
    setEditing(a.id);
    setCreating(true);
  };

  const addImage = () => {
    if (!newImageUrl.trim()) return;
    setForm(f => ({ ...f, images: [...f.images, newImageUrl.trim()] }));
    setNewImageUrl('');
  };

  const removeImage = (idx: number) => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const toggleShipping = (opt: string) => {
    setForm(f => ({
      ...f,
      shippingOptions: f.shippingOptions.includes(opt)
        ? f.shippingOptions.filter(s => s !== opt)
        : [...f.shippingOptions, opt],
    }));
  };

  const filtered = auctions.filter(a => {
    if (tab === 'active') return a.status === 'active' || a.status === 'upcoming';
    if (tab === 'ended') return a.status === 'ended' || a.status === 'sold';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-lg font-bold text-zinc-400 animate-pulse">Loading…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-black tracking-tight text-black">Auctions</h1>
            <span className="bg-orange-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Beta</span>
          </div>
          <p className="text-zinc-400 font-medium">Manage your auction listings. Customers bid in real-time.</p>
        </div>
        <button
          onClick={() => { setCreating(true); setEditing(null); setForm(EMPTY_FORM); }}
          className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-colors"
        >
          <FaPlus className="text-sm" /> New Auction
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Auctions', value: stats.activeCount, color: 'text-emerald-600' },
          { label: 'Total Bids', value: stats.totalBids, color: 'text-indigo-600' },
          { label: 'Items Sold', value: stats.soldCount, color: 'text-blue-600' },
          { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: 'text-orange-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-zinc-100 p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-100 rounded-xl p-1">
        {(['active', 'ended', 'all'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${
              tab === t ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-black'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Auction List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-zinc-400">
          <FaGavel className="text-4xl mx-auto mb-3 text-zinc-300" />
          <p className="font-bold mb-1">No {tab} auctions</p>
          <p className="text-sm">Create your first auction to start accepting bids.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a, i) => {
            const cond = CONDITION_LABELS[a.condition] || CONDITION_LABELS.good;
            return (
              <motion.div
                key={a.id}
                className="bg-white rounded-2xl border border-zinc-100 p-4 flex items-center gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 bg-zinc-100 rounded-xl overflow-hidden shrink-0">
                  {a.images?.[0] ? (
                    <img src={a.images[0]} alt={a.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300">
                      <FaImage className="text-lg" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-black text-sm truncate">{a.title}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cond.color}`}>{cond.label}</span>
                    <span className="text-[10px] text-zinc-400">{a.category}</span>
                    <span className="text-[10px] text-zinc-400">· {a.bidCount} bids</span>
                    {a.status === 'active' && <CountdownTimer endTime={a.endTime} />}
                  </div>
                </div>

                {/* Price */}
                <div className="text-right shrink-0">
                  <p className="text-lg font-black text-black">
                    ${(a.currentBid || a.startingPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <div className={`text-[10px] font-black px-2 py-0.5 rounded-full inline-block ${
                    a.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                    a.status === 'sold' ? 'bg-blue-100 text-blue-700' :
                    'bg-zinc-100 text-zinc-500'
                  }`}>
                    {a.status === 'sold' && <FaTrophy className="inline mr-1" />}
                    {a.status.toUpperCase()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {a.status === 'active' && (
                    <button onClick={() => handleEndAuction(a)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors" title="End auction">
                      <FaPause className="text-xs" />
                    </button>
                  )}
                  <button onClick={() => startEditing(a)} className="p-2 text-zinc-400 hover:text-black transition-colors" title="Edit">
                    <FaEdit className="text-xs" />
                  </button>
                  <button onClick={() => handleDelete(a.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors" title="Delete">
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {creating && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setCreating(false); setEditing(null); }}
          >
            <motion.div
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-2xl font-black text-black mb-6">
                {editing ? 'Edit Auction' : 'Create Auction'}
              </h2>

              <div className="space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Item Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Vintage 1940s Art Deco Table Lamp"
                    className="w-full px-4 py-3 border-2 border-zinc-200 rounded-xl focus:border-orange-500 focus:outline-none font-medium"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Describe the item, its history, dimensions, markings, flaws, etc."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-zinc-200 rounded-xl focus:border-orange-500 focus:outline-none font-medium resize-none"
                  />
                </div>

                {/* Images */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Images</label>
                  {form.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {form.images.map((img, i) => (
                        <div key={i} className="relative aspect-square bg-zinc-100 rounded-lg overflow-hidden group">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                          >✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={e => setNewImageUrl(e.target.value)}
                      placeholder="Image URL"
                      className="flex-1 px-4 py-2 border-2 border-zinc-200 rounded-xl text-sm focus:border-orange-500 focus:outline-none"
                    />
                    <button onClick={addImage} className="px-4 py-2 bg-zinc-100 rounded-xl font-bold text-sm hover:bg-zinc-200 transition-colors">
                      Add
                    </button>
                  </div>
                </div>

                {/* Category + Condition */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Category</label>
                    <select
                      value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-zinc-200 rounded-xl focus:border-orange-500 focus:outline-none font-medium"
                    >
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Condition</label>
                    <select
                      value={form.condition}
                      onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-zinc-200 rounded-xl focus:border-orange-500 focus:outline-none font-medium"
                    >
                      {Object.entries(CONDITION_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Starting Price *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
                      <input
                        type="number"
                        value={form.startingPrice}
                        onChange={e => setForm(f => ({ ...f, startingPrice: e.target.value }))}
                        placeholder="0.00"
                        step="0.01"
                        className="w-full pl-7 pr-3 py-3 border-2 border-zinc-200 rounded-xl focus:border-orange-500 focus:outline-none font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Reserve Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
                      <input
                        type="number"
                        value={form.reservePrice}
                        onChange={e => setForm(f => ({ ...f, reservePrice: e.target.value }))}
                        placeholder="Optional"
                        step="0.01"
                        className="w-full pl-7 pr-3 py-3 border-2 border-zinc-200 rounded-xl focus:border-orange-500 focus:outline-none font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Buy Now Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
                      <input
                        type="number"
                        value={form.buyNowPrice}
                        onChange={e => setForm(f => ({ ...f, buyNowPrice: e.target.value }))}
                        placeholder="Optional"
                        step="0.01"
                        className="w-full pl-7 pr-3 py-3 border-2 border-zinc-200 rounded-xl focus:border-orange-500 focus:outline-none font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Auction Duration</label>
                  <div className="grid grid-cols-4 gap-3">
                    {['1', '3', '7', '14'].map(d => (
                      <button
                        key={d}
                        onClick={() => setForm(f => ({ ...f, durationDays: d }))}
                        className={`py-3 rounded-xl font-bold text-sm transition-all ${
                          form.durationDays === d ? 'bg-orange-600 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                        }`}
                      >
                        {d} {parseInt(d) === 1 ? 'Day' : 'Days'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shipping */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Shipping Options</label>
                  <div className="flex gap-3 flex-wrap">
                    {[
                      { value: 'local_pickup', label: '🏪 Local Pickup' },
                      { value: 'standard', label: '📦 Standard Shipping' },
                      { value: 'express', label: '⚡ Express Shipping' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => toggleShipping(opt.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                          form.shippingOptions.includes(opt.value)
                            ? 'bg-orange-100 text-orange-700 border-2 border-orange-300'
                            : 'bg-zinc-100 text-zinc-600 border-2 border-transparent hover:border-zinc-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => { setCreating(false); setEditing(null); }}
                    className="flex-1 px-6 py-3 border-2 border-zinc-200 text-zinc-600 rounded-full font-bold hover:border-zinc-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={saving || !form.title || !form.startingPrice}
                    className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FaSave />
                    )}
                    {editing ? 'Update Auction' : 'Create & Go Live'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
