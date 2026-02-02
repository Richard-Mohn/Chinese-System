'use client';

import React, { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'customer' | 'staff'>('customer');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        role: role,
        createdAt: new Date().toISOString()
      });

      router.push('/menu');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-8 border border-zinc-200 dark:border-zinc-800">
        <div className="text-center mb-8">
          <span className="text-4xl mb-4 block">🐉</span>
          <h1 className="text-3xl font-black text-indigo-900 dark:text-indigo-400 uppercase tracking-tighter">Join the Dragon</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Create your 2026 Dining Account</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-bold p-4 rounded-xl mb-6 uppercase tracking-tight">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-2 ml-1">Full Name</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-2 ml-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-2 ml-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-2 ml-1">Account Type</label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-2 ${
                  role === 'customer'
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600'
                }`}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => setRole('staff')}
                className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-2 ${
                  role === 'staff'
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600'
                }`}
              >
                Staff / Kitchen
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100 mt-4"
          >
            {loading ? 'Creating Account...' : 'Get Started 🚀'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800 text-center">
          <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest hover:underline ml-1">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
