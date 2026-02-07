'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaArrowRight, FaClock } from 'react-icons/fa';

interface ContactMethodProps {
  icon: any;
  title: string;
  detail: string;
  sub?: string;
  delay: number;
}

const ContactMethod = ({ icon: Icon, title, detail, sub, delay }: ContactMethodProps) => (
  <motion.div
    className="bg-white p-8 rounded-2xl border border-zinc-100 flex flex-col items-start text-left shadow-sm hover:shadow-lg hover:border-zinc-300 transition-all duration-500"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
  >
    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-5 text-orange-600">
      <Icon className="text-xl" />
    </div>
    <h4 className="text-lg font-bold text-black mb-1">{title}</h4>
    <p className="text-zinc-600 font-semibold">{detail}</p>
    {sub && <p className="text-zinc-400 text-sm mt-1">{sub}</p>}
  </motion.div>
);

export default function Contact() {
  return (
    <div className="min-h-screen bg-white/90 pt-36 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-orange-50 border border-orange-100 text-xs font-black uppercase tracking-widest text-orange-600"
          >Get In Touch</motion.div>
          <motion.h1
            className="text-5xl md:text-8xl font-black mb-6 tracking-tighter text-zinc-900 text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Let&apos;s Talk<span className="text-orange-500">.</span>
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Have a question about the platform, pricing, or integrations? Our team is here to help you transition to commission-free ordering.
          </motion.p>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          <ContactMethod icon={FaPhone} title="Phone" detail="(804) 605-1461" sub="Mon – Fri, 9am – 6pm EST" delay={0.1} />
          <ContactMethod icon={FaEnvelope} title="Email" detail="hello@mohnmenu.com" sub="We reply within 24 hours" delay={0.15} />
          <ContactMethod icon={FaMapMarkerAlt} title="Address" detail="23 Shore St." sub="Petersburg, VA 23803" delay={0.2} />
          <ContactMethod icon={FaClock} title="Support" detail="24/7 Platform Support" sub="For Growth & Enterprise" delay={0.25} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <motion.div
              className="bg-white p-10 rounded-3xl border border-zinc-100 shadow-sm"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-3xl font-black text-black mb-8 tracking-tight">Send a Message</h2>
              <form className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Full Name</label>
                    <input type="text" className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Email Address</label>
                    <input type="email" className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all" placeholder="john@company.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Business Name</label>
                  <input type="text" className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all" placeholder="The Local Cafe" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Phone Number</label>
                    <input type="tel" className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all" placeholder="(555) 123-4567" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Business Type</label>
                    <select className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-zinc-600">
                      <option>Restaurant</option>
                      <option>Convenience Store</option>
                      <option>Grocery / Market</option>
                      <option>Smoke Shop</option>
                      <option>Liquor Store</option>
                      <option>Other Retail</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Message</label>
                  <textarea rows={5} className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none" placeholder="Tell us about your business and how we can help..." />
                </div>
                <button className="w-full py-5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-bold text-lg shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                  Submit Inquiry <FaArrowRight className="text-sm" />
                </button>
              </form>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-8 text-white shadow-2xl shadow-orange-500/20 relative overflow-hidden"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h3 className="text-2xl font-bold mb-3 relative z-10">Book a Live Demo</h3>
              <p className="text-orange-100 font-medium mb-6 relative z-10 leading-relaxed">
                See MohnMenu in action. We&apos;ll walk you through the full platform — ordering, payments, tracking, and analytics.
              </p>
              <button className="px-8 py-3 bg-white text-orange-600 rounded-full font-black text-sm hover:bg-orange-50 transition-all relative z-10 shadow-lg">
                Schedule 15-Min Call
              </button>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            </motion.div>

            <motion.div
              className="bg-zinc-950 rounded-3xl p-8 text-white relative overflow-hidden"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h3 className="text-xl font-bold mb-3 relative z-10">Looking for support?</h3>
              <p className="text-zinc-400 font-medium mb-5 relative z-10 text-sm leading-relaxed">
                Already a MohnMenu partner? Growth and Enterprise plans include 24/7 priority support.
              </p>
              <Link href="/login" className="inline-block px-8 py-3 bg-zinc-800 text-white rounded-full font-bold text-sm hover:bg-zinc-700 transition-all relative z-10">
                Sign In to Dashboard
              </Link>
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-orange-600/5 to-transparent blur-2xl pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
