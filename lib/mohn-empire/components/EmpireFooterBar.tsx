'use client';
// ============================================================================
// Mohn Empire — Universal Footer Bar
// The unified footer bar that appears on ALL Mohn Empire platforms.
// Shows platform links, points ticker, and user stats.
// ============================================================================

import { useMohnAuth } from '../auth-context';
import { EMPIRE_PLATFORMS, type PlatformId } from '../config';
import { TIER_INFO } from '../types';

interface EmpireFooterBarProps {
  /** ID of the current platform (to highlight it) */
  currentPlatform: PlatformId;
  /** Additional CSS classes */
  className?: string;
}

export function EmpireFooterBar({ currentPlatform, className }: EmpireFooterBarProps) {
  const { user } = useMohnAuth();

  return (
    <div className={`border-t border-white/5 bg-[#030305] ${className ?? ''}`}>
      {/* Points ticker bar */}
      <div className="overflow-hidden border-b border-white/5 bg-gradient-to-r from-indigo-950/30 via-purple-950/20 to-indigo-950/30">
        <div className="empire-marquee flex whitespace-nowrap py-1.5">
          {[1, 2].map((set) => (
            <div key={set} className="flex shrink-0 items-center gap-8 px-4">
              {EMPIRE_PLATFORMS.map((p) => (
                <a
                  key={`${set}-${p.id}`}
                  href={p.url}
                  target={p.id === currentPlatform ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs transition-all hover:opacity-100 group"
                  style={{ opacity: p.id === currentPlatform ? 1 : 0.5 }}
                >
                  <span className="text-sm">{p.icon}</span>
                  <span
                    className="font-medium group-hover:underline"
                    style={{ color: p.id === currentPlatform ? p.color : '#9ca3af' }}
                  >
                    {p.name}
                  </span>
                  {p.id === currentPlatform && (
                    <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] text-gray-400">
                      here
                    </span>
                  )}
                </a>
              ))}
              {user && (
                <span className="flex items-center gap-1 text-xs text-yellow-400/60">
                  <span>💰</span>
                  <span className="font-mono font-semibold">
                    {user.mohnPoints.toLocaleString()} $MOHN
                  </span>
                  <span>{TIER_INFO[user.tier].icon}</span>
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Empire branding bar */}
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 py-5 sm:flex-row sm:justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white">
            ME
          </div>
          <div>
            <p className="text-xs font-semibold text-white/80">Mohn Empire</p>
            <p className="text-[10px] text-gray-500">7 Platforms • 1 Account • $MOHN Rewards</p>
          </div>
        </div>

        {/* User status */}
        {user && (
          <div className="flex items-center gap-3 rounded-full border border-white/5 bg-white/[0.02] px-4 py-2">
            <span className="text-[10px] text-gray-500">Signed in as</span>
            <span className="text-xs font-medium text-white">{user.displayName}</span>
            <span className="text-[10px] text-gray-400">·</span>
            <span className="text-xs font-mono text-yellow-400">
              {user.mohnPoints.toLocaleString()} $M
            </span>
            <span className="text-xs">{TIER_INFO[user.tier].icon}</span>
            <span className="text-[10px] text-gray-400">·</span>
            <span className="text-[10px] text-gray-500">
              {user.linkedProjects?.length ?? 1} platform{(user.linkedProjects?.length ?? 1) !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Address & legal */}
        <div className="text-center sm:text-right">
          <p className="text-[10px] text-gray-500">
            23 Shore St, Petersburg, VA 23803
          </p>
          <p className="text-[10px] text-gray-600">
            © {new Date().getFullYear()} Mohn Empire · Sole Proprietorship
          </p>
        </div>
      </div>

      {/* Inline marquee styles — no external CSS needed */}
      <style jsx>{`
        .empire-marquee {
          animation: empireMarquee 60s linear infinite;
        }
        .empire-marquee:hover {
          animation-play-state: paused;
        }
        @keyframes empireMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
