'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaUtensils, FaChartBar, FaBullhorn, FaTruck, FaCreditCard, FaUsers,
  FaArrowRight, FaCheck, FaVideo, FaMapMarkerAlt, FaBitcoin, FaGoogle,
  FaShieldAlt, FaBrain, FaMobileAlt, FaQrcode, FaBolt
} from 'react-icons/fa';

/* ─── Feature card ─── */
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

/* ─── How-it-works step ─── */
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

export default function ForRestaurants() {
  return (
    <div className="min-h-screen bg-white/90">
      {/* Hero */}
      <section className="pt-36 pb-20 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-orange-50 border border-orange-100 text-xs font-black uppercase tracking-widest text-orange-600"
          >For Restaurants &amp; Kitchens</motion.div>
          <motion.h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter text-zinc-900 text-balance" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            Your Food. Your Revenue<span className="text-orange-600">.</span>
          </motion.h1>
          <motion.p className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium max-w-3xl mx-auto mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            MohnMenu gives you a complete digital ordering system with zero commissions. Accept cards, crypto, and cash. Manage your own drivers. Keep 100% of every sale.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="group px-10 py-5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full font-bold text-lg flex items-center gap-3 hover:shadow-xl hover:shadow-orange-500/20 transition-all">
              Start Free Today <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/pricing" className="px-10 py-5 bg-white text-black border-2 border-zinc-200 rounded-full font-bold text-lg hover:border-black transition-all">
              View Pricing
            </Link>
          </motion.div>
        </div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-orange-100 rounded-full blur-[120px] opacity-30" />
      </section>

      {/* Core Features Grid */}
      <section className="py-24 px-4 bg-zinc-50/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-orange-600 font-black uppercase tracking-widest text-xs mb-3 block">Core Platform</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Everything to run your restaurant online.</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">All included in the free plan. No credit card, no trial period, no catch.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={FaQrcode} title="Digital Menu & Ordering" description="Beautiful, mobile-optimized menu that customers access via QR code or direct link. Real-time item availability, modifiers, and combo options." delay={0.05} />
            <FeatureCard icon={FaCreditCard} title="Card Payments (Stripe)" description="Secure credit and debit card processing via Stripe Connect. Funds settle directly into your bank account — we never touch your money." delay={0.1} />
            <FeatureCard icon={FaBitcoin} title="Crypto Payments" description="Accept Bitcoin, Ethereum, Litecoin, and Dogecoin. Customers scan a QR code from Cash App, Coinbase, or any crypto wallet and pay instantly." delay={0.15} />
            <FeatureCard icon={FaGoogle} title="Order with Google" description="Your menu appears directly in Google Search and Google Maps. Customers order without ever leaving the search results page." delay={0.2} />
            <FeatureCard icon={FaShieldAlt} title="Fraud Protection" description="Enterprise-grade chargeback coverage on every order. Suspicious transactions are flagged automatically — no extra cost." delay={0.25} />
            <FeatureCard icon={FaMobileAlt} title="White-Label Storefront" description="Your own branded online store with custom colors, logo, and slug. No third-party branding visible to your customers." delay={0.3} />
          </div>
        </div>
      </section>

      {/* Premium Modules */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-orange-600 font-black uppercase tracking-widest text-xs mb-3 block">Premium Modules</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Upgrade when you&apos;re ready.</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Powerful add-ons for growing restaurants. Pay a flat monthly fee — never a percentage of your sales.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={FaMapMarkerAlt} title="GPS Fleet Tracking" description="Sub-second GPS updates on every driver. Automated dispatch, route optimization, and real-time customer tracking links — your own Uber-like experience." delay={0.05} />
            <FeatureCard icon={FaVideo} title="Live Chef Cam" description="HD camera streaming from your kitchen to the customer's phone. Builds trust, reduces complaints, and increases repeat orders by up to 40%." delay={0.1} />
            <FeatureCard icon={FaChartBar} title="AI Analytics" description="See your top items, peak hours, average ticket size, and labor efficiency. AI-powered suggestions to optimize your menu and pricing." delay={0.15} />
            <FeatureCard icon={FaBullhorn} title="Marketing Automation" description="Built-in SMS and email campaigns. Send offers to past customers, announce specials, and build direct relationships — no third party blocking you." delay={0.2} />
            <FeatureCard icon={FaUtensils} title="Kitchen Display (KDS)" description="Replace paper tickets with a digital screen. Orders flow in real-time, color-coded by status. Reduce errors and speed up your kitchen." delay={0.25} />
            <FeatureCard icon={FaBrain} title="Smart Inventory" description="AI tracks ingredient usage per order and forecasts demand — automatically alerting you when stock is low before you run out." delay={0.3} />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-zinc-50 rounded-[3rem] mx-4 mb-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <span className="text-orange-600 font-black uppercase tracking-widest text-xs mb-3 block">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Live in under 10 minutes.</h2>
          </div>
          <div className="space-y-10">
            <Step num="1" title="Create your account" desc="Sign up with your email. Enter your restaurant name, upload your logo, and pick a custom URL slug. No credit card needed." delay={0.1} />
            <Step num="2" title="Build your menu" desc="Add categories, items, prices, photos, and modifiers. Enable or disable items in real-time. Your digital menu auto-generates a beautiful storefront." delay={0.2} />
            <Step num="3" title="Connect payments" desc="Link your Stripe account for cards (takes 5 minutes). Optionally enable crypto by toggling it on in settings — we handle the wallet setup automatically." delay={0.3} />
            <Step num="4" title="Share your link or QR" desc="Print the auto-generated QR code for tables and your storefront. Share the link on social media, Google, and your website. Orders start flowing in." delay={0.4} />
            <Step num="5" title="Manage & grow" desc="Track orders in real-time from any device. As you scale, add premium modules like GPS fleet tracking, Chef Cam, or AI analytics — all at flat monthly rates." delay={0.5} />
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl bg-zinc-950 rounded-[3rem] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Stop paying 30% for permission to sell your food.</h2>
            <p className="text-zinc-400 text-lg mb-12">On a $50 order, you keep <span className="text-white font-black">$15 more</span> with MohnMenu vs. DoorDash/Uber.</p>
            <div className="grid grid-cols-2 gap-8 max-w-md mx-auto">
              <div>
                <p className="text-red-400 font-bold uppercase tracking-widest text-xs mb-3">DoorDash / Uber</p>
                <div className="text-5xl font-black text-zinc-500">30%</div>
                <p className="text-zinc-600 text-sm mt-1">commission</p>
              </div>
              <div>
                <p className="text-green-400 font-bold uppercase tracking-widest text-xs mb-3">MohnMenu</p>
                <div className="text-5xl font-black text-white">0%</div>
                <p className="text-zinc-400 text-sm mt-1">commission</p>
              </div>
            </div>
            <Link href="/register" className="inline-flex items-center gap-2 mt-12 px-10 py-5 bg-white text-black rounded-full font-bold text-lg hover:bg-zinc-100 transition-all active:scale-95">
              Switch to MohnMenu <FaArrowRight />
            </Link>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 blur-[100px] rounded-full" />
        </div>
      </section>
    </div>
  );
}

