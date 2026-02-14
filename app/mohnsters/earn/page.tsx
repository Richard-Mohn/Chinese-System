'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FaTruck, FaCoins, FaArrowRight, FaMapMarkerAlt, FaGamepad,
  FaBolt, FaUsers, FaMedal, FaStar, FaChartLine, FaShieldAlt, FaDollarSign
} from 'react-icons/fa';

/* ─── Earning tiers ─── */
const driverEarnings = [
  { action: 'Complete a delivery', points: '30 – 100', icon: '📦', note: 'Points scale with distance and order size' },
  { action: 'Every 10 deliveries', points: '+SPD boost', icon: '⚡', note: 'Permanent Speed stat increase on your companion' },
  { action: 'Peak hour bonus', points: '2× multiplier', icon: '🔥', note: 'Dinner rush, weekends, and event days' },
  { action: '7-day delivery streak', points: '2× all earnings', icon: '📅', note: 'Complete at least 1 delivery per day for a week' },
  { action: '30-day streak', points: '3× all earnings', icon: '🏆', note: 'Legendary tier — unlock exclusive creature skins' },
  { action: 'Peer delivery bonus', points: '$1 – $3 off order', icon: '🤝', note: 'Carry an order for someone headed your direction' },
];

const businessEarnings = [
  { action: 'Every customer order', points: '10 – 100', icon: '🛒', note: 'You keep 100% revenue + earn game points' },
  { action: 'New customer first order', points: '50 bonus', icon: '🆕', note: 'Players discover your store exploring the game world' },
  { action: '3+ orders/week regulars', points: '1.1× stat bonus', icon: '🔄', note: 'Repeat customers earn "Regular" status boost' },
  { action: 'Community event hosted', points: '100 – 1,000', icon: '🎉', note: 'Host an in-game event at your location' },
  { action: 'Merchant NPC Digital Twin', points: 'Your face in-game', icon: '🧑‍💼', note: 'Customers see YOU behind the counter in the game' },
  { action: 'Core Link Node hosting', points: '$2 – $3 per device', icon: '📡', note: 'Stock & distribute devices, earn per activation' },
];

const inGameDriverFeatures = [
  {
    title: 'You Appear In The Game',
    desc: 'When you deliver an order, your character appears in the MohnSters world — GPS-tracked in real time. The customer watches you approach their location like a live map, but inside a 3D game world.',
    icon: FaMapMarkerAlt,
  },
  {
    title: 'Your MohnSter Rides Along',
    desc: 'Your companion creature sits beside you during deliveries. It gains Speed XP from every trip. The more you deliver, the faster and stronger your MohnSter becomes.',
    icon: FaGamepad,
  },
  {
    title: 'Customers Can See You Coming',
    desc: 'Players who ordered food see a driver character approaching in real time through the game world. When you arrive, their MohnSter plays an eating animation and gains stat boosts from the meal.',
    icon: FaUsers,
  },
  {
    title: 'Earn Real Money + Game Rewards',
    desc: 'You earn $3.50 per delivery in real cash through Stripe. On top of that, you earn 30–100 game points per delivery — building your in-game reputation and powering up your creature.',
    icon: FaDollarSign,
  },
];

export default function MohnStersEarnPage() {
  return (
    <div className="min-h-screen bg-[#050507] text-white relative overflow-hidden">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[180px]" />
      </div>

      {/* Hero */}
      <section className="relative pt-36 pb-20 px-4 z-10">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2 mb-8 rounded-full bg-green-500/10 border border-green-500/20 text-sm font-black uppercase tracking-widest text-green-400"
          >
            <FaCoins /> Earn While You Work
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-black mb-6 tracking-tighter"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Deliver Food.{' '}
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              Level Up.
            </span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Every MohnMenu delivery earns you <strong className="text-white">real cash</strong> through Stripe and{' '}
            <strong className="text-green-400">in-game rewards</strong> that power up your MohnSter companion. 
            You physically show up on the game map as you deliver — your customers can watch you coming.
          </motion.p>

          <motion.div
            className="flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link href="/register" className="group px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-bold text-lg flex items-center gap-3 hover:shadow-xl hover:shadow-green-500/20 transition-all">
              Start Driving <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/mohnsters" className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full font-bold text-lg hover:bg-white/10 transition-all">
              ← Back to Game Overview
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How drivers appear in-game */}
      <section className="relative py-24 px-4 z-10 border-t border-white/[0.04]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-purple-400 font-black uppercase tracking-widest text-xs mb-3 block">In-Game Delivery</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">You&apos;re not just a driver. You&apos;re in the game.</h2>
            <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
              When a customer orders food through a MohnMenu business, the entire delivery is tracked live in the MohnSters 3D world.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inGameDriverFeatures.map((feat, i) => (
              <motion.div
                key={feat.title}
                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 hover:border-purple-500/20 transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white flex items-center justify-center mb-5 shadow-lg shadow-purple-500/20">
                  <feat.icon className="text-xl" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feat.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Driver earnings table */}
      <section className="relative py-24 px-4 z-10 border-t border-white/[0.04]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-green-400 font-black uppercase tracking-widest text-xs mb-3 block">Driver Rewards</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">What drivers earn.</h2>
            <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
              On top of the $3.50 per delivery base pay (through Stripe), you earn game points with every trip.
            </p>
          </div>

          <div className="space-y-3">
            {driverEarnings.map((item, i) => (
              <motion.div
                key={item.action}
                className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:border-green-500/20 transition-all"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <div className="text-2xl shrink-0">{item.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white">{item.action}</div>
                  <div className="text-xs text-zinc-500">{item.note}</div>
                </div>
                <div className="text-sm font-black text-green-400 shrink-0 bg-green-500/10 px-3 py-1.5 rounded-lg">
                  {item.points}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Business earnings table */}
      <section className="relative py-24 px-4 z-10 border-t border-white/[0.04]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-amber-400 font-black uppercase tracking-widest text-xs mb-3 block">Business Owner Rewards</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">What your business earns.</h2>
            <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
              Zero commission on every order — you keep 100% of your revenue. Plus, your business earns game points and attracts gamers as new customers.
            </p>
          </div>

          <div className="space-y-3">
            {businessEarnings.map((item, i) => (
              <motion.div
                key={item.action}
                className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:border-amber-500/20 transition-all"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <div className="text-2xl shrink-0">{item.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white">{item.action}</div>
                  <div className="text-xs text-zinc-500">{item.note}</div>
                </div>
                <div className="text-sm font-black text-amber-400 shrink-0 bg-amber-500/10 px-3 py-1.5 rounded-lg">
                  {item.points}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How the money + points flow */}
      <section className="relative py-24 px-4 z-10 border-t border-white/[0.04]">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <span className="text-purple-400 font-black uppercase tracking-widest text-xs mb-3 block">The Loop</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Everyone wins.</h2>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 md:p-12">
            <div className="space-y-8">
              {[
                { who: 'Customer', flow: 'Orders food → MohnSter gets fed → gains stat buffs → earns 10–100 points', color: 'text-blue-400' },
                { who: 'Restaurant', flow: 'Receives order → keeps 100% revenue → earns 10–100 game points → appears in 3D world', color: 'text-orange-400' },
                { who: 'Driver', flow: 'Delivers order → earns $3.50 cash + 30–100 game points → appears live on game map → creature gains SPD', color: 'text-green-400' },
                { who: 'The Game', flow: 'More orders = more active creatures = more battles = more community = more orders', color: 'text-purple-400' },
              ].map((item, i) => (
                <motion.div
                  key={item.who}
                  className="flex flex-col sm:flex-row items-start gap-4"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                >
                  <div className={`text-sm font-black ${item.color} bg-white/5 px-4 py-2 rounded-lg shrink-0 min-w-[100px] text-center`}>
                    {item.who}
                  </div>
                  <div className="text-sm text-zinc-400 leading-relaxed">{item.flow}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-4 z-10 border-t border-white/[0.04]">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
            Start earning{' '}
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">today.</span>
          </h2>
          <p className="text-zinc-500 text-lg mb-10 max-w-xl mx-auto">
            Whether you&apos;re a driver or a business owner, MohnSters adds a new revenue stream and a whole new reason for customers to keep coming back.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="group px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-bold flex items-center gap-3 hover:shadow-xl hover:shadow-green-500/20 transition-all">
              Sign Up Free <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/mohnsters/feed" className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full font-bold hover:bg-white/10 transition-all">
              How Food Powers Creatures →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
