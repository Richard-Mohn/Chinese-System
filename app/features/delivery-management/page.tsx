'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FaTruck, FaArrowRight, FaUsers, FaMoneyBillWave, FaCog,
  FaCheckCircle, FaIdCard, FaStar
} from 'react-icons/fa';

const FEATURES = [
  { icon: FaUsers, title: 'Full Driver Roster', desc: 'Add in-house drivers or enable marketplace drivers. Each driver gets a profile with name, phone, vehicle type, and status tracking.' },
  { icon: FaMoneyBillWave, title: 'Stripe Payouts', desc: 'Drivers onboard to Stripe Connect for direct payouts. Manage earnings and send payments right from your dashboard.' },
  { icon: FaIdCard, title: 'Background Check Tracking', desc: 'Track background check status for each driver: pending, cleared, or failed. Keep your fleet compliant.' },
  { icon: FaStar, title: 'Rating & Stats', desc: 'Each driver has a rating, total delivery count, and status indicator. See who your most reliable drivers are at a glance.' },
  { icon: FaCog, title: 'Status Management', desc: 'Drivers toggle between Online, Offline, On Break, and On Delivery. You see real-time availability in the Dispatch Center.' },
  { icon: FaCheckCircle, title: 'One-Click Assignment', desc: 'From the Dispatch Center, assign any pending delivery to an available driver. They get the details and their GPS tracking starts.' },
];

const FAQS = [
  {
    q: 'Can I manage my own delivery drivers?',
    a: 'Yes. Add in-house drivers from your Drivers page. Enter their name, phone, email, and vehicle type. They can sign up via an invite code and access their own driver dashboard.',
  },
  {
    q: 'How do driver payouts work?',
    a: 'Drivers connect their Stripe account via Stripe Connect. You can then send payouts directly from the Drivers page. Each driver\'s Stripe status (onboarding, active) is tracked in the dashboard.',
  },
  {
    q: 'What is the Dispatch Center?',
    a: 'The Dispatch Center (/owner/dispatch) shows a live Mapbox map with all online drivers as markers, and pending delivery orders in a sidebar. Click an order, click a driver, and assign. GPS tracking is real-time.',
  },
  {
    q: 'Do drivers need to install an app?',
    a: 'No. Drivers use a web-based dashboard at /driver. It works on any device with a browser — phones, tablets, laptops. GPS tracking uses the browser\'s Geolocation API.',
  },
  {
    q: 'What\'s the difference between in-house and marketplace drivers?',
    a: 'In-house drivers are your own employees. Marketplace drivers are shared across businesses on the platform. You can enable marketplace drivers in your Settings if you don\'t have your own fleet.',
  },
];

export default function DeliveryManagementFeature() {
  return (
    <div className="min-h-screen bg-white/90">
      {/* Hero */}
      <section className="pt-36 pb-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-rose-50 border border-rose-100 text-xs font-black uppercase tracking-widest text-rose-600"
          >Feature</motion.div>
          <motion.h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-zinc-900 text-balance"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          >
            Delivery Management<span className="text-orange-600">.</span>
          </motion.h1>
          <motion.p className="text-xl text-zinc-500 leading-relaxed font-medium max-w-3xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            Manage your driver fleet, assign deliveries, track GPS in real-time, 
            and process Stripe payouts — all from one dashboard.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Link href="/register" className="group inline-flex items-center gap-3 px-8 py-4 bg-black text-white rounded-full font-bold text-lg hover:bg-zinc-800 transition-all shadow-2xl">
              Start Free <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-zinc-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-black text-black mb-12 tracking-tight text-center">What&apos;s Included<span className="text-orange-500">.</span></h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={i} className="bg-white p-8 rounded-3xl border border-zinc-100 group hover:border-zinc-300 hover:shadow-lg transition-all"
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-black group-hover:text-white transition-all shadow-sm">
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
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-black text-black mb-12 tracking-tight text-center">Questions & Answers<span className="text-orange-500">.</span></h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <motion.details key={i} className="group bg-zinc-50 rounded-2xl border border-zinc-100 overflow-hidden"
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <summary className="px-6 py-5 cursor-pointer font-bold text-black flex items-center justify-between hover:bg-zinc-100 transition-colors">
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
      <section className="py-20 px-4 bg-zinc-50">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-black text-black mb-4 tracking-tight">Own your delivery.</h2>
          <p className="text-zinc-500 font-medium mb-8">Manage drivers, track GPS, process payouts.</p>
          <Link href="/register" className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full font-bold text-lg shadow-xl shadow-orange-500/20 hover:shadow-2xl transition-all">
            Get Started Free <FaArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}
