/**
 * FeatureLock — Inline overlay for locked features
 *
 * Wraps any UI section. If the feature is locked for the current tier,
 * renders a blurred overlay with a lock icon that turns gold on hover
 * and links to the upgrade/settings page.
 *
 * Usage:
 *   <FeatureLock feature="kds">
 *     <KDSContent />
 *   </FeatureLock>
 */

'use client';

import { type ReactNode, useState } from 'react';
import Link from 'next/link';
import { FaLock, FaCrown } from 'react-icons/fa';
import { useFeatureGate } from '@/lib/useFeatureGate';
import type { FeatureKey } from '@/lib/tier-features';

interface FeatureLockProps {
  feature: FeatureKey;
  children: ReactNode;
  /** Optional: override the message shown */
  message?: string;
  /** If true, renders nothing when locked instead of the overlay */
  hideWhenLocked?: boolean;
}

export default function FeatureLock({
  feature,
  children,
  message,
  hideWhenLocked = false,
}: FeatureLockProps) {
  const { isLocked, featureMeta } = useFeatureGate(feature);

  if (!isLocked) return <>{children}</>;
  if (hideWhenLocked) return null;

  return (
    <div className="relative">
      {/* Blurred content preview */}
      <div className="pointer-events-none select-none blur-[2px] opacity-40">
        {children}
      </div>

      {/* Lock overlay */}
      <LockOverlay
        label={featureMeta.label}
        upgradeTo={featureMeta.upgradeTo}
        upgradePrice={featureMeta.upgradePrice}
        description={message || featureMeta.description}
      />
    </div>
  );
}

/**
 * LockOverlay — The hoverable lock icon + upgrade CTA
 */
function LockOverlay({
  label,
  upgradeTo,
  upgradePrice,
  description,
}: {
  label: string;
  upgradeTo: string;
  upgradePrice: string;
  description: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        href="/owner/settings#subscription"
        className={`flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all duration-300 max-w-sm text-center ${
          hovered
            ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 shadow-xl shadow-amber-100/50 scale-105'
            : 'bg-white/90 backdrop-blur-sm border-zinc-200 shadow-lg'
        }`}
      >
        {/* Lock → Crown icon transition */}
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
            hovered
              ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white scale-110'
              : 'bg-zinc-100 text-zinc-400'
          }`}
        >
          {hovered ? (
            <FaCrown className="text-lg" />
          ) : (
            <FaLock className="text-sm" />
          )}
        </div>

        <div>
          <p
            className={`font-black text-sm transition-colors duration-300 ${
              hovered ? 'text-amber-700' : 'text-zinc-600'
            }`}
          >
            {label}
          </p>
          <p className="text-xs text-zinc-400 mt-1">{description}</p>
        </div>

        <div
          className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 ${
            hovered
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
              : 'bg-zinc-100 text-zinc-500'
          }`}
        >
          {hovered
            ? `Upgrade to ${upgradeTo} — ${upgradePrice}`
            : `Requires ${upgradeTo}`}
        </div>
      </Link>
    </div>
  );
}
