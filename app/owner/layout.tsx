'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FaHome,
  FaGlobe,
  FaClipboardList,
  FaUtensils,
  FaChartLine,
  FaCog,
  FaTruck,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaMapMarkerAlt,
  FaDesktop,
  FaVideo,
  FaGavel,
  FaLink,
  FaUsers,
  FaLock,
  FaCrown,
  FaCalendarAlt,
  FaMusic,
  FaThLarge,
} from 'react-icons/fa';
import type { FeatureKey } from '@/lib/tier-features';
import { OWNER_PAGE_FEATURE, tierMeetsRequirement, FEATURE_REGISTRY } from '@/lib/tier-features';
import type { SubscriptionTier } from '@/lib/types';

const NAV_ITEMS: { href: string; label: string; icon: any; beta?: boolean }[] = [
  { href: '/owner', label: 'Dashboard', icon: FaHome },
  { href: '/owner/website', label: 'Website', icon: FaGlobe },
  { href: '/owner/orders', label: 'Orders', icon: FaClipboardList },
  { href: '/owner/kds', label: 'Kitchen Display', icon: FaDesktop },
  { href: '/owner/menu', label: 'Menu', icon: FaUtensils },
  { href: '/owner/staff', label: 'Staff', icon: FaUsers },
  { href: '/owner/reservations', label: 'Reservations', icon: FaCalendarAlt },
  { href: '/owner/chef-cam', label: 'Chef Cam', icon: FaVideo },
  { href: '/owner/entertainment', label: 'Entertainment', icon: FaMusic },
  { href: '/owner/floor-plan', label: 'Floor Plan', icon: FaThLarge },
  { href: '/owner/auctions', label: 'Auctions', icon: FaGavel, beta: true },
  { href: '/owner/drivers', label: 'Drivers', icon: FaTruck },
  { href: '/owner/dispatch', label: 'Dispatch', icon: FaMapMarkerAlt },
  { href: '/owner/domain', label: 'Custom Domain', icon: FaLink },
  { href: '/owner/analytics', label: 'Analytics', icon: FaChartLine },
  { href: '/owner/settings', label: 'Settings', icon: FaCog },
];

const TIER_BADGE: Record<string, { label: string; color: string }> = {
  free:         { label: 'Free Trial',    color: 'bg-zinc-100 text-zinc-500' },
  starter:      { label: 'Starter',       color: 'bg-emerald-50 text-emerald-700' },
  growth:       { label: 'Growth',        color: 'bg-blue-50 text-blue-700' },
  professional: { label: 'Professional',  color: 'bg-amber-50 text-amber-700' },
  reseller:     { label: 'Reseller',      color: 'bg-purple-50 text-purple-700' },
};

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const { user, MohnMenuUser, currentBusiness, loading, isOwner, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const businessTier = (currentBusiness?.tier || 'free') as SubscriptionTier;
  const tierBadge = TIER_BADGE[businessTier] || TIER_BADGE.free;

  // Pre-compute which nav items are locked
  const navLocks = useMemo(() => {
    const locks: Record<string, boolean> = {};
    for (const item of NAV_ITEMS) {
      const featureKey = OWNER_PAGE_FEATURE[item.href];
      if (featureKey) {
        locks[item.href] = !tierMeetsRequirement(businessTier, FEATURE_REGISTRY[featureKey].minTier);
      }
    }
    return locks;
  }, [businessTier]);

  const isStaff = MohnMenuUser?.role === 'staff';

  useEffect(() => {
    if (!loading && (!user || (!isOwner() && !isStaff))) {
      router.push('/login');
    }
  }, [user, loading, isOwner, isStaff, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 font-bold text-sm">Loading Command Center...</p>
        </div>
      </div>
    );
  }

  if (!user || (!isOwner() && !isStaff)) return null;

  // Staff users only see KDS and Orders
  const STAFF_PAGES = ['/owner/kds', '/owner/orders'];
  const visibleNavItems = isStaff
    ? NAV_ITEMS.filter(item => STAFF_PAGES.includes(item.href))
    : NAV_ITEMS;

  const isActive = (href: string) => {
    if (href === '/owner') return pathname === '/owner';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar — Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-zinc-100 fixed h-full z-30">
        {/* Logo / Business Name */}
        <div className="p-6 border-b border-zinc-100">
          <Link href="/owner" className="block">
            <h1 className="text-lg font-black tracking-tight text-black">
              MohnMenu<span className="text-orange-500">.</span>
            </h1>
            {currentBusiness && (
              <p className="text-xs font-bold text-zinc-400 mt-1 truncate">
                {currentBusiness.name}
              </p>
            )}
          </Link>
          {/* Tier Badge */}
          <Link
            href="/owner/settings#subscription"
            className={`inline-flex items-center gap-1.5 px-3 py-1 mt-3 rounded-full text-[10px] font-black uppercase tracking-widest ${tierBadge.color} hover:opacity-80 transition-opacity`}
          >
            <FaCrown className="text-[8px]" />
            {tierBadge.label}
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {visibleNavItems.map(item => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const locked = navLocks[item.href];
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group/nav flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all relative ${
                  active
                    ? 'bg-black text-white'
                    : locked
                    ? 'text-zinc-300 hover:bg-zinc-50 hover:text-zinc-400'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-black'
                }`}
              >
                <Icon className="text-base shrink-0" />
                {item.label}
                {locked && (
                  <FaLock className="ml-auto text-[10px] text-zinc-300 group-hover/nav:text-amber-500 transition-colors shrink-0" />
                )}
                {'beta' in item && item.beta && !locked && (
                  <span className="absolute right-2 bg-orange-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase leading-none">
                    Beta
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100">
          {currentBusiness?.website?.setupComplete && (
            <a
              href={`/${currentBusiness.slug || currentBusiness.businessId}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2.5 mb-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              View Live Site →
            </a>
          )}
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-zinc-400 hover:text-red-600 transition-colors w-full"
          >
            <FaSignOutAlt />
            Sign Out
          </button>
          <p className="text-[10px] text-zinc-300 mt-3 px-4">
            {MohnMenuUser?.email}
          </p>
        </div>
      </aside>

      {/* Mobile Topbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-zinc-100 z-40 flex items-center justify-between px-4 h-14">
        <Link href="/owner" className="font-black text-black">
          MohnMenu<span className="text-orange-500">.</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-black"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/30 z-40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="lg:hidden fixed top-14 left-0 bottom-0 w-72 bg-white z-50 border-r border-zinc-100 overflow-y-auto">
            <div className="p-4 border-b border-zinc-100">
              {currentBusiness && (
                <p className="text-sm font-bold text-black truncate">
                  {currentBusiness.name}
                </p>
              )}
              <Link
                href="/owner/settings#subscription"
                className={`inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full text-[10px] font-black uppercase tracking-widest ${tierBadge.color}`}
              >
                <FaCrown className="text-[8px]" />
                {tierBadge.label}
              </Link>
            </div>
            <nav className="p-4 space-y-1">
              {visibleNavItems.map(item => {
                const Icon = item.icon;
                const active = isActive(item.href);
                const locked = navLocks[item.href];
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group/nav flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all relative ${
                      active
                        ? 'bg-black text-white'
                        : locked
                        ? 'text-zinc-300 hover:bg-zinc-50 hover:text-zinc-400'
                        : 'text-zinc-500 hover:bg-zinc-50 hover:text-black'
                    }`}
                  >
                    <Icon className="text-base shrink-0" />
                    {item.label}
                    {locked && (
                      <FaLock className="ml-auto text-[10px] text-zinc-300 group-hover/nav:text-amber-500 transition-colors shrink-0" />
                    )}
                    {'beta' in item && item.beta && !locked && (
                      <span className="absolute right-2 bg-orange-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase leading-none">
                        Beta
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-zinc-100">
              {currentBusiness?.website?.setupComplete && (
                <a
                  href={`/${currentBusiness.slug || currentBusiness.businessId}`}
                  target="_blank"
                  className="flex items-center gap-2 px-4 py-2.5 mb-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  View Live Site →
                </a>
              )}
              <button
                onClick={() => logout()}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-zinc-400 hover:text-red-600 w-full"
              >
                <FaSignOutAlt />
                Sign Out
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
