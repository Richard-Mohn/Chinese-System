'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, getDocs, getCountFromServer, query, where, collectionGroup } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FaUsers, FaStore, FaShoppingCart, FaBicycle,
  FaCog, FaChartBar, FaArrowRight,
} from 'react-icons/fa';

interface PlatformStats {
  totalBusinesses: number;
  totalUsers: number;
  totalOrders: number;
  totalCouriers: number;
}

export default function AdminDashboardPage() {
  const { user, MohnMenuUser, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Only admins can access this page
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (MohnMenuUser?.role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [user, MohnMenuUser, loading, router]);

  // Fetch platform-wide stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!user || MohnMenuUser?.role !== 'admin') return;
      try {
        const [businessSnap, userSnap, courierSnap] = await Promise.all([
          getCountFromServer(collection(db, 'businesses')),
          getCountFromServer(collection(db, 'users')),
          getCountFromServer(query(collection(db, 'users'), where('role', '==', 'driver_marketplace'))),
        ]);

        setStats({
          totalBusinesses: businessSnap.data().count,
          totalUsers: userSnap.data().count,
          totalOrders: 0, // collectionGroup count requires index
          totalCouriers: courierSnap.data().count,
        });
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };
    if (user && MohnMenuUser?.role === 'admin') fetchStats();
  }, [user, MohnMenuUser]);

  if (loading || (MohnMenuUser?.role !== 'admin')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-bold text-zinc-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  const statCards = [
    { label: 'Businesses', value: stats?.totalBusinesses ?? '—', icon: FaStore, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Users', value: stats?.totalUsers ?? '—', icon: FaUsers, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Couriers', value: stats?.totalCouriers ?? '—', icon: FaBicycle, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const quickLinks = [
    { label: 'Owner Dashboard', href: '/owner', icon: FaStore, desc: 'Manage business settings' },
    { label: 'Analytics', href: '/owner/analytics', icon: FaChartBar, desc: 'SEO & traffic data' },
    { label: 'Settings', href: '/owner/settings', icon: FaCog, desc: 'Platform configuration' },
  ];

  return (
    <div className="min-h-screen bg-transparent pt-32 pb-20 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tighter text-black">
            Admin Dashboard<span className="text-orange-600">.</span>
          </h1>
          <p className="text-sm text-zinc-500 font-medium mt-1">
            Platform-wide overview for {MohnMenuUser?.email}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-zinc-100 p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
                  <card.icon className={`text-lg ${card.color}`} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
                  {card.label}
                </span>
              </div>
              <p className="text-3xl font-black text-black">
                {loadingStats ? '...' : card.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-10">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-6">
            Quick Actions
          </h2>
          <div className="space-y-3">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-zinc-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-zinc-50 group-hover:bg-white rounded-xl flex items-center justify-center">
                  <link.icon className="text-zinc-400" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-black text-sm">{link.label}</p>
                  <p className="text-xs text-zinc-400">{link.desc}</p>
                </div>
                <FaArrowRight className="text-zinc-300 group-hover:text-zinc-500 transition-colors text-sm" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
