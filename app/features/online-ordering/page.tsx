'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FaShoppingCart, FaCreditCard, FaBitcoin, FaMobileAlt, FaArrowRight,
  FaCheck, FaUtensils, FaClock, FaMapMarkerAlt, FaPercent
} from 'react-icons/fa';

const FEATURES = [
  { icon: FaCreditCard, title: 'Card Payments via Stripe', desc: 'Secure card processing with Stripe Connect. Funds go directly to your account — no middleman.' },
  { icon: FaBitcoin, title: 'Crypto Payments', desc: 'Accept Bitcoin, Ethereum, USDT, SOL, LTC, DOGE, TRX, and USDC with inline QR codes and automatic confirmation.' },
  { icon: FaMobileAlt, title: 'Cash Option', desc: 'Customers can also choose to pay cash on pickup or delivery — no payment required upfront.' },
  { icon: FaClock, title: 'Real-Time Order Updates', desc: 'Orders appear instantly in your dashboard with audio alerts. Track every order from pending to delivered.' },
  { icon: FaMapMarkerAlt, title: 'Delivery or Pickup', desc: 'Customers choose their order type. Delivery orders include address capture and fee calculation.' },
  { icon: FaPercent, title: 'Custom Tax & Fees', desc: 'Set your own tax rate, delivery fee, and minimum order — all calculated automatically at checkout.' },
];

const FAQS = [
  {
    q: 'What payment methods can my customers use?',
    a: 'Customers can pay with credit/debit cards (Visa, Mastercard, Amex via Stripe), 8 cryptocurrencies (BTC, ETH, USDT, SOL, USDC, LTC, DOGE, TRX) with QR code scanning, or cash on delivery/pickup.',
  },
  {
    q: 'How do I receive payments?',
    a: 'Card payments are processed through Stripe Connect — funds go directly to your connected Stripe account. Crypto payments are handled by NOWPayments and settled to your configured wallet. Cash payments are collected at the point of delivery or pickup.',
  },
  {
    q: 'Do I need to build my own menu?',
    a: 'When you sign up and choose your business type, we automatically seed a starter menu tailored to your cuisine. You can then edit, add, or remove items from the Menu section in your owner dashboard.',
  },
  {
    q: 'Can customers order without creating an account?',
    a: 'Yes. The order page collects their name, email, and phone for order communication but does not require them to register an account.',
  },
  {
    q: 'How do I get notified of new orders?',
    a: 'New orders trigger both an audio chime and a browser notification (if you grant permission) on your Orders dashboard. Orders appear in real-time via Firestore listeners — no page refresh needed.',
  },
  {
    q: 'Can I set my own delivery fee and tax rate?',
    a: 'Yes. In your Settings page, you can configure your delivery fee, tax rate, and minimum order amount. These are applied automatically during checkout.',
  },
];

export default function OnlineOrderingFeature() {
  return (
    <div className="min-h-screen bg-white/90">
      {/* Hero */}
      <section className="pt-36 pb-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-orange-50 border border-orange-100 text-xs font-black uppercase tracking-widest text-orange-600"
          >Feature</motion.div>
          <motion.h1
            className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-zinc-900 text-balance"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          >
            Online Ordering<span className="text-orange-600">.</span>
          </motion.h1>
          <motion.p
            className="text-xl text-zinc-500 leading-relaxed font-medium max-w-3xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            Accept orders directly from your own branded website. Card, crypto, or cash — no commissions, 
            no third-party apps taking 30% of your revenue.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/register" className="group px-8 py-4 bg-black text-white rounded-full font-bold text-lg flex items-center gap-3 hover:bg-zinc-800 transition-all shadow-2xl">
              Start Free <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-zinc-50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-black text-black mb-12 tracking-tight text-center">
            How It Works<span className="text-orange-500">.</span>
          </h2>
          <div className="space-y-8">
            {[
              { n: '1', t: 'Customer visits your page', d: 'They go to your branded storefront (e.g. mohnmenu.com/your-restaurant) and browse your live menu.' },
              { n: '2', t: 'They add items to cart', d: 'Menu items with sizes, options, and special instructions are added to a real-time cart with running totals.' },
              { n: '3', t: 'Checkout with their preferred payment', d: 'Card (via Stripe), crypto (8 coins with QR), or cash. Enter name, phone, and delivery address if needed.' },
              { n: '4', t: 'You get notified instantly', d: 'The order pops up in your dashboard with an audio chime and browser notification. Advance the status as you prepare it.' },
            ].map((step, i) => (
              <motion.div key={i} className="flex gap-6 items-start" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">{step.n}</div>
                <div>
                  <h4 className="text-lg font-bold text-black mb-1">{step.t}</h4>
                  <p className="text-zinc-500 text-sm leading-relaxed">{step.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-black text-black mb-12 tracking-tight text-center">
            What&apos;s Included<span className="text-orange-500">.</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={i} className="bg-zinc-50 p-8 rounded-3xl border border-zinc-100 group hover:border-zinc-300 hover:shadow-lg transition-all"
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-5 group-hover:bg-black group-hover:text-white transition-all shadow-sm">
                  <f.icon className="text-xl" />
                </div>
                <h4 className="text-lg font-bold text-black mb-2">{f.title}</h4>
                <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-zinc-50">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-black text-black mb-12 tracking-tight text-center">
            Questions & Answers<span className="text-orange-500">.</span>
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <motion.details key={i} className="group bg-white rounded-2xl border border-zinc-100 overflow-hidden"
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              >
                <summary className="px-6 py-5 cursor-pointer font-bold text-black flex items-center justify-between hover:bg-zinc-50 transition-colors">
                  {faq.q}
                  <span className="text-orange-500 text-xl ml-4 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-6 pb-5 text-sm text-zinc-500 leading-relaxed">{faq.a}</div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-black text-black mb-4 tracking-tight">
            Ready to take orders?
          </h2>
          <p className="text-zinc-500 font-medium mb-8">Set up in minutes. No credit card required.</p>
          <Link href="/register" className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full font-bold text-lg shadow-xl shadow-orange-500/20 hover:shadow-2xl transition-all">
            Get Started Free <FaArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}
