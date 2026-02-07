'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaShoppingBasket, FaArrowRight, FaCreditCard, FaBitcoin, FaMobileAlt,
  FaShieldAlt, FaTruck, FaChartLine, FaBoxOpen, FaLeaf,
  FaClipboardList, FaStore
} from 'react-icons/fa';

interface FeatureCardProps { icon: any; title: string; description: string; delay: number; }
const FeatureCard = ({ icon: Icon, title, description, delay }: FeatureCardProps) => (
  <motion.div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 flex flex-col items-start text-left group hover:border-zinc-300 hover:shadow-xl transition-all duration-500"
    initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay }}>
    <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-gradient-to-br group-hover:from-green-500 group-hover:to-emerald-600 group-hover:text-white transition-all duration-500 shadow-sm">
      <Icon className="text-2xl" />
    </div>
    <h4 className="text-xl font-bold text-black mb-3">{title}</h4>
    <p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

interface StepProps { num: string; title: string; desc: string; delay: number; }
const Step = ({ num, title, desc, delay }: StepProps) => (
  <motion.div className="flex gap-6" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay }}>
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-lg shadow-green-500/20">{num}</div>
    <div>
      <h4 className="text-lg font-bold text-black mb-1">{title}</h4>
      <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
    </div>
  </motion.div>
);

export default function ForGroceryMarkets() {
  return (
    <div className="min-h-screen bg-white/90">
      <section className="pt-36 pb-20 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-green-50 border border-green-100 text-xs font-black uppercase tracking-widest text-green-700"
          >For Grocery Stores &amp; Markets</motion.div>
          <motion.h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter text-zinc-900 text-balance" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            Fresh. Local. Online<span className="text-green-600">.</span>
          </motion.h1>
          <motion.p className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium max-w-3xl mx-auto mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            Grocery stores, farmers markets, specialty food shops, and local markets — take orders online, offer delivery or pickup, and keep 100% of your revenue. No Instacart fees.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="group px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-bold text-lg flex items-center gap-3 hover:shadow-xl hover:shadow-green-500/20 transition-all">
              Start Free Today <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/pricing" className="px-10 py-5 bg-white text-black border-2 border-zinc-200 rounded-full font-bold text-lg hover:border-black transition-all">
              View Pricing
            </Link>
          </motion.div>
        </div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-green-100 rounded-full blur-[120px] opacity-30" />
      </section>

      <section className="py-24 px-4 bg-zinc-50/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-green-600 font-black uppercase tracking-widest text-xs mb-3 block">Core Platform</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Your own online grocery store. Zero fees.</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Sell fresh produce, pantry staples, and specialty items online — without giving Instacart or Amazon 30%.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={FaShoppingBasket} title="Online Product Catalog" description="List hundreds of products with photos, prices, categories, and stock levels. Customers browse and shop from their phone or desktop." delay={0.05} />
            <FeatureCard icon={FaClipboardList} title="Order Management" description="Orders flow into your dashboard in real-time. Pick, pack, and mark ready for pickup or delivery — all from one screen." delay={0.1} />
            <FeatureCard icon={FaCreditCard} title="Cards & Mobile Pay" description="Stripe-powered checkout with Apple Pay and Google Pay. Customers pay you directly — no middleman." delay={0.15} />
            <FeatureCard icon={FaBitcoin} title="Crypto Payments" description="Accept Bitcoin, Ethereum, and 6 more via QR code. Cash App users pay in seconds. Zero commission." delay={0.2} />
            <FeatureCard icon={FaMobileAlt} title="White-Label Storefront" description="Your brand, your URL, your colors. Customers shop on YOUR site — not a marketplace where you compete with chains." delay={0.25} />
            <FeatureCard icon={FaShieldAlt} title="Fraud Protection" description="Every digital transaction is covered with automatic chargeback prevention. No extra fees." delay={0.3} />
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-green-600 font-black uppercase tracking-widest text-xs mb-3 block">Premium Modules</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Grow when you&apos;re ready.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={FaTruck} title="Local Delivery & GPS" description="Offer same-day delivery with live driver tracking. Customers get real-time updates — your own Instacart-like experience." delay={0.05} />
            <FeatureCard icon={FaChartLine} title="Sales Analytics" description="Track your best-selling products, peak shopping hours, and average basket size. AI recommendations to boost revenue." delay={0.1} />
            <FeatureCard icon={FaStore} title="Multi-Location" description="Manage multiple stores from one dashboard. Share product catalogs, sync inventory, and view consolidated reports." delay={0.15} />
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-zinc-950 text-white rounded-[3rem] mx-4 mb-6 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <span className="text-green-400 font-black uppercase tracking-widest text-xs mb-3 block">Built for Grocery</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Why local markets choose MohnMenu.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FaLeaf, title: 'Farm to Phone', desc: 'Farmers markets and CSAs can take orders online and manage pickup schedules effortlessly.' },
              { icon: FaBoxOpen, title: 'Bulk & Wholesale', desc: 'Support for bulk pricing, case quantities, and wholesale discounts for regular buyers.' },
              { icon: FaClipboardList, title: 'Inventory Tracking', desc: 'Mark items out-of-stock in real-time. Customers only see what you actually have available.' },
              { icon: FaStore, title: 'Curbside Pickup', desc: 'Customers order ahead and pick up curbside. You prepare the bags, they grab and go.' },
            ].map((item, i) => (
              <motion.div key={i} className="bg-zinc-900/60 p-8 rounded-3xl border border-zinc-800" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <item.icon className="text-2xl text-green-400 mb-4" />
                <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-green-600/10 blur-[150px] rounded-full" />
      </section>

      <section className="py-24 px-4 bg-zinc-50 rounded-[3rem] mx-4 mb-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <span className="text-green-600 font-black uppercase tracking-widest text-xs mb-3 block">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Online in under 10 minutes.</h2>
          </div>
          <div className="space-y-10">
            <Step num="1" title="Create your store" desc="Sign up free. Enter your store name, upload a logo, set your hours and pickup/delivery options." delay={0.1} />
            <Step num="2" title="Add your products" desc="Upload products with photos, categories, prices, and stock counts. Import in bulk or add one at a time." delay={0.2} />
            <Step num="3" title="Connect payments" desc="Link Stripe for cards. Enable crypto and cash. All payment methods ready in minutes." delay={0.3} />
            <Step num="4" title="Share your store" desc="Post your link on social media, community boards, and Google. Print QR codes for in-store display." delay={0.4} />
            <Step num="5" title="Fulfill and grow" desc="Receive orders, prepare them, and mark complete. Add delivery when you're ready to expand your reach." delay={0.5} />
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl bg-gradient-to-r from-green-500 to-emerald-600 rounded-[3rem] p-10 md:p-16 text-white shadow-2xl text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Stop paying Instacart to sell your own groceries.</h2>
          <p className="text-green-100 text-lg mb-10 max-w-xl mx-auto">Keep 100% of every sale. Free to start, flat pricing when you scale.</p>
          <Link href="/register" className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-green-700 rounded-full font-bold text-lg hover:bg-green-50 transition-all">
            Get Started Free <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
