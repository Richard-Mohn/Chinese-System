'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaArrowRight, FaUserTie, FaUsers, FaCoffee, FaUtensils,
  FaGlassCheers, FaTruck, FaShieldAlt, FaBriefcase, FaSearch,
  FaStar, FaIdBadge, FaMapMarkerAlt, FaHeart, FaClock,
  FaCheckCircle, FaExchangeAlt, FaChartLine
} from 'react-icons/fa';
import FloatingStoreIcons from '@/components/FloatingStoreIcons';

const ROLES = [
  {
    title: 'Barista',
    icon: FaCoffee,
    description: 'Make specialty coffee at top shops. Latte art skills, pour-over expertise, and customer service.',
    color: 'from-amber-600 to-orange-700',
    link: '/apply/bartender-server',
    perks: ['Flexible shifts', 'Tips + base pay', 'Work at multiple shops', 'Build your portfolio'],
  },
  {
    title: 'Bartender',
    icon: FaGlassCheers,
    description: 'Craft cocktails at the hottest bars. Mixology, customer engagement, and speed pouring.',
    color: 'from-purple-500 to-violet-600',
    link: '/apply/bartender-server',
    perks: ['Premium tips', 'Night & weekend shifts', 'Multi-venue access', 'Certification tracking'],
  },
  {
    title: 'Server',
    icon: FaUtensils,
    description: 'Provide exceptional dining experiences. Table management, upselling, and guest satisfaction.',
    color: 'from-red-500 to-orange-500',
    link: '/apply/bartender-server',
    perks: ['High-traffic restaurants', 'Tip pooling options', 'Cross-trained roles', 'Career advancement'],
  },
  {
    title: 'Delivery Driver',
    icon: FaTruck,
    description: 'Deliver food and drinks in your area. Use your own vehicle, bike, or scooter.',
    color: 'from-green-500 to-emerald-600',
    link: '/apply/delivery-driver',
    perks: ['Set your own hours', 'Keep 100% of tips', 'Low barrier to entry', 'Instant payouts'],
  },
  {
    title: 'Kitchen Staff',
    icon: FaUtensils,
    description: 'Line cook, prep cook, or executive chef. Fast-paced kitchen environments with real experience.',
    color: 'from-orange-500 to-red-600',
    link: '/apply/kitchen-staff',
    perks: ['Skill development', 'Multi-cuisine exposure', 'Shift meals', 'Career growth path'],
  },
  {
    title: 'Manager',
    icon: FaBriefcase,
    description: 'Oversee operations, staff, and revenue. Restaurant and hospitality management roles.',
    color: 'from-zinc-700 to-zinc-900',
    link: '/apply/operations-manager',
    perks: ['Leadership roles', 'Performance bonuses', 'Multi-location ops', 'Full dashboard access'],
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white/90 relative">
      <FloatingStoreIcons storeType="default" count={16} position="fixed" />

      {/* Hero */}
      <section className="pt-36 pb-20 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-black uppercase tracking-widest text-emerald-700"
          >Careers & Staffing</motion.div>
          <motion.h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter text-zinc-900 text-balance" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            Find work. Get hired<span className="text-emerald-600">.</span>
          </motion.h1>
          <motion.p className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium max-w-3xl mx-auto mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            Bartenders, baristas, servers, drivers, and kitchen staff — create a verified profile, find shifts at top restaurants and coffee shops, and get paid. One profile, many venues.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="flex flex-wrap justify-center gap-4">
            <Link href="/apply" className="group px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full font-bold text-lg flex items-center gap-3 hover:shadow-xl hover:shadow-emerald-500/20 transition-all">
              Apply for Roles <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/apply/operations-manager" className="px-10 py-5 bg-white text-black border-2 border-zinc-200 rounded-full font-bold text-lg hover:border-black transition-all">
              I&apos;m Hiring
            </Link>
          </motion.div>
        </div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-100 rounded-full blur-[120px] opacity-30" />
      </section>

      {/* Roles */}
      <section className="py-24 px-4 bg-zinc-50/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-emerald-700 font-black uppercase tracking-widest text-xs mb-3 block">Open Roles</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Pick your role. Start earning.</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Every role on MohnMenu comes with a verified profile, background check on file, and the ability to work at multiple venues.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ROLES.map((role, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group"
              >
                <div className="bg-white rounded-3xl border border-zinc-100 hover:border-zinc-300 hover:shadow-xl transition-all duration-500 overflow-hidden h-full flex flex-col">
                  <div className={`h-28 bg-gradient-to-br ${role.color} flex items-center justify-center relative overflow-hidden`}>
                    <role.icon className="text-white text-4xl z-10 group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-black mb-2">{role.title}</h3>
                    <p className="text-sm text-zinc-400 mb-4 flex-1">{role.description}</p>
                    <div className="space-y-1.5 mb-5">
                      {role.perks.map((perk, j) => (
                        <div key={j} className="flex items-center gap-2 text-xs text-zinc-500">
                          <FaCheckCircle className="text-emerald-500 shrink-0" />
                          <span>{perk}</span>
                        </div>
                      ))}
                    </div>
                    <Link href={role.link} className="block text-center py-3 bg-zinc-900 text-white rounded-full font-bold text-sm hover:bg-black transition-colors">
                      Apply as {role.title}
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works for Workers */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-emerald-700 font-black uppercase tracking-widest text-xs mb-3 block">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">From profile to paycheck.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', icon: FaIdBadge, title: 'Create Your Profile', desc: 'Add your experience, certifications, availability, and preferred roles. One profile — works everywhere.' },
              { step: '02', icon: FaShieldAlt, title: 'Get Verified', desc: 'Soft background check, ID verification, and license validation. Once verified, you\'re ready to work anywhere.' },
              { step: '03', icon: FaSearch, title: 'Find Shifts', desc: 'Browse open shifts at restaurants, bars, and coffee shops near you. Filter by role, pay, and distance.' },
              { step: '04', icon: FaChartLine, title: 'Work & Grow', desc: 'Build your reputation with ratings and reviews. The more you work, the more opportunities you unlock.' },
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

      {/* For Businesses */}
      <section className="py-24 px-4 bg-zinc-950 text-white rounded-[3rem] mx-4 mb-6 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <span className="text-emerald-400 font-black uppercase tracking-widest text-xs mb-3 block">For Business Owners</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Stop hiring the hard way.</h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">Find quality workers who already have verified profiles, background checks, and reviews. They can start immediately.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FaUsers, title: 'Pre-Vetted Staff', desc: 'Every worker on MohnMenu has a verified profile and soft background check. No more guessing.' },
              { icon: FaExchangeAlt, title: 'Instant Onboarding', desc: 'Workers already have profiles, certifications, and experience documented. They start day one.' },
              { icon: FaClock, title: 'Fill Shifts Fast', desc: 'Post an open shift and get applicants within hours. No job boards, no agencies, no $500 fees.' },
              { icon: FaHeart, title: 'Keep the Best', desc: 'Rate workers, save favorites, and build your go-to list. The best staff come back to you.' },
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

      {/* Tax & Staffing Services */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <span className="text-emerald-700 font-black uppercase tracking-widest text-xs mb-3 block">Coming Soon</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">More than just shifts.</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">We&apos;re building a full ecosystem for hospitality workers and businesses.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: FaBriefcase, title: 'Staffing Services', desc: 'Need full-time hires? We match you with pre-vetted candidates from our marketplace — faster than any recruiter.' },
              { icon: FaChartLine, title: 'Tax Services', desc: 'W-2 and 1099 support for gig workers. We help staff and businesses stay compliant — tax prep included.' },
              { icon: FaMapMarkerAlt, title: 'Multi-Location', desc: 'Corporate chains and franchises: staff across all locations from one dashboard. One pool, many venues.' },
            ].map((item, i) => (
              <motion.div key={i} className="bg-zinc-50 p-8 rounded-3xl border border-zinc-100 hover:shadow-xl hover:border-zinc-300 transition-all" initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                  <item.icon className="text-emerald-700 text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl bg-gradient-to-r from-emerald-500 to-teal-600 rounded-[3rem] p-10 md:p-16 text-white shadow-2xl text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Your career in hospitality starts here.</h2>
          <p className="text-emerald-100 text-lg mb-10 max-w-xl mx-auto">Create your free profile. Find shifts. Get paid. One platform for every role in the industry.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/apply" className="group px-10 py-5 bg-white text-emerald-700 rounded-full font-bold text-lg flex items-center gap-3 hover:bg-emerald-50 transition-all">
              Apply for Roles <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/apply/operations-manager" className="px-10 py-5 border-2 border-white/50 text-white rounded-full font-bold text-lg hover:border-white transition-all">
              I&apos;m a Business Owner
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
