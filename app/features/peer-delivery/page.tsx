'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaArrowRight, FaBicycle, FaPercent, FaMapMarkerAlt, FaShieldAlt,
  FaUsers, FaClock, FaStar, FaMobileAlt, FaHandshake, FaCheck,
  FaMoneyBillWave, FaRoute, FaCamera
} from 'react-icons/fa';
import FloatingStoreIcons from '@/components/FloatingStoreIcons';

interface StepProps { num: string; title: string; desc: string; delay: number; }
const Step = ({ num, title, desc, delay }: StepProps) => (
  <motion.div className="flex gap-6" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay }}>
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">{num}</div>
    <div>
      <h4 className="text-lg font-bold text-black mb-1">{title}</h4>
      <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
    </div>
  </motion.div>
);

export default function PeerDeliveryPage() {
  return (
    <div className="min-h-screen bg-white/90 relative">
      <FloatingStoreIcons storeType="default" count={16} position="fixed" />

      {/* Hero */}
      <section className="pt-36 pb-20 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-black uppercase tracking-widest text-emerald-700"
          >Peer Delivery</motion.div>
          <motion.h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter text-zinc-900 text-balance" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            Customers deliver for each other<span className="text-emerald-600">.</span>
          </motion.h1>
          <motion.p className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium max-w-3xl mx-auto mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            A customer heading to the office picks up a co-worker&apos;s order on the way — and earns a discount. More orders out the door, lower delivery costs, zero DoorDash fees.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="group px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full font-bold text-lg flex items-center gap-3 hover:shadow-xl hover:shadow-emerald-500/20 transition-all">
              Enable Peer Delivery <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/pricing" className="px-10 py-5 bg-white text-black border-2 border-zinc-200 rounded-full font-bold text-lg hover:border-black transition-all">
              View Pricing
            </Link>
          </motion.div>
        </div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-100 rounded-full blur-[120px] opacity-30" />
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-zinc-50/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-emerald-700 font-black uppercase tracking-widest text-xs mb-3 block">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Simple for everyone.</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Customers opt-in to carry nearby orders when they&apos;re already heading that direction. Everyone wins.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', icon: FaMobileAlt, title: 'Customer Orders', desc: 'A customer places an order for pickup or delivery at your shop — business as usual.' },
              { step: '02', icon: FaRoute, title: 'Carrier Matched', desc: 'Another customer heading the same direction sees the delivery opportunity and opts in.' },
              { step: '03', icon: FaBicycle, title: 'Pickup & Deliver', desc: 'Carrier picks up both orders, delivers the peer order on their way, and confirms with a photo.' },
              { step: '04', icon: FaPercent, title: 'Everyone Wins', desc: 'Carrier gets $1-$3 off their own order. Recipient gets fast delivery. You get more sales.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="text-[80px] font-black text-zinc-100 absolute -top-6 -left-2 select-none">{item.step}</div>
                <div className="relative bg-white border border-zinc-100 p-8 rounded-3xl hover:shadow-xl hover:border-zinc-300 transition-all h-full">
                  <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                    <item.icon className="text-emerald-700 text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-emerald-700 font-black uppercase tracking-widest text-xs mb-3 block">Why Peer Delivery</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Better than DoorDash. For everyone.</h2>
          </div>

          {/* Three columns: Business, Carrier, Customer */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Business Owner */}
            <motion.div className="bg-white rounded-3xl border border-zinc-100 p-8 hover:shadow-xl transition-all" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                <FaMoneyBillWave className="text-amber-700 text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-4">For Business Owners</h3>
              <div className="space-y-3">
                {[
                  'No 30% DoorDash / Uber Eats fees',
                  'More orders out the door',
                  'No need to hire delivery drivers',
                  'Customers become your delivery fleet',
                  'Lower delivery fees attract more orders',
                  'Toggle on/off from your dashboard',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-zinc-500">
                    <FaCheck className="text-emerald-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Carrier */}
            <motion.div className="bg-white rounded-3xl border border-zinc-100 p-8 hover:shadow-xl transition-all" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                <FaBicycle className="text-emerald-700 text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-4">For Carriers</h3>
              <div className="space-y-3">
                {[
                  'Earn $1-$3 off your own order',
                  'No application or background check',
                  'Carry orders you\'re already passing',
                  'Help your neighbors and co-workers',
                  'Build reputation with ratings',
                  'No vehicle requirements — walk, bike, drive',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-zinc-500">
                    <FaCheck className="text-emerald-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Receiving Customer */}
            <motion.div className="bg-white rounded-3xl border border-zinc-100 p-8 hover:shadow-xl transition-all" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <FaUsers className="text-blue-700 text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-4">For Customers</h3>
              <div className="space-y-3">
                {[
                  'Cheaper delivery fees than any app',
                  'Faster delivery — carrier is already nearby',
                  'Support local instead of big tech',
                  'Track your order in real-time',
                  'Photo confirmation on delivery',
                  'Rate your carrier for accountability',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-zinc-500">
                    <FaCheck className="text-blue-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Safety & Trust */}
      <section className="py-24 px-4 bg-zinc-950 text-white rounded-[3rem] mx-4 mb-6 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <span className="text-emerald-400 font-black uppercase tracking-widest text-xs mb-3 block">Safety & Trust</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Every delivery is tracked and verified.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FaCamera, title: 'Photo Proof', desc: 'Carrier snaps a delivery photo. Customer and business can verify the handoff.' },
              { icon: FaMapMarkerAlt, title: 'GPS Tracking', desc: 'Real-time location tracking from pickup to delivery. Everyone sees where the order is.' },
              { icon: FaStar, title: 'Rating System', desc: 'Carriers and customers rate each other. Low ratings get flagged. Trust is earned.' },
              { icon: FaShieldAlt, title: 'Order Insurance', desc: 'If something goes wrong, the business can issue a refund. Full protection built in.' },
            ].map((item, i) => (
              <motion.div key={i} className="bg-zinc-900/60 p-8 rounded-3xl border border-zinc-800" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <item.icon className="text-2xl text-emerald-400 mb-4" />
                <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-emerald-600/10 blur-[150px] rounded-full" />
      </section>

      {/* Setup Steps */}
      <section className="py-24 px-4 bg-zinc-50 rounded-[3rem] mx-4 mb-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <span className="text-emerald-700 font-black uppercase tracking-widest text-xs mb-3 block">Setup</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Enable in 60 seconds.</h2>
          </div>
          <div className="space-y-10">
            <Step num="1" title="Go to Settings → Delivery" desc="In your owner dashboard, navigate to Settings and find the Peer Delivery section." delay={0.1} />
            <Step num="2" title="Toggle on Peer Delivery" desc="Enable the feature with one click. Set the carrier discount amount ($1-$3 is recommended)." delay={0.2} />
            <Step num="3" title="Set maximum distance" desc="Choose how far peer deliveries can go — 1 mile, 2 miles, or 5 miles. Start small." delay={0.3} />
            <Step num="4" title="Customers see the option" desc="When a customer orders delivery, nearby pickup customers see the opportunity and can opt in." delay={0.4} />
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <span className="text-emerald-700 font-black uppercase tracking-widest text-xs mb-3 block">Compare</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Peer delivery vs. the apps.</h2>
          </div>
          <div className="bg-white rounded-3xl border border-zinc-100 overflow-hidden">
            <div className="grid grid-cols-3 text-center border-b border-zinc-100">
              <div className="p-4 font-bold text-sm text-zinc-400"></div>
              <div className="p-4 font-bold text-sm bg-emerald-50 text-emerald-700">MohnMenu Peer</div>
              <div className="p-4 font-bold text-sm text-zinc-500">DoorDash/Uber</div>
            </div>
            {[
              { label: 'Commission', peer: '$0', app: '15-30%' },
              { label: 'Delivery Fee', peer: '$0-$2', app: '$3-$8' },
              { label: 'Driver Requirement', peer: 'None', app: 'Background check' },
              { label: 'Carrier Benefit', peer: '$1-$3 discount', app: 'Gig wage' },
              { label: 'Customer Data', peer: 'You own it', app: 'They own it' },
              { label: 'Setup Time', peer: '60 seconds', app: 'Weeks' },
            ].map((row, i) => (
              <div key={i} className={`grid grid-cols-3 text-center text-sm ${i < 5 ? 'border-b border-zinc-50' : ''}`}>
                <div className="p-4 font-bold text-zinc-600 text-left pl-6">{row.label}</div>
                <div className="p-4 bg-emerald-50/50 font-bold text-emerald-700">{row.peer}</div>
                <div className="p-4 text-zinc-400">{row.app}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl bg-gradient-to-r from-emerald-500 to-teal-600 rounded-[3rem] p-10 md:p-16 text-white shadow-2xl text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Delivery without DoorDash.</h2>
          <p className="text-emerald-100 text-lg mb-10 max-w-xl mx-auto">Enable peer delivery today. Your customers become your delivery network — and everyone saves money.</p>
          <Link href="/register" className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-emerald-700 rounded-full font-bold text-lg hover:bg-emerald-50 transition-all">
            Get Started Free <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
