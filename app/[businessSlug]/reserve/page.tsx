'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  FaCalendarAlt, FaClock, FaUsers, FaUser, FaPhone, FaEnvelope,
  FaArrowRight, FaCheck, FaGlassCheers, FaUtensils, FaConciergeBell,
  FaStar, FaChevronLeft, FaCrown
} from 'react-icons/fa';
import { tierMeetsRequirement, FEATURE_REGISTRY } from '@/lib/tier-features';

interface BusinessData {
  businessId: string;
  businessName: string;
  slug: string;
  serviceType?: string;
  phone?: string;
  address?: string;
  reservationSettings?: {
    enabled?: boolean;
    maxPartySize?: number;
    timeSlotMinutes?: number;
    openTime?: string;
    closeTime?: string;
    daysOpen?: string[];
    autoConfirm?: boolean;
    requireDeposit?: boolean;
    depositAmount?: number;
    vipEnabled?: boolean;
  };
}

const PARTY_SIZES = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20];

const TIME_SLOTS = [
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
  '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM',
  '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM',
  '9:00 PM', '9:30 PM', '10:00 PM', '10:30 PM',
  '11:00 PM',
];

const OCCASIONS = [
  'Birthday', 'Anniversary', 'Date Night', 'Business Dinner',
  'Celebration', 'Just Dining', 'Bachelor/ette Party', 'Group Outing',
];

export default function ReservePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.businessSlug as string;

  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(1); // 1=party, 2=datetime, 3=details

  // Form state
  const [partySize, setPartySize] = useState(2);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [occasion, setOccasion] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [seatingPreference, setSeatingPreference] = useState<'indoor' | 'outdoor' | 'bar' | 'private' | ''>('');
  const [isVIP, setIsVIP] = useState(false);

  /* ─── Load business ─── */
  useEffect(() => {
    async function load() {
      try {
        const q = query(collection(db, 'businesses'), where('slug', '==', slug));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const doc = snap.docs[0];
          setBusiness({ ...doc.data(), businessId: doc.id } as BusinessData);
        }
      } catch (e) {
        console.error('Failed to load business:', e);
      } finally {
        setLoading(false);
      }
    }
    if (slug) load();
  }, [slug]);

  /* ─── Get min date (today) ─── */
  const today = new Date().toISOString().split('T')[0];

  /* ─── Submit reservation ─── */
  async function handleSubmit() {
    if (!business || !name || !phone || !date || !time) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'businesses', business.businessId, 'bookings'), {
        name,
        phone,
        email,
        partySize,
        date,
        time,
        occasion,
        specialRequests,
        seatingPreference,
        isVIP,
        status: business.reservationSettings?.autoConfirm ? 'confirmed' : 'pending',
        type: 'reservation',
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (e) {
      console.error('Failed to create reservation:', e);
      alert('Something went wrong. Please try again or call us directly.');
    } finally {
      setSubmitting(false);
    }
  }

  /* ─── Loading state ─── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* ─── 404 ─── */
  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-6xl font-black mb-4">404</h1>
          <p className="text-zinc-500 mb-6">This business was not found.</p>
          <Link href="/" className="text-orange-600 font-bold hover:underline">Go Home</Link>
        </div>
      </div>
    );
  }

  /* ─── Tier gate ─── */
  if (!tierMeetsRequirement((business as any).tier, FEATURE_REGISTRY['reservations'].minTier)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-500/20">
            <FaCrown className="text-3xl text-white" />
          </div>
          <h1 className="text-3xl font-black text-black mb-3">Reservations Unavailable</h1>
          <p className="text-zinc-500 mb-6">This business hasn&apos;t enabled online reservations yet.</p>
          <Link href={`/${slug}`} className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-bold hover:bg-zinc-800 transition-all">
            <FaChevronLeft className="text-sm" /> Back to {business.businessName}
          </Link>
        </div>
      </div>
    );
  }

  /* ─── Confirmation ─── */
  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-500/20">
            <FaCheck className="text-3xl text-white" />
          </div>
          <h1 className="text-4xl font-black text-black mb-4 tracking-tight">Reservation {business.reservationSettings?.autoConfirm ? 'Confirmed' : 'Requested'}!</h1>
          <p className="text-zinc-500 text-lg mb-2">
            {business.reservationSettings?.autoConfirm
              ? `Your table for ${partySize} at ${business.businessName} is confirmed.`
              : `Your reservation request for ${partySize} guests has been sent to ${business.businessName}.`
            }
          </p>
          <div className="bg-zinc-50 rounded-2xl p-6 mt-8 border border-zinc-100 text-left space-y-3">
            <div className="flex justify-between">
              <span className="text-zinc-400 text-sm font-medium">Date</span>
              <span className="font-bold text-black">{new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400 text-sm font-medium">Time</span>
              <span className="font-bold text-black">{time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400 text-sm font-medium">Party Size</span>
              <span className="font-bold text-black">{partySize} {partySize === 1 ? 'guest' : 'guests'}</span>
            </div>
            {occasion && (
              <div className="flex justify-between">
                <span className="text-zinc-400 text-sm font-medium">Occasion</span>
                <span className="font-bold text-black">{occasion}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-zinc-400 text-sm font-medium">Confirmation</span>
              <span className="font-bold text-black">{name} • {phone}</span>
            </div>
          </div>
          {!business.reservationSettings?.autoConfirm && (
            <p className="text-zinc-400 text-sm mt-6">You&apos;ll receive a confirmation call or text shortly.</p>
          )}
          <Link
            href={`/${slug}`}
            className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-black text-white rounded-full font-bold hover:bg-zinc-800 transition-all"
          >
            Back to {business.businessName}
          </Link>
        </motion.div>
      </div>
    );
  }

  /* ─── Main reservation form ─── */
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white pt-32 pb-16 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-4xl relative z-10">
          <Link href={`/${slug}`} className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6 text-sm font-medium">
            <FaChevronLeft className="text-xs" /> Back to {business.businessName}
          </Link>
          <motion.h1
            className="text-4xl md:text-6xl font-black tracking-tight mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Reserve a Table<span className="text-orange-500">.</span>
          </motion.h1>
          <motion.p
            className="text-zinc-400 text-lg font-medium max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Book your table at {business.businessName}. Select your party size, date, and time — we&apos;ll have everything ready.
          </motion.p>
        </div>
        <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-orange-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-10 -left-10 w-48 h-48 bg-blue-500/5 blur-[100px] rounded-full" />
      </div>

      {/* Step Progress */}
      <div className="container mx-auto max-w-2xl px-4 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-zinc-100 p-4">
          <div className="flex items-center justify-between">
            {[
              { n: 1, label: 'Party Size', icon: FaUsers },
              { n: 2, label: 'Date & Time', icon: FaCalendarAlt },
              { n: 3, label: 'Your Details', icon: FaUser },
            ].map((s, i) => (
              <button
                key={s.n}
                onClick={() => { if (s.n < step) setStep(s.n); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex-1 justify-center ${
                  step === s.n
                    ? 'bg-black text-white shadow-lg'
                    : step > s.n
                    ? 'bg-green-50 text-green-700'
                    : 'text-zinc-400'
                }`}
              >
                {step > s.n ? <FaCheck className="text-green-500" /> : <s.icon />}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Form Body */}
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <AnimatePresence mode="wait">
          {/* ─── Step 1: Party Size ─── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-black text-black mb-2">How many guests?</h2>
                <p className="text-zinc-400 text-sm">Select the number of people dining.</p>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {PARTY_SIZES.map(size => (
                  <button
                    key={size}
                    onClick={() => setPartySize(size)}
                    className={`py-4 rounded-2xl text-lg font-black transition-all border-2 ${
                      partySize === size
                        ? 'bg-black text-white border-black shadow-xl scale-105'
                        : 'bg-zinc-50 text-zinc-700 border-zinc-100 hover:border-zinc-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <div>
                <h3 className="text-lg font-bold text-black mb-3">Seating preference</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { v: 'indoor' as const, label: 'Indoor', icon: FaUtensils },
                    { v: 'outdoor' as const, label: 'Outdoor', icon: FaStar },
                    { v: 'bar' as const, label: 'Bar', icon: FaGlassCheers },
                    { v: 'private' as const, label: 'Private', icon: FaConciergeBell },
                  ].map(opt => (
                    <button
                      key={opt.v}
                      onClick={() => setSeatingPreference(seatingPreference === opt.v ? '' : opt.v)}
                      className={`flex flex-col items-center gap-2 py-4 rounded-2xl transition-all border-2 ${
                        seatingPreference === opt.v
                          ? 'bg-black text-white border-black'
                          : 'bg-zinc-50 text-zinc-600 border-zinc-100 hover:border-zinc-300'
                      }`}
                    >
                      <opt.icon className="text-xl" />
                      <span className="text-sm font-bold">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-4 bg-black text-white rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all shadow-xl"
              >
                Continue <FaArrowRight />
              </button>
            </motion.div>
          )}

          {/* ─── Step 2: Date & Time ─── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-black text-black mb-2">When are you coming?</h2>
                <p className="text-zinc-400 text-sm">Pick a date and your preferred time.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">Date</label>
                <input
                  type="date"
                  min={today}
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-5 py-4 bg-zinc-50 rounded-2xl border border-zinc-200 text-black font-medium focus:ring-2 focus:ring-black focus:border-black outline-none text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-3">Time</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-60 overflow-y-auto pr-2">
                  {TIME_SLOTS.map(slot => (
                    <button
                      key={slot}
                      onClick={() => setTime(slot)}
                      className={`py-3 rounded-xl text-sm font-bold transition-all border ${
                        time === slot
                          ? 'bg-black text-white border-black shadow-lg'
                          : 'bg-zinc-50 text-zinc-600 border-zinc-100 hover:border-zinc-300'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-4 text-zinc-600 font-bold rounded-full hover:bg-zinc-100 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => { if (date && time) setStep(3); }}
                  disabled={!date || !time}
                  className="flex-1 py-4 bg-black text-white rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all shadow-xl disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue <FaArrowRight />
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── Step 3: Contact Details ─── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-black text-black mb-2">Almost there!</h2>
                <p className="text-zinc-400 text-sm">Enter your contact info to complete the reservation.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-black mb-1.5">Full Name *</label>
                  <div className="relative">
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-11 pr-5 py-4 bg-zinc-50 rounded-2xl border border-zinc-200 text-black font-medium focus:ring-2 focus:ring-black focus:border-black outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1.5">Phone Number *</label>
                  <div className="relative">
                    <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      className="w-full pl-11 pr-5 py-4 bg-zinc-50 rounded-2xl border border-zinc-200 text-black font-medium focus:ring-2 focus:ring-black focus:border-black outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1.5">Email (optional)</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full pl-11 pr-5 py-4 bg-zinc-50 rounded-2xl border border-zinc-200 text-black font-medium focus:ring-2 focus:ring-black focus:border-black outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-3">Occasion (optional)</label>
                <div className="flex flex-wrap gap-2">
                  {OCCASIONS.map(o => (
                    <button
                      key={o}
                      onClick={() => setOccasion(occasion === o ? '' : o)}
                      className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                        occasion === o
                          ? 'bg-black text-white border-black'
                          : 'bg-zinc-50 text-zinc-600 border-zinc-100 hover:border-zinc-300'
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-1.5">Special Requests (optional)</label>
                <textarea
                  value={specialRequests}
                  onChange={e => setSpecialRequests(e.target.value)}
                  placeholder="High chair needed, allergy notes, birthday cake, etc."
                  rows={3}
                  className="w-full px-5 py-4 bg-zinc-50 rounded-2xl border border-zinc-200 text-black font-medium focus:ring-2 focus:ring-black focus:border-black outline-none resize-none"
                />
              </div>

              {/* VIP toggle */}
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-5 border border-amber-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <FaStar className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-black">VIP Experience</p>
                    <p className="text-zinc-500 text-xs">Priority seating, premium service</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsVIP(!isVIP)}
                  className={`w-14 h-8 rounded-full transition-all relative ${isVIP ? 'bg-amber-500' : 'bg-zinc-200'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-md absolute top-1 transition-all ${isVIP ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              {/* Summary */}
              <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100 space-y-2">
                <h4 className="font-bold text-black text-sm mb-3">Reservation Summary</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Restaurant</span>
                  <span className="font-bold text-black">{business.businessName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Party Size</span>
                  <span className="font-bold text-black">{partySize} {partySize === 1 ? 'guest' : 'guests'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Date</span>
                  <span className="font-bold text-black">{date ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Time</span>
                  <span className="font-bold text-black">{time || '—'}</span>
                </div>
                {seatingPreference && (
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Seating</span>
                    <span className="font-bold text-black capitalize">{seatingPreference}</span>
                  </div>
                )}
                {isVIP && (
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">VIP</span>
                    <span className="font-bold text-amber-600">⭐ Yes</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-4 text-zinc-600 font-bold rounded-full hover:bg-zinc-100 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!name || !phone || submitting}
                  className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-orange-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Confirm Reservation <FaCheck /></>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom info */}
      <div className="container mx-auto max-w-2xl px-4 pb-20">
        <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <FaConciergeBell className="text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-black text-sm mb-1">Need to modify or cancel?</p>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Contact {business.businessName} directly at {business.phone || 'the number on their page'} to make changes to your reservation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
