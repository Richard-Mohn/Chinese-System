'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaArrowRight, FaChurch, FaPlayCircle, FaUsers, FaVideo, FaHeart, FaMapMarkerAlt } from 'react-icons/fa';

const churchFlow = [
  {
    title: 'Walk into the church in-game',
    desc: 'Players move their character to a partner church location and enter the sanctuary interior.',
    icon: FaMapMarkerAlt,
  },
  {
    title: 'Join live seminar broadcast',
    desc: 'When the church has a live seminar or service, players can sit in the in-game sanctuary and watch the stream on screen.',
    icon: FaPlayCircle,
  },
  {
    title: 'Build knowledge + community stats',
    desc: 'Attendance increases creature knowledge and social values while encouraging real-world community engagement.',
    icon: FaHeart,
  },
  {
    title: 'Drive local visits and giving',
    desc: 'Players who attend online can convert into on-site visitors, event participants, and recurring supporters.',
    icon: FaUsers,
  },
];

export default function MohnStersChurchLivePage() {
  return (
    <div className="min-h-screen bg-[#050507] text-white">
      <section className="pt-36 pb-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 mb-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-sm font-black uppercase tracking-widest text-indigo-300">
            <FaChurch /> Church Live Experience
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
            Worship + Community <span className="bg-linear-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">Inside the Mohnverse</span>
          </h1>
          <p className="text-zinc-400 text-xl max-w-3xl mx-auto leading-relaxed">
            Churches become interactive sanctuary spaces where players can attend live seminars, connect with community, and build their character through meaningful participation.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 border-t border-white/5">
        <div className="container mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
          {churchFlow.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-white/10 bg-white/3 p-6"
            >
              <item.icon className="text-purple-300 mb-3" />
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 border-t border-white/5">
        <div className="container mx-auto max-w-4xl">
          <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-7 text-center">
            <div className="inline-flex items-center gap-2 text-purple-300 mb-2 font-bold">
              <FaVideo /> Live Seminar Mode
            </div>
            <p className="text-zinc-300 leading-relaxed">
              During scheduled services, churches can run a synchronized in-game event where attendees watch the same live stream while seated inside a virtual sanctuary. This creates a bridge between digital participation and local church life.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 border-t border-white/5">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-black mb-4">Launch your church location</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/for-churches" className="group px-7 py-3.5 rounded-full bg-linear-to-r from-purple-500 to-orange-500 font-bold flex items-center gap-2">
              Church Setup <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/mohnsters/community" className="px-7 py-3.5 rounded-full border border-white/15 text-zinc-100 font-bold hover:bg-white/5 transition-colors">
              More Community Features
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
