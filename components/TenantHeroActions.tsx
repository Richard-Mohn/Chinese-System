/**
 * TenantHeroActions — Hero CTA buttons for tenant homepage
 *
 * Two primary actions:
 *   1. "Quick Order" — opens inline ordering modal
 *   2. "Register" / account button — sign up for rewards, receipts, tracking
 * Plus secondary "View Menu" and "Full Menu & Order" links.
 *
 * Both modals (QuickOrderModal, AuthModal) are wrapped here
 * since the tenant homepage page.tsx is a server component.
 */

'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import type { MohnMenuBusiness } from '@/lib/types';
import {
  FaShoppingCart, FaUser, FaStar, FaReceipt, FaArrowRight,
  FaCalendarAlt, FaMusic, FaGlobe,
} from 'react-icons/fa';

const QuickOrderModal = dynamic(() => import('./QuickOrderModal'), { ssr: false });
import { useAuthModal } from '@/context/AuthModalContext';

/* eslint-disable @typescript-eslint/no-explicit-any */

const BAR_TYPES = ['bar_grill', 'restaurant', 'chinese_restaurant'];

export default function TenantHeroActions({
  business,
  orderPath,
  menuPath,
}: {
  business: MohnMenuBusiness & { businessId: string };
  orderPath: string;
  menuPath: string;
}) {
  const { user, MohnMenuUser } = useAuth();
  const { openAuthModal } = useAuthModal();
  const [modalOpen, setModalOpen] = useState(false);

  const isBarType = BAR_TYPES.includes(business.type);
  const hasReservations = (business as any).features?.reservations || (business as any).reservationSettings?.enabled;
  const hasEntertainment = (business as any).entertainment?.jukeboxEnabled;
  const hasChineseInfo = business.type === 'chinese_restaurant';
  const slug = business.slug;

  return (
    <>
      {/* ── Primary CTA Row ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
        {/* Quick Order — primary action */}
        {business.settings?.orderingEnabled && (
          <button
            onClick={() => setModalOpen(true)}
            className="group px-10 py-5 bg-black text-white rounded-full font-bold text-lg flex items-center gap-3 hover:bg-zinc-800 transition-all shadow-xl cursor-pointer"
          >
            <FaShoppingCart className="text-base" />
            Quick Order
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        )}

        {/* Register / Account — secondary action */}
        {user ? (
          <a
            href={MohnMenuUser?.role === 'staff' ? '/owner/kds' : MohnMenuUser?.role === 'owner' || MohnMenuUser?.role === 'manager' ? '/owner/orders' : '/customer/orders'}
            className="px-10 py-5 bg-zinc-100 text-black rounded-full font-bold text-lg flex items-center gap-3 hover:bg-zinc-200 transition-all"
          >
            <FaReceipt className="text-base" />
            {MohnMenuUser?.role === 'staff' ? 'Kitchen Display' : 'My Orders'}
          </a>
        ) : (
          <button
            onClick={() => openAuthModal('signup')}
            className="px-10 py-5 bg-white text-black border-2 border-zinc-200 rounded-full font-bold text-lg flex items-center gap-3 hover:border-black transition-all cursor-pointer"
          >
            <FaUser className="text-base" />
            Register for Rewards
          </button>
        )}
      </div>

      {/* ── Feature buttons (Reserve, Jukebox) ────────── */}
      {(hasReservations || hasEntertainment) && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
          {hasReservations && (
            <a
              href={`/${slug}/reserve`}
              className="px-8 py-4 bg-purple-600 text-white rounded-full font-bold text-base flex items-center gap-2 hover:bg-purple-500 transition-all shadow-lg shadow-purple-600/20"
            >
              <FaCalendarAlt className="text-sm" />
              Reserve a Table
            </a>
          )}
          {hasEntertainment && (
            <a
              href={`/${slug}/jukebox`}
              className="px-8 py-4 bg-zinc-900 text-white rounded-full font-bold text-base flex items-center gap-2 hover:bg-zinc-700 transition-all"
            >
              <FaMusic className="text-sm" />
              Jukebox
            </a>
          )}
        </div>
      )}

      {hasChineseInfo && (
        <div className="flex items-center justify-center mb-4">
          <a
            href={`/${slug}/zh`}
            className="px-7 py-3 rounded-full border border-red-200 bg-red-50 text-red-700 font-bold text-sm flex items-center gap-2 hover:bg-red-100 transition-all"
          >
            <FaGlobe className="text-xs" /> 中文介绍 · Click to learn more
          </a>
        </div>
      )}

      {/* ── Secondary links ─────────────────────────────── */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <a
          href={menuPath}
          className="text-zinc-500 font-bold hover:text-black transition-colors flex items-center gap-1.5"
        >
          View Menu <FaArrowRight className="text-[10px]" />
        </a>
        <a
          href={orderPath}
          className="text-zinc-500 font-bold hover:text-black transition-colors flex items-center gap-1.5"
        >
          Full Menu &amp; Order <FaArrowRight className="text-[10px]" />
        </a>
      </div>

      {/* ── Benefits teaser (for non-logged-in users) ──── */}
      {!user && (
        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-zinc-400 font-medium">
          <span className="flex items-center gap-1.5">
            <FaStar className="text-amber-400" /> Earn Rewards
          </span>
          <span className="flex items-center gap-1.5">
            <FaReceipt className="text-zinc-400" /> Track Orders
          </span>
          <span className="hidden sm:flex items-center gap-1.5">
            📱 Digital Receipts
          </span>
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────── */}
      <QuickOrderModal
        business={business}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
