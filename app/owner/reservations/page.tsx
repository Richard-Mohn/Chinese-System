'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import GatedPage from '@/components/GatedPage';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import {
  collection, query, where, getDocs, doc, updateDoc, orderBy,
  onSnapshot, Timestamp
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCalendarAlt, FaClock, FaUsers, FaCheck, FaTimes, FaUser,
  FaPhone, FaEnvelope, FaSearch, FaChevronDown, FaStar,
  FaGlassCheers, FaConciergeBell, FaArrowLeft, FaFilter
} from 'react-icons/fa';
import Link from 'next/link';

interface Booking {
  id: string;
  name: string;
  phone: string;
  email?: string;
  partySize: number;
  date: string;
  time: string;
  occasion?: string;
  specialRequests?: string;
  seatingPreference?: string;
  isVIP?: boolean;
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no-show';
  type?: string;
  createdAt: Timestamp;
  notes?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  confirmed: { label: 'Confirmed', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  seated: { label: 'Seated', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  completed: { label: 'Completed', color: 'text-zinc-600', bg: 'bg-zinc-50 border-zinc-200' },
  cancelled: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  'no-show': { label: 'No Show', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
};

export default function OwnerReservationsGated() {
  return (
    <GatedPage feature="reservations">
      <OwnerReservations />
    </GatedPage>
  );
}

function OwnerReservations() {
  const { user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [businessId, setBusinessId] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'today' | 'upcoming' | 'past' | 'all'>('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  /* ─── Load business ID ─── */
  useEffect(() => {
    async function loadBusiness() {
      if (!user) return;
      try {
        const q = query(collection(db, 'businesses'), where('ownerId', '==', user.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setBusinessId(snap.docs[0].id);
        }
      } catch (e) {
        console.error('Failed to load business:', e);
      }
    }
    loadBusiness();
  }, [user]);

  /* ─── Real-time bookings listener ─── */
  useEffect(() => {
    if (!businessId) return;
    const bookingsRef = collection(db, 'businesses', businessId, 'bookings');
    const unsub = onSnapshot(bookingsRef, (snap) => {
      const items: Booking[] = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      })) as Booking[];
      items.sort((a, b) => {
        const da = a.date + ' ' + a.time;
        const db2 = b.date + ' ' + b.time;
        return da > db2 ? 1 : -1;
      });
      setBookings(items);
      setLoading(false);
    });
    return () => unsub();
  }, [businessId]);

  /* ─── Filter bookings ─── */
  const todayStr = new Date().toISOString().split('T')[0];
  const filtered = bookings.filter(b => {
    // Tab filter
    if (tab === 'today' && b.date !== todayStr) return false;
    if (tab === 'upcoming' && b.date <= todayStr) return false;
    if (tab === 'past' && b.date >= todayStr) return false;

    // Status filter
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;

    // Search
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return b.name?.toLowerCase().includes(s) || b.phone?.includes(s) || b.email?.toLowerCase().includes(s);
    }
    return true;
  });

  /* ─── Update status ─── */
  async function updateStatus(bookingId: string, newStatus: string) {
    if (!businessId) return;
    try {
      await updateDoc(doc(db, 'businesses', businessId, 'bookings', bookingId), {
        status: newStatus,
      });
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  }

  /* ─── Update notes ─── */
  async function updateNotes(bookingId: string, notes: string) {
    if (!businessId) return;
    try {
      await updateDoc(doc(db, 'businesses', businessId, 'bookings', bookingId), { notes });
    } catch (e) {
      console.error('Failed to update notes:', e);
    }
  }

  /* ─── Stats ─── */
  const todayBookings = bookings.filter(b => b.date === todayStr);
  const todayGuests = todayBookings.reduce((sum, b) => sum + (b.partySize || 0), 0);
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedToday = todayBookings.filter(b => b.status === 'confirmed' || b.status === 'seated').length;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-zinc-500">Please log in to manage reservations.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50">
      {/* Header */}
      <div className="bg-white border-b border-zinc-100">
        <div className="container mx-auto max-w-7xl px-6 pt-28 pb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link href="/owner" className="inline-flex items-center gap-2 text-zinc-400 hover:text-black transition-colors text-sm font-medium mb-3">
                <FaArrowLeft className="text-xs" /> Owner Dashboard
              </Link>
              <h1 className="text-3xl font-black text-black tracking-tight">
                Reservations<span className="text-orange-500">.</span>
              </h1>
              <p className="text-zinc-400 text-sm mt-1">Manage table bookings and waitlist</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100">
              <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">Today&apos;s Bookings</p>
              <p className="text-3xl font-black text-black">{todayBookings.length}</p>
            </div>
            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100">
              <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">Expected Guests</p>
              <p className="text-3xl font-black text-black">{todayGuests}</p>
            </div>
            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
              <p className="text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">Awaiting Confirm</p>
              <p className="text-3xl font-black text-amber-700">{pendingCount}</p>
            </div>
            <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
              <p className="text-green-600 text-xs font-bold uppercase tracking-wider mb-1">Confirmed Today</p>
              <p className="text-3xl font-black text-green-700">{confirmedToday}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="container mx-auto max-w-7xl px-6 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          {/* Tabs */}
          <div className="flex bg-white rounded-xl border border-zinc-100 p-1 shadow-sm">
            {(['today', 'upcoming', 'past', 'all'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all capitalize ${
                  tab === t ? 'bg-black text-white shadow-md' : 'text-zinc-500 hover:text-black'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-700 focus:ring-2 focus:ring-black outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="seated">Seated</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
            </select>

            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm" />
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-black outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="container mx-auto max-w-7xl px-6 pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <FaCalendarAlt className="text-4xl text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-400 font-bold text-lg">No reservations found</p>
            <p className="text-zinc-300 text-sm mt-1">
              {tab === 'today' ? 'No bookings for today yet.' : 'Try adjusting your filters.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(booking => {
              const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
              const expanded = expandedId === booking.id;
              return (
                <motion.div
                  key={booking.id}
                  layout
                  className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Main row */}
                  <button
                    onClick={() => setExpandedId(expanded ? null : booking.id)}
                    className="w-full flex items-center gap-4 p-5 text-left"
                  >
                    {/* Time badge */}
                    <div className="bg-zinc-900 text-white w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-zinc-400">{booking.time?.split(' ')[1] || ''}</span>
                      <span className="text-lg font-black leading-tight">{booking.time?.split(':')[0] || ''}</span>
                      <span className="text-[10px] font-bold text-zinc-400">
                        {booking.date ? new Date(booking.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-black truncate">{booking.name}</span>
                        {booking.isVIP && <FaStar className="text-amber-500 text-xs" />}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-zinc-400">
                        <span className="flex items-center gap-1"><FaUsers /> {booking.partySize}</span>
                        <span className="flex items-center gap-1"><FaPhone /> {booking.phone}</span>
                        {booking.seatingPreference && (
                          <span className="flex items-center gap-1 capitalize"><FaConciergeBell /> {booking.seatingPreference}</span>
                        )}
                        {booking.occasion && (
                          <span className="hidden md:flex items-center gap-1"><FaGlassCheers /> {booking.occasion}</span>
                        )}
                      </div>
                    </div>

                    {/* Status badge */}
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.color} shrink-0`}>
                      {cfg.label}
                    </span>

                    <FaChevronDown className={`text-zinc-300 transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Expanded panel */}
                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-zinc-100 overflow-hidden"
                      >
                        <div className="p-5 space-y-5">
                          {/* Contact details */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-zinc-50 rounded-xl p-4">
                              <p className="text-zinc-400 text-xs font-bold mb-1">Contact</p>
                              <p className="font-bold text-black text-sm">{booking.name}</p>
                              <p className="text-zinc-500 text-xs">{booking.phone}</p>
                              {booking.email && <p className="text-zinc-500 text-xs">{booking.email}</p>}
                            </div>
                            <div className="bg-zinc-50 rounded-xl p-4">
                              <p className="text-zinc-400 text-xs font-bold mb-1">Reservation</p>
                              <p className="font-bold text-black text-sm">{booking.partySize} guests • {booking.time}</p>
                              <p className="text-zinc-500 text-xs">
                                {booking.date ? new Date(booking.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : ''}
                              </p>
                            </div>
                            <div className="bg-zinc-50 rounded-xl p-4">
                              <p className="text-zinc-400 text-xs font-bold mb-1">Preferences</p>
                              <p className="font-bold text-black text-sm capitalize">{booking.seatingPreference || 'No preference'}</p>
                              {booking.occasion && <p className="text-zinc-500 text-xs">{booking.occasion}</p>}
                              {booking.isVIP && <p className="text-amber-600 text-xs font-bold mt-1">⭐ VIP Guest</p>}
                            </div>
                          </div>

                          {/* Special requests */}
                          {booking.specialRequests && (
                            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                              <p className="text-amber-700 text-xs font-bold mb-1">Special Requests</p>
                              <p className="text-amber-800 text-sm">{booking.specialRequests}</p>
                            </div>
                          )}

                          {/* Internal notes */}
                          <div>
                            <label className="text-xs font-bold text-zinc-400 mb-1 block">Internal Notes</label>
                            <textarea
                              defaultValue={booking.notes || ''}
                              onBlur={e => updateNotes(booking.id, e.target.value)}
                              placeholder="Add private notes about this reservation..."
                              rows={2}
                              className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-zinc-200 text-sm font-medium focus:ring-2 focus:ring-black outline-none resize-none"
                            />
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2">
                            {booking.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => updateStatus(booking.id, 'confirmed')}
                                  className="px-5 py-2.5 bg-blue-600 text-white rounded-full text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
                                >
                                  <FaCheck /> Confirm
                                </button>
                                <button
                                  onClick={() => updateStatus(booking.id, 'cancelled')}
                                  className="px-5 py-2.5 bg-red-50 text-red-600 rounded-full text-sm font-bold hover:bg-red-100 transition-all flex items-center gap-2"
                                >
                                  <FaTimes /> Decline
                                </button>
                              </>
                            )}
                            {booking.status === 'confirmed' && (
                              <>
                                <button
                                  onClick={() => updateStatus(booking.id, 'seated')}
                                  className="px-5 py-2.5 bg-green-600 text-white rounded-full text-sm font-bold hover:bg-green-700 transition-all flex items-center gap-2"
                                >
                                  <FaCheck /> Mark Seated
                                </button>
                                <button
                                  onClick={() => updateStatus(booking.id, 'no-show')}
                                  className="px-5 py-2.5 bg-zinc-100 text-zinc-600 rounded-full text-sm font-bold hover:bg-zinc-200 transition-all"
                                >
                                  No Show
                                </button>
                                <button
                                  onClick={() => updateStatus(booking.id, 'cancelled')}
                                  className="px-5 py-2.5 bg-red-50 text-red-600 rounded-full text-sm font-bold hover:bg-red-100 transition-all"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            {booking.status === 'seated' && (
                              <button
                                onClick={() => updateStatus(booking.id, 'completed')}
                                className="px-5 py-2.5 bg-black text-white rounded-full text-sm font-bold hover:bg-zinc-800 transition-all flex items-center gap-2"
                              >
                                <FaCheck /> Mark Completed
                              </button>
                            )}
                            {(booking.status === 'cancelled' || booking.status === 'no-show' || booking.status === 'completed') && (
                              <button
                                onClick={() => updateStatus(booking.id, 'pending')}
                                className="px-5 py-2.5 bg-zinc-100 text-zinc-600 rounded-full text-sm font-bold hover:bg-zinc-200 transition-all"
                              >
                                Reset to Pending
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
