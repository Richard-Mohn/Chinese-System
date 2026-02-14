'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaArrowRight, FaCoins, FaStore, FaTruck, FaUsers, FaChurch, FaMusic } from 'react-icons/fa';

const valuePillars = [
  {
    title: 'More Repeat Orders',
    desc: 'Players come back to your store because their creature grows faster when they keep ordering from familiar places.',
    icon: FaStore,
    color: 'from-orange-500 to-amber-500',
  },
  {
    title: 'Dual Earnings',
    desc: 'Businesses keep order revenue and gain in-game rewards that unlock promotions, boosts, and discoverability.',
    icon: FaCoins,
    color: 'from-purple-500 to-violet-600',
  },
  {
    title: 'Delivery Visibility',
    desc: 'Customers see real driver movement in-game, which increases trust and keeps people engaged through the full order journey.',
    icon: FaTruck,
    color: 'from-indigo-500 to-purple-600',
  },
  {
    title: 'Community Retention',
    desc: 'Churches, artists, and local events create regular weekly reasons for players to return to partner businesses.',
    icon: FaUsers,
    color: 'from-orange-500 to-purple-600',
  },
];

const segments = [
  {
    title: 'Restaurants & Cafés',
    detail: 'Food powers creature stats, turning every menu order into progression and loyalty.',
    icon: FaStore,
  },
  {
    title: 'Churches & Faith Centers',
    detail: 'Live services and seminars become in-game destinations that increase local traffic and participation.',
    icon: FaChurch,
  },
  {
    title: 'Artists & Venues',
    detail: 'Events and merch connect to creature rewards, pushing fans from digital discovery to real attendance.',
    icon: FaMusic,
  },
];

export default function MohnStersBusinessGrowthPage() {
  return (
    <div className="min-h-screen bg-[#050507] text-white">
      <section className="pt-36 pb-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 mb-8 rounded-full bg-orange-500/10 border border-orange-500/20 text-sm font-black uppercase tracking-widest text-orange-300">
            <FaStore /> Business Growth Playbook
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
            Turn Gameplay Into <span className="bg-gradient-to-r from-orange-400 to-purple-500 bg-clip-text text-transparent">Real Revenue</span>
          </h1>
          <p className="text-zinc-400 text-xl max-w-3xl mx-auto leading-relaxed">
            MohnMenu + Mohnsters creates a new sales channel where players discover your location, order in real life, and return because their character progression depends on it.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 border-t border-white/5">
        <div className="container mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6">
          {valuePillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${pillar.color} flex items-center justify-center mb-4`}>
                <pillar.icon />
              </div>
              <h3 className="text-xl font-bold mb-2">{pillar.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{pillar.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 border-t border-white/5">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-10">Who This Helps Most</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {segments.map((segment, i) => (
              <motion.div
                key={segment.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <segment.icon className="text-orange-400 mb-3" />
                <h3 className="font-bold mb-2">{segment.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{segment.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 border-t border-white/5">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-black mb-4">Ready to join the game economy?</h2>
          <p className="text-zinc-400 mb-8">Launch on MohnMenu now and become a mapped location in the Mohnsters world.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="group px-7 py-3.5 rounded-full bg-gradient-to-r from-orange-500 to-purple-600 font-bold flex items-center gap-2">
              Get Started <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/mohnsters/world-ordering" className="px-7 py-3.5 rounded-full border border-white/15 text-zinc-100 font-bold hover:bg-white/5 transition-colors">
              See In-World Ordering
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
