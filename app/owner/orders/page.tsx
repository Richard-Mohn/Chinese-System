'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FaSearch, FaFilter } from 'react-icons/fa';

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  subtotal: number;
  status: string;
  orderType: string; // delivery | pickup
  address?: string;
  notes?: string;
  createdAt: string;
  tip?: number;
}

const STATUS_FLOW = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  preparing: 'bg-orange-100 text-orange-700 border-orange-200',
  ready: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  out_for_delivery: 'bg-purple-100 text-purple-700 border-purple-200',
  delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

export default function OwnerOrdersPage() {
  const { currentBusiness } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
  const [prevOrderCount, setPrevOrderCount] = useState<number | null>(null);

  // Play notification sound + show browser notification for new orders
  const playNotification = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      // Play a pleasant two-tone chime
      const playTone = (freq: number, start: number, dur: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + start + dur);
        osc.start(audioCtx.currentTime + start);
        osc.stop(audioCtx.currentTime + start + dur);
      };
      playTone(880, 0, 0.15);
      playTone(1100, 0.15, 0.2);
      playTone(1320, 0.3, 0.3);
    } catch {
      // Web Audio API not available
    }

    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('New Order!', { body: 'You have a new order waiting.', icon: '/icon.png' });
    }
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!currentBusiness) return;

    const ordersRef = collection(db, 'businesses', currentBusiness.businessId, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, snap => {
      const data: Order[] = [];
      snap.forEach(docSnap => {
        const d = docSnap.data();
        data.push({
          id: docSnap.id,
          customerName: d.customerName || d.customer?.name || 'Customer',
          customerPhone: d.customerPhone || d.customer?.phone || '',
          customerEmail: d.customerEmail || d.customer?.email || '',
          items: d.items || [],
          total: d.total || d.pricing?.total || 0,
          subtotal: d.subtotal || d.pricing?.subtotal || 0,
          status: d.status || 'pending',
          orderType: d.orderType || 'delivery',
          address: d.deliveryAddress || d.address || '',
          notes: d.notes || d.specialInstructions || '',
          createdAt: d.createdAt || '',
          tip: d.tip || d.pricing?.tip || 0,
        });
      });

      // Detect new orders and notify
      if (prevOrderCount !== null && data.length > prevOrderCount) {
        playNotification();
      }
      setPrevOrderCount(data.length);

      setOrders(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentBusiness]);

  const updateStatus = useCallback(
    async (orderId: string, newStatus: string) => {
      if (!currentBusiness) return;
      setUpdating(true);
      try {
        const orderRef = doc(db, 'businesses', currentBusiness.businessId, 'orders', orderId);
        await updateDoc(orderRef, {
          status: newStatus,
          updatedAt: new Date().toISOString(),
        });
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => (prev ? { ...prev, status: newStatus } : null));
        }
      } catch (err) {
        console.error('Failed to update order status:', err);
      } finally {
        setUpdating(false);
      }
    },
    [currentBusiness, selectedOrder]
  );

  const nextStatus = (current: string): string | null => {
    const idx = STATUS_FLOW.indexOf(current);
    if (idx === -1 || idx >= STATUS_FLOW.length - 1) return null;
    return STATUS_FLOW[idx + 1];
  };

  const filtered = orders.filter(o => {
    if (filterStatus !== 'all' && o.status !== filterStatus) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        o.customerName.toLowerCase().includes(s) ||
        o.id.toLowerCase().includes(s) ||
        o.customerPhone.includes(s)
      );
    }
    return true;
  });

  const activeCount = orders.filter(o => !['delivered', 'completed', 'cancelled'].includes(o.status)).length;

  if (!currentBusiness) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-black">Orders</h1>
          <p className="text-zinc-400 font-medium mt-1">
            {activeCount} active · {orders.length} total
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, order ID, or phone..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div className="relative">
          <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-xs" />
          <select
            title="Filter by status"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="pl-10 pr-8 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-bold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="all">All Statuses</option>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Order List + Detail */}
      <div className="flex gap-6 min-h-[60vh]">
        {/* Order List */}
        <div className="flex-1 space-y-2">
          {loading ? (
            <div className="bg-white rounded-2xl border border-zinc-100 p-12 text-center">
              <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-zinc-400 font-bold text-sm">Loading orders...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-zinc-100 p-12 text-center">
              <p className="text-zinc-400 font-bold text-sm">
                {orders.length === 0 ? 'No orders yet.' : 'No orders match your filters.'}
              </p>
            </div>
          ) : (
            filtered.map(order => (
              <button
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`w-full text-left bg-white rounded-2xl border p-4 transition-all hover:border-zinc-300 ${
                  selectedOrder?.id === order.id
                    ? 'border-black ring-1 ring-black'
                    : 'border-zinc-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-black text-sm">{order.customerName}</span>
                    <span className="text-zinc-400 text-xs">#{order.id.slice(-6).toUpperCase()}</span>
                  </div>
                  <span className="font-bold text-black text-sm">${order.total.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide border ${
                      STATUS_COLORS[order.status] || 'bg-zinc-100 text-zinc-600 border-zinc-200'
                    }`}
                  >
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                  <span className="text-zinc-400 text-xs">
                    {order.orderType === 'delivery' ? '🚗 Delivery' : '🏪 Pickup'}
                  </span>
                  {order.createdAt && (
                    <span className="text-zinc-300 text-xs ml-auto">
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Order Detail Panel */}
        <div className="hidden lg:block w-105 shrink-0">
          {selectedOrder ? (
            <div className="bg-white rounded-2xl border border-zinc-100 p-6 sticky top-6 space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-black text-black text-lg">{selectedOrder.customerName}</h2>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      STATUS_COLORS[selectedOrder.status] || ''
                    }`}
                  >
                    {STATUS_LABELS[selectedOrder.status] || selectedOrder.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Order #{selectedOrder.id.slice(-6).toUpperCase()} ·{' '}
                  {selectedOrder.createdAt && new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Contact */}
              <div className="space-y-1 text-sm">
                {selectedOrder.customerPhone && (
                  <p className="text-zinc-600">📞 {selectedOrder.customerPhone}</p>
                )}
                {selectedOrder.customerEmail && (
                  <p className="text-zinc-600">✉️ {selectedOrder.customerEmail}</p>
                )}
                {selectedOrder.address && (
                  <p className="text-zinc-600">📍 {selectedOrder.address}</p>
                )}
              </div>

              {/* Items */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">
                  Items
                </h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-zinc-700">
                        <span className="font-bold text-black">{item.quantity}×</span> {item.name}
                      </span>
                      <span className="font-bold text-black">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-zinc-100 pt-4 space-y-1">
                <div className="flex justify-between text-sm text-zinc-500">
                  <span>Subtotal</span>
                  <span>${selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                {(selectedOrder.tip ?? 0) > 0 && (
                  <div className="flex justify-between text-sm text-zinc-500">
                    <span>Tip</span>
                    <span>${(selectedOrder.tip || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-black">
                  <span>Total</span>
                  <span>${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                  <p className="text-xs font-bold text-amber-700 mb-1">Customer Notes</p>
                  <p className="text-xs text-amber-600">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Status Actions */}
              <div className="space-y-2">
                {nextStatus(selectedOrder.status) && (
                  <button
                    onClick={() =>
                      updateStatus(selectedOrder.id, nextStatus(selectedOrder.status)!)
                    }
                    disabled={updating}
                    className="w-full py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-zinc-800 transition-colors disabled:opacity-50"
                  >
                    {updating
                      ? 'Updating...'
                      : `Mark as ${STATUS_LABELS[nextStatus(selectedOrder.status)!]}`}
                  </button>
                )}
                {selectedOrder.status !== 'cancelled' &&
                  selectedOrder.status !== 'delivered' &&
                  selectedOrder.status !== 'completed' && (
                    <button
                      onClick={() => updateStatus(selectedOrder.id, 'cancelled')}
                      disabled={updating}
                      className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      Cancel Order
                    </button>
                  )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-zinc-100 p-12 text-center h-full flex items-center justify-center">
              <div>
                <p className="text-zinc-400 font-bold text-sm">Select an order</p>
                <p className="text-zinc-300 text-xs mt-1">to view details and manage status</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
