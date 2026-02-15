'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { collection, collectionGroup, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { FaArrowLeft, FaCheckCircle, FaClock, FaMapMarkerAlt, FaMotorcycle } from 'react-icons/fa';

interface DeliveryOrder {
  id: string;
  businessId: string;
  businessName: string;
  customerName: string;
  deliveryAddress: string;
  status: string;
  total: number;
  assignedDriverType?: string;
  createdAt?: string;
  updatedAt?: string;
  source: 'restaurant' | 'quick';
}

function statusBadge(status: string) {
  const value = String(status || '').toLowerCase();
  if (['delivered', 'completed'].includes(value)) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (['driver_en_route_pickup', 'out_for_delivery', 'picked_up', 'in_transit'].includes(value)) return 'bg-blue-100 text-blue-700 border-blue-200';
  if (['cancelled', 'failed'].includes(value)) return 'bg-red-100 text-red-700 border-red-200';
  return 'bg-zinc-100 text-zinc-600 border-zinc-200';
}

export default function DriverOrdersPage() {
  const { user, loading, isDriver } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('active');

  useEffect(() => {
    if (!loading && (!user || !isDriver())) {
      router.push('/login');
    }
  }, [loading, user, isDriver, router]);

  useEffect(() => {
    if (!user) return;

    const dataMap = new Map<string, DeliveryOrder>();

    const reSort = () => {
      const rows = Array.from(dataMap.values()).sort((a, b) => {
        const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return bTime - aTime;
      });
      setOrders(rows);
      setLoadingOrders(false);
    };

    const unsubOrder = onSnapshot(
      query(
        collectionGroup(db, 'orders'),
        where('assignedDriverId', '==', user.uid),
        orderBy('updatedAt', 'desc'),
      ),
      (snap) => {
        snap.docs.forEach((docSnap) => {
          const data = docSnap.data() as Record<string, any>;
          const path = docSnap.ref.path.split('/');
          const bizId = data.businessId || (path.length >= 2 ? path[1] : '');

          dataMap.set(`restaurant:${docSnap.id}`, {
            id: docSnap.id,
            businessId: bizId,
            businessName: data.businessName || data.restaurantName || 'Business',
            customerName: data.customerName || 'Customer',
            deliveryAddress: data.deliveryAddress || data.address || 'Address unavailable',
            status: data.status || 'pending',
            total: Number(data.total || 0),
            assignedDriverType: data.assignedDriverType || 'inhouse',
            createdAt: data.createdAt || '',
            updatedAt: data.updatedAt || '',
            source: 'restaurant',
          });
        });
        reSort();
      },
      () => setLoadingOrders(false),
    );

    const unsubQuick = onSnapshot(
      query(collection(db, 'quickDeliveries'), where('assignedCourierId', '==', user.uid), orderBy('updatedAt', 'desc')),
      (snap) => {
        snap.docs.forEach((docSnap) => {
          const data = docSnap.data() as Record<string, any>;
          dataMap.set(`quick:${docSnap.id}`, {
            id: docSnap.id,
            businessId: '__quickDelivery',
            businessName: 'Quick Delivery',
            customerName: data.senderName || 'Sender',
            deliveryAddress: data.dropoffAddress || 'Address unavailable',
            status: data.status || 'pending',
            total: Number(data.deliveryFee || 0),
            assignedDriverType: 'courier',
            createdAt: data.createdAt || '',
            updatedAt: data.updatedAt || '',
            source: 'quick',
          });
        });
        reSort();
      },
      () => setLoadingOrders(false),
    );

    return () => {
      unsubOrder();
      unsubQuick();
    };
  }, [user]);

  const filtered = useMemo(() => {
    return orders.filter((item) => {
      const status = String(item.status || '').toLowerCase();
      const done = ['delivered', 'completed', 'cancelled'].includes(status);
      if (activeTab === 'active') return !done;
      if (activeTab === 'completed') return done;
      return true;
    });
  }, [orders, activeTab]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-bold text-zinc-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pt-28 pb-20 px-4">
      <div className="container mx-auto max-w-4xl space-y-5">
        <div className="flex items-center gap-4">
          <Link href="/driver" className="w-10 h-10 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors">
            <FaArrowLeft className="text-sm text-zinc-600" />
          </Link>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-black">My Deliveries<span className="text-emerald-600">.</span></h1>
            <p className="text-sm text-zinc-500 font-medium">All assigned deliveries across businesses and quick delivery</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => setActiveTab('active')} className={`rounded-2xl border p-3 text-left ${activeTab === 'active' ? 'border-black bg-black text-white' : 'border-zinc-200 bg-white'}`}>
            <p className="text-[10px] uppercase tracking-widest font-black opacity-70">Active</p>
          </button>
          <button onClick={() => setActiveTab('completed')} className={`rounded-2xl border p-3 text-left ${activeTab === 'completed' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-zinc-200 bg-white'}`}>
            <p className="text-[10px] uppercase tracking-widest font-black opacity-70">Completed</p>
          </button>
          <button onClick={() => setActiveTab('all')} className={`rounded-2xl border p-3 text-left ${activeTab === 'all' ? 'border-zinc-800 bg-zinc-800 text-white' : 'border-zinc-200 bg-white'}`}>
            <p className="text-[10px] uppercase tracking-widest font-black opacity-70">All</p>
          </button>
        </div>

        {loadingOrders ? (
          <div className="bg-white rounded-2xl border border-zinc-100 p-10 text-center text-zinc-400 font-bold">Loading deliveries...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-zinc-100 p-10 text-center text-zinc-400 font-bold">No deliveries in this view.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => {
              const isCourier = order.assignedDriverType === 'courier';
              const payout = isCourier ? Math.max(order.total - 0.25, 0) : order.total;
              const isTrackable = order.source === 'restaurant';

              return (
                <div key={`${order.source}:${order.id}`} className="bg-white rounded-2xl border border-zinc-100 p-5">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div>
                      <p className="font-black text-black">{order.businessName}</p>
                      <p className="text-xs text-zinc-500">{order.customerName}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-black text-emerald-600">${payout.toFixed(2)}</p>
                      <span className={`inline-block mt-1 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${statusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-start gap-2 text-sm text-zinc-600">
                    <FaMapMarkerAlt className="text-zinc-300 mt-0.5" />
                    <span>{order.deliveryAddress}</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress || '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-200 text-zinc-600 text-xs font-black hover:bg-zinc-50"
                    >
                      <FaMapMarkerAlt /> Open Maps
                    </a>
                    {isTrackable && (
                      <Link
                        href={`/track-delivery/${order.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-xs font-black hover:bg-zinc-800"
                      >
                        <FaMotorcycle /> Customer Tracking View
                      </Link>
                    )}
                    {['delivered', 'completed'].includes(String(order.status || '').toLowerCase()) && (
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black">
                        <FaCheckCircle /> Completed
                      </span>
                    )}
                    {['driver_en_route_pickup', 'out_for_delivery', 'picked_up', 'in_transit'].includes(String(order.status || '').toLowerCase()) && (
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-xs font-black">
                        <FaClock /> In progress
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
