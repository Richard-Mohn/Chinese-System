'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import ItemOptionsModal from './ItemOptionsModal';

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

interface MenuItemCardProps {
  item: MenuItem;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const prices = item.prices || {};
  const priceKeys = Object.keys(prices);
  
  if (!item.name || priceKeys.length === 0) {
    return null;
  }

  return (
    <>
      <div 
        onClick={() => item.availability && setIsModalOpen(true)}
        className={`bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden flex flex-col border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 transition-all duration-300 cursor-pointer group ${!item.availability ? 'opacity-60 grayscale cursor-not-allowed' : ''}`}
      >
        <div className="relative h-48 w-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <Image
            src={item.image_url || 'https://placehold.co/800x600/e74c3c/ffffff?text=Delicious+Dish'}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {item.isSpicy && (
            <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase shadow-lg">
              Spicy 🔥
            </div>
          )}
          {!item.availability && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
              <span className="bg-white text-black text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">Sold Out</span>
            </div>
          )}
        </div>
        
        <div className="p-5 flex-grow flex flex-col">
          <div className="mb-2">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{item.name}</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-[10px] mt-1 line-clamp-2 font-medium">{item.description}</p>
          </div>

          <div className="mt-auto pt-4 flex items-center justify-between border-t border-zinc-50 dark:border-zinc-800">
            <div className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter">
              {priceKeys.length > 1 ? `From $${Math.min(...Object.values(prices)).toFixed(2)}` : `$${prices[priceKeys[0]].toFixed(2)}`}
            </div>
            
            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <span className="text-lg font-light">＋</span>
            </div>
          </div>
        </div>
      </div>

      <ItemOptionsModal 
        item={item} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default MenuItemCard;
