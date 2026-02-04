'use client';

import { motion } from 'framer-motion';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-transparent pt-40 pb-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter text-zinc-900">
            Privacy<span className="text-indigo-600">.</span>
          </h1>
          <p className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-12">Last Updated: February 2026</p>
          
          <div className="bg-white p-12 rounded-[3rem] border border-zinc-100 shadow-[0_10px_50px_rgba(0,0,0,0.02)] space-y-10 text-zinc-600 font-medium leading-relaxed">
            <section>
              <h2 className="text-2xl font-black text-black mb-4 tracking-tight uppercase italic">01. Our Stance</h2>
              <p>
                At LOCL, we believe your data belongs to you. Unlike other platforms, we do not sell your customer data, order history, or business insights. Our privacy framework is built to protect the independent spirit of local business.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-black mb-4 tracking-tight uppercase italic">02. Data Collection</h2>
              <p>
                We collect information necessary to facilitate ordering and delivery, including business names, contact details, and location data for GPS tracking modules. All data is encrypted and stored securely.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-black mb-4 tracking-tight uppercase italic">03. Usage of Information</h2>
              <p>
                The information we collect is used solely to provide and improve our services. This includes processing payments via Stripe, enabling live GPS tracking, and generating analytics for business owners.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-black mb-4 tracking-tight uppercase italic">04. Security</h2>
              <p>
                We implement enterprise-grade security measures to protect your information. Our platform uses standard SSL encryption and follows industry best practices for data retention and protection.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
