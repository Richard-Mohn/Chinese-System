'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs, doc, getDoc, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  FaMusic, FaPlay, FaPause, FaSpotify, FaYoutube, FaInstagram,
  FaTwitter, FaTiktok, FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt,
  FaShoppingBag, FaBroadcastTower, FaHeart, FaShare, FaCompactDisc,
  FaHeadphones, FaGuitar, FaDrum, FaMicrophone, FaStar,
  FaArrowRight, FaExternalLinkAlt, FaGlobe,
} from 'react-icons/fa';
import LiveStreamViewer from '@/components/LiveStreamViewer';

// ─── Genre Theme Definitions ─────────────────────────────────

interface GenreTheme {
  id: string;
  label: string;
  gradient: string;
  bgClass: string;
  accentColor: string;
  textAccent: string;
  borderAccent: string;
  cardBg: string;
  icon: typeof FaMusic;
  pattern: string; // CSS background pattern
}

const GENRE_THEMES: Record<string, GenreTheme> = {
  default: {
    id: 'default',
    label: 'Artist',
    gradient: 'from-indigo-600 via-purple-600 to-pink-600',
    bgClass: 'bg-zinc-950',
    accentColor: '#6366f1',
    textAccent: 'text-indigo-400',
    borderAccent: 'border-indigo-500/30',
    cardBg: 'bg-zinc-900/80',
    icon: FaMusic,
    pattern: 'radial-gradient(circle at 20% 80%, rgba(99,102,241,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(236,72,153,0.1) 0%, transparent 50%)',
  },
  hiphop: {
    id: 'hiphop',
    label: 'Hip-Hop',
    gradient: 'from-amber-500 via-orange-600 to-red-600',
    bgClass: 'bg-zinc-950',
    accentColor: '#f59e0b',
    textAccent: 'text-amber-400',
    borderAccent: 'border-amber-500/30',
    cardBg: 'bg-zinc-900/80',
    icon: FaMicrophone,
    pattern: 'radial-gradient(circle at 30% 70%, rgba(245,158,11,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(239,68,68,0.1) 0%, transparent 50%)',
  },
  rock: {
    id: 'rock',
    label: 'Rock',
    gradient: 'from-red-600 via-red-700 to-zinc-800',
    bgClass: 'bg-zinc-950',
    accentColor: '#dc2626',
    textAccent: 'text-red-400',
    borderAccent: 'border-red-500/30',
    cardBg: 'bg-zinc-900/80',
    icon: FaGuitar,
    pattern: 'radial-gradient(circle at 50% 50%, rgba(220,38,38,0.12) 0%, transparent 60%)',
  },
  electronic: {
    id: 'electronic',
    label: 'Electronic',
    gradient: 'from-cyan-400 via-blue-500 to-purple-600',
    bgClass: 'bg-zinc-950',
    accentColor: '#06b6d4',
    textAccent: 'text-cyan-400',
    borderAccent: 'border-cyan-500/30',
    cardBg: 'bg-zinc-900/80',
    icon: FaHeadphones,
    pattern: 'radial-gradient(circle at 10% 90%, rgba(6,182,212,0.2) 0%, transparent 40%), radial-gradient(circle at 90% 10%, rgba(147,51,234,0.15) 0%, transparent 40%)',
  },
  country: {
    id: 'country',
    label: 'Country',
    gradient: 'from-amber-600 via-yellow-700 to-amber-800',
    bgClass: 'bg-zinc-950',
    accentColor: '#d97706',
    textAccent: 'text-amber-400',
    borderAccent: 'border-amber-500/30',
    cardBg: 'bg-zinc-900/80',
    icon: FaGuitar,
    pattern: 'radial-gradient(circle at 40% 60%, rgba(217,119,6,0.12) 0%, transparent 50%)',
  },
  rnb: {
    id: 'rnb',
    label: 'R&B / Soul',
    gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
    bgClass: 'bg-zinc-950',
    accentColor: '#7c3aed',
    textAccent: 'text-violet-400',
    borderAccent: 'border-violet-500/30',
    cardBg: 'bg-zinc-900/80',
    icon: FaCompactDisc,
    pattern: 'radial-gradient(circle at 60% 40%, rgba(124,58,237,0.15) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(217,70,239,0.1) 0%, transparent 50%)',
  },
  jazz: {
    id: 'jazz',
    label: 'Jazz',
    gradient: 'from-amber-500 via-amber-600 to-zinc-700',
    bgClass: 'bg-zinc-950',
    accentColor: '#f59e0b',
    textAccent: 'text-amber-300',
    borderAccent: 'border-amber-400/30',
    cardBg: 'bg-zinc-900/80',
    icon: FaDrum,
    pattern: 'radial-gradient(circle at 50% 50%, rgba(245,158,11,0.08) 0%, transparent 60%)',
  },
  gospel: {
    id: 'gospel',
    label: 'Gospel',
    gradient: 'from-yellow-400 via-amber-500 to-orange-600',
    bgClass: 'bg-zinc-950',
    accentColor: '#eab308',
    textAccent: 'text-yellow-400',
    borderAccent: 'border-yellow-500/30',
    cardBg: 'bg-zinc-900/80',
    icon: FaStar,
    pattern: 'radial-gradient(circle at 50% 30%, rgba(234,179,8,0.15) 0%, transparent 50%)',
  },
  latin: {
    id: 'latin',
    label: 'Latin',
    gradient: 'from-rose-500 via-orange-500 to-yellow-500',
    bgClass: 'bg-zinc-950',
    accentColor: '#f43f5e',
    textAccent: 'text-rose-400',
    borderAccent: 'border-rose-500/30',
    cardBg: 'bg-zinc-900/80',
    icon: FaMusic,
    pattern: 'radial-gradient(circle at 30% 70%, rgba(244,63,94,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(234,179,8,0.1) 0%, transparent 50%)',
  },
};

// ─── Types ───────────────────────────────────────────────────

interface ArtistBusiness {
  businessId: string;
  businessName: string;
  slug: string;
  type?: string;
  tier?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  heroImage?: string;
  logoUrl?: string;
  brandColors?: { primary?: string; secondary?: string; accent?: string };
  socials?: {
    spotify?: string;
    youtube?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    website?: string;
  };
  genre?: string; // maps to GENRE_THEMES
  bio?: string;
  upcomingShows?: ShowData[];
  featuredTracks?: TrackData[];
  merchEnabled?: boolean;
  liveStreamEnabled?: boolean;
}

interface ShowData {
  id: string;
  title: string;
  date: string;
  venue: string;
  city: string;
  ticketUrl?: string;
  soldOut?: boolean;
}

interface TrackData {
  id: string;
  title: string;
  duration?: string;
  streamUrl?: string;
  album?: string;
  coverArt?: string;
}

interface MerchItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
}

// ─── Component ───────────────────────────────────────────────

export default function ArtistMusicPage() {
  const params = useParams();
  const slug = params?.businessSlug as string;

  const [business, setBusiness] = useState<ArtistBusiness | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<GenreTheme>(GENRE_THEMES.default);
  const [activeSection, setActiveSection] = useState<'music' | 'shows' | 'merch' | 'live'>('music');
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);

  // Load business data
  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      try {
        const q = query(collection(db, 'businesses'), where('slug', '==', slug));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const d = snap.docs[0];
          const data = { ...d.data(), businessId: d.id } as ArtistBusiness;
          setBusiness(data);
          // Set theme from business genre or brand colors
          const genreKey = data.genre || 'default';
          setTheme(GENRE_THEMES[genreKey] || GENRE_THEMES.default);
        }
      } catch (err) {
        console.error('Failed to load artist:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <FaCompactDisc className="text-5xl text-indigo-500 animate-spin" />
          <p className="text-zinc-400 font-bold">Loading…</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <FaMusic className="text-5xl text-zinc-600 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-white mb-2">Artist not found</h1>
          <p className="text-zinc-500">This page doesn&apos;t exist or has been removed.</p>
          <Link href="/" className="mt-6 inline-block px-6 py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-colors">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const ThemeIcon = theme.icon;
  const artistName = business.businessName || 'Artist';
  const isDemo = business.slug?.startsWith('demo-') || business.businessId?.startsWith('demo-');

  // Demo data for showcasing
  const demoTracks: TrackData[] = business.featuredTracks?.length ? business.featuredTracks : [
    { id: '1', title: 'Midnight Drive', duration: '3:42', album: 'After Hours' },
    { id: '2', title: 'City Lights', duration: '4:15', album: 'After Hours' },
    { id: '3', title: 'Broken Chains', duration: '3:58', album: 'Breakthrough' },
    { id: '4', title: 'Rise Up', duration: '4:30', album: 'Breakthrough' },
    { id: '5', title: 'Golden Hour', duration: '3:21', album: 'Sessions' },
    { id: '6', title: 'Echoes', duration: '5:12', album: 'Sessions' },
  ];

  const demoShows: ShowData[] = business.upcomingShows?.length ? business.upcomingShows : [
    { id: '1', title: 'Summer Vibes Tour', date: '2026-03-15', venue: 'The National', city: 'Richmond, VA' },
    { id: '2', title: 'Summer Vibes Tour', date: '2026-03-22', venue: 'The Fillmore', city: 'Silver Spring, MD' },
    { id: '3', title: 'Festival Set', date: '2026-04-10', venue: 'Dominion Energy Center', city: 'Richmond, VA' },
    { id: '4', title: 'Acoustic Night', date: '2026-04-25', venue: 'The Camel', city: 'Richmond, VA', soldOut: true },
  ];

  const demoMerch: MerchItem[] = [
    { id: '1', name: 'Tour T-Shirt 2026', price: 35, category: 'Apparel' },
    { id: '2', name: 'Logo Hoodie', price: 65, category: 'Apparel' },
    { id: '3', name: 'Vinyl LP - After Hours', price: 28, category: 'Music' },
    { id: '4', name: 'Signed Poster', price: 20, category: 'Collectibles' },
  ];

  return (
    <div className={`min-h-screen ${theme.bgClass} text-white`} style={{ backgroundImage: theme.pattern }}>
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-b ${theme.gradient} opacity-20`} />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

        {/* Hero image */}
        {business.heroImage && (
          <div className="absolute inset-0">
            <img src={business.heroImage} alt={artistName} className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/40" />
          </div>
        )}

        <div className="relative z-10 container mx-auto max-w-6xl px-4 pt-20 pb-16">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            {/* Artist avatar / logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="shrink-0"
            >
              {business.logoUrl ? (
                <img src={business.logoUrl} alt={artistName} className="w-40 h-40 md:w-52 md:h-52 rounded-3xl object-cover shadow-2xl ring-4 ring-white/10" />
              ) : (
                <div className={`w-40 h-40 md:w-52 md:h-52 rounded-3xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-2xl`}>
                  <ThemeIcon className="text-6xl text-white/80" />
                </div>
              )}
            </motion.div>

            {/* Artist info */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center md:text-left flex-1"
            >
              <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${theme.textAccent} bg-white/5 border ${theme.borderAccent}`}>
                  {theme.label}
                </span>
                {business.liveStreamEnabled && (
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest text-red-400 bg-red-500/10 border border-red-500/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Live
                  </span>
                )}
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-3">{artistName}</h1>
              <p className="text-lg text-zinc-400 max-w-xl leading-relaxed">
                {business.bio || business.description || `Welcome to ${artistName}'s official page. Explore music, tour dates, and merch.`}
              </p>

              {/* Social links */}
              <div className="flex items-center justify-center md:justify-start gap-3 mt-5">
                {business.socials?.spotify && (
                  <a href={business.socials.spotify} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 hover:bg-green-500/20 rounded-full flex items-center justify-center transition-colors">
                    <FaSpotify className="text-green-400" />
                  </a>
                )}
                {business.socials?.youtube && (
                  <a href={business.socials.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 hover:bg-red-500/20 rounded-full flex items-center justify-center transition-colors">
                    <FaYoutube className="text-red-400" />
                  </a>
                )}
                {business.socials?.instagram && (
                  <a href={business.socials.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 hover:bg-pink-500/20 rounded-full flex items-center justify-center transition-colors">
                    <FaInstagram className="text-pink-400" />
                  </a>
                )}
                {business.socials?.twitter && (
                  <a href={business.socials.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 hover:bg-blue-500/20 rounded-full flex items-center justify-center transition-colors">
                    <FaTwitter className="text-blue-400" />
                  </a>
                )}
                {business.socials?.tiktok && (
                  <a href={business.socials.tiktok} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 hover:bg-zinc-400/20 rounded-full flex items-center justify-center transition-colors">
                    <FaTiktok />
                  </a>
                )}
                {business.socials?.website && (
                  <a href={business.socials.website} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                    <FaGlobe className="text-zinc-300" />
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Navigation Tabs ─── */}
      <div className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex gap-1 overflow-x-auto no-scrollbar py-2">
            {[
              { id: 'music' as const, label: 'Music', icon: FaCompactDisc },
              { id: 'shows' as const, label: 'Tour Dates', icon: FaCalendarAlt },
              { id: 'merch' as const, label: 'Merch', icon: FaShoppingBag },
              { id: 'live' as const, label: 'Live', icon: FaBroadcastTower },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                  activeSection === tab.id
                    ? `bg-gradient-to-r ${theme.gradient} text-white shadow-lg`
                    : 'text-zinc-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="text-xs" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Content Sections ─── */}
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <AnimatePresence mode="wait">
          {/* MUSIC TAB */}
          {activeSection === 'music' && (
            <motion.div
              key="music"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Genre Theme Selector */}
              <div>
                <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-black mb-4">Vibe</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.values(GENRE_THEMES).map(g => {
                    const GIcon = g.icon;
                    return (
                      <button
                        key={g.id}
                        onClick={() => setTheme(g)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                          theme.id === g.id
                            ? `bg-gradient-to-r ${g.gradient} text-white shadow-lg`
                            : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/5'
                        }`}
                      >
                        <GIcon className="text-xs" />
                        {g.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Featured Tracks */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black">Featured Tracks</h2>
                  {business.socials?.spotify && (
                    <a href={business.socials.spotify} target="_blank" rel="noopener noreferrer" className={`text-sm font-bold ${theme.textAccent} flex items-center gap-1.5 hover:underline`}>
                      Open on Spotify <FaExternalLinkAlt className="text-xs" />
                    </a>
                  )}
                </div>
                <div className="space-y-2">
                  {demoTracks.map((track, i) => (
                    <motion.div
                      key={track.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setPlayingTrack(playingTrack === track.id ? null : track.id)}
                      className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all group ${
                        playingTrack === track.id
                          ? `${theme.cardBg} border ${theme.borderAccent} shadow-lg`
                          : 'hover:bg-white/5'
                      }`}
                    >
                      {/* Track number / play button */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        playingTrack === track.id
                          ? `bg-gradient-to-r ${theme.gradient}`
                          : 'bg-white/5 group-hover:bg-white/10'
                      }`}>
                        {playingTrack === track.id ? (
                          <FaPause className="text-white text-xs" />
                        ) : (
                          <span className="text-zinc-500 text-sm font-bold group-hover:hidden">{i + 1}</span>
                        )}
                        {playingTrack !== track.id && (
                          <FaPlay className="text-white text-xs hidden group-hover:block" />
                        )}
                      </div>

                      {/* Track info */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold truncate ${playingTrack === track.id ? 'text-white' : 'text-zinc-200'}`}>
                          {track.title}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">{track.album || artistName}</p>
                      </div>

                      {/* Duration */}
                      <span className="text-sm text-zinc-500 font-mono shrink-0">{track.duration}</span>

                      {/* Like button */}
                      <button className="p-2 text-zinc-600 hover:text-pink-500 transition-colors shrink-0" onClick={e => e.stopPropagation()}>
                        <FaHeart className="text-sm" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Now Playing Bar */}
              <AnimatePresence>
                {playingTrack && (
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    className={`fixed bottom-0 left-0 right-0 z-50 bg-zinc-900/95 backdrop-blur-xl border-t border-white/10 p-4`}
                  >
                    <div className="container mx-auto max-w-6xl flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shrink-0`}>
                        <FaCompactDisc className="text-white text-lg animate-spin" style={{ animationDuration: '3s' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm truncate">
                          {demoTracks.find(t => t.id === playingTrack)?.title || 'Unknown'}
                        </p>
                        <p className="text-xs text-zinc-400">{artistName}</p>
                      </div>
                      {/* Progress bar placeholder */}
                      <div className="hidden sm:flex items-center gap-3 flex-1 max-w-md">
                        <span className="text-xs text-zinc-500 font-mono">1:23</span>
                        <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${theme.gradient} rounded-full`} style={{ width: '35%' }} />
                        </div>
                        <span className="text-xs text-zinc-500 font-mono">
                          {demoTracks.find(t => t.id === playingTrack)?.duration || '0:00'}
                        </span>
                      </div>
                      <button onClick={() => setPlayingTrack(null)} className="p-2 text-zinc-400 hover:text-white transition-colors">
                        <FaPause />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* SHOWS TAB */}
          {activeSection === 'shows' && (
            <motion.div
              key="shows"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-black">Upcoming Shows</h2>
              <div className="space-y-3">
                {demoShows.map((show, i) => {
                  const showDate = new Date(show.date);
                  const month = showDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
                  const day = showDate.getDate();
                  return (
                    <motion.div
                      key={show.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-center gap-5 p-5 rounded-2xl ${theme.cardBg} border ${theme.borderAccent} group hover:bg-white/5 transition-all`}
                    >
                      {/* Date block */}
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${theme.gradient} flex flex-col items-center justify-center shrink-0 shadow-lg`}>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/70">{month}</span>
                        <span className="text-2xl font-black text-white">{day}</span>
                      </div>

                      {/* Show info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-white text-lg truncate">{show.title}</p>
                        <div className="flex items-center gap-3 text-sm text-zinc-400 mt-1">
                          <span className="flex items-center gap-1.5">
                            <FaMapMarkerAlt className="text-xs" /> {show.venue}
                          </span>
                          <span className="text-zinc-600">•</span>
                          <span>{show.city}</span>
                        </div>
                      </div>

                      {/* Ticket button */}
                      <div className="shrink-0">
                        {show.soldOut ? (
                          <span className="px-5 py-2.5 rounded-full bg-zinc-800 text-zinc-500 text-sm font-bold">
                            Sold Out
                          </span>
                        ) : (
                          <a
                            href={show.ticketUrl || '#'}
                            className={`px-5 py-2.5 rounded-full bg-gradient-to-r ${theme.gradient} text-white text-sm font-bold flex items-center gap-2 hover:shadow-lg transition-shadow`}
                          >
                            <FaTicketAlt className="text-xs" /> Tickets
                          </a>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* MERCH TAB */}
          {activeSection === 'merch' && (
            <motion.div
              key="merch"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-black">Merch Store</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {demoMerch.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`rounded-2xl overflow-hidden ${theme.cardBg} border ${theme.borderAccent} group hover:shadow-xl transition-all cursor-pointer`}
                  >
                    {/* Product image placeholder */}
                    <div className={`aspect-square bg-gradient-to-br ${theme.gradient} flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity`}>
                      <FaShoppingBag className="text-4xl text-white" />
                    </div>
                    <div className="p-4">
                      <p className="font-bold text-white text-sm truncate">{item.name}</p>
                      <p className="text-xs text-zinc-500 mt-1">{item.category}</p>
                      <p className={`font-black ${theme.textAccent} mt-2`}>${item.price}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* LIVE TAB */}
          {activeSection === 'live' && (
            <motion.div
              key="live"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Embedded Live Stream Viewer */}
              <LiveStreamViewer
                businessId={business.id || ''}
                context="performance"
                accentOverride={theme.accentColor}
                className="rounded-3xl border border-white/10"
              />

              {/* Fallback / social links when offline */}
              <div className="text-center py-8">
                <p className="text-zinc-500 text-sm mb-4">
                  Stay connected — follow {artistName} on these platforms for live updates:
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {business.socials?.youtube && (
                    <a href={business.socials.youtube} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-red-600 text-white rounded-full font-bold flex items-center gap-2 hover:bg-red-700 transition-colors">
                      <FaYoutube /> YouTube
                    </a>
                  )}
                  {business.socials?.instagram && (
                    <a href={business.socials.instagram} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-bold flex items-center gap-2 hover:shadow-lg transition-shadow">
                      <FaInstagram /> Instagram Live
                    </a>
                  )}
                  {business.socials?.tiktok && (
                    <a href={business.socials.tiktok} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-zinc-800 text-white rounded-full font-bold flex items-center gap-2 hover:bg-zinc-700 transition-colors">
                      <FaTiktok /> TikTok
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/5 py-8 mt-20">
        <div className="container mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-600">
            Powered by <Link href="/" className={`font-bold ${theme.textAccent} hover:underline`}>MohnMenu</Link>
          </p>
          <div className="flex items-center gap-4">
            <Link href={`/${slug}`} className="text-xs text-zinc-500 hover:text-white transition-colors">Main Page</Link>
            <Link href={`/${slug}/jukebox`} className="text-xs text-zinc-500 hover:text-white transition-colors">Jukebox</Link>
            <Link href={`/${slug}/contact`} className="text-xs text-zinc-500 hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
