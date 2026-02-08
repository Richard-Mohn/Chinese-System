/**
 * TenantNav — Responsive tenant navigation bar
 *
 * Client component with Quick Order modal, Sign In/Register modal,
 * mobile hamburger menu, and user account dropdown.
 * Replaces the inline <nav> from the tenant layout.
 */

'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import type { MohnMenuBusiness } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FaBars, FaTimes, FaShoppingCart, FaUser, FaSignOutAlt,
  FaReceipt, FaStar, FaChevronDown, FaCalendarAlt, FaMusic,
} from 'react-icons/fa';

/* eslint-disable @typescript-eslint/no-explicit-any */
const BAR_TYPES = ['bar_grill', 'restaurant', 'chinese_restaurant'];

const QuickOrderModal = dynamic(() => import('./QuickOrderModal'), { ssr: false });
import { useAuthModal } from '@/context/AuthModalContext';

export default function TenantNav({
  business,
  basePath,
  orderPath,
}: {
  business: MohnMenuBusiness & { businessId: string };
  basePath: string;
  orderPath: string;
}) {
  const { user, MohnMenuUser, logout } = useAuth();
  const { openAuthModal } = useAuthModal();
  const [quickOrderOpen, setQuickOrderOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const orderingEnabled = business.settings?.orderingEnabled;
  const isBarType = BAR_TYPES.includes(business.type);
  const isDemo = !!(business as any).isDemo;
  const isDemoOwner = isDemo && user?.email?.endsWith('@coppertap.demo') && MohnMenuUser?.role === 'owner';
  const hasReservations = (business as any).features?.reservations || (business as any).reservationSettings?.enabled;
  const hasEntertainment = (business as any).entertainment?.jukeboxEnabled;

  const openSignUp = () => {
    openAuthModal('signup');
    setMobileOpen(false);
  };

  const openSignIn = () => {
    openAuthModal('login');
    setMobileOpen(false);
  };

  const handleQuickOrder = () => {
    setQuickOrderOpen(true);
    setMobileOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-md border-b border-zinc-100">
        <div className="container mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          {/* Logo / Business name */}
          <a href={basePath || '/'} className="text-xl md:text-2xl font-black text-black tracking-tighter">
            {business.name}
          </a>

          {/* ── Desktop Nav ───────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-6">
            <a href={`${basePath}/`} className="text-sm font-bold text-zinc-600 hover:text-black transition-colors">
              Home
            </a>
            <a href={`${basePath}/menu`} className="text-sm font-bold text-zinc-600 hover:text-black transition-colors">
              Menu
            </a>
            {business.website?.selectedServices?.length > 0 && (
              <span className="text-sm font-bold text-zinc-600 hover:text-black transition-colors cursor-pointer">
                Services
              </span>
            )}
            {hasReservations && (
              <a href={`${basePath}/reserve`} className="text-sm font-bold text-zinc-600 hover:text-black transition-colors flex items-center gap-1">
                <FaCalendarAlt className="text-xs text-purple-500" /> Reserve
              </a>
            )}
            {hasEntertainment && (
              <a href={`${basePath}/jukebox`} className="text-sm font-bold text-zinc-600 hover:text-black transition-colors flex items-center gap-1">
                <FaMusic className="text-xs text-purple-500" /> Jukebox
              </a>
            )}
            <a href={`${basePath}/about`} className="text-sm font-bold text-zinc-600 hover:text-black transition-colors">
              About
            </a>
            <a href={`${basePath}/contact`} className="text-sm font-bold text-zinc-600 hover:text-black transition-colors">
              Contact
            </a>

            {/* Owner Dashboard link — demo businesses */}
            {isDemoOwner && (
              <a
                href="/owner"
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-amber-700 bg-amber-100 rounded-full hover:bg-amber-200 transition-colors"
              >
                📊 Dashboard
              </a>
            )}

            {/* Quick Order button — desktop */}
            {orderingEnabled && (
              <button
                onClick={handleQuickOrder}
                className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-full text-sm font-bold hover:bg-zinc-800 transition-all"
              >
                <FaShoppingCart className="text-xs" />
                Quick Order
              </button>
            )}

            {/* Auth — desktop */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-zinc-100 rounded-full text-sm font-bold text-zinc-700 hover:bg-zinc-200 transition-all"
                >
                  <FaUser className="text-xs" />
                  <span className="max-w-[100px] truncate">{user.email?.split('@')[0]}</span>
                  <FaChevronDown className="text-[10px]" />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-zinc-100 overflow-hidden z-50"
                    >
                      <a
                        href="/customer/orders"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                      >
                        <FaReceipt className="text-zinc-400" /> My Orders & Receipts
                      </a>
                      <a
                        href="/customer/loyalty"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                      >
                        <FaStar className="text-amber-500" /> Rewards & Loyalty
                      </a>
                      <a
                        href="/customer/profile"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                      >
                        <FaUser className="text-zinc-400" /> My Profile
                      </a>
                      <div className="border-t border-zinc-100" />
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FaSignOutAlt /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={openSignUp}
                className="flex items-center gap-2 px-5 py-2.5 bg-zinc-100 text-black rounded-full text-sm font-bold hover:bg-zinc-200 transition-all"
              >
                <FaUser className="text-xs" />
                Sign Up
              </button>
            )}
          </div>

          {/* ── Mobile: Quick Order + Hamburger ───────────────── */}
          <div className="flex md:hidden items-center gap-2">
            {orderingEnabled && (
              <button
                onClick={handleQuickOrder}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-black text-white rounded-full text-xs font-bold"
              >
                <FaShoppingCart className="text-[10px]" />
                Order
              </button>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 text-zinc-700"
            >
              {mobileOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu Drawer ──────────────────────────────── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-zinc-100 bg-white overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1">
                <a href={`${basePath}/`} className="block py-3 text-sm font-bold text-zinc-700 hover:text-black">Home</a>
                <a href={`${basePath}/menu`} className="block py-3 text-sm font-bold text-zinc-700 hover:text-black">Menu</a>
                {hasReservations && (
                  <a href={`${basePath}/reserve`} className="block py-3 text-sm font-bold text-zinc-700 hover:text-black">📅 Reservations</a>
                )}
                {hasEntertainment && (
                  <a href={`${basePath}/jukebox`} className="block py-3 text-sm font-bold text-zinc-700 hover:text-black">🎵 Jukebox</a>
                )}
                <a href={`${basePath}/about`} className="block py-3 text-sm font-bold text-zinc-700 hover:text-black">About</a>
                <a href={`${basePath}/contact`} className="block py-3 text-sm font-bold text-zinc-700 hover:text-black">Contact</a>
                <a href={orderPath} className="block py-3 text-sm font-bold text-zinc-700 hover:text-black">Full Menu & Order</a>
                {isDemoOwner && (
                  <a href="/owner" className="block py-3 text-sm font-bold text-amber-700 hover:text-amber-900">📊 Owner Dashboard</a>
                )}

                <div className="pt-3 border-t border-zinc-100 space-y-2">
                  {user ? (
                    <>
                      <a
                        href="/customer/orders"
                        className="flex items-center gap-3 py-3 text-sm font-bold text-zinc-700"
                      >
                        <FaReceipt className="text-zinc-400" /> My Orders & Receipts
                      </a>
                      <a
                        href="/customer/loyalty"
                        className="flex items-center gap-3 py-3 text-sm font-bold text-zinc-700"
                      >
                        <FaStar className="text-amber-500" /> Rewards & Loyalty
                      </a>
                      <button
                        onClick={() => { logout(); setMobileOpen(false); }}
                        className="flex items-center gap-3 py-3 text-sm font-bold text-red-600 w-full"
                      >
                        <FaSignOutAlt /> Sign Out
                      </button>
                    </>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={openSignIn}
                        className="flex-1 py-3 bg-zinc-100 rounded-xl text-sm font-bold text-zinc-700"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={openSignUp}
                        className="flex-1 py-3 bg-black text-white rounded-xl text-sm font-bold"
                      >
                        Sign Up Free
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Close user menu on outside click */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
      )}

      {/* ── Modals ─────────────────────────────────────────── */}
      <QuickOrderModal
        business={business}
        isOpen={quickOrderOpen}
        onClose={() => setQuickOrderOpen(false)}
      />
    </>
  );
}
