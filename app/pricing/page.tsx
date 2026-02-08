'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaCheck, FaArrowRight, FaStar, FaRocket, FaBuilding } from 'react-icons/fa';

interface PricingTierProps {
  title: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  icon: any;
  featured?: boolean;
  delay: number;
  tier: string;
}

const PricingCard = ({ title, price, period, description, features, icon: Icon, featured = false, delay, tier }: PricingTierProps) => (
  <motion.div
    className={`p-10 rounded-3xl border flex flex-col items-start text-left h-full transition-all duration-500 group relative overflow-hidden ${
      featured
        ? 'bg-gradient-to-br from-zinc-900 to-zinc-950 text-white border-orange-500/30 shadow-2xl shadow-orange-500/10 ring-2 ring-orange-500/20'
        : 'bg-white text-black border-zinc-100 shadow-sm hover:border-zinc-300 hover:shadow-xl'
    }`}
    initial={{ y: 20, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
  >
    {featured && (
      <div className="absolute top-0 right-0 px-4 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-bl-2xl text-xs font-black uppercase tracking-widest">Most Popular</div>
    )}
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20">
      <Icon className="text-lg" />
    </div>
    <div className="mb-8">
      <h3 className={`text-2xl font-bold mb-2 ${featured ? 'text-white' : 'text-zinc-900'}`}>{title}</h3>
      <p className={`text-sm font-medium ${featured ? 'text-zinc-400' : 'text-zinc-500'}`}>{description}</p>
    </div>
    
    <div className="mb-10">
      <span className="text-5xl font-black tracking-tighter">{price}</span>
      {period && <span className={`text-sm font-bold ml-2 ${featured ? 'text-zinc-500' : 'text-zinc-400'}`}>{period}</span>}
    </div>

    <ul className="space-y-4 mb-12 flex-1 w-full">
      {features.map((feature, i) => {
        const isRoadmap = feature.includes('(coming soon)');
        const label = feature.replace(' (coming soon)', '');
        return (
          <li key={i} className={`flex items-start gap-3 text-sm font-medium ${isRoadmap ? 'opacity-60' : ''}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              isRoadmap
                ? featured ? 'bg-zinc-700 text-zinc-500' : 'bg-zinc-100 text-zinc-400'
                : featured ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-500'
            }`}>
              {isRoadmap ? <span className="text-[8px]">◆</span> : <FaCheck className="text-[8px]" />}
            </div>
            <span className={featured ? 'text-zinc-300' : 'text-zinc-600'}>
              {label}
              {isRoadmap && <span className={`ml-1.5 text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${featured ? 'text-amber-400/80 bg-amber-400/10' : 'text-amber-600 bg-amber-50'}`}>Roadmap</span>}
            </span>
          </li>
        );
      })}
    </ul>

    <Link href={`/register?plan=${tier}`} className="w-full">
      <button className={`w-full py-4 rounded-full font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
        featured
          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg hover:shadow-orange-500/20'
          : 'bg-zinc-900 text-white hover:bg-black'
      }`}>
        Start 14-Day Free Trial <FaArrowRight className="text-xs" />
      </button>
    </Link>
  </motion.div>
);

export default function Pricing() {
  return (
    <div className="min-h-screen bg-white/90">
      {/* Hero Section */}
      <section className="pt-36 pb-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-orange-50 border border-orange-100 text-xs font-black uppercase tracking-widest text-orange-600"
          >Zero Commissions — Always</motion.div>
          <motion.h1
            className="text-5xl md:text-8xl font-black mb-6 tracking-tighter text-zinc-900 text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Simple Pricing<span className="text-orange-500">.</span>
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Every plan starts with a 14-day free trial. No credit card required. Zero commissions — always.
          </motion.p>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard
              title="Starter"
              price="$19.99"
              period="/month"
              description="Everything you need to sell online. 14-day free trial."
              icon={FaStar}
              tier="starter"
              features={[
                'Unlimited menu items & categories',
                'White-label branded storefront',
                'Card payments via Stripe',
                'Crypto payments (BTC, ETH + 6 more)',
                'Cash-on-delivery toggle',
                'QR code ordering',
                'Quick Order modal for your customers',
                'Fraud & chargeback protection',
                'Basic sales dashboard',
              ]}
              delay={0.1}
            />
            <PricingCard
              title="Growth"
              price="$49.99"
              period="/month"
              description="Premium tools for growing businesses. 14-day free trial."
              icon={FaRocket}
              tier="growth"
              features={[
                'Everything in Starter',
                'Kitchen Display System (KDS)',
                'Real-time order tracking',
                'Sales & product analytics',
                'Custom domain support',
                'Priority email support',
                'POS integration (coming soon)',
                'SMS & email marketing (coming soon)',
                'AI-powered sales insights (coming soon)',
              ]}
              featured
              delay={0.2}
            />
            <PricingCard
              title="Professional"
              price="$99.99"
              period="/month"
              description="Full platform for serious operations. 14-day free trial."
              icon={FaBuilding}
              tier="professional"
              features={[
                'Everything in Growth',
                'Sub-second GPS fleet tracking',
                'Live Chef Cam streaming',
                'Driver dispatch & management',
                'Multi-location management (coming soon)',
                'REST API access (coming soon)',
                'Dedicated support channel',
                'Advanced reporting & exports',
                'Custom integrations (coming soon)',
              ]}
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* What's Always Included */}
      <section className="py-24 px-4 bg-zinc-50/50">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-12">Always included. Every plan.</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: '0% Commission', sub: 'On every order' },
              { label: '14-Day Trial', sub: 'No credit card' },
              { label: 'No Contracts', sub: 'Cancel anytime' },
              { label: 'Free Updates', sub: 'New features included' },
            ].map((item, i) => (
              <motion.div key={i} className="text-center" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="text-2xl font-black text-orange-600 mb-1">{item.label}</div>
                <div className="text-zinc-400 text-sm font-medium">{item.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Proof */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl bg-zinc-950 rounded-[3rem] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden text-center">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Try it 14 days free. Then $19.99.</h2>
            <p className="text-zinc-400 text-xl font-medium mb-10">
              By switching from commission-based platforms to MohnMenu, the average business saves <span className="text-white font-black">$1,350+ every month</span>. That&apos;s money you earned — keep it.
            </p>
            <div className="flex flex-wrap justify-center gap-10 mb-10 text-zinc-500 font-bold text-xs tracking-widest uppercase">
              <div>No Commissions</div>
              <div>No Hidden Fees</div>
              <div>No Contracts</div>
            </div>
            <Link href="/register?plan=starter" className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-bold text-lg hover:shadow-xl hover:shadow-orange-500/20 transition-all active:scale-95">
              Start Your Free Trial <FaArrowRight />
            </Link>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-orange-600/10 to-transparent blur-3xl pointer-events-none" />
        </div>
      </section>
    </div>
  );
}
