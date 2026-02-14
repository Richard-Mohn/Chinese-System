'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FaWrench, FaArrowRight, FaBatteryFull, FaCar, FaTools,
  FaMapMarkerAlt, FaClock, FaShieldAlt, FaCheckCircle, FaTruck
} from 'react-icons/fa';

const serviceTypes = [
  {
    icon: FaBatteryFull,
    title: 'Jump Starts',
    desc: 'Dispatch nearby equipped drivers for battery jump assistance with quick confirmation in-app.',
  },
  {
    icon: FaCar,
    title: 'Lockout Support',
    desc: 'Customers can request help when locked out and match with nearby verified responders.',
  },
  {
    icon: FaTools,
    title: 'Flat Tire Help',
    desc: 'Connect to drivers who can assist with spare tire swaps or basic roadside support.',
  },
];

const workflow = [
  {
    title: 'Customer reports issue',
    desc: 'Inside the customer app, users choose their issue type, location, and urgency level.',
    icon: FaMapMarkerAlt,
  },
  {
    title: 'Qualified driver gets pinged',
    desc: 'Only nearby marketplace drivers with the right equipment and category enabled receive requests.',
    icon: FaTruck,
  },
  {
    title: 'Live ETA + tracking',
    desc: 'Customer sees acceptance status, route progress, and estimated arrival in real time.',
    icon: FaClock,
  },
  {
    title: 'Completion + payout',
    desc: 'Driver marks service complete and payout is logged through the same marketplace rails.',
    icon: FaCheckCircle,
  },
];

const safetyPoints = [
  'Driver equipment tags and service eligibility controls',
  'Request audit trail with timestamps and GPS checkpoints',
  'Customer confirmation and completion verification',
  'Escalation support flow for unresolved requests',
];

export default function RoadsideAssistanceFeaturePage() {
  return (
    <div className="min-h-screen bg-white/90">
      <section className="pt-36 pb-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-orange-50 border border-orange-100 text-xs font-black uppercase tracking-widest text-orange-600"
          >
            New Feature
          </motion.div>
          <motion.h1
            className="text-5xl md:text-8xl font-black mb-6 tracking-tighter text-zinc-900 text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Roadside Assistance<span className="text-orange-500">.</span>
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium max-w-3xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Use the same driver marketplace to handle quick roadside jobs — jump starts, lockouts, and tire help — without building a separate operations stack.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/for-uber-drivers" className="group px-10 py-5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full font-bold text-lg flex items-center gap-3 hover:shadow-xl hover:shadow-orange-500/20 transition-all">
              For Drivers <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/register" className="px-10 py-5 bg-white text-black border-2 border-zinc-200 rounded-full font-bold text-lg hover:border-black transition-all">
              Activate for My Business
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-4 bg-zinc-50/60">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {serviceTypes.map((service, i) => (
              <motion.div
                key={service.title}
                className="bg-white rounded-3xl border border-zinc-100 p-8 hover:border-orange-200 hover:shadow-xl transition-all duration-500"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-5">
                  <service.icon className="text-orange-600 text-xl" />
                </div>
                <h3 className="text-lg font-bold text-black mb-2">{service.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-orange-600 font-black uppercase tracking-widest text-xs mb-3 block">Dispatch Flow</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Built on your existing ecosystem.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {workflow.map((item, i) => (
              <motion.div
                key={item.title}
                className="bg-white rounded-3xl border border-zinc-100 p-7"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <item.icon className="text-orange-600 mb-3" />
                <h3 className="text-lg font-bold text-black mb-2">{item.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-zinc-950 text-white rounded-[3rem] mx-4 mb-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 text-orange-300 mb-4 font-bold">
            <FaShieldAlt /> Trust & Safety
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-8">Operational guardrails included</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {safetyPoints.map((point) => (
              <div key={point} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-300">
                {point}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-black mb-4">Add roadside jobs to your marketplace</h2>
          <Link href="/register" className="inline-flex items-center gap-2 px-10 py-5 bg-linear-to-r from-orange-500 to-amber-500 text-white rounded-full font-bold text-lg hover:shadow-xl hover:shadow-orange-500/20 transition-all">
            Start Setup <FaArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}
