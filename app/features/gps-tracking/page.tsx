'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FaMapMarkerAlt, FaTruck, FaClock, FaArrowRight, FaMobile,
  FaRoute, FaBell, FaUsers
} from 'react-icons/fa';

const FEATURES = [
  { icon: FaMapMarkerAlt, title: 'Sub-Second Location Updates', desc: 'Driver GPS coordinates stream to Firebase Realtime Database every 1-2 seconds via the browser Geolocation API.' },
  { icon: FaRoute, title: 'Live Dispatch Map', desc: 'Your dispatch center shows all online drivers as real-time markers on a Mapbox map. Assign orders with one click.' },
  { icon: FaMobile, title: 'Customer Tracking Page', desc: 'Each delivery order gets a unique tracking link. Customers see the driver moving on a live map with ETA and status updates.' },
  { icon: FaTruck, title: 'Driver Status Management', desc: 'Drivers toggle between Online, Offline, On Break, and On Delivery. You see availability at a glance in the dispatch center.' },
  { icon: FaBell, title: 'Delivery Completion', desc: 'When a driver marks delivery complete, the order status auto-advances and the driver becomes available for the next assignment.' },
  { icon: FaUsers, title: 'In-House & Marketplace Drivers', desc: 'Manage your own driver fleet with Stripe payouts, or enable marketplace drivers — both tracked the same way.' },
];

const FAQS = [
  {
    q: 'How does driver GPS tracking work?',
    a: 'Drivers open their dashboard on any device with a browser. The app uses navigator.geolocation.watchPosition to send their coordinates to Firebase Realtime Database every 1-2 seconds. Your dispatch center and customer tracking pages subscribe to these updates in real-time.',
  },
  {
    q: 'What map provider do you use?',
    a: 'We use Mapbox GL JS for all map rendering — dispatch center, customer tracking, and driver views. Markers update in real-time as GPS data streams in.',
  },
  {
    q: 'Can customers track their delivery?',
    a: 'Yes. When an order is placed for delivery, a tracking link is created at /track-delivery/{orderId}. The customer sees a live map with the restaurant location, their delivery address, and the driver\'s moving position, plus a status progress bar and estimated arrival time.',
  },
  {
    q: 'How is ETA calculated?',
    a: 'Currently, ETA uses a Haversine distance formula (straight-line distance) with an average speed estimate. This gives a reasonable approximation that updates as the driver moves closer.',
  },
  {
    q: 'How do I assign a driver to an order?',
    a: 'In your Dispatch Center (/owner/dispatch), you see all pending delivery orders in a sidebar and all online drivers on the map. Click an order, click a driver, and hit assign. The driver gets the delivery details and their status updates to On Delivery.',
  },
  {
    q: 'Do drivers need to install an app?',
    a: 'No. Drivers use a web-based dashboard that works on any phone, tablet, or computer with a browser. No app store download required.',
  },
];

export default function GPSTrackingFeature() {
  return (
    <div className="min-h-screen bg-white/90">
      {/* Hero */}
      <section className="pt-36 pb-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-50 border border-blue-100 text-xs font-black uppercase tracking-widest text-blue-600"
          >Feature</motion.div>
          <motion.h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-zinc-900 text-balance"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          >
            GPS Fleet Tracking<span className="text-orange-600">.</span>
          </motion.h1>
          <motion.p className="text-xl text-zinc-500 leading-relaxed font-medium max-w-3xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            Track every driver in real-time. See them on a live map, assign orders instantly, 
            and give customers a tracking link for their delivery.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/register" className="group px-8 py-4 bg-black text-white rounded-full font-bold text-lg flex items-center gap-3 hover:bg-zinc-800 transition-all shadow-2xl">
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
              { n: '1', t: 'Driver goes online', d: 'They open their dashboard and toggle their status to Online. Their GPS position starts streaming to your system.' },
              { n: '2', t: 'You assign an order', d: 'In your Dispatch Center, you see all drivers on a Mapbox map. Click to assign a pending delivery to the closest available driver.' },
              { n: '3', t: 'Customer gets a tracking link', d: 'The order page generates a /track-delivery link. Customers see the driver moving toward them in real-time on a live map.' },
              { n: '4', t: 'Driver marks complete', d: 'When delivered, the driver marks it done. The order status updates, customer is notified, and the driver becomes available again.' },
            ].map((step, i) => (
              <motion.div key={i} className="flex gap-6" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">{step.n}</div>
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
          <h2 className="text-4xl font-black text-black mb-4 tracking-tight">Track your fleet today.</h2>
          <p className="text-zinc-500 font-medium mb-8">Real-time GPS for every delivery. Free to start.</p>
          <Link href="/register" className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full font-bold text-lg shadow-xl shadow-orange-500/20 hover:shadow-2xl transition-all">
            Get Started Free <FaArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}
