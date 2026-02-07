'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FaGlobe, FaArrowRight, FaPalette, FaSearch, FaMapMarkerAlt,
  FaMobileAlt, FaCode, FaLink, FaListAlt, FaGlobeAmericas
} from 'react-icons/fa';

const FEATURES = [
  { icon: FaPalette, title: '8-Step Website Builder', desc: 'Guided wizard: choose your cuisine, store categories, services, service areas, menu highlights, content, custom domain, and review. No coding required.' },
  { icon: FaSearch, title: 'Built-In SEO', desc: 'Every page is server-rendered with proper OpenGraph tags, Twitter cards, meta descriptions, and structured data. Google indexes your site automatically.' },
  { icon: FaMapMarkerAlt, title: 'City & Service Area Pages', desc: 'Auto-generated location pages for every city you serve. Each one is SEO-optimized with your business info and services for that area.' },
  { icon: FaListAlt, title: '11 Service Verticals', desc: 'Online ordering, delivery, takeout, dine-in, catering, convenience store, grocery, bakery, meal prep, food truck, family packs — each gets its own page.' },
  { icon: FaMobileAlt, title: 'Mobile-First Design', desc: 'Clean, modern responsive design that looks great on phones, tablets, and desktops. Navigation, hero, services, and CTA — all optimized for every screen.' },
  { icon: FaGlobeAmericas, title: 'Custom Domain Support', desc: 'Connect your own domain (e.g., yourrestaurant.com) to your MohnMenu-hosted storefront. Configure in the Website Builder.' },
  { icon: FaCode, title: 'Zero MohnMenu Branding', desc: 'Your storefront shows your business name, your branding, and your content. Only a small "Powered by MohnMenu" in the footer.' },
  { icon: FaLink, title: 'Instant Live URL', desc: 'Your site is live immediately at mohnmenu.com/your-slug as soon as you complete onboarding. No deploy steps required.' },
  { icon: FaGlobe, title: 'Server-Side Rendering', desc: 'All tenant pages are server-rendered in Next.js for fast load times and optimal SEO. No client-side JS needed for initial content.' },
];

const FAQS = [
  {
    q: 'Do I need to know how to code?',
    a: 'No. The Website Builder is a step-by-step wizard. You pick your cuisine type, select services, enter your content, and your website is generated automatically with proper SEO and responsive design.',
  },
  {
    q: 'What pages does my website include?',
    a: 'Your storefront includes a Homepage (hero, services, about preview, CTA), Menu page, About page, Contact page, Service pages for each service you offer, and location-specific pages for each city in your service area.',
  },
  {
    q: 'How does SEO work?',
    a: 'Every page is server-rendered with generateMetadata in Next.js. This includes proper title tags, meta descriptions, OpenGraph images, Twitter cards, and robots directives. Google can index all your pages immediately.',
  },
  {
    q: 'Can I use my own domain?',
    a: 'Yes. In the Website Builder, there\'s a Custom Domain step where you can enter your domain. You\'ll need to point your domain\'s DNS to our servers. Otherwise, your site is available at mohnmenu.com/your-business-slug.',
  },
  {
    q: 'Is MohnMenu branding shown on my site?',
    a: 'Your storefront is white-labeled. Your business name appears in the navigation, your content fills the pages, and only a small "Powered by MohnMenu" appears in the footer.',
  },
  {
    q: 'How are service area pages generated?',
    a: 'In the Website Builder, you select which cities/areas you serve. For each one, an SEO-optimized page is automatically generated with your business name, services, and area-specific content — helping you rank for local searches.',
  },
];

export default function WhiteLabelWebsiteFeature() {
  return (
    <div className="min-h-screen bg-white/90">
      {/* Hero */}
      <section className="pt-36 pb-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-purple-50 border border-purple-100 text-xs font-black uppercase tracking-widest text-purple-600"
          >Feature</motion.div>
          <motion.h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-zinc-900 text-balance"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          >
            White-Label Website<span className="text-orange-600">.</span>
          </motion.h1>
          <motion.p className="text-xl text-zinc-500 leading-relaxed font-medium max-w-3xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            Your own branded website with SEO, service area pages, and a menu — 
            built automatically when you sign up. No coding, no designers, no monthly web hosting fees.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Link href="/register" className="group inline-flex items-center gap-3 px-8 py-4 bg-black text-white rounded-full font-bold text-lg hover:bg-zinc-800 transition-all shadow-2xl">
              Build Your Site <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-zinc-50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-black text-black mb-12 tracking-tight text-center">How It Works<span className="text-orange-500">.</span></h2>
          <div className="space-y-8">
            {[
              { n: '1', t: 'Complete onboarding', d: 'Pick your business type, enter your name and address. Your site goes live immediately at mohnmenu.com/your-slug.' },
              { n: '2', t: 'Customize with the Website Builder', d: 'The 8-step wizard lets you refine your services, content, service areas, and branding. All changes go live instantly.' },
              { n: '3', t: 'Customers find you', d: 'Server-rendered pages with built-in SEO help you rank in Google. Each service and city gets its own indexable page.' },
              { n: '4', t: 'They order directly', d: 'Your Order Now button takes customers straight to your ordering page — card, crypto, or cash. Zero commission.' },
            ].map((step, i) => (
              <motion.div key={i} className="flex gap-6" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">{step.n}</div>
                <div>
                  <h4 className="text-lg font-bold text-black mb-1">{step.t}</h4>
                  <p className="text-zinc-500 text-sm leading-relaxed">{step.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-black text-black mb-12 tracking-tight text-center">What&apos;s Included<span className="text-orange-500">.</span></h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={i} className="bg-zinc-50 p-8 rounded-3xl border border-zinc-100 group hover:border-zinc-300 hover:shadow-lg transition-all"
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-5 group-hover:bg-black group-hover:text-white transition-all shadow-sm">
                  <f.icon className="text-xl" />
                </div>
                <h4 className="text-lg font-bold text-black mb-2">{f.title}</h4>
                <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-zinc-50">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-black text-black mb-12 tracking-tight text-center">Questions & Answers<span className="text-orange-500">.</span></h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <motion.details key={i} className="group bg-white rounded-2xl border border-zinc-100 overflow-hidden"
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <summary className="px-6 py-5 cursor-pointer font-bold text-black flex items-center justify-between hover:bg-zinc-50 transition-colors">
                  {faq.q}
                  <span className="text-orange-500 text-xl ml-4 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-6 pb-5 text-sm text-zinc-500 leading-relaxed">{faq.a}</div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-black text-black mb-4 tracking-tight">Your site, your brand.</h2>
          <p className="text-zinc-500 font-medium mb-8">Live in minutes. SEO built in. No coding.</p>
          <Link href="/register" className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full font-bold text-lg shadow-xl shadow-orange-500/20 hover:shadow-2xl transition-all">
            Get Started Free <FaArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}
