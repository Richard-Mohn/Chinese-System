/**
 * PostOrderSignupModal — Account creation prompt after guest checkout
 * 
 * Shows after a successful order from a guest user, offering to create
 * an account with pre-filled data from their order. Links existing
 * Stripe customer to the new Firebase account.
 */

'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { MohnMenuUser } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, FaCheck, FaHistory, FaBolt, FaGift, 
  FaEye, FaEyeSlash, FaShieldAlt 
} from 'react-icons/fa';

interface PostOrderSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Pre-filled from order data */
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  /** Order ID to link to new account */
  orderId: string;
  businessId: string;
  /** Stripe Customer ID to link */
  stripeCustomerId?: string;
}

export default function PostOrderSignupModal({
  isOpen,
  onClose,
  customerEmail,
  customerName,
  customerPhone,
  orderId,
  businessId,
  stripeCustomerId,
}: PostOrderSignupModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Password strength checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordStrong = hasMinLength && hasUppercase && hasNumber;

  const handleSignup = async () => {
    if (!isPasswordStrong) {
      setError('Password must be at least 8 characters with 1 uppercase and 1 number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create Firebase Auth user
      const result = await createUserWithEmailAndPassword(auth, customerEmail, password);
      const uid = result.user.uid;

      // Create MohnMenu user profile
      const MohnMenuUser: MohnMenuUser = {
        uid,
        email: customerEmail,
        displayName: customerName,
        role: 'customer',
        businessIds: [businessId],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(stripeCustomerId ? { stripeCustomerId } : {}),
        ...(customerPhone ? { phone: customerPhone } : {}),
      };

      await setDoc(doc(db, 'users', uid), MohnMenuUser);

      // Link order to new account
      await updateDoc(doc(db, 'businesses', businessId, 'orders', orderId), {
        customerId: uid,
        customerAuthUid: uid,
        updatedAt: new Date().toISOString(),
      });

      // Initialize customer profile (will be picked up by Cloud Function on next order)
      await setDoc(doc(db, 'customerProfiles', uid), {
        displayName: customerName,
        email: customerEmail,
        photoURL: null,
        stats: {
          totalOrders: 1,
          totalSpent: 0, // Will be updated by Cloud Function
          badges: ['first_order'],
          friendsOrderedFor: 0,
        },
        privacy: {
          showLeaderboard: true,
          disableSocialPosts: false,
          socialPostPrivacy: 'public',
          acceptFriendOrders: true,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        // Optionally redirect to customer dashboard
        window.location.href = '/customer';
      }, 2000);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email already has an account. Please log in instead.');
      } else {
        setError(err.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  const PasswordCheck = ({ met, label }: { met: boolean; label: string }) => (
    <div className={`flex items-center gap-1.5 text-[10px] font-bold transition-colors ${
      met ? 'text-emerald-600' : 'text-zinc-300'
    }`}>
      <FaCheck className={`text-[8px] ${met ? 'opacity-100' : 'opacity-30'}`} />
      {label}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {success ? (
              // Success state
              <div className="p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mx-auto mb-6">
                  <FaCheck className="text-3xl text-white" />
                </div>
                <h3 className="text-2xl font-black text-black mb-2">Account Created!</h3>
                <p className="text-zinc-600 font-medium">
                  Redirecting you to your dashboard...
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white relative">
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                  <h2 className="text-2xl font-black mb-2">Track Your Order</h2>
                  <p className="text-white/90 text-sm font-medium">
                    Create an account to track this order and get exclusive perks
                  </p>
                </div>

                {/* Benefits */}
                <div className="px-8 py-6 bg-gradient-to-br from-orange-50 to-red-50 border-b border-orange-100">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mx-auto mb-2 shadow-sm">
                        <FaHistory className="text-orange-600 text-lg" />
                      </div>
                      <p className="text-[10px] font-black text-zinc-700">Order History</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mx-auto mb-2 shadow-sm">
                        <FaBolt className="text-orange-600 text-lg" />
                      </div>
                      <p className="text-[10px] font-black text-zinc-700">Faster Checkout</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mx-auto mb-2 shadow-sm">
                        <FaGift className="text-orange-600 text-lg" />
                      </div>
                      <p className="text-[10px] font-black text-zinc-700">Loyalty Rewards</p>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <div className="p-8 space-y-6">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm font-bold text-red-600 text-center"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Pre-filled info */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5">
                        Email
                      </label>
                      <div className="px-4 py-3 bg-zinc-50 rounded-xl border border-zinc-200">
                        <p className="text-sm font-bold text-zinc-600">{customerEmail}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5">
                        Name
                      </label>
                      <div className="px-4 py-3 bg-zinc-50 rounded-xl border border-zinc-200">
                        <p className="text-sm font-bold text-zinc-600">{customerName}</p>
                      </div>
                    </div>

                    {/* Password input */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5">
                        Create Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 pr-12"
                          placeholder="Enter password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>

                      {/* Password strength indicators */}
                      {password && (
                        <div className="mt-2 space-y-1">
                          <PasswordCheck met={hasMinLength} label="At least 8 characters" />
                          <PasswordCheck met={hasUppercase} label="One uppercase letter" />
                          <PasswordCheck met={hasNumber} label="One number" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Security note */}
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <FaShieldAlt className="text-blue-600 text-sm mt-0.5 flex-shrink-0" />
                    <p className="text-[10px] text-blue-700 font-medium">
                      Your order and payment info are securely stored. We'll never share your data.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <button
                      onClick={handleSignup}
                      disabled={loading || !isPasswordStrong}
                      className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-black text-sm hover:shadow-xl hover:shadow-orange-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                    <button
                      onClick={onClose}
                      className="w-full py-3 text-zinc-500 hover:text-zinc-700 font-bold text-sm transition-colors"
                    >
                      Maybe later
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
