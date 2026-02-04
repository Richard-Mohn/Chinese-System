'use client';

import { motion } from 'framer-motion';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa';

interface ContactMethodProps {
  icon: any;
  title: string;
  detail: string;
  delay: number;
}

const ContactMethod = ({ icon: Icon, title, detail, delay }: ContactMethodProps) => (
  <motion.div
    className="bg-white p-10 rounded-[3rem] border border-zinc-100 flex flex-col items-start text-left shadow-[0_10px_50px_rgba(0,0,0,0.02)]"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
  >
    <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6 text-black">
      <Icon className="text-xl" />
    </div>
    <h4 className="text-lg font-bold text-black mb-2">{title}</h4>
    <p className="text-zinc-500 font-medium">{detail}</p>
  </motion.div>
);

export default function Contact() {
  return (
    <div className="min-h-screen bg-transparent pt-40 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.h1 
            className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-zinc-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Connect<span className="text-indigo-600">.</span>
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Have a question about our platform or premium modules? Our team is here to help you transition to a commission-free future.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
          <div className="lg:col-span-2">
            <motion.div 
              className="bg-white p-12 rounded-[3rem] border border-zinc-100 shadow-[0_20px_100px_rgba(0,0,0,0.04)]"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-3xl font-black text-black mb-10 tracking-tight">Send a Message</h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Full Name</label>
                    <input type="text" className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-black transition-all" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Email Address</label>
                    <input type="email" className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-black transition-all" placeholder="john@company.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Business Name</label>
                  <input type="text" className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-black transition-all" placeholder="The Local Cafe" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Message</label>
                  <textarea rows={5} className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-black transition-all resize-none" placeholder="How can we help?" />
                </div>
                <button className="w-full py-5 bg-black text-white rounded-full font-black text-lg shadow-xl hover:bg-zinc-800 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                  Submit Inquiry <FaArrowRight className="text-sm" />
                </button>
              </form>
            </motion.div>
          </div>

          <div className="space-y-6">
            <ContactMethod icon={FaEnvelope} title="Email" detail="hello@locl.com" delay={0.1} />
            <ContactMethod icon={FaPhone} title="Support" detail="+1 (888) 123-LOCL" delay={0.2} />
            <ContactMethod icon={FaMapMarkerAlt} title="Headquarters" detail="Petersburg, Virginia" delay={0.3} />
            
            <motion.div 
              className="p-10 rounded-[3rem] bg-indigo-600 text-white shadow-2xl relative overflow-hidden group"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <h3 className="text-2xl font-bold mb-4 relative z-10">Live Demo?</h3>
              <p className="text-indigo-100 font-medium mb-8 relative z-10 leading-relaxed">Book a 15-minute call with our solutions team.</p>
              <button className="px-8 py-3 bg-white text-indigo-600 rounded-full font-black text-sm hover:bg-indigo-50 transition-all relative z-10 shadow-lg">
                Schedule Now
              </button>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
