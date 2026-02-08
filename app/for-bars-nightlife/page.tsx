'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaGlassCheers, FaArrowRight, FaCreditCard, FaBitcoin, FaMobileAlt,
  FaShieldAlt, FaMusic, FaCalendarAlt, FaUsers, FaClock,
  FaListAlt, FaPercent, FaConciergeBell, FaStar, FaChair
} from 'react-icons/fa';

interface FeatureCardProps { icon: any; title: string; description: string; delay: number; }
const FeatureCard = ({ icon: Icon, title, description, delay }: FeatureCardProps) => (
  <motion.div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 flex flex-col items-start text-left group hover:border-zinc-300 hover:shadow-xl transition-all duration-500"
    initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay }}>
    <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-gradient-to-br group-hover:from-purple-500 group-hover:to-violet-600 group-hover:text-white transition-all duration-500 shadow-sm">
      <Icon className="text-2xl" />
    </div>
    <h4 className="text-xl font-bold text-black mb-3">{title}</h4>
    <p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

interface StepProps { num: string; title: string; desc: string; delay: number; }
const Step = ({ num, title, desc, delay }: StepProps) => (
  <motion.div className="flex gap-6" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay }}>
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">{num}</div>
    <div>
      <h4 className="text-lg font-bold text-black mb-1">{title}</h4>
      <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
    </div>
  </motion.div>
);

export default function ForBarsNightlife() {
  return (
    <div className="min-h-screen bg-white/90">
      <section className="pt-36 pb-20 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-purple-50 border border-purple-100 text-xs font-black uppercase tracking-widest text-purple-600"
          >For Bars &amp; Nightlife</motion.div>
          <motion.h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter text-zinc-900 text-balance" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            Pour. Pay. Party<span className="text-purple-600">.</span>
          </motion.h1>
          <motion.p className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium max-w-3xl mx-auto mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            Bars, breweries, pubs, and nightclubs — let customers order from their table, skip the bar line, and pay instantly. Tab management, drink menus, and kitchen orders — all in one platform.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="group px-10 py-5 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-full font-bold text-lg flex items-center gap-3 hover:shadow-xl hover:shadow-purple-500/20 transition-all">
              Start Free Today <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/pricing" className="px-10 py-5 bg-white text-black border-2 border-zinc-200 rounded-full font-bold text-lg hover:border-black transition-all">
              View Pricing
            </Link>
          </motion.div>
        </div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-100 rounded-full blur-[120px] opacity-30" />
      </section>

      <section className="py-24 px-4 bg-zinc-50/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-purple-600 font-black uppercase tracking-widest text-xs mb-3 block">Core Platform</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">The modern bar experience.</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Customers scan a QR at their table, order drinks and food, and pay — without flagging down a bartender.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={FaMobileAlt} title="QR Table Ordering" description="Place QR codes on every table. Customers scan, browse your full drink and food menu, and order instantly. No app needed." delay={0.05} />
            <FeatureCard icon={FaListAlt} title="Drink & Food Menu" description="Full digital menu with cocktails, beer, wine, and kitchen items. Add modifiers, descriptions, and photos that sell." delay={0.1} />
            <FeatureCard icon={FaCreditCard} title="Instant Payments" description="Apple Pay, Google Pay, and all cards. Close out in seconds — no more waiting for the check or splitting bills manually." delay={0.15} />
            <FeatureCard icon={FaBitcoin} title="Crypto Payments" description="Accept Bitcoin via Cash App QR and 7 other cryptocurrencies. The crypto crowd loves this — differentiate your bar." delay={0.2} />
            <FeatureCard icon={FaCalendarAlt} title="Event & Happy Hour" description="Schedule happy hour pricing, create event-specific menus, and promote specials — all from your dashboard." delay={0.25} />
            <FeatureCard icon={FaShieldAlt} title="Fraud Protection" description="Automatic chargeback coverage on every digital transaction. No tab-walkers, no stolen card worries." delay={0.3} />
          </div>
        </div>
      </section>

      {/* Reservations & VIP Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-purple-600 font-black uppercase tracking-widest text-xs mb-3 block">Reservations & VIP</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Tables. Bottles. VIP.</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Let customers book tables, reserve VIP sections, and request bottle service — directly from your page. No OpenTable fees.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={FaCalendarAlt} title="Table Reservations" description="Customers pick their date, time, and party size. You confirm with one click. Zero per-diner fees — unlike OpenTable's $1.50/guest." delay={0.05} />
            <FeatureCard icon={FaStar} title="VIP Experiences" description="Flag VIP reservations for priority treatment. Track birthdays, bachelor parties, corporate events, and bottle service requests." delay={0.1} />
            <FeatureCard icon={FaConciergeBell} title="Seating Preferences" description="Indoor, outdoor, bar seating, or private rooms. Customers choose — you manage capacity and layout." delay={0.15} />
            <FeatureCard icon={FaUsers} title="Party Management" description="Handle parties from 1 to 20+. Large group bookings with special requests and occasion tracking built in." delay={0.2} />
            <FeatureCard icon={FaClock} title="Waitlist & Status" description="Track every reservation: pending → confirmed → seated → completed. Mark no-shows and build history." delay={0.25} />
            <FeatureCard icon={FaChair} title="Bottle Service" description="Accept bottle service reservations with minimum spend requirements. Upsell premium packages directly online." delay={0.3} />
          </div>
          <div className="text-center mt-10">
            <Link href="/features/reservations" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-full font-bold text-lg hover:shadow-xl hover:shadow-purple-500/20 transition-all">
              Learn About Reservations <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-zinc-950 text-white rounded-[3rem] mx-4 mb-6 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <span className="text-purple-400 font-black uppercase tracking-widest text-xs mb-3 block">Built for Nightlife</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Why bars choose MohnMenu.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FaClock, title: 'Faster Service', desc: 'Customers order from their phone. Your bartenders pour — no more shouting over music.' },
              { icon: FaGlassCheers, title: 'Higher Tabs', desc: 'Digital menus increase average spend 20-30%. Customers see every option and add more.' },
              { icon: FaPercent, title: 'Zero Commission', desc: 'Unlike Toast or Square, we never take a percentage of your sales. Flat pricing only.' },
              { icon: FaUsers, title: 'Repeat Customers', desc: 'Order history, favorites, and loyalty points bring regulars back — and they order more.' },
            ].map((item, i) => (
              <motion.div key={i} className="bg-zinc-900/60 p-8 rounded-3xl border border-zinc-800" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <item.icon className="text-2xl text-purple-400 mb-4" />
                <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-purple-600/10 blur-[150px] rounded-full" />
      </section>

      <section className="py-24 px-4 bg-zinc-50 rounded-[3rem] mx-4 mb-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <span className="text-purple-600 font-black uppercase tracking-widest text-xs mb-3 block">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Running before happy hour.</h2>
          </div>
          <div className="space-y-10">
            <Step num="1" title="Create your bar profile" desc="Sign up free. Add your bar name, logo, and hours. Your branded ordering page generates instantly." delay={0.1} />
            <Step num="2" title="Build your drink menu" desc="Add cocktails, beer, wine, and food with photos, prices, and descriptions. Create happy hour and event menus." delay={0.2} />
            <Step num="3" title="Connect payments" desc="Link Stripe for cards. Enable crypto. Toggle cash. All payment methods ready in minutes." delay={0.3} />
            <Step num="4" title="Place QR codes" desc="Print QR codes for every table, the bar top, and your entrance. Customers scan and order — no app download." delay={0.4} />
            <Step num="5" title="Serve and grow" desc="Orders appear on your KDS screen. Track what sells, spot trends, and upsell your way to higher revenue." delay={0.5} />
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl bg-gradient-to-r from-purple-500 to-violet-600 rounded-[3rem] p-10 md:p-16 text-white shadow-2xl text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Your bar. Zero commission. Full control.</h2>
          <p className="text-purple-100 text-lg mb-10 max-w-xl mx-auto">Start free tonight. No credit card. No contract. Just better bar operations.</p>
          <Link href="/register" className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-purple-700 rounded-full font-bold text-lg hover:bg-purple-50 transition-all">
            Get Started Free <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
