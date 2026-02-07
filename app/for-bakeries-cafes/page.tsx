'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaCoffee, FaBirthdayCake, FaArrowRight, FaCreditCard, FaBitcoin,
  FaMobileAlt, FaShieldAlt, FaChartLine, FaUsers, FaImage,
  FaCalendarAlt, FaGlobe, FaHeart
} from 'react-icons/fa';

interface FeatureCardProps { icon: any; title: string; description: string; delay: number; }
const FeatureCard = ({ icon: Icon, title, description, delay }: FeatureCardProps) => (
  <motion.div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 flex flex-col items-start text-left group hover:border-zinc-300 hover:shadow-xl transition-all duration-500"
    initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay }}>
    <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-gradient-to-br group-hover:from-pink-500 group-hover:to-rose-600 group-hover:text-white transition-all duration-500 shadow-sm">
      <Icon className="text-2xl" />
    </div>
    <h4 className="text-xl font-bold text-black mb-3">{title}</h4>
    <p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

interface StepProps { num: string; title: string; desc: string; delay: number; }
const Step = ({ num, title, desc, delay }: StepProps) => (
  <motion.div className="flex gap-6" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay }}>
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-lg shadow-pink-500/20">{num}</div>
    <div>
      <h4 className="text-lg font-bold text-black mb-1">{title}</h4>
      <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
    </div>
  </motion.div>
);

export default function ForBakeriesCafes() {
  return (
    <div className="min-h-screen bg-white/90">
      <section className="pt-36 pb-20 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-pink-50 border border-pink-100 text-xs font-black uppercase tracking-widest text-pink-600"
          >For Bakeries &amp; Cafés</motion.div>
          <motion.h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter text-zinc-900 text-balance" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            Bake It. Sell It. Own It<span className="text-pink-600">.</span>
          </motion.h1>
          <motion.p className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium max-w-3xl mx-auto mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            Pre-orders, custom cakes, catering trays, and daily specials — all from your own branded ordering site. Zero commissions. Zero middlemen. 100% yours.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="group px-10 py-5 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-full font-bold text-lg flex items-center gap-3 hover:shadow-xl hover:shadow-pink-500/20 transition-all">
              Start Free Today <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/pricing" className="px-10 py-5 bg-white text-black border-2 border-zinc-200 rounded-full font-bold text-lg hover:border-black transition-all">
              View Pricing
            </Link>
          </motion.div>
        </div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-pink-100 rounded-full blur-[120px] opacity-30" />
      </section>

      <section className="py-24 px-4 bg-zinc-50/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-pink-600 font-black uppercase tracking-widest text-xs mb-3 block">Built for Bakeries</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Everything you need to sell online.</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Home bakers, patisseries, coffee shops, dessert bars — MohnMenu works for all of you.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={FaCalendarAlt} title="Pre-Orders & Custom Cakes" description="Let customers place orders days in advance. Custom cake requests with flavor, size, and decoration options — all handled through your menu." delay={0.05} />
            <FeatureCard icon={FaImage} title="Beautiful Product Pages" description="Showcase your creations with high-quality photos. Pastries, breads, drinks — each item gets a gorgeous listing that sells itself." delay={0.1} />
            <FeatureCard icon={FaCreditCard} title="Card & Mobile Payments" description="Stripe-powered checkout with Apple Pay and Google Pay. Customers pay you directly — funds settle into your bank account." delay={0.15} />
            <FeatureCard icon={FaBitcoin} title="Crypto Payments" description="Accept Bitcoin and 7 other cryptocurrencies. Customers scan a QR from Cash App or any wallet — instant, zero-fee settlement." delay={0.2} />
            <FeatureCard icon={FaMobileAlt} title="Your Own Branded Site" description="Custom URL, your colors, your logo. Customers see YOUR brand, not a third-party marketplace. Share the link on Instagram and TikTok." delay={0.25} />
            <FeatureCard icon={FaShieldAlt} title="Fraud Protection" description="Every digital transaction is covered. Automatic chargeback prevention at no extra cost to you." delay={0.3} />
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-zinc-950 text-white rounded-[3rem] mx-4 mb-6 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <span className="text-pink-400 font-black uppercase tracking-widest text-xs mb-3 block">Why Bakers Choose Us</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Built for creative food businesses.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FaBirthdayCake, title: 'Custom Orders', desc: 'Cake order forms with flavor, size, and special instructions built right in.' },
              { icon: FaCoffee, title: 'Daily Specials', desc: 'Update your menu in real-time. Today\'s scone flavor? Change it in seconds.' },
              { icon: FaHeart, title: 'Loyalty & Repeats', desc: 'Customers can reorder their favorites with one tap. Build your regulars list.' },
              { icon: FaUsers, title: 'Catering Trays', desc: 'Offer catering packages with advance ordering and custom quantities.' },
            ].map((item, i) => (
              <motion.div key={i} className="bg-zinc-900/60 p-8 rounded-3xl border border-zinc-800" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <item.icon className="text-2xl text-pink-400 mb-4" />
                <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-pink-600/10 blur-[150px] rounded-full" />
      </section>

      <section className="py-24 px-4 bg-zinc-50 rounded-[3rem] mx-4 mb-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <span className="text-pink-600 font-black uppercase tracking-widest text-xs mb-3 block">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Sell online in 10 minutes.</h2>
          </div>
          <div className="space-y-10">
            <Step num="1" title="Create your bakery profile" desc="Sign up free — add your bakery name, upload your logo, pick a custom URL. Your branded storefront auto-generates instantly." delay={0.1} />
            <Step num="2" title="Add your menu" desc="Upload pastries, breads, drinks, and specials with photos, prices, sizes, and customization options. Update anytime from your phone." delay={0.2} />
            <Step num="3" title="Connect payments" desc="Link Stripe in 5 minutes for card payments. Toggle crypto on with one switch. Enable cash pickup if you prefer." delay={0.3} />
            <Step num="4" title="Share everywhere" desc="Post your ordering link on Instagram, TikTok, Facebook, and Google. Print QR codes for your counter and packaging." delay={0.4} />
            <Step num="5" title="Bake and grow" desc="Receive orders on any device. Track best-sellers, manage pre-orders, and add delivery when you're ready to expand." delay={0.5} />
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl bg-gradient-to-r from-pink-500 to-rose-600 rounded-[3rem] p-10 md:p-16 text-white shadow-2xl text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Stop giving Uber Eats 30% of your cupcakes.</h2>
          <p className="text-pink-100 text-lg mb-10 max-w-xl mx-auto">MohnMenu is free to start. Zero commission. Your customers. Your revenue.</p>
          <Link href="/register" className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-pink-600 rounded-full font-bold text-lg hover:bg-pink-50 transition-all">
            Get Started Free <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
