'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-zinc-100 py-20">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-2xl font-black tracking-tighter text-black mb-6">LOCL<span className="text-indigo-600">.</span></h3>
            <p className="text-zinc-500 font-medium text-sm leading-relaxed max-w-xs">
              The professional standard for local commerce. 100% profit, zero commissions.
            </p>
          </div>
          
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-8">Solutions</h4>
            <ul className="space-y-4">
              <li><Link href="/for-restaurants" className="text-sm font-bold text-zinc-600 hover:text-black transition-colors">Restaurants</Link></li>
              <li><Link href="/for-convenience-stores" className="text-sm font-bold text-zinc-600 hover:text-black transition-colors">Retail Stores</Link></li>
              <li><Link href="/pricing" className="text-sm font-bold text-zinc-600 hover:text-black transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-8">Resources</h4>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-sm font-bold text-zinc-600 hover:text-black transition-colors">Our Story</Link></li>
              <li><Link href="/faq" className="text-sm font-bold text-zinc-600 hover:text-black transition-colors">Insights (FAQ)</Link></li>
              <li><Link href="/contact" className="text-sm font-bold text-zinc-600 hover:text-black transition-colors">Support</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-8">Legal</h4>
            <ul className="space-y-4">
              <li><Link href="/privacy" className="text-sm font-bold text-zinc-600 hover:text-black transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm font-bold text-zinc-600 hover:text-black transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-zinc-50 flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-xs font-bold text-zinc-400">
            &copy; {currentYear} LOCL Platform. Built for the local economy.
          </p>
          <div className="flex items-center gap-8">
            <a href="#" className="text-zinc-400 hover:text-black transition-colors transform hover:scale-110 active:scale-95">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 1.4 3.3 4.9 3 7.1 0 .8-1.5 1.5-2.5 2.5-1 .9-2 1.4-3 1.4-1.6 0-2.8-1-4-2.4-1.2-1.5-2.5-3-4-3-1.4 0-2.5.8-3.5 1.6-1 .8-2 1.6-3 1.6-1 0-1.5-.8-1.5-1.6 0-1.6 1.4-4.4 4-7.4 2.5-3 5-5.4 8-5.4 1.5 0 3 .8 4 1.6z"/></svg>
            </a>
            <a href="#" className="text-zinc-400 hover:text-black transition-colors transform hover:scale-110 active:scale-95">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="#" className="text-zinc-400 hover:text-black transition-colors transform hover:scale-110 active:scale-95">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
