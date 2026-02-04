'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { FaUtensils, FaChartBar, FaBullhorn, FaTruck, FaCreditCard, FaUsers, FaArrowRight } from 'react-icons/fa';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
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

export default function ForRestaurants() {
  return (
    <div className="min-h-screen bg-transparent">
      {/* Hero Section */}
      <section className="pt-40 pb-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-red-50 border border-red-100 text-xs font-black uppercase tracking-widest text-red-600"
          >
            For Restaurateurs
          </motion.div>
          <motion.h1 
            className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-zinc-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Margins Matter<span className="text-red-600">.</span>
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium max-w-3xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Stop losing 30% of your revenue to delivery apps. Take back control with your own high-performance ordering platform.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center"
          >
            <Link href="/register" className="group px-10 py-5 bg-black text-white rounded-full font-bold text-lg flex items-center gap-3 hover:bg-zinc-800 transition-all shadow-xl">
              Start Free Trial
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-32 px-4 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">The Operating System for Growth</h2>
            <p className="text-zinc-500 font-medium">Everything you need to run a modern, profitable kitchen.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={FaUtensils}
              title="Kitchen Display (KDS)"
              description="Eliminate paper waste and miscommunications with a digital display built for high-volume service."
              delay={0.1}
            />
            <FeatureCard 
              icon={FaTruck}
              title="Delivery Control"
              description="Manage your own drivers or a local fleet with sub-second GPS tracking and automated routing."
              delay={0.2}
            />
            <FeatureCard 
              icon={FaChartBar}
              title="Live Analytics"
              description="See exactly which menu items are performing and optimize your labor costs in real-time."
              delay={0.3}
            />
            <FeatureCard 
              icon={FaBullhorn}
              title="Direct Marketing"
              description="Own your customer data. Build loyalty with integrated SMS and email campaign tools."
              delay={0.4}
            />
            <FeatureCard 
              icon={FaCreditCard}
              title="Instant Settlement"
              description="Don't wait weeks for your money. Get your revenue deposited daily with zero platform markup."
              delay={0.5}
            />
            <FeatureCard 
              icon={FaUsers}
              title="Team Management"
              description="Robust role-based access for staff, drivers, and managers across all your locations."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Comparison Proof */}
      <section className="py-32 px-4">
        <div className="container mx-auto max-w-4xl bg-zinc-900 rounded-[4rem] p-12 md:p-20 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight text-center">Stop paying for permission to sell your own food.</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16 text-center">
              <div>
                <p className="text-red-500 font-bold uppercase tracking-widest text-sm mb-4">DoorDash / Uber</p>
                <div className="text-5xl font-black mb-2 text-zinc-400">30%</div>
                <p className="text-zinc-500 font-medium italic">Commission per order</p>
              </div>
              <div className="border-l border-zinc-800 hidden md:block" />
              <div>
                <p className="text-emerald-500 font-bold uppercase tracking-widest text-sm mb-4">LOCL Platform</p>
                <div className="text-5xl font-black mb-2 text-white">0%</div>
                <p className="text-zinc-400 font-medium italic">Commission per order</p>
              </div>
            </div>
          </div>
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full" />
        </div>
      </section>
    </div>
  );
}

