/**
 * DemoBanner — Floating demo-mode control panel for demo tenant sites.
 *
 * Shows a sticky banner that lets prospects instantly log in as
 * different roles (Owner, Staff, Customer) with one click.
 * After login, shows role badge + quick links to role-specific dashboards.
 *
 * Only rendered on demo businesses (isDemo === true or slug starts with demo prefix).
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUserTie, FaGlassMartini, FaConciergeBell, FaUser,
  FaTachometerAlt, FaClipboardList, FaUsers, FaSignOutAlt,
  FaTimes, FaChevronDown, FaChevronUp, FaTruck,
  FaPlay, FaInfoCircle,
} from 'react-icons/fa';

export interface DemoAccount {
  role: string;
  label: string;
  email: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
  /** Use {slug} as placeholder — replaced at runtime */
  dashboardPath: string;
}

export interface DemoQuickLink {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'owner',
    label: 'Owner',
    email: 'owner@coppertap.demo',
    icon: FaUserTie,
    color: 'from-amber-500 to-orange-600',
    description: 'Full dashboard access — orders, menu, staff, analytics',
    dashboardPath: '/owner',
  },
  {
    role: 'bartender',
    label: 'Bartender',
    email: 'bartender@coppertap.demo',
    icon: FaGlassMartini,
    color: 'from-purple-500 to-indigo-600',
    description: 'Staff view — kitchen display, orders, toggle on/off duty',
    dashboardPath: '/owner/kds',
  },
  {
    role: 'server',
    label: 'Server',
    email: 'server@coppertap.demo',
    icon: FaConciergeBell,
    color: 'from-emerald-500 to-teal-600',
    description: 'Staff view — kitchen display, orders, table service',
    dashboardPath: '/owner/kds',
  },
  {
    role: 'driver',
    label: 'Driver',
    email: 'driver@coppertap.demo',
    icon: FaTruck,
    color: 'from-blue-500 to-cyan-600',
    description: 'Delivery dashboard — accept & deliver orders',
    dashboardPath: '/driver',
  },
  {
    role: 'customer',
    label: 'Customer',
    email: 'customer@coppertap.demo',
    icon: FaUser,
    color: 'from-pink-500 to-rose-600',
    description: 'Customer experience — browse, order, track',
    dashboardPath: '/order/{slug}',
  },
];

const DEMO_PASSWORD = 'DemoPass123!';

interface DemoBannerProps {
  businessSlug: string;
  demoAccounts?: DemoAccount[];
  demoPassword?: string;
  welcomeTitle?: string;
  welcomeSubtitle?: string;
  roleQuickLinks?: Record<string, DemoQuickLink[]>;
  backLinkHref?: string;
}

export default function DemoBanner({
  businessSlug,
  demoAccounts,
  demoPassword,
  welcomeTitle,
  welcomeSubtitle,
  roleQuickLinks,
  backLinkHref,
}: DemoBannerProps) {
  const { user, MohnMenuUser, loginWithEmail, logout, loading } = useAuth();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [loggingIn, setLoggingIn] = useState<string | null>(null);
  const [loginError, setLoginError] = useState('');

  const accounts = demoAccounts ?? DEMO_ACCOUNTS;
  const password = demoPassword ?? DEMO_PASSWORD;
  const bannerTitle = welcomeTitle ?? 'Welcome to The Copper Tap demo! Click any role below to instantly log in and explore the platform.';
  const bannerSubtitle = welcomeSubtitle ?? 'Each role shows a different perspective — owner sees the full dashboard, staff receives orders, customers can browse & order.';
  const backHref = backLinkHref ?? `/${businessSlug}`;

  // Detect if current user is a demo account
  const currentDemoAccount = accounts.find(a => a.email === user?.email);
  const isDemoUser = Boolean(currentDemoAccount);

  /** Resolve {slug} placeholder in dashboard paths */
  const resolvePath = useCallback((path: string) => path.replace(/\{slug\}/g, businessSlug), [businessSlug]);

  // Auto-expand on first visit
  useEffect(() => {
    const seen = sessionStorage.getItem('demo-banner-seen');
    if (!seen) {
      setExpanded(true);
      sessionStorage.setItem('demo-banner-seen', '1');
    }
  }, []);

  const handleDemoLogin = useCallback(async (account: DemoAccount) => {
    setLoginError('');
    setLoggingIn(account.role);
    try {
      // If already logged in as different demo account, logout first
      if (user && user.email !== account.email) {
        await logout();
        // Small delay for auth state to clear
        await new Promise(r => setTimeout(r, 500));
      }
      await loginWithEmail(account.email, password);
      setExpanded(false);

      // Auto-navigate to the role's dashboard
      const dest = resolvePath(account.dashboardPath);
      router.push(dest);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setLoginError(`Failed to log in as ${account.label}: ${message}`);
    } finally {
      setLoggingIn(null);
    }
  }, [user, loginWithEmail, logout, resolvePath, router, password]);

  const handleLogout = useCallback(async () => {
    await logout();
    setExpanded(true);
  }, [logout]);

  if (dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[200]">
      {/* ── Collapsed Bar ──────────────────────────────────── */}
      <motion.div
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20"
      >
        <div className="container mx-auto max-w-6xl px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FaPlay className="text-[10px] text-yellow-300" />
              <span className="text-xs font-black uppercase tracking-wider text-yellow-200">
                Live Demo
              </span>
            </div>
            {currentDemoAccount && isDemoUser ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-purple-200">Logged in as</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-bold`}>
                  <currentDemoAccount.icon className="text-[10px]" />
                  {currentDemoAccount.label}
                </span>
                {currentDemoAccount.role === 'owner' && (
                  <a
                    href="/owner"
                    className="ml-1 inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-black hover:bg-yellow-300 transition-colors"
                  >
                    <FaTachometerAlt className="text-[10px]" />
                    Owner Dashboard
                  </a>
                )}
              </div>
            ) : (
              <span className="text-xs text-purple-200 hidden sm:inline">
                Try any role — no sign-up required
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isDemoUser && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold transition-colors"
              >
                <FaSignOutAlt className="text-[10px]" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-full text-xs font-bold transition-colors"
            >
              {expanded ? <FaChevronUp className="text-[10px]" /> : <FaChevronDown className="text-[10px]" />}
              {expanded ? 'Collapse' : 'Try Demo Roles'}
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 hover:bg-white/15 rounded-full transition-colors"
              title="Dismiss demo banner"
            >
              <FaTimes className="text-xs" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Expanded Panel ─────────────────────────────────── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white border-b-2 border-purple-200 shadow-xl overflow-hidden"
          >
            <div className="container mx-auto max-w-6xl px-4 py-5">
              {/* Info header */}
              <div className="flex items-start gap-3 mb-4">
                <FaInfoCircle className="text-purple-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-zinc-800">
                    {bannerTitle}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {bannerSubtitle}
                  </p>
                </div>
              </div>

              {loginError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold">
                  {loginError}
                </div>
              )}

              {/* Role Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {accounts.map((account) => {
                  const Icon = account.icon;
                  const isActive = currentDemoAccount?.role === account.role && isDemoUser;
                  const isLoading = loggingIn === account.role;

                  return (
                    <button
                      key={account.role}
                      onClick={() => handleDemoLogin(account)}
                      disabled={isLoading || (loading && !!loggingIn)}
                      className={`relative group p-4 rounded-2xl border-2 text-left transition-all ${
                        isActive
                          ? 'border-purple-400 bg-purple-50 ring-2 ring-purple-200'
                          : 'border-zinc-200 hover:border-purple-300 hover:shadow-md'
                      } ${isLoading ? 'opacity-70' : ''}`}
                    >
                      {isActive && (
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-white">
                          <span className="text-white text-[8px]">✓</span>
                        </div>
                      )}
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${account.color} flex items-center justify-center mb-3`}>
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Icon className="text-white text-sm" />
                        )}
                      </div>
                      <h3 className="text-sm font-black text-zinc-800">{account.label}</h3>
                      <p className="text-[11px] text-zinc-500 mt-1 leading-snug">{account.description}</p>
                    </button>
                  );
                })}
              </div>

              {/* Quick Links for current role */}
              {currentDemoAccount && isDemoUser && (
                <div className="mt-4 pt-4 border-t border-zinc-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-zinc-500">Quick links:</span>
                    {roleQuickLinks ? (
                      (roleQuickLinks[currentDemoAccount.role] || roleQuickLinks.default || []).map((link) => (
                        <a
                          key={link.label}
                          href={link.href}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 rounded-full text-xs font-bold text-zinc-700 hover:bg-zinc-200 transition-colors"
                        >
                          {link.icon && <link.icon className="text-[10px]" />}
                          {link.label}
                        </a>
                      ))
                    ) : currentDemoAccount.role === 'owner' && (
                      <>
                        <a href="/owner" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 rounded-full text-xs font-bold text-zinc-700 hover:bg-zinc-200 transition-colors">
                          <FaTachometerAlt className="text-[10px]" /> Dashboard
                        </a>
                        <a href="/owner/orders" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 rounded-full text-xs font-bold text-zinc-700 hover:bg-zinc-200 transition-colors">
                          <FaClipboardList className="text-[10px]" /> Orders
                        </a>
                        <a href="/owner/staff" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 rounded-full text-xs font-bold text-zinc-700 hover:bg-zinc-200 transition-colors">
                          <FaUsers className="text-[10px]" /> Staff
                        </a>
                        <a href="/owner/menu" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 rounded-full text-xs font-bold text-zinc-700 hover:bg-zinc-200 transition-colors">
                          <FaGlassMartini className="text-[10px]" /> Menu
                        </a>
                        <a href="/owner/analytics" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 rounded-full text-xs font-bold text-zinc-700 hover:bg-zinc-200 transition-colors">
                          📊 Analytics
                        </a>
                        <a href="/owner/kds" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 rounded-full text-xs font-bold text-zinc-700 hover:bg-zinc-200 transition-colors">
                          🖥️ Kitchen Display
                        </a>
                      </>
                    )}
                    {(currentDemoAccount.role === 'bartender' || currentDemoAccount.role === 'server') && (
                      <>
                        <a href="/owner/kds" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 rounded-full text-xs font-bold text-zinc-700 hover:bg-zinc-200 transition-colors">
                          🖥️ Kitchen Display
                        </a>
                        <a href="/owner/orders" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 rounded-full text-xs font-bold text-zinc-700 hover:bg-zinc-200 transition-colors">
                          <FaClipboardList className="text-[10px]" /> Orders
                        </a>
                        <a href={`/${businessSlug}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 rounded-full text-xs font-bold text-zinc-700 hover:bg-zinc-200 transition-colors">
                          <FaTachometerAlt className="text-[10px]" /> Storefront
                        </a>
                      </>
                    )}
                    {currentDemoAccount.role === 'driver' && (
                      <a href="/driver" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 rounded-full text-xs font-bold text-zinc-700 hover:bg-zinc-200 transition-colors">
                        <FaTruck className="text-[10px]" /> Driver Dashboard
                      </a>
                    )}
                    {currentDemoAccount.role === 'customer' && (
                      <>
                        <a href={`/order/${businessSlug}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 rounded-full text-xs font-bold text-zinc-700 hover:bg-zinc-200 transition-colors">
                          🍽️ Order Food
                        </a>
                        <a href={`/${businessSlug}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 rounded-full text-xs font-bold text-zinc-700 hover:bg-zinc-200 transition-colors">
                          🏠 Storefront
                        </a>
                        <a href="/customer/orders" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 rounded-full text-xs font-bold text-zinc-700 hover:bg-zinc-200 transition-colors">
                          📋 My Orders
                        </a>
                      </>
                    )}
                    <a
                      href={backHref}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 rounded-full text-xs font-bold text-purple-700 hover:bg-purple-200 transition-colors"
                    >
                      ← Back to Storefront
                    </a>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
