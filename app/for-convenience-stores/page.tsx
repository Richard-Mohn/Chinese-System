'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaQrcode, FaCoffee, FaBolt, FaMobileAlt, FaPercent, FaArrowRight,
  FaCheckCircle, FaBitcoin, FaCreditCard, FaShieldAlt, FaChartLine,
  FaStore, FaTruck, FaCheck, FaBoxOpen, FaCashRegister, FaBarcode,
  FaUsers, FaClipboardList, FaClock
} from 'react-icons/fa';

interface FeatureCardProps { icon: any; title: string; description: string; delay: number; }
const FeatureCard = ({ icon: Icon, title, description, delay }: FeatureCardProps) => (
  <motion.div
    className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 flex flex-col items-start text-left group hover:border-zinc-300 hover:shadow-xl transition-all duration-500"
    initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay }}
  >
    <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-gradient-to-br group-hover:from-orange-500 group-hover:to-red-600 group-hover:text-white transition-all duration-500 shadow-sm">
      <Icon className="text-2xl" />
    </div>
    <h4 className="text-xl font-bold text-black mb-3">{title}</h4>
    <p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

interface StepProps { num: string; title: string; desc: string; delay: number; }
const Step = ({ num, title, desc, delay }: StepProps) => (
  <motion.div className="flex gap-6" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay }}>
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">{num}</div>
    <div>
      <h4 className="text-lg font-bold text-black mb-1">{title}</h4>
      <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
    </div>
  </motion.div>
);

export default function ForConvenienceStores() {
  return (
    <div className="min-h-screen bg-white/90">
      {/* Hero */}
      <section className="pt-36 pb-20 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-orange-50 border border-orange-100 text-xs font-black uppercase tracking-widest text-orange-600"
          >For Retail &amp; Convenience Stores</motion.div>
          <motion.h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter text-zinc-900 text-balance" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            Grab. Scan. Go<span className="text-orange-600">.</span>
          </motion.h1>
          <motion.p className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium max-w-3xl mx-auto mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            Modernize your store with mobile ordering, QR scan-to-pay, and delivery — all with zero commissions. MohnMenu works for bodegas, liquor stores, smoke shops, grocery marts, and more.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="group px-10 py-5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full font-bold text-lg flex items-center gap-3 hover:shadow-xl hover:shadow-orange-500/20 transition-all">
              Start Free Today <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/pricing" className="px-10 py-5 bg-white text-black border-2 border-zinc-200 rounded-full font-bold text-lg hover:border-black transition-all">
              Compare Plans
            </Link>
          </motion.div>
        </div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-100 rounded-full blur-[120px] opacity-30" />
      </section>

      {/* Core Features */}
      <section className="py-24 px-4 bg-zinc-50/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-orange-600 font-black uppercase tracking-widest text-xs mb-3 block">Core Platform — Always Free</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Everything your store needs. No monthly fee.</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Built for high-volume, low-margin retail. Every feature designed to save you time and keep your money.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={FaQrcode} title="QR Scan-to-Pay" description="Customers scan items or your store menu with their phone camera. No app download required — order and pay in seconds." delay={0.05} />
            <FeatureCard icon={FaCoffee} title="Hot Bar Pre-Order" description="Let customers order coffee, hot food, or custom deli items while they're driving over. Fresh and ready the moment they walk in." delay={0.1} />
            <FeatureCard icon={FaBolt} title="Instant Checkout" description="Apple Pay, Google Pay, and tap-to-pay built in. Sub-3-second transaction times so lines keep moving." delay={0.15} />
            <FeatureCard icon={FaCreditCard} title="Cards & Cash" description="Full Stripe integration for card payments. Toggle cash-on-delivery for customers who prefer to pay at the register." delay={0.2} />
            <FeatureCard icon={FaBitcoin} title="Crypto Payments" description="Accept Bitcoin, Ethereum, Litecoin, and more via QR code. Works with Cash App, Coinbase, and all major wallets." delay={0.25} />
            <FeatureCard icon={FaShieldAlt} title="Fraud Protection" description="Automatic chargeback coverage on every digital transaction. No extra fees, no paperwork." delay={0.3} />
          </div>
        </div>
      </section>

      {/* Premium Add-Ons */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-orange-600 font-black uppercase tracking-widest text-xs mb-3 block">Premium Modules</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Scale when you need to.</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Flat monthly pricing — never a cut of your sales.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={FaTruck} title="Delivery & GPS Tracking" description="Offer local delivery with sub-second driver tracking. Customers get live location updates just like Uber — but you control the fleet." delay={0.05} />
            <FeatureCard icon={FaChartLine} title="Sales Analytics" description="Track your best-selling items, busiest hours, and average basket size. AI-powered suggestions to boost revenue." delay={0.1} />
            <FeatureCard icon={FaStore} title="Multi-Location Hub" description="Manage multiple store locations from one dashboard. Share menus, sync inventory, and view consolidated analytics." delay={0.15} />
          </div>
        </div>
      </section>

      {/* Why Retail Owners Choose MohnMenu */}
      <section className="py-24 px-4 bg-zinc-950 text-white rounded-[3rem] mx-4 mb-6 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <span className="text-orange-400 font-black uppercase tracking-widest text-xs mb-3 block">Built for Retail</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Why store owners choose MohnMenu.</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">We understand the convenience store business. High volume, thin margins, and customers who want speed above everything.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FaClock, title: 'Sub-3s Checkout', desc: 'Tap, scan, or pay with crypto. Every method optimized for speed.' },
              { icon: FaBarcode, title: 'No App Required', desc: 'Customers scan your QR code using their native camera app. Zero friction.' },
              { icon: FaBoxOpen, title: 'Product Catalog', desc: 'Upload unlimited items with photos, prices, and categories. Update from any device.' },
              { icon: FaUsers, title: 'Regular Customers', desc: 'Loyalty points, order history, and re-ordering make regulars even more regular.' },
            ].map((item, i) => (
              <motion.div key={i} className="bg-zinc-900/60 p-8 rounded-3xl border border-zinc-800" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <item.icon className="text-2xl text-orange-400 mb-4" />
                <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-orange-600/10 blur-[150px] rounded-full" />
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-zinc-50 rounded-[3rem] mx-4 mb-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <span className="text-orange-600 font-black uppercase tracking-widest text-xs mb-3 block">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Up and running in minutes.</h2>
          </div>
          <div className="space-y-10">
            <Step num="1" title="Create your store" desc="Sign up free, enter your store name, upload a logo, and set your hours. No credit card required." delay={0.1} />
            <Step num="2" title="Add your products" desc="Upload items with photos, categories, and prices. Manage inventory counts, daily specials, and modifiers." delay={0.2} />
            <Step num="3" title="Connect payments" desc="Link Stripe for card payments in minutes. Toggle crypto and cash options with a single switch in your settings." delay={0.3} />
            <Step num="4" title="Print your QR code" desc="We auto-generate a branded QR code. Place it at the register, in the window, or on social media. Customers scan and order." delay={0.4} />
            <Step num="5" title="Fulfill and grow" desc="Receive orders on any device. Track sales, manage your catalog, and add delivery or analytics modules when ready." delay={0.5} />
          </div>
        </div>
      </section>

      {/* ROI Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl bg-zinc-950 rounded-[3rem] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden text-center">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">The math is simple.</h2>
            <p className="text-zinc-400 text-xl mb-4">On a typical $50 order:</p>
            <div className="grid grid-cols-2 gap-8 max-w-md mx-auto mb-10">
              <div>
                <div className="text-4xl font-black text-red-400">-$15</div>
                <p className="text-zinc-500 text-sm mt-1">Delivery apps take</p>
              </div>
              <div>
                <div className="text-4xl font-black text-green-400">$0</div>
                <p className="text-zinc-400 text-sm mt-1">MohnMenu takes</p>
              </div>
            </div>
            <p className="text-zinc-400 text-lg mb-10">That&apos;s <span className="text-white font-black">$15 more per order</span> staying in your register. Every single time.</p>
            <Link href="/register" className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full font-bold text-lg hover:shadow-xl hover:shadow-orange-500/20 transition-all active:scale-95">
              Start Keeping 100% <FaArrowRight />
            </Link>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-orange-600/10 to-transparent blur-3xl pointer-events-none" />
        </div>
      </section>
    </div>
  );
}
