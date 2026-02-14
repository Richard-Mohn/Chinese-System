'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FaCar, FaArrowRight, FaMapMarkerAlt, FaDollarSign, FaClock,
  FaTools, FaBatteryFull, FaTruckPickup, FaShieldAlt, FaRoute,
  FaUsers, FaWrench
} from 'react-icons/fa';
import FloatingStoreIcons from '@/components/FloatingStoreIcons';

const earningStreams = [
  {
    icon: FaTruckPickup,
    title: 'Food & Package Deliveries',
    desc: 'Accept delivery requests between rides and stack income during downtime without leaving your local zone.',
  },
  {
    icon: FaWrench,
    title: 'Roadside Quick Jobs',
    desc: 'Take short roadside requests like jump starts, lockouts, and tire changes when you have the right equipment.',
  },
  {
    icon: FaUsers,
    title: 'Marketplace Priority',
    desc: 'Drivers with higher completion scores get first access to nearby premium requests and repeat customers.',
  },
];

const roadsideJobs = [
  { icon: FaBatteryFull, label: 'Jump Start', payout: '$15-$35', time: '10-20 min' },
  { icon: FaTools, label: 'Tire Help', payout: '$20-$45', time: '15-30 min' },
  { icon: FaCar, label: 'Lockout Assist', payout: '$18-$40', time: '10-25 min' },
];

const flow = [
  {
    step: '1',
    title: 'Go online in Driver Hub',
    desc: 'Set your status and choose what jobs you can accept: delivery only, roadside only, or both.',
    icon: FaMapMarkerAlt,
  },
  {
    step: '2',
    title: 'Accept nearby requests',
    desc: 'Receive live requests based on proximity and equipment. Accept jobs that match your route and schedule.',
    icon: FaRoute,
  },
  {
    step: '3',
    title: 'Complete and get paid',
    desc: 'Track completion in-app with customer confirmation and payout visibility for every completed request.',
    icon: FaDollarSign,
  },
  {
    step: '4',
    title: 'Build your rating',
    desc: 'Higher ratings unlock more frequent requests and stronger earning windows at peak times.',
    icon: FaShieldAlt,
  },
];

export default function ForUberDriversPage() {
  return (
    <div className="min-h-screen bg-white/90 relative">
      <FloatingStoreIcons storeType="default" count={16} position="fixed" />

      <section className="pt-36 pb-20 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-black uppercase tracking-widest text-indigo-700"
          >
            For Uber & Rideshare Drivers
          </motion.div>

          <motion.h1
            className="text-5xl md:text-8xl font-black mb-6 tracking-tighter text-zinc-900 text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Drive Your Route.<br />
            <span className="text-indigo-600">Earn More Per Hour.</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium max-w-3xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Turn downtime into income with delivery jobs and fast roadside requests in one app. Accept only the jobs that fit your equipment, route, and schedule.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link href="/signup/courier" className="group px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-full font-bold text-lg flex items-center gap-3 hover:shadow-xl hover:shadow-indigo-500/20 transition-all">
              Start Driving <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/features/roadside-assistance" className="px-10 py-5 bg-white text-black border-2 border-zinc-200 rounded-full font-bold text-lg hover:border-black transition-all">
              Explore Roadside Jobs
            </Link>
          </motion.div>
        </div>

        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-100 rounded-full blur-[120px] opacity-30" />
      </section>

      <section className="py-12 px-4 bg-indigo-600 text-white">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '2x', label: 'Job Types' },
              { value: '<15m', label: 'Avg dispatch range' },
              { value: '24/7', label: 'Request flow' },
              { value: 'Live', label: 'In-app tracking' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl md:text-4xl font-black">{stat.value}</p>
                <p className="text-indigo-200 text-sm font-medium mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-black uppercase tracking-widest text-xs mb-3 block">Earning Streams</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">One driver app. Multiple incomes.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {earningStreams.map((stream, i) => (
              <motion.div
                key={stream.title}
                className="bg-white rounded-3xl border border-zinc-100 p-8 hover:border-indigo-200 hover:shadow-xl transition-all duration-500"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-5">
                  <stream.icon className="text-indigo-600 text-xl" />
                </div>
                <h3 className="text-lg font-bold text-black mb-2">{stream.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{stream.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-zinc-50/60">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <span className="text-orange-600 font-black uppercase tracking-widest text-xs mb-3 block">Roadside Jobs</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Fast jobs drivers can complete quickly.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roadsideJobs.map((job, i) => (
              <motion.div
                key={job.label}
                className="bg-white rounded-3xl border border-zinc-100 p-7"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <job.icon className="text-2xl text-orange-500 mb-4" />
                <h3 className="text-lg font-bold text-black mb-2">{job.label}</h3>
                <div className="text-sm text-zinc-600 font-semibold mb-1">Typical payout: {job.payout}</div>
                <div className="text-xs text-zinc-400">Estimated time: {job.time}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-black uppercase tracking-widest text-xs mb-3 block">Workflow</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">How it works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {flow.map((item, i) => (
              <motion.div
                key={item.step}
                className="bg-white rounded-3xl border border-zinc-100 p-7"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white font-black flex items-center justify-center">
                    {item.step}
                  </div>
                  <item.icon className="text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-black mb-2">{item.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl bg-gradient-to-r from-indigo-600 to-purple-700 rounded-[3rem] p-10 md:p-16 text-white shadow-2xl text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Add roadside to your regular drive day.</h2>
          <p className="text-indigo-100 text-lg mb-10 max-w-xl mx-auto">Keep your rideshare flow and pick up high-value quick service jobs between trips.</p>
          <Link href="/signup/courier" className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-indigo-700 rounded-full font-bold text-lg hover:bg-indigo-50 transition-all">
            Join Driver Marketplace <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
