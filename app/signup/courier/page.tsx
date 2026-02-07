'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { MohnMenuUser, CourierVehicle } from '@/lib/types';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaArrowRight, FaBicycle, FaWalking, FaCar, FaMotorcycle } from 'react-icons/fa';

const VEHICLE_OPTIONS: { value: CourierVehicle; label: string; icon: any; desc: string }[] = [
  { value: 'bike', label: 'Bicycle', icon: FaBicycle, desc: 'Great for short distances' },
  { value: 'walk', label: 'On Foot', icon: FaWalking, desc: 'Perfect for dense areas' },
  { value: 'scooter', label: 'Scooter', icon: FaMotorcycle, desc: 'Quick & nimble' },
  { value: 'car', label: 'Car', icon: FaCar, desc: 'Best for longer trips' },
];

/**
 * Community Courier Signup Page
 * No invite code required — open registration for anyone who wants to earn
 * delivering for local businesses on the MohnMenu platform.
 * Quick signup: name, email, password, vehicle type → Stripe Connect later.
 */
export default function CourierSignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicle, setVehicle] = useState<CourierVehicle>('bike');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Create Firebase Auth user
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const uid = result.user.uid;

      // 2. Create MohnMenu user profile with courier/marketplace role
      const mohnUser: MohnMenuUser = {
        uid,
        email,
        displayName: displayName || email,
        role: 'driver_marketplace',
        businessIds: [],
        allowedBusinessIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', uid), mohnUser);

      // 3. Create courier profile in couriers collection
      await setDoc(doc(db, 'couriers', uid), {
        courierId: uid,
        userId: uid,
        name: displayName,
        email,
        phone,
        driverType: 'courier',
        courierVehicle: vehicle,
        deliveryRadiusMiles: 2,
        status: 'offline',
        rating: 5.0,
        totalDeliveries: 0,
        totalEarnings: 0,
        acceptanceRate: 100,
        cancellationRate: 0,
        backgroundCheckStatus: 'pending',
        licenseVerified: false,
        insuranceVerified: false,
        stripeAccountId: null,
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // 4. Redirect to driver dashboard (will show pending approval message)
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
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-white rounded-[3rem] shadow-[0_20px_100px_rgba(0,0,0,0.05)] border border-zinc-100 p-10 md:p-12">
          <div className="text-center mb-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block px-4 py-1.5 mb-4 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-black uppercase tracking-widest text-emerald-600"
            >
              Community Courier
            </motion.div>
            <h1 className="text-4xl font-black text-black mb-3">
              Start Delivering<span className="text-emerald-600">.</span>
            </h1>
            <p className="text-zinc-500 font-medium text-sm">
              No invite code needed. Sign up, pick your ride, and start earning $3+ per delivery in your neighborhood.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Vehicle Selection */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-3 ml-1">
                How do you deliver?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {VEHICLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setVehicle(opt.value)}
                    className={`p-4 rounded-2xl border-2 transition-all text-left ${
                      vehicle === opt.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-zinc-100 bg-zinc-50 hover:border-zinc-300'
                    }`}
                  >
                    <opt.icon className={`text-xl mb-1 ${vehicle === opt.value ? 'text-emerald-600' : 'text-zinc-400'}`} />
                    <p className={`font-bold text-sm ${vehicle === opt.value ? 'text-emerald-700' : 'text-zinc-700'}`}>
                      {opt.label}
                    </p>
                    <p className="text-[10px] text-zinc-400">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Full Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full px-5 py-4 border border-zinc-100 rounded-2xl bg-zinc-50 text-black font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-zinc-300"
                placeholder="John Smith"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-5 py-4 border border-zinc-100 rounded-2xl bg-zinc-50 text-black font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-zinc-300"
                placeholder="(804) 555-1234"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-4 border border-zinc-100 rounded-2xl bg-zinc-50 text-black font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-zinc-300"
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
                className="w-full px-5 py-4 border border-zinc-100 rounded-2xl bg-zinc-50 text-black font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-zinc-300"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full group bg-emerald-600 text-white py-5 rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all active:scale-[0.98] shadow-xl shadow-emerald-600/20 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Start Delivering'}
              {!loading && <FaArrowRight className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          {/* Benefits */}
          <div className="mt-8 p-5 bg-zinc-50 rounded-2xl">
            <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">Why deliver with MohnMenu?</p>
            <ul className="space-y-2">
              {[
                'Simple signup — no lengthy background check process',
                'Earn $3+ on every delivery in your area',
                'Use any vehicle: bike, walk, car, scooter',
                'Get paid via Stripe — set up anytime',
                '2-3 mile radius — stay in your neighborhood',
              ].map((benefit, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-zinc-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 text-center space-y-2">
            <p className="text-zinc-400 font-medium text-sm">
              <Link href="/signup/driver" className="font-bold text-black hover:underline">
                Have an invite code? Join as In-House Driver
              </Link>
            </p>
            <p className="text-zinc-400 font-medium text-sm">
              <Link href="/login" className="font-bold text-black hover:underline">
                Already have an account?
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
