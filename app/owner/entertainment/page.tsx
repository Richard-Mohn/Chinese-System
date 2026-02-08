'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import GatedPage from '@/components/GatedPage';
import { collection, query, where, getDocs, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  FaMusic, FaMicrophone, FaPlay, FaPause, FaForward, FaTrash,
  FaBan, FaCoins, FaDollarSign, FaCog, FaChevronLeft, FaArrowUp,
  FaArrowDown, FaVolumeUp, FaList, FaTv, FaToggleOn, FaToggleOff,
  FaChartBar, FaClock, FaUsers, FaStar
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
    creditPrice?: number;
    creditsPerSong?: number;
    maxQueueSize?: number;
    syncDelayMs?: number;
  };
}

export default function OwnerEntertainmentPageGated() {
  return (
    <GatedPage feature="entertainment">
      <OwnerEntertainmentPage />
    </GatedPage>
  );
}

function OwnerEntertainmentPage() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [history, setHistory] = useState<QueueItem[]>([]);
  const [activeTab, setActiveTab] = useState<'queue' | 'settings' | 'stats'>('queue');

  // Settings state
  const [jukeboxEnabled, setJukeboxEnabled] = useState(true);
  const [karaokeEnabled, setKaraokeEnabled] = useState(true);
  const [creditPrice, setCreditPrice] = useState(0.50);
  const [creditsPerSong, setCreditsPerSong] = useState(1);
  const [maxQueueSize, setMaxQueueSize] = useState(50);
  const [syncDelay, setSyncDelay] = useState(0);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Load business
  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const q = query(collection(db, 'businesses'), where('ownerId', '==', user.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const d = snap.docs[0];
          const data = { ...d.data(), businessId: d.id } as BusinessData;
          setBusiness(data);
          // Initialize settings from saved data
          if (data.entertainment) {
            setJukeboxEnabled(data.entertainment.jukeboxEnabled ?? true);
            setKaraokeEnabled(data.entertainment.karaokeEnabled ?? true);
            setCreditPrice(data.entertainment.creditPrice ?? 0.50);
            setCreditsPerSong(data.entertainment.creditsPerSong ?? 1);
            setMaxQueueSize(data.entertainment.maxQueueSize ?? 50);
            setSyncDelay(data.entertainment.syncDelayMs ?? 0);
          }
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [user]);

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
      setQueue(items.filter(i => i.status === 'queued' || i.status === 'playing'));
      setHistory(items.filter(i => i.status === 'played' || i.status === 'skipped'));
    });
    return () => unsub();
  }, [business]);

  const nowPlaying = queue.find(q => q.status === 'playing');
  const upNext = queue.filter(q => q.status === 'queued');

  // Queue controls
  async function playNext() {
    if (!business) return;
    // Mark current as played
    if (nowPlaying) {
      await updateDoc(doc(db, 'businesses', business.businessId, 'jukeboxQueue', nowPlaying.id), { status: 'played' });
    }
    // Mark next as playing
    if (upNext.length > 0) {
      await updateDoc(doc(db, 'businesses', business.businessId, 'jukeboxQueue', upNext[0].id), { status: 'playing' });
    }
  }

  async function skipCurrent() {
    if (!business || !nowPlaying) return;
    await updateDoc(doc(db, 'businesses', business.businessId, 'jukeboxQueue', nowPlaying.id), { status: 'skipped' });
    if (upNext.length > 0) {
      await updateDoc(doc(db, 'businesses', business.businessId, 'jukeboxQueue', upNext[0].id), { status: 'playing' });
    }
  }

  async function removeFromQueue(id: string) {
    if (!business) return;
    await deleteDoc(doc(db, 'businesses', business.businessId, 'jukeboxQueue', id));
  }

  async function startPlaying(id: string) {
    if (!business) return;
    if (nowPlaying) {
      await updateDoc(doc(db, 'businesses', business.businessId, 'jukeboxQueue', nowPlaying.id), { status: 'played' });
    }
    await updateDoc(doc(db, 'businesses', business.businessId, 'jukeboxQueue', id), { status: 'playing' });
  }

  async function clearQueue() {
    if (!business) return;
    for (const item of upNext) {
      await deleteDoc(doc(db, 'businesses', business.businessId, 'jukeboxQueue', item.id));
    }
  }

  // Save settings
  async function saveSettings() {
    if (!business) return;
    setSavingSettings(true);
    try {
      await updateDoc(doc(db, 'businesses', business.businessId), {
        entertainment: {
          jukeboxEnabled,
          karaokeEnabled,
          creditPrice,
          creditsPerSong,
          maxQueueSize,
          syncDelayMs: syncDelay,
        }
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
    setSavingSettings(false);
  }

  // Stats
  const totalSongsToday = history.length;
  const totalRevenue = history.reduce((sum, h) => sum + (h.credits * creditPrice), 0);
  const karaokeSongs = history.filter(h => h.isKaraoke).length;

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
        <p className="text-zinc-500">No business found for your account.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="bg-zinc-900/50 border-b border-zinc-800 px-4 py-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/owner" className="text-zinc-400 hover:text-white transition-colors">
                <FaChevronLeft />
              </Link>
              <div>
                <h1 className="text-lg font-black text-white">Entertainment Manager</h1>
                <p className="text-xs text-zinc-500">Jukebox & Karaoke Controls</p>
              </div>
            </div>
            <Link
              href={`/${business.slug}/now-playing`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 text-purple-400 rounded-xl text-sm font-bold hover:bg-purple-600 hover:text-white transition-all"
            >
              <FaTv /> Open TV Display
            </Link>
          </div>
        </div>
      </div>

      {/* Now playing banner */}
      {nowPlaying && (
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-b border-zinc-800 px-4 py-4">
          <div className="container mx-auto max-w-4xl flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shrink-0">
              <FaVolumeUp className="text-white animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Now Playing</p>
              <p className="font-black text-white truncate">{nowPlaying.songTitle} — {nowPlaying.artist}</p>
              <p className="text-xs text-zinc-400">
                {nowPlaying.requestedBy}
                {nowPlaying.isKaraoke && <span className="ml-2 text-yellow-400">🎤 Karaoke</span>}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={skipCurrent} className="p-3 bg-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all" title="Skip">
                <FaForward />
              </button>
              <button onClick={playNext} className="p-3 bg-purple-600 rounded-xl text-white hover:bg-purple-500 transition-all" title="Next">
                <FaPlay />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="container mx-auto max-w-4xl px-4 py-4">
        <div className="flex gap-1 bg-zinc-900 rounded-2xl p-1 mb-6">
          {[
            { id: 'queue' as const, label: 'Queue', icon: FaList, badge: upNext.length },
            { id: 'settings' as const, label: 'Settings', icon: FaCog },
            { id: 'stats' as const, label: 'Stats', icon: FaChartBar },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <tab.icon className="text-xs" />
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-1.5 py-0.5 bg-white/20 rounded-full text-[10px] font-black">{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* Queue Tab */}
        {activeTab === 'queue' && (
          <div className="space-y-4">
            {/* Quick actions */}
            <div className="flex gap-2">
              {!nowPlaying && upNext.length > 0 && (
                <button
                  onClick={() => startPlaying(upNext[0].id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-500 transition-all flex items-center gap-2"
                >
                  <FaPlay className="text-xs" /> Start Playing
                </button>
              )}
              {upNext.length > 0 && (
                <button
                  onClick={clearQueue}
                  className="px-4 py-2 bg-red-600/20 text-red-400 rounded-xl text-sm font-bold hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"
                >
                  <FaTrash className="text-xs" /> Clear Queue
                </button>
              )}
            </div>

            {/* Queue list */}
            {upNext.length === 0 ? (
              <div className="text-center py-16 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
                <FaMusic className="text-4xl text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500 font-bold">Queue is empty</p>
                <p className="text-zinc-600 text-sm">Customers can add songs from their phones</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upNext.map((item, i) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 flex items-center gap-4 group"
                  >
                    <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center text-sm font-black text-zinc-500 shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm truncate">
                        {item.songTitle}
                        {item.isKaraoke && <FaMicrophone className="inline ml-2 text-yellow-500 text-xs" />}
                      </p>
                      <p className="text-xs text-zinc-500">{item.artist} • {item.requestedBy}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startPlaying(item.id)}
                        className="p-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600 hover:text-white transition-all text-xs"
                        title="Play now"
                      >
                        <FaPlay />
                      </button>
                      <button
                        onClick={() => removeFromQueue(item.id)}
                        className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition-all text-xs"
                        title="Remove"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Recent history */}
            {history.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3">Recently Played</h3>
                <div className="space-y-1">
                  {history.slice(-10).reverse().map(item => (
                    <div key={item.id} className="flex items-center gap-3 py-2 px-3 bg-zinc-900/30 rounded-lg">
                      <FaMusic className="text-xs text-zinc-700" />
                      <span className="text-sm text-zinc-500 truncate flex-1">{item.songTitle} — {item.artist}</span>
                      <span className="text-[10px] text-zinc-600">{item.requestedBy}</span>
                      {item.status === 'skipped' && <span className="text-[10px] text-red-500 font-bold">SKIPPED</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Jukebox toggle */}
            <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white">Jukebox</h3>
                  <p className="text-xs text-zinc-500">Allow customers to request songs from their phones</p>
                </div>
                <button
                  onClick={() => setJukeboxEnabled(!jukeboxEnabled)}
                  className={`text-3xl transition-colors ${jukeboxEnabled ? 'text-green-400' : 'text-zinc-600'}`}
                >
                  {jukeboxEnabled ? <FaToggleOn /> : <FaToggleOff />}
                </button>
              </div>
            </div>

            {/* Karaoke toggle */}
            <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white">Karaoke Mode</h3>
                  <p className="text-xs text-zinc-500">Show lyrics on the TV display for karaoke songs</p>
                </div>
                <button
                  onClick={() => setKaraokeEnabled(!karaokeEnabled)}
                  className={`text-3xl transition-colors ${karaokeEnabled ? 'text-yellow-400' : 'text-zinc-600'}`}
                >
                  {karaokeEnabled ? <FaToggleOn /> : <FaToggleOff />}
                </button>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 space-y-4">
              <h3 className="font-bold text-white">Pricing</h3>
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-2">Price Per Credit ($)</label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  max="10"
                  value={creditPrice}
                  onChange={e => setCreditPrice(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-zinc-800 rounded-xl text-white font-mono font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-2">Credits Per Song</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={creditsPerSong}
                  onChange={e => setCreditsPerSong(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-zinc-800 rounded-xl text-white font-mono font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <p className="text-[10px] text-zinc-600 mt-1">
                  Effective price per song: ${(creditPrice * creditsPerSong).toFixed(2)}
                </p>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-2">Max Queue Size</label>
                <input
                  type="number"
                  min="5"
                  max="200"
                  value={maxQueueSize}
                  onChange={e => setMaxQueueSize(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-zinc-800 rounded-xl text-white font-mono font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>

            {/* Sync delay */}
            <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 space-y-4">
              <h3 className="font-bold text-white">Display Sync Delay</h3>
              <p className="text-xs text-zinc-500">
                Adjust the delay between lyrics and audio for your display hardware.
                Wireless displays and projectors typically need 100-500ms delay.
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
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'HDMI (0ms)', val: 0 },
                  { label: 'Fire TV (150ms)', val: 150 },
                  { label: 'Wi-Fi Cast (200ms)', val: 200 },
                  { label: 'Chromecast (250ms)', val: 250 },
                  { label: 'Projector (300ms)', val: 300 },
                  { label: 'Bluetooth (500ms)', val: 500 },
                ].map(p => (
                  <button
                    key={p.label}
                    onClick={() => setSyncDelay(p.val)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
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

            {/* Save button */}
            <button
              onClick={saveSettings}
              disabled={savingSettings}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-purple-500/20 disabled:opacity-50 transition-all"
            >
              {savingSettings ? 'Saving...' : settingsSaved ? '✓ Saved!' : 'Save Settings'}
            </button>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            {/* Stats cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Songs Played', value: totalSongsToday.toString(), icon: FaMusic, color: 'purple' },
                { label: 'Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: FaDollarSign, color: 'green' },
                { label: 'Karaoke Songs', value: karaokeSongs.toString(), icon: FaMicrophone, color: 'yellow' },
                { label: 'In Queue', value: upNext.length.toString(), icon: FaList, color: 'blue' },
              ].map(stat => (
                <div key={stat.label} className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 text-center">
                  <stat.icon className={`text-xl mx-auto mb-2 text-${stat.color}-400`} />
                  <p className="text-2xl font-black text-white">{stat.value}</p>
                  <p className="text-[10px] text-zinc-500 font-bold">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 text-center">
              <p className="text-zinc-500 text-sm">
                Detailed analytics dashboard coming soon. Track your most popular songs,
                peak hours, and revenue trends.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
