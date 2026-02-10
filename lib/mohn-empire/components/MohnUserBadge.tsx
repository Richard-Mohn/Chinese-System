'use client';
// ============================================================================
// Mohn Empire — User Badge Component
// Shows user avatar, name, and $MOHN points in the navbar.
// ============================================================================

import { useState } from 'react';
import { useMohnAuth } from '../auth-context';
import { TIER_INFO, type EmpireTier } from '../types';
import { MohnLoginModal } from './MohnLoginModal';

interface MohnUserBadgeProps {
  /** Platform name for the login modal */
  platformName?: string;
  /** Compact mode (icon only) */
  compact?: boolean;
  /** Custom class */
  className?: string;
}

export function MohnUserBadge({ platformName, compact, className }: MohnUserBadgeProps) {
  const { user, firebaseUser, loading, logout } = useMohnAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  if (loading) {
    return (
      <div className={`h-9 w-24 animate-pulse rounded-full bg-white/10 ${className ?? ''}`} />
    );
  }

  // Not logged in → show login button
  if (!user || !firebaseUser) {
    return (
      <>
        <button
          onClick={() => setShowLogin(true)}
          className={`inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-400 transition-all hover:bg-indigo-500/20 hover:text-indigo-300 ${className ?? ''}`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {!compact && 'Sign In'}
        </button>
        <MohnLoginModal
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          platformName={platformName}
        />
      </>
    );
  }

  // Logged in → show user badge with dropdown
  const tier = user.tier as EmpireTier;
  const tierInfo = TIER_INFO[tier];

  return (
    <div className={`relative ${className ?? ''}`}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 transition-all hover:bg-white/10"
      >
        {/* Avatar */}
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt=""
            className="h-7 w-7 rounded-full border border-white/20"
          />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white">
            {(user.displayName ?? 'M')[0].toUpperCase()}
          </div>
        )}

        {/* Points */}
        {!compact && (
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-white">
              {formatPoints(user.mohnPoints)}
            </span>
            <span className="text-xs text-yellow-400">$M</span>
            <span className="text-sm">{tierInfo.icon}</span>
          </div>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-white/10 bg-[#0B0E14] p-4 shadow-2xl">
            {/* User info */}
            <div className="mb-3 flex items-center gap-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt=""
                  className="h-10 w-10 rounded-full border border-white/20"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
                  {(user.displayName ?? 'M')[0].toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{user.displayName}</p>
                <p className="truncate text-xs text-gray-400">{user.email}</p>
              </div>
            </div>

            {/* Points balance */}
            <div className="mb-3 rounded-lg border border-white/5 bg-white/[0.03] p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">$MOHN Balance</span>
                <span className="text-xs" style={{ color: tierInfo.color }}>
                  {tierInfo.icon} {tierInfo.label}
                </span>
              </div>
              <p className="mt-1 text-xl font-bold text-white">
                {user.mohnPoints.toLocaleString()}{' '}
                <span className="text-sm font-normal text-yellow-400">$M</span>
              </p>
            </div>

            {/* Stats */}
            <div className="mb-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                <p className="text-[10px] text-gray-500">Platforms</p>
                <p className="text-sm font-semibold text-white">{user.linkedProjects?.length ?? 1}</p>
              </div>
              <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                <p className="text-[10px] text-gray-500">Referral Code</p>
                <p className="text-sm font-mono font-semibold text-indigo-400">{user.referralCode}</p>
              </div>
            </div>

            {/* Sign out */}
            <button
              onClick={async () => {
                await logout();
                setShowDropdown(false);
              }}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 transition-all hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
            >
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function formatPoints(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}
