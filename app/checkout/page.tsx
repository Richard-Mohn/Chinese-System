'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '@/components/CheckoutForm';

// Replace with your real Stripe Publishable Key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

const CheckoutPage = () => {
  const { cart, getTotalPrice } = useCart();
  const { profile } = useAuth();
  const router = useRouter();

  const [name, setName] = useState(profile?.displayName || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup');
  const [address, setAddress] = useState('');
  const [isExpress, setIsExpress] = useState(false);

  const subtotal = getTotalPrice();
  const expressFee = isExpress ? 5.00 : 0;
  const total = subtotal + expressFee;

  if (cart.length === 0) {
    // Check for mounted to avoid SSR redirect issues
    if (typeof window !== 'undefined') {
      router.push('/menu');
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-black text-indigo-900 dark:text-indigo-400 uppercase tracking-tighter">Finalize Order</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium italic mt-2 underline decoration-amber-500 decoration-2 underline-offset-4">Securing your Golden Dragon feast</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Order Details Form */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-xl p-8 sm:p-10 border border-zinc-200 dark:border-zinc-800">
              <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight mb-8">Contact Info</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-3 ml-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-3 ml-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                    placeholder="name@example.com"
                  />
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-xl p-8 sm:p-10 border border-zinc-200 dark:border-zinc-800">
              <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight mb-8">Order Type</h2>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <button
                  type="button"
                  onClick={() => setOrderType('pickup')}
                  className={`py-5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border-2 flex flex-col items-center gap-2 ${
                    orderType === 'pickup'
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-500/20'
                      : 'border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:border-indigo-400'
                  }`}
                >
                  <span className="text-2xl">🥡</span>
                  <span>Store Pickup</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('delivery')}
                  className={`py-5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border-2 flex flex-col items-center gap-2 ${
                    orderType === 'delivery'
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-500/20'
                      : 'border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:border-indigo-400'
                  }`}
                >
                  <span className="text-2xl">📍</span>
                  <span>Door Delivery</span>
                </button>
              </div>

              {orderType === 'delivery' && (
                <div className="animate-in slide-in-from-top-4 duration-300">
                  <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-3 ml-1">Delivery Address</label>
                  <textarea
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white min-h-[100px]"
                    placeholder="Street, City, Zip Code"
                  />
                </div>
              )}
            </section>

            <section className="bg-amber-500/5 dark:bg-amber-500/10 rounded-[2.5rem] p-8 sm:p-10 border-2 border-dashed border-amber-500/30">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-black text-amber-600 dark:text-amber-400 uppercase tracking-tight mb-2 flex items-center gap-3">
                    Express Feed ⚡
                  </h2>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium leading-relaxed max-w-md">
                    Jump the queue. Your order gets moved to the front of the preparation line. Guaranteed fastest turnaround.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsExpress(!isExpress)}
                  className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    isExpress
                      ? 'bg-amber-500 text-black shadow-xl shadow-amber-500/30'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {isExpress ? 'Added (+$5)' : 'Add +$5'}
                </button>
              </div>
            </section>

            <section className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-xl p-8 sm:p-10 border border-zinc-200 dark:border-zinc-800">
              <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight mb-8">Payment</h2>
              <Elements stripe={stripePromise}>
                <CheckoutForm 
                  name={name}
                  email={email}
                  address={address}
                  orderType={orderType}
                  isExpress={isExpress}
                  total={total}
                  subtotal={subtotal}
                  expressFee={expressFee}
                />
              </Elements>
            </section>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                <div className="p-8 border-b border-zinc-100 dark:border-zinc-800">
                  <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-[0.2em]">Order Summary</h3>
                </div>
                <div className="p-8 space-y-4">
                  <div className="max-h-60 overflow-y-auto pr-2 space-y-4 no-scrollbar">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between gap-4">
                        <div className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                          <span className="text-indigo-600 dark:text-indigo-400">{item.quantity}x</span> {item.name}
                        </div>
                        <div className="text-xs font-black text-zinc-900 dark:text-zinc-100">${(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-400">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {isExpress && (
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-amber-500">
                        <span>Express Fee</span>
                        <span>$5.00</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-zinc-50 dark:border-zinc-800 mt-2">
                      <span className="text-lg font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter">Total Due</span>
                      <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-8 bg-zinc-50 dark:bg-zinc-800/50">
                  <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest text-center">
                    🔒 Secure 256-bit Encrypted Transaction
                  </p>
                </div>
              </div>
              
              <Link href="/cart" className="block text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                ← Return to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;