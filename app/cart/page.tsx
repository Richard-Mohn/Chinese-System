'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="text-6xl mb-6">🥡</div>
        <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-100 mb-4 uppercase">Your Bag is Empty</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8 text-center max-w-md">
          Looks like you haven't added any of our delicious Chinese specialties yet.
        </p>
        <Link 
          href="/menu" 
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
        >
          Explore Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-black text-indigo-900 dark:text-indigo-400 mb-2 uppercase tracking-tight">Your Order</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium italic">Ready for the Golden Dragon experience?</p>
        </header>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
          <div className="p-8">
            {cart.map(item => (
              <div key={item.id} className="flex flex-col sm:items-center sm:flex-row justify-between border-b border-zinc-100 dark:border-zinc-800 py-6 last:border-b-0 gap-6">
                <div className="flex items-center">
                  {item.image && (
                    <div className="relative h-20 w-20 flex-shrink-0 mr-6">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="rounded-2xl object-cover shadow-md"
                      />
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 leading-tight uppercase">{item.name}</h2>
                    {item.options && item.options.length > 0 && (
                      <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1 uppercase tracking-tighter">
                        {item.options.join(' • ')}
                      </p>
                    )}
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-500 mt-1">${item.price.toFixed(2)} unit</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-8">
                  <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center font-bold text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 transition-colors"
                    >-</button>
                    <span className="w-10 text-center font-black text-zinc-900 dark:text-zinc-100">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center font-bold text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 transition-colors"
                    >+</button>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">${(item.price * item.quantity).toFixed(2)}</div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-1 hover:text-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-800/50 p-8 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex flex-col gap-2 mb-8">
              <div className="flex justify-between items-center text-zinc-500 dark:text-zinc-400 font-bold uppercase text-xs tracking-widest">
                <span>Subtotal</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-900 dark:text-zinc-100 font-black text-3xl uppercase tracking-tighter mt-2">
                <span>Total Due</span>
                <span className="text-indigo-600 dark:text-indigo-400">${getTotalPrice().toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-8 text-center">
              <p className="text-amber-800 dark:text-amber-400 text-xs font-bold uppercase tracking-tight">
                ⚠️ Golden Rule: Payment required before kitchen starts prep.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={clearCart}
                className="py-4 rounded-2xl font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 border-2 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-95"
              >
                Clear Bag
              </button>
              <button
                className="bg-indigo-600 text-white py-4 rounded-2xl font-extrabold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2"
              >
                Pay & Order ⚡
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Link href="/menu" className="text-zinc-500 dark:text-zinc-500 font-bold uppercase text-xs tracking-widest hover:text-indigo-600 transition-colors">
            ← Add More Items
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
