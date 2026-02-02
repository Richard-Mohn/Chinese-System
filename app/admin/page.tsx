'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface Order {
  id: string;
  customerInfo: {
    name: string;
    email: string;
  };
  items: any[];
  totalAmount: number;
  currentStatus: string;
  createdAt: any;
  priority_score?: number;
  is_express?: boolean;
}

const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!profile || (profile.role !== 'owner' && profile.role !== 'staff'))) {
      router.push('/login');
    }
  }, [profile, authLoading, router]);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ordersData: Order[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order));
      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        currentStatus: newStatus,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (authLoading || loading) {
    return <div className="text-center p-12 text-indigo-600 font-semibold animate-pulse uppercase tracking-widest">🐉 ACCESSING COMMAND CENTER...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-8">
      <div className="container mx-auto">
        <header className="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter">Kitchen Command</h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">Real-time Order Flow • {profile?.role?.toUpperCase()}</p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20">
              Live Feed Active
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6">
          {orders.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-zinc-200 dark:border-zinc-800">
              <span className="text-4xl mb-4 block">🍳</span>
              <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">No active orders</h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2 font-medium">When customers pay, their orders will appear here instantly.</p>
            </div>
          ) : (
            orders.map(order => (
              <div 
                key={order.id} 
                className={`bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border-2 transition-all p-6 sm:p-8 ${
                  order.is_express 
                    ? 'border-amber-500 shadow-amber-500/10' 
                    : 'border-zinc-100 dark:border-zinc-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between gap-6 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-xl">
                      {order.is_express ? '⚡' : '🥡'}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                          Order #{order.id.slice(-4)}
                        </h3>
                        {order.is_express && (
                          <span className="bg-amber-500 text-black text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest">Express</span>
                        )}
                      </div>
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-widest mt-1">
                        {order.customerInfo.name} • {order.items.length} Items • ${order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {['Received', 'Preparing', 'Cooking', 'Ready', 'Completed'].map(status => (
                      <button
                        key={status}
                        onClick={() => updateStatus(order.id, status)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          order.currentStatus === status
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-center">
                        <div className="text-indigo-600 dark:text-indigo-400 font-black text-lg">
                          {item.quantity}x
                        </div>
                        <div>
                          <div className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">{item.name}</div>
                          {item.options && item.options.length > 0 && (
                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter mt-0.5">
                              {item.options.join(' • ')}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
