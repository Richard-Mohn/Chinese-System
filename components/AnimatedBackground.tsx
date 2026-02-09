/**
 * AnimatedBackground — Subtle floating product icons
 *
 * Pure CSS keyframe animations (no framer-motion) for best performance.
 * Uses SVG line-art icons representing items sold by platform customers:
 * food, drinks, bakery, retail, groceries, etc.
 * Renders once at mount; all animation is GPU-accelerated via CSS transform.
 * Fixed behind all content at z-[-1].
 */

'use client';

import React, { useState, useEffect } from 'react';

/* ─── SVG icon paths (stroke-only, clean line art) ─── */
const ICON_PATHS: string[] = [
  // Pizza slice
  'M12 2C6.48 2 2 6.48 2 12l10-10zm0 0c5.52 0 10 4.48 10 10L12 2zm0 20l5-10H7l5 10z',
  // Hamburger
  'M3 7h18M3 12h18M5 7a7 7 0 0114 0M5 17a7 7 0 0014 0M3 17h18M7 12v0M12 12v0M17 12v0',
  // Coffee cup
  'M17 8h1a4 4 0 010 8h-1M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8zM6 2v3M10 2v3M14 2v3',
  // Cupcake / Muffin  
  'M8 14h8M6 14c0 4 2 7 6 7s6-3 6-7M9 14V9c0-1 .5-2.5 3-2.5S15 8 15 9v5M5 14h14M7 9c-1.5 0-3-1-3-3s1.5-3 3-3M17 9c1.5 0 3-1 3-3s-1.5-3-3-3',
  // Shopping bag
  'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0',
  // Wine glass
  'M8 22h8M12 13v9M12 13a5 5 0 005-5V2H7v6a5 5 0 005 5z',
  // Ice cream cone
  'M12 17l-4 5h8l-4-5zm0 0a5 5 0 005-5 5 5 0 00-10 0 5 5 0 005 5zM9 8a3 3 0 016 0',
  // Bread loaf
  'M5 12h14M5 12a3 3 0 010-6h14a3 3 0 010 6M5 12v6a2 2 0 002 2h10a2 2 0 002-2v-6',
  // Delivery box
  'M16 3H8l-4 4v10a2 2 0 002 2h12a2 2 0 002-2V7l-4-4zM4 7h16M12 3v8M8 11l4 4 4-4',
  // Taco
  'M4 16c0 2.21 3.58 4 8 4s8-1.79 8-4M4 16c0-4 3.58-12 8-12s8 8 8 12M8 14h.01M12 12h.01M16 14h.01',
  // Donut
  'M12 2a10 10 0 100 20 10 10 0 000-20zm0 6a4 4 0 100 8 4 4 0 000-8z',
  // Cart
  'M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6M9 22a1 1 0 100-2 1 1 0 000 2zM20 22a1 1 0 100-2 1 1 0 000 2z',
  // Cocktail
  'M8 22h8M12 17v5M2 2l10 10 10-10H2zM7 7h10',
  // Cake
  'M2 18h20v-4a4 4 0 00-4-4H6a4 4 0 00-4 4v4zM6 10V8M12 10V6M18 10V8M2 18v2a2 2 0 002 2h16a2 2 0 002-2v-2',
  // Bottle
  'M10 2h4v4l2 2v12a2 2 0 01-2 2h-4a2 2 0 01-2-2V8l2-2V2zM8 12h8',
  // Fork & Knife
  'M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7',
  // Bowl/Soup
  'M4 11h16M4 11c0 4.42 3.58 8 8 8s8-3.58 8-8M7 11V8M12 11V6M17 11V8',
  // Storefront
  'M3 21h18M3 7l2-4h14l2 4M3 7h18M5 7v14M19 7v14M9 21v-6h6v6',
  // Flower/Boutique
  'M12 22V12M12 8a4 4 0 100-8 4 4 0 000 8zm-5 0a4 4 0 000 8M17 8a4 4 0 010 8M12 12a4 4 0 01-5-4M12 12a4 4 0 005-4',
  // Gift box
  'M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7a4 4 0 00-4-4c-1.5 0-3 1-3 3s2 4 4 4M12 7a4 4 0 014-4c1.5 0 3 1 3 3s-2 4-4 4',
];

/* ─── Seeded pseudo-random for deterministic layout ─── */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* ─── Component ─── */
export default function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);

  // Delay mount so it doesn't compete with initial page paint
  useEffect(() => {
    const hasRIC = typeof requestIdleCallback !== 'undefined';
    const id = hasRIC
      ? requestIdleCallback(() => setMounted(true))
      : setTimeout(() => setMounted(true), 150);
    return () => {
      if (typeof id === 'number') {
        if (typeof cancelIdleCallback !== 'undefined') cancelIdleCallback(id);
        else clearTimeout(id);
      }
    };
  }, []);

  if (!mounted) return null;

  const rand = seededRandom(777);
  const COUNT = 24;

  const icons = Array.from({ length: COUNT }, (_, i) => {
    const pathIndex = i % ICON_PATHS.length;
    const x = rand() * 92 + 4;         // 4–96%
    const y = rand() * 88 + 6;         // 6–94%
    const size = 40 + rand() * 28;     // 40–68px (medium, noticeable)
    const duration = 22 + rand() * 18;  // 22–40s (smooth, slow)
    const delay = rand() * -40;         // stagger across full cycle
    const driftY = 20 + rand() * 30;    // 20–50px vertical drift
    const driftX = 10 + rand() * 20;    // 10–30px horizontal drift
    const rotate = 5 + rand() * 15;     // 5–20° rotation

    return (
      <div
        key={i}
        className="absolute pointer-events-none"
        style={{
          left: `${x}%`,
          top: `${y}%`,
          width: size,
          height: size,
          animation: `floatIcon${i % 6} ${duration}s ease-in-out ${delay}s infinite`,
          willChange: 'transform, opacity',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full text-zinc-400/[0.09]"
        >
          <path d={ICON_PATHS[pathIndex]} />
        </svg>
      </div>
    );
  });

  return (
    <div
      className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Very subtle warm gradient wash */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/20 via-transparent to-rose-50/15" />

      {/* Floating icons */}
      {icons}

      {/* CSS keyframes — 6 unique float paths for variety */}
      <style>{`
        @keyframes floatIcon0 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.04; }
          25% { transform: translate(12px, -25px) rotate(6deg); opacity: 0.1; }
          50% { transform: translate(-8px, -40px) rotate(-4deg); opacity: 0.07; }
          75% { transform: translate(15px, -18px) rotate(8deg); opacity: 0.1; }
        }
        @keyframes floatIcon1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.05; }
          30% { transform: translate(-15px, -30px) rotate(-7deg); opacity: 0.1; }
          60% { transform: translate(10px, -45px) rotate(5deg); opacity: 0.06; }
          80% { transform: translate(-5px, -20px) rotate(-3deg); opacity: 0.1; }
        }
        @keyframes floatIcon2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.06; }
          20% { transform: translate(18px, -20px) rotate(8deg); opacity: 0.1; }
          50% { transform: translate(-12px, -35px) rotate(-6deg); opacity: 0.08; }
          80% { transform: translate(8px, -15px) rotate(4deg); opacity: 0.1; }
        }
        @keyframes floatIcon3 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.04; }
          35% { transform: translate(-10px, -28px) rotate(-5deg); opacity: 0.09; }
          65% { transform: translate(14px, -42px) rotate(7deg); opacity: 0.06; }
          85% { transform: translate(-8px, -12px) rotate(-2deg); opacity: 0.1; }
        }
        @keyframes floatIcon4 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.05; }
          25% { transform: translate(16px, -22px) rotate(6deg); opacity: 0.1; }
          55% { transform: translate(-6px, -38px) rotate(-8deg); opacity: 0.07; }
          75% { transform: translate(12px, -16px) rotate(3deg); opacity: 0.1; }
        }
        @keyframes floatIcon5 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.06; }
          30% { transform: translate(-14px, -32px) rotate(-6deg); opacity: 0.09; }
          50% { transform: translate(10px, -46px) rotate(4deg); opacity: 0.06; }
          80% { transform: translate(-10px, -14px) rotate(-4deg); opacity: 0.1; }
        }
      `}</style>
    </div>
  );
}
