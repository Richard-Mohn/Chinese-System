'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaArrowRight, FaPlay, FaShoppingCart, FaCoffee, FaMobileAlt,
  FaCreditCard, FaBitcoin, FaStar, FaPercent, FaTabletAlt,
  FaBicycle, FaMapMarkerAlt, FaShieldAlt, FaUsers, FaClock,
  FaCheck, FaHeart
} from 'react-icons/fa';
import FloatingStoreIcons from '@/components/FloatingStoreIcons';

export default function CoffeeDemoPage() {
  return (
    <div className="min-h-screen bg-white/90">
      {/* Hero */}
      <section className="pt-36 pb-20 px-4 relative overflow-hidden">
        <FloatingStoreIcons storeType="default" count={16} position="absolute" />
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-amber-50 border border-amber-100 text-xs font-black uppercase tracking-widest text-amber-700"
          >Live Coffee Shop Demo</motion.div>
          <motion.h1
            className="text-5xl md:text-8xl font-black mb-6 tracking-tighter text-zinc-900 text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Griffin Lounge<span className="text-amber-700">.</span>
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium max-w-3xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            See exactly how a modern coffee shop runs on MohnMenu — mobile ordering, barista KDS, loyalty rewards, peer delivery, and a branded website. All live and interactive.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="flex flex-wrap justify-center gap-4">
            <Link href="/griffin-lounge" className="group px-10 py-5 bg-gradient-to-r from-amber-600 to-orange-700 text-white rounded-full font-bold text-lg flex items-center gap-3 hover:shadow-xl hover:shadow-amber-500/20 transition-all">
              <FaPlay className="text-sm" /> View Storefront
            </Link>
            <Link href="/order/griffin-lounge" className="group px-10 py-5 bg-white text-black border-2 border-zinc-200 rounded-full font-bold text-lg hover:border-black transition-all flex items-center gap-3">
              <FaShoppingCart /> Order Page
            </Link>
          </motion.div>
        </div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-100 rounded-full blur-[120px] opacity-30" />
      </section>

      {/* Stats Bar */}
      <section className="py-8 bg-gradient-to-r from-amber-600 to-orange-700 text-white">
        <div className="container mx-auto max-w-4xl px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { stat: '50+', label: 'Menu Items' },
            { stat: '10', label: 'Categories' },
            { stat: '$3-$18', label: 'Price Range' },
            { stat: '5', label: 'Demo Accounts' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div className="text-3xl md:text-4xl font-black">{s.stat}</div>
              <div className="text-amber-200 text-sm font-bold uppercase tracking-wider">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Customer Journey */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-amber-700 font-black uppercase tracking-widest text-xs mb-3 block">Customer Experience</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">From phone to first sip.</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">The modern coffee shop experience — order before you arrive, skip the line, earn rewards.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', icon: FaMobileAlt, title: 'Browse & Order', desc: 'Customer opens your ordering page — no app download needed. Full menu with customizations: milk type, extra shots, size.' },
              { step: '02', icon: FaCreditCard, title: 'Pay Instantly', desc: 'Apple Pay, Google Pay, card, or crypto. One tap checkout. Tip option included. Order confirmed in seconds.' },
              { step: '03', icon: FaCoffee, title: 'Barista Makes It', desc: 'Order appears on the barista KDS screen instantly. They make it, mark it ready — customer gets notified.' },
              { step: '04', icon: FaStar, title: 'Pick Up & Earn', desc: 'Customer grabs their order from the counter. Loyalty points earned automatically. Favorites saved for next time.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="text-[80px] font-black text-zinc-100 absolute -top-6 -left-2 select-none">{item.step}</div>
                <div className="relative bg-white border border-zinc-100 p-8 rounded-3xl hover:shadow-xl hover:border-zinc-300 transition-all h-full">
                  <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                    <item.icon className="text-amber-700 text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 px-4 bg-zinc-50/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-amber-700 font-black uppercase tracking-widest text-xs mb-3 block">What&apos;s Included</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Everything this demo showcases.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: FaMobileAlt, title: 'Mobile Order-Ahead', desc: 'Customers order before they arrive. Drinks are ready when they walk in — no line.' },
              { icon: FaCoffee, title: 'Barista KDS', desc: 'Espresso Bar and Food Prep stations. Each barista sees only their orders.' },
              { icon: FaStar, title: 'Loyalty Rewards', desc: 'Points on every purchase. Free drinks, pastry rewards, VIP tiers.' },
              { icon: FaBicycle, title: 'Peer Delivery', desc: 'Customers heading your way can carry a neighbor\'s order for a $2 discount.' },
              { icon: FaTabletAlt, title: 'Self-Order Kiosk', desc: 'Tablet at the counter for walk-in self-service during rush hour.' },
              { icon: FaBitcoin, title: 'Crypto Payments', desc: 'BTC, ETH, SOL + more. QR code checkout with any crypto wallet.' },
              { icon: FaCreditCard, title: 'Apple Pay & Cards', desc: 'One-tap mobile checkout. Tips included. Receipts by email.' },
              { icon: FaMapMarkerAlt, title: 'GPS Delivery', desc: 'Track your coffee delivery in real-time from shop to door.' },
              { icon: FaShieldAlt, title: 'Fraud Protection', desc: 'Automatic chargeback coverage on every digital transaction.' },
              { icon: FaUsers, title: 'Staff Marketplace', desc: 'Find experienced baristas. Staff work across multiple shops.' },
              { icon: FaPercent, title: 'Zero Commission', desc: 'We never take a cut of your sales. Flat monthly pricing only.' },
              { icon: FaHeart, title: 'Saved Favorites', desc: 'Customers save "my usual" and reorder in one tap every morning.' },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="bg-white p-6 rounded-2xl border border-zinc-100 hover:border-zinc-300 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
                  <f.icon className="text-lg text-zinc-400 group-hover:text-amber-700 transition-colors" />
                </div>
                <h3 className="font-bold text-lg mb-1">{f.title}</h3>
                <p className="text-sm text-zinc-500">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Accounts */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <span className="text-amber-700 font-black uppercase tracking-widest text-xs mb-3 block">Try Every Role</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Log in as anyone.</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">All demo accounts use the password: <span className="font-mono font-bold text-black bg-zinc-100 px-2 py-0.5 rounded">DemoPass123!</span></p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { role: 'Owner', email: 'owner@griffinlounge.demo', desc: 'Full dashboard, analytics, menu management, settings', color: 'bg-amber-100 text-amber-800' },
              { role: 'Barista', email: 'barista@griffinlounge.demo', desc: 'Barista KDS view, order queue, item completion', color: 'bg-orange-100 text-orange-800' },
              { role: 'Server', email: 'server@griffinlounge.demo', desc: 'Server KDS view, table orders, customer interaction', color: 'bg-yellow-100 text-yellow-800' },
              { role: 'Driver', email: 'driver@griffinlounge.demo', desc: 'Delivery dashboard, GPS tracking, order pickups', color: 'bg-green-100 text-green-800' },
              { role: 'Customer', email: 'customer@griffinlounge.demo', desc: 'Order page, cart, checkout, order tracking', color: 'bg-blue-100 text-blue-800' },
            ].map((acct, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white border border-zinc-100 rounded-2xl p-5 hover:border-zinc-300 hover:shadow-lg transition-all"
              >
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-3 ${acct.color}`}>{acct.role}</span>
                <p className="font-mono text-sm text-black font-bold mb-1">{acct.email}</p>
                <p className="text-xs text-zinc-400">{acct.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Coffee Shops */}
      <section className="py-24 px-4 bg-zinc-950 text-white rounded-[3rem] mx-4 mb-6 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <span className="text-amber-400 font-black uppercase tracking-widest text-xs mb-3 block">The MohnMenu Advantage</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Why switch from Square or Toast?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              { title: 'Zero Commission', desc: 'We never take a percentage. Flat monthly pricing — you keep every dollar.' },
              { title: 'Peer Delivery', desc: 'No DoorDash fees. Customers deliver for each other and earn discounts.' },
              { title: 'Crypto Payments', desc: 'Accept BTC, ETH, and more. None of your competitors do this.' },
              { title: 'Order-Ahead Native', desc: 'Built for order-ahead from day one — not bolted on as an afterthought.' },
              { title: 'Branded Website', desc: 'Your own .com with SEO, menus, and ordering — included. No GoDaddy needed.' },
              { title: 'Staff Marketplace', desc: 'Find baristas who already have profiles, reviews, and background checks on file.' },
            ].map((item, i) => (
              <motion.div key={i} className="flex items-start gap-4 bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <FaCheck className="text-amber-400 mt-1 shrink-0" />
                <div>
                  <h4 className="font-bold mb-1">{item.title}</h4>
                  <p className="text-sm text-zinc-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-amber-600/10 blur-[150px] rounded-full" />
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl bg-gradient-to-r from-amber-600 to-orange-700 rounded-[3rem] p-10 md:p-16 text-white shadow-2xl text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Your coffee shop can look this good.</h2>
            <p className="text-amber-100 text-lg mb-10 max-w-xl mx-auto">
              Start your free trial. No credit card. No contract. Live in 10 minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="group px-10 py-5 bg-white text-amber-800 rounded-full font-bold text-lg flex items-center gap-3 hover:bg-amber-50 transition-all">
                Start Free Trial <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/for-coffee-shops" className="px-10 py-5 border-2 border-white/50 text-white rounded-full font-bold text-lg hover:border-white transition-all">
                Learn More
              </Link>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-orange-800/30 to-transparent blur-3xl pointer-events-none" />
        </div>
      </section>
    </div>
  );
}
