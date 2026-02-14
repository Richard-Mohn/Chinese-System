'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';
import FloatingStoreIcons from '@/components/FloatingStoreIcons';

interface DemoItem {
  name: string;
  subtitle: string;
  price: string;
  emoji: string;
}

interface BusinessDemoTemplateProps {
  badge: string;
  title: string;
  accentColorClass: string;
  heroGradientClass: string;
  sectionTitle: string;
  sectionDescription: string;
  cards: DemoItem[];
  ctaHref: string;
  ctaLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
}

export default function BusinessDemoTemplate({
  badge,
  title,
  accentColorClass,
  heroGradientClass,
  sectionTitle,
  sectionDescription,
  cards,
  ctaHref,
  ctaLabel,
  secondaryHref,
  secondaryLabel,
}: BusinessDemoTemplateProps) {
  return (
    <div className="min-h-screen bg-white/90">
      <section className="pt-36 pb-20 px-4 relative overflow-hidden">
        <FloatingStoreIcons storeType="default" count={14} position="absolute" />
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`inline-block px-4 py-1.5 mb-6 rounded-full bg-zinc-50 border border-zinc-200 text-xs font-black uppercase tracking-widest ${accentColorClass}`}
          >
            {badge}
          </motion.div>

          <motion.h1
            className="text-5xl md:text-8xl font-black mb-6 tracking-tighter text-zinc-900 text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {title}
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium max-w-3xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {sectionDescription}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link href={ctaHref} className={`group px-10 py-5 bg-linear-to-r ${heroGradientClass} text-white rounded-full font-bold text-lg flex items-center gap-3 hover:shadow-xl transition-all`}>
              {ctaLabel} <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href={secondaryHref} className="px-10 py-5 bg-white text-black border-2 border-zinc-200 rounded-full font-bold text-lg hover:border-black transition-all">
              {secondaryLabel}
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="pb-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <span className={`font-black uppercase tracking-widest text-xs mb-3 block ${accentColorClass}`}>Demo Catalog</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">{sectionTitle}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl border border-zinc-200 p-6 hover:border-zinc-300 hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-3">{item.emoji}</div>
                <div className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">{item.subtitle}</div>
                <h3 className="text-lg font-bold text-zinc-900 mb-1">{item.name}</h3>
                <div className={`text-sm font-black ${accentColorClass}`}>{item.price}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
