'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaCheck } from 'react-icons/fa';

interface PricingTierProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  featured?: boolean;
  delay: number;
}

const PricingCard = ({ title, price, description, features, featured = false, delay }: PricingTierProps) => (
  <motion.div
    className={`p-10 rounded-[3rem] border flex flex-col items-start text-left h-full transition-all duration-500 group ${
      featured 
        ? 'bg-zinc-900 text-white border-zinc-800 shadow-2xl' 
        : 'bg-white text-black border-zinc-100 shadow-[0_10px_50px_rgba(0,0,0,0.03)] hover:border-zinc-300'
    }`}
    initial={{ y: 20, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
  >
    <div className="mb-8">
      <h3 className={`text-2xl font-bold mb-2 ${featured ? 'text-white' : 'text-zinc-900'}`}>{title}</h3>
      <p className={`text-sm font-medium ${featured ? 'text-zinc-400' : 'text-zinc-500'}`}>{description}</p>
    </div>
    
    <div className="mb-10">
      <span className="text-5xl font-black tracking-tighter">{price}</span>
      {price !== 'Custom' && <span className={`text-sm font-bold ml-2 ${featured ? 'text-zinc-500' : 'text-zinc-400'}`}>/month</span>}
    </div>

    <ul className="space-y-4 mb-12 flex-1 w-full">
      {features.map((feature, i) => (
        <li key={i} className="flex items-center gap-3 text-sm font-medium">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${featured ? 'bg-zinc-800 text-white' : 'bg-zinc-50 text-black'}`}>
            <FaCheck className="text-[8px]" />
          </div>
          <span className={featured ? 'text-zinc-300' : 'text-zinc-600'}>{feature}</span>
        </li>
      ))}
    </ul>

    <Link href="/register" className="w-full">
      <button className={`w-full py-4 rounded-full font-bold text-sm transition-all active:scale-[0.98] ${
        featured 
          ? 'bg-white text-black hover:bg-zinc-100' 
          : 'bg-zinc-900 text-white hover:bg-black'
      }`}>
        Get Started
      </button>
    </Link>
  </motion.div>
);

export default function Pricing() {
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
            Pricing<span className="text-indigo-600">.</span>
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Scale your business with a fair, predictable cost model. No hidden fees, just pure growth.
          </motion.p>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard 
              title="Essential"
              price="$47"
              description="Perfect for new local shops."
              features={['Up to 500 orders', 'Standard Analytics', 'Email Support', 'Mobile Ordering']}
              delay={0.1}
            />
            <PricingCard 
              title="Growth"
              price="$147"
              description="For bustling local businesses."
              features={['Unlimited orders', 'Priority Support', 'Custom Branding', 'Advanced Marketing Tools', 'AI Insights']}
              featured
              delay={0.2}
            />
            <PricingCard 
              title="Enterprise"
              price="Custom"
              description="Custom solutions for chains."
              features={['Multi-location Management', 'Dedicated Account Rep', 'API Access', 'Custom Integrations']}
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* ROI Proof */}
      <section className="py-32 px-4 bg-zinc-900 text-white rounded-[4rem] mx-4 mb-20">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">The 90% Savings Standard.</h2>
          <p className="text-zinc-400 text-xl font-medium mb-12">
            By switching from predatory platforms to LOCL, the average business saves $1,350 every month. That's money you earned—keep it.
          </p>
          <div className="flex flex-wrap justify-center gap-12 opacity-50 font-bold text-sm tracking-widest uppercase">
            <div>NO COMMISSIONS</div>
            <div>NO HIDDEN FEES</div>
            <div>NO CONTRACTS</div>
          </div>
        </div>
      </section>
    </div>
  );
}
