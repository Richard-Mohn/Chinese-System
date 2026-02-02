'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import MenuItemCard from '@/components/MenuItemCard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        console.log("Fetching menu items from Firestore...");
        const querySnapshot = await getDocs(collection(db, 'menuItems'));
        console.log(`Successfully fetched ${querySnapshot.size} documents.`);
        
        const items: MenuItem[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          // Safety logging for individual documents
          if (!data.prices || !data.category) {
            console.warn(`Document ${doc.id} is missing prices or category:`, data);
          }
          return {
            id: doc.id,
            ...data
          };
        }) as MenuItem[];
        
        setMenuItems(items);
      } catch (err) {
        console.error("Error fetching menu items:", err);
        setError("Failed to load menu. Please check console for details.");
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  if (loading) {
    return <div className="text-center p-12 text-indigo-600 font-semibold animate-pulse uppercase tracking-widest">🐉 Initializing Dragon Menu...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-12">
        <div className="text-red-500 font-black text-2xl mb-4 uppercase">System Error</div>
        <p className="text-zinc-500 mb-8">{error}</p>
        <button 
          onClick={() => router.refresh()}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Group items by category with safety check
  const groupedMenu = menuItems.reduce((acc, item) => {
    const cat = item.category || "Uncategorized";
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(item);
    return acc;
  }, {} as { [key: string]: MenuItem[] });

  console.log("Menu grouped into categories:", Object.keys(groupedMenu));

  // Custom category order
  const categoryOrder = [
    "Appetizers", "Soup", "Fried Rice", "Lo Mein", "Chow Mein or Chop Suey",
    "Chow Mei Fun", "Egg Foo Young", "Vegetables", "Pork", "Chicken",
    "Beef", "Seafood", "Sweet & Sour", "Steamed Dishes", "Yat Gat Mein",
    "American Dishes", "Fried Chicken Wings", "Subs", "On A Bun",
    "Chef's Specialties", "Combination Platters", "Lunch Specials"
  ];

  const sortedCategories = Object.keys(groupedMenu).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Golden Rule Banner */}
      <div className="bg-amber-500 text-black py-2 text-center text-[10px] font-black uppercase tracking-[0.2em] sticky top-20 z-40 backdrop-blur-md bg-amber-500/90">
        All orders prepared AFTER upfront payment.
      </div>

      {/* Sticky Category Nav */}
      <div className="sticky top-[116px] z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto no-scrollbar">
        <div className="container mx-auto px-4 flex gap-6 py-4 whitespace-nowrap">
          {sortedCategories.map(category => (
            <a 
              key={category} 
              href={`#${category.replace(/\s+/g, '-').toLowerCase()}`}
              className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-indigo-600 transition-colors"
            >
              {category}
            </a>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <header className="mb-20 text-center">
          <span className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.3em] mb-4 block">Selection 2026</span>
          <h1 className="text-6xl md:text-7xl font-black text-zinc-900 dark:text-zinc-100 mb-4 uppercase tracking-tight">Full Menu</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium max-w-xl mx-auto leading-relaxed">
            From classic appetizers to our Chef's Signature specialties. Hand-crafted, wok-fired, and ready for you.
          </p>
        </header>

        {sortedCategories.map(category => (
          <section 
            key={category} 
            id={category.replace(/\s+/g, '-').toLowerCase()} 
            className="mb-24 scroll-mt-48"
          >
            <div className="flex items-center gap-6 mb-10">
              <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter">
                {category}
              </h2>
              <div className="h-[2px] flex-grow bg-zinc-200 dark:bg-zinc-800 mt-2" />
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-2">
                {groupedMenu[category].length} Items
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
              {groupedMenu[category].map(item => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Floating View Cart for Mobile */}
      <div className="fixed bottom-8 right-8 z-50 sm:hidden">
        <Link 
          href="/cart"
          className="bg-indigo-600 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-500/40 active:scale-90 transition-transform"
        >
          <span className="text-2xl">🥡</span>
        </Link>
      </div>
    </div>
  );
};

export default MenuPage;
