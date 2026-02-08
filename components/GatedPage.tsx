/**
 * GatedPage — Full-page feature gate for owner dashboard pages
 *
 * Wraps an entire page component. If the feature is locked,
 * shows a polished upgrade screen instead of the page content.
 * The upgrade screen has a blurred screenshot effect behind it.
 *
 * Usage:
 *   <GatedPage feature="kds">
 *     <KDSPageContent />
 *   </GatedPage>
 */

'use client';

import { type ReactNode, useState } from 'react';
import Link from 'next/link';
import { FaLock, FaCrown, FaArrowRight, FaCheck } from 'react-icons/fa';
import { useFeatureGate } from '@/lib/useFeatureGate';
import type { FeatureKey } from '@/lib/tier-features';
import { FEATURE_REGISTRY } from '@/lib/tier-features';

interface GatedPageProps {
  feature: FeatureKey;
  children: ReactNode;
}

export default function GatedPage({ feature, children }: GatedPageProps) {
  const { isLocked, featureMeta, currentTier } = useFeatureGate(feature);

  if (!isLocked) return <>{children}</>;

  return <UpgradeScreen feature={feature} meta={featureMeta} currentTier={currentTier} />;
}

// ─── Upgrade Screen ──────────────────────────────────────────

function UpgradeScreen({
  feature,
  meta,
  currentTier,
}: {
  feature: FeatureKey;
  meta: (typeof FEATURE_REGISTRY)[FeatureKey];
  currentTier: string;
}) {
  const [hovered, setHovered] = useState(false);

  // Gather other features at the same tier to show value
  const sameTierFeatures = Object.entries(FEATURE_REGISTRY)
    .filter(([key, m]) => m.minTier === meta.minTier && key !== feature)
    .slice(0, 5)
    .map(([, m]) => m.label);

  const tierColors: Record<string, { bg: string; border: string; text: string; gradient: string }> = {
    Growth:       { bg: 'from-blue-50 to-indigo-50', border: 'border-blue-200', text: 'text-blue-700', gradient: 'from-blue-500 to-indigo-600' },
    Professional: { bg: 'from-amber-50 to-orange-50', border: 'border-amber-200', text: 'text-amber-700', gradient: 'from-amber-500 to-orange-500' },
    Starter:      { bg: 'from-emerald-50 to-green-50', border: 'border-emerald-200', text: 'text-emerald-700', gradient: 'from-emerald-500 to-green-600' },
  };

  const colors = tierColors[meta.upgradeTo] || tierColors.Growth;

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full text-center">
        {/* Lock/Crown Icon */}
        <div
          className="mx-auto mb-6 relative"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div
            className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto transition-all duration-500 ${
              hovered
                ? `bg-gradient-to-br ${colors.gradient} text-white scale-110 shadow-xl`
                : 'bg-zinc-100 text-zinc-400'
            }`}
          >
            {hovered ? (
              <FaCrown className="text-3xl" />
            ) : (
              <FaLock className="text-2xl" />
            )}
          </div>
        </div>

        {/* Feature Name */}
        <h1 className="text-3xl font-black tracking-tight text-black mb-2">
          {meta.label}
        </h1>
        <p className="text-zinc-400 font-medium mb-8 max-w-md mx-auto">
          {meta.description}. Upgrade to <span className={`font-black ${colors.text}`}>{meta.upgradeTo}</span> to unlock this feature.
        </p>

        {/* Current tier badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 rounded-full text-xs font-black text-zinc-500 uppercase tracking-widest mb-8">
          Current plan: {currentTier || 'Free Trial'}
        </div>

        {/* What you get */}
        {sameTierFeatures.length > 0 && (
          <div className={`bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-2xl p-6 mb-8 text-left`}>
            <p className={`text-xs font-black uppercase tracking-widest ${colors.text} mb-4`}>
              Also included in {meta.upgradeTo}
            </p>
            <div className="space-y-2">
              {sameTierFeatures.map(label => (
                <div key={label} className="flex items-center gap-2">
                  <FaCheck className={`text-xs ${colors.text} shrink-0`} />
                  <span className="text-sm font-bold text-zinc-700">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <Link
          href="/owner/settings#subscription"
          className={`inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r ${colors.gradient} text-white rounded-2xl font-black text-base hover:shadow-xl hover:scale-105 transition-all duration-300`}
        >
          Upgrade to {meta.upgradeTo} — {meta.upgradePrice}
          <FaArrowRight />
        </Link>

        <p className="text-xs text-zinc-400 mt-4">
          14-day free trial included. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
