'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { FaArrowRight, FaPlay, FaShoppingCart } from 'react-icons/fa';
import FloatingStoreIcons from '@/components/FloatingStoreIcons';

const DEMO_STORES = [
  {
    type: 'Chinese Restaurant',
    slug: 'china-wok-rva',
    name: 'China Wok',
    emoji: '🥡',
    color: 'from-red-500 to-orange-500',
    description: 'Full-service restaurant with online ordering, delivery, and Quick Order.',
    pageName: 'Menu',
    live: true,
  },
  {
    type: 'Bar & Grill',
    slug: 'demo/bars',
    name: 'Bar Operations Demo',
    emoji: '🍺',
    color: 'from-purple-500 to-violet-500',
    description: 'Role-driven nightlife demo with owner, bartender, server, driver, and customer journeys.',
    pageName: 'Role Demo',
    live: true,
  },
  {
    type: 'Coffee Shop',
    slug: 'demo/coffee',
    name: 'Coffee Operations Demo',
    emoji: '☕',
    color: 'from-amber-600 to-orange-700',
    description: 'Role-based cafe demo for owner, barista, cashier, driver, and customer walkthroughs.',
    pageName: 'Role Demo',
    live: true,
  },
  {
    type: 'Church',
    slug: 'demo/shepherds-gate',
    name: 'Shepherds Gate Church',
    emoji: '⛪',
    color: 'from-emerald-600 to-teal-500',
    description: 'Service times, giving, events, ministries, and media — built for pastors and ministry teams.',
    pageName: 'Visit & Give',
    tags: ['Service Times', 'Giving', 'Events'],
    live: true,
  },
  {
    type: 'Music Artist',
    slug: 'demo/music',
    name: 'Neon Voltage',
    emoji: '🎵',
    color: 'from-violet-500 to-purple-600',
    description: 'Artist page with tracks, merch, tour dates, and fan engagement tools.',
    pageName: 'Artist Demo',
    tags: ['Tracks', 'Merch', 'Tour'],
    live: true,
  },
  {
    type: 'Driver Marketplace',
    slug: 'demo/driver',
    name: 'RVA Uber Driver Hub',
    emoji: '🚘',
    color: 'from-indigo-500 to-purple-600',
    description: 'Delivery + marketplace driver experience with earnings and route tools.',
    pageName: 'Driver Demo',
    tags: ['Driver App', 'Earnings'],
    live: true,
  },
  {
    type: 'Roadside Assistance',
    slug: 'demo/roadside',
    name: 'QuickJump Assist',
    emoji: '🔋',
    color: 'from-orange-500 to-amber-500',
    description: 'Roadside dispatch demo for jump starts, lockouts, and tire support.',
    pageName: 'Service Demo',
    tags: ['Jump Start', 'SOS Dispatch'],
    live: true,
  },
  {
    type: 'Pizza Shop',
    slug: 'demo/pizza',
    name: 'Demo Pizza Co.',
    emoji: '🍕',
    color: 'from-orange-500 to-yellow-500',
    description: 'Pizza shop with build-your-own pizzas, sides, and delivery.',
    pageName: 'Menu',
    tags: ['Build Your Own', 'Combos'],
    live: true,
  },
  {
    type: 'Bakery & Café',
    slug: 'demo/bakery',
    name: 'Sweet Crumb Bakery',
    emoji: '🧁',
    color: 'from-pink-500 to-rose-500',
    description: 'Pre-orders, custom cakes, pastries, and coffee drinks.',
    pageName: 'Menu',
    tags: ['Pre-Order', 'Custom Cakes'],
    live: true,
  },
  {
    type: 'Food Truck',
    slug: 'demo/food-truck',
    name: 'Street Eats RVA',
    emoji: '🚚',
    color: 'from-yellow-500 to-orange-500',
    description: 'Mobile food service with QR ordering and GPS location.',
    pageName: 'Menu',
    tags: ['QR Ordering', 'GPS'],
    live: true,
  },
  {
    type: 'Grocery Store',
    slug: 'demo/grocery',
    name: 'Fresh Valley Market',
    emoji: '🛒',
    color: 'from-green-500 to-emerald-500',
    description: 'Online product catalog with curbside pickup & delivery.',
    pageName: 'Product Catalog',
    tags: ['Pickup', 'Delivery'],
    live: true,
  },
  {
    type: 'Boutique',
    slug: 'demo/boutique',
    name: 'Ivy & Thread',
    emoji: '👗',
    color: 'from-amber-500 to-orange-500',
    description: 'Clothing, accessories, and gifts with AI product listings.',
    pageName: 'Storefront',
    tags: ['Apparel', 'Accessories'],
    live: true,
  },
  {
    type: 'Antique Shop',
    slug: 'demo/antique',
    name: 'Timeless Treasures',
    emoji: '🏺',
    color: 'from-amber-600 to-yellow-600',
    description: 'Vintage finds with AI-powered photo-to-listing tool.',
    pageName: 'Product Gallery',
    tags: ['Vintage', 'Collectibles'],
    live: true,
  },
  {
    type: 'Convenience Store',
    slug: 'demo/convenience',
    name: 'QuickStop Mini Mart',
    emoji: '🏪',
    color: 'from-blue-500 to-indigo-500',
    description: 'Snacks, drinks, and essentials with grab-and-go ordering.',
    pageName: 'Quick-Shop',
    tags: ['Grab & Go', 'Essentials'],
    live: true,
  },
];

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-white/90">
      {/* Hero */}
      <section className="pt-36 pb-16 px-4 relative overflow-hidden">
        <FloatingStoreIcons storeType="default" count={16} position="absolute" />
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-orange-50 border border-orange-100 text-xs font-black uppercase tracking-widest text-orange-600"
          >Live Demos</motion.div>
          <motion.h1
            className="text-5xl md:text-8xl font-black mb-6 tracking-tighter text-zinc-900 text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Try before you build<span className="text-orange-500">.</span>
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium max-w-3xl mx-auto mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Explore fully-functional demo stores for every business type. Browse menus, add items to cart, and try Quick Order — exactly like your customers will.
          </motion.p>
          <motion.p
            className="text-sm text-zinc-400 font-medium mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Demo stores use test data. No real orders or payments will be processed.
          </motion.p>
        </div>
      </section>

      {/* Demo Grid */}
      <section className="pb-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DEMO_STORES.map((store, i) => (
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
                          <FaPlay className="text-[10px]" /> {store.slug.startsWith('demo/') ? 'View Demo' : 'View Storefront'}
                        </Link>
                        {!store.slug.startsWith('demo/') && (
                          <Link
                            href={`/order/${store.slug}`}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-bold text-sm hover:shadow-lg hover:shadow-orange-500/20 transition-all"
                          >
                            <FaShoppingCart className="text-[10px]" /> Order Page
                          </Link>
                        )}
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

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl bg-zinc-950 rounded-[3rem] p-10 md:p-16 text-white shadow-2xl text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Like what you see?</h2>
            <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto">
              Your store can look this good in under 10 minutes. Start your 3-day free trial — no credit card required.
            </p>
            <Link href="/register" className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-bold text-lg hover:shadow-xl hover:shadow-orange-500/20 transition-all">
              Start Your Free Trial <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-orange-600/10 to-transparent blur-3xl pointer-events-none" />
        </div>
      </section>
    </div>
  );
}
