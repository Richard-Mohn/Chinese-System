/**
 * Menu Board — /{businessSlug}/menu-board
 * 
 * TV/kiosk-optimized fullscreen menu display.
 * Auto-rotates categories, large fonts, real-time updates via onSnapshot.
 * Designed for wall-mounted TVs, tablets in display mode, or digital signage.
 */

'use client';

import { useEffect, useState, useRef, use } from 'react';
import { collection, query, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface BoardItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  prices: Record<string, number>;
  image_url?: string;
  available?: boolean;
  popular?: boolean;
  isSpicy?: boolean;
  stock?: number | null;
  flashSalePrice?: number;
  saleStartTime?: string;
  saleEndTime?: string;
  isLimitedRun?: boolean;
}

function isFlashSaleActive(item: BoardItem): boolean {
  if (!item.flashSalePrice) return false;
  const now = Date.now();
  if (item.saleStartTime && new Date(item.saleStartTime).getTime() > now) return false;
  if (item.saleEndTime && new Date(item.saleEndTime).getTime() < now) return false;
  return true;
}

function getLowestPrice(prices: Record<string, number>) {
  const vals = Object.values(prices);
  return vals.length ? Math.min(...vals) : 0;
}

export default function MenuBoardPage({
  params,
}: {
  params: Promise<{ businessSlug: string }>;
}) {
  const { businessSlug } = use(params);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [items, setItems] = useState<BoardItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState(0);
  const [clock, setClock] = useState(new Date());
  const rotateRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Resolve slug → businessId
  useEffect(() => {
    (async () => {
      try {
        const { collection: col, query: q, where, getDocs } = await import('firebase/firestore');
        const snap = await getDocs(q(col(db, 'businesses'), where('slug', '==', businessSlug)));
        if (!snap.empty) {
          setBusinessId(snap.docs[0].id);
          setBusinessName(snap.docs[0].data().name || businessSlug);
        }
      } catch {}
    })();
  }, [businessSlug]);

  // Real-time menu listener
  useEffect(() => {
    if (!businessId) return;
    const unsub = onSnapshot(
      collection(db, 'businesses', businessId, 'menuItems'),
      (snap) => {
        const all = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as BoardItem))
          .filter(i => i.available !== false);
        setItems(all);
        const cats = [...new Set(all.map(i => i.category))].sort();
        setCategories(cats);
      }
    );
    return () => unsub();
  }, [businessId]);

  // Auto-rotate categories every 12 seconds
  useEffect(() => {
    if (categories.length <= 1) return;
    rotateRef.current = setInterval(() => {
      setActiveCategory(prev => (prev + 1) % categories.length);
    }, 12000);
    return () => { if (rotateRef.current) clearInterval(rotateRef.current); };
  }, [categories.length]);

  // Clock
  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const currentCat = categories[activeCategory] || '';
  const catItems = items.filter(i => i.category === currentCat);
  const half = Math.ceil(catItems.length / 2);
  const col1 = catItems.slice(0, half);
  const col2 = catItems.slice(half);

  if (!businessId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-bold">Loading Menu Board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden select-none cursor-none">
      {/* Header Bar */}
      <header className="flex items-center justify-between px-8 py-4 bg-black/80 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-black tracking-tight">{businessName}</h1>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">
            LIVE
          </span>
        </div>
        <div className="flex items-center gap-6">
          <p className="text-zinc-400 text-sm font-mono">
            {clock.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <div className="text-right">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Scan to Order</p>
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mt-1">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <rect x="2" y="2" width="12" height="12" rx="2" fill="black" />
                <rect x="22" y="2" width="12" height="12" rx="2" fill="black" />
                <rect x="2" y="22" width="12" height="12" rx="2" fill="black" />
                <rect x="5" y="5" width="6" height="6" rx="1" fill="white" />
                <rect x="25" y="5" width="6" height="6" rx="1" fill="white" />
                <rect x="5" y="25" width="6" height="6" rx="1" fill="white" />
                <rect x="7" y="7" width="2" height="2" fill="black" />
                <rect x="27" y="7" width="2" height="2" fill="black" />
                <rect x="7" y="27" width="2" height="2" fill="black" />
                <rect x="16" y="2" width="4" height="4" rx="1" fill="black" />
                <rect x="16" y="16" width="4" height="4" rx="1" fill="black" />
                <rect x="22" y="22" width="4" height="4" rx="1" fill="black" />
                <rect x="28" y="22" width="6" height="4" rx="1" fill="black" />
                <rect x="22" y="28" width="4" height="6" rx="1" fill="black" />
                <rect x="28" y="30" width="6" height="4" rx="1" fill="black" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 px-8 py-3 bg-zinc-900/80 overflow-x-auto">
        {categories.map((cat, i) => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(i); if (rotateRef.current) clearInterval(rotateRef.current); }}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
              i === activeCategory
                ? 'bg-orange-500 text-white scale-105'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {cat}
          </button>
        ))}
        {/* Progress indicator */}
        {categories.length > 1 && (
          <div className="ml-auto flex items-center gap-1">
            {categories.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === activeCategory ? 'bg-orange-500 w-6' : 'bg-zinc-700'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Menu Items — Two Column Layout */}
      <div className="flex-1 px-8 py-6">
        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
          {[col1, col2].map((column, colIdx) => (
            <div key={colIdx} className="space-y-1">
              {column.map(item => {
                const onSale = isFlashSaleActive(item);
                const price = onSale ? item.flashSalePrice! : getLowestPrice(item.prices);
                const sizes = Object.entries(item.prices);
                const outOfStock = item.stock !== undefined && item.stock !== null && item.stock <= 0;

                return (
                  <div
                    key={item.id}
                    className={`flex items-start gap-4 py-3 px-4 rounded-2xl transition-all ${
                      outOfStock ? 'opacity-40' : onSale ? 'bg-orange-500/10 border border-orange-500/20' : 'hover:bg-zinc-900/50'
                    }`}
                  >
                    {/* Image thumbnail */}
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt=""
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                    )}

                    {/* Name + description */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white truncate">{item.name}</h3>
                        {item.popular && <span className="text-amber-400 text-xs">⭐</span>}
                        {item.isSpicy && <span className="text-red-400 text-xs">🌶</span>}
                        {onSale && <span className="text-orange-400 text-xs font-bold animate-pulse">🔥 SALE</span>}
                        {item.isLimitedRun && <span className="text-purple-400 text-[10px] font-bold uppercase">Ltd</span>}
                        {outOfStock && <span className="text-red-500 text-[10px] font-bold uppercase">Sold Out</span>}
                      </div>
                      {item.description && (
                        <p className="text-zinc-500 text-xs mt-0.5 truncate">{item.description}</p>
                      )}
                      {/* Multiple sizes display */}
                      {sizes.length > 1 && (
                        <div className="flex gap-3 mt-1">
                          {sizes.map(([size, p]) => (
                            <span key={size} className="text-zinc-500 text-[10px]">
                              {size}: ${p.toFixed(2)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0">
                      {onSale ? (
                        <>
                          <p className="text-xl font-black text-orange-400">${price.toFixed(2)}</p>
                          <p className="text-xs text-zinc-600 line-through">${getLowestPrice(item.prices).toFixed(2)}</p>
                        </>
                      ) : (
                        <p className="text-xl font-black text-white">
                          ${price.toFixed(2)}{sizes.length > 1 ? '+' : ''}
                        </p>
                      )}
                      {item.stock !== undefined && item.stock !== null && item.stock > 0 && item.stock <= 5 && (
                        <p className="text-[10px] text-orange-400 font-bold">{item.stock} left</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {catItems.length === 0 && (
          <div className="text-center py-20">
            <p className="text-zinc-500 text-lg">No items in this category</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="px-8 py-3 bg-black/80 border-t border-zinc-800 flex items-center justify-between">
        <p className="text-zinc-600 text-xs">
          Powered by <span className="text-orange-500 font-bold">MohnMenu</span>
        </p>
        <p className="text-zinc-600 text-xs">
          Menu updates in real-time • Prices subject to change
        </p>
      </footer>
    </div>
  );
}
