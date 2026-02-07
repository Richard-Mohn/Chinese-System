'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FaClipboardList, FaArrowRight, FaBell, FaFilter, FaSearch,
  FaClock, FaTruck, FaCheckCircle, FaChartBar
} from 'react-icons/fa';

const FEATURES = [
  { icon: FaBell, title: 'Audio & Browser Alerts', desc: 'New orders trigger a three-tone audio chime and a browser notification so you never miss an incoming order, even away from the screen.' },
  { icon: FaFilter, title: 'Status Filters', desc: 'Filter orders by status: Pending, Confirmed, Preparing, Ready, Out for Delivery, Delivered, Cancelled. See exactly what needs attention.' },
  { icon: FaSearch, title: 'Search Orders', desc: 'Search by customer name or order ID. Find any order instantly across your full order history.' },
  { icon: FaClock, title: 'Status Advancement', desc: 'One-click status updates: Pending → Confirmed → Preparing → Ready → Out for Delivery → Delivered. Each step logs the timestamp.' },
  { icon: FaTruck, title: 'Delivery vs Pickup', desc: 'Order type (delivery or pickup) is clearly labeled. Delivery orders show the customer\'s address for easy dispatch.' },
  { icon: FaCheckCircle, title: 'Order Details Panel', desc: 'Click any order to see the full detail panel: items, quantities, prices, special notes, customer info, payment method, and tip amount.' },
  { icon: FaClipboardList, title: 'Real-Time via Firestore', desc: 'Orders use Firestore onSnapshot listeners — they appear the instant a customer submits, with zero page refresh needed.' },
  { icon: FaChartBar, title: 'Ties into Analytics', desc: 'Every order feeds into your Analytics dashboard with revenue totals, order counts, top items, and daily trends — all computed from real data.' },
];

const FAQS = [
  {
    q: 'How quickly do new orders appear?',
    a: 'Orders appear in real-time. We use Firestore\'s onSnapshot listener, so orders show up the instant the customer submits them — typically under 1 second. An audio chime and optional browser notification alert you.',
  },
  {
    q: 'Can I see the full details of an order?',
    a: 'Yes. Click any order row to open the detail panel showing all items with quantities and prices, special instructions/notes, customer name, email, phone, delivery address (if applicable), payment method, tip, and total.',
  },
  {
    q: 'What order statuses are there?',
    a: 'The status flow is: Pending → Confirmed → Preparing → Ready → Out for Delivery → Delivered. You can also mark orders as Cancelled. Each status change is a one-click action from the order detail panel.',
  },
  {
    q: 'Does this work with the Kitchen Display?',
    a: 'Yes. The Orders page and KDS are reading from the same Firestore orders collection. When you advance an order\'s status in the Orders page, it reflects in the KDS, and vice versa.',
  },
  {
    q: 'Can I search and filter orders?',
    a: 'Yes. There\'s a search bar to find orders by customer name or order ID, and status filter tabs to show only orders in a specific state (e.g., show only Preparing orders).',
  },
];

export default function RealTimeOrdersFeature() {
  return (
    <div className="min-h-screen bg-white/90">
      {/* Hero */}
      <section className="pt-36 pb-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-black uppercase tracking-widest text-indigo-600"
          >Feature</motion.div>
          <motion.h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-zinc-900 text-balance"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          >
            Real-Time Orders<span className="text-orange-600">.</span>
          </motion.h1>
          <motion.p className="text-xl text-zinc-500 leading-relaxed font-medium max-w-3xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            Orders appear the instant they&apos;re placed. Audio alerts, status tracking, 
            search, and one-click status advancement — all in real-time.
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={i} className="bg-white p-6 rounded-2xl border border-zinc-100 group hover:border-zinc-300 hover:shadow-lg transition-all"
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-black group-hover:text-white transition-all">
                  <f.icon className="text-lg" />
                </div>
                <h4 className="text-base font-bold text-black mb-1.5">{f.title}</h4>
                <p className="text-zinc-500 text-xs leading-relaxed">{f.desc}</p>
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
          <h2 className="text-4xl font-black text-black mb-4 tracking-tight">Never miss an order.</h2>
          <p className="text-zinc-500 font-medium mb-8">Real-time alerts. Instant status updates.</p>
          <Link href="/register" className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full font-bold text-lg shadow-xl shadow-orange-500/20 hover:shadow-2xl transition-all">
            Get Started Free <FaArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}
