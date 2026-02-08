'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaCoffee, FaArrowRight, FaCreditCard, FaBitcoin, FaMobileAlt,
  FaShieldAlt, FaCalendarAlt, FaUsers, FaClock,
  FaListAlt, FaPercent, FaConciergeBell, FaStar,
  FaIdBadge, FaExchangeAlt, FaHeart, FaUserTie,
  FaTabletAlt, FaThLarge, FaMapMarkerAlt, FaBicycle
} from 'react-icons/fa';
import FloatingStoreIcons from '@/components/FloatingStoreIcons';

interface FeatureCardProps { icon: any; title: string; description: string; delay: number; }
const FeatureCard = ({ icon: Icon, title, description, delay }: FeatureCardProps) => (
  <motion.div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 flex flex-col items-start text-left group hover:border-zinc-300 hover:shadow-xl transition-all duration-500"
    initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay }}>
    <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-gradient-to-br group-hover:from-amber-600 group-hover:to-orange-700 group-hover:text-white transition-all duration-500 shadow-sm">
      <Icon className="text-2xl" />
    </div>
    <h4 className="text-xl font-bold text-black mb-3">{title}</h4>
    <p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

interface StepProps { num: string; title: string; desc: string; delay: number; }
const Step = ({ num, title, desc, delay }: StepProps) => (
  <motion.div className="flex gap-6" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay }}>
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600 to-orange-700 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">{num}</div>
    <div>
      <h4 className="text-lg font-bold text-black mb-1">{title}</h4>
      <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
    </div>
  </motion.div>
);

export default function ForCoffeeShops() {
  return (
    <div className="min-h-screen bg-white/90 relative">
      <FloatingStoreIcons storeType="default" count={16} position="fixed" />
      <section className="pt-36 pb-20 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-amber-50 border border-amber-100 text-xs font-black uppercase tracking-widest text-amber-700"
          >For Coffee Shops</motion.div>
          <motion.h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter text-zinc-900 text-balance" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            Brew. Order. Sip<span className="text-amber-700">.</span>
          </motion.h1>
          <motion.p className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium max-w-3xl mx-auto mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            Coffee shops, tea houses, and espresso bars — let customers order ahead, skip the line, and pay instantly. Mobile ordering, loyalty programs, and peer delivery — all in one platform.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="group px-10 py-5 bg-gradient-to-r from-amber-600 to-orange-700 text-white rounded-full font-bold text-lg flex items-center gap-3 hover:shadow-xl hover:shadow-amber-500/20 transition-all">
              Start Free Today <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/pricing" className="px-10 py-5 bg-white text-black border-2 border-zinc-200 rounded-full font-bold text-lg hover:border-black transition-all">
              View Pricing
            </Link>
          </motion.div>
        </div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-100 rounded-full blur-[120px] opacity-30" />
      </section>

      {/* Core Platform */}
      <section className="py-24 px-4 bg-zinc-50/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-amber-700 font-black uppercase tracking-widest text-xs mb-3 block">Core Platform</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">The modern coffee shop experience.</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Customers order ahead from their phone, skip the line, and pick up when it&apos;s ready — or get it delivered to their door.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={FaMobileAlt} title="Mobile Order-Ahead" description="Customers browse your full menu, customize their drink, and pay before they arrive. Their order is ready when they walk in — no waiting." delay={0.05} />
            <FeatureCard icon={FaListAlt} title="Full Digital Menu" description="Espresso drinks, cold brews, teas, pastries, sandwiches — with modifiers for size, milk type, extra shots, and flavors. Photos that sell." delay={0.1} />
            <FeatureCard icon={FaCreditCard} title="Instant Payments" description="Apple Pay, Google Pay, and all cards. No fumbling with cash in the morning rush — customers pay in seconds." delay={0.15} />
            <FeatureCard icon={FaBitcoin} title="Crypto Payments" description="Accept Bitcoin via Cash App QR and 7 other cryptocurrencies. Stand out from the chain coffee shops and attract the crypto crowd." delay={0.2} />
            <FeatureCard icon={FaCalendarAlt} title="Scheduled Orders" description="Let customers schedule their morning coffee the night before. Batch orders for office buildings, co-working spaces, and events." delay={0.25} />
            <FeatureCard icon={FaShieldAlt} title="Fraud Protection" description="Automatic chargeback coverage on every digital transaction. No stolen cards, no order disputes — just clean sales." delay={0.3} />
          </div>
        </div>
      </section>

      {/* Loyalty & Rewards */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-amber-700 font-black uppercase tracking-widest text-xs mb-3 block">Loyalty & Rewards</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Turn first-timers into regulars.</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Built-in loyalty program, order history, and favorites — your customers come back because you remember them.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={FaStar} title="Points System" description="Every dollar earns points. Customers redeem for free drinks, pastries, or discounts — all automatic, no paper punch cards." delay={0.05} />
            <FeatureCard icon={FaHeart} title="Saved Favorites" description="'My usual' is one tap away. Customers save their custom drinks and reorder in seconds every morning." delay={0.1} />
            <FeatureCard icon={FaConciergeBell} title="Order History" description="Full order history so regulars never forget their drink. Perfect for office coffee runs and group orders." delay={0.15} />
            <FeatureCard icon={FaUsers} title="Group Orders" description="Office manager collects everyone's order on one link. Submit as a batch — you make them all at once." delay={0.2} />
            <FeatureCard icon={FaClock} title="Rush Hour Insights" description="See your busiest times, most popular drinks, and slowest periods. Staff smarter and prep better." delay={0.25} />
            <FeatureCard icon={FaPercent} title="Happy Hour Specials" description="Schedule afternoon discounts on cold brews and pastries. Move inventory, fill slow hours, grow sales." delay={0.3} />
          </div>
        </div>
      </section>

      {/* Peer Delivery */}
      <section className="py-24 px-4 bg-gradient-to-b from-white to-zinc-100">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-amber-700 font-black uppercase tracking-widest text-xs mb-3 block">Peer Delivery</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Customers deliver for <span className="text-amber-700">each other.</span></h2>
            <p className="text-xl text-zinc-500 max-w-2xl mx-auto">A customer heading to the office can pick up a co-worker&apos;s order on the way — and earn a discount. More orders out the door, lower delivery costs, happier customers.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: FaBicycle, title: 'Peer Pickup', desc: 'Customers opt-in to carry nearby orders. They get a discount — you get more deliveries without hiring drivers.' },
              { icon: FaMapMarkerAlt, title: 'Proximity Match', desc: 'We match carriers with nearby orders automatically. Same office building, same block, same route.' },
              { icon: FaPercent, title: 'Earn Discounts', desc: 'Carriers get $1-$3 off their own order for each delivery. Cheaper than any delivery service.' },
              { icon: FaShieldAlt, title: 'Order Verification', desc: 'Photo confirmation, time tracking, and customer ratings. Every peer delivery is tracked and verified.' },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border border-amber-100 hover:border-amber-300 text-center">
                <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <f.icon className="text-amber-700 text-2xl" />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-500">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/features/peer-delivery" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-700 text-white rounded-full font-bold text-lg hover:shadow-xl hover:shadow-amber-500/20 transition-all">
              Learn About Peer Delivery <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Kiosk & In-Store */}
      <section className="py-24 px-4 bg-gradient-to-b from-white to-amber-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-amber-700 font-black uppercase tracking-widest text-xs mb-3 block">In-Store Experience</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Kiosk. QR. <span className="text-amber-700">Counter display.</span></h2>
            <p className="text-xl text-zinc-500 max-w-2xl mx-auto">Self-service kiosks, QR codes at the counter, and a dashboard that shows everything in real-time.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: FaTabletAlt, title: 'Self-Order Kiosk', desc: 'Tablet at the counter. Customers browse, customize, pay — no cashier needed during rush.' },
              { icon: FaMobileAlt, title: 'QR Code Ordering', desc: 'Table tents, window stickers, receipts — scan anywhere to order. No app download required.' },
              { icon: FaThLarge, title: 'Order Board', desc: 'Display screen shows order status. "Your latte is ready!" — customers know exactly when to grab it.' },
              { icon: FaCoffee, title: 'Barista KDS', desc: 'Kitchen display for baristas. See every order, mark items complete, track queue depth in real-time.' },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border border-amber-100 hover:border-amber-300 text-center">
                <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <f.icon className="text-amber-700 text-2xl" />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-500">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/features/kitchen-display" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-700 text-white rounded-full font-bold text-lg hover:shadow-xl hover:shadow-amber-500/20 transition-all">
              Explore KDS <FaArrowRight />
            </Link>
            <Link href="/demo/coffee" className="inline-flex items-center gap-2 px-8 py-4 border-2 border-amber-300 text-amber-700 rounded-full font-bold text-lg hover:bg-amber-50 transition-all">
              See Coffee Demo <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Staff Marketplace */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-amber-700 font-black uppercase tracking-widest text-xs mb-3 block">Staff Marketplace</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Your baristas, <span className="text-amber-700">everywhere.</span></h2>
            <p className="text-xl text-zinc-500 max-w-2xl mx-auto">Find experienced baristas, let staff work across multiple shops, and build a team that grows with you.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: FaIdBadge, title: 'Barista Profiles', desc: 'Staff build verified profiles with certifications, latte art skills, equipment experience, and reviews.' },
              { icon: FaUserTie, title: 'Multi-Shop Work', desc: 'Baristas pick up shifts at any participating coffee shop — one profile, many venues.' },
              { icon: FaHeart, title: 'Follow Favorites', desc: 'Customers follow their favorite barista. Get notified when they\'re making drinks at your shop.' },
              { icon: FaExchangeAlt, title: 'Shift Swapping', desc: 'Staff swap shifts with qualified peers — same skills, same standards, owner-approved.' },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border border-amber-100 hover:border-amber-300 text-center">
                <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <f.icon className="text-amber-700 text-2xl" />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-500">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/features/staff-marketplace" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-700 text-white rounded-full font-bold text-lg hover:shadow-xl hover:shadow-amber-500/20 transition-all">
              Explore Staff Marketplace <FaArrowRight />
            </Link>
            <Link href="/careers" className="inline-flex items-center gap-2 px-8 py-4 border-2 border-amber-300 text-amber-700 rounded-full font-bold text-lg hover:bg-amber-50 transition-all">
              Browse Careers <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Coffee Shops section */}
      <section className="py-24 px-4 bg-zinc-950 text-white rounded-[3rem] mx-4 mb-6 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <span className="text-amber-400 font-black uppercase tracking-widest text-xs mb-3 block">Built for Coffee</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Why coffee shops choose MohnMenu.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FaClock, title: 'Faster Service', desc: 'Customers order before they arrive. Your baristas just make drinks — no register bottleneck.' },
              { icon: FaCoffee, title: 'Higher Tickets', desc: 'Digital menus upsell pastries, extra shots, and add-ons automatically. Average order up 25%.' },
              { icon: FaPercent, title: 'Zero Commission', desc: 'Unlike DoorDash or Uber Eats, we never take a cut. Flat monthly pricing — keep every dollar.' },
              { icon: FaUsers, title: 'Regulars Return', desc: 'Order history, saved favorites, and loyalty points make your shop their daily habit.' },
            ].map((item, i) => (
              <motion.div key={i} className="bg-zinc-900/60 p-8 rounded-3xl border border-zinc-800" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <item.icon className="text-2xl text-amber-400 mb-4" />
                <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-amber-600/10 blur-[150px] rounded-full" />
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-zinc-50 rounded-[3rem] mx-4 mb-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <span className="text-amber-700 font-black uppercase tracking-widest text-xs mb-3 block">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Open before the morning rush.</h2>
          </div>
          <div className="space-y-10">
            <Step num="1" title="Create your coffee shop profile" desc="Sign up free. Add your shop name, logo, and hours. Your branded ordering page generates instantly." delay={0.1} />
            <Step num="2" title="Build your drink menu" desc="Add espresso drinks, cold brews, teas, pastries, and food with photos, sizes, modifiers, and prices." delay={0.2} />
            <Step num="3" title="Connect payments" desc="Link Stripe for cards. Enable crypto. Toggle cash. All payment methods ready in minutes." delay={0.3} />
            <Step num="4" title="Share your link & QR codes" desc="Print QR codes for the counter, window, and tables. Share your ordering link on social media and Google." delay={0.4} />
            <Step num="5" title="Serve and grow" desc="Orders appear on your barista KDS screen. Track best sellers, peak hours, and grow with loyalty rewards." delay={0.5} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl bg-gradient-to-r from-amber-600 to-orange-700 rounded-[3rem] p-10 md:p-16 text-white shadow-2xl text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Your coffee shop. Zero commission. Full control.</h2>
          <p className="text-amber-100 text-lg mb-10 max-w-xl mx-auto">Start free today. No credit card. No contract. Just better coffee shop operations and more sales.</p>
          <Link href="/register" className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-amber-800 rounded-full font-bold text-lg hover:bg-amber-50 transition-all">
            Get Started Free <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
