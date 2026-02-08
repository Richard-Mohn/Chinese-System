'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FaCalendarAlt, FaArrowRight, FaCheck, FaUsers, FaClock,
  FaMobileAlt, FaStar, FaConciergeBell, FaPercent,
  FaBell, FaChartLine, FaGlassCheers, FaUtensils
} from 'react-icons/fa';

const FEATURES = [
  { icon: FaCalendarAlt, title: 'Date & Time Booking', desc: 'Customers pick their date, time, and party size from your availability. Fully branded to your restaurant — no third-party redirect.' },
  { icon: FaUsers, title: 'Party Size Management', desc: 'Support parties from 1 to 20+. Auto-adjust availability based on capacity. Handle small tables and large group events.' },
  { icon: FaConciergeBell, title: 'Seating Preferences', desc: 'Indoor, outdoor, bar, or private dining. Customers choose their preference — you decide what\'s available.' },
  { icon: FaStar, title: 'VIP & Special Occasions', desc: 'Flag VIP reservations for priority treatment. Track birthdays, anniversaries, business dinners, and more.' },
  { icon: FaBell, title: 'Real-Time Notifications', desc: 'New reservations appear instantly in your dashboard. Confirm, decline, or modify with one click — no phone tag.' },
  { icon: FaChartLine, title: 'Reservation Analytics', desc: 'See daily covers, peak times, no-show rates, and average party size. Optimize your floor plan with real data.' },
];

const COMPARISON = [
  { feature: 'Per-diner fee', them: '$1.00 – $1.50', us: 'Free' },
  { feature: 'Monthly subscription', them: '$249 – $899/mo', us: 'Included' },
  { feature: 'Reservation widget', them: 'Their brand', us: 'Your brand' },
  { feature: 'Customer data ownership', them: 'Shared with platform', us: '100% yours' },
  { feature: 'Online ordering integration', them: 'Separate system', us: 'Built in' },
  { feature: 'Crypto payments', them: 'Not supported', us: '8 cryptocurrencies' },
  { feature: 'Delivery management', them: 'Not included', us: 'Built in' },
  { feature: 'Setup time', them: '1-2 weeks', us: '5 minutes' },
];

const FAQS = [
  {
    q: 'How do customers make a reservation?',
    a: 'Customers visit your branded restaurant page (e.g. mohnmenu.com/your-restaurant/reserve) and select their party size, date, time, seating preference, and occasion. They enter their name and phone number and submit. You get notified instantly.',
  },
  {
    q: 'Do I have to manually confirm every reservation?',
    a: 'You can configure auto-confirm in your settings so reservations are confirmed instantly, or you can manually review and confirm each one from your Reservations dashboard.',
  },
  {
    q: 'Is there a per-cover or per-diner fee?',
    a: 'No. Unlike OpenTable ($1–$1.50 per diner) or Resy ($249–$899/month), MohnMenu reservations are included in your plan at no extra cost. Zero commission, zero per-cover fees.',
  },
  {
    q: 'Can I manage a waitlist?',
    a: 'Yes. Use the reservation status system to track guests from pending → confirmed → seated → completed. You can also mark no-shows and track attendance over time.',
  },
  {
    q: 'Does this work for bars and nightlife?',
    a: 'Absolutely. Reservation features include VIP experiences, bottle service bookings, and private room reservations — perfect for bars, lounges, and nightclubs.',
  },
  {
    q: 'Can customers cancel or modify reservations?',
    a: 'Customers can contact you directly to modify. You can update the status, add internal notes, and adjust details from your owner dashboard.',
  },
];

export default function ReservationsFeature() {
  return (
    <div className="min-h-screen bg-white/90">
      {/* Hero */}
      <section className="pt-36 pb-20 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-orange-50 border border-orange-100 text-xs font-black uppercase tracking-widest text-orange-600"
          >Feature</motion.div>
          <motion.h1
            className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-zinc-900 text-balance"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          >
            Table Reservations<span className="text-orange-600">.</span>
          </motion.h1>
          <motion.p
            className="text-xl text-zinc-500 leading-relaxed font-medium max-w-3xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            Let customers book tables directly on your website. No per-diner fees, no third-party apps stealing your
            customer data. Your restaurant, your reservations, your rules.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/register" className="group px-8 py-4 bg-black text-white rounded-full font-bold text-lg flex items-center gap-3 hover:bg-zinc-800 transition-all shadow-2xl">
              Start Free <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/pricing" className="px-8 py-4 bg-white text-black border-2 border-zinc-200 rounded-full font-bold text-lg hover:border-black transition-all">
              View Pricing
            </Link>
          </motion.div>
        </div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-orange-100 rounded-full blur-[120px] opacity-30" />
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-zinc-50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-black text-black mb-12 tracking-tight text-center">
            How It Works<span className="text-orange-500">.</span>
          </h2>
          <div className="space-y-8">
            {[
              { n: '1', t: 'Customer visits your reservation page', d: 'They go to your branded page (e.g. mohnmenu.com/your-restaurant/reserve) — no download, no account needed.' },
              { n: '2', t: 'They select party size, date & time', d: 'A clean multi-step form lets them pick guests, seating preference, occasion, and special requests in seconds.' },
              { n: '3', t: 'You get notified instantly', d: 'The reservation appears in your dashboard with all details. Confirm with one click or set up auto-confirm.' },
              { n: '4', t: 'Guest arrives, you mark seated', d: 'Track the full lifecycle — pending → confirmed → seated → completed. Internal notes keep your team aligned.' },
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

      {/* Features Grid */}
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

      {/* Comparison vs OpenTable */}
      <section className="py-20 px-4 bg-zinc-950 text-white rounded-[3rem] mx-4 mb-6 relative overflow-hidden">
        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="text-center mb-14">
            <span className="text-orange-400 font-black uppercase tracking-widest text-xs mb-3 block">The Real Cost</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              MohnMenu vs OpenTable & Resy
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              OpenTable charges $1–$1.50 per seated diner. A busy restaurant seating 200 covers/day pays $6,000–$9,000/month just for reservations. We charge zero.
            </p>
          </div>

          <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 overflow-hidden">
            <div className="grid grid-cols-3 bg-zinc-800/50 px-6 py-4 border-b border-zinc-800">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-400">Feature</span>
              <span className="text-xs font-black uppercase tracking-wider text-zinc-400 text-center">OpenTable / Resy</span>
              <span className="text-xs font-black uppercase tracking-wider text-orange-400 text-center">MohnMenu</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-6 py-4 ${i < COMPARISON.length - 1 ? 'border-b border-zinc-800/50' : ''}`}>
                <span className="text-sm font-bold text-white">{row.feature}</span>
                <span className="text-sm text-zinc-500 text-center">{row.them}</span>
                <span className="text-sm text-green-400 font-bold text-center">{row.us}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-zinc-400 text-sm mb-6">Stop paying per diner. Keep 100% of your reservations data.</p>
            <Link href="/register" className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full font-bold text-lg shadow-xl shadow-orange-500/20 hover:shadow-2xl transition-all">
              Switch Today <FaArrowRight />
            </Link>
          </div>
        </div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-orange-600/10 blur-[150px] rounded-full" />
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <span className="text-orange-600 font-black uppercase tracking-widest text-xs mb-3 block">Use Cases</span>
            <h2 className="text-4xl font-black tracking-tight mb-4">Built for every venue.</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FaUtensils, title: 'Restaurants', desc: 'Dinner reservations, brunch bookings, private dining, and large party management.' },
              { icon: FaGlassCheers, title: 'Bars & Lounges', desc: 'Bottle service, VIP tables, happy hour bookings, bachelor/ette parties.' },
              { icon: FaStar, title: 'Fine Dining', desc: 'Multi-course tasting menus, wine pairing events, exclusive chef\'s table experiences.' },
              { icon: FaUsers, title: 'Event Spaces', desc: 'Private events, corporate dinners, wedding receptions, and holiday parties.' },
            ].map((item, i) => (
              <motion.div key={i} className="bg-zinc-50 p-8 rounded-3xl border border-zinc-100"
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              >
                <item.icon className="text-2xl text-orange-500 mb-4" />
                <h4 className="text-lg font-bold text-black mb-2">{item.title}</h4>
                <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
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
            Reservations without the per-diner tax.
          </h2>
          <p className="text-zinc-500 font-medium mb-8">Set up in minutes. Zero commission. Your customers, your data.</p>
          <Link href="/register" className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full font-bold text-lg shadow-xl shadow-orange-500/20 hover:shadow-2xl transition-all">
            Get Started Free <FaArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}
