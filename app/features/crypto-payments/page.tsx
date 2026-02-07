'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FaBitcoin, FaEthereum, FaQrcode, FaArrowRight,
  FaShieldAlt, FaWallet, FaExchangeAlt, FaCheckCircle
} from 'react-icons/fa';

const COINS = [
  { name: 'Bitcoin', symbol: 'BTC', color: '#f7931a' },
  { name: 'Ethereum', symbol: 'ETH', color: '#627eea' },
  { name: 'Tether', symbol: 'USDT', color: '#26a17b' },
  { name: 'Solana', symbol: 'SOL', color: '#9945ff' },
  { name: 'USD Coin', symbol: 'USDC', color: '#2775ca' },
  { name: 'Litecoin', symbol: 'LTC', color: '#bfbbbb' },
  { name: 'Dogecoin', symbol: 'DOGE', color: '#c2a633' },
  { name: 'TRON', symbol: 'TRX', color: '#ff0013' },
];

const FEATURES = [
  { icon: FaQrcode, title: 'Inline QR Codes', desc: 'Customers scan a QR code right in the checkout flow — no copy-pasting wallet addresses. BIP-21 standard for Bitcoin, proper URI schemes for all coins.' },
  { icon: FaShieldAlt, title: 'Automatic Confirmation', desc: 'We poll the NOWPayments API for payment confirmation. Once confirmed, the order status updates automatically — no manual checking.' },
  { icon: FaWallet, title: '8 Cryptocurrencies', desc: 'BTC, ETH, USDT, SOL, USDC, LTC, DOGE, and TRX. Customers pick their preferred coin at checkout.' },
  { icon: FaExchangeAlt, title: 'NOWPayments Integration', desc: 'Payments are processed through NOWPayments with IPN webhooks for reliable payment tracking and settlement.' },
  { icon: FaCheckCircle, title: 'Zero Commission', desc: 'MohnMenu charges 0% commission on crypto payments. Transaction fees are only the blockchain network fees.' },
  { icon: FaBitcoin, title: 'Works Alongside Card & Cash', desc: 'Crypto is an additional payment option at checkout — customers still have card (Stripe) and cash as alternatives.' },
];

const FAQS = [
  {
    q: 'Which cryptocurrencies can my customers pay with?',
    a: 'Bitcoin (BTC), Ethereum (ETH), Tether (USDT), Solana (SOL), USD Coin (USDC), Litecoin (LTC), Dogecoin (DOGE), and TRON (TRX). All 8 are available at checkout with dedicated QR codes.',
  },
  {
    q: 'How does the QR code payment work?',
    a: 'When a customer selects crypto at checkout and picks their coin, a QR code is generated with the correct wallet address and payment amount using the proper URI scheme (BIP-21 for Bitcoin, etc.). They scan it with any crypto wallet app to send the payment.',
  },
  {
    q: 'How do I know when a crypto payment is confirmed?',
    a: 'The checkout page polls the NOWPayments API every few seconds. Once the blockchain confirms the transaction, the order status updates to paid and the order ticket appears in your dashboard just like any other order.',
  },
  {
    q: 'Where do the crypto funds go?',
    a: 'Crypto payments are processed through your NOWPayments account. You configure your receiving wallet addresses in your NOWPayments dashboard. Settlement options depend on your NOWPayments plan.',
  },
  {
    q: 'Is there a commission on crypto orders?',
    a: 'MohnMenu charges 0% commission on crypto payments. The only fees are blockchain network transaction fees and any fees from NOWPayments based on your plan with them.',
  },
  {
    q: 'Can I disable crypto payments?',
    a: 'Yes. Crypto payments only appear at checkout if your NOWPayments API key is configured. If you haven\'t set one up, customers will only see card and cash options.',
  },
];

export default function CryptoPaymentsFeature() {
  return (
    <div className="min-h-screen bg-white/90">
      {/* Hero */}
      <section className="pt-36 pb-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-amber-50 border border-amber-100 text-xs font-black uppercase tracking-widest text-amber-600"
          >Feature</motion.div>
          <motion.h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-zinc-900 text-balance"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          >
            Crypto Payments<span className="text-orange-600">.</span>
          </motion.h1>
          <motion.p className="text-xl text-zinc-500 leading-relaxed font-medium max-w-3xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            Accept Bitcoin, Ethereum, and 6 more cryptocurrencies directly at checkout. 
            QR codes, automatic confirmation, zero commission.
          </motion.p>
          {/* Coin badges */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3 mb-10"
          >
            {COINS.map(coin => (
              <div key={coin.symbol} className="flex items-center gap-2 px-4 py-2 bg-zinc-50 rounded-full border border-zinc-100">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: coin.color }} />
                <span className="text-sm font-bold text-black">{coin.symbol}</span>
              </div>
            ))}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Link href="/register" className="group inline-flex items-center gap-3 px-8 py-4 bg-black text-white rounded-full font-bold text-lg hover:bg-zinc-800 transition-all shadow-2xl">
              Start Free <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-zinc-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-black text-black mb-12 tracking-tight text-center">What&apos;s Included<span className="text-orange-500">.</span></h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={i} className="bg-white p-8 rounded-3xl border border-zinc-100 group hover:border-zinc-300 hover:shadow-lg transition-all"
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-black group-hover:text-white transition-all shadow-sm">
                  <f.icon className="text-xl" />
                </div>
                <h4 className="text-lg font-bold text-black mb-2">{f.title}</h4>
                <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-black text-black mb-12 tracking-tight text-center">Questions & Answers<span className="text-orange-500">.</span></h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <motion.details key={i} className="group bg-zinc-50 rounded-2xl border border-zinc-100 overflow-hidden"
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <summary className="px-6 py-5 cursor-pointer font-bold text-black flex items-center justify-between hover:bg-zinc-100 transition-colors">
                  {faq.q}
                  <span className="text-orange-500 text-xl ml-4 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-6 pb-5 text-sm text-zinc-500 leading-relaxed">{faq.a}</div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-zinc-50">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-black text-black mb-4 tracking-tight">Accept crypto today.</h2>
          <p className="text-zinc-500 font-medium mb-8">8 coins. QR codes. Zero commission.</p>
          <Link href="/register" className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full font-bold text-lg shadow-xl shadow-orange-500/20 hover:shadow-2xl transition-all">
            Get Started Free <FaArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}
