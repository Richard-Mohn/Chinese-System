'use client';

import { motion } from 'framer-motion';
import { FaUsers, FaLightbulb, FaHandshake } from 'react-icons/fa';

interface ValueCardProps {
  icon: any;
  title: string;
  description: string;
  delay: number;
}

const ValueCard = ({ icon: Icon, title, description, delay }: ValueCardProps) => (
  <motion.div
    className="bg-white p-10 rounded-[2.5rem] shadow-[0_10px_50px_rgba(0,0,0,0.03)] border border-zinc-100 flex flex-col items-center text-center group"
    initial={{ y: 20, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
  >
    <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors duration-500">
      <Icon className="text-2xl" />
    </div>
    <h4 className="text-2xl font-bold text-black mb-4">{title}</h4>
    <p className="text-zinc-500 leading-relaxed font-medium">{description}</p>
  </motion.div>
);

export default function About() {
  return (
    <div className="bg-transparent text-black">
      {/* Hero Section */}
      <section className="pt-40 pb-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.h1 
            className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-zinc-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Our Story<span className="text-indigo-600">.</span>
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            LOCL was born from a simple observation: local businesses are the heartbeat of our communities, yet they're being squeezed by platforms that prioritize profits over people.
          </motion.p>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="py-32 px-4 bg-white/50 backdrop-blur-sm border-y border-zinc-50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">Built for owners, by operators.</h2>
              <div className="space-y-6 text-lg text-zinc-600 font-medium leading-relaxed">
                <p>
                  Founded by experienced restaurateurs and tech enthusiasts, LOCL was created to give control back to the business owner. We've seen firsthand how high commissions can destroy margins.
                </p>
                <p>
                  We didn't just want to build another app; we wanted to build a movement. A platform that empowers you to connect directly with your customers, manage your own deliveries, and keep every dollar you earn.
                </p>
              </div>
            </motion.div>
            <motion.div 
              className="aspect-square bg-zinc-50 rounded-[3rem] border border-zinc-100 flex items-center justify-center relative overflow-hidden shadow-inner"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
               <div className="text-9xl grayscale opacity-20">🏪</div>
               <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/50 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-32 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">What we stand for</h2>
            <p className="text-zinc-500 font-medium">Core principles that guide every feature we build.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ValueCard 
              icon={FaHandshake}
              title="Trust"
              description="Full transparency in pricing and data ownership. Your customers stay your customers."
              delay={0.1}
            />
            <ValueCard 
              icon={FaLightbulb}
              title="Innovation"
              description="Using 2026 technology to solve real-world problems like logistics and kitchen transparency."
              delay={0.2}
            />
            <ValueCard 
              icon={FaUsers}
              title="Community"
              description="Empowering the local economy by keeping wealth within the neighborhood."
              delay={0.3}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
