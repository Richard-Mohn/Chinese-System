'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaStore, FaArrowRight, FaCreditCard, FaBitcoin, FaMobileAlt,
  FaShieldAlt, FaCamera, FaSearch, FaImage, FaTags,
  FaBoxOpen, FaGem, FaPaintBrush, FaMagic
} from 'react-icons/fa';

interface FeatureCardProps { icon: any; title: string; description: string; delay: number; }
const FeatureCard = ({ icon: Icon, title, description, delay }: FeatureCardProps) => (
  <motion.div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 flex flex-col items-start text-left group hover:border-zinc-300 hover:shadow-xl transition-all duration-500"
    initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay }}>
    <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-gradient-to-br group-hover:from-amber-500 group-hover:to-orange-600 group-hover:text-white transition-all duration-500 shadow-sm">
      <Icon className="text-2xl" />
    </div>
    <h4 className="text-xl font-bold text-black mb-3">{title}</h4>
    <p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

interface StepProps { num: string; title: string; desc: string; delay: number; }
const Step = ({ num, title, desc, delay }: StepProps) => (
  <motion.div className="flex gap-6" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay }}>
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">{num}</div>
    <div>
      <h4 className="text-lg font-bold text-black mb-1">{title}</h4>
      <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
    </div>
  </motion.div>
);

export default function ForRetailShops() {
  return (
    <div className="min-h-screen bg-white/90">
      <section className="pt-36 pb-20 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-amber-50 border border-amber-100 text-xs font-black uppercase tracking-widest text-amber-700"
          >For Shops, Boutiques &amp; Antiques</motion.div>
          <motion.h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter text-zinc-900" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            Snap. List. Sell<span className="text-amber-600">.</span>
          </motion.h1>
          <motion.p className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium max-w-3xl mx-auto mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            Boutiques, antique shops, craft studios, gift stores, and thrift shops — list products online with AI-powered photo recognition that writes descriptions for you. Your own storefront, zero commission.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="group px-10 py-5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full font-bold text-lg flex items-center gap-3 hover:shadow-xl hover:shadow-amber-500/20 transition-all">
              Start Free Today <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/pricing" className="px-10 py-5 bg-white text-black border-2 border-zinc-200 rounded-full font-bold text-lg hover:border-black transition-all">
              View Pricing
            </Link>
          </motion.div>
        </div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-amber-100 rounded-full blur-[120px] opacity-30" />
      </section>

      {/* AI Smart Listing — the killer feature for retail */}
      <section className="py-24 px-4 bg-gradient-to-b from-amber-50 to-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-amber-600 font-black uppercase tracking-widest text-xs mb-3 block">AI-Powered</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Snap a photo. We write the listing.</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Our AI Smart Listing tool identifies products from photos, researches them online, and auto-generates professional descriptions, pricing suggestions, and SEO-optimized titles. Perfect for antique shops with unique inventory.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: FaCamera, title: 'Snap a Photo', desc: 'Take a picture of any product — a vintage lamp, handmade jewelry, a rare book, or a craft item.', color: 'from-amber-500 to-orange-500' },
              { icon: FaSearch, title: 'AI Identifies It', desc: 'Google Vision + AI search identifies the product, finds comparable listings, and researches market pricing.', color: 'from-orange-500 to-red-500' },
              { icon: FaMagic, title: 'Auto-Generates Listing', desc: 'Title, description, category, condition, and suggested price — all pre-filled. You review and publish.', color: 'from-red-500 to-pink-500' },
              { icon: FaStore, title: 'Live on Your Store', desc: 'Beautiful product page with photos, description, and Buy Now button. Customers browse and purchase online.', color: 'from-pink-500 to-purple-500' },
            ].map((item, i) => (
              <motion.div key={i} className="text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg`}>
                  <item.icon className="text-2xl" />
                </div>
                <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-zinc-50/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-amber-600 font-black uppercase tracking-widest text-xs mb-3 block">Core Platform</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Your online shop. Zero middlemen.</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">No Etsy fees. No eBay commissions. No Amazon competing against you. YOUR brand, YOUR customers, YOUR revenue.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={FaImage} title="Beautiful Product Pages" description="Each product gets a professional listing with photos, description, price, and Buy Now button. Your store looks as polished as any major retailer." delay={0.05} />
            <FeatureCard icon={FaTags} title="Categories & Collections" description="Organize products into categories, collections, and featured items. Create seasonal collections, new arrivals, and sale sections." delay={0.1} />
            <FeatureCard icon={FaCreditCard} title="Secure Payments" description="Stripe-powered checkout with Apple Pay and Google Pay. Customers pay you directly — funds hit your bank account." delay={0.15} />
            <FeatureCard icon={FaBitcoin} title="Crypto Payments" description="Accept Bitcoin and 7 other cryptocurrencies. Antique collectors and art buyers love paying with crypto — capture that market." delay={0.2} />
            <FeatureCard icon={FaMobileAlt} title="White-Label Storefront" description="Custom URL, your branding, your colors. Share on Instagram, Facebook Marketplace, and Google — all traffic goes to YOUR site." delay={0.25} />
            <FeatureCard icon={FaShieldAlt} title="Fraud Protection" description="Automatic chargeback coverage on every transaction. Sell high-value items with confidence." delay={0.3} />
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-zinc-950 text-white rounded-[3rem] mx-4 mb-6 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <span className="text-amber-400 font-black uppercase tracking-widest text-xs mb-3 block">Built for Retail</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Perfect for unique businesses.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FaGem, title: 'Antique Shops', desc: 'AI identifies vintage items from photos and helps you write accurate, search-optimized descriptions.' },
              { icon: FaPaintBrush, title: 'Artisan & Craft', desc: 'Handmade goods, custom orders, and made-to-order items with customization options built in.' },
              { icon: FaBoxOpen, title: 'Gift & Boutique', desc: 'Curated collections, gift wrapping options, and seasonal refreshes — all managed from your phone.' },
              { icon: FaStore, title: 'Thrift & Consignment', desc: 'High-turnover inventory? List items fast with AI, mark sold instantly, and keep your catalog fresh.' },
            ].map((item, i) => (
              <motion.div key={i} className="bg-zinc-900/60 p-8 rounded-3xl border border-zinc-800" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <item.icon className="text-2xl text-amber-400 mb-4" />
                <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-amber-600/10 blur-[150px] rounded-full" />
      </section>

      <section className="py-24 px-4 bg-zinc-50 rounded-[3rem] mx-4 mb-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <span className="text-amber-600 font-black uppercase tracking-widest text-xs mb-3 block">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">List your first product in 60 seconds.</h2>
          </div>
          <div className="space-y-10">
            <Step num="1" title="Create your shop" desc="Sign up free. Name your store, upload your logo, and pick a custom URL. Your branded storefront is ready instantly." delay={0.1} />
            <Step num="2" title="Snap & list products" desc="Take a photo of any item. Our AI identifies it, writes a professional description, and suggests pricing. Review and publish." delay={0.2} />
            <Step num="3" title="Connect payments" desc="Link Stripe for card payments. Enable crypto for collectors. Toggle cash for local pickup. All ready in minutes." delay={0.3} />
            <Step num="4" title="Share everywhere" desc="Post your store link on Instagram, Facebook, Google, and community groups. Print QR codes for your physical shop." delay={0.4} />
            <Step num="5" title="Sell and grow" desc="Get notified of new orders. Ship or arrange pickup. Track best-sellers and add new inventory with AI-assisted listings." delay={0.5} />
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl bg-gradient-to-r from-amber-500 to-orange-600 rounded-[3rem] p-10 md:p-16 text-white shadow-2xl text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Your shop deserves its own storefront.</h2>
          <p className="text-amber-100 text-lg mb-10 max-w-xl mx-auto">No Etsy fees. No eBay listings. AI-powered product pages that sell. Free to start.</p>
          <Link href="/register" className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-amber-700 rounded-full font-bold text-lg hover:bg-amber-50 transition-all">
            Get Started Free <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
