/**
 * QuickOrderModal — Compact inline ordering experience
 *
 * A sleek centered modal (not full-screen) that lets customers
 * browse the menu, add items, and pay — fast and attractive.
 * Supports Card (Stripe) + Crypto (inline white-label) + Cash.
 */

'use client';

import { useState, useEffect, useMemo, useCallback, useRef, type MouseEvent as ReactMouseEvent } from 'react';
import { collection, query, getDocs, addDoc, orderBy, doc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { authFetch } from '@/lib/authFetch';
import type { MohnMenuBusiness } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTimes, FaPlus, FaMinus, FaTrash, FaCheck,
  FaMotorcycle, FaStore, FaSearch, FaFire, FaShoppingCart,
  FaCreditCard, FaLock, FaArrowRight, FaArrowLeft, FaBitcoin,
  FaCopy, FaUtensils, FaCalendarAlt, FaUserTie, FaUsers, FaStar,
} from 'react-icons/fa';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { QRCodeSVG } from 'qrcode.react';

// ─── Supported Crypto Options (client-side display config) ──

interface CryptoOption {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  color: string;
}

const SUPPORTED_CRYPTOS: CryptoOption[] = [
  { id: 'btc',        name: 'Bitcoin',       symbol: 'BTC',  icon: '₿', color: '#F7931A' },
  { id: 'eth',        name: 'Ethereum',      symbol: 'ETH',  icon: 'Ξ', color: '#627EEA' },
  { id: 'usdttrc20',  name: 'USDT (TRC20)',  symbol: 'USDT', icon: '₮', color: '#26A17B' },
  { id: 'sol',        name: 'Solana',        symbol: 'SOL',  icon: '◎', color: '#9945FF' },
  { id: 'usdcsol',    name: 'USDC (SOL)',    symbol: 'USDC', icon: '$', color: '#2775CA' },
  { id: 'ltc',        name: 'Litecoin',      symbol: 'LTC',  icon: 'Ł', color: '#BFBBBB' },
  { id: 'doge',       name: 'Dogecoin',      symbol: 'DOGE', icon: 'Ð', color: '#C2A633' },
  { id: 'trx',        name: 'TRON',          symbol: 'TRX',  icon: '⟁', color: '#FF0013' },
];

// ─── Crypto payment response shape ───────────────────────────

interface CryptoPaymentData {
  paymentId: string;
  payAddress: string;
  payAmount: number;
  payCurrency: string;
  priceAmount: number;
  priceCurrency: string;
  payinExtraId: string | null;
  expirationEstimate: string;
  status: string;
}

/**
 * Build a proper cryptocurrency URI for QR codes.
 * Using the standard URI scheme (BIP-21 for Bitcoin, EIP-681 for Ethereum, etc.)
 * allows mobile wallets like Cash App, Coinbase, Trust Wallet, etc.
 * to auto-detect the QR and prompt the user to open the app.
 */
function buildCryptoUri(address: string, amount: number, currency: string): string {
  const id = currency.toLowerCase();
  // Bitcoin (BIP-21) — triggers Cash App, Strike, Muun, etc.
  if (id === 'btc') return `bitcoin:${address}?amount=${amount}`;
  // Litecoin
  if (id === 'ltc') return `litecoin:${address}?amount=${amount}`;
  // Dogecoin
  if (id === 'doge') return `dogecoin:${address}?amount=${amount}`;
  // Ethereum & ERC-20 tokens (EIP-681)
  if (id === 'eth') return `ethereum:${address}?value=${amount}`;
  // For all others (USDT, USDC, SOL, TRX, XRP…) use raw address
  // — most wallets still detect the address from a plain QR
  return address;
}

/** Check if a coin supports native URI scheme (deep-link capable) */
function hasCryptoUriScheme(currency: string): boolean {
  return ['btc', 'ltc', 'doge', 'eth'].includes(currency.toLowerCase());
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

// ─── Types ─────────────────────────────────────────────────

interface MenuItem {
  id: string;
  category: string;
  name: string;
  description: string;
  prices: Record<string, number>;
  image_url?: string;
  isSpicy?: boolean;
  popular?: boolean;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  note?: string;
}

// ─── Helpers ───────────────────────────────────────────────

const SIZE_LABELS: Record<string, string> = {
  sm: 'S', small: 'S', lg: 'L', large: 'L',
  pt: 'Pt', qt: 'Qt', order: '', half: '½', full: 'Full',
};

function fmtSize(key: string) {
  return SIZE_LABELS[key.toLowerCase()] || key.charAt(0).toUpperCase() + key.slice(1);
}

function defaultKey(p: Record<string, number>) {
  const k = Object.keys(p);
  return k.length === 1 ? k[0] : p['order'] !== undefined ? 'order' : k[0];
}

function lowest(p: Record<string, number>) {
  return Math.min(...Object.values(p));
}

async function loadMenu(businessId: string): Promise<MenuItem[]> {
  try {
    const snap = await getDocs(
      query(collection(db, 'businesses', businessId, 'menuItems'), orderBy('category'))
    );
    if (!snap.empty) {
      return snap.docs
        .map(d => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data = d.data() as any;
          let prices: Record<string, number> = data.prices;
          if (!prices || typeof prices !== 'object' || Object.keys(prices).length === 0)
            prices = { order: Number(data.price) || 0 };
          return {
            id: d.id,
            category: data.category || '',
            name: data.name || '',
            description: data.description || '',
            prices,
            image_url: data.image_url || data.image,
            isSpicy: data.isSpicy || data.spicy,
            popular: data.popular,
          };
        })
        .filter(i => (i as MenuItem & { available?: boolean }).available !== false);
    }
  } catch {
    /* fall through */
  }
  try {
    const mod = await import('@/data/menu.json');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((mod.default || mod) as any[]).map(i => ({
      id: String(i.id),
      category: String(i.category || ''),
      name: String(i.name || ''),
      description: String(i.description || ''),
      prices: Object.fromEntries(
        Object.entries(i.prices || {}).filter(([, v]) => v != null)
      ) as Record<string, number>,
      image_url: i.image_url,
      isSpicy: i.isSpicy,
      popular: i.popular,
    }));
  } catch {
    /* ignore */
  }
  return [];
}

// ═══════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

type Step = 'menu' | 'checkout' | 'payment' | 'done';

export default function QuickOrderModal({
  business,
  isOpen,
  onClose,
}: {
  business: MohnMenuBusiness & { businessId: string };
  isOpen: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>('menu');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [search, setSearch] = useState('');

  // ── Desktop drag-scroll for category pills ──
  const catScrollRef = useRef<HTMLDivElement>(null);
  const catDragState = useRef({ isDown: false, startX: 0, scrollLeft: 0, hasDragged: false });
  const handleCatMouseDown = (e: ReactMouseEvent) => {
    const el = catScrollRef.current; if (!el) return;
    catDragState.current = { isDown: true, startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft, hasDragged: false };
    el.style.cursor = 'grabbing';
  };
  const handleCatMouseUp = () => {
    catDragState.current.isDown = false;
    if (catScrollRef.current) catScrollRef.current.style.cursor = 'grab';
  };
  const handleCatMouseMove = (e: ReactMouseEvent) => {
    if (!catDragState.current.isDown) return;
    e.preventDefault();
    const el = catScrollRef.current; if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - catDragState.current.startX) * 1.5;
    if (Math.abs(walk) > 3) catDragState.current.hasDragged = true;
    el.scrollLeft = catDragState.current.scrollLeft - walk;
  };
  const [cart, setCart] = useState<CartItem[]>([]);

  // Item detail
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [itemNote, setItemNote] = useState('');

  // Checkout
  const [orderType, setOrderType] = useState<'delivery' | 'pickup' | 'dine-in'>('pickup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto' | 'cash'>('card');
  const [tip, setTip] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Dine-in / reservation
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [seatingPreference, setSeatingPreference] = useState('Indoor');

  // Staff assignment
  interface StaffMember { id: string; name: string; role: string; specialty?: string; isFavorite?: boolean; }
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const isDineInType = ['bar_grill', 'restaurant', 'chinese_restaurant'].includes(business.type);

  // Payment
  const [clientSecret, setClientSecret] = useState('');
  const [pendingOrderId, setPendingOrderId] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [orderId, setOrderId] = useState('');

  // Inline crypto payment
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption>(SUPPORTED_CRYPTOS[0]);
  const [cryptoPayment, setCryptoPayment] = useState<CryptoPaymentData | null>(null);
  const [cryptoStatus, setCryptoStatus] = useState<string>('');
  const [cryptoCopied, setCryptoCopied] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load menu
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    loadMenu(business.businessId).then(items => {
      setMenuItems(items);
      setLoading(false);
    });
  }, [isOpen, business.businessId]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) setTimeout(() => { setStep('menu'); setSearch(''); setSelectedItem(null); }, 300);
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const categories = useMemo(
    () => [...new Set(menuItems.map(i => i.category))],
    [menuItems]
  );

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) setActiveCategory(categories[0]);
  }, [categories, activeCategory]);

  const filtered = useMemo(() => {
    if (search.trim()) {
      const s = search.toLowerCase();
      return menuItems.filter(
        i =>
          i.name.toLowerCase().includes(s) ||
          i.description.toLowerCase().includes(s) ||
          i.category.toLowerCase().includes(s)
      );
    }
    return activeCategory ? menuItems.filter(i => i.category === activeCategory) : menuItems;
  }, [menuItems, search, activeCategory]);

  // ─── Cart operations ───────────────────────────────────

  const addToCart = useCallback(
    (item: MenuItem, size: string, qty: number, note: string) => {
      setCart(prev => [
        ...prev,
        {
          id: `${item.id}-${size}-${Date.now()}`,
          name: item.name,
          price: item.prices[size] ?? lowest(item.prices),
          quantity: qty,
          size: Object.keys(item.prices).length > 1 ? fmtSize(size) : undefined,
          note: note || undefined,
        },
      ]);
    },
    []
  );

  const removeFromCart = useCallback(
    (id: string) => setCart(prev => prev.filter(i => i.id !== id)),
    []
  );

  const updateQty = useCallback(
    (id: string, d: number) =>
      setCart(prev =>
        prev.map(i => (i.id === id ? { ...i, quantity: Math.max(1, i.quantity + d) } : i))
      ),
    []
  );

  // Load staff on duty (real-time)
  useEffect(() => {
    if (!isDineInType) return;
    const ref = collection(db, 'businesses', business.businessId, 'staffOnDuty');
    const unsub = onSnapshot(ref, snap => {
      if (!snap.empty) {
        const onDuty = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as StaffMember & { onDuty?: boolean }))
          .filter(s => s.onDuty !== false);
        setStaffList(onDuty);
      } else {
        setStaffList([]);
      }
    });
    return () => unsub();
  }, [business.businessId, isDineInType]);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const taxRate = business.settings?.pricing?.taxRate ?? 0.07;
  const taxAmount = subtotal * taxRate;
  const deliveryFee =
    orderType === 'delivery' ? (business.settings?.pricing?.deliveryFee ?? 3.99) : 0;
  const total = subtotal + taxAmount + deliveryFee + tip;
  const cashAllowed = business.settings?.cashPaymentsEnabled !== false;

  useEffect(() => {
    if (!cashAllowed && paymentMethod === 'cash') setPaymentMethod('card');
  }, [cashAllowed, paymentMethod]);

  // Quick add single-price items
  const handleQuickAdd = useCallback(
    (item: MenuItem) => {
      const keys = Object.keys(item.prices);
      if (keys.length === 1) {
        addToCart(item, keys[0], 1, '');
      } else {
        setSelectedItem(item);
        setSelectedSize(defaultKey(item.prices));
        setItemQty(1);
        setItemNote('');
      }
    },
    [addToCart]
  );

  const confirmAdd = useCallback(() => {
    if (!selectedItem) return;
    addToCart(
      selectedItem,
      selectedSize || defaultKey(selectedItem.prices),
      itemQty,
      itemNote
    );
    setSelectedItem(null);
  }, [selectedItem, selectedSize, itemQty, itemNote, addToCart]);

  // ─── Place order ────────────────────────────────────────

  const handlePlaceOrder = async () => {
    if (cart.length === 0 || !name || !phone) return;
    if (orderType === 'delivery' && !address) {
      alert('Please enter a delivery address.');
      return;
    }
    if (orderType === 'dine-in' && (!reservationDate || !reservationTime)) {
      alert('Please select a date and time for your reservation.');
      return;
    }
    setSubmitting(true);
    setPaymentError('');

    const orderData = {
      businessId: business.businessId,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      items: cart.map(i => ({
        menuItemId: i.id.split('-')[0],
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.price,
        priceSize: i.size || 'order',
        specialInstructions: i.note || '',
        lineTotal: i.price * i.quantity,
      })),
      orderType,
      status: 'pending',
      deliveryAddress: orderType === 'delivery' ? address : undefined,
      deliveryInstructions: orderType === 'delivery' ? instructions : undefined,
      ...(orderType === 'dine-in' ? {
        reservation: {
          date: reservationDate,
          time: reservationTime,
          partySize,
          seatingPreference,
        },
        assignedStaffId: selectedStaff || undefined,
        assignedStaffName: staffList.find(s => s.id === selectedStaff)?.name || undefined,
      } : {}),
      subtotal,
      taxAmount,
      taxRate,
      deliveryFee,
      tip,
      total,
      paymentMethod,
      paymentStatus:
        paymentMethod === 'card'
          ? 'awaiting_payment'
          : paymentMethod === 'crypto'
          ? 'awaiting_crypto'
          : 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const docRef = await addDoc(
        collection(db, 'businesses', business.businessId, 'orders'),
        orderData
      );
      await setDoc(doc(db, 'trackingLinks', docRef.id), {
        businessId: business.businessId,
        orderId: docRef.id,
        createdAt: new Date().toISOString(),
      });

      if (paymentMethod === 'card') {
        const res = await authFetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: Math.round(total * 100),
            orderId: docRef.id,
            businessId: business.businessId,
            ownerStripeAccountId: business.stripeAccountId || undefined,
            customerEmail: email,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Payment setup failed');
        await updateDoc(
          doc(db, 'businesses', business.businessId, 'orders', docRef.id),
          { stripePaymentIntentId: data.paymentIntentId }
        );
        setPendingOrderId(docRef.id);
        setClientSecret(data.clientSecret);
        setStep('payment');
        setSubmitting(false);
        return;
      }

      if (paymentMethod === 'crypto') {
        // Inline white-label crypto payment — get deposit address directly
        const res = await authFetch('/api/crypto/create-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: docRef.id,
            businessId: business.businessId,
            amount: parseFloat(total.toFixed(2)),
            payCurrency: selectedCrypto.id,
            businessName: business.name,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Crypto payment setup failed');

        await updateDoc(
          doc(db, 'businesses', business.businessId, 'orders', docRef.id),
          {
            'cryptoPayment.paymentId': data.paymentId,
            'cryptoPayment.payAddress': data.payAddress,
            'cryptoPayment.payAmount': data.payAmount,
            'cryptoPayment.payCurrency': data.payCurrency,
          }
        );
        setPendingOrderId(docRef.id);
        setCryptoPayment(data as CryptoPaymentData);
        setCryptoStatus(data.status || 'waiting');
        setStep('payment');
        setSubmitting(false);
        return;
      }

      // Cash
      setOrderId(docRef.id);
      setStep('done');
      setCart([]);
    } catch (err) {
      console.error(err);
      alert('Failed to place order.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      await updateDoc(
        doc(db, 'businesses', business.businessId, 'orders', pendingOrderId),
        { paymentStatus: 'paid', status: 'confirmed', updatedAt: new Date().toISOString() }
      );
    } catch {
      /* ok */
    }
    setOrderId(pendingOrderId);
    setStep('done');
    setCart([]);
  };

  const handleCryptoComplete = async () => {
    // Stop polling
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    try {
      await updateDoc(
        doc(db, 'businesses', business.businessId, 'orders', pendingOrderId),
        {
          paymentStatus: 'paid_crypto',
          status: 'confirmed',
          updatedAt: new Date().toISOString(),
        }
      );
    } catch {
      /* ok */
    }
    setOrderId(pendingOrderId);
    setStep('done');
    setCart([]);
    setCryptoPayment(null);
    setCryptoStatus('');
  };

  // ─── Crypto payment polling ──────────────────────────────

  useEffect(() => {
    if (step !== 'payment' || paymentMethod !== 'crypto' || !cryptoPayment?.paymentId) return;

    const poll = async () => {
      try {
        const res = await authFetch(`/api/crypto/create-payment?paymentId=${cryptoPayment.paymentId}`);
        if (!res.ok) return;
        const data = await res.json();
        const status = data.status as string;
        setCryptoStatus(status);

        if (status === 'finished') {
          // Payment confirmed — auto-advance
          handleCryptoComplete();
        } else if (['failed', 'expired', 'refunded'].includes(status)) {
          setCryptoStatus(status);
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        }
      } catch {
        /* poll silently */
      }
    };

    // Poll every 8 seconds
    poll();
    pollRef.current = setInterval(poll, 8000);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, paymentMethod, cryptoPayment?.paymentId]);

  // Copy address to clipboard
  const copyAddress = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCryptoCopied(true);
      setTimeout(() => setCryptoCopied(false), 2000);
    } catch {
      /* fallback */
    }
  }, []);

  // ═══════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════

  if (!isOpen) return null;

  return (
    <>
      {/* ── Backdrop ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* ── Close button — always visible, top-right, above header ── */}
      <button
        onClick={onClose}
        className="fixed top-5 right-5 z-[130] w-10 h-10 bg-white hover:bg-zinc-100 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 cursor-pointer border border-zinc-200"
        aria-label="Close Quick Order"
      >
        <FaTimes className="text-zinc-700 text-sm" />
      </button>

      {/* ══ Modal — compact, centered, above header ══ */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="fixed inset-x-4 top-4 bottom-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[480px] sm:h-[85vh] sm:max-h-[720px] z-[120] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header bar ── */}
        <div className="shrink-0 bg-gradient-to-r from-zinc-900 to-zinc-800 text-white px-5 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {step !== 'menu' && step !== 'done' && (
                <button
                  onClick={() => setStep(step === 'payment' ? 'checkout' : 'menu')}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="Back"
                >
                  <FaArrowLeft className="text-[10px]" />
                </button>
              )}
              <div>
                <h2 className="text-sm font-black tracking-tight leading-none">
                  {step === 'menu' && '⚡ Quick Order'}
                  {step === 'checkout' && '📋 Checkout'}
                  {step === 'payment' && '💳 Payment'}
                  {step === 'done' && '✅ Confirmed'}
                </h2>
                <p className="text-[10px] text-white/50 font-medium mt-0.5">
                  {business.name}
                </p>
              </div>
            </div>

            {step === 'menu' && cartCount > 0 && (
              <button
                onClick={() => setStep('checkout')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black rounded-lg text-[11px] font-black hover:bg-zinc-100 transition-all"
              >
                <FaShoppingCart className="text-[9px]" /> {cartCount} · ${subtotal.toFixed(2)}
              </button>
            )}
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* ════════ MENU STEP ════════ */}
          {step === 'menu' && (
            <>
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-7 h-7 border-[3px] border-zinc-200 border-t-black rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* Search bar */}
                  <div className="px-4 pt-3 pb-2">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300 text-[11px]" />
                      <input
                        type="text"
                        value={search}
                        onChange={e => {
                          setSearch(e.target.value);
                          if (e.target.value) setActiveCategory('');
                        }}
                        placeholder="Search menu..."
                        className="w-full pl-8 pr-8 py-2 bg-zinc-50 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-black/10"
                      />
                      {search && (
                        <button
                          onClick={() => setSearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                          aria-label="Clear"
                        >
                          <FaTimes className="text-[9px]" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Category pills — redesigned with glassmorphic 3D look */}
                  {!search && (
                    <div className="px-4 pb-2">
                      <div className="relative">
                        <div
                          ref={catScrollRef}
                          className="overflow-x-auto scrollbar-none scroll-smooth cursor-grab select-none"
                          style={{ scrollbarWidth: 'none' }}
                          onMouseDown={handleCatMouseDown}
                          onMouseUp={handleCatMouseUp}
                          onMouseLeave={handleCatMouseUp}
                          onMouseMove={handleCatMouseMove}
                        >
                          <div className="flex gap-2 pb-1">
                            {categories.map((cat, i) => (
                              <button
                                key={cat}
                                onClick={() => { if (!catDragState.current.hasDragged) setActiveCategory(cat); }}
                                className={`shrink-0 px-4 py-2 rounded-xl text-[11px] font-bold transition-all duration-300 whitespace-nowrap border ${
                                  activeCategory === cat
                                    ? 'bg-gradient-to-r from-zinc-900 to-zinc-800 text-white border-zinc-700 shadow-lg shadow-black/20 scale-[1.02]'
                                    : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 hover:shadow-md hover:scale-[1.02] active:scale-95'
                                }`}
                                style={activeCategory === cat ? {} : {
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)'
                                }}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        </div>
                        {/* Fade hints on edges */}
                        <div className="absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
                        <div className="absolute left-0 top-0 bottom-1 w-4 bg-gradient-to-r from-white to-transparent pointer-events-none" />
                      </div>
                    </div>
                  )}

                  {/* Menu items */}
                  <div className="px-4 pb-4 space-y-1.5">
                    {search && (
                      <p className="text-[10px] text-zinc-400 font-medium mb-1">
                        {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                      </p>
                    )}
                    {filtered.map(item => {
                      const lo = lowest(item.prices);
                      const multi = Object.keys(item.prices).length > 1;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleQuickAdd(item)}
                          className="w-full text-left flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-50 active:bg-zinc-100 transition-all group"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-black truncate">
                                {item.name}
                              </span>
                              {item.isSpicy && (
                                <FaFire className="text-red-500 text-[9px] shrink-0" />
                              )}
                              {item.popular && (
                                <span className="text-[8px] font-black uppercase bg-amber-100 text-amber-700 px-1 py-0.5 rounded shrink-0">
                                  HOT
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                                {item.description}
                              </p>
                            )}
                            {multi && (
                              <div className="flex gap-1 mt-1 flex-wrap">
                                {Object.entries(item.prices).map(([k, v]) => (
                                  <span
                                    key={k}
                                    className="text-[9px] font-medium bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded"
                                  >
                                    {fmtSize(k)} ${(v as number).toFixed(2)}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-black text-xs">
                              {multi ? (
                                <span className="text-[9px] text-zinc-400">from </span>
                              ) : null}
                              ${lo.toFixed(2)}
                            </span>
                            <span className="w-6 h-6 rounded-md bg-black text-white flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                              <FaPlus className="text-[8px]" />
                            </span>
                          </div>
                        </button>
                      );
                    })}
                    {filtered.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-zinc-300 text-3xl mb-2">🍜</p>
                        <p className="text-zinc-400 font-medium text-xs">No items found</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {/* ════════ CHECKOUT STEP ════════ */}
          {step === 'checkout' && (
            <div className="p-4 space-y-4">
              {/* Cart items */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                  Your Order ({cartCount})
                </p>
                <div className="space-y-1.5">
                  {cart.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 bg-zinc-50 rounded-xl p-2.5"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs truncate">
                          {item.name}
                          {item.size && (
                            <span className="text-zinc-400 font-medium"> · {item.size}</span>
                          )}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="w-6 h-6 rounded-md bg-white border border-zinc-200 flex items-center justify-center text-[9px] hover:bg-zinc-100"
                          aria-label="Less"
                        >
                          <FaMinus />
                        </button>
                        <span className="w-5 text-center text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="w-6 h-6 rounded-md bg-white border border-zinc-200 flex items-center justify-center text-[9px] hover:bg-zinc-100"
                          aria-label="More"
                        >
                          <FaPlus />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-6 h-6 rounded-md bg-red-50 text-red-400 flex items-center justify-center text-[9px] hover:bg-red-100 ml-0.5"
                          aria-label="Remove"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setStep('menu')}
                  className="mt-2 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <FaPlus className="text-[8px]" /> Add more
                </button>
              </div>

              {/* Order type */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                  Order Type
                </p>
                <div className={`grid gap-1.5 ${isDineInType ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  <button
                    onClick={() => setOrderType('pickup')}
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                      orderType === 'pickup'
                        ? 'bg-black text-white'
                        : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                    }`}
                  >
                    <FaStore className="text-[10px]" /> Pickup
                  </button>
                  <button
                    onClick={() => setOrderType('delivery')}
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                      orderType === 'delivery'
                        ? 'bg-black text-white'
                        : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                    }`}
                  >
                    <FaMotorcycle className="text-[10px]" /> Delivery
                  </button>
                  {isDineInType && (
                    <button
                      onClick={() => setOrderType('dine-in')}
                      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                        orderType === 'dine-in'
                          ? 'bg-purple-600 text-white'
                          : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                      }`}
                    >
                      <FaUtensils className="text-[10px]" /> Dine-In
                    </button>
                  )}
                </div>
              </div>

              {/* Dine-in reservation details */}
              {orderType === 'dine-in' && (
                <div className="bg-purple-50 rounded-2xl p-3.5 border border-purple-100 space-y-2.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-purple-600 flex items-center gap-1.5">
                    <FaCalendarAlt className="text-[9px]" /> Reservation Details
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="date"
                      value={reservationDate}
                      onChange={e => setReservationDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-purple-400"
                    />
                    <select
                      value={reservationTime}
                      onChange={e => setReservationTime(e.target.value)}
                      className="px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-purple-400"
                    >
                      <option value="">Time</option>
                      {['11:00 AM','11:30 AM','12:00 PM','12:30 PM','1:00 PM','1:30 PM','2:00 PM',
                        '4:00 PM','4:30 PM','5:00 PM','5:30 PM','6:00 PM','6:30 PM','7:00 PM',
                        '7:30 PM','8:00 PM','8:30 PM','9:00 PM','9:30 PM','10:00 PM','10:30 PM',
                      ].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaUsers className="text-purple-500 text-xs" />
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5,6].map(n => (
                        <button
                          key={n}
                          onClick={() => setPartySize(n)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                            partySize === n
                              ? 'bg-purple-600 text-white'
                              : 'bg-white text-zinc-500 border border-purple-200 hover:border-purple-400'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                      <span className="text-[10px] text-purple-400 font-bold ml-1">guests</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {['Indoor', 'Patio', 'Bar', 'VIP'].map(s => (
                      <button
                        key={s}
                        onClick={() => setSeatingPreference(s)}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                          seatingPreference === s
                            ? 'bg-purple-600 text-white'
                            : 'bg-white text-zinc-500 border border-purple-200 hover:border-purple-400'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  {/* Send to specific staff */}
                  {staffList.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-purple-500 mb-1.5 flex items-center gap-1">
                        <FaUserTie className="text-[8px]" /> Send to Staff (optional)
                      </p>
                      <div className="space-y-1">
                        <button
                          onClick={() => setSelectedStaff('')}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            !selectedStaff ? 'bg-purple-600 text-white' : 'bg-white border border-purple-200 text-zinc-600 hover:border-purple-400'
                          }`}
                        >
                          Anyone available
                        </button>
                        {staffList.map(s => (
                          <button
                            key={s.id}
                            onClick={() => setSelectedStaff(s.id)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                              selectedStaff === s.id ? 'bg-purple-600 text-white' : 'bg-white border border-purple-200 text-zinc-600 hover:border-purple-400'
                            }`}
                          >
                            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-[10px] font-black shrink-0">
                              {s.name.charAt(0)}
                            </span>
                            <span className="flex-1 text-left">
                              <span className="font-bold">{s.name}</span>
                              {s.specialty && <span className="text-[10px] opacity-60 ml-1">• {s.specialty}</span>}
                            </span>
                            <span className="text-[10px] opacity-50 capitalize">{s.role}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Contact info */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                  Your Info
                </p>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Name *"
                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-100 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-black/10"
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Phone *"
                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-100 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-black/10"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email (receipt)"
                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-100 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-black/10"
                  />
                </div>
              </div>

              {/* Delivery address */}
              {orderType === 'delivery' && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                    Delivery
                  </p>
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder="Address *"
                      className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-100 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-black/10"
                    />
                    <input
                      type="text"
                      value={instructions}
                      onChange={e => setInstructions(e.target.value)}
                      placeholder="Instructions"
                      className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-100 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-black/10"
                    />
                  </div>
                </div>
              )}

              {/* Payment method selection */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                  Payment
                </p>
                <div className={`grid gap-1.5 ${cashAllowed ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      paymentMethod === 'card'
                        ? 'bg-black text-white'
                        : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                    }`}
                  >
                    <FaCreditCard className="text-[9px]" /> Card
                  </button>
                  <button
                    onClick={() => setPaymentMethod('crypto')}
                    className={`py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      paymentMethod === 'crypto'
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                        : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                    }`}
                  >
                    <FaBitcoin className="text-[9px]" /> Crypto
                  </button>
                  {cashAllowed && (
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`py-2.5 rounded-xl font-bold text-xs transition-all ${
                        paymentMethod === 'cash'
                          ? 'bg-black text-white'
                          : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                      }`}
                    >
                      💵 Cash
                    </button>
                  )}
                </div>

                {paymentMethod === 'crypto' && (
                  <div className="mt-2 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      Select Coin
                    </p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {SUPPORTED_CRYPTOS.map(c => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedCrypto(c)}
                          className={`py-2 px-1 rounded-xl text-[10px] font-bold transition-all flex flex-col items-center gap-0.5 ${
                            selectedCrypto.id === c.id
                              ? 'ring-2 ring-offset-1 text-white'
                              : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                          }`}
                          style={
                            selectedCrypto.id === c.id
                              ? { backgroundColor: c.color, '--tw-ring-color': c.color } as React.CSSProperties
                              : undefined
                          }
                        >
                          <span className="text-sm leading-none">{c.icon}</span>
                          <span>{c.symbol}</span>
                        </button>
                      ))}
                    </div>
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-xl p-2.5">
                      <p className="text-[10px] font-bold text-orange-700">
                        ⚡ Pay with {selectedCrypto.name} —{' '}
                        <span className="text-orange-500">0% fees · Instant settlement</span>
                      </p>
                      {selectedCrypto.id === 'btc' && (
                        <p className="text-[9px] text-orange-500/80 mt-0.5">
                          💲 Cash App users can scan the QR to pay with BTC
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Tip */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                  Tip
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 2, 3, 5].map(t => (
                    <button
                      key={t}
                      onClick={() => setTip(t)}
                      className={`py-2 rounded-xl font-bold text-xs transition-all ${
                        tip === t
                          ? 'bg-black text-white'
                          : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                      }`}
                    >
                      {t === 0 ? 'None' : `$${t}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order summary */}
              <div className="bg-zinc-50 rounded-xl p-3 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Subtotal</span>
                  <span className="font-bold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Tax ({(taxRate * 100).toFixed(0)}%)</span>
                  <span className="font-bold">${taxAmount.toFixed(2)}</span>
                </div>
                {orderType === 'delivery' && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Delivery</span>
                    <span className="font-bold">${deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                {tip > 0 && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Tip</span>
                    <span className="font-bold">${tip.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1.5 border-t border-zinc-200 text-sm">
                  <span className="font-black">Total</span>
                  <span className="font-black">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* ════════ PAYMENT STEP ════════ */}
          {step === 'payment' && (
            <div className="p-4 space-y-5">
              {paymentMethod === 'card' && clientSecret ? (
                <>
                  <div className="text-center py-3">
                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mx-auto mb-3">
                      <FaCreditCard className="text-white text-lg" />
                    </div>
                    <h3 className="text-base font-black">Complete Payment</h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      ${total.toFixed(2)} — #{pendingOrderId.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: {
                        theme: 'stripe',
                        variables: { colorPrimary: '#000', borderRadius: '10px' },
                      },
                    }}
                  >
                    <StripeForm
                      clientSecret={clientSecret}
                      total={total}
                      onSuccess={handlePaymentSuccess}
                      onError={setPaymentError}
                    />
                  </Elements>
                  {paymentError && (
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                      {paymentError}
                    </div>
                  )}
                </>
              ) : paymentMethod === 'crypto' ? (
                <>
                  <div className="text-center py-2">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 text-white text-lg font-bold"
                      style={{ backgroundColor: selectedCrypto.color }}
                    >
                      {selectedCrypto.icon}
                    </div>
                    <h3 className="text-sm font-black">
                      Pay with {selectedCrypto.name}
                    </h3>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      ${total.toFixed(2)} — #{pendingOrderId.slice(0, 8).toUpperCase()}
                    </p>
                  </div>

                  {cryptoPayment ? (
                    <div className="bg-zinc-900 rounded-2xl p-4 space-y-3">
                      {/* Status indicator */}
                      <div className="flex items-center justify-center gap-2">
                        {['waiting', 'confirming', 'confirmed', 'sending'].includes(cryptoStatus) ? (
                          <>
                            <div
                              className="w-2 h-2 rounded-full animate-pulse"
                              style={{ backgroundColor: selectedCrypto.color }}
                            />
                            <span className="text-white/70 text-[10px] font-bold uppercase tracking-wider">
                              {cryptoStatus === 'waiting'
                                ? 'Awaiting Payment'
                                : cryptoStatus === 'confirming'
                                ? 'Confirming...'
                                : cryptoStatus === 'confirmed'
                                ? 'Confirmed — Processing'
                                : 'Sending...'}
                            </span>
                          </>
                        ) : cryptoStatus === 'finished' ? (
                          <>
                            <FaCheck className="text-emerald-400 text-xs" />
                            <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                              Payment Complete
                            </span>
                          </>
                        ) : ['failed', 'expired'].includes(cryptoStatus) ? (
                          <span className="text-red-400 text-[10px] font-bold uppercase tracking-wider">
                            {cryptoStatus === 'expired' ? 'Payment Expired' : 'Payment Failed'}
                          </span>
                        ) : null}
                      </div>

                      {/* QR Code — uses proper URI scheme so Cash App / wallets auto-detect */}
                      <div className="flex justify-center">
                        <div className="bg-white p-2.5 rounded-xl">
                          <QRCodeSVG
                            value={buildCryptoUri(
                              cryptoPayment.payAddress,
                              cryptoPayment.payAmount,
                              cryptoPayment.payCurrency
                            )}
                            size={140}
                            level="M"
                            includeMargin={false}
                          />
                        </div>
                      </div>

                      {/* Cash App / wallet auto-open hint (BTC only — non-intrusive) */}
                      {cryptoPayment.payCurrency.toLowerCase() === 'btc' && (
                        <p className="text-center text-white/35 text-[9px] leading-tight">
                          📱 Cash App users — scan this QR to pay instantly
                        </p>
                      )}
                      {hasCryptoUriScheme(cryptoPayment.payCurrency) &&
                        cryptoPayment.payCurrency.toLowerCase() !== 'btc' && (
                        <p className="text-center text-white/30 text-[9px] leading-tight">
                          📱 Scan with any {selectedCrypto.name} wallet to pay
                        </p>
                      )}

                      {/* Amount to send */}
                      <div className="text-center">
                        <p className="text-white/50 text-[10px] uppercase tracking-widest mb-1">
                          Send Exactly
                        </p>
                        <p className="text-white text-lg font-black tracking-tight">
                          {cryptoPayment.payAmount}{' '}
                          <span
                            className="text-sm font-bold"
                            style={{ color: selectedCrypto.color }}
                          >
                            {cryptoPayment.payCurrency.toUpperCase()}
                          </span>
                        </p>
                        <p className="text-white/40 text-[10px] mt-0.5">
                          ≈ ${cryptoPayment.priceAmount.toFixed(2)} USD
                        </p>
                      </div>

                      {/* Deposit address */}
                      <div>
                        <p className="text-white/50 text-[10px] uppercase tracking-widest mb-1 text-center">
                          To Address
                        </p>
                        <button
                          onClick={() => copyAddress(cryptoPayment.payAddress)}
                          className="w-full flex items-center gap-2 bg-white/5 hover:bg-white/10 rounded-xl px-3 py-2.5 transition-all group"
                        >
                          <span className="flex-1 text-white/80 text-[10px] font-mono break-all text-left leading-relaxed">
                            {cryptoPayment.payAddress}
                          </span>
                          <span className="shrink-0">
                            {cryptoCopied ? (
                              <FaCheck className="text-emerald-400 text-xs" />
                            ) : (
                              <FaCopy className="text-white/30 group-hover:text-white/60 text-xs transition-colors" />
                            )}
                          </span>
                        </button>
                      </div>

                      {/* Memo/Tag (for XRP, XLM, etc.) */}
                      {cryptoPayment.payinExtraId && (
                        <div>
                          <p className="text-amber-400/80 text-[10px] uppercase tracking-widest mb-1 text-center font-bold">
                            ⚠ Memo / Tag (Required)
                          </p>
                          <button
                            onClick={() => copyAddress(cryptoPayment.payinExtraId!)}
                            className="w-full flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2.5"
                          >
                            <span className="flex-1 text-amber-300 text-xs font-mono text-left">
                              {cryptoPayment.payinExtraId}
                            </span>
                            <FaCopy className="text-amber-300/50 text-xs" />
                          </button>
                        </div>
                      )}

                      {/* Expiration countdown */}
                      {cryptoPayment.expirationEstimate && (
                        <CryptoCountdown expiration={cryptoPayment.expirationEstimate} />
                      )}

                      {/* Already paid / expired actions */}
                      {['failed', 'expired'].includes(cryptoStatus) ? (
                        <button
                          onClick={() => {
                            setCryptoPayment(null);
                            setCryptoStatus('');
                            setStep('checkout');
                          }}
                          className="w-full py-2.5 bg-white/10 text-white/70 rounded-xl font-bold text-xs hover:bg-white/20 transition-all"
                        >
                          ← Try Again
                        </button>
                      ) : (
                        <button
                          onClick={() => setStep('checkout')}
                          className="w-full py-2.5 bg-white/10 text-white/70 rounded-xl font-bold text-xs hover:bg-white/20 transition-all"
                        >
                          ← Back to checkout
                        </button>
                      )}

                      <p className="text-white/25 text-[9px] text-center">
                        0% fees · All major wallets supported
                      </p>
                    </div>
                  ) : (
                    <div className="bg-zinc-900 rounded-2xl p-6 text-center">
                      <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
                      <p className="text-white/40 text-[10px] mt-3">
                        Generating {selectedCrypto.name} payment...
                      </p>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          )}

          {/* ════════ DONE STEP ════════ */}
          {step === 'done' && (
            <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
                className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-5"
              >
                <FaCheck className="text-white text-xl" />
              </motion.div>
              <h3 className="text-xl font-black tracking-tight mb-1">Order Confirmed!</h3>
              <p className="text-zinc-400 text-xs mb-1">
                #{orderId.slice(0, 8).toUpperCase()}
              </p>
              <p className="text-zinc-400 text-xs max-w-[260px]">
                {orderType === 'dine-in'
                  ? `Table for ${partySize} — ${reservationDate} at ${reservationTime}. We'll have everything ready!`
                  : orderType === 'pickup'
                  ? "We're preparing your order now."
                  : 'Your order is being prepared for delivery.'}
              </p>
              {orderId && (
                <a
                  href={`/track-delivery/${orderId}`}
                  className="mt-5 px-5 py-2.5 bg-black text-white rounded-xl font-bold text-xs hover:bg-zinc-800 transition-all flex items-center gap-1.5"
                >
                  Track Order <FaArrowRight className="text-[9px]" />
                </a>
              )}
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2.5 text-zinc-400 font-medium text-xs hover:text-zinc-600 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* ── Bottom bar: menu step ── */}
        {step === 'menu' && cartCount > 0 && (
          <motion.div
            initial={{ y: 60 }}
            animate={{ y: 0 }}
            className="shrink-0 border-t border-zinc-100 bg-white px-4 py-3"
          >
            <button
              onClick={() => setStep('checkout')}
              className="w-full py-3 bg-black text-white rounded-xl font-bold text-xs hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
            >
              <FaShoppingCart className="text-[10px]" /> Checkout · {cartCount} item
              {cartCount !== 1 ? 's' : ''} · ${subtotal.toFixed(2)}{' '}
              <FaArrowRight className="text-[9px]" />
            </button>
          </motion.div>
        )}

        {/* ── Bottom bar: checkout step ── */}
        {step === 'checkout' && (
          <div className="shrink-0 border-t border-zinc-100 bg-white px-4 py-3">
            <button
              onClick={handlePlaceOrder}
              disabled={
                submitting ||
                cart.length === 0 ||
                !name ||
                !phone ||
                (orderType === 'delivery' && !address) ||
                (orderType === 'dine-in' && (!reservationDate || !reservationTime))
              }
              className="w-full py-3 bg-black text-white rounded-xl font-bold text-xs hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : paymentMethod === 'card' ? (
                <>
                  <FaLock className="text-[9px]" /> Pay ${total.toFixed(2)}
                </>
              ) : paymentMethod === 'crypto' ? (
                <>
                  <FaBitcoin className="text-[9px]" /> Pay ${total.toFixed(2)} with Crypto
                </>
              ) : (
                <>Place Order — ${total.toFixed(2)}</>
              )}
            </button>
          </div>
        )}

        {/* ── MohnMenu watermark — all steps ── */}
        <div className="shrink-0 py-2 text-center bg-gradient-to-r from-zinc-50 to-zinc-100 border-t border-zinc-100">
          <a
            href="https://mohnmenu.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 hover:text-orange-600 transition-colors"
          >
            <span className="w-3.5 h-3.5 rounded bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <span className="text-white font-black text-[6px] leading-none">M</span>
            </span>
            Powered by MohnMenu.com
          </a>
        </div>
      </motion.div>

      {/* ══ Item Detail Sheet ══ */}
      <AnimatePresence>
        {selectedItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[125] bg-black/30"
              onClick={() => setSelectedItem(null)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="fixed bottom-0 inset-x-0 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[400px] z-[135] bg-white rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-black">{selectedItem.name}</h3>
                  {selectedItem.description && (
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {selectedItem.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center hover:bg-zinc-200"
                  aria-label="Close"
                >
                  <FaTimes className="text-[10px]" />
                </button>
              </div>

              {/* Size selection */}
              {Object.keys(selectedItem.prices).length > 1 && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5">
                    Size
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.entries(selectedItem.prices).map(([k, v]) => (
                      <button
                        key={k}
                        onClick={() => setSelectedSize(k)}
                        className={`py-2 rounded-lg font-bold text-xs transition-all ${
                          (selectedSize || defaultKey(selectedItem.prices)) === k
                            ? 'bg-black text-white'
                            : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                        }`}
                      >
                        {fmtSize(k)} — ${(v as number).toFixed(2)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Qty
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setItemQty(q => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg border border-zinc-200 flex items-center justify-center hover:bg-zinc-100"
                    aria-label="Less"
                  >
                    <FaMinus className="text-[10px]" />
                  </button>
                  <span className="w-6 text-center font-black text-sm">{itemQty}</span>
                  <button
                    onClick={() => setItemQty(q => q + 1)}
                    className="w-8 h-8 rounded-lg border border-zinc-200 flex items-center justify-center hover:bg-zinc-100"
                    aria-label="More"
                  >
                    <FaPlus className="text-[10px]" />
                  </button>
                </div>
              </div>

              {/* Special instructions */}
              <input
                type="text"
                value={itemNote}
                onChange={e => setItemNote(e.target.value)}
                placeholder="Special instructions"
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-100 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-black/10"
              />

              {/* Add to cart button */}
              <button
                onClick={confirmAdd}
                className="w-full py-3 bg-black text-white rounded-xl font-bold text-xs hover:bg-zinc-800 transition-all"
              >
                Add — $
                {(
                  (selectedItem.prices[selectedSize || defaultKey(selectedItem.prices)] ??
                    lowest(selectedItem.prices)) * itemQty
                ).toFixed(2)}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Stripe Card Form ───────────────────────────────────────

function StripeForm({
  clientSecret,
  total,
  onSuccess,
  onError,
}: {
  clientSecret: string;
  total: number;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    onError('');

    const card = elements.getElement(CardElement);
    if (!card) {
      onError('Card not found');
      setProcessing(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    });

    if (error) {
      onError(error.message || 'Payment failed');
      setProcessing(false);
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess();
    } else {
      onError('Payment not completed.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="p-3 border border-zinc-200 rounded-xl bg-zinc-50">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '14px',
                color: '#09090b',
                fontFamily: 'system-ui, sans-serif',
                '::placeholder': { color: '#a1a1aa' },
              },
              invalid: { color: '#ef4444' },
            },
          }}
        />
      </div>
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full py-3 bg-black text-white rounded-xl font-bold text-xs hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
      >
        <FaLock className="text-[9px]" />{' '}
        {processing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
      </button>
    </form>
  );
}

// ─── Crypto Countdown Timer ─────────────────────────────────

function CryptoCountdown({ expiration }: { expiration: string }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const target = new Date(expiration).getTime();
    const tick = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiration]);

  if (!timeLeft) return null;

  const isLow = timeLeft !== 'Expired' && parseInt(timeLeft) < 5;

  return (
    <div className="text-center">
      <p className="text-white/40 text-[10px] uppercase tracking-widest mb-0.5">
        Time Remaining
      </p>
      <p
        className={`text-sm font-black font-mono ${
          timeLeft === 'Expired'
            ? 'text-red-400'
            : isLow
            ? 'text-amber-400'
            : 'text-white/70'
        }`}
      >
        {timeLeft}
      </p>
    </div>
  );
}
