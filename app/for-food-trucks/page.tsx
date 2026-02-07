'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaTruck, FaArrowRight, FaCreditCard, FaBitcoin, FaMobileAlt,
  FaShieldAlt, FaMapMarkerAlt, FaCalendarAlt, FaInstagram,
  FaFire, FaMusic, FaClock
} from 'react-icons/fa';

interface FeatureCardProps { icon: any; title: string; description: string; delay: number; }
const FeatureCard = ({ icon: Icon, title, description, delay }: FeatureCardProps) => (
  <motion.div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 flex flex-col items-start text-left group hover:border-zinc-300 hover:shadow-xl transition-all duration-500"
    initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay }}>
    <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-gradient-to-br group-hover:from-yellow-500 group-hover:to-orange-600 group-hover:text-white transition-all duration-500 shadow-sm">
      <Icon className="text-2xl" />
    </div>
    <h4 className="text-xl font-bold text-black mb-3">{title}</h4>
    <p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

interface StepProps { num: string; title: string; desc: string; delay: number; }
const Step = ({ num, title, desc, delay }: StepProps) => (
  <motion.div className="flex gap-6" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay }}>
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-lg shadow-yellow-500/20">{num}</div>
    <div>
      <h4 className="text-lg font-bold text-black mb-1">{title}</h4>
      <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
    </div>
  </motion.div>
);

export default function ForFoodTrucks() {
  return (
    <div className="min-h-screen bg-white/90">
      <section className="pt-36 pb-20 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-yellow-50 border border-yellow-100 text-xs font-black uppercase tracking-widest text-yellow-700"
          >For Food Trucks &amp; Pop-Ups</motion.div>
          <motion.h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter text-zinc-900 text-balance" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            Roll Up. Sell Out<span className="text-yellow-600">.</span>
          </motion.h1>
          <motion.p className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium max-w-3xl mx-auto mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            Skip the line. Customers order from their phone before they even reach your window. QR code ordering, mobile payments, and real-time GPS so fans always know where you&apos;re parked.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="group px-10 py-5 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-full font-bold text-lg flex items-center gap-3 hover:shadow-xl hover:shadow-yellow-500/20 transition-all">
              Start Free Today <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/pricing" className="px-10 py-5 bg-white text-black border-2 border-zinc-200 rounded-full font-bold text-lg hover:border-black transition-all">
              View Pricing
            </Link>
          </motion.div>
        </div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-100 rounded-full blur-[120px] opacity-30" />
      </section>

      <section className="py-24 px-4 bg-zinc-50/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-yellow-600 font-black uppercase tracking-widest text-xs mb-3 block">Built for Mobile</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Everything a food truck needs. Nothing it doesn&apos;t.</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Small operation, big capability. Run your entire business from your phone.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={FaMobileAlt} title="QR Code Menu" description="Customers scan your QR and browse your full menu on their phone. No app download, no waiting in line. Order and pay before they reach your window." delay={0.05} />
            <FeatureCard icon={FaMapMarkerAlt} title="GPS Location Sharing" description="Share your live location with customers. They'll always know where you're parked — whether it's a festival, office park, or street corner." delay={0.1} />
            <FeatureCard icon={FaCalendarAlt} title="Schedule & Events" description="Post your weekly schedule, announce pop-up locations, and let customers follow you to their favorite spots." delay={0.15} />
            <FeatureCard icon={FaCreditCard} title="Instant Card Payments" description="Apple Pay, Google Pay, and all major cards via Stripe. Funds settle directly to your bank — no middleman POS fees." delay={0.2} />
            <FeatureCard icon={FaBitcoin} title="Crypto Payments" description="Accept Bitcoin via Cash App QR, plus ETH, SOL, and 5 more. Zero fees, instant settlement. Perfect for the crypto-native crowd." delay={0.25} />
            <FeatureCard icon={FaShieldAlt} title="Fraud Protection" description="Automatic chargeback coverage on every digital transaction. No extra cost, no paperwork." delay={0.3} />
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-zinc-950 text-white rounded-[3rem] mx-4 mb-6 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <span className="text-yellow-400 font-black uppercase tracking-widest text-xs mb-3 block">Built for the Road</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Why food trucks love MohnMenu.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FaClock, title: 'Skip the Line', desc: 'Customers order ahead and pick up at your window. No crowd, no chaos, no lost sales.' },
              { icon: FaFire, title: 'Festival Ready', desc: 'Handle the lunch rush at any event. QR codes scale infinitely — no extra hardware needed.' },
              { icon: FaInstagram, title: 'Social Built-In', desc: 'Your ordering link works perfectly in Instagram bio, TikTok, and Twitter. Drive followers to orders.' },
              { icon: FaMusic, title: 'Event Mode', desc: 'Switch to a simplified event menu with one tap. Bigger items, faster turnaround, higher tickets.' },
            ].map((item, i) => (
              <motion.div key={i} className="bg-zinc-900/60 p-8 rounded-3xl border border-zinc-800" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <item.icon className="text-2xl text-yellow-400 mb-4" />
                <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-yellow-600/10 blur-[150px] rounded-full" />
      </section>

      <section className="py-24 px-4 bg-zinc-50 rounded-[3rem] mx-4 mb-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <span className="text-yellow-600 font-black uppercase tracking-widest text-xs mb-3 block">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Set up between stops.</h2>
          </div>
          <div className="space-y-10">
            <Step num="1" title="Create your truck profile" desc="Sign up, name your truck, upload your logo. Your branded ordering page is ready in minutes. No website needed." delay={0.1} />
            <Step num="2" title="Build your menu" desc="Add items with photos, prices, and modifiers. Create event-specific menus. Update on the fly from your phone." delay={0.2} />
            <Step num="3" title="Connect payments" desc="Link Stripe for cards. Toggle crypto. Enable cash. All payment methods in one place — no extra POS hardware." delay={0.3} />
            <Step num="4" title="Print your QR & share" desc="Tape the QR to your truck window. Post the link on social media. Customers start ordering before you even open the window." delay={0.4} />
            <Step num="5" title="Serve and scale" desc="Track orders in real-time. See your top sellers. When you add a second truck, manage everything from one dashboard." delay={0.5} />
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl bg-gradient-to-r from-yellow-500 to-orange-600 rounded-[3rem] p-10 md:p-16 text-white shadow-2xl text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Your truck. Your orders. Your money.</h2>
          <p className="text-yellow-100 text-lg mb-10 max-w-xl mx-auto">No commission. No contracts. Start free and sell everywhere you park.</p>
          <Link href="/register" className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-yellow-700 rounded-full font-bold text-lg hover:bg-yellow-50 transition-all">
            Get Started Free <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
