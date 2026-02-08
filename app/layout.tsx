import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { AuthModalProvider } from '@/context/AuthModalContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnimatedBackground from "@/components/AnimatedBackground";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import {
  ORGANIZATION_JSONLD,
  SOFTWARE_APP_JSONLD,
  WEBSITE_JSONLD,
} from '@/lib/platform-seo';

const inter = Inter({ subsets: ["latin"], display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://mohnmenu.com'),
  title: {
    default: 'MohnMenu — Commission-Free Online Ordering for Local Businesses',
    template: '%s | MohnMenu',
  },
  description: 'MohnMenu is the ordering platform that gives local restaurants, bakeries, food trucks, and stores 100% of their revenue. Accept cards, crypto, and cash — zero commissions.',
  keywords: [
    'commission free ordering',
    'online ordering system',
    'restaurant ordering platform',
    'zero commission food ordering',
    'local business ordering',
  ].join(', '),
  authors: [{ name: 'MohnMenu' }],
  creator: 'MohnMenu',
  publisher: 'MohnMenu',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'MohnMenu',
    title: 'MohnMenu — Commission-Free Ordering for Local Businesses',
    description: 'Zero commissions. Cards, crypto, cash. GPS tracking. Live kitchen cameras. The ordering platform built for local businesses.',
    url: 'https://mohnmenu.com',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'MohnMenu — Commission-Free Ordering Platform' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MohnMenu — Commission-Free Ordering',
    description: 'Zero commissions. Cards, crypto, cash. Built for local businesses.',
    images: ['/og-image.png'],
  },
  verification: {
    // Add your Google Search Console verification code here
    // google: 'your-verification-code',
  },
  alternates: {
    canonical: 'https://mohnmenu.com',
  },
  category: 'technology',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Global JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSONLD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SOFTWARE_APP_JSONLD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSONLD) }}
        />
        <AnimatedBackground />
        <AuthProvider>
          <AuthModalProvider>
            <GoogleAnalytics />
            <CartProvider>
              <Header />
              <main>
                {children}
              </main>
              <Footer />
            </CartProvider>
          </AuthModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
