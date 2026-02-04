'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { FaQrcode, FaCoffee, FaBeer, FaBolt, FaMobileAlt, FaPercent, FaArrowRight } from 'react-icons/fa';

interface FeatureCardProps {
  icon: any;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard = ({ icon: Icon, title, description, delay }: FeatureCardProps) => (
  <motion.div
    className="bg-white p-10 rounded-[3rem] shadow-[0_10px_50px_rgba(0,0,0,0.03)] border border-zinc-100 flex flex-col items-start text-left group hover:border-zinc-300 transition-all duration-500"
    initial={{ y: 20, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
  >
    <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors duration-500">
      <Icon className="text-2xl" />
    </div>
    <h4 className="text-xl font-bold text-black mb-3">{title}</h4>
    <p className="text-zinc-500 text-sm leading-relaxed font-medium">{description}</p>
  </motion.div>
);

export default function ForConvenienceStores() {
  return (
    <div className="min-h-screen bg-transparent">
      {/* Hero Section */}
      <section className="pt-40 pb-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-50 border border-blue-100 text-xs font-black uppercase tracking-widest text-blue-600"
          >
            For Modern Retail
          </motion.div>
          <motion.h1 
            className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-zinc-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Grab and Go<span className="text-blue-600">.</span>
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium max-w-3xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Your margins are already tight. Don't lose 30% to delivery apps. Enable QR-based ordering and keep what's yours.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center"
          >
            <Link href="/register" className="group px-10 py-5 bg-black text-white rounded-full font-bold text-lg flex items-center gap-3 hover:bg-zinc-800 transition-all shadow-xl">
              Launch Your Store
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-32 px-4 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Retail Efficiency, Redefined</h2>
            <p className="text-zinc-500 font-medium">Built for speed, volume, and absolute convenience.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={FaQrcode}
              title="QR Ordering"
              description="Eliminate lines. Customers scan items or menus and pay directly from their phone."
              delay={0.1}
            />
            <FeatureCard 
              icon={FaCoffee}
              title="Hot Bar Pre-order"
              description="Let customers order coffee or hot food while they're en route. Fresh and ready on arrival."
              delay={0.2}
            />
            <FeatureCard 
              icon={FaBolt}
              title="Instant Checkout"
              description="Zero friction payments. Apple Pay and Google Pay integrated for sub-3 second transactions."
              delay={0.3}
            />
            <FeatureCard 
              icon={FaPercent}
              title="Margin Protection"
              description="Stop paying predatory delivery fees. We charge a flat monthly rate, not a percentage of your sales."
              delay={0.4}
            />
            <FeatureCard 
              icon={FaMobileAlt}
              title="Live Inventory"
              description="Sync your stock levels in real-time. Avoid customer frustration with instant availability updates."
              delay={0.5}
            />
            <FeatureCard 
              icon={FaBeer}
              title="Compliance Ready"
              description="Built-in age verification prompts and secure logs for controlled items."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* ROI Proof */}
      <section className="py-32 px-4">
        <div className="container mx-auto max-w-4xl bg-zinc-900 rounded-[4rem] p-12 md:p-20 text-white shadow-2xl relative overflow-hidden text-center">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">The math is simple.</h2>
            <p className="text-zinc-400 text-xl font-medium mb-12">
              On a typical $50 order, you keep <span className="text-white font-bold">$15.05 more</span> with LOCL compared to standard delivery apps.
            </p>
            <Link href="/pricing" className="inline-block px-10 py-5 bg-white text-black rounded-full font-black text-lg hover:bg-zinc-100 transition-all active:scale-95">
              Compare the Costs
            </Link>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-600/10 to-transparent blur-3xl pointer-events-none" />
        </div>
      </section>
    </div>
  );
}
