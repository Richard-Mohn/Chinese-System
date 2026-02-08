'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs, addDoc, onSnapshot, orderBy, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  FaMusic, FaMicrophone, FaSearch, FaPlay, FaPause, FaForward,
  FaCoins, FaPlus, FaClock, FaUser, FaChevronLeft, FaStar,
  FaGuitar, FaDrum, FaHeadphones, FaVolumeUp, FaCheck
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
  lyrics?: string;
}

interface BusinessData {
  businessId: string;
  businessName: string;
  slug: string;
  entertainment?: {
    jukeboxEnabled?: boolean;
    karaokeEnabled?: boolean;
    creditPrice?: number;
    creditsPerSong?: number;
    maxQueueSize?: number;
  };
}

const POPULAR_SONGS = [
  { title: 'Bohemian Rhapsody', artist: 'Queen', genre: 'Rock' },
  { title: 'Sweet Caroline', artist: 'Neil Diamond', genre: 'Pop' },
  { title: "Don't Stop Believin'", artist: 'Journey', genre: 'Rock' },
  { title: 'Mr. Brightside', artist: 'The Killers', genre: 'Rock' },
  { title: 'Livin\' on a Prayer', artist: 'Bon Jovi', genre: 'Rock' },
  { title: 'Wonderwall', artist: 'Oasis', genre: 'Rock' },
  { title: 'Uptown Funk', artist: 'Bruno Mars', genre: 'Pop' },
  { title: 'Piano Man', artist: 'Billy Joel', genre: 'Classic' },
  { title: 'Take Me Home, Country Roads', artist: 'John Denver', genre: 'Country' },
  { title: 'Friends in Low Places', artist: 'Garth Brooks', genre: 'Country' },
  { title: 'I Will Survive', artist: 'Gloria Gaynor', genre: 'Disco' },
  { title: 'Billie Jean', artist: 'Michael Jackson', genre: 'Pop' },
  { title: 'Hotel California', artist: 'Eagles', genre: 'Rock' },
  { title: 'Shallow', artist: 'Lady Gaga & Bradley Cooper', genre: 'Pop' },
  { title: 'Old Town Road', artist: 'Lil Nas X', genre: 'Country' },
  { title: 'Somebody That I Used To Know', artist: 'Gotye', genre: 'Pop' },
  { title: 'Wagon Wheel', artist: 'Darius Rucker', genre: 'Country' },
  { title: 'September', artist: 'Earth, Wind & Fire', genre: 'Funk' },
  { title: 'Total Eclipse of the Heart', artist: 'Bonnie Tyler', genre: 'Classic' },
  { title: 'All Star', artist: 'Smash Mouth', genre: 'Pop' },
];

const GENRES = ['All', 'Rock', 'Pop', 'Country', 'Classic', 'Funk', 'Disco'];

export default function JukeboxPage() {
  const params = useParams();
  const slug = params?.businessSlug as string;

  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [activeGenre, setActiveGenre] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [credits, setCredits] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(true);
  const [customSong, setCustomSong] = useState('');
  const [customArtist, setCustomArtist] = useState('');
  const [wantKaraoke, setWantKaraoke] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const [addedSong, setAddedSong] = useState('');

  // Load business
  useEffect(() => {
    async function load() {
      try {
        const q = query(collection(db, 'businesses'), where('slug', '==', slug));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const d = snap.docs[0];
          setBusiness({ ...d.data(), businessId: d.id } as BusinessData);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    if (slug) load();
  }, [slug]);

  // Real-time queue listener
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

  const creditPrice = business?.entertainment?.creditPrice ?? 0.50;
  const creditsPerSong = business?.entertainment?.creditsPerSong ?? 1;
  const nowPlaying = queue.find(q => q.status === 'playing');
  const upNext = queue.filter(q => q.status === 'queued');

  // Request a song
  async function requestSong(title: string, artist: string, karaoke: boolean) {
    if (!business || !playerName) return;
    if (credits < creditsPerSong) {
      setShowBuyCredits(true);
      return;
    }
    try {
      await addDoc(collection(db, 'businesses', business.businessId, 'jukeboxQueue'), {
        songTitle: title,
        artist,
        requestedBy: playerName,
        isKaraoke: karaoke,
        status: 'queued',
        credits: creditsPerSong,
        createdAt: serverTimestamp(),
      });
      setCredits(prev => prev - creditsPerSong);
      setAddedSong(title);
      setTimeout(() => setAddedSong(''), 3000);
    } catch (e) {
      console.error('Failed to add to queue:', e);
    }
  }

  // Buy credits (placeholder — would integrate with Stripe)
  function buyCredits(amount: number) {
    setCredits(prev => prev + amount);
    setShowBuyCredits(false);
  }

  const filteredSongs = POPULAR_SONGS.filter(s => {
    if (activeGenre !== 'All' && s.genre !== activeGenre) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return s.title.toLowerCase().includes(term) || s.artist.toLowerCase().includes(term);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="text-center">
          <h1 className="text-6xl font-black mb-4">404</h1>
          <p className="text-zinc-500">Business not found.</p>
        </div>
      </div>
    );
  }

  // Tier gate: entertainment requires professional
  if (!tierMeetsRequirement(business.tier, FEATURE_REGISTRY['entertainment'].minTier)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6"><FaCrown className="text-2xl text-amber-500" /></div>
          <h1 className="text-2xl font-black mb-2">Jukebox Unavailable</h1>
          <p className="text-zinc-500 text-sm">This feature is not enabled for this business.</p>
        </div>
      </div>
    );
  }

  // Name prompt
  if (showNamePrompt) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-sm w-full text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-purple-500/30">
            <FaMusic className="text-3xl text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">
            {business.businessName} Jukebox
          </h1>
          <p className="text-zinc-400 text-sm mb-8">Request songs, sing karaoke, and vibe.</p>
          <input
            type="text"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            placeholder="Your name or nickname"
            className="w-full px-5 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-white font-medium text-center focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none mb-4"
            autoFocus
          />
          <button
            onClick={() => { if (playerName.trim()) setShowNamePrompt(false); }}
            disabled={!playerName.trim()}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-purple-500/20 disabled:opacity-40 transition-all"
          >
            Enter Jukebox
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-32">
      {/* Header */}
      <div className="bg-gradient-to-b from-purple-900/40 to-zinc-950 pt-8 pb-6 px-4 sticky top-0 z-30 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="container mx-auto max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <Link href={`/${slug}`} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm">
              <FaChevronLeft className="text-xs" /> {business.businessName}
            </Link>
            <button
              onClick={() => setShowBuyCredits(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full text-black text-sm font-black shadow-lg shadow-amber-500/20"
            >
              <FaCoins /> {credits} Credit{credits !== 1 ? 's' : ''}
            </button>
          </div>

          {/* Now Playing */}
          {nowPlaying ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/80 rounded-2xl p-4 border border-zinc-800 flex items-center gap-4"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg relative">
                <FaVolumeUp className="text-xl text-white animate-pulse" />
                {nowPlaying.isKaraoke && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                    <FaMicrophone className="text-[8px] text-black" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-0.5">Now Playing</p>
                <p className="font-black text-white truncate">{nowPlaying.songTitle}</p>
                <p className="text-xs text-zinc-400">{nowPlaying.artist} • requested by {nowPlaying.requestedBy}</p>
              </div>
              {nowPlaying.isKaraoke && (
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold rounded-full shrink-0">KARAOKE</span>
              )}
            </motion.div>
          ) : (
            <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800/50 text-center">
              <FaMusic className="text-2xl text-zinc-600 mx-auto mb-2" />
              <p className="text-zinc-500 text-sm font-bold">No song playing</p>
              <p className="text-zinc-600 text-xs">Request a song to get the party started!</p>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto max-w-2xl px-4 py-6 space-y-6">
        {/* Up Next Queue */}
        {upNext.length > 0 && (
          <div>
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Up Next ({upNext.length})</h3>
            <div className="space-y-2">
              {upNext.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-zinc-900/60 rounded-xl p-3 border border-zinc-800/50 flex items-center gap-3"
                >
                  <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center text-sm font-black text-zinc-500">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm truncate">{item.songTitle}</p>
                    <p className="text-xs text-zinc-500">{item.artist} • {item.requestedBy}</p>
                  </div>
                  {item.isKaraoke && (
                    <FaMicrophone className="text-yellow-500 text-xs shrink-0" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search songs..."
            className="w-full pl-11 pr-5 py-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-white font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
          />
        </div>

        {/* Genre tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {GENRES.map(g => (
            <button
              key={g}
              onClick={() => setActiveGenre(g)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                activeGenre === g
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-600'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Song List */}
        <div className="space-y-2">
          {filteredSongs.map((song, i) => (
            <motion.div
              key={song.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-zinc-900/60 rounded-2xl p-4 border border-zinc-800/50 flex items-center gap-4 group hover:border-purple-500/30 transition-all"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-zinc-800 to-zinc-700 rounded-xl flex items-center justify-center shrink-0 group-hover:from-purple-600 group-hover:to-pink-600 transition-all">
                <FaMusic className="text-zinc-500 group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm">{song.title}</p>
                <p className="text-xs text-zinc-500">{song.artist}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => requestSong(song.title, song.artist, false)}
                  className="px-3 py-2 bg-purple-600/20 text-purple-400 rounded-xl text-xs font-bold hover:bg-purple-600 hover:text-white transition-all flex items-center gap-1"
                >
                  <FaPlay className="text-[10px]" /> Play
                </button>
                {business.entertainment?.karaokeEnabled !== false && (
                  <button
                    onClick={() => requestSong(song.title, song.artist, true)}
                    className="px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded-xl text-xs font-bold hover:bg-yellow-500 hover:text-black transition-all flex items-center gap-1"
                  >
                    <FaMicrophone className="text-[10px]" /> Sing
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Custom song request */}
        <div className="mt-6">
          {!showCustomForm ? (
            <button
              onClick={() => setShowCustomForm(true)}
              className="w-full py-4 bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl text-zinc-400 font-bold text-sm hover:border-purple-500 hover:text-purple-400 transition-all flex items-center justify-center gap-2"
            >
              <FaPlus /> Request a song not on the list
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 space-y-3"
            >
              <h4 className="font-bold text-white text-sm">Custom Song Request</h4>
              <input
                type="text"
                value={customSong}
                onChange={e => setCustomSong(e.target.value)}
                placeholder="Song title"
                className="w-full px-4 py-3 bg-zinc-800 rounded-xl text-white text-sm font-medium focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <input
                type="text"
                value={customArtist}
                onChange={e => setCustomArtist(e.target.value)}
                placeholder="Artist"
                className="w-full px-4 py-3 bg-zinc-800 rounded-xl text-white text-sm font-medium focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <label className="flex items-center gap-3 px-4 py-3 bg-zinc-800 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={wantKaraoke}
                  onChange={e => setWantKaraoke(e.target.checked)}
                  className="w-4 h-4 accent-yellow-500"
                />
                <FaMicrophone className="text-yellow-500" />
                <span className="text-sm font-bold text-white">I want to sing this (Karaoke)</span>
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCustomForm(false)}
                  className="px-5 py-3 bg-zinc-800 text-zinc-400 rounded-xl text-sm font-bold hover:bg-zinc-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (customSong && customArtist) {
                      requestSong(customSong, customArtist, wantKaraoke);
                      setCustomSong('');
                      setCustomArtist('');
                      setWantKaraoke(false);
                      setShowCustomForm(false);
                    }
                  }}
                  disabled={!customSong || !customArtist}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-bold disabled:opacity-40 transition-all"
                >
                  Request Song ({creditsPerSong} credit{creditsPerSong > 1 ? 's' : ''})
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Buy Credits Modal */}
      <AnimatePresence>
        {showBuyCredits && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center"
            onClick={() => setShowBuyCredits(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-zinc-900 w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl p-6 border border-zinc-800"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <FaCoins className="text-xl text-black" />
              </div>
              <h3 className="text-xl font-black text-white text-center mb-1">Buy Credits</h3>
              <p className="text-zinc-500 text-sm text-center mb-6">{creditsPerSong} credit = 1 song • ${creditPrice.toFixed(2)} each</p>
              <div className="space-y-3">
                {[
                  { amount: 3, label: '3 Songs' },
                  { amount: 5, label: '5 Songs' },
                  { amount: 10, label: '10 Songs', badge: 'Popular' },
                  { amount: 20, label: '20 Songs', badge: 'Best Value' },
                ].map(pkg => (
                  <button
                    key={pkg.amount}
                    onClick={() => buyCredits(pkg.amount * creditsPerSong)}
                    className="w-full flex items-center justify-between px-5 py-4 bg-zinc-800 rounded-2xl hover:bg-zinc-700 transition-all group"
                  >
                    <div>
                      <p className="font-bold text-white text-sm group-hover:text-purple-400 transition-colors">{pkg.label}</p>
                      <p className="text-xs text-zinc-500">{pkg.amount * creditsPerSong} credits</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {pkg.badge && (
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] font-bold rounded-full">{pkg.badge}</span>
                      )}
                      <span className="font-black text-white">${(pkg.amount * creditPrice).toFixed(2)}</span>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-zinc-600 text-[10px] text-center mt-4">Credits are non-refundable. Payment processed securely via Stripe.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Song Added Toast */}
      <AnimatePresence>
        {addedSong && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full font-bold text-sm shadow-xl z-50 flex items-center gap-2"
          >
            <FaCheck /> Added &quot;{addedSong}&quot; to queue
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom info bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800 py-3 px-4 z-40">
        <div className="container mx-auto max-w-2xl flex items-center justify-between">
          <div className="text-xs text-zinc-500">
            <span className="font-bold text-zinc-300">{upNext.length}</span> song{upNext.length !== 1 ? 's' : ''} in queue
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={`/${slug}/now-playing`}
              className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors"
            >
              Open TV Display →
            </Link>
            <span className="text-xs text-zinc-500">
              Playing as <span className="text-white font-bold">{playerName}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
