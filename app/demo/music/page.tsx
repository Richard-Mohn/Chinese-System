'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaArrowRight, FaPlay, FaMusic, FaSpotify, FaYoutube,
  FaInstagram, FaTiktok, FaTwitter, FaShoppingBag,
  FaTicketAlt, FaCompactDisc, FaHeadphones, FaGuitar,
  FaMicrophone, FaMapMarkerAlt, FaCalendarAlt, FaStar,
  FaTshirt, FaEnvelope, FaChartLine, FaStore, FaMobileAlt,
  FaQrcode
} from 'react-icons/fa';
import FloatingStoreIcons from '@/components/FloatingStoreIcons';

const DEMO_TRACKS = [
  { title: 'Midnight Boulevard', duration: '3:42', plays: '12.4K', album: 'Neon Dreams' },
  { title: 'Electric Rain', duration: '4:15', plays: '8.7K', album: 'Neon Dreams' },
  { title: 'City of Ghosts', duration: '3:58', plays: '15.2K', album: 'Shadows & Light' },
  { title: 'Velvet Sunday', duration: '5:01', plays: '6.3K', album: 'Shadows & Light' },
  { title: 'Broken Satellites', duration: '3:33', plays: '22.1K', album: 'Orbit' },
  { title: 'Fade to Gold', duration: '4:28', plays: '9.8K', album: 'Orbit' },
];

const DEMO_MERCH = [
  { name: 'Neon Dreams Tour Tee', price: '$35', image: '🎤', category: 'Apparel' },
  { name: 'Orbit Vinyl LP', price: '$29', image: '💿', category: 'Music' },
  { name: 'Signed Poster Bundle', price: '$45', image: '🖼️', category: 'Collectibles' },
  { name: 'Logo Snapback', price: '$28', image: '🧢', category: 'Apparel' },
  { name: 'Shadows & Light CD', price: '$15', image: '📀', category: 'Music' },
  { name: 'VIP Meet & Greet Pass', price: '$150', image: '⭐', category: 'Experiences' },
];

const DEMO_TOUR = [
  { date: 'Jul 12', city: 'Richmond, VA', venue: 'The National', status: 'On Sale' },
  { date: 'Jul 19', city: 'Washington, DC', venue: '9:30 Club', status: 'On Sale' },
  { date: 'Jul 26', city: 'Philadelphia, PA', venue: 'Union Transfer', status: 'Low Tickets' },
  { date: 'Aug 2', city: 'New York, NY', venue: 'Brooklyn Steel', status: 'Sold Out' },
  { date: 'Aug 9', city: 'Boston, MA', venue: 'Paradise Rock Club', status: 'On Sale' },
];

const PLATFORM_FEATURES = [
  { icon: FaMusic, title: 'Track Showcase', desc: 'Display your full catalog with album art, play counts, and direct links to Spotify, Apple Music, and YouTube.' },
  { icon: FaShoppingBag, title: 'Merch Store', desc: 'Sell t-shirts, vinyl, posters, and digital downloads. Stripe checkout with zero commission.' },
  { icon: FaTicketAlt, title: 'Tour Dates', desc: 'Interactive tour calendar with venue info, ticket links, and a map of upcoming shows.' },
  { icon: FaMicrophone, title: 'Jukebox & Requests', desc: 'Fans queue songs at your venue. Credit-based system with karaoke mode for bars and events.' },
  { icon: FaHeadphones, title: 'Now Playing Display', desc: 'TV/screen display showing current track, album art, and queue. Perfect for venues and streams.' },
  { icon: FaEnvelope, title: 'Fan Mailing List', desc: 'Capture emails for new releases, tour announcements, and exclusive content. Per-artist lists.' },
  { icon: FaChartLine, title: 'Artist Analytics', desc: 'Track plays, merch sales, fan demographics, and revenue. Growth+ tier includes full dashboard.' },
  { icon: FaQrcode, title: 'QR Code Integration', desc: 'Print QR codes for merch tables, posters, and flyers. Fans scan to buy or follow instantly.' },
  { icon: FaStore, title: 'White-Label Site', desc: 'Your own branded website with custom colors, logo, and domain. SEO-optimized and auto-generated.' },
];

export default function MusicDemoPage() {
  return (
    <div className="min-h-screen bg-white/90">
      {/* Hero */}
      <section className="pt-36 pb-20 px-4 relative overflow-hidden">
        <FloatingStoreIcons storeType="default" count={16} position="absolute" />
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-violet-50 border border-violet-100 text-xs font-black uppercase tracking-widest text-violet-600"
          >Music Artist Demo</motion.div>
          <motion.h1
            className="text-5xl md:text-8xl font-black mb-6 tracking-tighter text-zinc-900 text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Neon Voltage<span className="text-violet-500">.</span>
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium max-w-3xl mx-auto mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            This is what your fans see. A complete artist storefront — tracks, merch, tour dates, and a jukebox. All on MohnMenu, zero commission.
          </motion.p>
          <motion.p
            className="text-sm text-zinc-400 font-medium mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Demo artist profile — see exactly what you get as a MohnMenu music artist.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="flex flex-wrap justify-center gap-4">
            <Link href="/for-music-artists" className="group px-10 py-5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-full font-bold text-lg flex items-center gap-3 hover:shadow-xl hover:shadow-violet-500/20 transition-all">
              <FaPlay className="text-sm" /> Get Your Artist Page
            </Link>
            <Link href="/pricing" className="group px-10 py-5 bg-white text-black border-2 border-zinc-200 rounded-full font-bold text-lg hover:border-black transition-all flex items-center gap-3">
              <FaStore /> View Pricing
            </Link>
          </motion.div>
          {/* Social links */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex justify-center gap-4 mt-8">
            {[
              { icon: FaSpotify, color: 'hover:text-green-500', label: 'Spotify' },
              { icon: FaYoutube, color: 'hover:text-red-500', label: 'YouTube' },
              { icon: FaInstagram, color: 'hover:text-pink-500', label: 'Instagram' },
              { icon: FaTiktok, color: 'hover:text-zinc-900', label: 'TikTok' },
              { icon: FaTwitter, color: 'hover:text-blue-400', label: 'Twitter' },
            ].map((s, i) => (
              <button key={i} className={`w-11 h-11 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400 ${s.color} transition-colors`} title={s.label}>
                <s.icon className="text-lg" />
              </button>
            ))}
          </motion.div>
        </div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-100 rounded-full blur-[120px] opacity-30" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-100 rounded-full blur-[120px] opacity-20" />
      </section>

      {/* Stats Bar */}
      <section className="py-8 bg-gradient-to-r from-violet-500 to-purple-600 text-white">
        <div className="container mx-auto max-w-4xl px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { stat: '3', label: 'Albums' },
            { stat: '18', label: 'Tracks' },
            { stat: '74.5K', label: 'Total Plays' },
            { stat: '5', label: 'Tour Dates' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div className="text-3xl md:text-4xl font-black">{s.stat}</div>
              <div className="text-violet-200 text-sm font-bold uppercase tracking-wider">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Track List */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <span className="text-violet-600 font-black uppercase tracking-widest text-xs mb-3 block">Latest Tracks</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Listen now<span className="text-violet-500">.</span></h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Your top tracks with play counts and streaming links. Fans click straight to Spotify or YouTube.</p>
          </div>
          <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
            {DEMO_TRACKS.map((track, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 hover:bg-violet-50 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center text-violet-500 group-hover:bg-violet-200 transition-colors">
                    <FaPlay className="text-xs" />
                  </div>
                  <div>
                    <div className="font-bold text-zinc-900">{track.title}</div>
                    <div className="text-xs text-zinc-400">{track.album}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-xs text-zinc-400 hidden sm:block">{track.plays} plays</span>
                  <span className="text-xs text-zinc-400">{track.duration}</span>
                  <div className="flex items-center gap-2">
                    <button className="text-green-500 hover:text-green-600 transition-colors" title="Play on Spotify"><FaSpotify /></button>
                    <button className="text-red-500 hover:text-red-600 transition-colors" title="Watch on YouTube"><FaYoutube /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Merch Store */}
      <section className="py-24 px-4 bg-zinc-50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-violet-600 font-black uppercase tracking-widest text-xs mb-3 block">Merch Store</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Rep the band<span className="text-violet-500">.</span></h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Sell merch directly to fans. T-shirts, vinyl, posters, experiences. Stripe checkout, zero commission.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {DEMO_MERCH.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:border-violet-300 hover:shadow-lg transition-all group"
              >
                <div className="h-48 bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">
                  {item.image}
                </div>
                <div className="p-5">
                  <div className="text-xs text-violet-500 font-bold uppercase tracking-wider mb-1">{item.category}</div>
                  <h3 className="font-bold text-zinc-900 mb-2">{item.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xl text-zinc-900">{item.price}</span>
                    <button className="px-4 py-2 bg-violet-500 text-white text-sm font-bold rounded-full hover:bg-violet-600 transition-colors">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tour Dates */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <span className="text-violet-600 font-black uppercase tracking-widest text-xs mb-3 block">On the Road</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Tour dates<span className="text-violet-500">.</span></h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Upcoming shows with venue info and ticket links. Fans see everything in one place.</p>
          </div>
          <div className="space-y-4">
            {DEMO_TOUR.map((show, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-6 border border-zinc-200 hover:border-violet-300 hover:shadow-lg transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-violet-50 rounded-xl flex flex-col items-center justify-center text-violet-600">
                    <div className="text-xs font-bold uppercase">{show.date.split(' ')[0]}</div>
                    <div className="text-2xl font-black">{show.date.split(' ')[1]}</div>
                  </div>
                  <div>
                    <div className="font-bold text-lg text-zinc-900">{show.venue}</div>
                    <div className="text-sm text-zinc-400 flex items-center gap-1">
                      <FaMapMarkerAlt className="text-xs" /> {show.city}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    show.status === 'Sold Out' ? 'bg-red-50 text-red-500' :
                    show.status === 'Low Tickets' ? 'bg-amber-50 text-amber-600' :
                    'bg-emerald-50 text-emerald-600'
                  }`}>
                    {show.status}
                  </span>
                  {show.status !== 'Sold Out' && (
                    <button className="px-5 py-2 bg-violet-500 text-white text-sm font-bold rounded-full hover:bg-violet-600 transition-colors">
                      Get Tickets
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-24 px-4 bg-zinc-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-violet-600 font-black uppercase tracking-widest text-xs mb-3 block">What Artists Get</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Your music. Your store. Your fans<span className="text-violet-500">.</span></h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Everything a modern artist needs to connect with fans and sell directly — no middleman, no commission.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PLATFORM_FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-6 border border-zinc-200 hover:border-violet-300 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-violet-100 transition-colors">
                  <f.icon className="text-lg text-violet-600" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-zinc-900">{f.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Jukebox Preview */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl p-12 md:p-16 text-white"
          >
            <div className="text-6xl mb-6">🎵</div>
            <h2 className="text-3xl md:text-4xl font-black mb-4">Interactive Jukebox</h2>
            <p className="text-lg text-violet-200 mb-8 max-w-2xl mx-auto">
              Fans at your venue can request songs, queue tracks, and even do karaoke — all from their phone. 
              The Now Playing screen shows what&apos;s on and what&apos;s next on your TV or projector.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="px-6 py-3 bg-white/10 rounded-full text-sm font-bold">
                <FaHeadphones className="inline mr-2" /> Song Requests
              </div>
              <div className="px-6 py-3 bg-white/10 rounded-full text-sm font-bold">
                <FaMicrophone className="inline mr-2" /> Karaoke Mode
              </div>
              <div className="px-6 py-3 bg-white/10 rounded-full text-sm font-bold">
                <FaCompactDisc className="inline mr-2" /> Now Playing Display
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 bg-zinc-50">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
              Your fans deserve<br />better than Linktree<span className="text-violet-500">.</span>
            </h2>
            <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
              Give them a real storefront. Music, merch, tours, and a jukebox — all under your brand. Starting at $19.99/mo.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/for-music-artists" className="group px-12 py-5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-full font-bold text-lg flex items-center gap-3 hover:shadow-xl hover:shadow-violet-500/20 transition-all">
                Get Started <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/demo" className="group px-12 py-5 bg-white text-black border-2 border-zinc-200 rounded-full font-bold text-lg hover:border-black transition-all flex items-center gap-3">
                View All Demos
              </Link>
            </div>
            <p className="text-xs text-zinc-400 mt-6">14-day free trial. No credit card required. Cancel anytime.</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
