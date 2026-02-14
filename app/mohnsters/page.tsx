'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FaDragon, FaGamepad, FaCoins, FaUtensils, FaChurch, FaMusic,
  FaStore, FaTruck, FaUsers, FaMapMarkerAlt, FaArrowRight, FaMobileAlt,
  FaShieldAlt, FaCoffee, FaBirthdayCake, FaGlassCheers
} from 'react-icons/fa';

/* ─── Stat cards ─── */
const creatureNeeds = [
  { need: 'Hunger', icon: '🍔', color: 'from-orange-500 to-red-500', desc: 'Feed your MohnSter by ordering real food from local restaurants. Different foods give different stat boosts.', decay: '-5% every 6 hours', satisfy: 'Order food through MohnMenu' },
  { need: 'Energy', icon: '⚡', color: 'from-yellow-400 to-amber-500', desc: 'Keep your creature energized by staying active. Your Core Link device keeps the energy flowing while online.', decay: '-3% every 8 hours', satisfy: 'ESP32 Core Link heartbeats' },
  { need: 'Social', icon: '💬', color: 'from-blue-400 to-indigo-500', desc: 'MohnSters are social creatures. Battle other players, visit friends, or attend community events to keep them happy.', decay: '-2% every 24 hours', satisfy: 'Battle, visit friends, attend events' },
  { need: 'Knowledge', icon: '📚', color: 'from-green-400 to-emerald-500', desc: 'Smart MohnSters earn more XP. Complete quests, scan collectible cards, or attend educational events.', decay: '-1% every 48 hours', satisfy: 'Quests, card scans, learning events' },
];

const businessTypes = [
  { icon: FaUtensils, label: 'Restaurants', desc: 'Real food → stat buffs. Protein boosts ATK, veggies boost HP, coffee boosts SPD.', color: 'bg-orange-500' },
  { icon: FaCoffee, label: 'Coffee Shops', desc: 'Energy drinks & coffee give +10% SPD for 4 hours. Morning orders = daily login habit.', color: 'bg-amber-600' },
  { icon: FaChurch, label: 'Churches', desc: 'Sanctuary zones with special spawns. 30-visit streaks unlock Guardian evolution paths.', color: 'bg-indigo-500' },
  { icon: FaMusic, label: 'Music Artists', desc: 'Concert check-ins = rare creature spawns. Merch drops become in-game cosmetics.', color: 'bg-pink-500' },
  { icon: FaStore, label: 'Retail Shops', desc: 'Browse real products in the 3D game world. Exclusive loot drops near partnered locations.', color: 'bg-emerald-500' },
  { icon: FaGlassCheers, label: 'Bars & Nightlife', desc: 'Social hub zones. Events become community battles. Happy hour = in-game bonus rewards.', color: 'bg-purple-500' },
  { icon: FaBirthdayCake, label: 'Bakeries & Cafés', desc: 'Sweet items give temporary XP multipliers. Desserts boost mood and satisfaction.', color: 'bg-rose-500' },
  { icon: FaTruck, label: 'Food Trucks', desc: 'Moving locations = "Explorer" bonus. Find food trucks at new GPS spots for discovery rewards.', color: 'bg-cyan-500' },
];

const howItWorks = [
  { step: '01', title: 'Sign Up on MohnMenu', desc: 'Create your account on any MohnMenu-powered store — your login works across the entire Mohn Empire ecosystem.', icon: FaMobileAlt },
  { step: '02', title: 'Your Business Enters the Game', desc: 'Your storefront appears as a real location in the MohnSters 3D open world. Customers discover you by exploring.', icon: FaMapMarkerAlt },
  { step: '03', title: 'Customers Interact In-Game', desc: 'Players walk their MohnSters to your location, browse your real menu or products, and place real orders — all inside the game.', icon: FaGamepad },
  { step: '04', title: 'Everyone Earns Rewards', desc: 'You keep 100% revenue (zero commission). Customers earn points that power up their creatures. Drivers earn game rewards on every delivery.', icon: FaCoins },
];

export default function MohnStersPage() {
  return (
    <div className="min-h-screen bg-[#050507] text-white relative overflow-hidden">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[180px]" />
      </div>

      {/* Hero */}
      <section className="relative pt-36 pb-24 px-4 z-10">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2 mb-8 rounded-full bg-purple-500/10 border border-purple-500/20 text-sm font-black uppercase tracking-widest text-purple-400"
          >
            <FaGamepad /> The Game That Powers Your Business
          </motion.div>

          <motion.h1
            className="text-5xl md:text-8xl font-black mb-6 tracking-tighter"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-white">MOHN</span>
            <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-violet-600 bg-clip-text text-transparent">STERS</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            A real-world open world game where <strong className="text-white">your business is inside the game</strong>. 
            Customers order real food, visit real stores, and attend real events — all while raising digital creatures 
            that grow stronger with every interaction.
          </motion.p>

          <motion.div
            className="flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link href="/mohnsters/earn" className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-full font-bold text-lg flex items-center gap-3 hover:shadow-xl hover:shadow-purple-500/20 transition-all">
              How You Earn <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/mohnsters/feed" className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full font-bold text-lg hover:bg-white/10 transition-all">
              Feed the Creatures
            </Link>
          </motion.div>
        </div>
      </section>

      {/* What Are MohnSters? */}
      <section className="relative py-24 px-4 z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-purple-400 font-black uppercase tracking-widest text-xs mb-3 block">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Real business. Real game. Real rewards.</h2>
            <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
              Every MohnMenu store becomes a living location in a 3D open world. Customers earn points, raise creatures, and keep coming back.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, i) => (
              <motion.div
                key={step.step}
                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-purple-500/20 transition-all group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white font-black text-lg flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
                  {step.step}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Creature Needs */}
      <section className="relative py-24 px-4 z-10 border-t border-white/[0.04]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-purple-400 font-black uppercase tracking-widest text-xs mb-3 block">Creature Needs</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Your MohnSter depends on you.</h2>
            <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
              Every creature has four core needs. Real-world actions keep them happy and powerful. Neglect them and their stats drop — but everything can be earned for free through gameplay.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {creatureNeeds.map((need, i) => (
              <motion.div
                key={need.need}
                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-purple-500/20 transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${need.color} flex items-center justify-center text-xl`}>
                    {need.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{need.need}</h3>
                    <div className="text-xs text-zinc-500">Decays {need.decay}</div>
                  </div>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed mb-3">{need.desc}</p>
                <div className="flex items-center gap-2 text-xs text-purple-400 bg-purple-500/10 rounded-lg px-3 py-2">
                  <FaShieldAlt className="shrink-0" />
                  <span><strong>Free to satisfy:</strong> {need.satisfy}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <div className="inline-block bg-green-500/10 border border-green-500/20 rounded-xl px-6 py-3 text-sm text-green-400">
              ✅ <strong>Important:</strong> Every creature need can be satisfied through free gameplay. Ordering food is a shortcut, never a requirement.
            </div>
          </div>
        </div>
      </section>

      {/* Business Types */}
      <section className="relative py-24 px-4 z-10 border-t border-white/[0.04]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-purple-400 font-black uppercase tracking-widest text-xs mb-3 block">Every Business Type</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Your store. Inside the game.</h2>
            <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
              Every MohnMenu-powered business becomes a real location in the MohnSters world — complete with unique gameplay mechanics tailored to your industry.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {businessTypes.map((biz, i) => (
              <motion.div
                key={biz.label}
                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-purple-500/20 transition-all group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <div className={`w-10 h-10 ${biz.color} rounded-lg flex items-center justify-center mb-3 text-white shadow-lg`}>
                  <biz.icon className="text-sm" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{biz.label}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{biz.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-4 z-10 border-t border-white/[0.04]">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
            Ready to enter the <span className="bg-gradient-to-r from-purple-400 to-violet-500 bg-clip-text text-transparent">game?</span>
          </h2>
          <p className="text-zinc-500 text-lg mb-10 max-w-xl mx-auto">
            Your MohnMenu store is already eligible. When MohnSters launches, your business automatically 
            becomes a live location in the open world — zero extra setup.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-full font-bold flex items-center gap-3 hover:shadow-xl hover:shadow-purple-500/20 transition-all">
              Get Your Store In The Game <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/mohnsters/earn" className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full font-bold hover:bg-white/10 transition-all">
              Learn How You Earn →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
