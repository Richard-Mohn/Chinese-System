'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  FaSignOutAlt, FaChevronDown, FaBitcoin, FaMapMarkerAlt, FaVideo,
  FaShoppingCart, FaUtensils, FaCoffee, FaDesktop, FaTruck,
  FaClipboardList, FaGlobe, FaBirthdayCake, FaShoppingBasket,
  FaGlassCheers, FaStore, FaBicycle, FaCalendarAlt
} from 'react-icons/fa';
import { useAuthModal } from '@/context/AuthModalContext';

/* ─── Mega-menu data ─── */
const solutions = [
  { href: '/for-restaurants', icon: FaUtensils, label: 'Restaurants', desc: 'Full ordering, delivery & kitchen tools' },
  { href: '/for-bakeries-cafes', icon: FaBirthdayCake, label: 'Bakeries & Cafés', desc: 'Pre-orders, custom cakes & catering' },
  { href: '/for-food-trucks', icon: FaTruck, label: 'Food Trucks', desc: 'QR menus, mobile pay & GPS location' },
  { href: '/for-grocery-markets', icon: FaShoppingBasket, label: 'Grocery & Markets', desc: 'Online catalog, pickup & delivery' },
  { href: '/for-bars-nightlife', icon: FaGlassCheers, label: 'Bars & Nightlife', desc: 'Table ordering, tabs & event menus' },
  { href: '/for-convenience-stores', icon: FaCoffee, label: 'Convenience Stores', desc: 'QR ordering, inventory & grab-and-go' },
  { href: '/for-retail-shops', icon: FaStore, label: 'Shops & Boutiques', desc: 'AI product listing & online storefront' },
];

const featureItems = [
  { href: '/features/online-ordering', icon: FaShoppingCart, label: 'Online Ordering', desc: 'Card, crypto & cash — zero commission' },
  { href: '/features/gps-tracking', icon: FaMapMarkerAlt, label: 'GPS Fleet Tracking', desc: 'Sub-second driver location updates' },
  { href: '/features/kitchen-display', icon: FaDesktop, label: 'Kitchen Display (KDS)', desc: 'Multi-station tablet workflow' },
  { href: '/features/crypto-payments', icon: FaBitcoin, label: 'Crypto Payments', desc: 'BTC, ETH, SOL + 5 more with QR codes' },
  { href: '/features/delivery-management', icon: FaTruck, label: 'Delivery Management', desc: 'Drivers, dispatch & Stripe payouts' },
  { href: '/features/real-time-orders', icon: FaClipboardList, label: 'Real-Time Orders', desc: 'Audio alerts & instant status tracking' },
  { href: '/features/white-label-website', icon: FaGlobe, label: 'White-Label Website', desc: 'Branded storefront with SEO built in' },
  { href: '/features/community-delivery', icon: FaBicycle, label: 'Community Courier', desc: 'Hyper-local delivery for $0.25/order' },
  { href: '/features/reservations', icon: FaCalendarAlt, label: 'Table Reservations', desc: 'Book tables — zero per-diner fees' },
];

/* ─── Dropdown wrapper ─── */
interface DropdownProps {
  label: string;
  children: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const NavDropdown = ({ label, children, open, onToggle, onClose }: DropdownProps) => (
  <div className="relative" onMouseLeave={onClose}>
    <button
      onClick={onToggle}
      onMouseEnter={onToggle}
      className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-zinc-600 hover:text-black transition-colors"
    >
      {label}
      <FaChevronDown className={cn('text-[9px] transition-transform duration-200', open && 'rotate-180')} />
    </button>
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.15 }}
          className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-zinc-100 p-3 min-w-[320px]">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

interface DropLinkProps {
  href: string;
  icon: any;
  label: string;
  desc: string;
  onClick?: () => void;
}

const DropLink = ({ href, icon: Icon, label, desc, onClick }: DropLinkProps) => (
  <Link href={href} onClick={onClick} className="flex items-start gap-3 p-3 rounded-xl hover:bg-zinc-50 transition-colors group">
    <div className="w-9 h-9 rounded-lg bg-zinc-100 group-hover:bg-black group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
      <Icon className="text-sm" />
    </div>
    <div>
      <div className="text-sm font-bold text-black">{label}</div>
      <div className="text-xs text-zinc-400 leading-snug">{desc}</div>
    </div>
  </Link>
);

const Header = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const { openAuthModal } = useAuthModal();

  // Hide global header on order pages (they have their own nav)
  const hideHeader = pathname?.startsWith('/order/');
  if (hideHeader) return null;

  useEffect(() => {
    const h = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const closeMobile = () => setMobileOpen(false);
  const closeDropdown = () => setOpenMenu(null);
  const toggle = (name: string) => setOpenMenu(prev => (prev === name ? null : name));

  return (
    <motion.header
      className={cn(
        'fixed top-0 left-0 right-0 z-[100] transition-all duration-500 border-b bg-white/95 backdrop-blur-md',
        isScrolled
          ? 'shadow-[0_4px_30px_rgba(0,0,0,0.06)] border-zinc-100 py-1'
          : 'border-transparent py-2.5'
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow">
            <span className="text-white font-black text-sm leading-none">M</span>
          </div>
          <span className="text-xl font-black tracking-tight text-black">
            Mohn<span className="text-orange-600">Menu</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-0.5">
          <NavDropdown label="Solutions" open={openMenu === 'solutions'} onToggle={() => toggle('solutions')} onClose={closeDropdown}>
            <div className="grid grid-cols-2 gap-1 min-w-[520px]">
              {solutions.map(s => <DropLink key={s.href} {...s} onClick={closeDropdown} />)}
            </div>
          </NavDropdown>

          <NavDropdown label="Features" open={openMenu === 'features'} onToggle={() => toggle('features')} onClose={closeDropdown}>
            <div className="grid grid-cols-3 gap-1 min-w-[720px]">
              {featureItems.map(f => <DropLink key={f.label} {...f} onClick={closeDropdown} />)}
            </div>
          </NavDropdown>

          <Link href="/pricing" className="px-4 py-2 text-sm font-semibold text-zinc-600 hover:text-black transition-colors">Pricing</Link>
          <Link href="/comparison" className="px-4 py-2 text-sm font-semibold text-zinc-600 hover:text-black transition-colors">Compare</Link>
          <Link href="/quick-delivery" className="px-4 py-2 text-sm font-semibold text-zinc-600 hover:text-black transition-colors">📦 Send</Link>
          <Link href="/about" className="px-4 py-2 text-sm font-semibold text-zinc-600 hover:text-black transition-colors">About</Link>
          <Link href="/contact" className="px-4 py-2 text-sm font-semibold text-zinc-600 hover:text-black transition-colors">Contact</Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/dashboard">
                <span className="px-5 py-2.5 text-sm font-bold text-zinc-600 hover:text-black transition-colors">Dashboard</span>
              </Link>
              <motion.button
                onClick={() => logout()}
                className="p-2.5 rounded-full bg-zinc-50 text-zinc-400 hover:text-red-500 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaSignOutAlt className="text-sm" />
              </motion.button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <button onClick={() => openAuthModal('login')} className="px-5 py-2.5 text-sm font-bold text-zinc-600 hover:text-black transition-colors">Sign In</button>
              <motion.button
                onClick={() => openAuthModal('signup')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full text-sm font-bold shadow-lg shadow-orange-500/20"
              >
                Get Started Free
              </motion.button>
            </div>
          )}

          {!user && (
            <button onClick={() => openAuthModal('login')} className="sm:hidden px-4 py-2 text-sm font-bold text-zinc-600 hover:text-black transition-colors">
              Sign In
            </button>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-black"
            aria-label="Toggle menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {mobileOpen ? (
                <><line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" /></>
              ) : (
                <><line x1="3" x2="21" y1="6" y2="6" /><line x1="3" x2="21" y1="12" y2="12" /><line x1="3" x2="21" y1="18" y2="18" /></>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-zinc-100 overflow-hidden"
          >
            <nav className="container mx-auto px-6 py-8 flex flex-col gap-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 ml-1">Solutions</p>
              {solutions.map(s => (
                <Link key={s.href} href={s.href} onClick={closeMobile} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-zinc-50">
                  <s.icon className="text-orange-500" /><span className="font-bold text-black">{s.label}</span>
                </Link>
              ))}

              <div className="h-px bg-zinc-100 my-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 ml-1">Features</p>
              {featureItems.map(f => (
                <Link key={f.label} href={f.href} onClick={closeMobile} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-zinc-50">
                  <f.icon className="text-orange-500" /><span className="font-bold text-black">{f.label}</span>
                </Link>
              ))}

              <div className="h-px bg-zinc-100 my-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 ml-1">Platform</p>
              <Link href="/pricing" onClick={closeMobile} className="px-3 py-2.5 font-bold text-black hover:text-orange-600 transition-colors">Pricing</Link>
              <Link href="/comparison" onClick={closeMobile} className="px-3 py-2.5 font-bold text-black hover:text-orange-600 transition-colors">Compare</Link>
              <Link href="/about" onClick={closeMobile} className="px-3 py-2.5 font-bold text-black hover:text-orange-600 transition-colors">About</Link>
              <Link href="/faq" onClick={closeMobile} className="px-3 py-2.5 font-bold text-black hover:text-orange-600 transition-colors">FAQ</Link>
              <Link href="/contact" onClick={closeMobile} className="px-3 py-2.5 font-bold text-black hover:text-orange-600 transition-colors">Contact</Link>

              <div className="h-px bg-zinc-100 my-4" />
              {!user && (
                <>
                  <button onClick={() => { closeMobile(); openAuthModal('login'); }} className="px-3 py-2.5 font-bold text-zinc-500 text-left">Sign In</button>
                  <button onClick={() => { closeMobile(); openAuthModal('signup'); }} className="mt-2 block w-full text-center py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full font-bold shadow-lg">Get Started Free</button>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.header>
  );
};

export default Header;
