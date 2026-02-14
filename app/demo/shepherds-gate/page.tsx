'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FaArrowRight,
  FaPlay,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaHandsHelping,
  FaBroadcastTower,
  FaHeart,
  FaUsers,
  FaMusic,
  FaBible,
  FaDonate,
  FaTv,
  FaUserTie,
  FaVideo,
  FaDesktop,
} from 'react-icons/fa';
import FloatingStoreIcons from '@/components/FloatingStoreIcons';

const SERVICE_TIMES = [
  { day: 'Sunday', time: '9:00 AM', label: 'Classic Service' },
  { day: 'Sunday', time: '11:15 AM', label: 'Modern Worship' },
  { day: 'Wednesday', time: '7:00 PM', label: 'Midweek Prayer' },
];

const EVENTS = [
  { title: 'Marriage Night', date: 'Feb 18', desc: 'Live speakers, childcare, and dinner together.' },
  { title: 'Serve the City', date: 'Feb 22', desc: 'Neighborhood outreach with teams across RVA.' },
  { title: 'New Members Brunch', date: 'Mar 2', desc: 'Meet the pastors and learn the mission.' },
];

const MINISTRIES = [
  { title: 'Kids & Students', desc: 'Safe check-in, age-based classes, and youth nights.' },
  { title: 'Care & Counseling', desc: 'Pastoral care, prayer teams, and counseling requests.' },
  { title: 'Worship & Media', desc: 'Setlists, rehearsal schedules, and livestream tools.' },
  { title: 'Small Groups', desc: 'Find a group by life stage, interest, or neighborhood.' },
];

const FEATURES = [
  { icon: FaDonate, title: 'Digital Giving', desc: 'Recurring tithes, campaigns, and instant receipts.' },
  { icon: FaCalendarAlt, title: 'Events & RSVPs', desc: 'Publish events and track attendance in one place.' },
  { icon: FaUsers, title: 'Member Care', desc: 'Profiles, households, and pastoral follow-ups.' },
  { icon: FaBroadcastTower, title: 'Livestream Hub', desc: 'Stream services, archive sermons, and share media.' },
  { icon: FaHandsHelping, title: 'Volunteer Scheduling', desc: 'Automated rotations and reminders for every team.' },
  { icon: FaBible, title: 'Sermon Library', desc: 'Series, notes, and discussion guides organized.' },
];

const DEMO_ACCOUNTS = [
  {
    role: 'Pastor Admin',
    email: 'pastor@shepherdsgate.demo',
    desc: 'Dashboard, giving insights, events, and member care.',
  },
  {
    role: 'Media / AV',
    email: 'media@shepherdsgate.demo',
    desc: 'Streaming console, run of service, and media cues.',
  },
  {
    role: 'Volunteer Lead',
    email: 'volunteers@shepherdsgate.demo',
    desc: 'Schedules, rotations, and team communication.',
  },
  {
    role: 'Care Team',
    email: 'care@shepherdsgate.demo',
    desc: 'Prayer requests, follow-ups, and care workflows.',
  },
  {
    role: 'Finance / Giving',
    email: 'finance@shepherdsgate.demo',
    desc: 'Giving campaigns, receipts, and reporting.',
  },
];

export default function ShepherdsGateDemoPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950">
        <FloatingStoreIcons storeType="church" count={20} position="absolute" />
        <div className="absolute top-10 left-12 w-80 h-80 bg-emerald-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-400/10 rounded-full blur-[160px]" />

        <div className="container mx-auto max-w-6xl relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-xs font-black uppercase tracking-widest text-emerald-200"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Demo Church Experience
            </motion.div>
            <motion.h1
              className="text-5xl md:text-7xl font-black tracking-tight text-white leading-[0.95]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Shepherds Gate
              <span className="text-emerald-300"> Church</span>
            </motion.h1>
            <motion.p
              className="mt-6 text-lg md:text-xl text-emerald-100/80 leading-relaxed max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              A pastor-first digital platform that keeps your church family connected. Service times,
              giving, events, ministries, and media — all in one modern, mobile-ready website.
            </motion.p>
            <motion.div
              className="mt-8 flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link
                href="#roles"
                className="px-8 py-4 bg-emerald-400 text-emerald-950 rounded-full font-bold text-lg flex items-center gap-3 hover:bg-emerald-300 transition-all"
              >
                <FaPlay className="text-sm" /> Try Demo Roles
              </Link>
              <Link
                href="/register"
                className="px-8 py-4 border border-emerald-200/40 text-emerald-100 rounded-full font-bold text-lg hover:border-emerald-100 transition-all"
              >
                Start Free Trial
              </Link>
            </motion.div>
            <motion.div
              className="mt-8 flex flex-wrap gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              {['Giving', 'Events', 'Member Care', 'Streaming', 'Volunteer Teams'].map((tag) => (
                <span key={tag} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-emerald-100/80">
                  {tag}
                </span>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="bg-white/5 border border-emerald-400/20 rounded-[2rem] p-6 backdrop-blur"
          >
            <div className="bg-white rounded-[1.5rem] p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-emerald-500">This Week</p>
                  <h3 className="text-2xl font-black text-zinc-900">Service Times</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <FaClock />
                </div>
              </div>
              <div className="space-y-4">
                {SERVICE_TIMES.map((service) => (
                  <div key={`${service.day}-${service.time}`} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-zinc-900">{service.day} • {service.time}</p>
                      <p className="text-xs text-zinc-400">{service.label}</p>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">Join</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs text-zinc-500 font-bold">
                <FaMapMarkerAlt /> 2121 Ridgeway Ave, Richmond, VA
              </div>
              <div className="mt-5 flex gap-3">
                <button className="flex-1 py-3 bg-emerald-600 text-white rounded-full font-bold text-sm">Plan a Visit</button>
                <button className="flex-1 py-3 border border-zinc-200 rounded-full font-bold text-sm">Give Now</button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Events + Giving */}
      <section id="events" className="py-24 px-4">
        <div className="container mx-auto max-w-6xl grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-emerald-600">Upcoming Events</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 mt-3 mb-6">
              Keep your church calendar full.
            </h2>
            <div className="space-y-4">
              {EVENTS.map((event) => (
                <div key={event.title} className="bg-white border border-zinc-100 rounded-2xl p-6 hover:border-emerald-200 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-zinc-900">{event.title}</h3>
                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{event.date}</span>
                  </div>
                  <p className="text-sm text-zinc-500">{event.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="giving" className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-[2.5rem] p-10 text-white shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-emerald-100">Digital Giving</p>
                <h3 className="text-3xl font-black">Make giving simple</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <FaHeart />
              </div>
            </div>
            <p className="text-emerald-50/90 text-base leading-relaxed mb-6">
              Give from any device, set recurring tithes, and track every campaign. Pastors get
              clear reporting and members receive instant receipts.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {[
                { label: 'Recurring Tithes', value: 'Enabled' },
                { label: 'Campaigns', value: '6 Active' },
                { label: 'Text-to-Give', value: 'Ready' },
                { label: 'Receipts', value: 'Instant' },
              ].map((item) => (
                <div key={item.label} className="bg-white/10 rounded-2xl p-4">
                  <p className="text-xs uppercase tracking-widest text-emerald-100 font-black">{item.label}</p>
                  <p className="text-lg font-black mt-2">{item.value}</p>
                </div>
              ))}
            </div>
            <button className="w-full py-4 rounded-full bg-white text-emerald-700 font-black text-lg flex items-center justify-center gap-2">
              <FaDonate /> Give Now
            </button>
          </div>
        </div>
      </section>

      {/* Ministries */}
      <section id="ministries" className="py-24 px-4 bg-zinc-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-600">Ministries</p>
            <h2 className="text-4xl md:text-5xl font-black text-zinc-900 mt-3">Every team stays connected.</h2>
            <p className="text-lg text-zinc-500 mt-4 max-w-2xl mx-auto">
              Organize leaders, volunteers, and members with ministry-specific tools and communication.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {MINISTRIES.map((ministry) => (
              <div key={ministry.title} className="bg-white border border-zinc-100 rounded-2xl p-6 hover:shadow-lg hover:border-emerald-200 transition-all">
                <h3 className="text-lg font-bold text-zinc-900 mb-2">{ministry.title}</h3>
                <p className="text-sm text-zinc-500">{ministry.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-12">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-emerald-600">What Pastors Get</p>
              <h2 className="text-4xl md:text-5xl font-black text-zinc-900 mt-2">One platform, every tool.</h2>
            </div>
            <Link
              href="/features"
              className="px-6 py-3 rounded-full border border-zinc-200 text-zinc-700 font-bold hover:border-emerald-300"
            >
              View All Features
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="bg-white border border-zinc-100 rounded-2xl p-6 hover:border-emerald-200 hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <feature.icon />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Media + Worship */}
      <section id="streaming" className="py-24 px-4 bg-gradient-to-br from-slate-950 via-zinc-950 to-emerald-950 text-white">
        <div className="container mx-auto max-w-6xl grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-emerald-300">Worship & Media</p>
            <h2 className="text-4xl md:text-5xl font-black mt-3 mb-6">Stream services without chaos.</h2>
            <p className="text-lg text-emerald-100/80 leading-relaxed mb-8">
              Keep worship teams aligned with setlists, lyric cues, and media assets. Share
              livestreams, sermon archives, and prayer moments with the entire church.
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="px-5 py-3 rounded-full bg-white/10 border border-white/15 text-sm font-bold">Live Stream Hub</div>
              <div className="px-5 py-3 rounded-full bg-white/10 border border-white/15 text-sm font-bold">Sermon Library</div>
              <div className="px-5 py-3 rounded-full bg-white/10 border border-white/15 text-sm font-bold">Worship Planning</div>
              <Link href="/demo/shepherds-gate/menu-board" className="px-5 py-3 rounded-full bg-emerald-400/20 border border-emerald-300/40 text-sm font-bold">Projector Mode</Link>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-emerald-200 font-black">Now Playing</p>
                <h3 className="text-2xl font-black">Hope Over Fear</h3>
                <p className="text-sm text-emerald-100/70">Pastor Miles • Series: Unshakable</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-400/20 flex items-center justify-center">
                <FaMusic />
              </div>
            </div>
            <div className="space-y-3 text-sm text-emerald-100/80">
              <div className="flex items-center justify-between">
                <span>Stream starts in</span>
                <span className="font-bold">12 min</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Prayer requests</span>
                <span className="font-bold">24 today</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Worship setlist</span>
                <span className="font-bold">5 songs</span>
              </div>
            </div>
            <button className="mt-6 w-full py-3 rounded-full bg-emerald-400 text-emerald-950 font-black">Watch Live</button>
          </div>
        </div>
      </section>

      {/* Demo Accounts */}
      <section id="roles" className="py-24 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-600">Role Switcher</p>
            <h2 className="text-4xl md:text-5xl font-black mt-3">Log in as any role.</h2>
            <p className="text-zinc-500 text-lg mt-4">
              Demo accounts use password: <span className="font-mono font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded">DemoPass123!</span>
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEMO_ACCOUNTS.map((acct) => (
              <div key={acct.email} className="bg-white border border-zinc-100 rounded-2xl p-6 hover:border-emerald-200 hover:shadow-lg transition-all">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-3 bg-emerald-50 text-emerald-700">
                  {acct.role}
                </span>
                <p className="font-mono text-sm text-zinc-900 font-bold mb-1">{acct.email}</p>
                <p className="text-xs text-zinc-500 mb-4">{acct.desc}</p>
                <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-600">
                  Go to Login <FaArrowRight className="text-xs" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl bg-emerald-600 rounded-[3rem] p-10 md:p-16 text-white text-center shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Your church can look this good.</h2>
            <p className="text-emerald-100 text-lg mb-10">
              Launch a modern church website in days. Start your free trial and bring your community together.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="group px-10 py-5 bg-white text-emerald-700 rounded-full font-bold text-lg flex items-center gap-3 hover:bg-emerald-50 transition-all">
                Start Free Trial <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/contact" className="px-10 py-5 border-2 border-white/60 text-white rounded-full font-bold text-lg hover:border-white transition-all">
                Schedule a Demo
              </Link>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-emerald-900/40 to-transparent blur-3xl pointer-events-none" />
        </div>
      </section>
    </div>
  );
}
