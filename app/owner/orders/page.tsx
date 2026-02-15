'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  addDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logOrderStatusChange } from '@/lib/staffActivity';
import { FEATURE_REGISTRY, tierMeetsRequirement } from '@/lib/tier-features';
import { FaSearch, FaFilter, FaTimes, FaHeadset, FaLocationArrow, FaSpinner } from 'react-icons/fa';

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  subtotal: number;
  status: string;
  orderType: string; // delivery | pickup | dine-in | takeout
  address?: string;
  notes?: string;
  createdAt: string;
  tip?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  assignedStaffName?: string;
  assignedStaffId?: string;
  updatedAt?: string;
  assignedDriverId?: string;
  assignedDriverType?: string;
  deliveryVerification?: {
    pickupCode?: string | null;
    dropoffCode?: string | null;
    pickupVerifiedAt?: string | null;
    dropoffVerifiedAt?: string | null;
  };
  deliveryWorkflow?: {
    phase?: string;
    acceptedAt?: string;
    pickedUpAt?: string;
    deliveredAt?: string;
  };
  supportEscalation?: {
    active?: boolean;
    escalatedAt?: string;
    escalatedBy?: string;
    resolvedAt?: string | null;
  };
}

const STATUS_FLOW = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  driver_en_route_pickup: 'Driver En Route to Pickup',
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
  driver_en_route_pickup: 'bg-sky-100 text-sky-700 border-sky-200',
  out_for_delivery: 'bg-purple-100 text-purple-700 border-purple-200',
  delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

export default function OwnerOrdersPage() {
  const { currentBusiness, user, MohnMenuUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [prevOrderCount, setPrevOrderCount] = useState<number | null>(null);
  const [busyMode, setBusyMode] = useState(false);
  const [savingBusyMode, setSavingBusyMode] = useState(false);
  const [managedSupportEnabled, setManagedSupportEnabled] = useState(false);
  const [supportSlaMinutes, setSupportSlaMinutes] = useState(15);
  const [savingSupportPlan, setSavingSupportPlan] = useState(false);
  const [inquiryTitle, setInquiryTitle] = useState('');
  const [inquiryDetails, setInquiryDetails] = useState('');
  const [inquiryPriority, setInquiryPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  const managedSupportEntitled = useMemo(
    () => tierMeetsRequirement(currentBusiness?.tier, FEATURE_REGISTRY['managed-support'].minTier),
    [currentBusiness?.tier],
  );

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
          orderType: d.orderType || d.type || 'delivery',
          address: d.deliveryAddress || d.address || '',
          notes: d.notes || d.specialInstructions || '',
          createdAt: d.createdAt || '',
          tip: d.tip || d.pricing?.tip || 0,
          paymentMethod: d.paymentMethod || '',
          paymentStatus: d.paymentStatus || 'pending',
          assignedStaffName: d.assignedStaffName || '',
          assignedStaffId: d.assignedStaffId || '',
          updatedAt: d.updatedAt || d.createdAt || '',
          assignedDriverId: d.assignedDriverId || '',
          assignedDriverType: d.assignedDriverType || '',
          deliveryVerification: d.deliveryVerification || undefined,
          deliveryWorkflow: d.deliveryWorkflow || undefined,
          supportEscalation: d.supportEscalation || undefined,
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

  useEffect(() => {
    if (!currentBusiness) return;
    const businessRef = doc(db, 'businesses', currentBusiness.businessId);
    const unsubscribe = onSnapshot(businessRef, (snap) => {
      const data = snap.data() as Record<string, any> | undefined;
      const nextBusyMode = !!(data?.supportSettings?.busyMode || data?.supportSettings?.autoRolloverCustomerInquiries);
      setBusyMode(nextBusyMode);
      setManagedSupportEnabled(managedSupportEntitled && !!data?.supportSettings?.managedSupportEnabled);
      const nextSla = Number(data?.supportSettings?.managedSupportSlaMinutes || 15);
      setSupportSlaMinutes(Number.isFinite(nextSla) ? Math.min(Math.max(nextSla, 5), 120) : 15);
    });
    return () => unsubscribe();
  }, [currentBusiness, managedSupportEntitled]);

  const updateStatus = useCallback(
    async (orderId: string, newStatus: string) => {
      if (!currentBusiness) return;
      setUpdating(true);
      try {
        // Find the current status before updating
        const currentOrder = orders.find(o => o.id === orderId);
        const fromStatus = currentOrder?.status || 'unknown';

        const orderRef = doc(db, 'businesses', currentBusiness.businessId, 'orders', orderId);
        await updateDoc(orderRef, {
          status: newStatus,
          updatedAt: new Date().toISOString(),
        });

        // Log staff activity
        if (MohnMenuUser) {
          logOrderStatusChange(
            currentBusiness.businessId,
            MohnMenuUser.uid,
            MohnMenuUser.displayName || MohnMenuUser.email,
            MohnMenuUser.role,
            orderId,
            fromStatus,
            newStatus,
          );
        }

        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => (prev ? { ...prev, status: newStatus } : null));
        }
      } catch (err) {
        console.error('Failed to update order status:', err);
      } finally {
        setUpdating(false);
      }
    },
    [currentBusiness, selectedOrder, orders, MohnMenuUser]
  );

  const nextStatus = (current: string): string | null => {
    const idx = STATUS_FLOW.indexOf(current);
    if (idx === -1 || idx >= STATUS_FLOW.length - 1) return null;
    return STATUS_FLOW[idx + 1];
  };

  const filtered = orders.filter(o => {
    const normalizedStatus = String(o.status || '').toLowerCase();
    if (filterStatus === '__attention' && !needsAttention(o)) return false;
    if (filterStatus === '__escalated' && !o.supportEscalation?.active) return false;
    if (!filterStatus.startsWith('__') && filterStatus !== 'all' && normalizedStatus !== filterStatus) return false;
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

  const attentionCount = useMemo(
    () => orders.filter((order) => needsAttention(order)).length,
    [orders],
  );

  const escalatedCount = useMemo(
    () => orders.filter((order) => order.supportEscalation?.active).length,
    [orders],
  );

  const openOrderDetails = useCallback((order: Order) => {
    setSelectedOrder(order);
    setDetailModalOpen(true);
  }, []);

  useEffect(() => {
    if (!selectedOrder) return;
    const refreshed = orders.find((order) => order.id === selectedOrder.id);
    if (refreshed) {
      setSelectedOrder(refreshed);
    }
  }, [orders, selectedOrder]);

  const copyOrderSummary = useCallback(async (order: Order) => {
    const summary = [
      `Business: ${currentBusiness?.businessId || 'n/a'}`,
      `Order ID: ${order.id}`,
      `Customer: ${order.customerName}`,
      `Status: ${order.status}`,
      `Type: ${order.orderType}`,
      `Total: $${order.total.toFixed(2)}`,
      `Address: ${order.address || 'n/a'}`,
      `Payment: ${order.paymentMethod || 'card'} / ${order.paymentStatus || 'pending'}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      setActionMessage('Order summary copied to clipboard.');
      setTimeout(() => setActionMessage(null), 2400);
    } catch {
      setActionMessage('Unable to copy summary.');
      setTimeout(() => setActionMessage(null), 2400);
    }
  }, [currentBusiness?.businessId]);

  const toggleSupportEscalation = useCallback(async (order: Order, active: boolean) => {
    if (!currentBusiness) return;
    setUpdating(true);
    try {
      const now = new Date().toISOString();
      const orderRef = doc(db, 'businesses', currentBusiness.businessId, 'orders', order.id);
      await updateDoc(orderRef, {
        supportEscalation: {
          active,
          escalatedAt: active ? now : (order.supportEscalation?.escalatedAt || now),
          escalatedBy: user?.uid || order.supportEscalation?.escalatedBy || 'owner',
          resolvedAt: active ? null : now,
        },
        updatedAt: now,
      });
      setActionMessage(active ? 'Support escalation started.' : 'Support escalation resolved.');
      setTimeout(() => setActionMessage(null), 2400);
    } catch {
      setActionMessage('Failed to update support escalation.');
      setTimeout(() => setActionMessage(null), 2400);
    } finally {
      setUpdating(false);
    }
  }, [currentBusiness, user?.uid]);

  const toggleBusySupportMode = useCallback(async () => {
    if (!currentBusiness) return;
    const next = !busyMode;
    setSavingBusyMode(true);
    try {
      const businessRef = doc(db, 'businesses', currentBusiness.businessId);
      await updateDoc(businessRef, {
        supportSettings: {
          busyMode: next,
          autoRolloverCustomerInquiries: next,
          updatedAt: new Date().toISOString(),
          updatedBy: user?.uid || null,
        },
      });
      setActionMessage(next ? 'Busy mode enabled: customer inquiries can roll over to support.' : 'Busy mode disabled.');
      setTimeout(() => setActionMessage(null), 2600);
    } catch {
      setActionMessage('Unable to update busy mode.');
      setTimeout(() => setActionMessage(null), 2600);
    } finally {
      setSavingBusyMode(false);
    }
  }, [currentBusiness, busyMode, user?.uid]);

  const saveManagedSupportPlan = useCallback(async () => {
    if (!currentBusiness) return;
    setSavingSupportPlan(true);
    try {
      const effectiveManagedSupportEnabled = managedSupportEntitled ? managedSupportEnabled : false;
      const businessRef = doc(db, 'businesses', currentBusiness.businessId);
      await updateDoc(businessRef, {
        supportSettings: {
          managedSupportEnabled: effectiveManagedSupportEnabled,
          managedSupportSlaMinutes: Math.min(Math.max(supportSlaMinutes, 5), 120),
          updatedAt: new Date().toISOString(),
          updatedBy: user?.uid || null,
        },
      });
      setActionMessage(!managedSupportEntitled
        ? 'Managed support requires Growth or Professional.'
        : managedSupportEnabled
        ? `Managed support enabled with ${supportSlaMinutes} minute SLA rollover.`
        : 'Managed support add-on disabled.');
      setTimeout(() => setActionMessage(null), 2600);
    } catch {
      setActionMessage('Unable to save managed support settings.');
      setTimeout(() => setActionMessage(null), 2600);
    } finally {
      setSavingSupportPlan(false);
    }
  }, [currentBusiness, managedSupportEnabled, supportSlaMinutes, user?.uid, managedSupportEntitled]);

  const submitSupportInquiry = useCallback(async (order: Order) => {
    if (!currentBusiness) return;
    const title = inquiryTitle.trim() || `Support request for order ${order.id.slice(-6).toUpperCase()}`;

    setSubmittingInquiry(true);
    try {
      const effectiveManagedSupportEnabled = managedSupportEntitled && managedSupportEnabled;
      await addDoc(collection(db, 'support_tickets'), {
        title,
        details: inquiryDetails.trim() || null,
        priority: inquiryPriority,
        status: 'new',
        provider: 'manual',
        source: busyMode ? 'owner-busy-rollover' : 'owner-quick-inquiry',
        businessId: currentBusiness.businessId,
        businessSlug: (currentBusiness as any)?.slug || null,
        orderId: order.id,
        contactName: order.customerName || null,
        contactEmail: order.customerEmail || null,
        managedSupportEnabled: effectiveManagedSupportEnabled,
        managedSupportEntitled,
        managedSupportRouted: false,
        supportSlaMinutes: supportSlaMinutes,
        supportSlaAt: new Date(Date.now() + supportSlaMinutes * 60 * 1000).toISOString(),
        createdBy: user?.uid || null,
        createdAt: serverTimestamp(),
      });

      const orderRef = doc(db, 'businesses', currentBusiness.businessId, 'orders', order.id);
      await updateDoc(orderRef, {
        supportEscalation: {
          active: true,
          escalatedAt: new Date().toISOString(),
          escalatedBy: user?.uid || 'owner',
          resolvedAt: null,
        },
        updatedAt: new Date().toISOString(),
      });

      setInquiryTitle('');
      setInquiryDetails('');
      setInquiryPriority('normal');
      setActionMessage(busyMode ? 'Inquiry rolled over to support queue.' : 'Support inquiry created.');
      setTimeout(() => setActionMessage(null), 2600);
    } catch {
      setActionMessage('Failed to create support inquiry.');
      setTimeout(() => setActionMessage(null), 2600);
    } finally {
      setSubmittingInquiry(false);
    }
  }, [currentBusiness, inquiryTitle, inquiryDetails, inquiryPriority, busyMode, user?.uid, managedSupportEnabled, managedSupportEntitled, supportSlaMinutes]);

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
          <p className="text-[11px] text-zinc-500 font-bold mt-1">
            {attentionCount} need attention · {escalatedCount} escalated
          </p>
        </div>
        <button
          onClick={toggleBusySupportMode}
          disabled={savingBusyMode}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black border transition-colors ${busyMode ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'} disabled:opacity-60`}
        >
          {savingBusyMode ? <FaSpinner className="animate-spin" /> : <FaHeadset />}
          {busyMode ? 'Busy Mode On (Auto Rollover)' : 'Enable Busy Mode'}
        </button>
      </div>

      <div className="bg-white border border-zinc-100 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Managed Support Add-On</p>
          <p className="text-sm text-zinc-600 font-medium">
            {managedSupportEntitled
              ? 'When enabled, unresolved tickets auto-route to MohnMenu support after SLA threshold.'
              : 'Upgrade to Growth or Professional to enable managed support rollover.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setManagedSupportEnabled((prev) => !prev)}
            disabled={!managedSupportEntitled}
            className={`px-3 py-2 rounded-xl text-xs font-black border ${managedSupportEnabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-zinc-50 text-zinc-700 border-zinc-200'}`}
          >
            {managedSupportEnabled ? 'Managed Support Enabled' : 'Managed Support Disabled'}
          </button>
          <label className="text-xs font-bold text-zinc-500 inline-flex items-center gap-2">
            SLA (mins)
            <input
              type="number"
              min={5}
              max={120}
              value={supportSlaMinutes}
              onChange={(e) => setSupportSlaMinutes(Math.min(Math.max(Number(e.target.value || 15), 5), 120))}
              className="w-20 h-9 rounded-lg border border-zinc-200 px-2"
            />
          </label>
          <button
            onClick={saveManagedSupportPlan}
            disabled={savingSupportPlan || !managedSupportEntitled}
            className="h-9 px-3 rounded-lg bg-black text-white text-xs font-bold hover:bg-zinc-800 disabled:opacity-60"
          >
            {savingSupportPlan ? 'Saving...' : 'Save Support Plan'}
          </button>
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
            <option value="__attention">Needs Attention</option>
            <option value="__escalated">Escalated Support</option>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Order List */}
      <div className="space-y-2 min-h-[60vh]">
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
                onClick={() => openOrderDetails(order)}
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
                    {order.orderType === 'delivery' ? '🚗 Delivery' : order.orderType === 'dine-in' ? '🍽️ Dine-in' : order.orderType === 'takeout' ? '📦 Takeout' : '🏪 Pickup'}
                  </span>
                  {order.paymentMethod && (
                    <span className="text-zinc-300 text-xs">
                      {order.paymentMethod === 'crypto' ? '₿' : order.paymentMethod === 'cash' ? '💵' : '💳'} {order.paymentMethod}
                    </span>
                  )}
                  {order.assignedStaffName && (
                    <span className="text-purple-500 text-xs font-bold">
                      → {order.assignedStaffName}
                    </span>
                  )}
                  {needsAttention(order) && (
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                      Attention
                    </span>
                  )}
                  {order.supportEscalation?.active && (
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      Escalated
                    </span>
                  )}
                  {order.createdAt && (
                    <span className="text-zinc-300 text-xs ml-auto">
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-2 text-[10px] font-bold">
                  {order.status === 'out_for_delivery' && (
                    <span className={`${order.deliveryVerification?.pickupVerifiedAt ? 'text-emerald-600' : 'text-orange-600'}`}>
                      Pickup {order.deliveryVerification?.pickupVerifiedAt ? 'verified' : 'pending'}
                    </span>
                  )}
                  {['out_for_delivery', 'delivered', 'completed'].includes(String(order.status || '').toLowerCase()) && (
                    <span className={`${order.deliveryVerification?.dropoffVerifiedAt ? 'text-emerald-600' : 'text-orange-600'}`}>
                      Drop-off {order.deliveryVerification?.dropoffVerifiedAt ? 'verified' : 'pending'}
                    </span>
                  )}
                </div>
                {order.updatedAt && (
                  <p className="text-[10px] text-emerald-600 font-bold mt-2">Live updated {new Date(order.updatedAt).toLocaleTimeString()}</p>
                )}
              </button>
            ))
          )}
      </div>

      {detailModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-60 bg-black/55 backdrop-blur-[2px] p-4 flex items-center justify-center" onClick={() => setDetailModalOpen(false)}>
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl border border-zinc-100 p-6 space-y-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Live Order Details</p>
                <h2 className="font-black text-black text-2xl">{selectedOrder.customerName}</h2>
                <p className="text-xs text-zinc-400">Order #{selectedOrder.id.slice(-6).toUpperCase()} · {selectedOrder.createdAt && new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                aria-label="Close order details"
                className="w-10 h-10 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center"
              >
                <FaTimes className="text-zinc-600" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[selectedOrder.status] || ''}`}>
                {STATUS_LABELS[selectedOrder.status] || selectedOrder.status}
              </span>
              <span className="text-xs text-zinc-500">{selectedOrder.orderType === 'delivery' ? '🚗 Delivery' : selectedOrder.orderType === 'dine-in' ? '🍽️ Dine-in' : selectedOrder.orderType === 'takeout' ? '📦 Takeout' : '🏪 Pickup'}</span>
              {selectedOrder.updatedAt && <span className="text-xs text-emerald-600 font-bold">Updated {new Date(selectedOrder.updatedAt).toLocaleTimeString()}</span>}
              {selectedOrder.supportEscalation?.active && (
                <span className="text-xs font-black uppercase tracking-widest px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Escalated</span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-zinc-100 p-4 space-y-1 text-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Customer</p>
                {selectedOrder.customerPhone && <p className="text-zinc-600">📞 {selectedOrder.customerPhone}</p>}
                {selectedOrder.customerEmail && <p className="text-zinc-600">✉️ {selectedOrder.customerEmail}</p>}
                {selectedOrder.address && <p className="text-zinc-600">📍 {selectedOrder.address}</p>}
              </div>
              <div className="rounded-2xl border border-zinc-100 p-4 space-y-2 text-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Delivery Verification</p>
                <p className="text-zinc-600">Pickup: {selectedOrder.deliveryVerification?.pickupVerifiedAt ? `Verified ${new Date(selectedOrder.deliveryVerification.pickupVerifiedAt).toLocaleTimeString()}` : 'Pending'}</p>
                <p className="text-zinc-600">Drop-off: {selectedOrder.deliveryVerification?.dropoffVerifiedAt ? `Verified ${new Date(selectedOrder.deliveryVerification.dropoffVerifiedAt).toLocaleTimeString()}` : 'Pending'}</p>
                {!!selectedOrder.assignedDriverId && (
                  <p className="text-zinc-600">Driver: {selectedOrder.assignedDriverType === 'courier' ? 'Community Courier' : 'In-house Driver'}</p>
                )}
              </div>
            </div>

            {selectedOrder.assignedStaffName && (
              <div className="bg-purple-50 rounded-xl p-3 border border-purple-200">
                <p className="text-xs font-bold text-purple-700 mb-1">Assigned To</p>
                <p className="text-sm font-bold text-purple-600">👤 {selectedOrder.assignedStaffName}</p>
              </div>
            )}

            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">Items</h3>
              <div className="space-y-2">
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-zinc-700"><span className="font-bold text-black">{item.quantity}×</span> {item.name}</span>
                    <span className="font-bold text-black">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-4 space-y-1">
              <div className="flex justify-between text-sm text-zinc-500"><span>Subtotal</span><span>${selectedOrder.subtotal.toFixed(2)}</span></div>
              {(selectedOrder.tip ?? 0) > 0 && <div className="flex justify-between text-sm text-zinc-500"><span>Tip</span><span>${(selectedOrder.tip || 0).toFixed(2)}</span></div>}
              <div className="flex justify-between text-sm text-zinc-500"><span>Payment</span><span>{selectedOrder.paymentMethod || 'card'} · {selectedOrder.paymentStatus || 'pending'}</span></div>
              <div className="flex justify-between font-bold text-black"><span>Total</span><span>${selectedOrder.total.toFixed(2)}</span></div>
            </div>

            {selectedOrder.notes && (
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                <p className="text-xs font-bold text-amber-700 mb-1">Customer Notes</p>
                <p className="text-xs text-amber-600">{selectedOrder.notes}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {nextStatus(selectedOrder.status) && (
                <button
                  onClick={() => updateStatus(selectedOrder.id, nextStatus(selectedOrder.status)!)}
                  disabled={updating}
                  className="w-full py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  {updating ? 'Updating...' : `Mark as ${STATUS_LABELS[nextStatus(selectedOrder.status)!]}`}
                </button>
              )}
              {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && selectedOrder.status !== 'completed' && (
                <button
                  onClick={() => updateStatus(selectedOrder.id, 'cancelled')}
                  disabled={updating}
                  className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  Cancel Order
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                href={`mailto:support@mohnmenu.com?subject=${encodeURIComponent('Urgent Order Support')}&body=${encodeURIComponent(`Business: ${currentBusiness.businessId}\nOrder ID: ${selectedOrder.id}\nCustomer: ${selectedOrder.customerName}\nIssue: `)}`}
                className="inline-flex items-center justify-center gap-2 py-3 rounded-xl border border-zinc-200 text-zinc-700 font-bold text-sm hover:bg-zinc-50"
              >
                <FaHeadset /> Contact Support
              </a>
              {!!selectedOrder.address && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedOrder.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 py-3 rounded-xl border border-zinc-200 text-zinc-700 font-bold text-sm hover:bg-zinc-50"
                >
                  <FaLocationArrow /> Open Address
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => copyOrderSummary(selectedOrder)}
                className="w-full py-3 rounded-xl border border-zinc-200 text-zinc-700 font-bold text-sm hover:bg-zinc-50"
              >
                Copy Order Summary
              </button>
              {selectedOrder.supportEscalation?.active ? (
                <button
                  onClick={() => toggleSupportEscalation(selectedOrder, false)}
                  disabled={updating}
                  className="w-full py-3 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-sm hover:bg-emerald-100 disabled:opacity-50"
                >
                  Mark Escalation Resolved
                </button>
              ) : (
                <button
                  onClick={() => toggleSupportEscalation(selectedOrder, true)}
                  disabled={updating}
                  className="w-full py-3 rounded-xl bg-amber-50 text-amber-700 font-bold text-sm hover:bg-amber-100 disabled:opacity-50"
                >
                  Escalate to Support
                </button>
              )}
            </div>

            <div className="rounded-2xl border border-zinc-100 p-4 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Quick Support Inquiry</p>
              <input
                value={inquiryTitle}
                onChange={(e) => setInquiryTitle(e.target.value)}
                placeholder="Short issue title (optional)"
                className="w-full h-10 rounded-xl border border-zinc-200 px-3 text-sm"
              />
              <textarea
                value={inquiryDetails}
                onChange={(e) => setInquiryDetails(e.target.value)}
                placeholder="Describe the customer inquiry or issue"
                className="w-full min-h-20 rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              />
              <div className="flex flex-wrap items-center gap-2">
                <select
                  title="Inquiry priority"
                  value={inquiryPriority}
                  onChange={(e) => setInquiryPriority(e.target.value as 'low' | 'normal' | 'high' | 'urgent')}
                  className="h-10 rounded-xl border border-zinc-200 px-3 text-sm"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <button
                  onClick={() => submitSupportInquiry(selectedOrder)}
                  disabled={submittingInquiry}
                  className="h-10 px-4 rounded-xl bg-black text-white text-sm font-bold hover:bg-zinc-800 disabled:opacity-60"
                >
                  {submittingInquiry ? 'Sending...' : busyMode ? 'Roll Over to Support Queue' : 'Send Support Inquiry'}
                </button>
              </div>
            </div>

            {actionMessage && (
              <p className="text-sm font-bold text-emerald-600">{actionMessage}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function needsAttention(order: Order): boolean {
  const status = String(order.status || '').toLowerCase();
  const paymentStatus = String(order.paymentStatus || '').toLowerCase();

  if (paymentStatus === 'failed') return true;
  if (status === 'out_for_delivery' && !order.deliveryVerification?.pickupVerifiedAt) return true;
  if ((status === 'delivered' || status === 'completed') && !order.deliveryVerification?.dropoffVerifiedAt) return true;
  if ((status === 'driver_en_route_pickup' || status === 'out_for_delivery') && !order.assignedDriverId) return true;

  return false;
}
