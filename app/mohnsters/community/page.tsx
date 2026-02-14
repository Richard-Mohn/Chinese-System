'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FaChurch, FaMusic, FaStore, FaGlassCheers, FaCoffee, FaTruck,
  FaArrowRight, FaShieldAlt, FaStar, FaUsers, FaMapMarkerAlt,
  FaGamepad, FaHeart, FaPray, FaMicrophone, FaShoppingBag
} from 'react-icons/fa';

/* ─── Community business integrations ─── */
const communityTypes = [
  {
    id: 'churches',
    icon: FaChurch,
    title: 'Churches & Faith Communities',
    subtitle: 'Sanctuary Zones',
    gradient: 'from-indigo-500 to-purple-600',
    glowColor: 'indigo',
    tagline: 'A safe haven in the digital world — just like in real life.',
    features: [
      {
        title: 'Sanctuary Zone',
        desc: 'Your church becomes a safe zone in the MohnSters world. No danger, no battles — just peace. Creatures heal passively when near a Sanctuary.',
        icon: FaShieldAlt,
      },
      {
        title: 'Faithful Bonus',
        desc: 'Members who check in earn 25 points per visit. The "Knowledge" need gets satisfied — MohnSters that learn, earn more XP across all activities.',
        icon: FaStar,
      },
      {
        title: 'Guardian Evolution Path',
        desc: 'After 30 consecutive visits, members unlock the special "Guardian" evolution path. Their MohnSter can evolve into a rare defensive creature form — exclusive to faith communities.',
        icon: FaHeart,
      },
      {
        title: 'Pickup Node Hub',
        desc: 'Stock and distribute Core Link devices (ESP32 nodes) at your church. Earn $2–$3 commission per device activation. Help your congregation get into the game while raising funds.',
        icon: FaMapMarkerAlt,
      },
      {
        title: 'Community Events',
        desc: 'Church events become in-game community events. Special services, fundraisers, or volunteer days grant 100–1,000 bonus points to attendees — driving more participation.',
        icon: FaUsers,
      },
    ],
    callout: 'Churches aren\'t just in the game — they\'re special. The Sanctuary mechanic reflects the real-world role of faith communities as places of safety and growth.',
  },
  {
    id: 'music',
    icon: FaMusic,
    title: 'Music Artists & Performers',
    subtitle: 'Fame & Social System',
    gradient: 'from-pink-500 to-rose-600',
    glowColor: 'pink',
    tagline: 'Your concerts, merch drops, and fan clubs — live inside the game.',
    features: [
      {
        title: 'Concert Check-In Spawns',
        desc: 'When fans GPS check-in at your live venue, rare creature companions spawn exclusively at that event. Limited edition MohnSters that can never be obtained again — driving ticket sales through FOMO.',
        icon: FaMicrophone,
      },
      {
        title: 'Merch → In-Game Cosmetics',
        desc: 'Physical merch purchases unlock digital cosmetic items for the buyer\'s player avatar. Buy a real hoodie — your in-game character wears it too. Physical + digital bundles in one purchase.',
        icon: FaShoppingBag,
      },
      {
        title: 'Fan Club Exclusives',
        desc: 'Fan club members get exclusive creature skins, early access to limited companion evolutions, and priority access to in-game events tied to your releases.',
        icon: FaStar,
      },
      {
        title: 'Listening = Social Points',
        desc: 'When fans listen to your music through the platform, their creature\'s "Social" need gets satisfied and they earn points. Your music literally powers up their MohnSter.',
        icon: FaGamepad,
      },
      {
        title: 'Artist NPC with AI Voice',
        desc: 'Get the Merchant Identity package ($149) and your likeness appears as an NPC in the game world. Add an AI Voice Clone ($49) so fans can interact with a digital version of you inside the game.',
        icon: FaUsers,
      },
    ],
    callout: 'Music artists get the most viral game mechanic: event-exclusive creature spawns. Fans will come to your shows specifically to catch rare MohnSters that never appear again.',
  },
  {
    id: 'retail',
    icon: FaStore,
    title: 'Retail Shops & Boutiques',
    subtitle: 'Grid Storefronts',
    gradient: 'from-emerald-500 to-green-600',
    glowColor: 'emerald',
    tagline: 'Your real products — browsed and bought inside a 3D game world.',
    features: [
      {
        title: '3D Grid Storefront',
        desc: 'Your shop becomes a 3D storefront in the MohnSters open world. Players walk their characters to your location, walk inside, browse real products on virtual shelves, and purchase through Stripe.',
        icon: FaStore,
      },
      {
        title: 'Exclusive Loot Drops',
        desc: 'Partnered retail locations become "loot zones" — exclusive augmentation parts and rare items only drop near your physical store. Players have to visit to collect them, driving foot traffic.',
        icon: FaStar,
      },
      {
        title: 'Merchant NPC',
        desc: 'Your real face appears behind the counter as an NPC Digital Twin. Customers interact with you in the game world — creating an immersive shopping experience that blends real and digital.',
        icon: FaUsers,
      },
      {
        title: 'AI-Powered Product Listings',
        desc: 'Snap photos of your products and AI generates the listing — both for your real MohnMenu store AND as in-game items. One photo, two storefronts.',
        icon: FaMapMarkerAlt,
      },
    ],
    callout: 'Retail shops become exploration destinations. Players discover your store by walking through the game world — a new customer acquisition channel that costs you nothing.',
  },
  {
    id: 'bars',
    icon: FaGlassCheers,
    title: 'Bars & Nightlife',
    subtitle: 'Social Hub Zones',
    gradient: 'from-purple-500 to-violet-600',
    glowColor: 'purple',
    tagline: 'Where MohnSter trainers meet, battle, and celebrate.',
    features: [
      {
        title: 'Social Need Satisfaction',
        desc: 'Bars satisfy the "Social" creature need. Players who check in at your bar keep their MohnSter\'s Social meter full — bonuses to Special Power (SP) and reduced ability costs in battle.',
        icon: FaUsers,
      },
      {
        title: 'Community Battle Hub',
        desc: 'Your bar can host in-game battles and tournaments. Players meet IRL at your venue and battle their MohnSters in the game. Happy hour specials or event nights become gaming events.',
        icon: FaGamepad,
      },
      {
        title: 'Event Night Rewards',
        desc: 'Special events at your bar (trivia, live music, DJ nights) generate 100–1,000 community event points for attendees. More events = more regular foot traffic.',
        icon: FaStar,
      },
      {
        title: 'Digital Jukebox & Karaoke',
        desc: 'MohnMenu\'s entertainment features (jukebox, karaoke) bridge into game social points. Credits spent on entertainment also earn game points — everything connects.',
        icon: FaMusic,
      },
    ],
    callout: 'Bars become the natural meetup spot for MohnSter trainers. Host a weekly tournament night and watch your Tuesday traffic triple.',
  },
  {
    id: 'coffee',
    icon: FaCoffee,
    title: 'Coffee Shops',
    subtitle: 'Energy & Speed Zones',
    gradient: 'from-amber-500 to-orange-600',
    glowColor: 'amber',
    tagline: 'Morning coffee + daily login = the perfect habit loop.',
    features: [
      {
        title: '+10% SPD Buff',
        desc: 'Every coffee or energy drink purchase gives the customer\'s MohnSter a +10% Speed buff for 4 hours. Players will time their coffee runs before ranked battles for the competitive edge.',
        icon: FaGamepad,
      },
      {
        title: 'Daily Habit Loop',
        desc: 'Morning coffee becomes a daily login habit for the game. Order coffee → creature gets energy buff → player checks in → both start the day powered up. Natural retention.',
        icon: FaStar,
      },
      {
        title: 'Peer Delivery System',
        desc: 'Coffee shop customers heading in the same direction carry orders for each other, earning $1–$3 off their own order. The game rewards this with bonus delivery points.',
        icon: FaTruck,
      },
      {
        title: 'Loyalty × Game Points',
        desc: 'Your existing loyalty program points double as game points. Customers earn both coffee loyalty stamps AND MohnSter rewards with every purchase — one habit, two reward systems.',
        icon: FaHeart,
      },
    ],
    callout: 'Coffee shops have the highest natural visit frequency of any business type. Combine that with a daily Speed buff and you\'ve got the stickiest retention loop in the game.',
  },
];

/* ─── Shared ecosystem section ─── */
const ecosystemPoints = [
  { label: 'One Account Everywhere', desc: 'Same Google SSO login across MohnMenu, MohnSters, NeighborTechs, and all Mohn Empire platforms.' },
  { label: 'One Point Balance', desc: 'Points earned at any business, in any game mode, on any platform — all go to the same balance.' },
  { label: 'One Companion', desc: 'Your MohnSter travels with you across every platform. Feed it from a restaurant, battle at a bar, heal at a church.' },
  { label: 'One Economy', desc: 'Spend points anywhere in the ecosystem. Earn from a coffee shop, spend on creature evolution. It all connects.' },
];

export default function MohnStersCommunityPage() {
  return (
    <div className="min-h-screen bg-[#050507] text-white relative overflow-hidden">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-[180px]" />
      </div>

      {/* Hero */}
      <section className="relative pt-36 pb-20 px-4 z-10">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2 mb-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-sm font-black uppercase tracking-widest text-indigo-400"
          >
            <FaUsers /> Community & Faith
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-black mb-6 tracking-tighter"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Every Community.{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              In The Game.
            </span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Churches become Sanctuaries. Concerts spawn rare creatures. Shops become 3D storefronts. 
            Bars become battle hubs. <strong className="text-white">Every local business type has a unique role in the MohnSters world.</strong>
          </motion.p>
        </div>
      </section>

      {/* Business type sections */}
      {communityTypes.map((biz, sectionIdx) => (
        <section key={biz.id} className="relative py-24 px-4 z-10 border-t border-white/[0.04]">
          <div className="container mx-auto max-w-6xl">
            {/* Section header */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-12">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${biz.gradient} flex items-center justify-center shadow-lg text-white text-2xl shrink-0`}>
                <biz.icon />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1">{biz.subtitle}</div>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">{biz.title}</h2>
                <p className="text-zinc-500 mt-1">{biz.tagline}</p>
              </div>
            </div>

            {/* Feature cards */}
            <div className={`grid grid-cols-1 ${biz.features.length > 4 ? 'md:grid-cols-3 lg:grid-cols-5' : 'md:grid-cols-2 lg:grid-cols-4'} gap-4`}>
              {biz.features.map((feat, i) => (
                <motion.div
                  key={feat.title}
                  className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:border-purple-500/20 transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${biz.gradient} flex items-center justify-center text-white mb-3 shadow-lg`}>
                    <feat.icon className="text-sm" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2">{feat.title}</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">{feat.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Callout */}
            <motion.div
              className={`mt-8 bg-${biz.glowColor}-500/5 border border-${biz.glowColor}-500/10 rounded-xl px-6 py-4`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              style={{
                backgroundColor: `color-mix(in srgb, var(--color-${biz.glowColor}-500, #6366f1) 5%, transparent)`,
                borderColor: `color-mix(in srgb, var(--color-${biz.glowColor}-500, #6366f1) 10%, transparent)`,
              }}
            >
              <p className="text-sm text-zinc-400 leading-relaxed">
                💡 <strong className="text-white">Why it works:</strong> {biz.callout}
              </p>
            </motion.div>
          </div>
        </section>
      ))}

      {/* Cross-platform ecosystem */}
      <section className="relative py-24 px-4 z-10 border-t border-white/[0.04]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-purple-400 font-black uppercase tracking-widest text-xs mb-3 block">One Ecosystem</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Everything connects.</h2>
            <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
              MohnSters isn&apos;t a separate app — it&apos;s the game layer that sits on top of every Mohn Empire platform. 
              One login, one point balance, one companion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ecosystemPoints.map((item, i) => (
              <motion.div
                key={item.label}
                className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 hover:border-purple-500/20 transition-all"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
              >
                <h4 className="text-sm font-bold text-purple-400 mb-2">{item.label}</h4>
                <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Points summary table */}
      <section className="relative py-24 px-4 z-10 border-t border-white/[0.04]">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <span className="text-amber-400 font-black uppercase tracking-widest text-xs mb-3 block">Quick Reference</span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Points at a glance.</h2>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 gap-0 text-xs font-black uppercase tracking-widest text-zinc-500 border-b border-white/[0.06] px-6 py-3">
              <div>Action</div>
              <div className="text-center">Points</div>
              <div className="text-right">Business Type</div>
            </div>
            {[
              { action: 'Check in at church', pts: '25', biz: 'Churches' },
              { action: 'Attend church event', pts: '100 – 1,000', biz: 'Churches' },
              { action: '30-visit streak', pts: 'Guardian evolution', biz: 'Churches' },
              { action: 'Concert GPS check-in', pts: 'Rare creature spawn', biz: 'Music Artists' },
              { action: 'Listen to music', pts: 'Social + points', biz: 'Music Artists' },
              { action: 'Buy merch', pts: 'In-game cosmetic', biz: 'Music Artists' },
              { action: 'Visit retail store', pts: '10 – 50', biz: 'Retail Shops' },
              { action: 'Near partnered store', pts: 'Loot drop chance', biz: 'Retail Shops' },
              { action: 'Bar check-in', pts: 'Social need filled', biz: 'Bars & Nightlife' },
              { action: 'Bar event night', pts: '100 – 1,000', biz: 'Bars & Nightlife' },
              { action: 'Order coffee', pts: '+10% SPD (4h)', biz: 'Coffee Shops' },
              { action: 'Peer delivery carry', pts: '$1 – $3 off order', biz: 'Coffee Shops' },
            ].map((row, i) => (
              <div key={i} className={`grid grid-cols-3 gap-0 px-6 py-3 text-sm ${i % 2 === 0 ? 'bg-white/[0.01]' : ''} border-b border-white/[0.03] last:border-0`}>
                <div className="text-zinc-300">{row.action}</div>
                <div className="text-center text-purple-400 font-bold">{row.pts}</div>
                <div className="text-right text-zinc-500">{row.biz}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-4 z-10 border-t border-white/[0.04]">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
            Your community.{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">Their adventure.</span>
          </h2>
          <p className="text-zinc-500 text-lg mb-10 max-w-xl mx-auto">
            Whether you run a church, a bar, a boutique, or a band — MohnSters gives your community a reason 
            to show up, interact, and come back. Every visit matters.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-full font-bold flex items-center gap-3 hover:shadow-xl hover:shadow-purple-500/20 transition-all">
              Get Your Business In The Game <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/mohnsters" className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full font-bold hover:bg-white/10 transition-all">
              ← Game Overview
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
