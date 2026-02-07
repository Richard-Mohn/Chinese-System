'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaUsers, FaLightbulb, FaHandshake, FaArrowRight, FaShieldAlt, FaHeart, FaGlobe } from 'react-icons/fa';

interface ValueCardProps {
  icon: any;
  title: string;
  description: string;
  delay: number;
}

const ValueCard = ({ icon: Icon, title, description, delay }: ValueCardProps) => (
  <motion.div
    className="bg-white p-10 rounded-3xl shadow-sm border border-zinc-100 flex flex-col items-center text-center group hover:shadow-xl hover:border-zinc-300 transition-all duration-500"
    initial={{ y: 20, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
  >
    <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-gradient-to-br group-hover:from-orange-500 group-hover:to-red-600 group-hover:text-white transition-all duration-500 shadow-sm">
      <Icon className="text-2xl" />
    </div>
    <h4 className="text-2xl font-bold text-black mb-4">{title}</h4>
    <p className="text-zinc-500 leading-relaxed font-medium">{description}</p>
  </motion.div>
);

export default function About() {
  return (
    <div className="bg-white/90 text-black">
      {/* Hero Section */}
      <section className="pt-36 pb-20 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-orange-50 border border-orange-100 text-xs font-black uppercase tracking-widest text-orange-600"
          >Our Story</motion.div>
          <motion.h1
            className="text-5xl md:text-8xl font-black mb-6 tracking-tighter text-zinc-900 text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Built for Owners<span className="text-orange-500">.</span>
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            MohnMenu was born from a simple observation: local businesses are the heartbeat of our communities, yet they&apos;re being squeezed by platforms that prioritize profits over people.
          </motion.p>
        </div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-orange-100 rounded-full blur-[120px] opacity-30" />
      </section>

      {/* Narrative Section */}
      <section className="py-24 px-4 bg-zinc-50/50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">By operators. For owners.</h2>
              <div className="space-y-6 text-lg text-zinc-600 font-medium leading-relaxed">
                <p>
                  Founded by experienced restaurateurs and tech builders in Petersburg, Virginia, MohnMenu was created to give control back to the business owner. We&apos;ve seen firsthand how 30% commissions destroy margins and put families out of business.
                </p>
                <p>
                  We didn&apos;t just want to build another app. We wanted to build a movement — a platform that empowers you to connect directly with your customers, manage your own operations, and keep every dollar you earn.
                </p>
                <p>
                  MohnMenu accepts cards through Stripe, cryptocurrency through NOWPayments, and cash at the door. We believe business owners should have total freedom over how they get paid.
                </p>
              </div>
            </motion.div>
            <motion.div
              className="aspect-square bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl border border-orange-100 flex items-center justify-center relative overflow-hidden shadow-inner"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center relative z-10">
                <div className="text-8xl mb-4">🏪</div>
                <div className="text-2xl font-black text-zinc-900">Petersburg, VA</div>
                <div className="text-zinc-500 font-medium">23 Shore St.</div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-100/50 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Stats */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '0%', label: 'Commission forever' },
              { value: '24/7', label: 'Platform uptime' },
              { value: 'BTC+', label: 'Crypto accepted' },
              { value: '100%', label: 'Revenue is yours' },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="text-4xl font-black text-orange-600 mb-1">{stat.value}</div>
                <div className="text-zinc-400 text-sm font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-4 bg-zinc-50/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-orange-600 font-black uppercase tracking-widest text-xs mb-3 block">Our Values</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">What we stand for</h2>
            <p className="text-zinc-400 font-medium text-lg">Core principles that guide every feature we build.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ValueCard
              icon={FaHandshake}
              title="Trust & Transparency"
              description="Full transparency in pricing and data ownership. Your customers stay your customers — we never sell data or lock you in."
              delay={0.1}
            />
            <ValueCard
              icon={FaLightbulb}
              title="Relentless Innovation"
              description="GPS fleet tracking, live kitchen cams, inline crypto checkout, AI analytics — we ship features that matter, fast."
              delay={0.2}
            />
            <ValueCard
              icon={FaUsers}
              title="Community First"
              description="Every feature we build strengthens the local economy. When stores keep their revenue, communities thrive."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl bg-zinc-950 rounded-[3rem] p-10 md:p-16 text-white shadow-2xl text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Join the movement.</h2>
            <p className="text-zinc-400 text-xl mb-10 max-w-2xl mx-auto">Thousands of local businesses are taking back control. MohnMenu is free to start — zero risk, zero commissions.</p>
            <Link href="/register" className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-bold text-lg hover:shadow-xl hover:shadow-orange-500/20 transition-all active:scale-95">
              Get Started Free <FaArrowRight />
            </Link>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-orange-600/10 to-transparent blur-3xl pointer-events-none" />
        </div>
      </section>
    </div>
  );
}
