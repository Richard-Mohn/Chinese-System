'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collectionGroup, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaBox, FaClock, FaCheckCircle } from 'react-icons/fa';

interface Order {
  id: string;
  businessName?: string;
  total?: number;
  status?: string;
  createdAt?: string;
  items?: { name: string; quantity: number; price: number }[];
}

export default function CustomerOrdersPage() {
  const { user, MohnMenuUser, loading, isCustomer } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !isCustomer())) {
      router.push('/login');
    }
  }, [user, loading, isCustomer, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const ordersRef = collectionGroup(db, 'orders');
        const q = query(
          ordersRef,
          where('customerId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        const fetched: Order[] = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOrders(fetched);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-bold text-zinc-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  const statusIcon = (status?: string) => {
    switch (status) {
      case 'delivered':
      case 'completed':
        return <FaCheckCircle className="text-emerald-500" />;
      case 'preparing':
      case 'in_transit':
        return <FaClock className="text-orange-500" />;
      default:
        return <FaBox className="text-zinc-400" />;
    }
  };

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
              Order History<span className="text-orange-600">.</span>
            </h1>
            <p className="text-sm text-zinc-500 font-medium">View your past orders</p>
          </div>
        </div>

        {loadingOrders ? (
          <div className="text-center py-20 text-zinc-400 font-bold animate-pulse">Loading orders...</div>
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
              When you place your first order, it will show up here. Browse local restaurants and stores to get started!
            </p>
            <Link href="/" className="inline-flex px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-bold hover:shadow-xl hover:shadow-orange-500/20 transition-all">
              Browse Restaurants
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-zinc-100 p-6 hover:border-zinc-200 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center">
                      {statusIcon(order.status)}
                    </div>
                    <div>
                      <p className="font-bold text-black">{order.businessName || 'Order'}</p>
                      <p className="text-xs text-zinc-400 font-medium">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Unknown date'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-black">${(order.total || 0).toFixed(2)}</p>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                      {order.status || 'Pending'}
                    </span>
                  </div>
                </div>
                {order.items && order.items.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-zinc-50">
                    <p className="text-xs text-zinc-400 font-medium">
                      {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
