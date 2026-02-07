/**
 * MenuBrowser — Interactive client-side menu browser
 *
 * Category-filtered view (not scroll-to-section).
 * Clicking a category shows only those items.
 * Compact card design with image, price, badges, and optional order stats.
 * Desktop drag-scroll for category pills.
 */

'use client';

import { useState, useRef, useEffect, type MouseEvent as ReactMouseEvent } from 'react';

// ─── Types ──────────────────────────────────────────────────

interface RawMenuItem {
  id: string;
  category: string;
  name: string;
  description: string;
  prices: Record<string, number>;
  image_url?: string;
  isSpicy?: boolean;
  popular?: boolean;
  orderCount?: number;
  reviewCount?: number;
  averageRating?: number;
  stock?: number | null;
  flashSalePrice?: number;
  saleStartTime?: string;
  saleEndTime?: string;
  isLimitedRun?: boolean;
}

interface MenuBrowserProps {
  items: RawMenuItem[];
  orderPath: string;
  orderingEnabled: boolean;
  showStats?: boolean;
}

// ─── Price helpers ──────────────────────────────────────────

const PRICE_LABELS: Record<string, string> = {
  sm: 'Sm', small: 'Sm', lg: 'Lg', large: 'Lg',
  pt: 'Pt', qt: 'Qt', order: '', half: 'Half', full: 'Full',
};

function formatPriceLabel(key: string): string {
  return PRICE_LABELS[key.toLowerCase()] || key.charAt(0).toUpperCase() + key.slice(1);
}

function getLowestPrice(prices: Record<string, number>): number {
  return Math.min(...Object.values(prices));
}

// ─── Flash Sale helpers ─────────────────────────────────────

function isFlashSaleActive(item: RawMenuItem): boolean {
  if (!item.flashSalePrice) return false;
  const now = Date.now();
  if (item.saleStartTime && new Date(item.saleStartTime).getTime() > now) return false;
  if (item.saleEndTime && new Date(item.saleEndTime).getTime() < now) return false;
  return true;
}

function FlashCountdown({ endTime }: { endTime: string }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const update = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Ended'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  if (timeLeft === 'Ended') return null;
  return (
    <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
      {timeLeft} left
    </span>
  );
}

// ─── Component ──────────────────────────────────────────────

export default function MenuBrowser({ items, orderPath, orderingEnabled, showStats = false }: MenuBrowserProps) {
  const categories = [...new Set(items.map(i => i.category))];
  const [activeCategory, setActiveCategory] = useState(categories[0] || '');
  const [search, setSearch] = useState('');

  // ── Desktop drag-scroll ──
  const catScrollRef = useRef<HTMLDivElement>(null);
  const catDragState = useRef({ isDown: false, startX: 0, scrollLeft: 0, hasDragged: false });
  const handleCatMouseDown = (e: ReactMouseEvent) => {
    const el = catScrollRef.current; if (!el) return;
    catDragState.current = { isDown: true, startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft, hasDragged: false };
    el.style.cursor = 'grabbing';
  };
  const handleCatMouseUp = () => {
    catDragState.current.isDown = false;
    if (catScrollRef.current) catScrollRef.current.style.cursor = 'grab';
  };
  const handleCatMouseMove = (e: ReactMouseEvent) => {
    if (!catDragState.current.isDown) return;
    e.preventDefault();
    const el = catScrollRef.current; if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - catDragState.current.startX) * 1.5;
    if (Math.abs(walk) > 3) catDragState.current.hasDragged = true;
    el.scrollLeft = catDragState.current.scrollLeft - walk;
  };

  // ── Filtering ──
  const filteredItems = search.trim()
    ? items.filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.description.toLowerCase().includes(search.toLowerCase()) ||
        i.category.toLowerCase().includes(search.toLowerCase())
      )
    : items.filter(i => i.category === activeCategory);

  return (
    <>
      {/* ── Sticky Category Bar ── */}
      <nav className="sticky top-[65px] z-30 bg-white/95 backdrop-blur-xl border-b border-zinc-200">
        <div className="container mx-auto max-w-6xl px-4">
          {/* Search */}
          <div className="flex items-center gap-3 py-3">
            <div className="relative flex-1 max-w-xs">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search menu..."
                className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black"
                >
                  ✕
                </button>
              )}
            </div>
            <span className="text-xs text-zinc-400 font-medium hidden sm:block">
              {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Category pills with drag-scroll */}
          {!search && categories.length > 1 && (
            <div className="relative pb-3">
              <div
                ref={catScrollRef}
                className="flex gap-2 overflow-x-auto scroll-smooth cursor-grab select-none"
                style={{ scrollbarWidth: 'none' }}
                onMouseDown={handleCatMouseDown}
                onMouseUp={handleCatMouseUp}
                onMouseLeave={handleCatMouseUp}
                onMouseMove={handleCatMouseMove}
              >
                {categories.map(cat => {
                  const count = items.filter(i => i.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => { if (!catDragState.current.hasDragged) setActiveCategory(cat); }}
                      className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap border ${
                        activeCategory === cat
                          ? 'bg-gradient-to-r from-zinc-900 to-zinc-800 text-white border-zinc-700 shadow-lg shadow-black/20 scale-[1.02]'
                          : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 hover:shadow-md hover:scale-[1.02]'
                      }`}
                      style={activeCategory === cat ? {} : {
                        boxShadow: '0 2px 4px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)'
                      }}
                    >
                      {cat}
                      <span className={`ml-1.5 text-xs ${activeCategory === cat ? 'text-zinc-400' : 'text-zinc-400'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="absolute right-0 top-0 bottom-3 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none" />
              <div className="absolute left-0 top-0 bottom-3 w-4 bg-gradient-to-r from-white to-transparent pointer-events-none" />
            </div>
          )}
        </div>
      </nav>

      {/* ── Menu Grid ── */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {!search && (
          <div className="mb-6">
            <h2 className="text-2xl font-black tracking-tight text-black">{activeCategory}</h2>
            <div className="h-1 w-12 bg-black rounded-full mt-2" />
          </div>
        )}

        {search && (
          <p className="text-sm text-zinc-400 mb-6 font-medium">
            {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;
          </p>
        )}

        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-400 font-bold text-lg">No items found</p>
            <p className="text-zinc-300 text-sm mt-1">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => {
              const priceEntries = Object.entries(item.prices);
              const hasSizes = priceEntries.length > 1;
              const lowestPrice = getLowestPrice(item.prices);
              const outOfStock = item.stock !== undefined && item.stock !== null && item.stock <= 0;
              const onSale = isFlashSaleActive(item);

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border overflow-hidden group relative ${
                    outOfStock ? 'opacity-60 border-zinc-100' :
                    onSale ? 'border-orange-200 hover:border-orange-400 ring-1 ring-orange-100' :
                    'border-zinc-100 hover:border-zinc-300'
                  } transition-all`}
                >
                  {/* Image */}
                  {item.image_url ? (
                    <div className="relative h-36 overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
                        {onSale && (
                          <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">🔥 Flash Sale</span>
                        )}
                        {item.isSpicy && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">🌶 Spicy</span>
                        )}
                        {item.popular && (
                          <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">⭐ Popular</span>
                        )}
                        {item.isLimitedRun && (
                          <span className="bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Limited</span>
                        )}
                      </div>
                      {/* Countdown */}
                      {onSale && item.saleEndTime && (
                        <div className="absolute top-2 right-2">
                          <FlashCountdown endTime={item.saleEndTime} />
                        </div>
                      )}
                      {outOfStock && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">Sold Out</span>
                        </div>
                      )}
                      {/* Stock badge */}
                      {item.stock !== undefined && item.stock !== null && item.stock > 0 && item.stock <= 10 && (
                        <span className="absolute bottom-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {item.stock} left
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className={`h-20 flex items-center justify-center ${
                      onSale ? 'bg-gradient-to-br from-orange-50 to-red-50' : 'bg-gradient-to-br from-zinc-50 to-zinc-100'
                    }`}>
                      <span className="text-3xl">{onSale ? '🔥' : '🍽️'}</span>
                    </div>
                  )}

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-black text-sm leading-tight">{item.name}</h3>
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{item.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        {onSale ? (
                          <div>
                            <p className="font-black text-orange-600 text-sm">${item.flashSalePrice!.toFixed(2)}</p>
                            <p className="text-[10px] text-zinc-400 line-through">${lowestPrice.toFixed(2)}</p>
                          </div>
                        ) : (
                          <p className="font-black text-black text-sm">
                            {hasSizes ? `$${lowestPrice.toFixed(2)}+` : `$${lowestPrice.toFixed(2)}`}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Sizes */}
                    {hasSizes && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {priceEntries.map(([key, val]) => (
                          <span key={key} className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full font-bold">
                            {formatPriceLabel(key)} ${val.toFixed(2)}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Stats row (order count, rating) */}
                    {showStats && (
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-zinc-100">
                        {item.orderCount !== undefined && item.orderCount > 0 && (
                          <span className="text-[10px] text-zinc-400 font-medium flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                            {item.orderCount} ordered
                          </span>
                        )}
                        {item.averageRating !== undefined && item.averageRating > 0 && (
                          <span className="text-[10px] text-zinc-400 font-medium flex items-center gap-1">
                            ⭐ {item.averageRating.toFixed(1)}
                            {item.reviewCount ? ` (${item.reviewCount})` : ''}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Order CTA ── */}
      {orderingEnabled && (
        <section className="py-16 px-4 bg-black text-white">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">
              Ready to Order?
            </h2>
            <p className="text-zinc-400 text-lg mb-8">
              Skip the wait. Order online and get it delivered or pick it up fresh.
            </p>
            <a
              href={orderPath}
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-black rounded-full font-bold text-lg hover:bg-zinc-200 transition-all"
            >
              Start Your Order
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </section>
      )}
    </>
  );
}
