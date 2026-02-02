'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  prices: { [key: string]: number };
  category: string;
  image_url: string;
  isSpicy?: boolean;
  combo_includes?: string;
  availability: boolean;
}

interface ItemOptionsModalProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
}

const ItemOptionsModal: React.FC<ItemOptionsModalProps> = ({ item, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const priceKeys = Object.keys(item.prices);
  const [selectedPriceKey, setSelectedPriceKey] = useState(priceKeys[0]);
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  const handleAdd = () => {
    const selectedPrice = item.prices[selectedPriceKey];
    addToCart({
      id: `${item.id}-${selectedPriceKey}-${Date.now()}`, // Unique ID for cart instance
      name: item.name,
      price: selectedPrice,
      quantity: quantity,
      image: item.image_url,
      options: priceKeys.length > 1 ? [selectedPriceKey] : [],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center bg-white/80 dark:bg-zinc-800/80 backdrop-blur rounded-full text-zinc-500 hover:text-indigo-600 transition-all"
        >
          ✕
        </button>

        <div className="relative h-64 w-full">
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-zinc-900 via-transparent to-transparent" />
        </div>

        <div className="p-8 -mt-12 relative">
          <div className="mb-6">
            <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter leading-none mb-2">
              {item.name}
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">{item.description}</p>
          </div>

          <div className="space-y-8">
            {/* Size/Price Selection */}
            {priceKeys.length > 1 && (
              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-4">Select Size</label>
                <div className="grid grid-cols-2 gap-3">
                  {priceKeys.map(key => (
                    <button
                      key={key}
                      onClick={() => setSelectedPriceKey(key)}
                      className={`py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border-2 ${
                        selectedPriceKey === key
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-500/20'
                          : 'border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600 hover:border-indigo-400'
                      }`}
                    >
                      {key} • ${item.prices[key].toFixed(2)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Notes */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-4">Special Instructions</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Extra spicy, no onions, etc."
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-2xl p-1 shadow-inner">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center font-bold text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 transition-colors"
                >—</button>
                <span className="w-12 text-center font-black text-xl text-zinc-900 dark:text-zinc-100">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 flex items-center justify-center font-bold text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 transition-colors"
                >＋</button>
              </div>

              <button
                onClick={handleAdd}
                className="flex-1 ml-6 bg-indigo-600 text-white py-5 rounded-3xl font-black uppercase tracking-[0.1em] hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/40 active:scale-95 flex items-center justify-center gap-3"
              >
                <span>Add to Bag</span>
                <span className="opacity-40">|</span>
                <span>${(item.prices[selectedPriceKey] * quantity).toFixed(2)}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemOptionsModal;
