'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { FaCheck, FaTimes, FaMinus, FaArrowRight } from 'react-icons/fa';

interface ComparisonRowProps {
  feature: string;
  mohn: string;
  competitors: string;
  delay: number;
}

const ComparisonRow = ({ feature, mohn, competitors, delay }: ComparisonRowProps) => (
  <motion.div
    className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 border-b border-zinc-50 items-center"
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay }}
  >
    <div className="text-lg font-bold text-zinc-900">{feature}</div>
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
        <FaCheck className="text-sm" />
      </div>
      <span className="font-bold text-black">{mohn}</span>
    </div>
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-400">
        <FaTimes className="text-sm" />
      </div>
      <span className="font-medium text-zinc-400">{competitors}</span>
    </div>
  </motion.div>
);

export default function Comparison() {
  return (
    <div className="min-h-screen bg-white/90">
      {/* Hero Section */}
      <section className="pt-36 pb-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-orange-50 border border-orange-100 text-xs font-black uppercase tracking-widest text-orange-600"
          >Side-by-Side</motion.div>
          <motion.h1
            className="text-5xl md:text-8xl font-black mb-6 tracking-tighter text-zinc-900 text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            The Difference<span className="text-orange-500">.</span>
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            We don&apos;t just compete with the giants. We make them obsolete.
          </motion.p>
          <motion.p
            className="text-sm md:text-base text-zinc-400 leading-relaxed font-medium max-w-3xl mx-auto mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Your existing Uber Eats and DoorDash listings can stay live. Starting a MohnMenu trial does not change or disconnect those marketplace storefronts.
          </motion.p>
        </div>
      </section>

      {/* Comparison Grid */}
      <section className="py-24 px-4 bg-zinc-50/50 rounded-[3rem] mx-4 mb-6">
        <div className="container mx-auto max-w-5xl">
          <div className="hidden md:grid grid-cols-3 gap-4 pb-8 border-b-2 border-zinc-900 mb-6 items-end">
            <div className="text-sm font-black uppercase tracking-widest text-zinc-400">Features</div>
            <div className="text-3xl font-black bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">MohnMenu</div>
            <div className="text-sm font-black uppercase tracking-widest text-zinc-400 italic">Others (DoorDash, etc.)</div>
          </div>

          <div className="space-y-1">
            <ComparisonRow feature="Commission Per Order" mohn="$0 (Zero)" competitors="30% + Fees" delay={0.05} />
            <ComparisonRow feature="Customer Data Ownership" mohn="100% Yours" competitors="They own it" delay={0.1} />
            <ComparisonRow feature="Live Delivery Tracking" mohn="Sub-second GPS" competitors="Approximate / Delayed" delay={0.15} />
            <ComparisonRow feature="Kitchen Transparency" mohn="Live Chef Cam" competitors="Not Available" delay={0.2} />
            <ComparisonRow feature="Direct Marketing" mohn="Email & SMS Suite" competitors="Prohibited" delay={0.25} />
            <ComparisonRow feature="Order with Google" mohn="Full Integration" competitors="Limited / Add-on" delay={0.3} />
            <ComparisonRow feature="Fraud Protection" mohn="Zero-Cost Coverage" competitors="Extra Fee / No" delay={0.35} />
            <ComparisonRow feature="Payment Settlement" mohn="Instant / Daily" competitors="Weekly / Bi-weekly" delay={0.4} />
            <ComparisonRow feature="Crypto Payments" mohn="BTC, ETH, LTC & more" competitors="Not Available" delay={0.45} />
            <ComparisonRow feature="Cash Option" mohn="Toggle On/Off" competitors="Not Available" delay={0.5} />
            <ComparisonRow feature="White-Label Branding" mohn="Your brand, your domain" competitors="Their branding" delay={0.55} />
          </div>

          <motion.div
            className="mt-16 p-10 md:p-12 rounded-3xl bg-zinc-950 text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-2">Ready to save your margins?</h3>
              <p className="text-zinc-400 font-medium text-lg">Stop paying for what you&apos;ve already earned.</p>
            </div>
            <Link href="/register" className="relative z-10 inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-bold text-lg hover:shadow-xl hover:shadow-orange-500/20 transition-all active:scale-95 whitespace-nowrap">
              Start Free Today <FaArrowRight />
            </Link>
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-linear-to-t from-orange-600/10 to-transparent blur-3xl pointer-events-none" />
          </motion.div>
        </div>
      </section>
    </div>
  );
}