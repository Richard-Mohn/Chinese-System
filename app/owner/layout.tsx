'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
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
} from 'react-icons/fa';

const NAV_ITEMS = [
  { href: '/owner', label: 'Dashboard', icon: FaHome },
  { href: '/owner/website', label: 'Website', icon: FaGlobe },
  { href: '/owner/orders', label: 'Orders', icon: FaClipboardList },
  { href: '/owner/kds', label: 'Kitchen Display', icon: FaDesktop },
  { href: '/owner/menu', label: 'Menu', icon: FaUtensils },
  { href: '/owner/chef-cam', label: 'Chef Cam', icon: FaVideo },
  { href: '/owner/auctions', label: 'Auctions', icon: FaGavel, beta: true },
  { href: '/owner/drivers', label: 'Drivers', icon: FaTruck },
  { href: '/owner/dispatch', label: 'Dispatch', icon: FaMapMarkerAlt },
  { href: '/owner/domain', label: 'Custom Domain', icon: FaLink },
  { href: '/owner/analytics', label: 'Analytics', icon: FaChartLine },
  { href: '/owner/settings', label: 'Settings', icon: FaCog },
];

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const { user, MohnMenuUser, currentBusiness, loading, isOwner, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isOwner())) {
      router.push('/login');
    }
  }, [user, loading, isOwner, router]);

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

  if (!user || !isOwner()) return null;

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
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all relative ${
                  active
                    ? 'bg-black text-white'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-black'
                }`}
              >
                <Icon className="text-base shrink-0" />
                {item.label}
                {'beta' in item && item.beta && (
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
            </div>
            <nav className="p-4 space-y-1">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all relative ${
                      active
                        ? 'bg-black text-white'
                        : 'text-zinc-500 hover:bg-zinc-50 hover:text-black'
                    }`}
                  >
                    <Icon className="text-base shrink-0" />
                    {item.label}
                    {'beta' in item && item.beta && (
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
