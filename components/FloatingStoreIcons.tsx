'use client';

import { useEffect, useState, useMemo } from 'react';

/**
 * FloatingStoreIcons — Subtle, GPU-accelerated floating SVG icons
 * customized to specific business/store types.
 *
 * Uses CSS keyframe animations (no framer-motion) for performance.
 * Renders as an absolute overlay at z-0, behind page content.
 */

/* ─── Store-specific icon sets (SVG paths) ─── */
const ICON_SETS: Record<string, string[]> = {
  bar: [
    // Cocktail glass
    'M8 22h8M12 17v5M2 2l10 10 10-10H2zM7 7h10',
    // Wine glass
    'M8 22h8M12 13v9M12 13a5 5 0 005-5V2H7v6a5 5 0 005 5z',
    // Beer mug
    'M17 8h1a4 4 0 010 8h-1M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z',
    // Bottle
    'M10 2h4v4l2 2v12a2 2 0 01-2 2h-4a2 2 0 01-2-2V8l2-2V2zM8 12h8',
    // Music note
    'M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zM21 16a3 3 0 11-6 0 3 3 0 016 0z',
    // Star (VIP)
    'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    // Glass with straw
    'M6 2h12l-2 18H8L6 2zM8 2l-1 5M16 2l1 5M7 7h10M12 7v13',
    // Dice
    'M4 4h16v16H4zM8 8h.01M16 8h.01M8 16h.01M16 16h.01M12 12h.01',
    // Crown (VIP)
    'M2 20h20L19 9l-4 4-3-7-3 7-4-4-3 11z',
    // Disco ball / circle
    'M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15 15 0 014 10 15 15 0 01-4 10M12 2a15 15 0 00-4 10 15 15 0 004 10',
  ],
  restaurant: [
    // Fork & Knife
    'M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7',
    // Pizza
    'M12 2C6.48 2 2 6.48 2 12l10-10zm0 0c5.52 0 10 4.48 10 10L12 2zm0 20l5-10H7l5 10z',
    // Hamburger
    'M3 7h18M3 12h18M5 7a7 7 0 0114 0M5 17a7 7 0 0014 0M3 17h18',
    // Bowl
    'M4 11h16M4 11c0 4.42 3.58 8 8 8s8-3.58 8-8',
    // Fire/Flame
    'M12 22c4-4 8-7.33 8-12A8 8 0 004 10c0 4.67 4 8 8 12zM12 22c-1.33-1.33-2-3-2-5a4 4 0 014-4 4.67 4.67 0 01-2 9z',
    // Chef hat
    'M6 13v8h12v-8M9 13a6 6 0 016 0M6 13a5 5 0 013-9 5 5 0 0110 1 5 5 0 01-1 8',
    // Plate
    'M12 2a10 10 0 100 20 10 10 0 000-20zm0 6a4 4 0 100 8 4 4 0 000-8z',
    // Taco
    'M4 16c0 2.21 3.58 4 8 4s8-1.79 8-4M4 16c0-4 3.58-12 8-12s8 8 8 12',
  ],
  bakery: [
    // Cupcake
    'M8 14h8M6 14c0 4 2 7 6 7s6-3 6-7M9 14V9c0-1 .5-2.5 3-2.5S15 8 15 9v5',
    // Cake
    'M2 18h20v-4a4 4 0 00-4-4H6a4 4 0 00-4 4v4zM6 10V8M12 10V6M18 10V8',
    // Bread
    'M5 12h14M5 12a3 3 0 010-6h14a3 3 0 010 6M5 12v6a2 2 0 002 2h10a2 2 0 002-2v-6',
    // Coffee
    'M17 8h1a4 4 0 010 8h-1M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8zM6 2v3M10 2v3M14 2v3',
    // Heart
    'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z',
    // Donut
    'M12 2a10 10 0 100 20 10 10 0 000-20zm0 6a4 4 0 100 8 4 4 0 000-8z',
    // Cherry
    'M12 2c-3 4-7 4-7 8a7 7 0 0014 0c0-4-4-4-7-8zM12 2c2 2 4 4 4 6M12 2c-2 2-4 4-4 6',
    // Gift
    'M20 12v10H4V12M2 7h20v5H2zM12 22V7',
  ],
  grocery: [
    // Cart
    'M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6M9 22a1 1 0 100-2 1 1 0 000 2zM20 22a1 1 0 100-2 1 1 0 000 2z',
    // Apple
    'M12 3c-4 0-8 4-8 9s4 9 8 9 8-4 8-9-4-9-8-9zM12 3c0-2 1-3 3-3',
    // Bag
    'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0',
    // Leaf
    'M17 8C8 10 5.9 16.17 3.82 21.34M17 8A5 5 0 0017 8zM17 8l4-4M3 21c5-5 8-8 14-13',
    // Box
    'M16 3H8l-4 4v10a2 2 0 002 2h12a2 2 0 002-2V7l-4-4zM4 7h16M12 3v8',
    // Scale
    'M12 3v18M8 21h8M5 8l7-5 7 5M5 8l-2 5h6zM19 8l-2 5h6z',
    // Milk
    'M8 2h8l2 4v14a2 2 0 01-2 2H8a2 2 0 01-2-2V6l2-4zM6 8h12',
    // Basket
    'M5 8l-3 9a1 1 0 001 1h18a1 1 0 001-1l-3-9M5 8h14M5 8l2-6h10l2 6M12 8v10',
  ],
  retail: [
    // Hanger
    'M12 5a3 3 0 00-3 3l3-3zm0 0a3 3 0 013 3l-3-3zm0 0v2m-9 3l9-5 9 5v10H3V10z',
    // Bag
    'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0',
    // Tag
    'M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01',
    // Gift
    'M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7a4 4 0 00-4-4c-1.5 0-3 1-3 3s2 4 4 4M12 7a4 4 0 014-4c1.5 0 3 1 3 3s-2 4-4 4',
    // Star
    'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    // Diamond
    'M2.5 8.5l9.5 13 9.5-13L16 2H8L2.5 8.5zM2.5 8.5h19M8 2l4 6.5L16 2',
    // Shirt
    'M16 3l4 2v4l-4-2v15H8V7L4 9V5l4-2 2-1h4l2 1z',
    // Scissors
    'M6 9a3 3 0 100-6 3 3 0 000 6zM6 21a3 3 0 100-6 3 3 0 000 6zM20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12',
  ],
  foodtruck: [
    // Truck
    'M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 18a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM18.5 18a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
    // Map pin
    'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 7a3 3 0 100 6 3 3 0 000-6z',
    // Taco
    'M4 16c0 2.21 3.58 4 8 4s8-1.79 8-4M4 16c0-4 3.58-12 8-12s8 8 8 12',
    // Fire
    'M12 22c4-4 8-7.33 8-12A8 8 0 004 10c0 4.67 4 8 8 12z',
    // QR Code
    'M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM17 13h4v4h-4zM13 17h4v4h-4z',
    // GPS
    'M12 22s-8-4.5-8-11.8a8 8 0 0116 0c0 7.3-8 11.8-8 11.8zM12 10a2 2 0 100-4 2 2 0 000 4z',
    // Burger
    'M3 7h18M3 12h18M5 7a7 7 0 0114 0M5 17a7 7 0 0014 0M3 17h18',
    // Bell
    'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0',
  ],
  convenience: [
    // Store
    'M3 21h18M3 7l2-4h14l2 4M3 7h18M5 7v14M19 7v14M9 21v-6h6v6',
    // Bag
    'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18',
    // Coffee cup
    'M17 8h1a4 4 0 010 8h-1M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z',
    // Zap (energy)
    'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
    // Package
    'M16 3H8l-4 4v10a2 2 0 002 2h12a2 2 0 002-2V7l-4-4zM4 7h16M12 3v8',
    // Clock
    'M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2',
    // Dollar
    'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
    // Cart
    'M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6',
  ],
  church: [
    // Church building
    'M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6',
    // Cross
    'M12 4v16M8 8h8',
    // Bible
    'M4 6h7a3 3 0 013 3v11H7a3 3 0 00-3 3V6zm10 0h6a2 2 0 012 2v14a3 3 0 00-3-3h-5V6z',
    // Dove
    'M4 13c3-5 9-7 16-7-2 5-6 9-11 10-2 1-4 1-5-3z',
    // Hands / care
    'M4 14c2-2 4-2 6 0l2 2 2-2c2-2 4-2 6 0',
    // Calendar
    'M7 2v4M17 2v4M3 8h18M5 8v12h14V8',
  ],
  default: [
    'M12 2C6.48 2 2 6.48 2 12l10-10zm0 0c5.52 0 10 4.48 10 10L12 2zm0 20l5-10H7l5 10z',
    'M3 7h18M3 12h18M5 7a7 7 0 0114 0M5 17a7 7 0 0014 0M3 17h18',
    'M17 8h1a4 4 0 010 8h-1M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8zM6 2v3M10 2v3M14 2v3',
    'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0',
    'M8 22h8M12 13v9M12 13a5 5 0 005-5V2H7v6a5 5 0 005 5z',
    'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    'M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6',
    'M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7',
  ],
};

/* ─── Color themes per store type ─── */
const COLOR_THEMES: Record<string, string> = {
  bar: 'text-purple-400/[0.08]',
  restaurant: 'text-orange-400/[0.08]',
  bakery: 'text-pink-400/[0.08]',
  grocery: 'text-green-400/[0.08]',
  retail: 'text-amber-400/[0.08]',
  foodtruck: 'text-yellow-400/[0.08]',
  convenience: 'text-blue-400/[0.08]',
  church: 'text-emerald-400/[0.08]',
  default: 'text-zinc-400/[0.08]',
};

/* ─── Seeded pseudo-random ─── */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

interface Props {
  storeType?: string;
  count?: number;
  /** 'fixed' behind all content, 'absolute' within a section */
  position?: 'fixed' | 'absolute';
  className?: string;
}

export default function FloatingStoreIcons({
  storeType = 'default',
  count = 18,
  position = 'absolute',
  className = '',
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const hasRIC = typeof requestIdleCallback !== 'undefined';
    const id = hasRIC
      ? requestIdleCallback(() => setMounted(true))
      : setTimeout(() => setMounted(true), 100);
    return () => {
      if (typeof id === 'number') {
        if (typeof cancelIdleCallback !== 'undefined') cancelIdleCallback(id);
        else clearTimeout(id);
      }
    };
  }, []);

  const icons = useMemo(() => {
    const paths = ICON_SETS[storeType] || ICON_SETS.default;
    const colorClass = COLOR_THEMES[storeType] || COLOR_THEMES.default;
    const rand = seededRandom(storeType.length * 137 + 42);

    return Array.from({ length: count }, (_, i) => {
      const pathIndex = i % paths.length;
      const x = rand() * 90 + 5;
      const y = rand() * 85 + 5;
      const size = 36 + rand() * 32;
      const duration = 25 + rand() * 20;
      const delay = rand() * -45;
      const animIndex = i % 8;

      return {
        key: i,
        pathIndex,
        x,
        y,
        size,
        duration,
        delay,
        animIndex,
        colorClass,
        path: paths[pathIndex],
      };
    });
  }, [storeType, count]);

  if (!mounted) return null;

  return (
    <div
      className={`${position} inset-0 z-0 pointer-events-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {icons.map((icon) => (
        <div
          key={icon.key}
          className="absolute pointer-events-none"
          style={{
            left: `${icon.x}%`,
            top: `${icon.y}%`,
            width: icon.size,
            height: icon.size,
            animation: `storeFloat${icon.animIndex} ${icon.duration}s ease-in-out ${icon.delay}s infinite`,
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
            className={`w-full h-full ${icon.colorClass}`}
          >
            <path d={icon.path} />
          </svg>
        </div>
      ))}

      <style>{`
        @keyframes storeFloat0 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.4; }
          25% { transform: translate(14px, -28px) rotate(7deg); opacity: 0.8; }
          50% { transform: translate(-10px, -44px) rotate(-5deg); opacity: 0.5; }
          75% { transform: translate(16px, -20px) rotate(9deg); opacity: 0.9; }
        }
        @keyframes storeFloat1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.5; }
          30% { transform: translate(-16px, -34px) rotate(-8deg); opacity: 0.9; }
          60% { transform: translate(12px, -48px) rotate(6deg); opacity: 0.5; }
          80% { transform: translate(-6px, -22px) rotate(-3deg); opacity: 0.85; }
        }
        @keyframes storeFloat2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.45; }
          20% { transform: translate(20px, -24px) rotate(10deg); opacity: 0.85; }
          50% { transform: translate(-14px, -38px) rotate(-7deg); opacity: 0.55; }
          80% { transform: translate(10px, -18px) rotate(5deg); opacity: 0.9; }
        }
        @keyframes storeFloat3 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.4; }
          35% { transform: translate(-12px, -30px) rotate(-6deg); opacity: 0.8; }
          65% { transform: translate(16px, -46px) rotate(8deg); opacity: 0.5; }
          85% { transform: translate(-8px, -14px) rotate(-2deg); opacity: 0.85; }
        }
        @keyframes storeFloat4 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.5; }
          25% { transform: translate(18px, -26px) rotate(8deg); opacity: 0.9; }
          55% { transform: translate(-8px, -42px) rotate(-9deg); opacity: 0.5; }
          75% { transform: translate(14px, -18px) rotate(4deg); opacity: 0.85; }
        }
        @keyframes storeFloat5 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.45; }
          30% { transform: translate(-18px, -36px) rotate(-7deg); opacity: 0.8; }
          50% { transform: translate(12px, -50px) rotate(5deg); opacity: 0.45; }
          80% { transform: translate(-12px, -16px) rotate(-5deg); opacity: 0.9; }
        }
        @keyframes storeFloat6 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.5; }
          20% { transform: translate(10px, -32px) rotate(6deg); opacity: 0.85; }
          45% { transform: translate(-16px, -40px) rotate(-8deg); opacity: 0.5; }
          70% { transform: translate(8px, -22px) rotate(3deg); opacity: 0.9; }
        }
        @keyframes storeFloat7 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.45; }
          25% { transform: translate(-14px, -28px) rotate(-5deg); opacity: 0.9; }
          55% { transform: translate(18px, -44px) rotate(7deg); opacity: 0.5; }
          85% { transform: translate(-6px, -16px) rotate(-3deg); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
