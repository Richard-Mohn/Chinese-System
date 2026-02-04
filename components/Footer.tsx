'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <div className="mb-6 md:mb-0">
            <h3 className="text-xl font-bold text-black mb-2">OrderFlow</h3>
            <p className="text-gray-500 text-sm">
              Mobile ordering platform for restaurants and food businesses.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/#menu">
              <span className="text-sm font-medium text-gray-500 hover:text-black">Menu</span>
            </Link>
            <Link href="/#about">
              <span className="text-sm font-medium text-gray-500 hover:text-black">About</span>
            </Link>
            <Link href="/#contact">
              <span className="text-sm font-medium text-gray-500 hover:text-black">Contact</span>
            </Link>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-400 mb-4 sm:mb-0">
            &copy; {currentYear} Golden Dragon. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" aria-label="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-black"><path d="M22 4s-.7 2.1-2 3.4c1.6 1.4 3.3 4.9 3 7.1 0 .8-1.5 1.5-2.5 2.5-1 .9-2 1.4-3 1.4-1.6 0-2.8-1-4-2.4-1.2-1.5-2.5-3-4-3-1.4 0-2.5.8-3.5 1.6-1 .8-2 1.6-3 1.6-1 0-1.5-.8-1.5-1.6 0-1.6 1.4-4.4 4-7.4 2.5-3 5-5.4 8-5.4 1.5 0 3 .8 4 1.6z"/></svg>
            </a>
            <a href="#" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-black"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="#" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-black"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
