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
  FaGlassCheers, FaStore, FaBicycle, FaCalendarAlt, FaUserTie, FaMusic,
  FaChurch, FaMugHot, FaCar, FaWrench,
  FaGamepad, FaDragon, FaCoins, FaUsers, FaGift
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
  { href: '/for-coffee-shops', icon: FaMugHot, label: 'Coffee Shops', desc: 'Order-ahead, loyalty & peer delivery' },
  { href: '/for-uber-drivers', icon: FaCar, label: 'Uber Drivers', desc: 'Extra earnings with delivery + roadside help' },
  { href: '/for-churches', icon: FaChurch, label: 'Churches', desc: 'Giving, events, volunteers & streaming' },
  { href: '/for-music-artists', icon: FaMusic, label: 'Music & Artists', desc: 'Tickets, merch, drops & fan clubs' },
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
  { href: '/features/staff-marketplace', icon: FaUserTie, label: 'Staff Marketplace', desc: 'Bartender & server multi-venue work' },
  { href: '/features/bar-entertainment', icon: FaMusic, label: 'Bar Entertainment', desc: 'Jukebox, karaoke & kiosk ordering' },
  { href: '/features/peer-delivery', icon: FaBicycle, label: 'Peer Delivery', desc: 'Customers deliver for each other' },
  { href: '/quick-delivery', label: 'Packages', desc: 'Fast local package delivery with live tracking and proof of drop-off' },
  { href: '/features/offerwall-rewards', icon: FaGift, label: 'Offerwall Rewards', desc: 'Customers earn via games/apps/videos and spend at your business' },
  { href: '/features/roadside-assistance', icon: FaWrench, label: 'Roadside Assistance', desc: 'Jump starts, lockouts, tire help by nearby drivers' },
];

/* ─── MohnSters game menu data ─── */
const mohnStersItems = [
  { href: '/mohnsters', icon: FaDragon, label: 'What is MohnSters?', desc: 'The game that brings your business to life' },
  { href: '/mohnsters/business-growth', icon: FaStore, label: 'Business Growth Playbook', desc: 'How restaurants, bars, and shops earn more with gameplay' },
  { href: '/mohnsters/earn', icon: FaCoins, label: 'Earn While You Work', desc: 'How drivers & businesses earn in-game rewards' },
  { href: '/mohnsters/feed', icon: FaUtensils, label: 'Feed the Creatures', desc: 'Real food orders power up digital companions' },
  { href: '/mohnsters/community', icon: FaUsers, label: 'Community & Faith', desc: 'Churches, artists & local businesses in the game' },
  { href: '/mohnsters/world-ordering', icon: FaMapMarkerAlt, label: 'In-World Ordering', desc: 'Players order in-game and track real deliveries live' },
  { href: '/mohnsters/church-live', icon: FaVideo, label: 'Church Live Experience', desc: 'Attend live seminars from inside the game world' },
];

/* ─── Dropdown wrapper ─── */
interface DropdownProps {
  label: string;
  children: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  variant?: 'default' | 'game';
}

const NavDropdown = ({ label, children, open, onToggle, onClose, variant = 'default' }: DropdownProps) => (
  <div className="relative" onMouseLeave={onClose}>
    <button
      onClick={onToggle}
      onMouseEnter={onToggle}
      className={cn(
        'flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-colors',
        variant === 'game'
          ? 'text-white rounded-full bg-linear-to-r from-orange-500 via-purple-500 to-violet-600 hover:brightness-110 shadow-lg shadow-purple-500/20'
          : 'text-zinc-600 hover:text-black'
      )}
    >
      {variant === 'game' ? (
        <span className="flex items-center gap-1.5">
          <FaGamepad className="text-white" />
          {label}
        </span>
      ) : label}
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
          <div className={cn(
            'rounded-2xl shadow-2xl border p-3 min-w-[320px]',
            variant === 'game'
              ? 'bg-[#0a0a0f] border-purple-500/20 shadow-purple-500/10'
              : 'bg-white border-zinc-100'
          )}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

interface DropLinkProps {
  href: string;
  icon?: any;
  label: string;
  desc: string;
  onClick?: () => void;
  variant?: 'default' | 'game';
}

const DropLink = ({ href, icon: Icon, label, desc, onClick, variant = 'default' }: DropLinkProps) => (
  <Link href={href} onClick={onClick} className={cn(
    'flex items-start gap-3 p-3 rounded-xl transition-colors group',
    variant === 'game' ? 'hover:bg-purple-500/10' : 'hover:bg-zinc-50'
  )}>
    {Icon ? (
      <div className={cn(
        'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors',
        variant === 'game'
          ? 'bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white'
          : 'bg-zinc-100 group-hover:bg-black group-hover:text-white'
      )}>
        <Icon className="text-sm" />
      </div>
    ) : (
      <div className={cn(
        'w-9 h-9 shrink-0',
        variant === 'game' ? 'text-purple-400' : 'text-zinc-400'
      )} />
    )}
    <div>
      <div className={cn('text-sm font-bold', variant === 'game' ? 'text-white' : 'text-black')}>{label}</div>
      <div className={cn('text-xs leading-snug', variant === 'game' ? 'text-zinc-500' : 'text-zinc-400')}>{desc}</div>
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

  // Scroll listener — must be called unconditionally (React hooks rules)
  useEffect(() => {
    const h = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  // Hide global header on dashboard and order pages (they have their own nav)
  const hideHeader = pathname?.startsWith('/order/') || 
    pathname?.startsWith('/owner') || 
    pathname?.startsWith('/driver') || 
    pathname?.startsWith('/customer');
  if (hideHeader) return null;

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
          <span className="hidden sm:inline text-xl font-black tracking-tight text-black">
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
          <Link href="/apply" className="px-5 py-2 bg-black text-white rounded-full text-sm font-bold hover:bg-zinc-800 transition-colors">Apply</Link>
          <Link href="/comparison" className="px-4 py-2 text-sm font-semibold text-zinc-600 hover:text-black transition-colors">Compare</Link>
          <Link href="/about" className="px-4 py-2 text-sm font-semibold text-zinc-600 hover:text-black transition-colors">About</Link>
          <Link href="/careers" className="px-4 py-2 text-sm font-semibold text-zinc-600 hover:text-black transition-colors">Careers</Link>
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
              <NavDropdown label="Mohnsters" open={openMenu === 'mohnsters'} onToggle={() => toggle('mohnsters')} onClose={closeDropdown} variant="game">
                <div className="space-y-1 min-w-[340px]">
                  <div className="px-3 pt-2 pb-3 border-b border-purple-500/10 mb-2">
                    <div className="text-xs font-black uppercase tracking-[0.2em] text-purple-400">🎮 The Game</div>
                    <div className="text-[10px] text-zinc-600 mt-0.5">Where your real business meets the digital world</div>
                  </div>
                  {mohnStersItems.map(s => <DropLink key={s.href} {...s} onClick={closeDropdown} variant="game" />)}
                </div>
              </NavDropdown>
              <button onClick={() => openAuthModal('login')} className="px-5 py-2.5 bg-black text-white rounded-full text-sm font-bold hover:bg-zinc-800 transition-colors">Sign In</button>
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
            <div className="sm:hidden flex items-center gap-1.5">
              <div className="relative" onMouseLeave={closeDropdown}>
                <button
                  onClick={() => toggle('mohnsters-mobile')}
                  className="h-9 flex items-center gap-1.5 px-3 rounded-full text-xs font-bold text-white bg-linear-to-r from-orange-500 via-purple-500 to-violet-600 shadow-lg shadow-purple-500/20"
                >
                  <FaGamepad className="text-white text-xs" /> Game
                  <FaChevronDown className={cn('text-[9px] transition-transform duration-200', openMenu === 'mohnsters-mobile' && 'rotate-180')} />
                </button>
                <AnimatePresence>
                  {openMenu === 'mohnsters-mobile' && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full pt-2 z-50"
                    >
                      <div className="rounded-2xl shadow-2xl border p-3 min-w-[260px] max-w-[calc(100vw-1rem)] max-h-[65vh] overflow-y-auto bg-[#0a0a0f] border-purple-500/20 shadow-purple-500/10">
                        {mohnStersItems.map(s => <DropLink key={s.href} {...s} onClick={closeDropdown} variant="game" />)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button
                onClick={() => openAuthModal('signup')}
                className="h-9 px-3.5 text-xs font-bold text-black border border-zinc-200 rounded-full hover:border-zinc-400 transition-colors"
              >
                Register
              </button>
            </div>
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
            animate={{ opacity: 1, height: '100dvh' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden fixed left-0 right-0 top-[64px] bottom-0 bg-white border-t border-zinc-100 overflow-hidden"
          >
            <nav className="container mx-auto px-6 py-8 flex flex-col gap-1 h-full overflow-y-auto pb-24">
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
                  {f.icon ? <f.icon className="text-orange-500" /> : <span className="w-4 h-4 rounded-full bg-orange-100" />}
                  <span className="font-bold text-black">{f.label}</span>
                </Link>
              ))}

              <div className="h-px bg-zinc-100 my-4" />
              <div className="bg-gradient-to-br from-[#0a0a0f] to-[#1a1a24] rounded-2xl p-4 border border-purple-500/20">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 mb-3 ml-1 flex items-center gap-2">
                  <FaGamepad className="text-purple-500" /> Mohnsters
                </p>
                {mohnStersItems.map(s => (
                  <Link key={s.href} href={s.href} onClick={closeMobile} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-purple-500/10">
                    <s.icon className="text-purple-400" /><span className="font-bold text-white">{s.label}</span>
                  </Link>
                ))}
              </div>

              <div className="h-px bg-zinc-100 my-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 ml-1">Platform</p>
              <Link href="/pricing" onClick={closeMobile} className="px-3 py-2.5 font-bold text-black hover:text-orange-600 transition-colors">Pricing</Link>
              <Link href="/apply" onClick={closeMobile} className="px-3 py-2.5 font-bold text-black hover:text-orange-600 transition-colors">Apply</Link>
              <Link href="/comparison" onClick={closeMobile} className="px-3 py-2.5 font-bold text-black hover:text-orange-600 transition-colors">Compare</Link>
              <Link href="/about" onClick={closeMobile} className="px-3 py-2.5 font-bold text-black hover:text-orange-600 transition-colors">About</Link>
              <Link href="/faq" onClick={closeMobile} className="px-3 py-2.5 font-bold text-black hover:text-orange-600 transition-colors">FAQ</Link>
              <Link href="/contact" onClick={closeMobile} className="px-3 py-2.5 font-bold text-black hover:text-orange-600 transition-colors">Contact</Link>

              <div className="h-px bg-zinc-100 my-4" />
              {!user && (
                <>
                  <button onClick={() => { closeMobile(); openAuthModal('login'); }} className="px-3 py-3 bg-black text-white rounded-full font-bold text-left">Sign In</button>
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
