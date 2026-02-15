'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, getDocs, getCountFromServer, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FaUsers, FaStore, FaShoppingCart, FaBicycle,
  FaCog, FaChartBar, FaArrowRight, FaCheck, FaTimes,
  FaWalking, FaCar, FaMotorcycle, FaPhone, FaEnvelope,
  FaClock, FaEye, FaLifeRing, FaTools,
} from 'react-icons/fa';

interface PlatformStats {
  totalBusinesses: number;
  totalUsers: number;
  totalOrders: number;
  totalCouriers: number;
  pendingCouriers: number;
}

interface CourierApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  courierVehicle: string;
  backgroundCheckStatus: 'pending' | 'approved' | 'rejected';
  isActive: boolean;
  totalDeliveries: number;
  totalEarnings: number;
  rating: number;
  createdAt: string;
  adminNotes?: string;
}

export default function AdminDashboardPage() {
  const { user, MohnMenuUser, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [couriers, setCouriers] = useState<CourierApplication[]>([]);
  const [loadingCouriers, setLoadingCouriers] = useState(true);
  const [selectedCourier, setSelectedCourier] = useState<CourierApplication | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

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
        const [businessSnap, userSnap, courierSnap, pendingSnap] = await Promise.all([
          getCountFromServer(collection(db, 'businesses')),
          getCountFromServer(collection(db, 'users')),
          getCountFromServer(query(collection(db, 'users'), where('role', '==', 'driver_marketplace'))),
          getCountFromServer(query(collection(db, 'couriers'), where('backgroundCheckStatus', '==', 'pending'))),
        ]);

        setStats({
          totalBusinesses: businessSnap.data().count,
          totalUsers: userSnap.data().count,
          totalOrders: 0,
          totalCouriers: courierSnap.data().count,
          pendingCouriers: pendingSnap.data().count,
        });
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };
    if (user && MohnMenuUser?.role === 'admin') fetchStats();
  }, [user, MohnMenuUser]);

  // Fetch all courier applications
  useEffect(() => {
    const fetchCouriers = async () => {
      if (!user || MohnMenuUser?.role !== 'admin') return;
      try {
        const snap = await getDocs(collection(db, 'couriers'));
        const apps: CourierApplication[] = snap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            name: data.name || 'Unknown',
            email: data.email || '',
            phone: data.phone || '',
            courierVehicle: data.courierVehicle || 'bike',
            backgroundCheckStatus: data.backgroundCheckStatus || 'pending',
            isActive: data.isActive || false,
            totalDeliveries: data.totalDeliveries || 0,
            totalEarnings: data.totalEarnings || 0,
            rating: data.rating || 5.0,
            createdAt: data.createdAt || '',
            adminNotes: data.adminNotes || '',
          };
        });
        // Sort: pending first, then by date
        apps.sort((a, b) => {
          if (a.backgroundCheckStatus === 'pending' && b.backgroundCheckStatus !== 'pending') return -1;
          if (b.backgroundCheckStatus === 'pending' && a.backgroundCheckStatus !== 'pending') return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setCouriers(apps);
      } catch (err) {
        console.error('Error fetching couriers:', err);
      } finally {
        setLoadingCouriers(false);
      }
    };
    if (user && MohnMenuUser?.role === 'admin') fetchCouriers();
  }, [user, MohnMenuUser]);

  // Approve / Reject courier
  const handleCourierAction = async (courierId: string, action: 'approved' | 'rejected') => {
    setActionLoading(courierId);
    try {
      const courierRef = doc(db, 'couriers', courierId);
      await updateDoc(courierRef, {
        backgroundCheckStatus: action,
        isActive: action === 'approved',
        adminNotes: adminNotes || undefined,
        reviewedAt: new Date().toISOString(),
        reviewedBy: user?.uid,
        updatedAt: new Date().toISOString(),
      });

      // Update local state
      setCouriers(prev => prev.map(c =>
        c.id === courierId
          ? { ...c, backgroundCheckStatus: action, isActive: action === 'approved', adminNotes }
          : c
      ));
      setSelectedCourier(null);
      setAdminNotes('');

      // Update pending count
      if (stats) {
        setStats({
          ...stats,
          pendingCouriers: stats.pendingCouriers - (action === 'approved' || action === 'rejected' ? 1 : 0),
        });
      }
    } catch (err) {
      console.error('Error updating courier:', err);
      alert('Failed to update courier status');
    } finally {
      setActionLoading(null);
    }
  };

  const getVehicleIcon = (vehicle: string) => {
    switch (vehicle) {
      case 'bike': return FaBicycle;
      case 'walk': return FaWalking;
      case 'scooter': return FaMotorcycle;
      case 'car': return FaCar;
      default: return FaBicycle;
    }
  };

  const filteredCouriers = activeTab === 'all'
    ? couriers
    : couriers.filter(c => c.backgroundCheckStatus === activeTab);

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
    { label: 'Pending Review', value: stats?.pendingCouriers ?? '—', icon: FaClock, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const quickLinks = [
    { label: 'Owner Dashboard', href: '/owner', icon: FaStore, desc: 'Manage business settings' },
    { label: 'Analytics', href: '/owner/analytics', icon: FaChartBar, desc: 'SEO & traffic data' },
    { label: 'Settings', href: '/owner/settings', icon: FaCog, desc: 'Platform configuration' },
    { label: 'HR Verification', href: '/admin/hr', icon: FaUsers, desc: 'Video ID vetting and background checks' },
    { label: 'Tenant Console', href: '/admin/super', icon: FaTools, desc: 'Cross-tenant oversight and support context' },
    { label: 'Support Queue', href: '/admin/support', icon: FaLifeRing, desc: 'Support tickets and assist workflows' },
  ];

  return (
    <div className="min-h-screen bg-transparent pt-32 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
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

        {/* ── Courier Applications Management ─────────────────── */}
        <motion.div
          className="bg-white rounded-[2.5rem] border border-zinc-100 p-8 md:p-10 mb-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-black text-black">
                Courier Applications
                {(stats?.pendingCouriers ?? 0) > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-7 h-7 bg-amber-500 text-white rounded-full text-xs font-black">
                    {stats?.pendingCouriers}
                  </span>
                )}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">Review and approve community courier applications</p>
            </div>
            {/* Tab filters */}
            <div className="flex gap-1 bg-zinc-100 rounded-xl p-1">
              {(['pending', 'approved', 'rejected', 'all'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    activeTab === tab ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
                  }`}
                >
                  {tab}
                  {tab !== 'all' && (
                    <span className="ml-1 text-zinc-400">
                      ({couriers.filter(c => c.backgroundCheckStatus === tab).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {loadingCouriers ? (
            <div className="py-12 text-center">
              <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-zinc-400 font-bold">Loading courier applications...</p>
            </div>
          ) : filteredCouriers.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-zinc-500 font-bold">No {activeTab === 'all' ? '' : activeTab} courier applications</p>
              <p className="text-xs text-zinc-400 mt-1">
                {activeTab === 'pending' ? 'All caught up!' : 'Applications will appear here when couriers sign up.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCouriers.map((courier) => {
                const VehicleIcon = getVehicleIcon(courier.courierVehicle);
                const isPending = courier.backgroundCheckStatus === 'pending';
                const isApproved = courier.backgroundCheckStatus === 'approved';
                const isRejected = courier.backgroundCheckStatus === 'rejected';
                const isExpanded = selectedCourier?.id === courier.id;

                return (
                  <motion.div
                    key={courier.id}
                    layout
                    className={`rounded-2xl border p-5 transition-all ${
                      isPending ? 'border-amber-200 bg-amber-50/30' :
                      isApproved ? 'border-emerald-100 bg-emerald-50/20' :
                      'border-red-100 bg-red-50/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          isPending ? 'bg-amber-100' : isApproved ? 'bg-emerald-100' : 'bg-red-100'
                        }`}>
                          <VehicleIcon className={`text-xl ${
                            isPending ? 'text-amber-600' : isApproved ? 'text-emerald-600' : 'text-red-500'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-black text-sm">{courier.name}</p>
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              isPending ? 'bg-amber-100 text-amber-700' :
                              isApproved ? 'bg-emerald-100 text-emerald-700' :
                              'bg-red-100 text-red-600'
                            }`}>
                              {courier.backgroundCheckStatus}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs text-zinc-400 flex items-center gap-1">
                              <FaEnvelope className="text-[10px]" /> {courier.email}
                            </span>
                            <span className="text-xs text-zinc-400 flex items-center gap-1">
                              <FaPhone className="text-[10px]" /> {courier.phone}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-0.5">
                            Applied: {courier.createdAt ? new Date(courier.createdAt).toLocaleDateString() : 'Unknown'}
                            {courier.totalDeliveries > 0 && ` • ${courier.totalDeliveries} deliveries • $${courier.totalEarnings.toFixed(2)} earned`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedCourier(isExpanded ? null : courier);
                            setAdminNotes(courier.adminNotes || '');
                          }}
                          title={isExpanded ? 'Hide applicant details' : 'View applicant details'}
                          className="p-2.5 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-all text-zinc-500"
                        >
                          <FaEye className="text-sm" />
                        </button>
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleCourierAction(courier.id, 'approved')}
                              disabled={actionLoading === courier.id}
                              title="Approve courier application"
                              className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-all disabled:opacity-50"
                            >
                              <FaCheck className="text-sm" />
                            </button>
                            <button
                              onClick={() => handleCourierAction(courier.id, 'rejected')}
                              disabled={actionLoading === courier.id}
                              title="Reject courier application"
                              className="p-2.5 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all disabled:opacity-50"
                            >
                              <FaTimes className="text-sm" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Expanded detail panel */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 pt-4 border-t border-zinc-200"
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                          <div className="bg-white rounded-xl p-3">
                            <p className="text-[10px] font-black uppercase text-zinc-400">Vehicle</p>
                            <p className="text-sm font-bold text-black capitalize">{courier.courierVehicle}</p>
                          </div>
                          <div className="bg-white rounded-xl p-3">
                            <p className="text-[10px] font-black uppercase text-zinc-400">Deliveries</p>
                            <p className="text-sm font-bold text-black">{courier.totalDeliveries}</p>
                          </div>
                          <div className="bg-white rounded-xl p-3">
                            <p className="text-[10px] font-black uppercase text-zinc-400">Earnings</p>
                            <p className="text-sm font-bold text-emerald-600">${courier.totalEarnings.toFixed(2)}</p>
                          </div>
                          <div className="bg-white rounded-xl p-3">
                            <p className="text-[10px] font-black uppercase text-zinc-400">Rating</p>
                            <p className="text-sm font-bold text-indigo-600">{courier.rating.toFixed(1)}</p>
                          </div>
                        </div>

                        {/* Admin notes */}
                        <div className="mb-4">
                          <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">
                            Admin Notes (court records, background check results)
                          </label>
                          <textarea
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            placeholder="Add notes about background verification, court record check, etc."
                            className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black resize-none"
                            rows={3}
                          />
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2">
                          {courier.backgroundCheckStatus !== 'approved' && (
                            <button
                              onClick={() => handleCourierAction(courier.id, 'approved')}
                              disabled={actionLoading === courier.id}
                              className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              <FaCheck /> Approve Courier
                            </button>
                          )}
                          {courier.backgroundCheckStatus !== 'rejected' && (
                            <button
                              onClick={() => handleCourierAction(courier.id, 'rejected')}
                              disabled={actionLoading === courier.id}
                              className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              <FaTimes /> Reject
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              try {
                                await updateDoc(doc(db, 'couriers', courier.id), { adminNotes, updatedAt: new Date().toISOString() });
                                setCouriers(prev => prev.map(c => c.id === courier.id ? { ...c, adminNotes } : c));
                              } catch { alert('Failed to save notes'); }
                            }}
                            className="px-6 py-3 bg-zinc-100 text-zinc-600 rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all"
                          >
                            Save Notes
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

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
