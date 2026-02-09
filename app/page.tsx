'use client';

import { useState } from 'react';
import Link from "next/link";
import { motion } from "framer-motion";
import dynamic from 'next/dynamic';
import {
  FaMapMarkerAlt, FaVideo, FaRocket, FaShieldAlt, FaArrowRight, FaCheck,
  FaTruck, FaBitcoin, FaCreditCard, FaBrain, FaChartLine, FaStore,
  FaGoogle, FaLock, FaBolt, FaUtensils, FaBirthdayCake, FaShoppingBasket,
  FaGlassCheers, FaCoffee, FaShoppingCart, FaPlay, FaMugHot
} from 'react-icons/fa';

import { useAuthModal } from '@/context/AuthModalContext';

const QuickOrderModal = dynamic(() => import('@/components/QuickOrderModal'), { ssr: false });

/* ─── Reusable Components ─── */

interface FeatureCardProps {
  icon: any;
  title: string;
  description: string;
  delay: number;
  accent?: string;
}

const FeatureCard = ({ icon: Icon, title, description, delay, accent = 'group-hover:bg-black group-hover:text-white' }: FeatureCardProps) => (
  <motion.div
    className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-zinc-200/60 hover:border-black/30 hover:shadow-xl transition-all duration-500 flex flex-col items-start text-left group"
    initial={{ y: 30, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
  >
    <div className={`w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6 ${accent} border border-zinc-100 transition-colors duration-500 shadow-sm`}>
      <Icon className="text-2xl" />
    </div>
    <h4 className="text-xl font-bold text-black mb-3">{title}</h4>
    <p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

interface StatBlockProps {
  value: string;
  label: string;
  delay: number;
}

const StatBlock = ({ value, label, delay }: StatBlockProps) => (
  <motion.div
    className="text-center"
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay }}
  >
    <div className="text-3xl md:text-5xl font-black tracking-tight mb-1 md:mb-2">{value}</div>
    <div className="text-[11px] md:text-sm font-bold text-zinc-400 uppercase tracking-wider">{label}</div>
  </motion.div>
);

/* ─── Page ─── */

/* Demo business for Quick Order preview */
const DEMO_BUSINESS = {
  businessId: 'demo-china-wok-rva',
  name: 'China Wok',
  slug: 'china-wok-rva',
  type: 'restaurant' as const,
  description: 'Authentic Chinese cuisine made fresh daily',
  brandColors: { primary: '#DC2626', secondary: '#991B1B', accent: '#F59E0B' },
  businessPhone: '(804) 555-8888',
  settings: { enableOrdering: true, enableDelivery: true, enablePickup: true, enableCashPayment: true, enableCryptoPayment: true, deliveryFee: 3.99, deliveryRadius: 10, taxRate: 0.053, minimumOrder: 10, estimatedPrepTime: 20 },
  website: { heroTitle: 'China Wok', heroSubtitle: 'Richmond\'s favorite Chinese restaurant', showHero: true },
} as any;

export default function Home() {
  const [quickOrderOpen, setQuickOrderOpen] = useState(false);
  const { openAuthModal } = useAuthModal();

  return (
    <div className="min-h-screen bg-white/90 selection:bg-black selection:text-white">
      {/* Shimmer keyframe */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.4; transform: scale(0.97); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }
      `}</style>

      {/* ━━━ HERO ━━━ */}
      <section className="relative pt-28 md:pt-32 pb-8 md:pb-12 px-4 overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-5 py-2 mb-6 rounded-full bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100/60 text-sm font-black tracking-widest text-orange-600 uppercase"
            >
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Now Accepting Crypto
            </motion.div>

            <motion.h1
              className="text-[3.5rem] md:text-[8rem] font-black mb-4 md:mb-6 tracking-tighter text-zinc-900 leading-[0.85]"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              Mohn<span className="text-orange-600">Menu</span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-zinc-500 max-w-2xl mx-auto mb-2 md:mb-3 leading-relaxed font-medium"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              The commerce platform that gives local businesses
              <span className="text-black font-black"> 100% of their revenue</span>.
            </motion.p>

            <motion.p
              className="text-sm md:text-base text-zinc-400 max-w-xl mx-auto mb-5 md:mb-8 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              Cards. Crypto. Cash. GPS fleet tracking. Live kitchen cameras.
              Zero commissions — built different from day one.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button
                onClick={() => openAuthModal('signup')}
                className="group px-8 py-4 md:px-10 md:py-5 bg-black text-white rounded-full font-bold text-base md:text-lg flex items-center gap-3 hover:bg-zinc-800 transition-all active:scale-95 shadow-2xl shadow-black/20"
              >
                Launch Your Store
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => openAuthModal('login')}
                className="px-8 py-4 md:px-10 md:py-5 bg-white text-zinc-900 border-2 border-zinc-200 rounded-full font-bold text-base md:text-lg hover:border-zinc-900 transition-all"
              >
                Sign In
              </button>

              {/* Quick Order Try-It Button — inline 3rd CTA */}
              <div className="relative group">
                {/* Floating tag — small + semi-transparent */}
                <motion.div
                  className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 bg-orange-600/50 text-white text-[8px] font-black uppercase tracking-[0.15em] rounded-full shadow-md z-10 pointer-events-none"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  ▶ TRY IT LIVE
                </motion.div>

                <button
                  onClick={() => setQuickOrderOpen(true)}
                  className="relative px-8 py-4 md:px-10 md:py-5 rounded-full font-bold text-base md:text-lg bg-gradient-to-r from-orange-500 to-red-600 text-white overflow-hidden transition-all active:scale-95 flex items-center gap-3 shadow-[0_0_24px_rgba(249,115,22,0.4)]"
                  style={{ animation: 'glow-pulse 3s ease-in-out infinite' }}
                >
                  <span className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
                    <span
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                        animation: 'shimmer 1.5s infinite',
                      }}
                    />
                  </span>
                  <FaShoppingCart className="relative z-10" />
                  <span className="relative z-10">Quick Order</span>
                  <FaPlay className="relative z-10 text-xs group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-red-100 rounded-full blur-[150px]" />
          <div className="absolute top-40 right-1/4 w-48 h-48 bg-amber-100 rounded-full blur-[100px]" />
        </div>
      </section>

      {/* ━━━ STOREFRONT PREVIEW CARDS ━━━ */}
      <section className="py-10 md:py-14 px-4 bg-gradient-to-b from-zinc-50/80 to-transparent">
        <div className="container mx-auto max-w-6xl">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-orange-600 font-black uppercase tracking-widest text-xs mb-3 block">See What You Get</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Your business. Online. Instantly.</h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">Every business type gets a branded storefront tailored to how they sell — menus, catalogs, or product listings.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              /* ─── 3 Live Demos (top row) ─── */
              { type: 'Chinese Restaurant', slug: 'china-wok-rva', name: 'China Wok', emoji: '🥡', color: 'from-red-500 to-orange-500', description: 'Full-service restaurant with online ordering, delivery, and Quick Order.', pageName: 'Menu', live: true },
              { type: 'Bar & Grill', slug: 'the-copper-tap', name: 'The Copper Tap', emoji: '🍺', color: 'from-purple-500 to-violet-500', description: 'Craft cocktail bar with reservations, jukebox & karaoke, kiosk mode, crypto payments.', pageName: 'Drink Menu', live: true },
              { type: 'Coffee Shop', slug: 'griffin-lounge', name: 'Griffin Lounge', emoji: '☕', color: 'from-amber-600 to-orange-700', description: 'Order-ahead espresso, cold brew, pastries & peer delivery.', pageName: 'Coffee Menu', live: true },
              { type: 'Church', slug: 'demo/shepherds-gate', name: 'Shepherds Gate Church', emoji: '⛪', color: 'from-emerald-600 to-teal-500', description: 'Service times, giving, events, ministries, and media — built for pastors and ministry teams.', pageName: 'Visit & Give', tags: ['Service Times', 'Giving', 'Events'], live: true },
              /* ─── Coming Soon ─── */
              { type: 'Pizza Shop', slug: '', name: 'Demo Pizza Co.', emoji: '🍕', color: 'from-orange-500 to-yellow-500', description: 'Pizza shop with build-your-own pizzas, sides, and delivery.', pageName: 'Menu', live: false },
              { type: 'Bakery & Café', slug: '', name: 'Sweet Crumb Bakery', emoji: '🧁', color: 'from-pink-500 to-rose-500', description: 'Pre-orders, custom cakes, pastries, and coffee drinks.', pageName: 'Menu', live: false },
              { type: 'Food Truck', slug: '', name: 'Street Eats RVA', emoji: '🚚', color: 'from-yellow-500 to-orange-500', description: 'Mobile food service with QR ordering and GPS location.', pageName: 'Menu', live: false },
              { type: 'Grocery Store', slug: '', name: 'Fresh Valley Market', emoji: '🛒', color: 'from-green-500 to-emerald-500', description: 'Online product catalog with curbside pickup & delivery.', pageName: 'Product Catalog', live: false },
              { type: 'Boutique', slug: '', name: 'Ivy & Thread', emoji: '👗', color: 'from-amber-500 to-orange-500', description: 'Clothing, accessories, and gifts with AI product listings.', pageName: 'Storefront', live: false },
              { type: 'Antique Shop', slug: '', name: 'Timeless Treasures', emoji: '🏺', color: 'from-amber-600 to-yellow-600', description: 'Vintage finds with AI-powered photo-to-listing tool.', pageName: 'Product Gallery', live: false },
              { type: 'Convenience Store', slug: '', name: 'QuickStop Mini Mart', emoji: '🏪', color: 'from-blue-500 to-indigo-500', description: 'Snacks, drinks, and essentials with grab-and-go ordering.', pageName: 'Quick-Shop', live: false },
            ].map((store, i) => (
              <motion.div
                key={store.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group"
              >
                <div className="bg-white rounded-3xl border border-zinc-100 hover:border-zinc-300 hover:shadow-xl transition-all duration-500 overflow-hidden h-full flex flex-col">
                  {/* Color header */}
                  <div className={`h-36 bg-gradient-to-br ${store.color} flex items-center justify-center relative overflow-hidden`}>
                    <span className="text-6xl z-10 group-hover:scale-110 transition-transform duration-500">{store.emoji}</span>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    {store.live && (
                      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-green-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Live
                      </div>
                    )}
                    {!store.live && (
                      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-zinc-500 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                        Coming Soon
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">{store.type}</div>
                    <h3 className="text-xl font-bold text-black mb-1">{store.name}</h3>
                    <p className="text-sm text-zinc-400 font-medium mb-4 flex-1">{store.description}</p>

                    <div className="flex items-center gap-2 text-xs text-zinc-500 font-bold mb-4">
                      <span className="px-2 py-0.5 bg-zinc-100 rounded-full">{store.pageName}</span>
                      {(store.tags ?? ['Quick Order', 'Cart']).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-zinc-100 rounded-full">{tag}</span>
                      ))}
                    </div>

                    {store.live ? (
                      <div className="flex gap-2">
                        <Link
                          href={`/${store.slug}`}
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-900 text-white rounded-full font-bold text-sm hover:bg-black transition-colors"
                        >
                          <FaPlay className="text-[10px]" /> View Storefront
                        </Link>
                        <Link
                          href={`/order/${store.slug}`}
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-bold text-sm hover:shadow-lg hover:shadow-orange-500/20 transition-all"
                        >
                          <FaShoppingCart className="text-[10px]" /> Order Page
                        </Link>
                      </div>
                    ) : (
                      <div className="py-3 bg-zinc-100 text-zinc-400 rounded-full font-bold text-sm text-center cursor-not-allowed">
                        Demo Coming Soon
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ STATS STRIP ━━━ */}
      <section className="py-10 md:py-16 border-y border-zinc-100">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-4 gap-4 md:gap-8">
            <StatBlock value="0%" label="Commission" delay={0.1} />
            <StatBlock value="<10m" label="Setup" delay={0.2} />
            <StatBlock value="BTC+" label="Crypto" delay={0.3} />
            <StatBlock value="24/7" label="Ordering" delay={0.4} />
          </div>
        </div>
      </section>

      {/* ━━━ CORE FEATURES GRID (6 cards) ━━━ */}
      <section className="py-16 md:py-28 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-orange-600 font-black uppercase tracking-widest text-xs mb-3 block">Why MohnMenu</span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4">Everything you need.<br />Nothing you don&apos;t.</h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">Six pillars that make us the only platform built for local businesses — not against them.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={FaMapMarkerAlt}
              title="Real-time GPS Tracking"
              description="Sub-second delivery tracking with automated dispatch. Your customers see exactly where their driver is — live."
              delay={0.05}
            />
            <FeatureCard
              icon={FaVideo}
              title="Live Chef Cam"
              description="Let customers watch their food being made. HD streaming builds trust and turns meals into events."
              delay={0.1}
            />
            <FeatureCard
              icon={FaBitcoin}
              title="Crypto Payments"
              description="Accept Bitcoin, Ethereum, Litecoin, Dogecoin and more. QR scan checkout — works with Cash App, Coinbase, any wallet."
              delay={0.15}
              accent="group-hover:bg-amber-500 group-hover:text-white"
            />
            <FeatureCard
              icon={FaCreditCard}
              title="Cards & Cash"
              description="Stripe-powered card processing with built-in fraud protection. Cash toggle for in-person orders. Every payment method covered."
              delay={0.2}
            />
            <FeatureCard
              icon={FaGoogle}
              title="Order with Google"
              description="Seamless integration with Google Search and Maps. Turn searchers into customers instantly with native ordering."
              delay={0.25}
            />
            <FeatureCard
              icon={FaBrain}
              title="Smart Insights"
              description="AI-driven analytics to optimize inventory, staffing, and menu pricing. Know your best sellers before you open."
              delay={0.3}
              accent="group-hover:bg-orange-600 group-hover:text-white"
            />
          </div>
        </div>
      </section>

      {/* ━━━ CRYPTO SPOTLIGHT ━━━ */}
      <section className="py-28 px-4 bg-zinc-950 text-white rounded-[3rem] mx-4 mb-6 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-amber-400 font-black uppercase tracking-widest text-xs mb-4 block">First in the Industry</span>
              <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
                Accept crypto.<br />
                <span className="text-zinc-500">Keep everything.</span>
              </h2>
              <p className="text-lg text-zinc-400 font-medium leading-relaxed mb-10">
                Your customers scan a QR code at checkout and pay with Bitcoin, Ethereum, Litecoin, or Dogecoin — directly from Cash App, Coinbase, or any crypto wallet. Funds settle to your account. No middleman markups.
              </p>
              <ul className="space-y-4 mb-12">
                <li className="flex items-center gap-3 font-bold text-white/90">
                  <FaCheck className="text-amber-400 shrink-0" /> In-app QR code — no redirects, no pop-ups
                </li>
                <li className="flex items-center gap-3 font-bold text-white/90">
                  <FaCheck className="text-amber-400 shrink-0" /> Works with Cash App, Coinbase, Trust Wallet
                </li>
                <li className="flex items-center gap-3 font-bold text-white/90">
                  <FaCheck className="text-amber-400 shrink-0" /> BTC, ETH, LTC, DOGE and more supported
                </li>
                <li className="flex items-center gap-3 font-bold text-white/90">
                  <FaCheck className="text-amber-400 shrink-0" /> Real-time payment confirmation with countdown
                </li>
              </ul>
              <Link href="/register" className="inline-flex items-center gap-2 text-amber-400 font-black text-lg border-b-2 border-amber-400 pb-1 hover:gap-4 transition-all">
                Enable crypto for your store <FaArrowRight />
              </Link>
            </motion.div>

            {/* Crypto visual */}
            <motion.div
              className="aspect-square max-w-md mx-auto w-full bg-zinc-900 rounded-[3rem] border border-zinc-800 flex flex-col items-center justify-center relative overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5" />
              {/* Floating coin icons */}
              <motion.div
                className="text-6xl mb-6 relative z-10"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <FaBitcoin className="text-amber-500" />
              </motion.div>
              <div className="text-center relative z-10">
                <div className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-2">Scan &amp; Pay</div>
                <div className="w-36 h-36 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center p-3">
                  {/* QR placeholder pattern */}
                  <div className="w-full h-full rounded-lg" style={{
                    backgroundImage: 'radial-gradient(circle, #000 2px, transparent 2px)',
                    backgroundSize: '8px 8px'
                  }} />
                </div>
                <div className="text-xs text-zinc-600 font-mono">bitcoin:bc1q...f8k2</div>
              </div>
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-zinc-600">
                <span>BTC</span><span>ETH</span><span>LTC</span><span>DOGE</span>
              </div>
              {/* Glow */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ━━━ MISSION — 100% Profit ━━━ */}
      <section className="py-28 px-4 bg-zinc-900 text-white rounded-[3rem] mx-4 mb-6 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter">100% Profit. 0% BS.</h2>
            <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-16 font-medium leading-relaxed">
              Delivery platforms take 30% of your hard work. That&apos;s insane.
              MohnMenu is free at its core — you keep what you earn.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
              <div className="bg-zinc-800/50 rounded-3xl p-8 border border-zinc-700/50">
                <h4 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <span className="text-orange-400 font-black text-lg">01</span> Setup
                </h4>
                <p className="text-zinc-400 font-medium leading-relaxed">Launch your own branded ordering site in under 10 minutes. No coding. No fees. No credit card needed.</p>
              </div>
              <div className="bg-zinc-800/50 rounded-3xl p-8 border border-zinc-700/50">
                <h4 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <span className="text-orange-400 font-black text-lg">02</span> Transact
                </h4>
                <p className="text-zinc-400 font-medium leading-relaxed">Customers pay you directly — card, crypto, or cash. We never touch your revenue or take a per-order cut.</p>
              </div>
              <div className="bg-zinc-800/50 rounded-3xl p-8 border border-zinc-700/50">
                <h4 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <span className="text-orange-400 font-black text-lg">03</span> Scale
                </h4>
                <p className="text-zinc-400 font-medium leading-relaxed">Unlock premium modules — GPS fleet tracking, Chef Cam, AI insights — as you grow. Pay only for what you use.</p>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-orange-600/15 blur-[150px] rounded-full" />
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-red-600/10 blur-[120px] rounded-full" />
      </section>

      {/* ━━━ CHEF'S EYE MODULE ━━━ */}
      <section className="py-28 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-orange-600 font-black uppercase tracking-widest text-xs mb-4 block">Premium Module</span>
              <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">The &ldquo;Chef&apos;s Eye&rdquo; Experience.</h2>
              <p className="text-xl text-zinc-500 font-medium leading-relaxed mb-10">
                Give your customers a VIP view into your kitchen. Live HD streaming builds ultimate trust and turns a simple meal into an event.
              </p>
              <ul className="space-y-4 mb-12">
                <li className="flex items-center gap-3 font-bold text-black">
                  <FaCheck className="text-orange-600 shrink-0" /> High-definition low-latency stream
                </li>
                <li className="flex items-center gap-3 font-bold text-black">
                  <FaCheck className="text-orange-600 shrink-0" /> Automated streaming triggers per order
                </li>
                <li className="flex items-center gap-3 font-bold text-black">
                  <FaCheck className="text-orange-600 shrink-0" /> Increases customer retention by 40%
                </li>
              </ul>
              <Link href="/register" className="inline-flex items-center gap-2 text-black font-black text-lg border-b-2 border-black pb-1 hover:gap-4 transition-all">
                Learn how it works <FaArrowRight />
              </Link>
            </motion.div>
            <div className="aspect-video bg-zinc-50 rounded-[3rem] border border-zinc-100 flex items-center justify-center relative overflow-hidden shadow-2xl">
              <div className="text-9xl grayscale opacity-10">📹</div>
              <div className="absolute top-8 right-8 flex items-center gap-2 bg-red-600 text-white px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest animate-pulse">
                <div className="w-2 h-2 rounded-full bg-white" /> Live Feed
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ ELITE FLEET MODULE ━━━ */}
      <section className="py-28 px-4 bg-zinc-50 rounded-[3rem] mx-4 mb-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1 aspect-video bg-white rounded-[3rem] border border-zinc-100 flex items-center justify-center relative overflow-hidden shadow-2xl group">
              {/* Map Grid Pattern */}
              <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
              <motion.div
                className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white shadow-2xl relative z-10"
                animate={{
                  x: [0, 50, 20, -30, 0],
                  y: [0, -30, 40, 10, 0]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <FaTruck className="text-xl" />
                <div className="absolute -inset-4 bg-orange-600/20 rounded-full animate-ping" />
              </motion.div>
              <div className="absolute bottom-8 left-8 bg-black text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-[0.2em]">Live Signal: Active</div>
            </div>

            <motion.div
              className="order-1 lg:order-2"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-orange-600 font-black uppercase tracking-widest text-xs mb-4 block">Premium Module</span>
              <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">The &ldquo;Elite Fleet&rdquo; Module.</h2>
              <p className="text-xl text-zinc-500 font-medium leading-relaxed mb-10">
                Stop guessing. Start tracking. Sub-second GPS gives you absolute visibility over your delivery operations — reducing costs and delighting customers.
              </p>
              <ul className="space-y-4 mb-12">
                <li className="flex items-center gap-3 font-bold text-black">
                  <FaCheck className="text-orange-600 shrink-0" /> Sub-second GPS coordinate updates
                </li>
                <li className="flex items-center gap-3 font-bold text-black">
                  <FaCheck className="text-orange-600 shrink-0" /> Automated driver routing &amp; dispatch
                </li>
                <li className="flex items-center gap-3 font-bold text-black">
                  <FaCheck className="text-orange-600 shrink-0" /> Real-time customer tracking links
                </li>
              </ul>
              <Link href="/register" className="inline-flex items-center gap-2 text-black font-black text-lg border-b-2 border-black pb-1 hover:gap-4 transition-all">
                Explore the Fleet Hub <FaArrowRight />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ━━━ COMPARISON STRIP ━━━ */}
      <section className="py-28 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">MohnMenu vs. the platforms.</h2>
            <p className="text-zinc-400 text-lg">See why thousands of businesses are switching.</p>
          </motion.div>

          <motion.div
            className="bg-zinc-50 rounded-3xl border border-zinc-100 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Header */}
            <div className="grid grid-cols-3 text-center text-sm font-black uppercase tracking-widest p-6 border-b border-zinc-100">
              <div className="text-zinc-400">Feature</div>
              <div className="text-black">MohnMenu</div>
              <div className="text-zinc-400">Others</div>
            </div>
            {[
              { feature: 'Commission', mohn: '0%', other: '15-30%' },
              { feature: 'Crypto Payments', mohn: '✓', other: '✗' },
              { feature: 'Live Kitchen Cam', mohn: '✓', other: '✗' },
              { feature: 'GPS Fleet Tracking', mohn: '✓', other: 'Add-on $$$' },
              { feature: 'Own Your Data', mohn: '✓', other: '✗' },
              { feature: 'White-label Branding', mohn: '✓', other: '✗' },
            ].map((row, i) => (
              <div key={i} className={`grid grid-cols-3 text-center py-5 px-6 text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50'} ${i < 5 ? 'border-b border-zinc-100' : ''}`}>
                <div className="font-bold text-zinc-700 text-left">{row.feature}</div>
                <div className="font-black text-black">{row.mohn}</div>
                <div className="text-zinc-400">{row.other}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━━ TRUST / CTA ━━━ */}
      <section className="py-24 px-4 bg-black text-white rounded-[3rem] mx-4 mb-20 relative overflow-hidden">
        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-xs mb-8">Trusted by modern businesses</p>
            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 mb-16">
              {[
                { href: '/for-restaurants', icon: FaUtensils, label: 'Restaurants' },
                { href: '/for-bakeries-cafes', icon: FaBirthdayCake, label: 'Bakeries & Cafés' },
                { href: '/for-food-trucks', icon: FaTruck, label: 'Food Trucks' },
                { href: '/for-grocery-markets', icon: FaShoppingBasket, label: 'Markets' },
                { href: '/for-bars-nightlife', icon: FaGlassCheers, label: 'Bars' },
                { href: '/for-convenience-stores', icon: FaCoffee, label: 'Stores' },
                { href: '/for-retail-shops', icon: FaStore, label: 'Shops & Boutiques' },
                { href: '/for-coffee-shops', icon: FaMugHot, label: 'Coffee Shops' },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-zinc-700 hover:border-white hover:bg-white/10 transition-all group">
                  <item.icon className="text-sm text-zinc-500 group-hover:text-orange-400 transition-colors" />
                  <span className="text-sm font-bold text-zinc-400 group-hover:text-white transition-colors">{item.label}</span>
                </Link>
              ))}
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Ready to keep 100%?</h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto mb-10">
              14-day free trial. No credit card. No commitment. Start building your store today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="group px-10 py-5 bg-white text-black rounded-full font-bold text-lg flex items-center gap-3 hover:bg-zinc-100 transition-all active:scale-95">
                Start Free Trial
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/pricing" className="px-10 py-5 border-2 border-zinc-700 text-white rounded-full font-bold text-lg hover:border-white transition-all">
                View Pricing
              </Link>
            </div>
          </motion.div>
        </div>
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-orange-600/10 blur-[120px] rounded-full" />
      </section>

      {/* Quick Order Modal */}
      <QuickOrderModal
        business={DEMO_BUSINESS}
        isOpen={quickOrderOpen}
        onClose={() => setQuickOrderOpen(false)}
      />

    </div>
  );
}
