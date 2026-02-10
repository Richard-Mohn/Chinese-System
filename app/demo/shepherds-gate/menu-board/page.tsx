'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaBroadcastTower, FaMusic, FaHandsHelping, FaTv, FaArrowLeft } from 'react-icons/fa';

export default function ShepherdsGateMenuBoard() {
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden">
      <header className="flex items-center justify-between px-8 py-5 border-b border-emerald-900/40 bg-black/60">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Shepherds Gate</p>
          <h1 className="text-3xl font-black tracking-tight">Service Projector</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-black uppercase tracking-widest">
            <FaBroadcastTower className="text-[10px]" /> Live
          </div>
          <p className="text-sm font-mono text-emerald-100/70">
            {clock.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <Link href="/demo/shepherds-gate" className="text-xs font-bold text-emerald-200 hover:text-emerald-100 flex items-center gap-2">
            <FaArrowLeft className="text-[10px]" /> Back to Demo
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-8 py-10">
        <section className="bg-zinc-900/60 border border-emerald-900/40 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-emerald-400/20 flex items-center justify-center">
              <FaTv className="text-emerald-200" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-emerald-200">Order of Service</p>
              <h2 className="text-2xl font-black">Sunday Morning</h2>
            </div>
          </div>
          <div className="space-y-4 text-lg">
            {[
              '9:58 - Welcome + Prayer',
              '10:05 - Worship Set',
              '10:25 - Scripture Reading',
              '10:32 - Message: Hope Over Fear',
              '11:05 - Communion',
              '11:18 - Giving + Announcements',
              '11:30 - Final Song + Dismissal',
            ].map((line) => (
              <div key={line} className="flex items-center justify-between border-b border-emerald-900/30 pb-3">
                <span className="text-emerald-50">{line}</span>
                <span className="text-xs text-emerald-200/70">Ready</span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="bg-zinc-900/60 border border-emerald-900/40 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-emerald-400/20 flex items-center justify-center">
                <FaMusic className="text-emerald-200" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-emerald-200">Now Playing</p>
                <h2 className="text-2xl font-black">Great Are You Lord</h2>
              </div>
            </div>
            <div className="text-xl leading-relaxed text-emerald-50">
              <p>Its Your breath in our lungs</p>
              <p>So we pour out our praise</p>
              <p>We pour out our praise</p>
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-emerald-900/40 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-emerald-400/20 flex items-center justify-center">
                <FaHandsHelping className="text-emerald-200" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-emerald-200">Announcements</p>
                <h2 className="text-2xl font-black">This Week</h2>
              </div>
            </div>
            <ul className="space-y-3 text-lg text-emerald-50">
              <li>Tuesday - Prayer Night at 7 PM</li>
              <li>Friday - Youth Hangout at 6 PM</li>
              <li>Saturday - Community Serve Day</li>
              <li>Next Sunday - Baptism Signups</li>
            </ul>
          </div>
        </section>
      </div>

      <footer className="px-8 pb-10">
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-emerald-200">Live Stream</p>
            <p className="text-xl font-black">mohnmenu.com/demo/shepherds-gate</p>
          </div>
          <div className="flex items-center gap-2 text-emerald-100/80">
            <FaBroadcastTower />
            <span className="text-sm">Streaming cues, lyrics, and announcements sync here.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
