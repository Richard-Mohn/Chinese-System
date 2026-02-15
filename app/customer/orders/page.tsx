'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { collectionGroup, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaBox, FaClock, FaCheckCircle, FaMapMarkedAlt } from 'react-icons/fa';

interface OrderRow {
  id: string;
  businessId: string;
  businessName?: string;
  total?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  orderType?: string;
  deliveryAddress?: string;
  paymentStatus?: string;
  items?: { name: string; quantity: number; price: number }[];
}

function normalizeStatus(status?: string) {
  return String(status || 'pending').toLowerCase();
}

function canTrack(order: OrderRow) {
  if (order.orderType !== 'delivery') return false;
  const status = normalizeStatus(order.status);
  return ['pending', 'confirmed', 'preparing', 'ready', 'driver_en_route_pickup', 'out_for_delivery', 'delivered'].includes(status);
}

export default function CustomerOrdersPage() {
  const { user, MohnMenuUser, loading, isCustomer } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const emailLower = useMemo(() => {
    const raw = (MohnMenuUser?.email || user?.email || '').trim().toLowerCase();
    return raw || null;
  }, [MohnMenuUser?.email, user?.email]);

  useEffect(() => {
    if (!loading && (!user || !isCustomer())) {
      router.push('/login');
    }
  }, [user, loading, isCustomer, router]);

  useEffect(() => {
    if (!user) return;

    setLoadingOrders(true);
    setLoadError(null);

    let uidRows: OrderRow[] = [];
    let emailRows: OrderRow[] = [];

    const mapSnapshot = (snapshot: any): OrderRow[] => {
      return snapshot.docs.map((docSnap: any) => {
        const data = docSnap.data() as Record<string, any>;
        const path = docSnap.ref.path.split('/');
        const pathBusinessId = path.length >= 2 ? path[1] : '';

        return {
          id: docSnap.id,
          businessId: data.businessId || pathBusinessId,
          businessName: data.businessName || data.restaurantName || 'Business',
          total: Number(data.total || data.pricing?.total || 0),
          status: data.status || 'pending',
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || '',
          orderType: data.orderType || data.type || 'delivery',
          deliveryAddress: data.deliveryAddress || data.address || '',
          paymentStatus: data.paymentStatus || 'pending',
          items: Array.isArray(data.items) ? data.items : [],
        };
      });
    };

    const mergeAndCommit = () => {
      const merged = new Map<string, OrderRow>();
      [...uidRows, ...emailRows].forEach((row) => {
        const uniqueKey = `${row.businessId}:${row.id}`;
        merged.set(uniqueKey, row);
      });

      const rows = Array.from(merged.values()).sort((a, b) => {
        const aTime = new Date(a.createdAt || a.updatedAt || 0).getTime();
        const bTime = new Date(b.createdAt || b.updatedAt || 0).getTime();
        return bTime - aTime;
      });

      setOrders(rows);
      setLoadingOrders(false);
    };

    const unsubscribers: Array<() => void> = [];

    const uidQuery = query(
      collectionGroup(db, 'orders'),
      where('customerId', '==', user.uid),
    );

    unsubscribers.push(
      onSnapshot(
        uidQuery,
        (snap) => {
          uidRows = mapSnapshot(snap);
          mergeAndCommit();
        },
        (err) => {
          console.error('Customer orders uid query error:', err);
          setLoadError('Could not load orders right now.');
          setLoadingOrders(false);
        },
      ),
    );

    if (emailLower) {
      const emailQuery = query(
        collectionGroup(db, 'orders'),
        where('customerEmailLower', '==', emailLower),
      );

      unsubscribers.push(
        onSnapshot(
          emailQuery,
          (snap) => {
            emailRows = mapSnapshot(snap);
            mergeAndCommit();
          },
          (err) => {
            console.error('Customer orders email query error:', err);
          },
        ),
      );
    }

    return () => {
      unsubscribers.forEach((u) => u());
    };
  }, [user, emailLower]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-bold text-zinc-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  const statusIcon = (status?: string) => {
    const value = normalizeStatus(status);
    switch (value) {
      case 'delivered':
      case 'completed':
        return <FaCheckCircle className="text-emerald-500" />;
      case 'preparing':
      case 'ready':
      case 'driver_en_route_pickup':
      case 'out_for_delivery':
        return <FaClock className="text-orange-500" />;
      default:
        return <FaBox className="text-zinc-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-transparent pt-32 pb-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center gap-4 mb-10">
          <Link href="/customer" className="w-10 h-10 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors">
            <FaArrowLeft className="text-sm text-zinc-600" />
          </Link>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-black">
              Live Orders & History<span className="text-orange-600">.</span>
            </h1>
            <p className="text-sm text-zinc-500 font-medium">All your orders across stores, synced to your account</p>
          </div>
        </div>

        {loadingOrders ? (
          <div className="text-center py-20 text-zinc-400 font-bold animate-pulse">Loading orders...</div>
        ) : loadError ? (
          <div className="bg-white rounded-3xl border border-red-100 p-10 text-center">
            <p className="font-black text-red-600">{loadError}</p>
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] border border-zinc-100 p-12 text-center"
          >
            <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FaBox className="text-3xl text-zinc-300" />
            </div>
            <h2 className="text-2xl font-black text-black mb-3">No Orders Yet</h2>
            <p className="text-zinc-500 font-medium mb-8 max-w-sm mx-auto">
              Place an order and this dashboard will track it here automatically.
            </p>
            <Link href="/" className="inline-flex px-8 py-4 bg-black text-white rounded-full font-bold hover:bg-zinc-800 transition-all">
              Browse Stores
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={`${order.businessId}:${order.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-white rounded-2xl border border-zinc-100 p-6 hover:border-zinc-200 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center">
                      {statusIcon(order.status)}
                    </div>
                    <div>
                      <p className="font-bold text-black">{order.businessName || 'Order'}</p>
                      <p className="text-xs text-zinc-400 font-medium">
                        #{order.id.slice(-8).toUpperCase()} · {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Unknown date'}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="font-black text-black">${(order.total || 0).toFixed(2)}</p>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                      {order.status || 'Pending'}
                    </span>
                  </div>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-zinc-50">
                    <p className="text-xs text-zinc-400 font-medium">
                      {order.items.slice(0, 4).map((item) => `${item.quantity}x ${item.name}`).join(', ')}
                      {order.items.length > 4 ? ` +${order.items.length - 4} more` : ''}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {canTrack(order) && (
                    <Link
                      href={`/track-delivery/${order.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-xs font-black hover:bg-zinc-800"
                    >
                      <FaMapMarkedAlt /> Track Order
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
