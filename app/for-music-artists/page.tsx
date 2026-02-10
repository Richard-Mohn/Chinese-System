'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FaMusic,
  FaArrowRight,
  FaTicketAlt,
  FaShoppingBag,
  FaBroadcastTower,
  FaUsers,
  FaBolt,
  FaCreditCard,
  FaHeadphones,
} from 'react-icons/fa';
import FloatingStoreIcons from '@/components/FloatingStoreIcons';

interface FeatureCardProps { icon: any; title: string; description: string; delay: number; }
const FeatureCard = ({ icon: Icon, title, description, delay }: FeatureCardProps) => (
  <motion.div
    className="bg-white p-8 rounded-3xl shadow-sm border border-indigo-100 flex flex-col items-start text-left group hover:border-indigo-300 hover:shadow-xl transition-all duration-500"
    initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay }}
  >
    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:to-pink-500 group-hover:text-white transition-all duration-500 shadow-sm">
      <Icon className="text-2xl" />
    </div>
    <h4 className="text-xl font-bold text-zinc-900 mb-3">{title}</h4>
    <p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

export default function ForMusicArtists() {
  return (
    <div className="min-h-screen bg-white/95 relative">
      <FloatingStoreIcons storeType="music" count={16} position="fixed" />

      <section className="pt-36 pb-20 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-black uppercase tracking-widest text-indigo-600"
          >
            For Music & Artists
          </motion.div>
          <motion.h1
            className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-zinc-900 text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Your fanbase, merch, and tours in <span className="text-indigo-500">one platform</span>.
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium max-w-3xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Sell tickets, drop merch, and stream live from one hub. Keep the data, keep the revenue, and grow your community.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link href="/demo" className="group px-10 py-5 bg-gradient-to-r from-indigo-500 to-pink-500 text-white rounded-full font-bold text-lg flex items-center gap-3 hover:shadow-xl hover:shadow-indigo-500/20 transition-all">
              Explore Demos <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/register" className="px-10 py-5 bg-white text-black border-2 border-indigo-200 rounded-full font-bold text-lg hover:border-indigo-500 transition-all">
              Start Free Today
            </Link>
          </motion.div>
        </div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-indigo-100 rounded-full blur-[120px] opacity-30" />
      </section>

      <section className="py-24 px-4 bg-indigo-50/60">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-black uppercase tracking-widest text-xs mb-3 block">Core Platform</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Launch faster than your next drop.</h2>
            <p className="text-zinc-500 text-lg max-w-2xl mx-auto">Merch, ticketing, and live streams with fan data built in.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={FaTicketAlt} title="Ticketing" description="Create shows, sell tickets, and scan at the door without third-party fees." delay={0.05} />
            <FeatureCard icon={FaShoppingBag} title="Merch Store" description="Limited drops, bundles, and pre-orders with inventory alerts." delay={0.1} />
            <FeatureCard icon={FaBroadcastTower} title="Live Streams" description="Paywalled streams with built-in replay access." delay={0.15} />
            <FeatureCard icon={FaUsers} title="Fan Clubs" description="Member tiers, backstage content, and community perks." delay={0.2} />
            <FeatureCard icon={FaBolt} title="Instant Drops" description="Time-based drops with countdowns and SMS alerts." delay={0.25} />
            <FeatureCard icon={FaCreditCard} title="Direct Payments" description="Keep 100% of your revenue with transparent payouts." delay={0.3} />
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-indigo-600 font-black">Fan Experience</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Build moments they share.</h2>
            <p className="text-lg text-zinc-500 mb-8">Offer a clean fan portal with exclusive drops, live content, and tour updates.</p>
            <div className="space-y-4">
              {[
                { icon: FaHeadphones, title: 'Exclusive Audio', desc: 'Drop unreleased tracks and remix packs.' },
                { icon: FaMusic, title: 'Setlist Drops', desc: 'Share setlists and behind-the-scenes notes.' },
                { icon: FaUsers, title: 'VIP Access', desc: 'Meet & greets, private merch, and early tickets.' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <item.icon />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-zinc-900">{item.title}</h4>
                    <p className="text-sm text-zinc-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-zinc-950 text-white rounded-[2.5rem] p-10 shadow-2xl">
            <p className="text-xs uppercase tracking-widest text-indigo-300 font-black">Artist Hub</p>
            <h3 className="text-3xl font-black mt-4 mb-6">Everything you need in one control room.</h3>
            <p className="text-indigo-100/80 mb-8">Set up merch, announce tours, and launch streaming nights without jumping between tools.</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/register" className="px-6 py-3 rounded-full bg-indigo-500 text-white font-bold">
                Start Your Hub
              </Link>
              <Link href="/demo" className="px-6 py-3 rounded-full border border-indigo-300/50 text-indigo-100 font-bold">
                View Demos
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl bg-gradient-to-r from-indigo-500 to-pink-500 rounded-[3rem] p-10 md:p-16 text-white shadow-2xl text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Build the next era of your music.</h2>
          <p className="text-indigo-100 text-lg mb-10 max-w-xl mx-auto">Launch in minutes and keep control of your audience forever.</p>
          <Link href="/register" className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-indigo-700 rounded-full font-bold text-lg hover:bg-indigo-50 transition-all">
            Get Started Free <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
