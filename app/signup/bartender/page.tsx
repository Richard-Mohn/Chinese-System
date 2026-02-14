'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FaUser, FaEnvelope, FaLock, FaPhone, FaIdBadge, FaGlassCheers,
  FaArrowRight, FaCheck, FaStar, FaMapMarkerAlt, FaCalendarAlt,
  FaExchangeAlt, FaHeart, FaDollarSign
} from 'react-icons/fa';
import FloatingStoreIcons from '@/components/FloatingStoreIcons';
import ApplicationBackgroundCheckModal from '@/components/ApplicationBackgroundCheckModal';

const SPECIALTIES = [
  'Craft Cocktails', 'Beer & Draft', 'Wine Sommelier', 'Mixology',
  'Barback', 'Shot Service', 'Tiki & Tropical', 'Fine Dining Service',
  'Casual Dining', 'Fast Casual', 'Bottle Service / VIP', 'Event Bartending',
];

const CERTIFICATIONS = [
  'TABC Certified', 'TIPS Certified', 'ServSafe', 'Food Handler\'s Permit',
  'State Alcohol Server Permit', 'CPR / First Aid',
];

export default function BartenderSignup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1 — Account
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Step 2 — Profile
  const [role, setRole] = useState<'bartender' | 'server' | 'both'>('bartender');
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
  const [ageVerified, setAgeVerified] = useState(false);
  const [bgModalOpen, setBgModalOpen] = useState(false);
  const [bgCompleted, setBgCompleted] = useState(false);
  const [bgSummary, setBgSummary] = useState('');

  const toggleSpecialty = (s: string) => {
    setSelectedSpecialties(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };
  const toggleCert = (c: string) => {
    setSelectedCerts(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  async function handleSubmit() {
    if (!name || !email || !password || !phone) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!ageVerified) {
      setError('You must confirm you are 18+ to serve alcohol.');
      return;
    }
    if (!bgCompleted) {
      setError('Please complete the required background check before finishing your application.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', cred.user.uid), {
        name,
        email,
        phone,
        role: 'staff',
        staffRole: role,
        experience,
        bio,
        city,
        specialties: selectedSpecialties,
        certifications: selectedCerts,
        ageVerified: true,
        isActive: false, // needs owner approval at each venue
        rating: 0,
        reviewCount: 0,
        followers: 0,
        venues: [],
        totalShifts: 0,
        totalEarnings: 0,
        profileComplete: true,
        backgroundCheckStatus: 'approved',
        backgroundCheckDate: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
      setStep(3);
    } catch (e: any) {
      if (e.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Try signing in.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <FloatingStoreIcons storeType="bar" count={14} />

      {/* Hero header */}
      <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-purple-950 text-white pt-32 pb-16 px-4 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-purple-600/10 blur-[150px] rounded-full" />
        <div className="container mx-auto max-w-3xl text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-black uppercase tracking-widest text-purple-400"
          >
            <FaGlassCheers /> Join the Staff Marketplace
          </motion.div>
          <motion.h1
            className="text-4xl md:text-6xl font-black tracking-tight mb-4"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          >
            Bartender & Server<br />Signup<span className="text-purple-400">.</span>
          </motion.h1>
          <motion.p
            className="text-zinc-400 text-lg font-medium max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          >
            Work at multiple venues. Build your following. Let customers pre-order when they see you&apos;re on shift.
          </motion.p>
        </div>
      </div>

      {/* Perks bar */}
      <div className="bg-zinc-950 border-t border-zinc-800 py-6 px-4">
        <div className="container mx-auto max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { icon: FaExchangeAlt, label: 'Multi-venue work' },
            { icon: FaHeart, label: 'Build followers' },
            { icon: FaDollarSign, label: 'Track earnings' },
            { icon: FaCalendarAlt, label: 'Flexible shifts' },
          ].map((perk, i) => (
            <div key={i} className="flex items-center justify-center gap-2 text-zinc-400">
              <perk.icon className="text-purple-400 text-sm" />
              <span className="text-xs font-bold">{perk.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto max-w-2xl px-4 py-12">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {[
            { n: 1, label: 'Account' },
            { n: 2, label: 'Profile' },
            { n: 3, label: 'Done' },
          ].map(s => (
            <div key={s.n} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all ${
                step > s.n ? 'bg-green-500 text-white' : step === s.n ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-400'
              }`}>
                {step > s.n ? <FaCheck className="text-xs" /> : s.n}
              </div>
              <span className={`text-sm font-bold hidden sm:inline ${step === s.n ? 'text-black' : 'text-zinc-400'}`}>{s.label}</span>
              {s.n < 3 && <div className="w-8 h-px bg-zinc-200 hidden sm:block" />}
            </div>
          ))}
        </div>

        {/* Step 1 — Account details */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div>
              <h2 className="text-2xl font-black text-black mb-1">Create your account</h2>
              <p className="text-zinc-400 text-sm">Basic info to get started.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm font-medium">{error}</div>
            )}

            <div>
              <label className="block text-sm font-bold text-black mb-1.5">Full Name *</label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name"
                  className="w-full pl-11 pr-5 py-4 bg-zinc-50 rounded-2xl border border-zinc-200 text-black font-medium focus:ring-2 focus:ring-black focus:border-black outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-1.5">Email *</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                  className="w-full pl-11 pr-5 py-4 bg-zinc-50 rounded-2xl border border-zinc-200 text-black font-medium focus:ring-2 focus:ring-black focus:border-black outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-1.5">Password *</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters"
                  className="w-full pl-11 pr-5 py-4 bg-zinc-50 rounded-2xl border border-zinc-200 text-black font-medium focus:ring-2 focus:ring-black focus:border-black outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-1.5">Phone *</label>
              <div className="relative">
                <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 123-4567"
                  className="w-full pl-11 pr-5 py-4 bg-zinc-50 rounded-2xl border border-zinc-200 text-black font-medium focus:ring-2 focus:ring-black focus:border-black outline-none" />
              </div>
            </div>

            <button
              onClick={() => { if (name && email && password && phone) setStep(2); else setError('Please fill in all fields.'); }}
              className="w-full py-4 bg-black text-white rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all shadow-xl"
            >
              Continue <FaArrowRight />
            </button>
          </motion.div>
        )}

        {/* Step 2 — Profile */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-black mb-1">Build your profile</h2>
              <p className="text-zinc-400 text-sm">This is what owners and customers see.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm font-medium">{error}</div>
            )}

            {/* Role */}
            <div>
              <label className="block text-sm font-bold text-black mb-3">I am a... *</label>
              <div className="grid grid-cols-3 gap-3">
                {(['bartender', 'server', 'both'] as const).map(r => (
                  <button key={r} onClick={() => setRole(r)}
                    className={`py-3 rounded-2xl font-bold text-sm capitalize transition-all border-2 ${
                      role === r ? 'bg-black text-white border-black' : 'bg-zinc-50 text-zinc-600 border-zinc-100 hover:border-zinc-300'
                    }`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-bold text-black mb-1.5">City / Area *</label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Richmond, VA"
                  className="w-full pl-11 pr-5 py-4 bg-zinc-50 rounded-2xl border border-zinc-200 text-black font-medium focus:ring-2 focus:ring-black focus:border-black outline-none" />
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-bold text-black mb-1.5">Years of Experience</label>
              <select value={experience} onChange={e => setExperience(e.target.value)}
                title="Years of experience"
                className="w-full px-5 py-4 bg-zinc-50 rounded-2xl border border-zinc-200 text-black font-medium focus:ring-2 focus:ring-black focus:border-black outline-none">
                <option value="">Select...</option>
                <option value="0-1">Less than 1 year</option>
                <option value="1-3">1-3 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5-10">5-10 years</option>
                <option value="10+">10+ years</option>
              </select>
            </div>

            {/* Specialties */}
            <div>
              <label className="block text-sm font-bold text-black mb-3">Specialties</label>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map(s => (
                  <button key={s} onClick={() => toggleSpecialty(s)}
                    className={`px-3 py-2 rounded-full text-xs font-bold transition-all border ${
                      selectedSpecialties.includes(s) ? 'bg-purple-600 text-white border-purple-600' : 'bg-zinc-50 text-zinc-600 border-zinc-100 hover:border-zinc-300'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div>
              <label className="block text-sm font-bold text-black mb-3">Certifications</label>
              <div className="flex flex-wrap gap-2">
                {CERTIFICATIONS.map(c => (
                  <button key={c} onClick={() => toggleCert(c)}
                    className={`px-3 py-2 rounded-full text-xs font-bold transition-all border ${
                      selectedCerts.includes(c) ? 'bg-green-600 text-white border-green-600' : 'bg-zinc-50 text-zinc-600 border-zinc-100 hover:border-zinc-300'
                    }`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-bold text-black mb-1.5">Bio (optional)</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)}
                placeholder="Tell owners and customers about yourself..."
                rows={3}
                className="w-full px-5 py-4 bg-zinc-50 rounded-2xl border border-zinc-200 text-black font-medium focus:ring-2 focus:ring-black focus:border-black outline-none resize-none" />
            </div>

            {/* Age verification */}
            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 flex items-start gap-3">
              <button onClick={() => setAgeVerified(!ageVerified)}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all mt-0.5 ${
                  ageVerified ? 'bg-green-600 border-green-600' : 'border-zinc-300 bg-white'
                }`}>
                {ageVerified && <FaCheck className="text-white text-xs" />}
              </button>
              <div>
                <p className="font-bold text-black text-sm">Age Verification *</p>
                <p className="text-zinc-500 text-xs">I confirm I am 18 years or older and legally eligible to serve alcohol in my jurisdiction.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="px-6 py-4 text-zinc-600 font-bold rounded-full hover:bg-zinc-100 transition-all">
                Back
              </button>
              <button
                type="button"
                onClick={() => setBgModalOpen(true)}
                className={`px-5 py-4 rounded-full font-bold text-sm border transition-colors ${
                  bgCompleted
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                {bgCompleted ? `Check Complete${bgSummary ? ` · ${bgSummary}` : ''}` : 'Run Background Check'}
              </button>
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-purple-500/20 transition-all disabled:opacity-40">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Create Profile <FaCheck /></>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3 — Success */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-500/20">
              <FaCheck className="text-3xl text-white" />
            </div>
            <h1 className="text-4xl font-black text-black mb-4 tracking-tight">You&apos;re In!</h1>
            <p className="text-zinc-500 text-lg mb-3">
              Your staff profile has been created. You can now apply to work at any bar or restaurant on MohnMenu.
            </p>
            <p className="text-zinc-400 text-sm mb-8">
              Venue owners will review your profile, specialties, and certifications before approving you for shifts.
            </p>

            <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100 text-left max-w-md mx-auto mb-8 space-y-3">
              <h4 className="font-bold text-black text-sm mb-3">What&apos;s next?</h4>
              {[
                'Browse venues near you and apply',
                'Claim shifts when owners post them',
                'Build your following — customers can find you',
                'Earn tips + hourly pay at every shift',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-purple-50 rounded-full flex items-center justify-center shrink-0">
                    <FaCheck className="text-purple-600 text-[10px]" />
                  </div>
                  <span className="text-zinc-600 text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>

            <Link href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-full font-bold hover:bg-zinc-800 transition-all">
              Go to Dashboard <FaArrowRight />
            </Link>
          </motion.div>
        )}
      </div>

      <ApplicationBackgroundCheckModal
        open={bgModalOpen}
        onClose={() => setBgModalOpen(false)}
        defaultFullName={name}
        onComplete={(result) => {
          setBgCompleted(true);
          setBgSummary(`${result.recordCount} records scanned`);
        }}
      />
    </div>
  );
}
