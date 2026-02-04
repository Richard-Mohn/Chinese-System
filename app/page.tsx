'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaVideo, FaRocket, FaShieldAlt, FaArrowRight, FaCheck } from 'react-icons/fa';

interface FeatureCardProps {
  icon: any;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard = ({ icon: Icon, title, description, delay }: FeatureCardProps) => (
  <motion.div
    className="bg-zinc-50 p-8 rounded-3xl border border-zinc-200 hover:border-black transition-all duration-500 flex flex-col items-start text-left group"
    initial={{ y: 20, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
  >
    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white border border-zinc-100 transition-colors duration-500 shadow-sm">
      <Icon className="text-2xl" />
    </div>
    <h4 className="text-xl font-bold text-black mb-3">{title}</h4>
    <p className="text-zinc-600 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

export default function Home() {
  return (
    <div className="min-h-screen bg-white selection:bg-black selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-50 border border-blue-100 text-sm font-black tracking-widest text-blue-600 uppercase"
            >
              The New Standard
            </motion.div>
            
            <motion.h1
              className="text-7xl md:text-9xl font-black mb-8 tracking-tighter text-zinc-900"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              LOCL<span className="text-indigo-600">.</span>
            </motion.h1>
            
            <motion.p
              className="text-xl md:text-2xl text-zinc-600 max-w-2xl mx-auto mb-12 leading-relaxed font-medium"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Simple, powerful mobile ordering for your local business. 
              Take back your margins and own your customer relationship.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/register" className="group px-10 py-5 bg-black text-white rounded-full font-bold text-lg flex items-center gap-3 hover:bg-zinc-800 transition-all active:scale-95 shadow-xl">
                Get Started
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button 
                onClick={() => {
                  const code = prompt("Enter Partner Access Code:");
                  if (code === "804605146") {
                    window.location.href = "/dashboard";
                  } else if (code) {
                    alert("Invalid Code");
                  }
                }}
                className="px-10 py-5 bg-white text-zinc-900 border-2 border-zinc-200 rounded-full font-bold text-lg hover:border-zinc-900 transition-all"
              >
                Partner Access
              </button>
            </motion.div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={FaMapMarkerAlt}
              title="Real-time GPS"
              description="Sub-second delivery tracking. See exactly where your drivers are, every single second."
              delay={0.1}
            />
            <FeatureCard 
              icon={FaVideo}
              title="Live Chef Cam"
              description="Build ultimate trust. Let customers watch their favorite dishes being prepared live."
              delay={0.2}
            />
            <FeatureCard 
              icon={FaRocket}
              title="Order with Google"
              description="Seamless integration with Google Search and Maps. Turn searchers into customers instantly."
              delay={0.3}
            />
            <FeatureCard 
              icon={FaShieldAlt}
              title="Fraud Protection"
              description="Enterprise-grade chargeback protection and secure payment processing for every order."
              delay={0.4}
            />
          </div>
        </div>

        {/* Subtle Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none opacity-20">
          <div className="absolute top-20 left-10 w-64 h-64 bg-blue-100 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-100 rounded-full blur-[150px]" />
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-32 px-4 bg-zinc-900 text-white rounded-[4rem] mx-4 mb-20 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter">100% Profit. 0% BS.</h2>
            <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-12 font-medium leading-relaxed">
              Delivery platforms take 30% of your hard work. We think that's insane. 
              LOCL is the first platform built to be free at its core, so you can keep what you earn.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left mt-20">
              <div>
                <h4 className="text-2xl font-bold mb-4 flex items-center gap-3 italic">
                  <span className="text-indigo-500 not-italic">01.</span> Setup
                </h4>
                <p className="text-zinc-500 font-medium leading-relaxed">Simple, fast, and free. Launch your own ordering site in under 10 minutes without a single fee.</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold mb-4 flex items-center gap-3 italic">
                  <span className="text-indigo-500 not-italic">02.</span> Transact
                </h4>
                <p className="text-zinc-500 font-medium leading-relaxed">Customers pay you directly. We never touch your revenue or charge you a commission per order.</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold mb-4 flex items-center gap-3 italic">
                  <span className="text-indigo-500 not-italic">03.</span> Scale
                </h4>
                <p className="text-zinc-500 font-medium leading-relaxed">As you grow, unlock premium modules like GPS tracking and AI analytics to supercharge your kitchen.</p>
              </div>
            </div>
          </motion.div>
        </div>
        {/* Subtle glow */}
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-indigo-600/20 blur-[150px] rounded-full" />
      </section>

      {/* Feature Deep Dive */}
      <section className="py-32 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-indigo-600 font-black uppercase tracking-widest text-sm mb-4 block">Premium Module</span>
              <h2 className="text-5xl md:text-6xl font-black mb-8 tracking-tight">The "Chef's Eye" Experience.</h2>
              <p className="text-xl text-zinc-500 font-medium leading-relaxed mb-10">
                Give your customers a VIP view into your kitchen. Live streaming your preparation build ultimate trust and turns a simple meal into an event.
              </p>
              <ul className="space-y-4 mb-12">
                <li className="flex items-center gap-3 font-bold text-black italic">
                  <FaCheck className="text-indigo-600 not-italic" /> High-definition low-latency stream
                </li>
                <li className="flex items-center gap-3 font-bold text-black italic">
                  <FaCheck className="text-indigo-600 not-italic" /> Automated streaming triggers
                </li>
                <li className="flex items-center gap-3 font-bold text-black italic">
                  <FaCheck className="text-indigo-600 not-italic" /> Increases customer retention by 40%
                </li>
              </ul>
              <Link href="/register" className="inline-flex items-center gap-2 text-black font-black text-lg border-b-2 border-black pb-1 hover:gap-4 transition-all">
                Learn how it works <FaArrowRight />
              </Link>
            </motion.div>
            <div className="aspect-video bg-zinc-50 rounded-[3rem] border border-zinc-100 flex items-center justify-center relative overflow-hidden shadow-2xl">
               <div className="text-9xl grayscale opacity-10">📹</div>
               <div className="absolute top-8 right-8 flex items-center gap-2 bg-red-600 text-white px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-white" /> Live Feed
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Delivery Deep Dive */}
      <section className="py-32 px-4 bg-zinc-50 rounded-[4rem] mx-4 mb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1 aspect-video bg-white rounded-[3rem] border border-zinc-100 flex items-center justify-center relative overflow-hidden shadow-2xl group">
               {/* Map Grid Pattern */}
               <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
               <motion.div 
                className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl relative z-10"
                animate={{ 
                  x: [0, 50, 20, -30, 0],
                  y: [0, -30, 40, 10, 0]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
               >
                  <FaTruck className="text-xl" />
                  <div className="absolute -inset-4 bg-blue-600/20 rounded-full animate-ping" />
               </motion.div>
               <div className="absolute bottom-8 left-8 bg-black text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-[0.2em]">Live Signal: Active</div>
            </div>

            <motion.div
              className="order-1 lg:order-2"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-blue-600 font-black uppercase tracking-widest text-sm mb-4 block">Premium Module</span>
              <h2 className="text-5xl md:text-6xl font-black mb-8 tracking-tight">The "Elite Fleet" Module.</h2>
              <p className="text-xl text-zinc-500 font-medium leading-relaxed mb-10">
                Stop guessing. Start tracking. Our sub-second GPS engine gives you absolute visibility over your delivery operations, reducing costs and delighting customers.
              </p>
              <ul className="space-y-4 mb-12">
                <li className="flex items-center gap-3 font-bold text-black italic">
                  <FaCheck className="text-blue-600 not-italic" /> Sub-second GPS coordinate updates
                </li>
                <li className="flex items-center gap-3 font-bold text-black italic">
                  <FaCheck className="text-blue-600 not-italic" /> Automated driver routing & dispatch
                </li>
                <li className="flex items-center gap-3 font-bold text-black italic">
                  <FaCheck className="text-blue-600 not-italic" /> Real-time customer tracking links
                </li>
              </ul>
              <Link href="/register" className="inline-flex items-center gap-2 text-black font-black text-lg border-b-2 border-black pb-1 hover:gap-4 transition-all">
                Explore the Fleet Hub <FaArrowRight />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-20 border-t border-gray-50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs mb-10">Trusted by modern businesses worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-30 grayscale contrast-200">
            <div className="text-2xl font-black">RESTAURANTS</div>
            <div className="text-2xl font-black">STORES</div>
            <div className="text-2xl font-black">MARKETS</div>
            <div className="text-2xl font-black">CAFES</div>
          </div>
        </div>
      </section>
    </div>
  );
}
