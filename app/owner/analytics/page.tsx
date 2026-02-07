'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  FaChartLine, FaSearch, FaGlobe, FaMobileAlt, FaDesktop, FaTabletAlt,
  FaArrowUp, FaEye, FaMousePointer, FaMapMarkerAlt,
  FaLock, FaCrown, FaExternalLinkAlt, FaSync, FaChartBar,
  FaUsers, FaSignal, FaClipboardList,
} from 'react-icons/fa';

type Tab = 'overview' | 'seo' | 'traffic' | 'live';

interface DayStat { date: string; orders: number; revenue: number }
interface TopItem { name: string; count: number; revenue: number }

interface SearchConsoleData {
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  topQueries: { query: string; impressions: number; clicks: number; ctr: number; position: number }[];
  topPages: { page: string; impressions: number; clicks: number; ctr: number; position: number }[];
  devices: { device: string; impressions: number; clicks: number }[];
}

interface AnalyticsData {
  overview: {
    sessions: number;
    totalUsers: number;
    pageviews: number;
    avgSessionDuration: number;
    bounceRate: number;
    newUsers: number;
  };
  trafficSources: { source: string; medium: string; sessions: number; users: number }[];
  topPages: { pagePath: string; pageviews: number; avgTimeOnPage: number; bounceRate: number }[];
  devices: { deviceCategory: string; sessions: number; users: number; percentage: number }[];
  geography: { city: string; country: string; sessions: number; users: number }[];
  dailyTraffic: { date: string; sessions: number; users: number; pageviews: number }[];
}

interface RealtimeData {
  activeUsers: number;
  activePages: { pagePath: string; activeUsers: number }[];
  activeSources: { source: string; activeUsers: number }[];
  activeDevices: { deviceCategory: string; activeUsers: number }[];
}

export default function OwnerAnalyticsPage() {
  const { currentBusiness } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [dateRange, setDateRange] = useState(28);

  // Order analytics state
  const [loading, setLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [avgOrderValue, setAvgOrderValue] = useState(0);
  const [dailyStats, setDailyStats] = useState<DayStat[]>([]);
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [ordersByType, setOrdersByType] = useState({ delivery: 0, pickup: 0 });
  const [ordersByStatus, setOrdersByStatus] = useState<Record<string, number>>({});

  // SEO state
  const [seoData, setSeoData] = useState<SearchConsoleData | null>(null);
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoError, setSeoError] = useState<string | null>(null);

  // Traffic state
  const [trafficData, setTrafficData] = useState<AnalyticsData | null>(null);
  const [trafficLoading, setTrafficLoading] = useState(false);
  const [trafficError, setTrafficError] = useState<string | null>(null);

  // Realtime state
  const [realtimeData, setRealtimeData] = useState<RealtimeData | null>(null);
  const [realtimeLoading, setRealtimeLoading] = useState(false);

  const tier = currentBusiness?.tier || 'starter';
  const slug = currentBusiness?.slug || currentBusiness?.businessId || '';
  const hasGrowth = tier === 'growth' || tier === 'professional' || tier === 'reseller';
  const hasPro = tier === 'professional' || tier === 'reseller';

  // ── Fetch order analytics ──
  useEffect(() => {
    if (!currentBusiness) return;
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const ordersRef = collection(db, 'businesses', currentBusiness.businessId, 'orders');
        const q = query(ordersRef, orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        let revenue = 0;
        const dayMap: Record<string, { orders: number; revenue: number }> = {};
        const itemMap: Record<string, { count: number; revenue: number }> = {};
        const typeCount = { delivery: 0, pickup: 0 };
        const statusCount: Record<string, number> = {};
        snap.forEach(docSnap => {
          const d = docSnap.data();
          const total = d.total || d.pricing?.total || 0;
          revenue += total;
          const date = d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Unknown';
          if (!dayMap[date]) dayMap[date] = { orders: 0, revenue: 0 };
          dayMap[date].orders++;
          dayMap[date].revenue += total;
          (d.items || []).forEach((item: { name?: string; quantity?: number; price?: number }) => {
            const name = item.name || 'Unknown Item';
            if (!itemMap[name]) itemMap[name] = { count: 0, revenue: 0 };
            itemMap[name].count += item.quantity || 1;
            itemMap[name].revenue += (item.price || 0) * (item.quantity || 1);
          });
          if ((d.orderType || 'delivery') === 'pickup') typeCount.pickup++;
          else typeCount.delivery++;
          const status = d.status || 'pending';
          statusCount[status] = (statusCount[status] || 0) + 1;
        });
        setTotalOrders(snap.size);
        setTotalRevenue(revenue);
        setAvgOrderValue(snap.size > 0 ? revenue / snap.size : 0);
        setDailyStats(Object.entries(dayMap).map(([date, data]) => ({ date, ...data })).slice(0, 14));
        setTopItems(Object.entries(itemMap).map(([name, data]) => ({ name, ...data })).sort((a, b) => b.count - a.count).slice(0, 10));
        setOrdersByType(typeCount);
        setOrdersByStatus(statusCount);
      } catch { /* */ }
      finally { setLoading(false); }
    };
    fetchAnalytics();
  }, [currentBusiness]);

  // ── Fetch SEO data ──
  const fetchSeoData = useCallback(async () => {
    if (!slug || !hasGrowth) return;
    setSeoLoading(true);
    setSeoError(null);
    try {
      const res = await fetch(`/api/tenant-seo/search-console?slug=${slug}&days=${dateRange}`);
      const json = await res.json();
      if (json.success) setSeoData(json.data);
      else setSeoError(json.error || 'Failed to load');
    } catch (e) {
      setSeoError(e instanceof Error ? e.message : 'Network error');
    } finally { setSeoLoading(false); }
  }, [slug, dateRange, hasGrowth]);

  // ── Fetch traffic data ──
  const fetchTrafficData = useCallback(async () => {
    if (!slug || !hasGrowth) return;
    setTrafficLoading(true);
    setTrafficError(null);
    try {
      const res = await fetch(`/api/tenant-seo/analytics?slug=${slug}&days=${dateRange}`);
      const json = await res.json();
      if (json.success) setTrafficData(json.data);
      else setTrafficError(json.error || 'Failed to load');
    } catch (e) {
      setTrafficError(e instanceof Error ? e.message : 'Network error');
    } finally { setTrafficLoading(false); }
  }, [slug, dateRange, hasGrowth]);

  // ── Fetch realtime data ──
  const fetchRealtimeData = useCallback(async () => {
    if (!slug || !hasPro) return;
    setRealtimeLoading(true);
    try {
      const res = await fetch(`/api/tenant-seo/realtime?slug=${slug}`);
      const json = await res.json();
      if (json.success) setRealtimeData(json.data);
    } catch { /* */ }
    finally { setRealtimeLoading(false); }
  }, [slug, hasPro]);

  // Auto-fetch when tab changes
  useEffect(() => {
    if (activeTab === 'seo') fetchSeoData();
    if (activeTab === 'traffic') fetchTrafficData();
    if (activeTab === 'live') fetchRealtimeData();
  }, [activeTab, fetchSeoData, fetchTrafficData, fetchRealtimeData]);

  // Auto-refresh realtime every 30s
  useEffect(() => {
    if (activeTab !== 'live' || !hasPro) return;
    const interval = setInterval(fetchRealtimeData, 30000);
    return () => clearInterval(interval);
  }, [activeTab, hasPro, fetchRealtimeData]);

  if (!currentBusiness) return null;

  const maxDayRevenue = Math.max(...dailyStats.map(d => d.revenue), 1);

  const tabs: { id: Tab; label: string; icon: typeof FaChartLine; requiresTier?: string; beta?: boolean }[] = [
    { id: 'overview', label: 'Overview', icon: FaChartBar },
    { id: 'seo', label: 'SEO', icon: FaSearch, requiresTier: 'growth', beta: true },
    { id: 'traffic', label: 'Traffic', icon: FaGlobe, requiresTier: 'growth', beta: true },
    { id: 'live', label: 'Live', icon: FaSignal, requiresTier: 'professional', beta: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-black">Analytics</h1>
          <p className="text-zinc-400 font-medium mt-1">Revenue, SEO, traffic & live visitor insights.</p>
        </div>
        {activeTab !== 'overview' && activeTab !== 'live' && (
          <select
            value={dateRange}
            onChange={e => setDateRange(parseInt(e.target.value))}
            className="px-4 py-2 border border-zinc-200 rounded-xl text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={28}>Last 28 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-zinc-100 rounded-2xl p-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const locked = (tab.requiresTier === 'growth' && !hasGrowth) ||
                         (tab.requiresTier === 'professional' && !hasPro);
          return (
            <button
              key={tab.id}
              onClick={() => !locked && setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all relative ${
                activeTab === tab.id
                  ? 'bg-white text-black shadow-sm'
                  : locked
                    ? 'text-zinc-300 cursor-not-allowed'
                    : 'text-zinc-500 hover:text-black'
              }`}
            >
              {locked ? <FaLock className="text-xs" /> : <Icon className="text-xs" />}
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.beta && !locked && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">
                  Beta
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <OverviewTab
              loading={loading}
              totalOrders={totalOrders}
              totalRevenue={totalRevenue}
              avgOrderValue={avgOrderValue}
              dailyStats={dailyStats}
              topItems={topItems}
              ordersByType={ordersByType}
              ordersByStatus={ordersByStatus}
              maxDayRevenue={maxDayRevenue}
            />
          )}
          {activeTab === 'seo' && (
            hasGrowth ? (
              <SeoTab data={seoData} loading={seoLoading} error={seoError} onRefresh={fetchSeoData} slug={slug} />
            ) : (
              <UpgradeGate feature="SEO Analytics" tier="Growth" price="$49.99/mo" />
            )
          )}
          {activeTab === 'traffic' && (
            hasGrowth ? (
              <TrafficTab data={trafficData} loading={trafficLoading} error={trafficError} onRefresh={fetchTrafficData} />
            ) : (
              <UpgradeGate feature="Traffic Analytics" tier="Growth" price="$49.99/mo" />
            )
          )}
          {activeTab === 'live' && (
            hasPro ? (
              <LiveTab data={realtimeData} loading={realtimeLoading} onRefresh={fetchRealtimeData} />
            ) : (
              <UpgradeGate feature="Live Visitor Dashboard" tier="Professional" price="$99.99/mo" />
            )
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Upgrade Gate ─────────────────────────────────────────────

function UpgradeGate({ feature, tier, price }: { feature: string; tier: string; price: string }) {
  return (
    <div className="bg-gradient-to-br from-zinc-50 to-zinc-100 rounded-2xl border border-zinc-200 p-12 text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <FaCrown className="text-white text-2xl" />
      </div>
      <h3 className="text-2xl font-black text-black mb-2">{feature}</h3>
      <p className="text-zinc-500 mb-6 max-w-md mx-auto">
        Unlock {feature.toLowerCase()} with the <strong>{tier}</strong> plan.
        See how customers find your business, what they search for, and where your traffic comes from.
      </p>
      <div className="mb-6">
        <span className="text-4xl font-black text-black">{price}</span>
        <span className="text-zinc-400 ml-1">/month</span>
      </div>
      <Link
        href="/pricing"
        className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white rounded-full font-bold hover:bg-zinc-800 transition-colors"
      >
        Upgrade to {tier} <FaExternalLinkAlt className="text-xs" />
      </Link>
    </div>
  );
}

// ── Loading Skeleton ─────────────────────────────────────────

function LoadingCard() {
  return (
    <div className="bg-white rounded-2xl border border-zinc-100 p-6 animate-pulse">
      <div className="h-3 w-24 bg-zinc-200 rounded mb-4" />
      <div className="h-8 w-32 bg-zinc-200 rounded mb-2" />
      <div className="h-3 w-40 bg-zinc-100 rounded" />
    </div>
  );
}

function SetupNotice({ error, onRefresh }: { error: string; onRefresh: () => void }) {
  const isSetup = error.includes('not configured') || error.includes('Search Console');
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
      <p className="text-amber-800 font-bold mb-2">{isSetup ? '⚙️ Setup Required' : '⚠️ Error Loading Data'}</p>
      <p className="text-amber-600 text-sm mb-4">{error}</p>
      {isSetup ? (
        <p className="text-amber-600 text-xs">
          Google Search Console needs to be verified for mohnmenu.com. This is a one-time setup step.
          Once verified, your SEO data will appear here automatically.
        </p>
      ) : (
        <button onClick={onRefresh} className="px-4 py-2 bg-amber-600 text-white rounded-full text-sm font-bold hover:bg-amber-700 transition-colors">
          <FaSync className="inline mr-2" /> Retry
        </button>
      )}
    </div>
  );
}

// ── Overview Tab (Orders) ────────────────────────────────────

function OverviewTab({
  loading, totalOrders, totalRevenue, avgOrderValue, dailyStats, topItems,
  ordersByType, ordersByStatus, maxDayRevenue,
}: {
  loading: boolean;
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  dailyStats: DayStat[];
  topItems: TopItem[];
  ordersByType: { delivery: number; pickup: number };
  ordersByStatus: Record<string, number>;
  maxDayRevenue: number;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <LoadingCard key={i} />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: 'text-emerald-600' },
          { label: 'Total Orders', value: totalOrders.toLocaleString(), color: 'text-indigo-600' },
          { label: 'Avg Order Value', value: `$${avgOrderValue.toFixed(2)}`, color: 'text-blue-600' },
          { label: 'Delivery / Pickup', value: `${ordersByType.delivery} / ${ordersByType.pickup}`, color: 'text-purple-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-zinc-100 p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Daily Revenue Chart */}
      {dailyStats.length > 0 && (
        <div className="bg-white rounded-2xl border border-zinc-100 p-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-6">
            Daily Revenue (Last {dailyStats.length} days)
          </h2>
          <div className="flex items-end gap-1 h-48">
            {dailyStats.slice().reverse().map((day, i) => {
              const height = (day.revenue / maxDayRevenue) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end group">
                  <div className="relative w-full">
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap z-10 transition-opacity">
                      ${day.revenue.toFixed(0)} · {day.orders} orders
                    </div>
                    <div className="w-full bg-indigo-500 rounded-t-md hover:bg-indigo-600 transition-colors min-h-1" style={{ height: `${Math.max(height, 2)}%` }} />
                  </div>
                  <p className="text-[8px] text-zinc-400 mt-1 truncate w-full text-center">{day.date.replace(/\/\d{4}$/, '')}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Items + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-zinc-100 p-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Top Menu Items</h2>
          {topItems.length === 0 ? (
            <p className="text-zinc-400 text-sm">No order data yet.</p>
          ) : (
            <div className="space-y-3">
              {topItems.map((item, i) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-zinc-100 rounded-full flex items-center justify-center text-[10px] font-black text-zinc-500 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-black text-sm truncate">{item.name}</p>
                    <p className="text-xs text-zinc-400">{item.count} sold · ${item.revenue.toFixed(2)}</p>
                  </div>
                  <div className="w-20 bg-zinc-100 rounded-full h-2 shrink-0">
                    <div className="bg-indigo-500 rounded-full h-2" style={{ width: `${(item.count / (topItems[0]?.count || 1)) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-zinc-100 p-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Order Status Breakdown</h2>
          {Object.keys(ordersByStatus).length === 0 ? (
            <p className="text-zinc-400 text-sm">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(ordersByStatus).sort((a, b) => b[1] - a[1]).map(([status, count]) => {
                const colorMap: Record<string, string> = {
                  pending: 'bg-amber-500', confirmed: 'bg-blue-500', preparing: 'bg-orange-500',
                  ready: 'bg-indigo-500', 'out-for-delivery': 'bg-purple-500', delivered: 'bg-emerald-500',
                  completed: 'bg-emerald-500', cancelled: 'bg-red-500',
                };
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${colorMap[status] || 'bg-zinc-400'}`} />
                      <span className="font-bold text-black text-sm capitalize">{status.replace(/-/g, ' ')}</span>
                    </div>
                    <span className="font-bold text-zinc-500 text-sm">{count}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-zinc-100">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">Order Type</h3>
            <div className="flex gap-4">
              <div className="flex-1 bg-zinc-50 rounded-xl p-3 text-center">
                <p className="text-lg font-black text-black">{ordersByType.delivery}</p>
                <p className="text-[10px] font-bold text-zinc-400">🚗 Delivery</p>
              </div>
              <div className="flex-1 bg-zinc-50 rounded-xl p-3 text-center">
                <p className="text-lg font-black text-black">{ordersByType.pickup}</p>
                <p className="text-[10px] font-bold text-zinc-400">🏪 Pickup</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SEO Tab ──────────────────────────────────────────────────

function SeoTab({ data, loading, error, onRefresh, slug }: {
  data: SearchConsoleData | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  slug: string;
}) {
  if (loading) return <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <LoadingCard key={i} />)}</div>;
  if (error) return <SetupNotice error={error} onRefresh={onRefresh} />;
  if (!data) return <SetupNotice error="No data available. Try refreshing." onRefresh={onRefresh} />;

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-400 font-medium">
          Data from Google Search Console · Updated ~24-48hrs delayed
        </p>
        <button onClick={onRefresh} className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-black transition-colors">
          <FaSync className="text-[10px]" /> Refresh
        </button>
      </div>

      {/* SEO KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Impressions', value: data.impressions.toLocaleString(), icon: FaEye, color: 'text-blue-600', desc: 'Google Search appearances' },
          { label: 'Clicks', value: data.clicks.toLocaleString(), icon: FaMousePointer, color: 'text-emerald-600', desc: 'Clicked through to site' },
          { label: 'CTR', value: `${(data.ctr * 100).toFixed(1)}%`, icon: FaArrowUp, color: 'text-orange-600', desc: 'Click-through rate' },
          { label: 'Avg Position', value: data.position.toFixed(1), icon: FaChartLine, color: 'text-indigo-600', desc: 'Average ranking' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl border border-zinc-100 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="text-zinc-300 text-xs" />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{stat.label}</p>
              </div>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-zinc-400 mt-1">{stat.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Top Queries + Top Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-zinc-100 p-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
            <FaSearch className="text-zinc-300" /> Top Search Queries
          </h2>
          {data.topQueries.length === 0 ? (
            <p className="text-zinc-400 text-sm">No query data yet. It takes 3-5 days for data to appear after your site is indexed.</p>
          ) : (
            <div className="space-y-2">
              {data.topQueries.slice(0, 10).map((q, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-[10px] font-black text-zinc-400 w-5 shrink-0">{i + 1}</span>
                    <span className="font-medium text-sm text-black truncate">{q.query}</span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    <span className="text-xs text-zinc-400">{q.impressions} imp</span>
                    <span className="text-xs font-bold text-emerald-600">{q.clicks} clicks</span>
                    <span className="text-[10px] text-zinc-400">#{q.position.toFixed(0)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-zinc-100 p-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
            <FaClipboardList className="text-zinc-300" /> Top Pages
          </h2>
          {data.topPages.length === 0 ? (
            <p className="text-zinc-400 text-sm">No page data yet.</p>
          ) : (
            <div className="space-y-2">
              {data.topPages.slice(0, 10).map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-[10px] font-black text-zinc-400 w-5 shrink-0">{i + 1}</span>
                    <span className="font-medium text-xs text-black truncate">
                      {p.page || `/${slug}/`}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    <span className="text-xs text-zinc-400">{p.impressions} imp</span>
                    <span className="text-xs font-bold text-emerald-600">{p.clicks} clicks</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Device Breakdown */}
      {data.devices.length > 0 && (
        <div className="bg-white rounded-2xl border border-zinc-100 p-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Search Devices</h2>
          <div className="grid grid-cols-3 gap-4">
            {data.devices.map(d => {
              const icons: Record<string, typeof FaDesktop> = { MOBILE: FaMobileAlt, DESKTOP: FaDesktop, TABLET: FaTabletAlt };
              const Icon = icons[d.device] || FaGlobe;
              return (
                <div key={d.device} className="bg-zinc-50 rounded-xl p-4 text-center">
                  <Icon className="text-xl text-zinc-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-black capitalize">{d.device.toLowerCase()}</p>
                  <p className="text-xs text-zinc-400">{d.clicks} clicks · {d.impressions} imp</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SEO Page Status */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 p-6">
        <h2 className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-3">
          Your SEO Website
        </h2>
        <p className="text-sm text-emerald-700">
          Your auto-generated website at <strong>mohnmenu.com/{slug}</strong> is being indexed by Google.
          Service pages, location pages, and menu items all have structured data (JSON-LD) that helps
          Google understand your business. Rich snippets will begin appearing in search results as pages are crawled.
        </p>
      </div>
    </div>
  );
}

// ── Traffic Tab ──────────────────────────────────────────────

function TrafficTab({ data, loading, error, onRefresh }: {
  data: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}) {
  if (loading) return <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <LoadingCard key={i} />)}</div>;
  if (error) return <SetupNotice error={error} onRefresh={onRefresh} />;
  if (!data) return <SetupNotice error="No data available. Try refreshing." onRefresh={onRefresh} />;

  const o = data.overview;

  return (
    <div className="space-y-6">
      {/* Refresh */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-400 font-medium">Data from Google Analytics 4</p>
        <button onClick={onRefresh} className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-black transition-colors">
          <FaSync className="text-[10px]" /> Refresh
        </button>
      </div>

      {/* Traffic KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Sessions', value: o.sessions.toLocaleString(), color: 'text-blue-600' },
          { label: 'Users', value: o.totalUsers.toLocaleString(), color: 'text-indigo-600' },
          { label: 'Pageviews', value: o.pageviews.toLocaleString(), color: 'text-emerald-600' },
          { label: 'New Users', value: o.newUsers.toLocaleString(), color: 'text-orange-600' },
          { label: 'Avg Duration', value: `${Math.floor(o.avgSessionDuration / 60)}m ${Math.floor(o.avgSessionDuration % 60)}s`, color: 'text-purple-600' },
          { label: 'Bounce Rate', value: `${(o.bounceRate * 100).toFixed(1)}%`, color: o.bounceRate > 0.7 ? 'text-red-600' : 'text-emerald-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-zinc-100 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{stat.label}</p>
            <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Daily Traffic Chart */}
      {data.dailyTraffic.length > 0 && (
        <div className="bg-white rounded-2xl border border-zinc-100 p-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-6">Daily Traffic</h2>
          <div className="flex items-end gap-1 h-48">
            {data.dailyTraffic.map((day, i) => {
              const maxPV = Math.max(...data.dailyTraffic.map(d => d.pageviews), 1);
              const height = (day.pageviews / maxPV) * 100;
              const dateStr = day.date.replace(/(\d{4})(\d{2})(\d{2})/, '$2/$3');
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end group">
                  <div className="relative w-full">
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap z-10 transition-opacity">
                      {day.pageviews} views · {day.sessions} sessions · {day.users} users
                    </div>
                    <div
                      className="w-full bg-emerald-500 rounded-t-md hover:bg-emerald-600 transition-colors min-h-1"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    />
                  </div>
                  {data.dailyTraffic.length <= 30 && (
                    <p className="text-[7px] text-zinc-400 mt-1 truncate w-full text-center">{dateStr}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sources + Devices + Geo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Traffic Sources */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Traffic Sources</h2>
          {data.trafficSources.length === 0 ? (
            <p className="text-zinc-400 text-sm">No traffic data yet.</p>
          ) : (
            <div className="space-y-2">
              {data.trafficSources.slice(0, 8).map((s, i) => (
                <div key={i} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-sm font-medium text-black truncate">
                      {s.source === '(direct)' ? 'Direct' : s.source}
                    </span>
                    <span className="text-[10px] text-zinc-400">/ {s.medium}</span>
                  </div>
                  <span className="text-xs font-bold text-zinc-500 shrink-0 ml-2">{s.sessions}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Device Breakdown */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Devices</h2>
          {data.devices.length === 0 ? (
            <p className="text-zinc-400 text-sm">No device data yet.</p>
          ) : (
            <div className="space-y-3">
              {data.devices.map(d => {
                const icons: Record<string, typeof FaDesktop> = { mobile: FaMobileAlt, desktop: FaDesktop, tablet: FaTabletAlt };
                const Icon = icons[d.deviceCategory] || FaGlobe;
                return (
                  <div key={d.deviceCategory} className="flex items-center gap-3">
                    <Icon className="text-zinc-400 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-black capitalize">{d.deviceCategory}</span>
                        <span className="text-xs font-bold text-zinc-500">{d.percentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-zinc-100 rounded-full h-2">
                        <div className="bg-indigo-500 rounded-full h-2" style={{ width: `${d.percentage}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Geography */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
            <FaMapMarkerAlt className="text-zinc-300" /> Top Locations
          </h2>
          {data.geography.length === 0 ? (
            <p className="text-zinc-400 text-sm">No location data yet.</p>
          ) : (
            <div className="space-y-2">
              {data.geography.slice(0, 8).map((g, i) => (
                <div key={i} className="flex items-center justify-between py-1.5">
                  <span className="text-sm font-medium text-black truncate">
                    {g.city === '(not set)' ? g.country : `${g.city}, ${g.country}`}
                  </span>
                  <span className="text-xs font-bold text-zinc-500 shrink-0 ml-2">{g.sessions} sessions</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Pages */}
      {data.topPages.length > 0 && (
        <div className="bg-white rounded-2xl border border-zinc-100 p-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Top Pages</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  <th className="pb-3 pr-4">Page</th>
                  <th className="pb-3 pr-4 text-right">Views</th>
                  <th className="pb-3 pr-4 text-right">Avg Time</th>
                  <th className="pb-3 text-right">Bounce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {data.topPages.slice(0, 10).map((p, i) => (
                  <tr key={i} className="hover:bg-zinc-50">
                    <td className="py-2.5 pr-4 font-medium truncate max-w-[200px]">{p.pagePath}</td>
                    <td className="py-2.5 pr-4 text-right font-bold">{p.pageviews}</td>
                    <td className="py-2.5 pr-4 text-right text-zinc-500">
                      {Math.floor(p.avgTimeOnPage / 60)}m {Math.floor(p.avgTimeOnPage % 60)}s
                    </td>
                    <td className="py-2.5 text-right text-zinc-500">{(p.bounceRate * 100).toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Live Tab (Realtime) ──────────────────────────────────────

function LiveTab({ data, loading, onRefresh }: {
  data: RealtimeData | null;
  loading: boolean;
  onRefresh: () => void;
}) {
  if (loading && !data) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-100 p-16 text-center">
        <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-zinc-400 font-bold text-sm">Connecting to real-time data...</p>
      </div>
    );
  }

  if (!data) {
    return <SetupNotice error="Real-time data not available. Ensure GA4 is configured." onRefresh={onRefresh} />;
  }

  return (
    <div className="space-y-6">
      {/* Live indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Live — Auto-refreshes every 30s</span>
        </div>
        <button onClick={onRefresh} className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-black transition-colors">
          <FaSync className={`text-[10px] ${loading ? 'animate-spin' : ''}`} /> Refresh Now
        </button>
      </div>

      {/* Big active user count */}
      <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-8 text-center text-white">
        <FaUsers className="text-4xl mx-auto mb-4 opacity-80" />
        <p className="text-6xl font-black mb-2">{data.activeUsers}</p>
        <p className="text-emerald-100 font-bold">
          {data.activeUsers === 1 ? 'Active Visitor Right Now' : 'Active Visitors Right Now'}
        </p>
      </div>

      {/* Active details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Pages */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Active Pages</h2>
          {data.activePages.length === 0 ? (
            <p className="text-zinc-400 text-sm">No active pages</p>
          ) : (
            <div className="space-y-2">
              {data.activePages.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-0">
                  <span className="text-sm font-medium text-black truncate flex-1">{p.pagePath}</span>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-sm font-bold text-emerald-600">{p.activeUsers}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Sources */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Traffic Sources</h2>
          {data.activeSources.length === 0 ? (
            <p className="text-zinc-400 text-sm">No active sources</p>
          ) : (
            <div className="space-y-2">
              {data.activeSources.map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-0">
                  <span className="text-sm font-medium text-black">{s.source === '(direct)' ? 'Direct' : s.source}</span>
                  <span className="text-sm font-bold text-indigo-600">{s.activeUsers} users</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Devices */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Devices</h2>
          {data.activeDevices.length === 0 ? (
            <p className="text-zinc-400 text-sm">No active devices</p>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {data.activeDevices.map(d => {
                const emojiMap: Record<string, string> = { mobile: '📱', desktop: '💻', tablet: '📟' };
                return (
                  <div key={d.deviceCategory} className="bg-zinc-50 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{emojiMap[d.deviceCategory] || '🌐'}</span>
                      <span className="font-bold text-black text-sm capitalize">{d.deviceCategory}</span>
                    </div>
                    <span className="text-lg font-black text-black">{d.activeUsers}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
