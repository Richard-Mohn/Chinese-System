'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FaUtensils, FaArrowRight, FaDrumstickBite, FaLeafMaple, FaCoffee,
  FaBirthdayCake, FaFire, FaHeartbeat, FaBolt, FaSmile, FaStar,
  FaShieldAlt, FaGamepad
} from 'react-icons/fa';

/* ─── Food → stat mapping ─── */
const foodStats = [
  {
    category: 'Protein & Meat',
    emoji: '🥩',
    items: 'Burgers, wings, steak, grilled chicken, BBQ',
    stat: 'ATK +',
    statColor: 'text-red-400',
    boost: 'Attack Power',
    desc: 'Protein-rich meals fuel your MohnSter\'s combat strength. Order a steak dinner and watch your creature\'s ATK stat climb.',
    bonus: '$20+ order = "Well-Fed" status (1.2× ATK for 24 hours)',
    gradient: 'from-red-500 to-orange-500',
  },
  {
    category: 'Vegetables & Salads',
    emoji: '🥗',
    items: 'Salads, bowls, veggie wraps, smoothie bowls',
    stat: 'HP Regen',
    statColor: 'text-green-400',
    boost: 'Health Recovery',
    desc: 'Healthy food heals your companion. Green meals restore HP over time and boost natural regeneration rates during battles.',
    bonus: 'Full salad meal = HP regen buff for 12 hours',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    category: 'Coffee & Energy',
    emoji: '☕',
    items: 'Espresso, lattes, energy drinks, matcha',
    stat: 'SPD +10%',
    statColor: 'text-yellow-400',
    boost: 'Speed Boost',
    desc: 'Caffeine makes your MohnSter faster. Coffee orders give a temporary +10% SPD buff that lasts 4 hours — perfect before ranked battles.',
    bonus: 'Morning coffee = daily login habit + SPD buff combo',
    gradient: 'from-yellow-400 to-amber-500',
  },
  {
    category: 'Desserts & Sweets',
    emoji: '🍰',
    items: 'Cakes, cookies, ice cream, pastries, donuts',
    stat: 'XP ×1.5',
    statColor: 'text-pink-400',
    boost: 'XP Multiplier',
    desc: 'Sweet treats make your creature happy. Happy MohnSters earn 1.5× XP from all activities for the buff duration.',
    bonus: 'Dessert after a meal = stacked mood + stat buffs',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    category: 'Full Meals',
    emoji: '🍽️',
    items: 'Complete dinner, family combo, meal deal',
    stat: 'All Stats',
    statColor: 'text-purple-400',
    boost: 'Complete Satisfaction',
    desc: 'A full meal completely satisfies your MohnSter\'s Hunger need instantly. No decay for the next 12 hours, plus balanced stat boosts across all areas.',
    bonus: '$50+/week spending = rare food item drop + "Feast Mode" evolution path chance',
    gradient: 'from-purple-500 to-violet-500',
  },
  {
    category: 'Quick Bites',
    emoji: '🌮',
    items: 'Tacos, hot dogs, convenience store snacks, grab-and-go',
    stat: 'Mood +',
    statColor: 'text-cyan-400',
    boost: 'Mood Boost',
    desc: 'Quick bites give a smaller Hunger satisfaction but boost mood immediately. Great for topping off between big meals.',
    bonus: 'Try a new restaurant = rare food item drop chance',
    gradient: 'from-cyan-500 to-teal-500',
  },
];

const regularBonuses = [
  { orders: '1 order', reward: 'Hunger satisfied + one stat buff', color: 'text-zinc-400' },
  { orders: '3 orders / week', reward: '"Regular" status — 1.1× all stats at that restaurant', color: 'text-blue-400' },
  { orders: '10 orders total', reward: 'Exclusive menu item unlock + creature cosmetic', color: 'text-purple-400' },
  { orders: '25 orders total', reward: '"Foodie" title + permanent Hunger decay reduction', color: 'text-amber-400' },
  { orders: '$50+ / week', reward: 'Rare food item drop + "Feast Mode" evolution path chance', color: 'text-green-400' },
];

export default function MohnStersFeedPage() {
  return (
    <div className="min-h-screen bg-[#050507] text-white relative overflow-hidden">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[180px]" />
      </div>

      {/* Hero */}
      <section className="relative pt-36 pb-20 px-4 z-10">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2 mb-8 rounded-full bg-orange-500/10 border border-orange-500/20 text-sm font-black uppercase tracking-widest text-orange-400"
          >
            <FaUtensils /> Feed the Creatures
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-black mb-6 tracking-tighter"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Real Food.{' '}
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Real Power.
            </span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            When customers order food from your restaurant through MohnMenu, their MohnSter companion 
            <strong className="text-white"> literally eats the meal in-game</strong> and gains stat boosts based on what they ordered. 
            Burgers boost Attack. Coffee boosts Speed. Salads restore Health.
          </motion.p>

          <motion.div
            className="flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link href="/register" className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full font-bold text-lg flex items-center gap-3 hover:shadow-xl hover:shadow-orange-500/20 transition-all">
              List Your Restaurant <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/mohnsters" className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full font-bold text-lg hover:bg-white/10 transition-all">
              ← Game Overview
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Food → Stat Cards */}
      <section className="relative py-24 px-4 z-10 border-t border-white/[0.04]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-orange-400 font-black uppercase tracking-widest text-xs mb-3 block">Food × Stats</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Every menu item has power.</h2>
            <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
              Your restaurant&apos;s food isn&apos;t just food — it&apos;s creature fuel. Different food categories map to different stat boosts, 
              giving players a strategic reason to order from you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {foodStats.map((food, i) => (
              <motion.div
                key={food.category}
                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-purple-500/20 transition-all group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <div className={`bg-gradient-to-r ${food.gradient} p-4 flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{food.emoji}</span>
                    <div>
                      <h3 className="text-sm font-black text-white">{food.category}</h3>
                      <p className="text-xs text-white/70">{food.items}</p>
                    </div>
                  </div>
                  <div className="bg-black/20 rounded-lg px-3 py-1.5">
                    <span className={`text-sm font-black ${food.statColor}`}>{food.stat}</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-xs font-bold text-zinc-300 mb-2 uppercase tracking-widest">{food.boost}</div>
                  <p className="text-sm text-zinc-500 leading-relaxed mb-4">{food.desc}</p>
                  <div className="flex items-start gap-2 text-xs text-amber-400 bg-amber-500/10 rounded-lg px-3 py-2">
                    <FaStar className="shrink-0 mt-0.5" />
                    <span>{food.bonus}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <div className="inline-block bg-green-500/10 border border-green-500/20 rounded-xl px-6 py-3 text-sm text-green-400">
              ✅ <strong>Free play note:</strong> Creatures can always be fed through free gameplay (earning 50+ points from any activity). 
              Ordering food is a faster shortcut, never a pay-to-win requirement.
            </div>
          </div>
        </div>
      </section>

      {/* Regular customer bonuses */}
      <section className="relative py-24 px-4 z-10 border-t border-white/[0.04]">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <span className="text-purple-400 font-black uppercase tracking-widest text-xs mb-3 block">Loyalty Loop</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Repeat customers get stronger.</h2>
            <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
              The more a customer orders from your restaurant, the stronger their creature becomes. This creates a natural retention loop — 
              they keep coming back because their MohnSter rewards them for being loyal.
            </p>
          </div>

          <div className="space-y-3">
            {regularBonuses.map((item, i) => (
              <motion.div
                key={item.orders}
                className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:border-purple-500/20 transition-all"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
              >
                <div className={`text-sm font-black ${item.color} bg-white/5 px-4 py-2 rounded-lg shrink-0 min-w-[140px] text-center`}>
                  {item.orders}
                </div>
                <div className="text-sm text-zinc-400">{item.reward}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* For restaurants — what it means for your business */}
      <section className="relative py-24 px-4 z-10 border-t border-white/[0.04]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-orange-400 font-black uppercase tracking-widest text-xs mb-3 block">For Your Business</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Why this matters for restaurants.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Built-In Retention',
                desc: 'Players naturally order from the same restaurants to build up their "Regular" bonus. Your food becomes part of their gaming strategy — they come back because their creature needs you.',
                icon: '🔄',
              },
              {
                title: 'Zero Extra Work',
                desc: 'You don\'t need to do anything special. Keep running your MohnMenu store normally. The game integration happens automatically — every order triggers in-game effects for the customer.',
                icon: '✅',
              },
              {
                title: 'New Customer Discovery',
                desc: 'Players exploring the MohnSters world will discover your restaurant as a real location on the game map. They\'ll visit specifically because they need to feed their creature — a completely new acquisition channel.',
                icon: '🗺️',
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-orange-500/20 transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="text-3xl mb-4">{card.icon}</div>
                <h3 className="text-lg font-bold text-white mb-3">{card.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Merchant NPC */}
      <section className="relative py-24 px-4 z-10 border-t border-white/[0.04]">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-br from-purple-500/10 to-violet-500/5 border border-purple-500/20 rounded-2xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="text-6xl">🧑‍🍳</div>
              <div>
                <h3 className="text-2xl font-black text-white mb-3">Merchant NPC Digital Twin</h3>
                <p className="text-zinc-400 leading-relaxed mb-4">
                  Want to go even further? With the Merchant Identity package, your real face and likeness appear behind the counter 
                  in the MohnSters game world. Customers walk up to <em>your</em> NPC, browse <em>your</em> menu, and place real orders — 
                  all inside the game. Add an AI voice clone so your digital twin even talks like you.
                </p>
                <div className="flex flex-wrap gap-3 text-xs">
                  <span className="bg-purple-500/10 text-purple-400 px-3 py-1.5 rounded-full font-bold">Merchant Identity — $149</span>
                  <span className="bg-purple-500/10 text-purple-400 px-3 py-1.5 rounded-full font-bold">AI Voice Clone — $49</span>
                  <span className="bg-purple-500/10 text-purple-400 px-3 py-1.5 rounded-full font-bold">Staff Scans — $79/person</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-4 z-10 border-t border-white/[0.04]">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
            Your food already has{' '}
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">superpowers.</span>
          </h2>
          <p className="text-zinc-500 text-lg mb-10 max-w-xl mx-auto">
            Every MohnMenu restaurant is automatically part of the MohnSters world. Your menu items become creature fuel — 
            and your customers get a whole new reason to keep ordering.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full font-bold flex items-center gap-3 hover:shadow-xl hover:shadow-orange-500/20 transition-all">
              Get Your Menu In The Game <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/mohnsters/community" className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full font-bold hover:bg-white/10 transition-all">
              Churches, Artists & More →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
