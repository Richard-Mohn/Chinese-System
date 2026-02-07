'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FaGlobe,
  FaClipboardList,
  FaUtensils,
  FaChartLine,
  FaTruck,
  FaCog,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCreditCard,
  FaLink,
} from 'react-icons/fa';

interface RecentOrder {
  id: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

export default function OwnerDashboard() {
  const { currentBusiness } = useAuth();
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [orderCount, setOrderCount] = useState(0);
  const [menuItemCount, setMenuItemCount] = useState(0);

  useEffect(() => {
    if (!currentBusiness) return;

    // Fetch recent orders
    const fetchOrders = async () => {
      try {
        const ordersRef = collection(db, 'businesses', currentBusiness.businessId, 'orders');
        const q = query(ordersRef, orderBy('createdAt', 'desc'), limit(5));
        const snap = await getDocs(q);
        const orders: RecentOrder[] = [];
        snap.forEach(doc => {
          const d = doc.data();
          orders.push({
            id: doc.id,
            customerName: d.customerName || d.customer?.name || 'Customer',
            total: d.total || d.pricing?.total || 0,
            status: d.status || 'pending',
            createdAt: d.createdAt || '',
          });
        });
        setRecentOrders(orders);
      } catch {
        /* silently fail */
      }
    };

    // Fetch total order count
    const fetchOrderCount = async () => {
      try {
        const ordersRef = collection(db, 'businesses', currentBusiness.businessId, 'orders');
        const snap = await getDocs(ordersRef);
        setOrderCount(snap.size);
      } catch {
        /* silently fail */
      }
    };

    // Fetch menu item count
    const fetchMenuCount = async () => {
      try {
        const menuRef = collection(db, 'businesses', currentBusiness.businessId, 'menuItems');
        const snap = await getDocs(menuRef);
        setMenuItemCount(snap.size);
      } catch {
        /* silently fail */
      }
    };

    fetchOrders();
    fetchOrderCount();
    fetchMenuCount();
  }, [currentBusiness]);

  if (!currentBusiness) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-black text-black mb-4 tracking-tighter">No Business Found</h1>
          <p className="text-zinc-500 font-medium mb-8">
            You haven&apos;t set up your business profile yet.
          </p>
          <Link
            href="/register"
            className="px-10 py-4 bg-black text-white rounded-full font-bold shadow-xl hover:bg-zinc-800 transition-all inline-block"
          >
            Create Your Business
          </Link>
        </div>
      </div>
    );
  }

  const websiteLive = currentBusiness.website?.setupComplete === true;
  const websiteUrl = `/${currentBusiness.slug || currentBusiness.businessId}`;
  const totalSeoPages =
    1 +
    (currentBusiness.website?.selectedServices?.length || 0) +
    (currentBusiness.website?.selectedCities?.length || 0) +
    2;

  const statusColor = (s: string) => {
    if (s === 'delivered' || s === 'completed') return 'bg-emerald-100 text-emerald-700';
    if (s === 'preparing' || s === 'ready') return 'bg-amber-100 text-amber-700';
    if (s === 'cancelled') return 'bg-red-100 text-red-700';
    return 'bg-zinc-100 text-zinc-600';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-black">
          Dashboard
        </h1>
        <p className="text-zinc-400 font-medium mt-1">
          {currentBusiness.name} — {currentBusiness.city}, {currentBusiness.state}
        </p>
      </div>

      {/* ── Website Status Banner ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-6 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          websiteLive
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-amber-50 border-amber-200'
        }`}
      >
        <div className="flex items-center gap-4">
          {websiteLive ? (
            <FaCheckCircle className="text-emerald-500 text-xl shrink-0" />
          ) : (
            <FaExclamationTriangle className="text-amber-500 text-xl shrink-0" />
          )}
          <div>
            <p className={`font-bold ${websiteLive ? 'text-emerald-800' : 'text-amber-800'}`}>
              {websiteLive ? 'Your Website is Live' : 'Website Not Published Yet'}
            </p>
            <p className={`text-sm ${websiteLive ? 'text-emerald-600' : 'text-amber-600'}`}>
              {websiteLive
                ? `${totalSeoPages} SEO pages are published and being indexed by Google.`
                : 'Set up your SEO website to start getting organic traffic.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {websiteLive && (
            <a
              href={websiteUrl}
              target="_blank"
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-full text-sm font-bold hover:bg-emerald-700 transition-colors"
            >
              <FaExternalLinkAlt className="text-xs" />
              View Live Site
            </a>
          )}
          <Link
            href="/owner/website"
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-colors ${
              websiteLive
                ? 'bg-white text-emerald-700 hover:bg-emerald-100'
                : 'bg-amber-600 text-white hover:bg-amber-700'
            }`}
          >
            {websiteLive ? 'Edit Website' : 'Build Website →'}
          </Link>
        </div>
      </motion.div>

      {/* ── Stripe Connect Banner ──────────────────────────── */}
      {!currentBusiness.stripeAccountId && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 border bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <FaCreditCard className="text-orange-500 text-xl shrink-0" />
            <div>
              <p className="font-bold text-orange-800">Accept Card Payments</p>
              <p className="text-sm text-orange-600">
                Connect your Stripe account to receive card payments directly. Takes 5 minutes. You&apos;re currently only accepting cash orders.
              </p>
            </div>
          </div>
          <Link
            href="/owner/drivers"
            className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-sm font-bold hover:shadow-lg hover:shadow-orange-500/20 transition-all whitespace-nowrap"
          >
            Connect Stripe →
          </Link>
        </motion.div>
      )}

      {/* ── Custom Domain Banner ───────────────────────────── */}
      {!currentBusiness.website?.domainPurchased && websiteLive && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 border bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <FaLink className="text-blue-500 text-xl shrink-0" />
            <div>
              <p className="font-bold text-blue-800">Get a Custom Domain</p>
              <p className="text-sm text-blue-600">
                Make your business stand out with your own domain like <strong>{currentBusiness.name?.toLowerCase().replace(/[^a-z0-9]/g, '')}.com</strong>. Starting at ~$17/yr with automatic DNS &amp; SSL setup.
              </p>
            </div>
          </div>
          <Link
            href="/owner/domain"
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-sm font-bold hover:shadow-lg hover:shadow-blue-500/20 transition-all whitespace-nowrap"
          >
            Search Domains →
          </Link>
        </motion.div>
      )}

      {/* ── Quick Stats ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Orders',
            value: orderCount.toLocaleString(),
            sub: 'all time',
            color: 'text-orange-600',
          },
          {
            label: 'Menu Items',
            value: menuItemCount.toLocaleString(),
            sub: 'active items',
            color: 'text-emerald-600',
          },
          {
            label: 'SEO Pages',
            value: websiteLive ? totalSeoPages.toLocaleString() : '—',
            sub: websiteLive ? 'indexed' : 'not published',
            color: 'text-orange-500',
          },
          {
            label: 'Drivers',
            value: `${currentBusiness.inHouseDriverIds?.length || 0}`,
            sub: `of ${currentBusiness.maxInhouseDrivers} max`,
            color: 'text-orange-400',
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-5 border border-zinc-100"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
              {stat.label}
            </p>
            <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-zinc-400 mt-1">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Quick Actions ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            icon: FaGlobe,
            title: 'Website',
            desc: websiteLive ? `${totalSeoPages} pages live` : 'Set up your site',
            href: '/owner/website',
            accent: 'group-hover:bg-orange-600',
          },
          {
            icon: FaClipboardList,
            title: 'Orders',
            desc: `${orderCount} total orders`,
            href: '/owner/orders',
            accent: 'group-hover:bg-orange-500',
          },
          {
            icon: FaUtensils,
            title: 'Menu',
            desc: `${menuItemCount} items`,
            href: '/owner/menu',
            accent: 'group-hover:bg-emerald-600',
          },
          {
            icon: FaTruck,
            title: 'Drivers',
            desc: `${currentBusiness.inHouseDriverIds?.length || 0} active`,
            href: '/owner/drivers',
            accent: 'group-hover:bg-orange-400',
          },
          {
            icon: FaChartLine,
            title: 'Analytics',
            desc: 'Revenue & insights',
            href: '/owner/analytics',
            accent: 'group-hover:bg-red-500',
          },
          {
            icon: FaCog,
            title: 'Settings',
            desc: 'Business config',
            href: '/owner/settings',
            accent: 'group-hover:bg-zinc-800',
          },
        ].map((action, i) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href} className="group">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="bg-white rounded-2xl p-6 border border-zinc-100 hover:border-zinc-300 transition-all h-full"
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center mb-4 group-hover:text-white transition-colors ${action.accent}`}
                >
                  <Icon className="text-sm" />
                </div>
                <h3 className="font-bold text-black text-sm">{action.title}</h3>
                <p className="text-zinc-400 text-xs mt-1">{action.desc}</p>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* ── Recent Orders ───────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-zinc-100">
          <h2 className="font-bold text-black">Recent Orders</h2>
          <Link href="/owner/orders" className="text-xs font-bold text-orange-600 hover:underline">
            View All →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-zinc-400 font-medium text-sm">No orders yet.</p>
            <p className="text-zinc-400 text-xs mt-1">
              Orders will appear here once customers start ordering.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-50">
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between px-5 py-4 hover:bg-zinc-50 transition-colors">
                <div>
                  <p className="font-bold text-black text-sm">{order.customerName}</p>
                  <p className="text-xs text-zinc-400">
                    #{order.id.slice(-6).toUpperCase()}
                    {order.createdAt && (
                      <> · {new Date(order.createdAt).toLocaleDateString()}</>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="font-bold text-black text-sm">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── System Status ───────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-5 flex flex-wrap items-center gap-8">
        {[
          {
            label: 'Ordering',
            active: currentBusiness.settings?.orderingEnabled !== false,
          },
          { label: 'Website', active: websiteLive },
          {
            label: 'Payments',
            active: true, // Stripe always connected
          },
        ].map(sys => (
          <div key={sys.label} className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                sys.active ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-300'
              }`}
            />
            <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
              {sys.label}: {sys.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
