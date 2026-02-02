'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

const Header = () => {
  const { getTotalItems } = useCart();
  const { profile, logout } = useAuth();
  const totalItems = getTotalItems();

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl">🐉</span>
          <span className="text-xl font-black tracking-tighter text-indigo-900 dark:text-indigo-400 group-hover:text-indigo-600 transition-colors uppercase">
            Golden Dragon
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-[10px] font-black text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 transition-colors uppercase tracking-[0.2em]">
            Home
          </Link>
          <Link href="/menu" className="text-[10px] font-black text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 transition-colors uppercase tracking-[0.2em]">
            Menu
          </Link>
          {profile?.role === 'staff' || profile?.role === 'owner' ? (
            <Link href="/admin" className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors uppercase tracking-[0.2em]">
              Dashboard
            </Link>
          ) : (
            <Link href="/track" className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] cursor-not-allowed">
              Track Order
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3 sm:gap-6">
          <Link 
            href="/cart" 
            className="relative p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all active:scale-95"
          >
            <span className="text-xl">🥡</span>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-zinc-950">
                {totalItems}
              </span>
            )}
          </Link>
          
          {profile ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <div className="text-[10px] font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter leading-none">{profile.displayName || 'Guest'}</div>
                <div className="text-[8px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-1">{profile.role}</div>
              </div>
              <button 
                onClick={() => logout()}
                className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all"
              >
                Exit
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
