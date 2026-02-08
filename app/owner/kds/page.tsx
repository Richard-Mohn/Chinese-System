'use client';

import { useAuth } from '@/context/AuthContext';
import GatedPage from '@/components/GatedPage';
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPlus,
  FaTimes,
  FaCog,
  FaExpand,
  FaCompress,
  FaVolumeUp,
  FaVolumeMute,
  FaCheck,
  FaArrowRight,
  FaClock,
  FaFire,
  FaTrash,
  FaEdit,
  FaColumns,
  FaDesktop,
} from 'react-icons/fa';

/* ─── Types ─── */

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  size?: string;
  notes?: string;
  category?: string;   // menu category (e.g., "Signature Cocktails", "Burgers & Sandwiches")
}

interface KDSOrder {
  id: string;
  customerName: string;
  orderType: string;
  items: OrderItem[];
  status: string;
  createdAt: string;
  notes?: string;
  total: number;
  tableNumber?: string;
}

interface KDSStation {
  id: string;
  name: string;
  color: string;
  categories: string[];      // menu categories this station handles
  position: number;
  isExpo: boolean;
}

/* ─── Category Classification ─── */

const DRINK_CATEGORIES = [
  'Signature Cocktails', 'Cocktails', 'Draft Beer', 'Beer', 'Bottled & Canned',
  'Wine', 'Whiskey & Bourbon', 'Shots', 'Non-Alcoholic', 'Drinks',
  'Spirits', 'Mocktails', 'Hot Drinks', 'Coffee', 'Tea',
  'Beverages', 'Smoothies', 'Juice',
];

const FOOD_CATEGORIES = [
  'Appetizers & Shareables', 'Appetizers', 'Wings', 'Burgers & Sandwiches',
  'Burgers', 'Sandwiches', 'Sides', 'Entrees', 'Main Course',
  'Pizza', 'Pasta', 'Salads', 'Soups', 'Desserts', 'Dessert',
  'Seafood', 'Grill', 'Fryer', 'Specials', 'Kids Menu',
  'Breakfast', 'Lunch', 'Dinner', 'Starters', 'Mains',
];

/** Classify an item as 'bar', 'kitchen', or 'unknown' based on its category */
function classifyItem(item: OrderItem): 'bar' | 'kitchen' | 'unknown' {
  const cat = (item.category || '').toLowerCase();
  if (DRINK_CATEGORIES.some(d => d.toLowerCase() === cat)) return 'bar';
  if (FOOD_CATEGORIES.some(f => f.toLowerCase() === cat)) return 'kitchen';
  // Heuristic: check item name for drink-related keywords
  const name = item.name.toLowerCase();
  if (/\b(beer|ale|ipa|lager|stout|cocktail|margarita|martini|shot|wine|whiskey|bourbon|vodka|rum|tequila|gin|spritz|mule|sour|negroni|mojito|daiquiri|bloody mary|mimosa|cider|seltzer|claw)\b/.test(name)) return 'bar';
  return 'unknown';
}

const STATION_COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Teal', value: '#14b8a6' },
];

const DEFAULT_STATIONS: Omit<KDSStation, 'id'>[] = [
  { name: 'Kitchen', color: '#f97316', categories: [], position: 0, isExpo: false },
  { name: 'Bar', color: '#a855f7', categories: [], position: 1, isExpo: false },
  { name: 'Expo', color: '#22c55e', categories: [], position: 2, isExpo: true },
];

/* ─── Time helpers ─── */
function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`;
}

function urgencyLevel(dateStr: string): 'normal' | 'warning' | 'urgent' {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000 / 60;
  if (diff > 20) return 'urgent';
  if (diff > 10) return 'warning';
  return 'normal';
}

const URGENCY_STYLES = {
  normal: 'border-zinc-200',
  warning: 'border-amber-400 shadow-amber-100',
  urgent: 'border-red-500 shadow-red-100 animate-pulse',
};

/* ─── Sound helper ─── */
function playChime() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const play = (freq: number, start: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.25, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + dur);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur);
    };
    play(660, 0, 0.12);
    play(880, 0.12, 0.15);
  } catch { /* noop */ }
}

function playBump() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 440;
    osc.type = 'triangle';
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch { /* noop */ }
}

/* ─── Main Component ─── */
export default function KDSPageGated() {
  return (
    <GatedPage feature="kds">
      <KDSPage />
    </GatedPage>
  );
}

function KDSPage() {
  const { currentBusiness, MohnMenuUser } = useAuth();
  const [orders, setOrders] = useState<KDSOrder[]>([]);
  const [stations, setStations] = useState<KDSStation[]>([]);
  const [activeStation, setActiveStation] = useState<string | null>(null); // null = all stations view
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [prevOrderCount, setPrevOrderCount] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track completed items per order per station
  // Key: `${orderId}::${stationId}::${itemIndex}`
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  // Track bumped orders per station
  // Key: `${orderId}::${stationId}`
  const [bumpedOrders, setBumpedOrders] = useState<Set<string>>(new Set());

  /* ─── Load stations ─── */
  useEffect(() => {
    if (!currentBusiness?.businessId) return;

    const stationsRef = collection(db, 'businesses', currentBusiness.businessId, 'kdsStations');
    const q = query(stationsRef, orderBy('position', 'asc'));

    const unsub = onSnapshot(q, async (snap) => {
      if (snap.empty) {
        // Seed default stations
        for (const st of DEFAULT_STATIONS) {
          await addDoc(stationsRef, st);
        }
        return; // onSnapshot will fire again
      }
      const fetched: KDSStation[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as KDSStation));
      setStations(fetched);
    });

    return () => unsub();
  }, [currentBusiness?.businessId]);

  /* ─── Role-aware auto-station selection ─── */
  // Bartender → auto-focus on "Bar" station
  // Server → stays on "All" view to see full order pipeline
  // Owner → stays on "All" view
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  useEffect(() => {
    if (hasAutoSelected || stations.length === 0) return;
    const userEmail = MohnMenuUser?.email || '';
    const isBartender = userEmail.includes('bartender');
    if (isBartender) {
      const barStation = stations.find(s => s.name.toLowerCase() === 'bar');
      if (barStation) {
        setActiveStation(barStation.id);
      }
    }
    setHasAutoSelected(true);
  }, [stations, MohnMenuUser?.email, hasAutoSelected]);

  /* ─── Load orders (active: pending → ready) ─── */
  useEffect(() => {
    if (!currentBusiness?.businessId) return;

    const ordersRef = collection(db, 'businesses', currentBusiness.businessId, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));

    const unsub = onSnapshot(q, (snap) => {
      const activeStatuses = ['pending', 'confirmed', 'preparing', 'ready'];
      const fetched: KDSOrder[] = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as KDSOrder))
        .filter(o => activeStatuses.includes(o.status));

      // New order detection
      if (prevOrderCount !== null && fetched.length > prevOrderCount && soundEnabled) {
        playChime();
      }
      setPrevOrderCount(fetched.length);

      setOrders(fetched);
      setLoading(false);
    });

    return () => unsub();
  }, [currentBusiness?.businessId, soundEnabled, prevOrderCount]);

  /* ─── Fullscreen ─── */
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  /* ─── Item completion toggle ─── */
  const toggleItem = (orderId: string, stationId: string, itemIdx: number) => {
    const key = `${orderId}::${stationId}::${itemIdx}`;
    setCompletedItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  /* ─── Bump order from station ─── */
  const bumpOrder = async (orderId: string, stationId: string) => {
    if (!currentBusiness?.businessId) return;
    const key = `${orderId}::${stationId}`;
    setBumpedOrders(prev => new Set(prev).add(key));
    if (soundEnabled) playBump();

    // Find current station's position
    const station = stations.find(s => s.id === stationId);
    if (!station) return;

    // If this is the last station (expo or highest position), mark order as ready
    const nextStation = stations.find(s => s.position === station.position + 1);
    if (!nextStation || station.isExpo) {
      // All stations done — advance order status
      const order = orders.find(o => o.id === orderId);
      if (order) {
        const orderRef = doc(db, 'businesses', currentBusiness.businessId, 'orders', orderId);
        const nextStatus = order.status === 'pending' ? 'confirmed'
          : order.status === 'confirmed' ? 'preparing'
          : order.status === 'preparing' ? 'ready'
          : 'ready';
        await updateDoc(orderRef, { status: nextStatus, updatedAt: new Date().toISOString() });
      }
    }
  };

  /* ─── Check if order is visible at station ─── */
  const isOrderVisibleAtStation = (order: KDSOrder, station: KDSStation): boolean => {
    const key = `${order.id}::${station.id}`;
    if (bumpedOrders.has(key)) return false;

    // Don't show order at station if it has no relevant items
    const stationItems = getItemsForStation(order, station);
    if (!station.isExpo && stationItems.length === 0) return false;

    // Expo station sees orders that have been bumped from all non-expo stations
    if (station.isExpo) {
      const nonExpoStations = stations.filter(s => !s.isExpo);
      // Only show if at least one non-expo station had items & has been bumped
      const relevantStations = nonExpoStations.filter(s => getItemsForStation(order, s).length > 0);
      if (relevantStations.length === 0) return false;
      return relevantStations.every(s => bumpedOrders.has(`${order.id}::${s.id}`));
    }

    // Non-expo stations: show immediately (they work in parallel, not sequential)
    // Kitchen and Bar both start working on the same order simultaneously
    return true;
  };

  /* ─── Cross-station progress for an order ─── */
  const getOrderProgress = (order: KDSOrder): { station: string; color: string; done: boolean; itemCount: number }[] => {
    return stations
      .filter(s => !s.isExpo)
      .map(s => {
        const items = getItemsForStation(order, s);
        if (items.length === 0) return null;
        const done = bumpedOrders.has(`${order.id}::${s.id}`);
        return { station: s.name, color: s.color, done, itemCount: items.length };
      })
      .filter(Boolean) as { station: string; color: string; done: boolean; itemCount: number }[];
  };

  /* ─── Get items for a station ─── */
  const getItemsForStation = (order: KDSOrder, station: KDSStation): OrderItem[] => {
    // Expo sees everything
    if (station.isExpo) return order.items;

    // If station has explicit category filters, use those
    if (station.categories.length > 0) {
      return order.items.filter(item => {
        const cat = (item.category || '').toLowerCase();
        return station.categories.some(sc => sc.toLowerCase() === cat);
      });
    }

    // Auto-classify by station name
    const stationName = station.name.toLowerCase();
    const isBarStation = stationName.includes('bar') || stationName.includes('drink') || stationName.includes('cocktail') || stationName.includes('beverage');
    const isKitchenStation = stationName.includes('kitchen') || stationName.includes('grill') || stationName.includes('fryer') || stationName.includes('food') || stationName.includes('cook');

    if (isBarStation) {
      // Bar station gets drink items
      const drinkItems = order.items.filter(item => classifyItem(item) === 'bar');
      return drinkItems.length > 0 ? drinkItems : order.items; // Fallback to all if no drinks found
    }
    if (isKitchenStation) {
      // Kitchen station gets food items
      const foodItems = order.items.filter(item => {
        const cls = classifyItem(item);
        return cls === 'kitchen' || cls === 'unknown'; // Kitchen gets unknown items too
      });
      return foodItems.length > 0 ? foodItems : order.items;
    }

    // Default: show all items
    return order.items;
  };

  /* ─── Check if all items are completed at a station ─── */
  const allItemsCompleted = (orderId: string, stationId: string, items: OrderItem[]): boolean => {
    return items.every((_, idx) => completedItems.has(`${orderId}::${stationId}::${idx}`));
  };

  /* ─── Station management ─── */
  const addStation = async (name: string, color: string, isExpo: boolean) => {
    if (!currentBusiness?.businessId) return;
    const maxPos = Math.max(...stations.map(s => s.position), -1);
    const stationsRef = collection(db, 'businesses', currentBusiness.businessId, 'kdsStations');
    await addDoc(stationsRef, {
      name,
      color,
      categories: [],
      position: isExpo ? maxPos + 1 : maxPos,
      isExpo,
    });
  };

  const deleteStation = async (stationId: string) => {
    if (!currentBusiness?.businessId) return;
    if (stations.length <= 1) return; // Must keep at least 1
    const ref = doc(db, 'businesses', currentBusiness.businessId, 'kdsStations', stationId);
    await deleteDoc(ref);
  };

  const updateStation = async (stationId: string, updates: Partial<KDSStation>) => {
    if (!currentBusiness?.businessId) return;
    const ref = doc(db, 'businesses', currentBusiness.businessId, 'kdsStations', stationId);
    await updateDoc(ref, updates);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 font-bold text-sm">Loading Kitchen Display...</p>
        </div>
      </div>
    );
  }

  // Detect role for display context
  const userEmail = MohnMenuUser?.email || '';
  const isStaffUser = MohnMenuUser?.role === 'staff';
  const isBartenderUser = userEmail.includes('bartender');
  const isServerUser = userEmail.includes('server');
  const roleLabel = isBartenderUser ? 'Bartender' : isServerUser ? 'Server' : isStaffUser ? 'Staff' : 'Manager';

  return (
    <div ref={containerRef} className={`${isFullscreen ? 'bg-zinc-900 p-4' : ''}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className={`text-3xl font-black tracking-tight ${isFullscreen ? 'text-white' : 'text-black'}`}>
            {isBartenderUser ? 'Bar Display' : isServerUser ? 'Server Display' : 'Kitchen Display'}<span className="text-orange-500">.</span>
          </h1>
          <p className={`text-sm font-medium mt-1 ${isFullscreen ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {orders.length} active {orders.length === 1 ? 'order' : 'orders'} • {stations.length} {stations.length === 1 ? 'station' : 'stations'}
            {isStaffUser && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                isBartenderUser ? 'bg-purple-100 text-purple-700' : isServerUser ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-600'
              }`}>
                {roleLabel}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Station Filter Tabs */}
          <div className={`flex items-center gap-1 p-1 rounded-xl ${isFullscreen ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
            <button
              onClick={() => setActiveStation(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeStation === null
                  ? 'bg-white text-black shadow-sm'
                  : isFullscreen ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-black'
              }`}
            >
              <FaColumns className="inline mr-1.5" />All
            </button>
            {stations.map(station => (
              <button
                key={station.id}
                onClick={() => setActiveStation(station.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeStation === station.id
                    ? 'text-white shadow-sm'
                    : isFullscreen ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-black'
                }`}
                style={activeStation === station.id ? { backgroundColor: station.color } : undefined}
              >
                {station.name}
              </button>
            ))}
          </div>

          {/* Controls */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl transition-colors ${
              isFullscreen ? 'bg-zinc-800 text-zinc-400 hover:text-white' : 'bg-zinc-100 text-zinc-500 hover:text-black'
            }`}
            title={soundEnabled ? 'Mute alerts' : 'Enable alerts'}
          >
            {soundEnabled ? <FaVolumeUp className="text-sm" /> : <FaVolumeMute className="text-sm" />}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2.5 rounded-xl transition-colors ${
              isFullscreen ? 'bg-zinc-800 text-zinc-400 hover:text-white' : 'bg-zinc-100 text-zinc-500 hover:text-black'
            }`}
            title="Station settings"
          >
            <FaCog className="text-sm" />
          </button>
          <button
            onClick={toggleFullscreen}
            className={`p-2.5 rounded-xl transition-colors ${
              isFullscreen ? 'bg-zinc-800 text-zinc-400 hover:text-white' : 'bg-zinc-100 text-zinc-500 hover:text-black'
            }`}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen (tablet mode)'}
          >
            {isFullscreen ? <FaCompress className="text-sm" /> : <FaExpand className="text-sm" />}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <StationSettings
            stations={stations}
            onAdd={addStation}
            onDelete={deleteStation}
            onUpdate={updateStation}
            onClose={() => setShowSettings(false)}
            isFullscreen={isFullscreen}
          />
        )}
      </AnimatePresence>

      {/* KDS Grid */}
      {activeStation ? (
        /* Single station view */
        <SingleStationView
          station={stations.find(s => s.id === activeStation)!}
          orders={orders}
          completedItems={completedItems}
          isOrderVisible={isOrderVisibleAtStation}
          getItems={getItemsForStation}
          allCompleted={allItemsCompleted}
          onToggleItem={toggleItem}
          onBump={bumpOrder}
          isFullscreen={isFullscreen}
          getOrderProgress={getOrderProgress}
        />
      ) : (
        /* Multi-station columns */
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(stations.length, 4)}, 1fr)` }}>
          {stations.map(station => (
            <StationColumn
              key={station.id}
              station={station}
              orders={orders}
              completedItems={completedItems}
              isOrderVisible={isOrderVisibleAtStation}
              getItems={getItemsForStation}
              allCompleted={allItemsCompleted}
              onToggleItem={toggleItem}
              onBump={bumpOrder}
              onFocus={() => setActiveStation(station.id)}
              isFullscreen={isFullscreen}
              getOrderProgress={getOrderProgress}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {orders.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-32"
        >
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 ${isFullscreen ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
            <FaDesktop className={`text-3xl ${isFullscreen ? 'text-zinc-600' : 'text-zinc-300'}`} />
          </div>
          <h2 className={`text-2xl font-black mb-2 ${isFullscreen ? 'text-white' : 'text-black'}`}>
            No Active Orders
          </h2>
          <p className={`font-medium ${isFullscreen ? 'text-zinc-500' : 'text-zinc-400'}`}>
            New orders will appear here in real-time.
          </p>
        </motion.div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Station Column (Multi-station view)
   ═══════════════════════════════════════════════ */
interface StationColumnProps {
  station: KDSStation;
  orders: KDSOrder[];
  completedItems: Set<string>;
  isOrderVisible: (order: KDSOrder, station: KDSStation) => boolean;
  getItems: (order: KDSOrder, station: KDSStation) => OrderItem[];
  allCompleted: (orderId: string, stationId: string, items: OrderItem[]) => boolean;
  onToggleItem: (orderId: string, stationId: string, idx: number) => void;
  onBump: (orderId: string, stationId: string) => void;
  onFocus: () => void;
  isFullscreen: boolean;
  getOrderProgress: (order: KDSOrder) => { station: string; color: string; done: boolean; itemCount: number }[];
}

function StationColumn({ station, orders, completedItems, isOrderVisible, getItems, allCompleted, onToggleItem, onBump, onFocus, isFullscreen, getOrderProgress }: StationColumnProps) {
  const visibleOrders = orders.filter(o => isOrderVisible(o, station));

  return (
    <div className="flex flex-col min-h-[400px]">
      {/* Station Header */}
      <div
        className="rounded-t-xl px-4 py-3 flex items-center justify-between cursor-pointer"
        style={{ backgroundColor: station.color }}
        onClick={onFocus}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-white font-black text-sm uppercase tracking-wider">{station.name}</h3>
          {station.isExpo && <span className="text-white/70 text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">EXPO</span>}
        </div>
        <span className="text-white/80 text-xs font-bold">{visibleOrders.length} tickets</span>
      </div>

      {/* Order Cards */}
      <div className={`flex-1 rounded-b-xl p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-250px)] ${isFullscreen ? 'bg-zinc-800' : 'bg-zinc-50'}`}>
        <AnimatePresence>
          {visibleOrders.map(order => {
            const items = getItems(order, station);
            const allDone = allCompleted(order.id, station.id, items);
            const urgency = urgencyLevel(order.createdAt);

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: 100 }}
                className={`rounded-xl border-2 overflow-hidden transition-all ${URGENCY_STYLES[urgency]} ${
                  isFullscreen ? 'bg-zinc-900' : 'bg-white'
                } ${allDone ? 'ring-2 ring-emerald-400' : ''}`}
              >
                {/* Ticket Header */}
                <div className={`px-3 py-2 flex items-center justify-between border-b ${isFullscreen ? 'border-zinc-700' : 'border-zinc-100'}`}>
                  <div>
                    <span className={`font-black text-sm ${isFullscreen ? 'text-white' : 'text-black'}`}>
                      #{order.id.slice(-4).toUpperCase()}
                    </span>
                    <span className={`text-[10px] font-bold ml-2 ${isFullscreen ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      {order.orderType === 'delivery' ? '🚗 Delivery' : '🏪 Pickup'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {urgency === 'urgent' && <FaFire className="text-red-500 text-xs" />}
                    <FaClock className={`text-[10px] ${isFullscreen ? 'text-zinc-500' : 'text-zinc-400'}`} />
                    <span className={`text-[10px] font-bold ${
                      urgency === 'urgent' ? 'text-red-500' : urgency === 'warning' ? 'text-amber-500' : isFullscreen ? 'text-zinc-500' : 'text-zinc-400'
                    }`}>
                      {timeAgo(order.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Cross-Station Progress */}
                {(() => {
                  const progress = getOrderProgress(order);
                  if (progress.length > 1) {
                    return (
                      <div className={`px-3 py-1.5 flex items-center gap-1 border-b ${isFullscreen ? 'border-zinc-700 bg-zinc-800/50' : 'border-zinc-50 bg-zinc-25'}`}>
                        {progress.map((p, i) => (
                          <div key={i} className="flex items-center gap-1" title={`${p.station}: ${p.done ? 'Done' : 'In progress'}`}>
                            <div
                              className={`w-2 h-2 rounded-full transition-all ${p.done ? 'opacity-100' : 'opacity-40'}`}
                              style={{ backgroundColor: p.color }}
                            />
                            <span className={`text-[9px] font-bold ${p.done ? (isFullscreen ? 'text-zinc-300' : 'text-zinc-600') : (isFullscreen ? 'text-zinc-600' : 'text-zinc-300')}`}>
                              {p.station}
                            </span>
                            {i < progress.length - 1 && <span className={`text-[8px] mx-0.5 ${isFullscreen ? 'text-zinc-700' : 'text-zinc-200'}`}>→</span>}
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Items */}
                <div className="px-3 py-2 space-y-1">
                  {items.map((item, idx) => {
                    const done = completedItems.has(`${order.id}::${station.id}::${idx}`);
                    return (
                      <button
                        key={idx}
                        onClick={() => onToggleItem(order.id, station.id, idx)}
                        className={`w-full text-left flex items-center gap-2 py-1.5 px-2 rounded-lg transition-all ${
                          done
                            ? 'bg-emerald-50 line-through opacity-60'
                            : isFullscreen ? 'hover:bg-zinc-800' : 'hover:bg-zinc-50'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                          done ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-300'
                        }`}>
                          {done && <FaCheck className="text-white text-[8px]" />}
                        </div>
                        <span className={`font-bold text-sm flex-1 ${isFullscreen ? 'text-white' : 'text-black'}`}>
                          {item.quantity}x {item.name}
                        </span>
                        {item.size && (
                          <span className={`text-[10px] font-bold ${isFullscreen ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            {item.size}
                          </span>
                        )}
                      </button>
                    );
                  })}
                  {order.notes && (
                    <p className={`text-[11px] font-medium italic px-2 pt-1 ${isFullscreen ? 'text-amber-400' : 'text-amber-600'}`}>
                      📝 {order.notes}
                    </p>
                  )}
                </div>

                {/* Bump Button */}
                <button
                  onClick={() => onBump(order.id, station.id)}
                  className={`w-full py-2.5 font-black text-xs uppercase tracking-widest transition-all ${
                    allDone
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : isFullscreen
                        ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                        : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-black'
                  }`}
                >
                  {allDone ? (
                    <><FaCheck className="inline mr-1.5" />Bump</>
                  ) : (
                    <><FaArrowRight className="inline mr-1.5" />Bump →</>
                  )}
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {visibleOrders.length === 0 && (
          <div className={`text-center py-10 ${isFullscreen ? 'text-zinc-600' : 'text-zinc-300'}`}>
            <p className="text-xs font-bold uppercase tracking-widest">Clear</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Single Station View (Focused / Tablet mode)
   ═══════════════════════════════════════════════ */
interface SingleStationViewProps {
  station: KDSStation;
  orders: KDSOrder[];
  completedItems: Set<string>;
  isOrderVisible: (order: KDSOrder, station: KDSStation) => boolean;
  getItems: (order: KDSOrder, station: KDSStation) => OrderItem[];
  allCompleted: (orderId: string, stationId: string, items: OrderItem[]) => boolean;
  onToggleItem: (orderId: string, stationId: string, idx: number) => void;
  onBump: (orderId: string, stationId: string) => void;
  isFullscreen: boolean;
  getOrderProgress: (order: KDSOrder) => { station: string; color: string; done: boolean; itemCount: number }[];
}

function SingleStationView({ station, orders, completedItems, isOrderVisible, getItems, allCompleted, onToggleItem, onBump, isFullscreen, getOrderProgress }: SingleStationViewProps) {
  const visibleOrders = orders.filter(o => isOrderVisible(o, station));

  return (
    <div>
      {/* Station Header Bar */}
      <div className="rounded-xl px-5 py-3 mb-4 flex items-center justify-between" style={{ backgroundColor: station.color }}>
        <div className="flex items-center gap-3">
          <h2 className="text-white font-black text-lg uppercase tracking-wider">{station.name}</h2>
          {station.isExpo && <span className="text-white/70 text-xs font-bold bg-white/20 px-3 py-1 rounded-full">EXPO</span>}
        </div>
        <span className="text-white/80 font-bold">{visibleOrders.length} tickets</span>
      </div>

      {/* Cards grid — bigger for single station / tablet */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {visibleOrders.map(order => {
            const items = getItems(order, station);
            const allDone = allCompleted(order.id, station.id, items);
            const urgency = urgencyLevel(order.createdAt);

            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, x: 200 }}
                className={`rounded-2xl border-2 overflow-hidden ${URGENCY_STYLES[urgency]} ${
                  isFullscreen ? 'bg-zinc-900' : 'bg-white'
                } ${allDone ? 'ring-2 ring-emerald-400' : ''}`}
              >
                {/* Header */}
                <div className={`px-4 py-3 flex items-center justify-between border-b ${isFullscreen ? 'border-zinc-700' : 'border-zinc-100'}`}>
                  <div>
                    <span className={`font-black text-lg ${isFullscreen ? 'text-white' : 'text-black'}`}>
                      #{order.id.slice(-4).toUpperCase()}
                    </span>
                    <p className={`text-xs font-bold ${isFullscreen ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      {order.customerName} • {order.orderType === 'delivery' ? '🚗 Delivery' : '🏪 Pickup'}
                    </p>
                  </div>
                  <div className="text-right">
                    {urgency === 'urgent' && <FaFire className="text-red-500 inline mr-1" />}
                    <span className={`text-sm font-black ${
                      urgency === 'urgent' ? 'text-red-500' : urgency === 'warning' ? 'text-amber-500' : isFullscreen ? 'text-zinc-400' : 'text-zinc-500'
                    }`}>
                      {timeAgo(order.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Cross-Station Progress */}
                {(() => {
                  const progress = getOrderProgress(order);
                  if (progress.length > 1) {
                    return (
                      <div className={`px-4 py-2 flex items-center gap-2 border-b ${isFullscreen ? 'border-zinc-700 bg-zinc-800/50' : 'border-zinc-50 bg-zinc-50/50'}`}>
                        {progress.map((p, i) => (
                          <div key={i} className="flex items-center gap-1.5" title={`${p.station}: ${p.done ? 'Done ✓' : `${p.itemCount} items in progress`}`}>
                            <div
                              className={`w-2.5 h-2.5 rounded-full transition-all ${p.done ? 'opacity-100 scale-110' : 'opacity-40'}`}
                              style={{ backgroundColor: p.color }}
                            />
                            <span className={`text-[10px] font-bold ${p.done ? (isFullscreen ? 'text-zinc-300' : 'text-zinc-600') : (isFullscreen ? 'text-zinc-600' : 'text-zinc-300')}`}>
                              {p.station} {p.done && '✓'}
                            </span>
                            {i < progress.length - 1 && <span className={`text-[9px] mx-0.5 ${isFullscreen ? 'text-zinc-700' : 'text-zinc-200'}`}>→</span>}
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Items */}
                <div className="px-4 py-3 space-y-1.5">
                  {items.map((item, idx) => {
                    const done = completedItems.has(`${order.id}::${station.id}::${idx}`);
                    return (
                      <button
                        key={idx}
                        onClick={() => onToggleItem(order.id, station.id, idx)}
                        className={`w-full text-left flex items-center gap-3 py-2 px-3 rounded-xl transition-all ${
                          done
                            ? 'bg-emerald-50 line-through opacity-60'
                            : isFullscreen ? 'hover:bg-zinc-800' : 'hover:bg-zinc-50'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                          done ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-300'
                        }`}>
                          {done && <FaCheck className="text-white text-[10px]" />}
                        </div>
                        <span className={`font-bold flex-1 ${isFullscreen ? 'text-white' : 'text-black'}`}>
                          {item.quantity}x {item.name}
                        </span>
                        {item.size && (
                          <span className={`text-xs font-bold ${isFullscreen ? 'text-zinc-500' : 'text-zinc-400'}`}>{item.size}</span>
                        )}
                        {item.notes && (
                          <span className={`text-xs italic ${isFullscreen ? 'text-amber-400' : 'text-amber-600'}`}>📝</span>
                        )}
                      </button>
                    );
                  })}
                  {order.notes && (
                    <p className={`text-xs font-medium italic px-3 pt-1 ${isFullscreen ? 'text-amber-400' : 'text-amber-600'}`}>
                      📝 {order.notes}
                    </p>
                  )}
                </div>

                {/* Bump */}
                <button
                  onClick={() => onBump(order.id, station.id)}
                  className={`w-full py-3.5 font-black text-sm uppercase tracking-widest transition-all ${
                    allDone
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : isFullscreen
                        ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                        : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-black'
                  }`}
                >
                  {allDone ? (
                    <><FaCheck className="inline mr-1.5" />Bump — Done</>
                  ) : (
                    <><FaArrowRight className="inline mr-1.5" />Bump →</>
                  )}
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {visibleOrders.length === 0 && (
        <div className={`text-center py-20 ${isFullscreen ? 'text-zinc-600' : 'text-zinc-300'}`}>
          <p className="text-sm font-bold uppercase tracking-widest">All Clear ✓</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Station Settings Panel
   ═══════════════════════════════════════════════ */
interface StationSettingsProps {
  stations: KDSStation[];
  onAdd: (name: string, color: string, isExpo: boolean) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<KDSStation>) => void;
  onClose: () => void;
  isFullscreen: boolean;
}

function StationSettings({ stations, onAdd, onDelete, onUpdate, onClose, isFullscreen }: StationSettingsProps) {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(STATION_COLORS[0].value);
  const [newIsExpo, setNewIsExpo] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAdd(newName.trim(), newColor, newIsExpo);
    setNewName('');
    setNewIsExpo(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-6 overflow-hidden"
    >
      <div className={`rounded-2xl border p-6 ${isFullscreen ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-100'}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`font-black text-lg ${isFullscreen ? 'text-white' : 'text-black'}`}>
            Station Setup
          </h3>
          <button onClick={onClose} className={`p-2 rounded-lg ${isFullscreen ? 'hover:bg-zinc-700 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'}`}>
            <FaTimes />
          </button>
        </div>

        {/* Existing Stations */}
        <div className="space-y-2 mb-6">
          {stations.map((station, idx) => (
            <div key={station.id} className={`flex items-center gap-3 p-3 rounded-xl ${isFullscreen ? 'bg-zinc-900' : 'bg-zinc-50'}`}>
              <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: station.color }} />
              
              {editingId === station.id ? (
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onBlur={() => { onUpdate(station.id, { name: editName }); setEditingId(null); }}
                  onKeyDown={e => { if (e.key === 'Enter') { onUpdate(station.id, { name: editName }); setEditingId(null); } }}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-bold border focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    isFullscreen ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-200 text-black'
                  }`}
                  autoFocus
                />
              ) : (
                <span className={`flex-1 font-bold text-sm ${isFullscreen ? 'text-white' : 'text-black'}`}>
                  {station.name}
                  {station.isExpo && <span className="ml-2 text-[10px] font-black text-orange-500 uppercase">Expo</span>}
                </span>
              )}

              <span className={`text-[10px] font-bold ${isFullscreen ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Pos {station.position}
              </span>

              <button
                onClick={() => { setEditingId(station.id); setEditName(station.name); }}
                className={`p-1.5 rounded-lg ${isFullscreen ? 'text-zinc-500 hover:text-white' : 'text-zinc-400 hover:text-black'}`}
              >
                <FaEdit className="text-xs" />
              </button>

              {/* Color picker */}
              <div className="flex gap-1">
                {STATION_COLORS.slice(0, 4).map(c => (
                  <button
                    key={c.value}
                    onClick={() => onUpdate(station.id, { color: c.value })}
                    className={`w-4 h-4 rounded-full transition-transform ${station.color === c.value ? 'scale-125 ring-2 ring-offset-1 ring-zinc-400' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>

              <button
                onClick={() => onDelete(station.id)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 transition-colors"
                disabled={stations.length <= 1}
              >
                <FaTrash className="text-xs" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Station */}
        <div className={`p-4 rounded-xl border-2 border-dashed ${isFullscreen ? 'border-zinc-700' : 'border-zinc-200'}`}>
          <p className={`text-xs font-black uppercase tracking-widest mb-3 ${isFullscreen ? 'text-zinc-500' : 'text-zinc-400'}`}>
            Add Station
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Station name (e.g. Grill, Fryer)"
              className={`flex-1 min-w-[160px] px-4 py-2.5 rounded-xl text-sm font-bold border focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                isFullscreen ? 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600' : 'bg-zinc-50 border-zinc-100 text-black placeholder:text-zinc-300'
              }`}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
            />
            <div className="flex gap-1.5">
              {STATION_COLORS.map(c => (
                <button
                  key={c.value}
                  onClick={() => setNewColor(c.value)}
                  className={`w-6 h-6 rounded-full transition-transform ${newColor === c.value ? 'scale-125 ring-2 ring-offset-1 ring-zinc-400' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
            <label className={`flex items-center gap-2 text-xs font-bold ${isFullscreen ? 'text-zinc-400' : 'text-zinc-500'}`}>
              <input
                type="checkbox"
                checked={newIsExpo}
                onChange={e => setNewIsExpo(e.target.checked)}
                className="rounded"
              />
              Expo Station
            </label>
            <button
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors disabled:opacity-40"
            >
              <FaPlus className="inline mr-1.5" />Add
            </button>
          </div>
          <p className={`text-[10px] font-medium mt-3 ${isFullscreen ? 'text-zinc-600' : 'text-zinc-400'}`}>
            Create separate stations for each prep area (Grill, Fryer, Drinks, Salads, etc.). 
            Use an Expo station as the final quality check before orders go out.
            Each station can run on its own tablet.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
