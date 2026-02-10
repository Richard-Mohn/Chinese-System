'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaArrowRight, FaCar, FaWallet, FaMapMarkedAlt,
  FaBicycle, FaMotorcycle, FaWalking, FaDollarSign,
  FaClock, FaShieldAlt, FaStar, FaCamera, FaBitcoin,
  FaRoute, FaCalendarAlt, FaMoneyBillWave, FaChartLine,
  FaCheckCircle, FaMobileAlt, FaGoogle, FaHandHoldingUsd,
  FaBullhorn, FaPercent, FaUsers, FaPlay
} from 'react-icons/fa';
import FloatingStoreIcons from '@/components/FloatingStoreIcons';

const COMPARED_TO = [
  { platform: 'DoorDash', commission: '15-30%', tip: 'Variable', schedule: 'On-demand', yourCut: '~60-70%' },
  { platform: 'UberEats', commission: '15-30%', tip: 'Variable', schedule: 'On-demand', yourCut: '~60-70%' },
  { platform: 'Grubhub', commission: '20-30%', tip: 'Variable', schedule: 'On-demand', yourCut: '~65%' },
  { platform: 'MohnMenu', commission: '0%', tip: '100% yours', schedule: 'Your choice', yourCut: '100%' },
];

const VEHICLE_TYPES = [
  { icon: FaWalking, label: 'Walking', desc: 'Perfect for dense downtown areas. Walk & earn.', radius: '0.5 mi' },
  { icon: FaBicycle, label: 'Bicycle', desc: 'Eco-friendly deliveries. No gas costs.', radius: '2 mi' },
  { icon: FaMotorcycle, label: 'Scooter / Motorcycle', desc: 'Fast & agile. Navigate traffic easily.', radius: '5 mi' },
  { icon: FaCar, label: 'Car', desc: 'Maximum capacity. Multi-stop batching.', radius: '10 mi' },
];

const FEATURES = [
  { icon: FaDollarSign, title: 'Zero Commission', desc: 'Keep 100% of your delivery fee. We charge the business a flat monthly subscription — not you.' },
  { icon: FaMoneyBillWave, title: '100% Tips', desc: 'Every tip goes straight to you. No tip-skimming, no hidden deductions. Cash or crypto.' },
  { icon: FaCamera, title: 'Photo Proof', desc: 'Snap delivery photos for proof of delivery. Protect yourself from false claims and disputes.' },
  { icon: FaBitcoin, title: 'Crypto Payments', desc: 'Get paid in Bitcoin, USDT, or $MOHN. Or stick with Stripe payouts to your bank — your choice.' },
  { icon: FaMapMarkedAlt, title: 'Smart Routing', desc: 'Optimized routes with real-time traffic. Multi-stop batching to maximize your earnings per hour.' },
  { icon: FaCalendarAlt, title: 'Scheduled Deliveries', desc: 'Accept advance orders. Build your schedule. No more waiting around for pings.' },
  { icon: FaShieldAlt, title: 'Insurance & Docs', desc: 'Upload your insurance, registration, and background check. Professional drivers get priority orders.' },
  { icon: FaChartLine, title: 'Earnings Dashboard', desc: 'Weekly/monthly breakdowns, Stripe payout history, tax documents (1099). All in one place.' },
  { icon: FaGoogle, title: 'Local Ad Revenue', desc: 'Businesses run Google/local ads through us. More orders = more deliveries for you. Everyone wins.' },
  { icon: FaHandHoldingUsd, title: '$MOHN Token Rewards', desc: 'Complete deliveries → earn $MOHN tokens. Hold them as they appreciate, or spend at any MohnMenu business.' },
  { icon: FaStar, title: 'Two-Way Ratings', desc: 'Rate customers, they rate you. Build your reputation. High-rated drivers get premium order access.' },
  { icon: FaMobileAlt, title: 'KDS Order View', desc: 'See kitchen prep status in real-time. Know exactly when the order will be ready — no more waiting at the counter.' },
];

const EARNINGS_EXAMPLES = [
  { scenario: 'Part-time (2 hrs/day, weekdays)', deliveries: '6-10/day', weekly: '$150-250', monthly: '$600-1,000' },
  { scenario: 'Side hustle (4 hrs/day, 5 days)', deliveries: '12-20/day', weekly: '$350-600', monthly: '$1,400-2,400' },
  { scenario: 'Full-time (8 hrs/day, 6 days)', deliveries: '25-40/day', weekly: '$800-1,500', monthly: '$3,200-6,000' },
];

const DRIVER_JOURNEY = [
  { step: '01', title: 'Sign Up in 5 Minutes', desc: 'Enter your info, choose your vehicle type, set your delivery radius. No interviews, no orientations.' },
  { step: '02', title: 'Upload Your Docs', desc: 'Driver\'s license, insurance, vehicle registration. Background check runs automatically (24-48 hrs).' },
  { step: '03', title: 'Go Online', desc: 'Toggle online from your phone. Orders from nearby businesses pop up instantly. Accept what works for you.' },
  { step: '04', title: 'Pick Up & Deliver', desc: 'Navigate to the restaurant, grab the order, snap a photo. The customer tracks you in real-time.' },
  { step: '05', title: 'Get Paid Instantly', desc: 'Earnings hit your Stripe account same-day. Tips, delivery fees, and $MOHN tokens — all yours.' },
];

export default function DriverDemoPage() {
  return (
    <div className="min-h-screen bg-white/90">
      {/* Hero */}
      <section className="pt-36 pb-20 px-4 relative overflow-hidden">
        <FloatingStoreIcons storeType="default" count={16} position="absolute" />
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-black uppercase tracking-widest text-emerald-600"
          >Driver Platform</motion.div>
          <motion.h1
            className="text-5xl md:text-8xl font-black mb-6 tracking-tighter text-zinc-900 text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Keep 100% of<br />your earnings<span className="text-emerald-500">.</span>
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium max-w-3xl mx-auto mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Deliver for local businesses on MohnMenu. Zero commission. 100% of your tips. Crypto payments. Set your own schedule. This is delivery without the middleman.
          </motion.p>
          <motion.p
            className="text-sm text-zinc-400 font-medium mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Why give 30% of your hustle to DoorDash?
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="flex flex-wrap justify-center gap-4">
            <Link href="/careers" className="group px-10 py-5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-full font-bold text-lg flex items-center gap-3 hover:shadow-xl hover:shadow-emerald-500/20 transition-all">
              <FaPlay className="text-sm" /> Start Driving Today
            </Link>
            <Link href="/features/peer-delivery" className="group px-10 py-5 bg-white text-black border-2 border-zinc-200 rounded-full font-bold text-lg hover:border-black transition-all flex items-center gap-3">
              <FaRoute /> How It Works
            </Link>
          </motion.div>
        </div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-100 rounded-full blur-[120px] opacity-30" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-green-100 rounded-full blur-[120px] opacity-20" />
      </section>

      {/* Stats Bar */}
      <section className="py-8 bg-gradient-to-r from-emerald-500 to-green-600 text-white">
        <div className="container mx-auto max-w-4xl px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { stat: '0%', label: 'Commission' },
            { stat: '100%', label: 'Your Tips' },
            { stat: '4', label: 'Vehicle Types' },
            { stat: '< 5 min', label: 'To Sign Up' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div className="text-3xl md:text-4xl font-black">{s.stat}</div>
              <div className="text-emerald-200 text-sm font-bold uppercase tracking-wider">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 px-4 bg-zinc-50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-emerald-600 font-black uppercase tracking-widest text-xs mb-3 block">The Numbers Don&apos;t Lie</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Why drivers are switching<span className="text-emerald-500">.</span></h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Other platforms take 15-30% of your earnings. We take zero. Do the math.</p>
          </div>
          <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
            {/* Table header */}
            <div className="grid grid-cols-5 gap-4 px-6 py-4 bg-zinc-100 border-b border-zinc-200 text-xs font-black uppercase tracking-wider text-zinc-500">
              <div>Platform</div>
              <div>Commission</div>
              <div>Your Tips</div>
              <div>Schedule</div>
              <div>Your Cut</div>
            </div>
            {COMPARED_TO.map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`grid grid-cols-5 gap-4 px-6 py-5 border-b border-zinc-100 items-center ${row.platform === 'MohnMenu' ? 'bg-emerald-50 border-emerald-200' : ''}`}
              >
                <div className={`font-bold text-lg ${row.platform === 'MohnMenu' ? 'text-emerald-600' : 'text-zinc-900'}`}>{row.platform}</div>
                <div className={row.platform === 'MohnMenu' ? 'text-emerald-600 font-black text-lg' : 'text-red-500 font-bold'}>{row.commission}</div>
                <div className={row.platform === 'MohnMenu' ? 'text-emerald-600 font-bold' : 'text-zinc-500'}>{row.tip}</div>
                <div className="text-zinc-500">{row.schedule}</div>
                <div className={row.platform === 'MohnMenu' ? 'text-emerald-600 font-black text-xl' : 'text-zinc-700 font-bold'}>{row.yourCut}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Driver Journey */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-emerald-600 font-black uppercase tracking-widest text-xs mb-3 block">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">From signup to first payout<span className="text-emerald-500">.</span></h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Five steps. No interviews. No orientation. Start earning today.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {DRIVER_JOURNEY.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative bg-white rounded-2xl p-6 border border-zinc-200 hover:border-emerald-300 hover:shadow-lg transition-all group"
              >
                <div className="text-5xl font-black text-emerald-100 group-hover:text-emerald-200 transition-colors mb-3">{step.step}</div>
                <h3 className="font-bold text-lg mb-2 text-zinc-900">{step.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{step.desc}</p>
                {i < DRIVER_JOURNEY.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-emerald-300">
                    <FaArrowRight />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicle Types */}
      <section className="py-24 px-4 bg-zinc-50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-emerald-600 font-black uppercase tracking-widest text-xs mb-3 block">Choose Your Ride</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Any vehicle works<span className="text-emerald-500">.</span></h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Walk, bike, scooter, or drive. Set your radius. Get matched with orders that fit.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VEHICLE_TYPES.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 border border-zinc-200 hover:border-emerald-300 hover:shadow-lg transition-all text-center group"
              >
                <div className="w-16 h-16 mx-auto bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                  <v.icon className="text-2xl text-emerald-600" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-zinc-900">{v.label}</h3>
                <p className="text-zinc-500 text-sm mb-3">{v.desc}</p>
                <div className="inline-block px-3 py-1 bg-emerald-50 rounded-full text-xs font-bold text-emerald-600">
                  Radius: {v.radius}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-emerald-600 font-black uppercase tracking-widest text-xs mb-3 block">Everything You Need</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Built for real drivers<span className="text-emerald-500">.</span></h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Every feature designed by people who actually deliver. No corporate BS.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-6 border border-zinc-200 hover:border-emerald-300 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                  <f.icon className="text-lg text-emerald-600" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-zinc-900">{f.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Earnings Calculator */}
      <section className="py-24 px-4 bg-zinc-50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-emerald-600 font-black uppercase tracking-widest text-xs mb-3 block">Show Me The Money</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">What can you earn<span className="text-emerald-500">?</span></h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Real estimates based on average delivery fees of $5-8 per delivery + tips. Zero commission means you keep it all.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {EARNINGS_EXAMPLES.map((e, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 border border-zinc-200 hover:border-emerald-300 hover:shadow-lg transition-all"
              >
                <h3 className="font-bold text-lg mb-4 text-zinc-900">{e.scenario}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 text-sm">Deliveries</span>
                    <span className="font-bold text-zinc-900">{e.deliveries}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 text-sm">Weekly</span>
                    <span className="font-bold text-emerald-600">{e.weekly}</span>
                  </div>
                  <div className="h-px bg-zinc-100" />
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 text-sm font-bold">Monthly</span>
                    <span className="font-black text-2xl text-emerald-600">{e.monthly}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-100">
                  <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold">
                    <FaCheckCircle /> <span>Plus 100% of tips + $MOHN token rewards</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-xs text-zinc-400">* Estimates based on $5-8 avg delivery fee per order. Actual earnings vary by market, time, and demand. Tips and $MOHN rewards are additional income not included in base estimates.</p>
          </div>
        </div>
      </section>

      {/* Testimonial / Quote */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl p-12 md:p-16 text-white"
          >
            <div className="text-6xl mb-6">&ldquo;</div>
            <p className="text-2xl md:text-3xl font-bold leading-relaxed mb-8">
              I was giving DoorDash 25% of every delivery. Now I keep everything. Same customers, same restaurants — I just make more money.
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-black text-lg">M</div>
              <div className="text-left">
                <div className="font-bold">Marcus T.</div>
                <div className="text-emerald-200 text-sm">Richmond, VA • Bicycle Courier</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Book a Ride / Quick Order CTA */}
      <section className="py-24 px-4 bg-zinc-50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-emerald-600 font-black uppercase tracking-widest text-xs mb-3 block">Coming Soon</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">More than food delivery<span className="text-emerald-500">.</span></h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">We&apos;re building a full local delivery network. Food today, packages tomorrow.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: FaCar, title: 'Book a Ride', desc: 'Need a ride? Same drivers, same app. Book a ride like you order food — quick order modal, set pickup & destination, go.', status: 'Coming Q3 2025' },
              { icon: FaBullhorn, title: 'Ad Revenue Share', desc: 'Businesses run Google & local ads through MohnMenu. More ad spend = more orders = more deliveries for you. Revenue split.', status: 'Coming Q4 2025' },
              { icon: FaCalendarAlt, title: 'Scheduled Routes', desc: 'Build weekly delivery routes. Same businesses, same times. Predictable income like a regular job, but you\'re the boss.', status: 'Coming Q4 2025' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 border border-zinc-200 border-dashed"
              >
                <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="text-lg text-zinc-400" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-zinc-900">{item.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed mb-3">{item.desc}</p>
                <span className="inline-block px-3 py-1 bg-zinc-100 rounded-full text-xs font-bold text-zinc-500">{item.status}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
              Ready to keep<br />what you earn<span className="text-emerald-500">?</span>
            </h2>
            <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
              Sign up in 5 minutes. No interviews. No orientation. Start delivering and earning today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/careers" className="group px-12 py-5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-full font-bold text-lg flex items-center gap-3 hover:shadow-xl hover:shadow-emerald-500/20 transition-all">
                Apply Now <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/demo" className="group px-12 py-5 bg-white text-black border-2 border-zinc-200 rounded-full font-bold text-lg hover:border-black transition-all flex items-center gap-3">
                View All Demos
              </Link>
            </div>
            <p className="text-xs text-zinc-400 mt-6">No app download required. Works on any phone, tablet, or computer.</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
