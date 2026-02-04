'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface PricingTierProps {
  title: string;
  price: string;
  features: string[];
  featured?: boolean;
}

const PricingTier = ({ title, price, features, featured = false }: PricingTierProps) => (
  <motion.div
    className={`border rounded-lg p-8 text-center ${featured ? 'bg-black text-white' : 'bg-gray-50'}`}
    whileHover={{ y: -10 }}
  >
    <h2 className="text-2xl font-bold mb-4">{title}</h2>
    <p className="text-4xl font-bold mb-6">{price}</p>
    <ul className="space-y-4 mb-8">
      {features.map((feature, i) => (
        <li key={i}>{feature}</li>
      ))}
    </ul>
    <Link href="/login">
        <span className={`px-8 py-3 rounded-full font-medium ${featured ? 'bg-white text-black' : 'bg-black text-white'}`}>
            Get Started
        </span>
    </Link>
  </motion.div>
);

export default function Pricing() {
  return (
    <div className="bg-white text-black">
      <motion.section 
        className="py-40 text-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.h1 
          className="text-5xl md:text-7xl font-bold mb-4"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Our Pricing
        </motion.h1>
        <motion.p 
          className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Simple, transparent pricing for businesses of all sizes.
        </motion.p>
      </motion.section>

      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingTier 
              title="Basic"
              price="$29/mo"
              features={['Up to 100 orders', 'Basic analytics', 'Email support']}
            />
            <PricingTier 
              title="Pro"
              price="$79/mo"
              features={['Unlimited orders', 'Advanced analytics', 'Phone support', 'Custom branding']}
              featured
            />
            <PricingTier 
              title="Enterprise"
              price="Custom"
              features={['Dedicated support', 'API access', 'On-site training']}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
