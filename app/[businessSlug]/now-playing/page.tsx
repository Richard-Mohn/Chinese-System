'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaMusic, FaMicrophone, FaVolumeUp, FaExpand, FaCog,
  FaCompact, FaList, FaPlay, FaForward
} from 'react-icons/fa';

interface QueueItem {
  id: string;
  songTitle: string;
  artist: string;
  requestedBy: string;
  isKaraoke: boolean;
  status: 'queued' | 'playing' | 'played' | 'skipped';
  credits: number;
  createdAt: any;
}

interface BusinessData {
  businessId: string;
  businessName: string;
  slug: string;
  entertainment?: {
    jukeboxEnabled?: boolean;
    karaokeEnabled?: boolean;
    syncDelayMs?: number;
  };
}

// Simulated lyrics for karaoke display — in production, would pull from a lyrics API
const SAMPLE_LYRICS = [
  { time: 0, text: '♪ ♪ ♪', highlight: false },
  { time: 3, text: 'Is this the real life?', highlight: true },
  { time: 5, text: 'Is this just fantasy?', highlight: true },
  { time: 8, text: 'Caught in a landslide', highlight: true },
  { time: 10, text: 'No escape from reality', highlight: true },
  { time: 14, text: 'Open your eyes', highlight: true },
  { time: 16, text: 'Look up to the skies and see', highlight: true },
  { time: 20, text: "I'm just a poor boy", highlight: true },
  { time: 22, text: 'I need no sympathy', highlight: true },
  { time: 26, text: "Because I'm easy come, easy go", highlight: true },
  { time: 29, text: 'Little high, little low', highlight: true },
  { time: 32, text: 'Any way the wind blows', highlight: true },
  { time: 36, text: "Doesn't really matter to me", highlight: true },
  { time: 40, text: 'To me...', highlight: true },
  { time: 44, text: '♪ ♪ ♪', highlight: false },
];

export default function NowPlayingPage() {
  const params = useParams();
  const slug = params?.businessSlug as string;

  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [syncDelay, setSyncDelay] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load business
  useEffect(() => {
    async function load() {
      try {
        const q = query(collection(db, 'businesses'), where('slug', '==', slug));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const d = snap.docs[0];
          const data = { ...d.data(), businessId: d.id } as BusinessData;
          setBusiness(data);
          setSyncDelay(data.entertainment?.syncDelayMs ?? 0);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    if (slug) load();
  }, [slug]);

  // Real-time queue
  useEffect(() => {
    if (!business) return;
    const qRef = collection(db, 'businesses', business.businessId, 'jukeboxQueue');
    const unsub = onSnapshot(qRef, (snap) => {
      const items: QueueItem[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as QueueItem));
      items.sort((a, b) => {
        if (a.status === 'playing') return -1;
        if (b.status === 'playing') return 1;
        const ta = a.createdAt?.toMillis?.() || 0;
        const tb = b.createdAt?.toMillis?.() || 0;
        return ta - tb;
      });
      setQueue(items.filter(i => i.status !== 'played' && i.status !== 'skipped'));
    });
    return () => unsub();
  }, [business]);

  // Simulate lyric progression for karaoke
  const nowPlaying = queue.find(q => q.status === 'playing');
  useEffect(() => {
    if (!nowPlaying?.isKaraoke) { setElapsed(0); setCurrentLyricIndex(0); return; }
    const interval = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 1;
        const adjustedTime = next - (syncDelay / 1000);
        const idx = SAMPLE_LYRICS.findLastIndex(l => l.time <= adjustedTime);
        if (idx >= 0) setCurrentLyricIndex(idx);
        if (next >= 50) return 0; // loop demo
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [nowPlaying?.isKaraoke, nowPlaying?.id, syncDelay]);

  function toggleFullscreen() {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }

  const upNext = queue.filter(q => q.status === 'queued').slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black" />
        {nowPlaying && (
          <>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.15, 0.05, 0.15],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-[128px]"
            />
          </>
        )}
      </div>

      {/* Control bar */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4 flex items-center justify-between opacity-0 hover:opacity-100 transition-opacity duration-300">
        <div className="text-xs text-zinc-500 font-bold tracking-widest uppercase">
          {business?.businessName} • TV Display
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2.5 bg-zinc-900/80 rounded-xl text-zinc-400 hover:text-white transition-colors"
          >
            <FaCog className="text-sm" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2.5 bg-zinc-900/80 rounded-xl text-zinc-400 hover:text-white transition-colors"
          >
            <FaExpand className="text-sm" />
          </button>
        </div>
      </div>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-0 right-0 h-full w-80 bg-zinc-900/95 backdrop-blur-xl z-50 p-6 border-l border-zinc-800"
          >
            <h3 className="text-lg font-black text-white mb-6">Display Settings</h3>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 block">
                  Sync Delay (ms)
                </label>
                <p className="text-[10px] text-zinc-600 mb-3">
                  Adjust if lyrics appear too early/late compared to audio.
                  Increase for projector delay, decrease if lyrics are behind.
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={-2000}
                    max={2000}
                    step={50}
                    value={syncDelay}
                    onChange={e => setSyncDelay(Number(e.target.value))}
                    className="flex-1 accent-purple-500"
                  />
                  <span className="text-sm font-mono font-bold text-white min-w-[60px] text-right">{syncDelay}ms</span>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                  <span>Earlier</span>
                  <span>Later</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 block">
                  Quick Presets
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'HDMI', val: 0 },
                    { label: 'Wi-Fi', val: 200 },
                    { label: 'BT', val: 500 },
                    { label: 'Projector', val: 300 },
                    { label: 'Fire TV', val: 150 },
                    { label: 'Chromecast', val: 250 },
                  ].map(p => (
                    <button
                      key={p.label}
                      onClick={() => setSyncDelay(p.val)}
                      className={`px-2 py-2 rounded-xl text-xs font-bold transition-all ${
                        syncDelay === p.val
                          ? 'bg-purple-600 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 block">
                  Device Info
                </label>
                <p className="text-xs text-zinc-500">
                  For Fire Stick / Android TV: open this page in the Silk or Chrome browser and set to fullscreen.
                  For projectors: connect HDMI or cast wirelessly.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {nowPlaying ? (
          <>
            {/* Karaoke lyrics */}
            {nowPlaying.isKaraoke ? (
              <div className="text-center max-w-4xl mx-auto space-y-6 mb-8">
                <div className="flex items-center justify-center gap-3 mb-12">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse" />
                  <span className="text-yellow-400 text-sm font-black uppercase tracking-[0.3em]">Karaoke Mode</span>
                  <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse" />
                </div>

                {/* Previous line */}
                {currentLyricIndex > 0 && (
                  <motion.p
                    key={`prev-${currentLyricIndex}`}
                    className="text-2xl font-bold text-zinc-600"
                  >
                    {SAMPLE_LYRICS[currentLyricIndex - 1]?.text}
                  </motion.p>
                )}

                {/* Current line */}
                <motion.p
                  key={`current-${currentLyricIndex}`}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="text-5xl md:text-7xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent leading-tight"
                >
                  {SAMPLE_LYRICS[currentLyricIndex]?.text || '♪ ♪ ♪'}
                </motion.p>

                {/* Next line preview */}
                {currentLyricIndex < SAMPLE_LYRICS.length - 1 && (
                  <p className="text-xl font-bold text-zinc-700">
                    {SAMPLE_LYRICS[currentLyricIndex + 1]?.text}
                  </p>
                )}

                {/* Singer name */}
                <div className="pt-8">
                  <p className="text-sm text-zinc-500">
                    🎤 Now singing: <span className="font-bold text-white">{nowPlaying.requestedBy}</span>
                  </p>
                </div>
              </div>
            ) : (
              /* Normal song display */
              <div className="text-center max-w-3xl mx-auto">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  className="w-40 h-40 md:w-56 md:h-56 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-800 rounded-full mx-auto mb-12 flex items-center justify-center shadow-2xl shadow-purple-500/30"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-black rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-zinc-800 rounded-full" />
                  </div>
                </motion.div>
              </div>
            )}

            {/* Song info (shown for both modes) */}
            <div className="text-center mt-4">
              <motion.h1
                key={nowPlaying.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`font-black mb-3 ${nowPlaying.isKaraoke ? 'text-2xl' : 'text-4xl md:text-6xl'}`}
              >
                {nowPlaying.songTitle}
              </motion.h1>
              <p className={`text-zinc-400 mb-2 ${nowPlaying.isKaraoke ? 'text-base' : 'text-xl md:text-2xl'}`}>
                {nowPlaying.artist}
              </p>
              {!nowPlaying.isKaraoke && (
                <p className="text-sm text-zinc-600 mt-6">
                  Requested by <span className="text-zinc-400 font-bold">{nowPlaying.requestedBy}</span>
                </p>
              )}
            </div>

            {/* Audio visualizer bar */}
            <div className="flex items-end justify-center gap-1 mt-8 h-8">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: [
                      Math.random() * 8 + 4,
                      Math.random() * 28 + 4,
                      Math.random() * 16 + 4,
                    ],
                  }}
                  transition={{
                    duration: 0.5 + Math.random() * 0.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="w-1.5 bg-gradient-to-t from-purple-600 to-pink-400 rounded-full"
                  style={{ minHeight: 4 }}
                />
              ))}
            </div>
          </>
        ) : (
          /* Idle / waiting state */
          <div className="text-center">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-32 h-32 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-zinc-700/50"
            >
              <FaMusic className="text-5xl text-zinc-600" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black text-zinc-400 mb-4">
              {business?.businessName}
            </h1>
            <p className="text-lg text-zinc-600 mb-8">
              Scan the QR or visit the jukebox to request songs
            </p>
            <div className="inline-block px-6 py-3 bg-zinc-900 rounded-2xl border border-zinc-800">
              <p className="text-sm font-mono text-purple-400">
                {typeof window !== 'undefined' ? window.location.origin : ''}/{slug}/jukebox
              </p>
            </div>
          </div>
        )}

        {/* Up Next sidebar */}
        {upNext.length > 0 && (
          <div className="fixed bottom-8 right-8 w-72 space-y-2">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-2">Up Next</p>
            {upNext.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-zinc-900/60 backdrop-blur rounded-xl p-3 border border-zinc-800/40 flex items-center gap-3"
              >
                <span className="text-xs font-black text-zinc-600 w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{item.songTitle}</p>
                  <p className="text-[10px] text-zinc-500">{item.artist} • {item.requestedBy}</p>
                </div>
                {item.isKaraoke && <FaMicrophone className="text-yellow-500 text-xs" />}
              </motion.div>
            ))}
          </div>
        )}

        {/* Branding */}
        <div className="fixed bottom-4 left-4 opacity-30">
          <p className="text-[10px] font-bold text-zinc-600 tracking-widest">Powered by MohnMenu</p>
        </div>
      </div>
    </div>
  );
}
