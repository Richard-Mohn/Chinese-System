'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FaShoppingCart, FaMapMarkerAlt, FaBitcoin, FaTruck, FaDesktop,
  FaBolt, FaPaintBrush, FaArrowRight, FaCheck
} from 'react-icons/fa';

const FEATURES = [
  {
    slug: 'online-ordering',
    icon: FaShoppingCart,
    title: 'Online Ordering',
    description: 'Accept orders directly from your branded website. Card, crypto, or cash — no commissions, no third-party apps.',
    color: 'from-orange-500 to-red-500',
  },
  {
    slug: 'gps-tracking',
    icon: FaMapMarkerAlt,
    title: 'GPS Delivery Tracking',
    description: 'Sub-second GPS tracking for your delivery fleet. Automated dispatch, route optimization, and live customer tracking.',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    slug: 'crypto-payments',
    icon: FaBitcoin,
    title: 'Crypto Payments',
    description: 'Accept Bitcoin, Ethereum, Litecoin, Dogecoin and more. QR code checkout works with Cash App, Coinbase, and any wallet.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    slug: 'delivery-management',
    icon: FaTruck,
    title: 'Delivery Management',
    description: 'Manage your own drivers with GPS tracking, automated dispatch, and real-time customer notifications.',
    color: 'from-emerald-500 to-green-500',
  },
  {
    slug: 'kitchen-display',
    icon: FaDesktop,
    title: 'Kitchen Display System',
    description: 'Digital ticket management. Orders flow in real-time, color-coded by status. Reduce errors, speed up your kitchen.',
    color: 'from-purple-500 to-violet-500',
  },
  {
    slug: 'real-time-orders',
    icon: FaBolt,
    title: 'Real-Time Orders',
    description: 'See every order the instant it\'s placed. Audio alerts, status updates, and live tracking from any device.',
    color: 'from-red-500 to-pink-500',
  },
  {
    slug: 'white-label-website',
    icon: FaPaintBrush,
    title: 'White-Label Website',
    description: 'Get a branded, SEO-optimized website in minutes. Custom colors, logo, domain, and content — zero coding.',
    color: 'from-cyan-500 to-blue-500',
  },
];

export default function FeaturesIndex() {
  return (
    <div className="min-h-screen bg-white/90">
      {/* Hero */}
      <section className="pt-36 pb-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-orange-50 border border-orange-100 text-xs font-black uppercase tracking-widest text-orange-600"
          >
            Platform Features
          </motion.div>
          <motion.h1
            className="text-5xl md:text-8xl font-black mb-6 tracking-tighter text-zinc-900 text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Everything You Need<span className="text-orange-500">.</span>
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium max-w-3xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            From online ordering to GPS delivery tracking, crypto payments to kitchen displays — every tool your business needs, zero commissions.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/register"
              className="group px-10 py-5 bg-black text-white rounded-full font-bold text-lg flex items-center gap-3 hover:bg-zinc-800 transition-all shadow-2xl"
            >
              Start Free Trial <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/pricing"
              className="px-10 py-5 bg-white text-black border-2 border-zinc-200 rounded-full font-bold text-lg hover:border-black transition-all"
            >
              See Pricing
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-24 px-4 bg-zinc-50/50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Link
                  href={`/features/${feature.slug}`}
                  className="block bg-white rounded-3xl border border-zinc-100 overflow-hidden hover:border-zinc-300 hover:shadow-2xl transition-all duration-500 group h-full"
                >
                  <div className={`h-32 bg-gradient-to-br ${feature.color} flex items-center justify-center relative overflow-hidden`}>
                    <feature.icon className="text-white text-4xl z-10 group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                  <div className="p-8">
                    <h3 className="text-xl font-bold text-black mb-3 group-hover:text-orange-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-zinc-500 text-sm leading-relaxed mb-4">
                      {feature.description}
                    </p>
                    <span className="text-orange-600 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                      Learn More <FaArrowRight className="text-[10px] group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Always Included */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Included on Every Plan
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              These features come standard — no upsells, no hidden fees.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'Unlimited menu items & categories',
              'White-label branded storefront',
              'Card payments via Stripe',
              'Crypto payments (BTC, ETH, LTC, DOGE + more)',
              'Cash-on-delivery toggle',
              'QR code ordering',
              'Guest checkout (no account required)',
              'Fraud & chargeback protection',
              'Mobile-optimized responsive design',
              'Real-time order notifications',
              'Auto-generated SEO website',
              '14-day free trial on all plans',
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-100"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
              >
                <FaCheck className="text-emerald-500 shrink-0" />
                <span className="text-zinc-700 font-medium text-sm">{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-zinc-950 rounded-[3rem] p-10 md:p-16 text-white text-center relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
                Ready to get started?
              </h2>
              <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto">
                14-day free trial. No credit card. No commitment. Launch your store today.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-bold text-lg hover:shadow-xl hover:shadow-orange-500/20 transition-all active:scale-95"
              >
                Start Free Trial <FaArrowRight />
              </Link>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-orange-600/10 to-transparent blur-3xl pointer-events-none" />
          </div>
        </div>
      </section>
    </div>
  );
}
