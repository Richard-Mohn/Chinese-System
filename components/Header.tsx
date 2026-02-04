'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { FaSignOutAlt } from 'react-icons/fa';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

const NavLink = ({ href, children }: NavLinkProps) => (
  <Link href={href} passHref>
    <motion.div
      className="px-4 py-2 text-sm font-bold text-zinc-600 hover:text-black"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.div>
  </Link>
);

const Header = () => {
  const { getTotalItems } = useCart();
  const { user, logout } = useAuth();
  const totalItems = getTotalItems();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      className={cn(
        'fixed top-0 left-0 right-0 z-[100] transition-all duration-500 border-b',
        isScrolled
          ? 'bg-white/80 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.02)] border-zinc-100 py-2'
          : 'bg-white/50 backdrop-blur-sm border-transparent py-4'
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-3xl font-black tracking-tighter text-black">
            LOCL<span className="text-indigo-600">.</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 bg-zinc-50/50 p-1.5 rounded-full border border-zinc-100">
          <NavLink href="/for-restaurants">Restaurants</NavLink>
          <NavLink href="/for-convenience-stores">Stores</NavLink>
          <NavLink href="/pricing">Pricing</NavLink>
          <NavLink href="/about">About</NavLink>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative group">
            <motion.div
              className="p-3 rounded-full hover:bg-zinc-100 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600 group-hover:text-black transition-colors"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              {totalItems > 0 && (
                <motion.span
                  className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-lg shadow-indigo-200"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  {totalItems}
                </motion.span>
              )}
            </motion.div>
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
               <Link href="/dashboard">
                  <span className="px-5 py-2.5 text-sm font-bold text-zinc-600 hover:text-black transition-colors">Dashboard</span>
               </Link>
              <motion.button
                onClick={() => logout()}
                className="p-3 rounded-full bg-zinc-50 text-zinc-400 hover:text-red-500 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaSignOutAlt className="text-sm" />
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="hidden sm:block">
                <span className="px-5 py-2.5 text-sm font-bold text-zinc-600 hover:text-black transition-colors">Sign In</span>
              </Link>
              <Link href="/register">
                <motion.span 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2.5 bg-black text-white rounded-full text-sm font-bold shadow-xl shadow-black/10 block"
                >
                  Join LOCL
                </motion.span>
              </Link>
            </div>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-black"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-zinc-100 overflow-hidden"
          >
            <nav className="container mx-auto px-6 py-8 flex flex-col gap-4">
              <Link href="/for-restaurants" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-black text-black">Restaurants</Link>
              <Link href="/for-convenience-stores" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-black text-black">Stores</Link>
              <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-black text-black">Pricing</Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-black text-black">About</Link>
              <div className="h-px bg-zinc-100 my-4" />
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold text-zinc-500">Sign In</Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold text-indigo-600">Join LOCL</Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
