'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { FaXTwitter, FaInstagram, FaFacebookF } from 'react-icons/fa6';

const Footer = () => {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  // Hide footer on dashboard and order pages (standalone experience)
  if (
    pathname?.startsWith('/order/') ||
    pathname?.startsWith('/owner') ||
    pathname?.startsWith('/driver') ||
    pathname?.startsWith('/customer')
  ) return null;

  return (
    <footer className="bg-zinc-950 text-white pt-20 pb-10">
      <div className="container mx-auto px-6">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/10">
                <span className="text-white font-black text-sm leading-none">M</span>
              </div>
              <span className="text-xl font-black tracking-tight">
                Mohn<span className="text-orange-500">Menu</span>
              </span>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-sm mb-8">
              The commission-free ordering platform built for local restaurants and stores. Accept cards, crypto, and cash — keep 100% of your revenue.
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-zinc-400">
                <FaMapMarkerAlt className="text-orange-500 shrink-0" />
                <span>23 Shore St., Petersburg, VA 23803</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-400">
                <FaPhone className="text-orange-500 shrink-0" />
                <a href="tel:8046051461" className="hover:text-white transition-colors">804-605-1461</a>
              </div>
              <div className="flex items-center gap-3 text-zinc-400">
                <FaEnvelope className="text-orange-500 shrink-0" />
                <a href="mailto:hello@mohnmenu.com" className="hover:text-white transition-colors">hello@mohnmenu.com</a>
              </div>
            </div>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-6">Solutions</h4>
            <ul className="space-y-3.5">
              <li><Link href="/for-restaurants" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Restaurants</Link></li>
              <li><Link href="/for-convenience-stores" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Retail &amp; Stores</Link></li>
              <li><Link href="/pricing" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/comparison" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Compare Plans</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-6">Resources</h4>
            <ul className="space-y-3.5">
              <li><Link href="/about" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/faq" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Contact &amp; Support</Link></li>
              <li><Link href="/signup/courier" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Become a Courier</Link></li>
              <li><Link href="/features/community-delivery" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Community Delivery</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-6">Legal</h4>
            <ul className="space-y-3.5">
              <li><Link href="/privacy" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-600">
            &copy; {currentYear} MohnMenu. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a href="https://x.com/mohnmenu" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-orange-500 hover:text-white transition-all" aria-label="X (Twitter)">
              <FaXTwitter className="text-sm" />
            </a>
            <a href="https://instagram.com/mohnmenu" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-orange-500 hover:text-white transition-all" aria-label="Instagram">
              <FaInstagram className="text-sm" />
            </a>
            <a href="https://facebook.com/mohnmenu" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-orange-500 hover:text-white transition-all" aria-label="Facebook">
              <FaFacebookF className="text-sm" />
            </a>
          </div>

          <p className="text-[11px] text-zinc-600">
            <a href="https://MohnMenu.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-orange-500 transition-colors font-bold">
              <span className="w-3.5 h-3.5 rounded bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <span className="text-white font-black text-[6px] leading-none">M</span>
              </span>
              Powered by MohnMenu.com
            </a>
          </p>
        </div>

        {/* ── Mohn Empire ── */}
        <div className="mt-8 pt-6 border-t border-zinc-800">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-black text-[8px]">ME</span>
              </div>
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.15em]">A Mohn Empire Company</span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5">
              <span className="text-[11px] font-bold text-orange-400">● MohnMenu</span>
              <a href="https://mohnsters.com" target="_blank" rel="noopener noreferrer" className="text-[11px] text-zinc-600 hover:text-white transition-colors">MohnSters</a>
              <a href="https://neighbortechs.com" target="_blank" rel="noopener noreferrer" className="text-[11px] text-zinc-600 hover:text-white transition-colors">NeighborTechs</a>
              <a href="https://MohnMint.com" target="_blank" rel="noopener noreferrer" className="text-[11px] text-zinc-600 hover:text-white transition-colors">MohnMint</a>
              <a href="https://mohnmatrix.com" target="_blank" rel="noopener noreferrer" className="text-[11px] text-zinc-600 hover:text-white transition-colors">MohnMatrix</a>
              <a href="https://flamingsocialmedia.com" target="_blank" rel="noopener noreferrer" className="text-[11px] text-zinc-600 hover:text-white transition-colors">Flaming Social</a>
              <a href="https://mohnmove.com" target="_blank" rel="noopener noreferrer" className="text-[11px] text-zinc-600 hover:text-white transition-colors">MohnMove</a>
            </div>
            <p className="text-[10px] text-zinc-700 mt-1">23 Shore Street, Petersburg, Virginia 23803</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
