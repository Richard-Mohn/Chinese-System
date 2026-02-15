'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { MohnMenuUser, MohnMenuBusiness, BusinessWebsite } from '@/lib/types';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';
import AddressAutocomplete from '@/components/AddressAutocomplete';

/**
 * Owner Signup Page
 * Creates a Firebase Auth user + MohnMenu user profile + new business document.
 */
export default function OwnerSignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessCity, setBusinessCity] = useState('');
  const [businessState, setBusinessState] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const now = new Date();
      const trialEnds = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      // 1. Create Firebase Auth user
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const uid = result.user.uid;

      // 2. Generate slug from business name
      const slug = businessName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      // 3. Create business document
      const businessRef = doc(collection(db, 'businesses'));
      const businessId = businessRef.id;

      const defaultWebsite: BusinessWebsite = {
        enabled: false,
        setupComplete: false,
        customDomainEnabled: false,
        selectedServices: [],
        selectedStates: [businessState],
        selectedCities: [businessCity],
        content: {},
        seo: {},
      };

      const businessData: MohnMenuBusiness = {
        businessId,
        name: businessName,
        slug,
        ownerId: uid,
        type: 'restaurant',
        tier: 'starter',
        subscriptionStatus: 'trial',
        subscriptionStartDate: now.toISOString(),
        subscriptionEndDate: trialEnds.toISOString(),
        brandColors: { primary: '#4F46E5', secondary: '#9333EA', accent: '#10B981' },
        ownerEmail: email,
        ownerPhone: '',
        address: '',
        city: businessCity,
        state: businessState,
        zipCode: '',
        latitude: 0,
        longitude: 0,
        timezone: 'America/New_York',
        website: defaultWebsite,
        settings: {
          orderingEnabled: true,
          primaryColor: '#4F46E5',
        },
        features: {
          liveOrderTracking: true,
          driverManagement: true,
          kitchenDisplaySystem: false,
          loyaltyProgram: false,
          liveStreaming: false,
          batchRouting: false,
          advancedAnalytics: false,
          apiAccess: false,
          customIntegrations: false,
          seoWebsite: true,
        },
        serviceAreas: [businessCity],
        services: [],
        isActive: true,
        isLocked: false,
        maxInhouseDrivers: 5,
        inHouseDriverIds: [],
        staffCount: 1,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      await setDoc(businessRef, businessData);

      // 4. Create MohnMenu user profile
      const MohnMenuUser: MohnMenuUser = {
        uid,
        email,
        displayName: displayName || email,
        role: 'owner',
        businessIds: [businessId],
        activeBusinessId: businessId,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      await setDoc(doc(db, 'users', uid), MohnMenuUser);

      // 5. Redirect to owner dashboard
      router.push('/owner');
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
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-white rounded-[3rem] shadow-[0_20px_100px_rgba(0,0,0,0.05)] border border-zinc-100 p-12">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-black mb-3">
              Create Your Business<span className="text-indigo-600">.</span>
            </h1>
            <p className="text-zinc-500 font-medium">
              Launch your online ordering platform in minutes.
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
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Your Name</label>
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
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                className="w-full px-5 py-4 border border-zinc-100 rounded-2xl bg-zinc-50 text-black font-bold focus:outline-none focus:ring-2 focus:ring-black transition-all placeholder:text-zinc-300"
                placeholder="China Wok"
              />
            </div>

            <AddressAutocomplete
              value={businessCity}
              onChange={setBusinessCity}
              onSelect={(parsed) => {
                setBusinessCity(parsed.city);
                setBusinessState(parsed.state);
              }}
              label="City"
              placeholder="Start typing your city…"
              inputClassName="px-5 py-4 border-zinc-100 bg-zinc-50 text-black font-bold placeholder:text-zinc-300 rounded-2xl"
              required
            />
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">State</label>
              <input
                type="text"
                value={businessState}
                onChange={(e) => setBusinessState(e.target.value.toUpperCase().slice(0, 2))}
                required
                maxLength={2}
                className="w-full px-5 py-4 border border-zinc-100 rounded-2xl bg-zinc-50 text-black font-bold focus:outline-none focus:ring-2 focus:ring-black transition-all placeholder:text-zinc-300"
                placeholder="VA"
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
                placeholder="you@business.com"
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
              type="submit"
              disabled={loading}
              className="w-full group bg-black text-white py-5 rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-xl disabled:opacity-50"
            >
              {loading ? 'Creating Your Business...' : 'Launch My Business'}
              {!loading && <FaArrowRight className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-zinc-500 font-medium text-sm">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-black hover:underline">Sign In</Link>
            </p>
            <p className="text-zinc-400 font-medium text-xs mt-2">
              Want to join as a <Link href="/signup/driver" className="text-indigo-600 hover:underline">driver</Link> or{' '}
              <Link href="/signup/customer" className="text-indigo-600 hover:underline">customer</Link>?
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
