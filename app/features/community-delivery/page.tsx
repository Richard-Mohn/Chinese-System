'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FaBicycle, FaArrowRight, FaWalking, FaMotorcycle, FaCar,
  FaCheckCircle, FaDollarSign, FaMapMarkerAlt, FaBolt, FaShieldAlt,
  FaClock, FaUsers
} from 'react-icons/fa';

const FEATURES = [
  { icon: FaDollarSign, title: 'Just $0.25 Per Order', desc: 'The lowest platform fee in the industry. Four deliveries = $1. Compare that to DoorDash\'s 15-30% commissions.' },
  { icon: FaMapMarkerAlt, title: '2-3 Mile Radius', desc: 'Hyper-local deliveries designed for bikes, scooters, and walkers. Short distances mean fast deliveries and happy customers.' },
  { icon: FaBolt, title: 'Quick Signup', desc: 'Couriers sign up in under 60 seconds. Pick your vehicle, create an account, and start accepting deliveries immediately.' },
  { icon: FaBicycle, title: 'Any Vehicle Welcome', desc: 'Bike, walk, scooter, or car — use whatever you have. No vehicle requirements, no age restrictions on your transportation.' },
  { icon: FaShieldAlt, title: 'Stripe Payouts', desc: 'Earnings are tracked per delivery and paid out via Stripe Connect. Fast, secure, transparent — no waiting for payday.' },
  { icon: FaClock, title: 'Real-Time GPS', desc: 'Live GPS tracking for every delivery. Customers see their courier on a map in real-time. Businesses see all active deliveries in their dispatch center.' },
];

const HOW_IT_WORKS_COURIER = [
  { step: '1', title: 'Sign Up', desc: 'Visit /signup/courier, pick your vehicle type, and create your account. No background check, no interview — you\'re ready in 60 seconds.' },
  { step: '2', title: 'Go Online', desc: 'Open the driver dashboard and tap "Go Online." Your GPS location is shared so businesses can see available couriers nearby.' },
  { step: '3', title: 'Accept Orders', desc: 'Delivery requests appear in real-time. See the restaurant, distance, and earnings. Accept with one tap.' },
  { step: '4', title: 'Deliver & Earn', desc: 'Pick up the order, deliver it, and mark it complete. You earn per delivery — tracked in your dashboard with Stripe payouts.' },
];

const HOW_IT_WORKS_BUSINESS = [
  { step: '1', title: 'Enable Couriers', desc: 'Go to Settings → Community Courier Delivery → Enable. Set your desired delivery radius (0.5 to 5 miles).' },
  { step: '2', title: 'Orders Come In', desc: 'When a customer places a delivery order, it appears in your order queue and is broadcast to nearby couriers automatically.' },
  { step: '3', title: 'Courier Accepts', desc: 'An available courier accepts the delivery. You see their name, vehicle, and GPS location in your dispatch center.' },
  { step: '4', title: 'Customer Tracks', desc: 'The customer gets a live tracking link showing the courier on a map with real-time ETA. You pay just $0.25.' },
];

const FAQS = [
  {
    q: 'How much does it cost businesses?',
    a: 'Just $0.25 per delivery. That\'s it. No percentage-based commissions, no hidden fees, no monthly minimums. Four deliveries cost $1.',
  },
  {
    q: 'How do couriers get paid?',
    a: 'Couriers set up Stripe Connect during onboarding. Earnings are tracked per delivery and can be withdrawn anytime. The delivery fee set by the business goes to the courier minus the $0.25 platform fee.',
  },
  {
    q: 'Do couriers need a car?',
    a: 'No! Community couriers can deliver on foot, by bike, by scooter, or by car. The short delivery radius (2-3 miles) makes any mode of transportation viable.',
  },
  {
    q: 'Is there a background check?',
    a: 'Community couriers sign up instantly with no background check. This keeps the barrier to entry low. Businesses can optionally enable status tracking for their in-house drivers.',
  },
  {
    q: 'What\'s the delivery radius?',
    a: 'Business owners configure their own radius from 0.5 to 5 miles (default: 2 miles). Couriers within that radius will see available delivery orders.',
  },
  {
    q: 'How is this different from DoorDash or Uber Eats?',
    a: 'Those platforms charge businesses 15-30% per order. MohnMenu charges a flat $0.25. Couriers earn more because there\'s no middleman taking a huge cut. Businesses keep their margins.',
  },
  {
    q: 'Can I use both community couriers and my own drivers?',
    a: 'Yes! You can have in-house drivers AND enable community couriers. In-house drivers get priority, and if none are available, the order is broadcast to community couriers.',
  },
];

const COMPARISON = [
  { feature: 'Platform fee', mohn: '$0.25 flat', others: '15-30% per order' },
  { feature: 'Courier signup time', mohn: '< 60 seconds', others: '3-7 days' },
  { feature: 'Background check', mohn: 'Not required', others: 'Required' },
  { feature: 'Vehicle requirement', mohn: 'Any (bike, walk, etc.)', others: 'Car required' },
  { feature: 'GPS tracking', mohn: 'Real-time', others: 'Real-time' },
  { feature: 'Payout method', mohn: 'Stripe (instant)', others: 'Weekly deposit' },
  { feature: 'Customer data', mohn: 'You own it', others: 'Platform owns it' },
  { feature: 'Menu control', mohn: 'Full control', others: 'Platform controls pricing' },
];

export default function CommunityDeliveryFeature() {
  return (
    <div className="min-h-screen bg-white/90">
      {/* Hero */}
      <section className="pt-36 pb-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-black uppercase tracking-widest text-emerald-600"
          >
            New Feature
          </motion.div>
          <motion.h1
            className="text-5xl md:text-8xl font-black mb-6 tracking-tighter text-zinc-900 text-balance"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          >
            Community Courier<span className="text-emerald-500">.</span>
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium max-w-3xl mx-auto mb-6"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          >
            Hyper-local micro-delivery powered by your community. Bikes, scooters, walkers — 
            anyone can deliver. Just <strong className="text-emerald-600">$0.25</strong> per order.
          </motion.p>
          <motion.div className="flex flex-wrap items-center justify-center gap-3 mb-10"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          >
            {[
              { icon: FaWalking, label: 'Walk' },
              { icon: FaBicycle, label: 'Bike' },
              { icon: FaMotorcycle, label: 'Scooter' },
              { icon: FaCar, label: 'Car' },
            ].map(v => (
              <span key={v.label} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full text-sm font-bold text-emerald-700">
                <v.icon /> {v.label}
              </span>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/signup/courier"
              className="group px-10 py-5 bg-emerald-600 text-white rounded-full font-bold text-lg flex items-center gap-3 hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-200"
            >
              Start Delivering <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/register"
              className="px-10 py-5 bg-white text-black border-2 border-zinc-200 rounded-full font-bold text-lg hover:border-black transition-all"
            >
              I&apos;m a Business Owner
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 px-4 bg-emerald-600 text-white">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '$0.25', label: 'Per order fee' },
              { value: '2-3 mi', label: 'Delivery radius' },
              { value: '< 60s', label: 'Courier signup' },
              { value: '0%', label: 'Commission' },
            ].map(stat => (
              <div key={stat.label}>
                <p className="text-3xl md:text-4xl font-black">{stat.value}</p>
                <p className="text-emerald-200 text-sm font-medium mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Why Community Delivery?
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Skip the 30% commission. Keep your margins. Empower your community.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title}
                className="bg-white rounded-3xl border border-zinc-100 p-8 hover:border-emerald-200 hover:shadow-xl transition-all duration-500"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              >
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-5">
                  <f.icon className="text-emerald-600 text-xl" />
                </div>
                <h3 className="text-lg font-bold text-black mb-2">{f.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works — Couriers */}
      <section className="py-24 px-4 bg-zinc-50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-3">For Couriers</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Start Earning in Minutes
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS_COURIER.map((s, i) => (
              <motion.div key={s.step}
                className="text-center"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              >
                <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl font-black">
                  {s.step}
                </div>
                <h3 className="font-bold text-black mb-2">{s.title}</h3>
                <p className="text-zinc-500 text-sm">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works — Businesses */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <p className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-3">For Businesses</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Delivery Without the 30% Tax
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS_BUSINESS.map((s, i) => (
              <motion.div key={s.step}
                className="text-center"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              >
                <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl font-black">
                  {s.step}
                </div>
                <h3 className="font-bold text-black mb-2">{s.title}</h3>
                <p className="text-zinc-500 text-sm">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 px-4 bg-zinc-950 text-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              MohnMenu vs. the Big Guys
            </h2>
            <p className="text-zinc-400 text-lg">
              See why local businesses are switching.
            </p>
          </div>
          <div className="overflow-hidden rounded-3xl border border-zinc-800">
            <div className="grid grid-cols-3 bg-zinc-900 p-4 text-xs font-black uppercase tracking-widest">
              <span className="text-zinc-500">Feature</span>
              <span className="text-emerald-400 text-center">MohnMenu</span>
              <span className="text-zinc-500 text-center">DoorDash / Uber Eats</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={row.feature} className={`grid grid-cols-3 p-4 text-sm ${i % 2 === 0 ? 'bg-zinc-900/50' : ''}`}>
                <span className="text-zinc-400 font-medium">{row.feature}</span>
                <span className="text-emerald-400 font-bold text-center">{row.mohn}</span>
                <span className="text-zinc-500 text-center">{row.others}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Questions & Answers
            </h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <motion.div key={i}
                className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100"
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              >
                <h3 className="font-bold text-black mb-2">{faq.q}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-[3rem] p-10 md:p-16 text-white text-center relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
                Ready to deliver?
              </h2>
              <p className="text-emerald-200 text-lg mb-10 max-w-xl mx-auto">
                Whether you&apos;re a courier looking to earn or a business owner tired of 30% commissions — MohnMenu has you covered.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup/courier"
                  className="inline-flex items-center gap-2 px-10 py-5 bg-white text-emerald-700 rounded-full font-bold text-lg hover:shadow-xl transition-all active:scale-95"
                >
                  <FaBicycle /> Become a Courier
                </Link>
                <Link href="/register"
                  className="inline-flex items-center gap-2 px-10 py-5 bg-emerald-900/50 text-white border-2 border-emerald-400/30 rounded-full font-bold text-lg hover:bg-emerald-900 transition-all"
                >
                  <FaUsers /> Register My Business
                </Link>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-emerald-900/50 to-transparent blur-3xl pointer-events-none" />
          </div>
        </div>
      </section>
    </div>
  );
}
