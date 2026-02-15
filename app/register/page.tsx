'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaArrowRight, FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, signUpWithEmail } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Password strength checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordStrong = hasMinLength && hasUppercase && hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
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
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const PasswordCheck = ({ met, label }: { met: boolean; label: string }) => (
    <div className={`flex items-center gap-2 text-xs font-bold ${met ? 'text-emerald-600' : 'text-zinc-300'} transition-colors`}>
      <FaCheck className={`text-[10px] ${met ? 'opacity-100' : 'opacity-30'}`} />
      {label}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent px-4">
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-white rounded-[3rem] shadow-[0_20px_100px_rgba(0,0,0,0.05)] border border-zinc-100 p-12">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-black mb-3">
              Start Your Business<span className="text-orange-500">.</span>
            </h1>
            <p className="text-zinc-500 font-medium">
              Create an account to set up your restaurant or store.
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">
                Work Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-6 py-4 border border-zinc-100 rounded-2xl bg-zinc-50 text-black font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder:text-zinc-300"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-6 py-4 border border-zinc-100 rounded-2xl bg-zinc-50 text-black font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder:text-zinc-300 pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {/* Password strength indicators */}
              {password.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 ml-1">
                  <PasswordCheck met={hasMinLength} label="8+ characters" />
                  <PasswordCheck met={hasUppercase} label="Uppercase letter" />
                  <PasswordCheck met={hasNumber} label="Number" />
                </div>
              )}
            </div>

            {/* Terms checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="mt-0.5">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${agreedToTerms ? 'bg-orange-500 border-orange-500' : 'border-zinc-200 group-hover:border-zinc-400'}`}>
                  {agreedToTerms && <FaCheck className="text-white text-[10px]" />}
                </div>
              </div>
              <span className="text-xs text-zinc-500 leading-relaxed">
                I agree to the{' '}
                <Link href="/terms" className="text-orange-600 hover:underline font-bold">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-orange-600 hover:underline font-bold">Privacy Policy</Link>.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full group bg-gradient-to-r from-orange-500 to-red-500 text-white py-5 rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-orange-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
              {!loading && <FaArrowRight className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          {/* Free promise */}
          <div className="mt-6 text-center">
            <p className="text-[11px] text-zinc-400 font-medium">
              No credit card required. 3-day free trial on all paid plans.
            </p>
          </div>

          <div className="mt-8 text-center">
            <p className="text-zinc-500 font-medium">
              Already have an account?{' '}
              <Link href="/login">
                <span className="font-bold text-orange-600 hover:text-orange-700 hover:underline decoration-2 underline-offset-4 transition-colors">Sign In</span>
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
