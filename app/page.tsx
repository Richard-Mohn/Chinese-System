'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaVideo, FaRocket, FaShieldAlt, FaArrowRight } from 'react-icons/fa';

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
              className="inline-block px-4 py-1.5 mb-6 rounded-full bg-gray-50 border border-gray-100 text-sm font-medium tracking-wide text-gray-600"
            >
              Coming Summer 2026
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
              The 2026 standard for local commerce. 
              Built for profit, not platforms.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/register" className="group px-10 py-5 bg-zinc-900 text-white rounded-full font-bold text-lg flex items-center gap-3 hover:bg-black transition-all active:scale-95 shadow-xl">
                Join the Waitlist
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
              title="Zero Fees"
              description="Keep 100% of your hard-earned revenue. No predatory commissions, ever."
              delay={0.3}
            />
            <FeatureCard 
              icon={FaShieldAlt}
              title="Smart Insights"
              description="Advanced AI-driven analytics to optimize your inventory and staffing automatically."
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
