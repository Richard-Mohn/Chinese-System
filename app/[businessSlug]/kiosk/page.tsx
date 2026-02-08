'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs, onSnapshot, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaShoppingCart, FaPlus, FaMinus, FaTrash, FaCreditCard,
  FaMobileAlt, FaCheck, FaArrowLeft, FaSearch, FaClock,
  FaConciergeBell, FaUtensils, FaGlassMartini, FaCoffee,
  FaHamburger, FaPizzaSlice, FaIceCream, FaBeer
} from 'react-icons/fa';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  category: string;
  image?: string;
  available?: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface BusinessData {
  businessId: string;
  businessName: string;
  slug: string;
  businessType?: string;
}

const CATEGORY_ICONS: Record<string, any> = {
  'Drinks': FaGlassMartini,
  'Beer': FaBeer,
  'Cocktails': FaGlassMartini,
  'Food': FaUtensils,
  'Appetizers': FaConciergeBell,
  'Burgers': FaHamburger,
  'Pizza': FaPizzaSlice,
  'Desserts': FaIceCream,
  'Coffee': FaCoffee,
};

export default function KioskPage() {
  const params = useParams();
  const slug = params?.businessSlug as string;

  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Load business + menu
  useEffect(() => {
    async function load() {
      try {
        const q = query(collection(db, 'businesses'), where('slug', '==', slug));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const d = snap.docs[0];
          const biz = { ...d.data(), businessId: d.id } as BusinessData;
          setBusiness(biz);

          // Load menu items
          const menuSnap = await getDocs(collection(db, 'businesses', d.id, 'menuItems'));
          const items: MenuItem[] = menuSnap.docs.map(m => ({
            id: m.id,
            ...m.data(),
          })) as MenuItem[];
          setMenuItems(items.filter(i => i.available !== false));
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    if (slug) load();
  }, [slug]);

  const categories = ['All', ...new Set(menuItems.map(i => i.category).filter(Boolean))];

  const filteredItems = menuItems.filter(item => {
    if (activeCategory !== 'All' && item.category !== activeCategory) return false;
    if (searchTerm) {
      return item.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  function addToCart(item: MenuItem) {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) {
        return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }

  function removeFromCart(id: string) {
    setCart(prev => {
      const existing = prev.find(c => c.id === id);
      if (existing && existing.quantity > 1) {
        return prev.map(c => c.id === id ? { ...c, quantity: c.quantity - 1 } : c);
      }
      return prev.filter(c => c.id !== id);
    });
  }

  function deleteFromCart(id: string) {
    setCart(prev => prev.filter(c => c.id !== id));
  }

  async function placeOrder() {
    if (!business || cart.length === 0) return;
    try {
      const num = `K${Date.now().toString().slice(-6)}`;
      await addDoc(collection(db, 'businesses', business.businessId, 'orders'), {
        items: cart.map(c => ({
          menuItemId: c.id,
          name: c.name,
          price: c.price,
          quantity: c.quantity,
        })),
        subtotal: cartTotal,
        tax: cartTotal * 0.08,
        total: cartTotal * 1.08,
        orderType: 'kiosk',
        orderNumber: num,
        customerPhone: customerPhone || null,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: serverTimestamp(),
      });
      setOrderNumber(num);
      setOrderPlaced(true);
      setCart([]);
      setShowPayment(false);
      setShowCart(false);
      // Reset after 10 seconds
      setTimeout(() => {
        setOrderPlaced(false);
        setOrderNumber('');
        setCustomerPhone('');
      }, 10000);
    } catch (e) {
      console.error('Failed to place order:', e);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <h1 className="text-4xl font-black">404</h1>
      </div>
    );
  }

  // Order placed confirmation
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-8">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <FaCheck className="text-5xl text-white" />
          </motion.div>
          <h1 className="text-5xl font-black text-white mb-4">Order Placed!</h1>
          <p className="text-2xl text-zinc-400 mb-8">Your order number</p>
          <div className="inline-block px-12 py-6 bg-zinc-900 rounded-3xl border border-zinc-800">
            <p className="text-6xl font-black text-purple-400 font-mono">{orderNumber}</p>
          </div>
          {customerPhone && (
            <p className="text-zinc-500 mt-6 text-lg">
              We&apos;ll text you at <span className="text-white font-bold">{customerPhone}</span> when it&apos;s ready
            </p>
          )}
          <p className="text-zinc-600 mt-8 text-sm">This screen will reset in a few seconds...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="bg-zinc-900/80 backdrop-blur border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">{business.businessName}</h1>
          <p className="text-sm text-zinc-500">Tap to order • Quick & Easy</p>
        </div>
        <button
          onClick={() => setShowCart(true)}
          className="relative flex items-center gap-3 px-6 py-3 bg-purple-600 rounded-2xl font-bold text-lg shadow-xl shadow-purple-500/20"
        >
          <FaShoppingCart />
          ${cartTotal.toFixed(2)}
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-xs font-black">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Category sidebar */}
        <div className="w-32 bg-zinc-900/50 border-r border-zinc-800 overflow-y-auto py-2">
          {categories.map(cat => {
            const Icon = CATEGORY_ICONS[cat] || FaUtensils;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`w-full py-4 px-3 text-center transition-all ${
                  activeCategory === cat
                    ? 'bg-purple-600/20 border-r-4 border-purple-500 text-white'
                    : 'text-zinc-500 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <Icon className="text-xl mx-auto mb-1" />
                <p className="text-xs font-bold truncate">{cat}</p>
              </button>
            );
          })}
        </div>

        {/* Menu grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Search */}
          <div className="relative mb-6">
            <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 text-lg" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search menu..."
              className="w-full pl-14 pr-6 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-white text-lg font-medium focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map(item => {
              const inCart = cart.find(c => c.id === item.id);
              return (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addToCart(item)}
                  className={`bg-zinc-900 rounded-2xl p-5 border-2 text-left transition-all ${
                    inCart ? 'border-purple-500 shadow-lg shadow-purple-500/10' : 'border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  {item.image && (
                    <div className="w-full aspect-square bg-zinc-800 rounded-xl mb-3 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <p className="font-bold text-white text-lg mb-1 line-clamp-2">{item.name}</p>
                  {item.description && (
                    <p className="text-xs text-zinc-500 mb-2 line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xl font-black text-purple-400">${item.price.toFixed(2)}</p>
                    {inCart && (
                      <span className="px-3 py-1 bg-purple-600 rounded-full text-sm font-black">
                        ×{inCart.quantity}
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-20">
              <FaSearch className="text-4xl text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 font-bold text-lg">No items found</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50"
            onClick={() => setShowCart(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute right-0 top-0 h-full w-full max-w-md bg-zinc-900 border-l border-zinc-800 flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
                <button onClick={() => setShowCart(false)} className="text-zinc-400 hover:text-white">
                  <FaArrowLeft className="text-lg" />
                </button>
                <h2 className="text-xl font-black">Your Order</h2>
                <span className="text-sm text-zinc-500">{cartCount} items</span>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center py-16">
                    <FaShoppingCart className="text-4xl text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-500 font-bold">Cart is empty</p>
                    <p className="text-zinc-600 text-sm">Tap items to add them</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="bg-zinc-800/50 rounded-xl p-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white truncate">{item.name}</p>
                        <p className="text-sm text-purple-400 font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-9 h-9 bg-zinc-700 rounded-lg flex items-center justify-center text-zinc-300 hover:bg-zinc-600"
                        >
                          <FaMinus className="text-xs" />
                        </button>
                        <span className="w-8 text-center font-black text-lg">{item.quantity}</span>
                        <button
                          onClick={() => addToCart(item)}
                          className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center text-white hover:bg-purple-500"
                        >
                          <FaPlus className="text-xs" />
                        </button>
                        <button
                          onClick={() => deleteFromCart(item.id)}
                          className="w-9 h-9 bg-red-600/20 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-600 hover:text-white ml-1"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-zinc-800 space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-zinc-400">
                      <span>Subtotal</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Tax</span>
                      <span>${(cartTotal * 0.08).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white font-black text-lg pt-2 border-t border-zinc-700">
                      <span>Total</span>
                      <span>${(cartTotal * 1.08).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Phone for notifications */}
                  <div>
                    <label className="text-xs text-zinc-500 font-bold block mb-1">Phone (for order updates)</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      className="w-full px-4 py-3 bg-zinc-800 rounded-xl text-white font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>

                  <button
                    onClick={placeOrder}
                    className="w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-black text-xl shadow-xl shadow-purple-500/20"
                  >
                    Place Order — ${(cartTotal * 1.08).toFixed(2)}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
