'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FaDesktop, FaArrowRight, FaCheck, FaColumns, FaExpand,
  FaVolumeUp, FaClock, FaFire, FaCog
} from 'react-icons/fa';

const FEATURES = [
  { icon: FaColumns, title: 'Multi-Station Layout', desc: 'Create stations for each prep area — Grill, Fryer, Drinks, Salads, Expo. Each station gets its own column with only relevant tickets.' },
  { icon: FaExpand, title: 'Fullscreen Tablet Mode', desc: 'One-click fullscreen with a dark theme optimized for kitchen tablets. Large touch targets for marking items done and bumping tickets.' },
  { icon: FaCheck, title: 'Item-Level Completion', desc: 'Tap each item as it\'s prepared. When all items are done, the ticket highlights green — ready to bump to the next station or mark as complete.' },
  { icon: FaArrowRight, title: 'Bump-to-Next-Station', desc: 'When a ticket is done at one station, bump it forward. The Expo station sees tickets only after all prep stations have completed their items.' },
  { icon: FaVolumeUp, title: 'Audio Alerts', desc: 'New orders trigger an audio chime so kitchen staff never miss a ticket, even in a noisy kitchen environment.' },
  { icon: FaClock, title: 'Urgency Indicators', desc: 'Tickets change color and pulse based on time elapsed — normal under 10 min, amber warning at 10 min, red urgent at 20+ min.' },
  { icon: FaFire, title: 'Real-Time Sync', desc: 'All ticket data syncs via Firestore in real-time. Multiple tablets viewing the same station see updates instantly.' },
  { icon: FaCog, title: 'Station Configuration', desc: 'Add, rename, recolor, and reorder stations. Set any station as the Expo (final quality check) station.' },
  { icon: FaDesktop, title: 'Any Device', desc: 'Works on iPads, Android tablets, laptops, or even a mounted TV. No app to install — just open the browser.' },
];

const FAQS = [
  {
    q: 'What is a KDS?',
    a: 'A Kitchen Display System (KDS) replaces paper ticket printers. Orders appear on screens in real-time, staff mark items as completed, and tickets move through stations until the order is ready. It\'s faster, more organized, and eliminates lost tickets.',
  },
  {
    q: 'Can I have multiple stations?',
    a: 'Yes. You create as many stations as you need — e.g., Grill, Fryer, Cold Prep, Drinks, Expo. Each station appears as a column in the multi-station view, or you can focus on a single station in tablet mode.',
  },
  {
    q: 'What is an Expo station?',
    a: 'The Expo (expeditor) station is the final quality check. Tickets only appear at Expo after all other prep stations have bumped them. The expo confirms everything is correct before the order goes to the customer.',
  },
  {
    q: 'Can I run each station on a separate tablet?',
    a: 'Absolutely. Open the KDS page on each tablet and click the station tab to focus on that station. Each tablet shows only its own tickets. All data syncs in real-time across devices.',
  },
  {
    q: 'How do I know if an order is taking too long?',
    a: 'Tickets have built-in urgency timers. Under 10 minutes is normal (gray border). 10-20 minutes shows amber warning. Over 20 minutes flashes red with a pulsing border and fire icon.',
  },
  {
    q: 'Do I need special hardware?',
    a: 'No. Any device with a web browser works — iPads, Android tablets, laptops, or even a TV with a connected computer. Just navigate to your KDS page and go fullscreen.',
  },
];

export default function KDSFeature() {
  return (
    <div className="min-h-screen bg-white/90">
      {/* Hero */}
      <section className="pt-36 pb-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-black uppercase tracking-widest text-emerald-600"
          >Feature</motion.div>
          <motion.h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-zinc-900 text-balance"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          >
            Kitchen Display<span className="text-orange-600">.</span>
          </motion.h1>
          <motion.p className="text-xl text-zinc-500 leading-relaxed font-medium max-w-3xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            Replace paper tickets with a real-time kitchen display. Multi-station workflow, 
            item-level tracking, and fullscreen tablet mode.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Link href="/register" className="group inline-flex items-center gap-3 px-8 py-4 bg-black text-white rounded-full font-bold text-lg hover:bg-zinc-800 transition-all shadow-2xl">
              Start Free <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-zinc-50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-black text-black mb-12 tracking-tight text-center">How It Works<span className="text-orange-500">.</span></h2>
          <div className="space-y-8">
            {[
              { n: '1', t: 'Set up your stations', d: 'Create stations for each prep area — Grill, Fryer, Drinks, etc. Designate one as your Expo station for final quality checks.' },
              { n: '2', t: 'Orders appear instantly', d: 'When a customer places an order, it appears as a ticket at the first station with an audio alert.' },
              { n: '3', t: 'Staff marks items done', d: 'Tap each item as it\'s prepared. The ticket highlights green when all items at that station are complete.' },
              { n: '4', t: 'Bump to the next station', d: 'Hit the Bump button to send the ticket to the next station. Expo sees it last. When bumped from Expo, the order status advances.' },
            ].map((step, i) => (
              <motion.div key={i} className="flex gap-6" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">{step.n}</div>
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
          <h2 className="text-3xl font-black text-black mb-12 tracking-tight text-center">What&apos;s Included<span className="text-orange-500">.</span></h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={i} className="bg-zinc-50 p-8 rounded-3xl border border-zinc-100 group hover:border-zinc-300 hover:shadow-lg transition-all"
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
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
          <h2 className="text-3xl font-black text-black mb-12 tracking-tight text-center">Questions & Answers<span className="text-orange-500">.</span></h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <motion.details key={i} className="group bg-white rounded-2xl border border-zinc-100 overflow-hidden"
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
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
          <h2 className="text-4xl font-black text-black mb-4 tracking-tight">Ditch the ticket printer.</h2>
          <p className="text-zinc-500 font-medium mb-8">Real-time kitchen display. Works on any tablet.</p>
          <Link href="/register" className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full font-bold text-lg shadow-xl shadow-orange-500/20 hover:shadow-2xl transition-all">
            Get Started Free <FaArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}
