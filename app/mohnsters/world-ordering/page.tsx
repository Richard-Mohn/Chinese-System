'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaArrowRight, FaGamepad, FaMapMarkerAlt, FaShoppingCart, FaTruck, FaUtensils, FaUserFriends } from 'react-icons/fa';

const flow = [
  {
    step: '01',
    title: 'Player walks to your store in-game',
    desc: 'Your real business appears as a world location. Players physically move their character to your storefront.',
    icon: FaMapMarkerAlt,
  },
  {
    step: '02',
    title: 'Order placed from inside the game',
    desc: 'They browse your real menu and submit a normal MohnMenu order while staying in the game experience.',
    icon: FaShoppingCart,
  },
  {
    step: '03',
    title: 'Driver appears live in-world',
    desc: 'A real driver accepts and is represented in-game, so customers can watch the delivery progress in real time.',
    icon: FaTruck,
  },
  {
    step: '04',
    title: 'Delivery powers both players',
    desc: 'The ordering player receives food + creature buffs while the driver gains pay and in-game progression.',
    icon: FaUtensils,
  },
];

export default function MohnStersWorldOrderingPage() {
  return (
    <div className="min-h-screen bg-[#050507] text-white">
      <section className="pt-36 pb-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 mb-8 rounded-full bg-purple-500/10 border border-purple-500/20 text-sm font-black uppercase tracking-widest text-purple-300">
            <FaGamepad /> In-World Ordering
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
            Order Food <span className="bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">Inside the Game</span>
          </h1>
          <p className="text-zinc-400 text-xl max-w-3xl mx-auto leading-relaxed">
            Players can walk to a real storefront, place an order, and watch the real delivery happen in-world. It turns every order into a visible multiplayer moment.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 border-t border-white/5">
        <div className="container mx-auto max-w-5xl space-y-4">
          {flow.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex items-start gap-4"
            >
              <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center font-black">
                {item.step}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1">{item.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
              <item.icon className="text-purple-300 mt-1" />
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 border-t border-white/5">
        <div className="container mx-auto max-w-4xl">
          <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-6 text-center">
            <h2 className="text-2xl md:text-3xl font-black mb-3">Multiplayer delivery visibility</h2>
            <p className="text-zinc-300 leading-relaxed">
              One player can place an order and other nearby players can see the delivery character moving through the world map. This makes local businesses feel alive and social instead of transactional.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-orange-300 text-sm font-bold">
              <FaUserFriends /> Orders become shared world events, not just private checkouts.
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 border-t border-white/5">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-black mb-4">Bring this to your storefront</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="group px-7 py-3.5 rounded-full bg-gradient-to-r from-purple-500 to-orange-500 font-bold flex items-center gap-2">
              Activate Your Location <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/mohnsters/church-live" className="px-7 py-3.5 rounded-full border border-white/15 text-zinc-100 font-bold hover:bg-white/5 transition-colors">
              Church Live Mode
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
