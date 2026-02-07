import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnimatedBackground from "@/components/AnimatedBackground";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MohnMenu | Commission-Free Ordering for Local Businesses",
  description: "MohnMenu: The ordering platform that gives local restaurants and stores 100% of their revenue. Cards, crypto, cash — zero commissions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AnimatedBackground />
        <AuthProvider>
          <GoogleAnalytics />
          <CartProvider>
            <Header />
            <main>
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
