'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaPlus, FaMinus, FaArrowRight } from 'react-icons/fa';
import { useState } from 'react';

interface FAQItemProps {
  question: string;
  answer: string;
  delay: number;
}

const FAQItem = ({ question, answer, delay }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      className="bg-white rounded-2xl border border-zinc-100 overflow-hidden shadow-sm transition-all duration-500 hover:border-zinc-300"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-7 flex justify-between items-center text-left"
      >
        <span className="text-lg font-bold text-black pr-4">{question}</span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${isOpen ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white' : 'bg-zinc-50 text-zinc-400'}`}>
          {isOpen ? <FaMinus className="text-[10px]" /> : <FaPlus className="text-[10px]" />}
        </div>
      </button>
      {isOpen && (
        <div className="px-7 pb-7">
          <p className="text-zinc-500 font-medium leading-relaxed border-t border-zinc-50 pt-5 text-sm">
            {answer}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default function FAQ() {
  const faqs = [
    {
      question: "Is MohnMenu actually free?",
      answer: "Yes. Our core ordering platform — including unlimited menu items, digital storefront, Order with Google, fraud protection, card payments, crypto payments, and basic analytics — is completely free forever. We monetize through optional premium modules like GPS fleet tracking, Chef Cam, and AI analytics at flat monthly rates."
    },
    {
      question: "How do card payments work?",
      answer: "MohnMenu integrates directly with Stripe. When a customer pays by card, the funds go directly into your Stripe account. We never touch your revenue and never charge a commission. Stripe's standard processing fee (2.9% + 30¢) applies — that's Stripe's fee, not ours."
    },
    {
      question: "How does crypto payment work?",
      answer: "We use NOWPayments Custody API to generate inline payment addresses for each order. Customers can pay in Bitcoin, Ethereum, Litecoin, Dogecoin, and more. A QR code is generated at checkout that works with Cash App, Coinbase, and all standard crypto wallets. Funds settle to your NOWPayments custody wallet and can be withdrawn at any time."
    },
    {
      question: "Can I accept cash?",
      answer: "Absolutely. In your MohnMenu dashboard, you can toggle cash-on-delivery with a single switch. Customers will see the cash option at checkout and pay when they receive their order. You control which payment methods are available."
    },
    {
      question: "Can I use my own drivers?",
      answer: "Yes. MohnMenu was built to help you manage your own delivery fleet. Our premium GPS module ($47/mo Growth plan) gives you sub-second real-time tracking of your drivers, so you can provide an Uber-like delivery experience without the 30% commission."
    },
    {
      question: "What is the Chef's Eye Cam?",
      answer: "Chef's Eye is a premium module that lets you live-stream your kitchen preparation to customers while they wait for their order. It builds incredible trust and transparency. The live feed appears directly on the customer's order tracking page — no extra apps needed."
    },
    {
      question: "Do I need special hardware?",
      answer: "No. MohnMenu is 100% browser-based and works on any device — phone, tablet, laptop, or desktop. Most businesses use an existing tablet or iPad for the Kitchen Display System (KDS). There's nothing to install."
    },
    {
      question: "What is Order with Google?",
      answer: "Order with Google lets customers find your menu and place orders directly from Google Search and Google Maps. When someone searches for your business, they see an 'Order Online' button that links directly to your MohnMenu storefront — bringing in new customers effortlessly."
    },
    {
      question: "How does fraud protection work?",
      answer: "Every digital transaction processed through MohnMenu is covered by our fraud protection system. If a customer files a fraudulent chargeback, we handle the dispute process at no extra cost to you. This is included on all plans, including the free Starter tier."
    },
    {
      question: "Can I cancel at any time?",
      answer: "MohnMenu has zero contracts. The Starter plan is free forever. Premium modules (Growth or Enterprise) are billed monthly and can be cancelled at any time from your dashboard. No cancellation fees, no lock-in periods."
    },
  ];

  return (
    <div className="min-h-screen bg-white/90 pt-36 pb-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-orange-50 border border-orange-100 text-xs font-black uppercase tracking-widest text-orange-600"
          >Knowledge Base</motion.div>
          <motion.h1
            className="text-5xl md:text-8xl font-black mb-6 tracking-tighter text-zinc-900 text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Questions<span className="text-orange-500">?</span>
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Everything you need to know about the MohnMenu platform, payments, and premium modules.
          </motion.p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem key={i} {...faq} delay={i * 0.05} />
          ))}
        </div>

        <motion.div
          className="mt-20 bg-zinc-950 rounded-3xl p-10 md:p-14 text-center relative overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="relative z-10">
            <h3 className="text-3xl font-black mb-4 text-white">Still have questions?</h3>
            <p className="text-zinc-400 font-medium mb-8 text-lg">Our team is ready to help you get started.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-bold text-lg hover:shadow-xl hover:shadow-orange-500/20 transition-all active:scale-95">
              Talk to a Specialist <FaArrowRight />
            </Link>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-orange-600/10 to-transparent blur-3xl pointer-events-none" />
        </motion.div>
      </div>
    </div>
  );
}
