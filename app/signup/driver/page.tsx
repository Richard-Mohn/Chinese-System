'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { MohnMenuUser } from '@/lib/types';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';
import ApplicationBackgroundCheckModal from '@/components/ApplicationBackgroundCheckModal';

/**
 * Driver Signup Page
 * Requires an invite code from a business owner.
 * Creates Firebase Auth user + MohnMenu user profile with driver role.
 */
export default function DriverSignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bgModalOpen, setBgModalOpen] = useState(false);
  const [bgCompleted, setBgCompleted] = useState(false);
  const [bgSummary, setBgSummary] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!bgCompleted) {
      setError('Please complete the required background check before joining.');
      return;
    }

    setLoading(true);

    try {
      // 1. Validate invite code — search across all businesses
      let foundBusinessId: string | null = null;
      let foundCodeId: string | null = null;
      let foundRole: string = 'driver_inhouse';

      // Search for the invite code across all businesses
      const businessesRef = collection(db, 'businesses');
      const businessSnapshot = await getDocs(businessesRef);
      
      for (const businessDoc of businessSnapshot.docs) {
        const codeQuery = query(
          collection(db, 'businesses', businessDoc.id, 'inviteCodes'),
          where('code', '==', inviteCode)
        );
        const codeSnapshot = await getDocs(codeQuery);
        
        if (!codeSnapshot.empty) {
          const codeData = codeSnapshot.docs[0].data();
          if (!codeData.usedBy) {
            foundBusinessId = businessDoc.id;
            foundCodeId = codeSnapshot.docs[0].id;
            foundRole = codeData.role || 'driver_inhouse';
            break;
          }
        }
      }

      if (!foundBusinessId || !foundCodeId) {
        throw new Error('Invalid or already used invite code.');
      }

      // 2. Create Firebase Auth user
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const uid = result.user.uid;

      // 3. Create MohnMenu user profile
      const MohnMenuUser: MohnMenuUser = {
        uid,
        email,
        displayName: displayName || email,
        role: foundRole as MohnMenuUser['role'],
        businessIds: [foundBusinessId],
        activeBusinessId: foundBusinessId,
        allowedBusinessIds: [foundBusinessId],
        backgroundCheckStatus: 'approved',
        backgroundCheckDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', uid), MohnMenuUser);

      // 4. Mark invite code as used
      const codeRef = doc(db, 'businesses', foundBusinessId, 'inviteCodes', foundCodeId);
      await setDoc(codeRef, {
        usedBy: uid,
        usedAt: new Date().toISOString(),
      }, { merge: true });

      // 5. Redirect to driver dashboard
      router.push('/driver');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent px-4 pt-24 pb-20">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-white rounded-[3rem] shadow-[0_20px_100px_rgba(0,0,0,0.05)] border border-zinc-100 p-12">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-black mb-3">
              Join as a Driver<span className="text-blue-600">.</span>
            </h1>
            <p className="text-zinc-500 font-medium">
              Enter your invite code to get started.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Invite Code</label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                required
                className="w-full px-5 py-4 border border-zinc-100 rounded-2xl bg-zinc-50 text-black font-bold focus:outline-none focus:ring-2 focus:ring-black transition-all placeholder:text-zinc-300 text-center tracking-widest text-lg"
                placeholder="ENTER CODE"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Full Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full px-5 py-4 border border-zinc-100 rounded-2xl bg-zinc-50 text-black font-bold focus:outline-none focus:ring-2 focus:ring-black transition-all placeholder:text-zinc-300"
                placeholder="John Smith"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-4 border border-zinc-100 rounded-2xl bg-zinc-50 text-black font-bold focus:outline-none focus:ring-2 focus:ring-black transition-all placeholder:text-zinc-300"
                placeholder="you@email.com"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-5 py-4 border border-zinc-100 rounded-2xl bg-zinc-50 text-black font-bold focus:outline-none focus:ring-2 focus:ring-black transition-all placeholder:text-zinc-300"
                placeholder="••••••••"
              />
            </div>

            <button
              type="button"
              onClick={() => setBgModalOpen(true)}
              className={`w-full py-3 rounded-full font-bold text-sm border transition-colors ${
                bgCompleted
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
              }`}
            >
              {bgCompleted ? `Background Check Complete${bgSummary ? ` · ${bgSummary}` : ''}` : 'Run Background Check'}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full group bg-black text-white py-5 rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-xl disabled:opacity-50"
            >
              {loading ? 'Joining...' : 'Join Team'}
              {!loading && <FaArrowRight className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-zinc-400 font-medium text-sm">
              <Link href="/login" className="font-bold text-black hover:underline">Already have an account?</Link>
            </p>
          </div>
        </div>
      </motion.div>

      <ApplicationBackgroundCheckModal
        open={bgModalOpen}
        onClose={() => setBgModalOpen(false)}
        defaultFullName={displayName}
        onComplete={(result) => {
          setBgCompleted(true);
          setBgSummary(`${result.recordCount} records scanned`);
        }}
      />
    </div>
  );
}
