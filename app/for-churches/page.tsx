'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FaChurch,
  FaArrowRight,
  FaCalendarAlt,
  FaHandsHelping,
  FaBroadcastTower,
  FaDonate,
  FaUsers,
  FaTv,
  FaHeart,
} from 'react-icons/fa';
import FloatingStoreIcons from '@/components/FloatingStoreIcons';

interface FeatureCardProps { icon: any; title: string; description: string; delay: number; }
const FeatureCard = ({ icon: Icon, title, description, delay }: FeatureCardProps) => (
  <motion.div
    className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-100 flex flex-col items-start text-left group hover:border-emerald-300 hover:shadow-xl transition-all duration-500"
    initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay }}
  >
    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-gradient-to-br group-hover:from-emerald-400 group-hover:to-teal-500 group-hover:text-white transition-all duration-500 shadow-sm">
      <Icon className="text-2xl" />
    </div>
    <h4 className="text-xl font-bold text-zinc-900 mb-3">{title}</h4>
    <p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

export default function ForChurches() {
  return (
    <div className="min-h-screen bg-white/95 relative">
      <FloatingStoreIcons storeType="church" count={16} position="fixed" />

      <section className="pt-36 pb-20 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-black uppercase tracking-widest text-emerald-600"
          >
            For Churches & Ministries
          </motion.div>
          <motion.h1
            className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-zinc-900 text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Church operations, <span className="text-emerald-500">fully unified</span>.
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium max-w-3xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            MohnMenu keeps giving, events, volunteers, and streaming in one place. Give your staff and members a single hub for everything church life.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link href="/demo/shepherds-gate" className="group px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-bold text-lg flex items-center gap-3 hover:shadow-xl hover:shadow-emerald-500/20 transition-all">
              View Church Demo <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/register" className="px-10 py-5 bg-white text-black border-2 border-emerald-200 rounded-full font-bold text-lg hover:border-emerald-500 transition-all">
              Start Free Today
            </Link>
          </motion.div>
        </div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-100 rounded-full blur-[120px] opacity-30" />
      </section>

      <section className="py-24 px-4 bg-emerald-50/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-emerald-600 font-black uppercase tracking-widest text-xs mb-3 block">Core Platform</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Everything a growing church needs.</h2>
            <p className="text-zinc-500 text-lg max-w-2xl mx-auto">Digital giving, events, members, and streaming with zero platform chaos.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={FaDonate} title="Digital Giving" description="Tithes, recurring gifts, and campaigns with instant receipts and analytics." delay={0.05} />
            <FeatureCard icon={FaCalendarAlt} title="Events & RSVPs" description="Publish services and gatherings, track attendance, and send reminders." delay={0.1} />
            <FeatureCard icon={FaUsers} title="Member Care" description="Households, pastoral notes, prayer requests, and follow-ups." delay={0.15} />
            <FeatureCard icon={FaHandsHelping} title="Volunteer Teams" description="Schedules, rotations, and quick fill-ins for every ministry." delay={0.2} />
            <FeatureCard icon={FaBroadcastTower} title="Livestream Hub" description="Stream, archive sermons, and push live notifications." delay={0.25} />
            <FeatureCard icon={FaTv} title="Projector Mode" description="Lyrics, run of service, and announcements on any screen." delay={0.3} />
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-emerald-600 font-black">Role Ready</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Every team has a place.</h2>
            <p className="text-lg text-zinc-500 mb-8">Give pastors, worship leaders, and volunteers the dashboards they need without extra tools.</p>
            <div className="space-y-4">
              {[
                { icon: FaChurch, title: 'Pastor Admin', desc: 'Giving insights, member care, and service planning.' },
                { icon: FaBroadcastTower, title: 'Media + AV', desc: 'Livestream controls, sermon uploads, and run sheets.' },
                { icon: FaHandsHelping, title: 'Volunteer Leads', desc: 'Schedules, reminders, and quick fill shifts.' },
                { icon: FaHeart, title: 'Members', desc: 'Event RSVPs, giving history, and group signups.' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <item.icon />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-zinc-900">{item.title}</h4>
                    <p className="text-sm text-zinc-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-zinc-950 text-white rounded-[2.5rem] p-10 shadow-2xl">
            <p className="text-xs uppercase tracking-widest text-emerald-300 font-black">Projector + Stream</p>
            <h3 className="text-3xl font-black mt-4 mb-6">Put your service flow on screen.</h3>
            <p className="text-emerald-100/80 mb-8">Lyrics, announcements, and run-of-service timing update instantly for worship and media teams.</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/demo/shepherds-gate/menu-board" className="px-6 py-3 rounded-full bg-emerald-400 text-emerald-950 font-bold">
                Open Projector Mode
              </Link>
              <Link href="/demo/shepherds-gate" className="px-6 py-3 rounded-full border border-emerald-300/50 text-emerald-100 font-bold">
                View Full Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[3rem] p-10 md:p-16 text-white shadow-2xl text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Serve your people with less stress.</h2>
          <p className="text-emerald-100 text-lg mb-10 max-w-xl mx-auto">Launch in minutes. Keep your staff in sync. Let your church focus on ministry.</p>
          <Link href="/register" className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-emerald-700 rounded-full font-bold text-lg hover:bg-emerald-50 transition-all">
            Get Started Free <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
