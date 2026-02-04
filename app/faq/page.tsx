'use client';

import { motion } from 'framer-motion';
import { FaPlus, FaMinus } from 'react-icons/fa';
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
      className="bg-white rounded-[2rem] border border-zinc-100 overflow-hidden shadow-[0_10px_50px_rgba(0,0,0,0.02)] transition-all duration-500 hover:border-zinc-300"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-8 flex justify-between items-center text-left"
      >
        <span className="text-xl font-bold text-black">{question}</span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isOpen ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-400'}`}>
          {isOpen ? <FaMinus className="text-[10px]" /> : <FaPlus className="text-[10px]" />}
        </div>
      </button>
      {isOpen && (
        <div className="px-8 pb-8">
          <p className="text-zinc-500 font-medium leading-relaxed border-t border-zinc-50 pt-6">
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
      question: "Is LOCL actually free?",
      answer: "Yes. Our core ordering system, including unlimited menu items, digital storefront, and standard analytics, is completely free. We make money by selling premium modules like live GPS delivery tracking and live kitchen cams."
    },
    {
      question: "How do payments work?",
      answer: "LOCL integrates directly with Stripe. When a customer pays, the funds go directly into your account. We never touch your revenue or charge a commission on your sales."
    },
    {
      question: "Can I use my own drivers?",
      answer: "Absolutely. LOCL was built to help you manage your own fleet. Our premium GPS module gives you sub-second tracking of your drivers so you can provide an Uber-like experience without the cost."
    },
    {
      question: "Do I need special hardware?",
      answer: "No. LOCL works on any device with a browser. Most businesses use existing tablets or iPads for their Kitchen Display System (KDS)."
    },
    {
      question: "What is the 'Chef's Eye' Cam?",
      answer: "It's one of our elite modules. It allows you to live-stream your kitchen preparation to customers while they wait for their order. It builds incredible trust and is proven to increase repeat business."
    }
  ];

  return (
    <div className="min-h-screen bg-transparent pt-40 pb-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-20">
          <motion.h1 
            className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-zinc-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Insights<span className="text-indigo-600">.</span>
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Everything you need to know about the platform.
          </motion.p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <FAQItem key={i} {...faq} delay={i * 0.1} />
          ))}
        </div>

        <motion.div 
          className="mt-20 p-12 rounded-[3rem] bg-zinc-50 border border-zinc-100 text-center shadow-inner"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold mb-4 text-black">Still have questions?</h3>
          <p className="text-zinc-500 font-medium mb-8">We're happy to discuss your specific business needs.</p>
          <a href="/contact">
            <button className="px-10 py-4 bg-black text-white rounded-full font-black text-sm shadow-xl hover:bg-zinc-800 transition-all">
              Talk to a Specialist
            </button>
          </a>
        </motion.div>
      </div>
    </div>
  );
}
