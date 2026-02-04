'use client';

import { motion } from 'framer-motion';

export default function Terms() {
  return (
    <div className="min-h-screen bg-transparent pt-40 pb-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter text-zinc-900">
            Terms<span className="text-blue-600">.</span>
          </h1>
          <p className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-12">Last Updated: February 2026</p>
          
          <div className="bg-white p-12 rounded-[3rem] border border-zinc-100 shadow-[0_10px_50px_rgba(0,0,0,0.02)] space-y-10 text-zinc-600 font-medium leading-relaxed">
            <section>
              <h2 className="text-2xl font-black text-black mb-4 tracking-tight uppercase italic">01. Acceptance</h2>
              <p>
                By using the LOCL platform, you agree to comply with our standards of fair play and community growth. Our service is provided to help local businesses thrive without the burden of predatory fees.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-black mb-4 tracking-tight uppercase italic">02. Fees & Payments</h2>
              <p>
                Our core platform is free. Premium modules are billed on a monthly subscription basis as per the selected Growth or Enterprise plan. All payments are processed securely via our partners.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-black mb-4 tracking-tight uppercase italic">03. User Conduct</h2>
              <p>
                Business owners are responsible for the accuracy of their menus and the quality of their service. LOCL provides the technology hub, while the business maintains full operational control.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-black mb-4 tracking-tight uppercase italic">04. Termination</h2>
              <p>
                Either party may terminate service at any time. As we believe in month-to-month freedom, there are no long-term contracts for our premium modules.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
