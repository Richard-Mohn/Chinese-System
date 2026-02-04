'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { FaCheck, FaTimes, FaMinus } from 'react-icons/fa';

interface ComparisonRowProps {
  feature: string;
  locl: string;
  competitors: string;
  delay: number;
}

const ComparisonRow = ({ feature, locl, competitors, delay }: ComparisonRowProps) => (
  <motion.div 
    className="grid grid-cols-1 md:grid-cols-3 gap-4 py-8 border-b border-zinc-50 items-center"
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
  >
    <div className="text-xl font-bold text-zinc-900">{feature}</div>
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
        <FaCheck className="text-sm" />
      </div>
      <span className="font-bold text-black">{locl}</span>
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
    <div className="min-h-screen bg-transparent">
      {/* Hero Section */}
      <section className="pt-40 pb-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.h1 
            className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-zinc-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            The Difference<span className="text-indigo-600">.</span>
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            We don't just compete with the giants. We make them obsolete.
          </motion.p>
        </div>
      </section>

      {/* Comparison Grid */}
      <section className="py-24 px-4 bg-white/80 backdrop-blur-md rounded-[3rem] shadow-[0_-20px_80px_rgba(0,0,0,0.02)] border-t border-zinc-100">
        <div className="container mx-auto max-w-5xl">
          <div className="hidden md:grid grid-cols-3 gap-4 pb-12 border-b-2 border-zinc-900 mb-8 items-end">
            <div className="text-sm font-black uppercase tracking-widest text-zinc-400">Features</div>
            <div className="text-3xl font-black text-black">LOCL</div>
            <div className="text-sm font-black uppercase tracking-widest text-zinc-400 italic">Others (DoorDash, etc.)</div>
          </div>

          <div className="space-y-2">
            <ComparisonRow 
              feature="Commission Per Order"
              locl="$0 (Zero)"
              competitors="30% + Fees"
              delay={0.1}
            />
            <ComparisonRow 
              feature="Customer Data Ownership"
              locl="100% Yours"
              competitors="They own it"
              delay={0.2}
            />
            <ComparisonRow 
              feature="Live Delivery Tracking"
              locl="Sub-second GPS"
              competitors="Approximate / Delayed"
              delay={0.3}
            />
            <ComparisonRow 
              feature="Kitchen Transparency"
              locl="Live Chef Cam"
              competitors="Not Available"
              delay={0.4}
            />
            <ComparisonRow 
              feature="Direct Marketing"
              locl="Email & SMS Suite"
              competitors="Prohibited"
              delay={0.5}
            />
            <ComparisonRow 
              feature="Payment Settlement"
              locl="Instant / Daily"
              competitors="Weekly / Bi-weekly"
              delay={0.6}
            />
          </div>

          <motion.div 
            className="mt-20 p-12 rounded-[2.5rem] bg-zinc-900 text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div>
              <h3 className="text-3xl font-bold mb-2">Ready to save your margins?</h3>
              <p className="text-zinc-400 font-medium text-lg">Stop paying for what you've already earned.</p>
            </div>
            <Link href="/register" className="px-10 py-5 bg-white text-black rounded-full font-black text-lg hover:bg-zinc-100 transition-all active:scale-95 whitespace-nowrap">
              Start Your Trial
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}