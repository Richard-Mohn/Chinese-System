'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowRight, FaEye, FaEyeSlash, FaCheck, FaTimes } from 'react-icons/fa';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'signup'>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password state
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const { loginWithEmail, signUpWithEmail, user, MohnMenuUser } = useAuth();
  const router = useRouter();

  // Reset form when tab changes
  useEffect(() => {
    setError('');
    setShowReset(false);
    setResetSent(false);
  }, [tab]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTab(defaultTab);
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setAgreedToTerms(false);
      setError('');
      setShowReset(false);
      setResetSent(false);
    }
  }, [isOpen, defaultTab]);

  // On auth success, route by role and close modal
  useEffect(() => {
    if (user && MohnMenuUser && isOpen) {
      onClose();
      router.push('/dashboard');
    }
  }, [user, MohnMenuUser, isOpen, onClose, router]);

  // Password strength checks (signup only)
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordStrong = hasMinLength && hasUppercase && hasNumber;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      // useEffect above will handle routing
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPasswordStrong) {
      setError('Please meet all password requirements.');
      return;
    }
    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      await signUpWithEmail(email, password);
      // useEffect above will handle routing
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) return;
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSent(true);
    } catch {
      setError('Could not send reset email. Check the address and try again.');
    } finally {
      setResetLoading(false);
    }
  };

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const PasswordCheck = ({ met, label }: { met: boolean; label: string }) => (
    <div className={`flex items-center gap-1.5 text-[11px] font-bold ${met ? 'text-emerald-600' : 'text-zinc-300'} transition-colors`}>
      <FaCheck className={`text-[8px] ${met ? 'opacity-100' : 'opacity-30'}`} />
      {label}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop — transparent so the page shows through */}
          <motion.div
            className="absolute inset-0"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-[2.5rem] shadow-[0_25px_120px_rgba(0,0,0,0.15)] border border-zinc-200"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 hover:text-black transition-colors"
            >
              <FaTimes className="text-sm" />
            </button>

            <div className="p-8 sm:p-10">
              {/* Tab Switcher */}
              <div className="flex bg-zinc-100 rounded-full p-1 mb-8">
                <button
                  onClick={() => setTab('login')}
                  className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${
                    tab === 'login'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setTab('signup')}
                  className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${
                    tab === 'signup'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Title */}
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-black text-black mb-1">
                  {tab === 'login' ? 'Welcome Back' : 'Join MohnMenu'}
                  <span className="text-orange-500">.</span>
                </h2>
                <p className="text-sm text-zinc-500 font-medium">
                  {tab === 'login'
                    ? 'Sign in to your account.'
                    : 'Create your free account.'}
                </p>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-5 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold text-center"
                >
                  {error}
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={tab === 'login' ? handleLogin : handleSignup} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 ml-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-5 py-3.5 border border-zinc-100 rounded-xl bg-zinc-50 text-black font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder:text-zinc-300 text-sm"
                    placeholder="you@example.com"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                      Password
                    </label>
                    {tab === 'login' && (
                      <button
                        type="button"
                        className="text-[10px] font-bold text-orange-600 hover:text-orange-700 transition-colors"
                        onClick={() => { setShowReset(true); setResetEmail(email); }}
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-5 py-3.5 border border-zinc-100 rounded-xl bg-zinc-50 text-black font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder:text-zinc-300 pr-11 text-sm"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
                      {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                    </button>
                  </div>

                  {/* Password strength (signup only) */}
                  {tab === 'signup' && password.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 ml-1">
                      <PasswordCheck met={hasMinLength} label="8+ chars" />
                      <PasswordCheck met={hasUppercase} label="Uppercase" />
                      <PasswordCheck met={hasNumber} label="Number" />
                    </div>
                  )}
                </div>

                {/* Terms (signup only) */}
                {tab === 'signup' && (
                  <label className="flex items-start gap-2.5 cursor-pointer group">
                    <div className="mt-0.5">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-4.5 h-4.5 rounded-md border-2 flex items-center justify-center transition-all ${
                        agreedToTerms
                          ? 'bg-orange-500 border-orange-500'
                          : 'border-zinc-200 group-hover:border-zinc-400'
                      }`} style={{ width: '18px', height: '18px' }}>
                        {agreedToTerms && <FaCheck className="text-white text-[8px]" />}
                      </div>
                    </div>
                    <span className="text-[11px] text-zinc-500 leading-relaxed">
                      I agree to the{' '}
                      <Link href="/terms" className="text-orange-600 hover:underline font-bold" onClick={onClose}>Terms</Link>
                      {' & '}
                      <Link href="/privacy" className="text-orange-600 hover:underline font-bold" onClick={onClose}>Privacy Policy</Link>.
                    </span>
                  </label>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full group bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-full font-bold text-base flex items-center justify-center gap-2.5 hover:shadow-xl hover:shadow-orange-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {loading
                    ? (tab === 'login' ? 'Signing In...' : 'Creating Account...')
                    : (tab === 'login' ? 'Sign In' : 'Create Account')
                  }
                  {!loading && <FaArrowRight className="group-hover:translate-x-1 transition-transform text-sm" />}
                </button>
              </form>

              {/* Forgot Password Expansion (login tab only) */}
              {tab === 'login' && showReset && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-4 bg-zinc-50 rounded-xl border border-zinc-100"
                >
                  <h3 className="font-bold text-black text-sm mb-1">Reset Password</h3>
                  <p className="text-[11px] text-zinc-400 mb-3">We&apos;ll send a reset link to your email.</p>
                  {resetSent ? (
                    <div className="text-sm text-emerald-600 font-bold">✓ Reset link sent! Check your inbox.</div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="flex-1 px-3 py-2.5 border border-zinc-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <button
                        onClick={handlePasswordReset}
                        disabled={resetLoading || !resetEmail}
                        className="px-5 py-2.5 bg-black text-white rounded-lg text-sm font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50"
                      >
                        {resetLoading ? '...' : 'Send'}
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => { setShowReset(false); setResetSent(false); }}
                    className="text-[11px] text-zinc-400 hover:text-zinc-600 mt-2 font-medium"
                  >
                    Cancel
                  </button>
                </motion.div>
              )}

              {/* Signup free promise */}
              {tab === 'signup' && (
                <p className="mt-4 text-center text-[11px] text-zinc-400 font-medium">
                  No credit card required. Free forever on our Starter plan.
                </p>
              )}

              {/* Business owner CTA */}
              <div className="mt-5 pt-5 border-t border-zinc-100 text-center">
                <p className="text-xs text-zinc-400 font-medium">
                  Own a restaurant or store?{' '}
                  <Link
                    href="/register"
                    onClick={onClose}
                    className="font-bold text-orange-600 hover:text-orange-700 hover:underline decoration-2 underline-offset-4 transition-colors"
                  >
                    Set up your business →
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
