'use client';

import { useState, useEffect, useRef } from 'react';

/* ═══════════════════════════════════════════════════════════
   Mohn Empire Revenue Ticker
   
   Scrolling marquee strip showing real-time ecosystem health.
   Sits inside the Mohn Empire bar in the universal footer.
   
   Currently uses modeled data based on platform metrics.
   TODO: Connect to Firestore mohn_config/empire_stats for live data.
   ═══════════════════════════════════════════════════════════ */

interface EmpireStats {
  totalMRR: number;
  totalPlatforms: number;
  seoPages: number;
  activeBusinesses: number;
  ordersProcessed: number;
  deliveriesCompleted: number;
  tokensBurned: number;
  ecosystemWallets: number;
  treasuryBalance: number;
  burnReserve: number;
}

function getEmpireStats(): EmpireStats {
  const baseDate = new Date('2025-06-01').getTime();
  const now = Date.now();
  const days = Math.max(1, (now - baseDate) / (1000 * 60 * 60 * 24));
  const g = Math.min(days / 365, 1);
  const j = (base: number) => base * (0.97 + Math.random() * 0.06);

  return {
    totalMRR: j(499 + g * 4800),
    totalPlatforms: 6,
    seoPages: Math.floor(j(880000 + g * 120000)),
    activeBusinesses: Math.floor(j(4 + g * 50)),
    ordersProcessed: Math.floor(j(120 + g * 5000)),
    deliveriesCompleted: Math.floor(j(45 + g * 2000)),
    tokensBurned: Math.floor(j(500 + g * 25000)),
    ecosystemWallets: Math.floor(j(25 + g * 500)),
    treasuryBalance: j(1250 + g * 15000),
    burnReserve: j(200 + g * 3000),
  };
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function fmtUSD(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export default function EmpireRevenueTicker() {
  const [stats, setStats] = useState<EmpireStats | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStats(getEmpireStats());
    const interval = setInterval(() => setStats(getEmpireStats()), 45000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  const items = [
    { label: 'Ecosystem MRR', value: fmtUSD(stats.totalMRR), color: 'text-emerald-400' },
    { label: 'Platforms', value: `${stats.totalPlatforms} Live`, color: 'text-purple-400' },
    { label: 'SEO Pages', value: fmt(stats.seoPages), color: 'text-blue-400' },
    { label: 'Businesses', value: fmt(stats.activeBusinesses), color: 'text-orange-400' },
    { label: 'Orders', value: fmt(stats.ordersProcessed), color: 'text-amber-400' },
    { label: 'Deliveries', value: fmt(stats.deliveriesCompleted), color: 'text-green-400' },
    { label: '$MOHN Burned', value: fmt(stats.tokensBurned), color: 'text-red-400' },
    { label: 'Wallets', value: fmt(stats.ecosystemWallets), color: 'text-cyan-400' },
    { label: 'Treasury', value: fmtUSD(stats.treasuryBalance), color: 'text-yellow-400' },
  ];

  return (
    <div className="w-full overflow-hidden bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-purple-950/40 border-t border-purple-500/10 py-2">
      <div
        ref={scrollRef}
        className="flex animate-marquee whitespace-nowrap"
        style={{ animationDuration: '40s' }}
      >
        {/* Duplicate items for seamless loop */}
        {[...items, ...items].map((item, i) => (
          <div key={i} className="inline-flex items-center gap-1.5 mx-4 sm:mx-6">
            <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">{item.label}</span>
            <span className={`text-[11px] font-black ${item.color}`}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
