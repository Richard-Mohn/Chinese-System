/**
 * Menu & Order Page — /order/{businessSlug}
 * 
 * Menufy-style ordering experience: browse full menu by category,
 * add items to cart with size/option selection, checkout with
 * delivery or pickup, pay with Stripe or cash.
 * 
 * Creates an order in businesses/{businessId}/orders/{orderId}
 */

'use client';

import { useState, useEffect, useMemo, useCallback, useRef, type MouseEvent as ReactMouseEvent } from 'react';
import { collection, query, where, getDocs, addDoc, orderBy, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { authFetch } from '@/lib/authFetch';
import type { MohnMenuBusiness } from '@/lib/types';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import { useCart, type CartItem } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaShoppingCart, FaPlus, FaMinus, FaTrash, FaTimes, FaCheck,
  FaMotorcycle, FaStore, FaSearch, FaFire, FaArrowLeft, FaCreditCard, FaLock,
  FaBitcoin, FaCopy, FaUtensils, FaCalendarAlt, FaUsers, FaClock, FaStar,
  FaConciergeBell, FaGlassCheers,
} from 'react-icons/fa';
import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { QRCodeSVG } from 'qrcode.react';
import LiveStaffSection from '@/components/LiveStaffSection';
import DemoBanner from '@/components/DemoBanner';
import {
  addToCartEvent, removeFromCartEvent, beginCheckout, purchase,
  viewItem, makeGtagItem, event as gtagEvent,
} from '@/lib/gtag';

// ─── Stripe setup (deferred — only loads when user reaches checkout) ──
let _stripePromise: ReturnType<typeof loadStripe> | null = null;
function getStripe() {
  if (!_stripePromise) _stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
  return _stripePromise;
}

// ─── Supported Crypto Options ──────────────────────────────

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

function buildCryptoUri(address: string, amount: number, currency: string): string {
  const id = currency.toLowerCase();
  if (id === 'btc') return `bitcoin:${address}?amount=${amount}`;
  if (id === 'ltc') return `litecoin:${address}?amount=${amount}`;
  if (id === 'doge') return `dogecoin:${address}?amount=${amount}`;
  if (id === 'eth') return `ethereum:${address}?value=${amount}`;
  return address;
}

function hasCryptoUriScheme(currency: string): boolean {
  return ['btc', 'ltc', 'doge', 'eth'].includes(currency.toLowerCase());
}

// ─── Menu item shape (from Firestore or static menu.json) ──────
interface RawMenuItem {
  id: string;
  category: string;
  name: string;
  description: string;
  prices: Record<string, number>;
  image_url?: string;
  isSpicy?: boolean;
  popular?: boolean;
  available?: boolean;
  trackStock?: boolean;
  stock?: number | null;
  lowStockThreshold?: number;
  orderCount?: number;
  averageRating?: number;
  reviewCount?: number;
  flashSalePrice?: number;
  saleStartTime?: string;
  saleEndTime?: string;
  isLimitedRun?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────

async function getBusinessBySlug(slug: string): Promise<(MohnMenuBusiness & { businessId: string }) | null> {
  try {
    const businessesRef = collection(db, 'businesses');
    const q = query(businessesRef, where('slug', '==', slug));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { ...snapshot.docs[0].data(), businessId: snapshot.docs[0].id } as MohnMenuBusiness & { businessId: string };
  } catch {
    return null;
  }
}

async function getMenuItems(businessId: string): Promise<RawMenuItem[]> {
  try {
    // Try Firestore first
    const itemsRef = collection(db, 'businesses', businessId, 'menuItems');
    const q = query(itemsRef, orderBy('category'));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      return snapshot.docs.map(d => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = d.data() as any;
        // Handle both schemas: `prices: {sm: 7.95}` or legacy `price: 7.95`
        let prices: Record<string, number> = data.prices;
        if (!prices || typeof prices !== 'object' || Object.keys(prices).length === 0) {
          prices = { order: Number(data.price) || 0 };
        }
        return {
          id: d.id,
          category: data.category || '',
          name: data.name || '',
          description: data.description || '',
          prices,
          image_url: data.image_url || data.image,
          isSpicy: data.isSpicy || data.spicy,
          popular: data.popular,
          available: data.available,
          trackStock: data.trackStock,
          stock: data.stock ?? null,
          lowStockThreshold: data.lowStockThreshold,
          orderCount: data.orderCount,
          averageRating: data.averageRating,
          reviewCount: data.reviewCount,
          flashSalePrice: data.flashSalePrice,
          saleStartTime: data.saleStartTime,
          saleEndTime: data.saleEndTime,
          isLimitedRun: data.isLimitedRun,
        } as RawMenuItem;
      });
    }
  } catch {
    // Firestore failed, fall through to static
  }

  // Fallback: load from static menu.json (for demo / initial setup)
  try {
    const menuModule = await import('@/data/menu.json');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = (menuModule.default || menuModule) as any[];
    return raw.map(item => ({
      id: String(item.id),
      category: String(item.category || ''),
      name: String(item.name || ''),
      description: String(item.description || ''),
      prices: Object.fromEntries(
        Object.entries(item.prices || {}).filter(([, v]) => v != null)
      ) as Record<string, number>,
      image_url: item.image_url,
      isSpicy: item.isSpicy,
      popular: item.popular,
      available: item.available,
    }));
  } catch {
    // Ignore
  }

  return [];
}

/** Price label display map */
const PRICE_LABELS: Record<string, string> = {
  sm: 'Small',
  small: 'Small',
  lg: 'Large',
  large: 'Large',
  pt: 'Pint',
  qt: 'Quart',
  order: '',
  half: 'Half',
  full: 'Full',
};

function formatPriceLabel(key: string): string {
  return PRICE_LABELS[key.toLowerCase()] || key.charAt(0).toUpperCase() + key.slice(1);
}

function getLowestPrice(prices: Record<string, number>): number {
  return Math.min(...Object.values(prices));
}

function isFlashSaleActive(item: RawMenuItem): boolean {
  if (!item.flashSalePrice) return false;
  const now = Date.now();
  if (item.saleStartTime && new Date(item.saleStartTime).getTime() > now) return false;
  if (item.saleEndTime && new Date(item.saleEndTime).getTime() < now) return false;
  return true;
}

function getDefaultPriceKey(prices: Record<string, number>): string {
  const keys = Object.keys(prices);
  if (keys.length === 1) return keys[0];
  // Prefer 'order', then first key
  if (prices['order'] !== undefined) return 'order';
  return keys[0];
}

// ─── Main Component ──────────────────────────────────────────

export default function OrderPage({
  params,
}: {
  params: Promise<{ businessSlug: string }>;
}) {
  // ── State ──
  const [businessSlug, setBusinessSlug] = useState('');
  const [business, setBusiness] = useState<(MohnMenuBusiness & { businessId: string }) | null>(null);
  const [menuItems, setMenuItems] = useState<RawMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [search, setSearch] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [showItemModal, setShowItemModal] = useState<RawMenuItem | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showAddedConfirm, setShowAddedConfirm] = useState<string | null>(null);

  // ── Desktop drag-scroll for category tabs ──
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

  // Checkout state
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderType, setOrderType] = useState<'delivery' | 'pickup' | 'dine-in'>('delivery');

  // Dine-in reservation state
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [seatingPreference, setSeatingPreference] = useState<'indoor' | 'outdoor' | 'bar' | 'private' | ''>('');
  const [reservationOccasion, setReservationOccasion] = useState('');
  const [isVIP, setIsVIP] = useState(false);
  // Staff assignment state
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedStaffName, setSelectedStaffName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto' | 'cash'>('card');
  const [tip, setTip] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Stripe payment state
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [pendingOrderId, setPendingOrderId] = useState('');

  // Crypto payment state
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption>(SUPPORTED_CRYPTOS[0]);
  const [cryptoPayment, setCryptoPayment] = useState<CryptoPaymentData | null>(null);
  const [cryptoStatus, setCryptoStatus] = useState<string>('');
  const [cryptoCopied, setCryptoCopied] = useState(false);
  const [showCryptoModal, setShowCryptoModal] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Delivery provider state
  const [deliveryProvider, setDeliveryProvider] = useState<'community' | 'doordash' | 'uber'>('community');
  const [deliveryQuotes, setDeliveryQuotes] = useState<Array<{ provider: string; fee: number; estimatedMinutes: number; quoteId: string }>>([]);
  const [quotesLoading, setQuotesLoading] = useState(false);

  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, getTotalItems, getTotalPrice } = useCart();

  // ── Load business & menu ──
  useEffect(() => {
    params.then(async (p) => {
      setBusinessSlug(p.businessSlug);
      const biz = await getBusinessBySlug(p.businessSlug);
      setBusiness(biz);
      if (biz) {
        const items = await getMenuItems(biz.businessId);
        setMenuItems(items.filter(i => i.available !== false));
        // Force card-only when cash payments are disabled
        if (biz.settings?.cashPaymentsEnabled === false) {
          setPaymentMethod('card');
        }
      }
      setLoading(false);
    });
  }, [params]);

  // ── Derived data ──
  const categories = useMemo(() => {
    const cats = [...new Set(menuItems.map(i => i.category))];
    return cats;
  }, [menuItems]);

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  const filteredItems = useMemo(() => {
    let items = menuItems;
    if (search.trim()) {
      const s = search.toLowerCase();
      items = items.filter(i =>
        i.name.toLowerCase().includes(s) ||
        i.description.toLowerCase().includes(s) ||
        i.category.toLowerCase().includes(s)
      );
    } else if (activeCategory) {
      items = items.filter(i => i.category === activeCategory);
    }
    return items;
  }, [menuItems, search, activeCategory]);

  // ── Pricing ──
  const subtotal = getTotalPrice();
  const taxRate = business?.settings?.pricing?.taxRate ?? 0.07;
  const taxAmount = subtotal * taxRate;
  const deliveryFee = orderType === 'delivery' ? (business?.settings?.pricing?.deliveryFee ?? 3.99) : 0;
  const total = subtotal + taxAmount + deliveryFee + tip;

  // ── Add item to cart ──
  const handleAddToCart = useCallback(() => {
    if (!showItemModal) return;
    const prices = showItemModal.prices;
    const sizeKey = selectedSize || getDefaultPriceKey(prices);
    // Use flash sale price if active, otherwise regular price
    const onSale = isFlashSaleActive(showItemModal);
    const price = onSale ? showItemModal.flashSalePrice! : prices[sizeKey];

    const cartItem: CartItem = {
      id: `${showItemModal.id}-${sizeKey}-${Date.now()}`,
      name: showItemModal.name,
      price,
      quantity: itemQty,
      image: showItemModal.image_url,
      options: [
        ...(Object.keys(prices).length > 1 ? [formatPriceLabel(sizeKey)] : []),
        ...(specialInstructions ? [`Note: ${specialInstructions}`] : []),
      ],
    };

    addToCart(cartItem);
    setShowItemModal(null);
    setItemQty(1);
    setSelectedSize('');
    setSpecialInstructions('');
    // GA4: add_to_cart
    addToCartEvent(makeGtagItem(cartItem.id, cartItem.name, cartItem.price, cartItem.quantity, businessSlug, cartItem.options));
    // Show "Added!" confirmation instead of auto-opening cart
    setShowAddedConfirm(cartItem.name);
    setTimeout(() => setShowAddedConfirm(null), 3000);
  }, [showItemModal, selectedSize, itemQty, specialInstructions, addToCart]);

  // ── Build order data object ──
  const buildOrderData = () => ({
    businessId: business!.businessId,
    customerName,
    customerEmail: email,
    customerPhone: phone,
    items: cart.map(item => ({
      menuItemId: item.id.split('-')[0],
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      priceSize: item.options?.find(o => !o.startsWith('Note:')) || 'order',
      options: item.options?.filter(o => !o.startsWith('Note:')) || [],
      specialInstructions: item.options?.find(o => o.startsWith('Note:'))?.replace('Note: ', '') || '',
      lineTotal: item.price * item.quantity,
    })),
    orderType,
    status: 'pending',
    deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
    deliveryInstructions: orderType === 'delivery' ? deliveryInstructions : undefined,
    deliveryProvider: orderType === 'delivery' ? deliveryProvider : undefined,
    // Dine-in reservation fields
    ...(orderType === 'dine-in' ? {
      reservation: {
        date: reservationDate,
        time: reservationTime,
        partySize,
        seatingPreference: seatingPreference || 'no preference',
        occasion: reservationOccasion || undefined,
        isVIP,
      },
      assignedStaffId: selectedStaffId || undefined,
      assignedStaffName: selectedStaffName || undefined,
    } : {}),
    subtotal,
    taxAmount,
    taxRate,
    deliveryFee,
    tip,
    total,
    paymentMethod,
    paymentStatus: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // ── Create tracking link for customer order tracking ──
  const createTrackingLink = async (oId: string, bizId: string) => {
    try {
      await setDoc(doc(db, 'trackingLinks', oId), {
        businessId: bizId,
        orderId: oId,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to create tracking link:', err);
    }
  };

  // ── Create booking for dine-in orders ──
  const createDineInBooking = async (oId: string, bizId: string) => {
    if (orderType !== 'dine-in') return;
    try {
      await addDoc(collection(db, 'businesses', bizId, 'bookings'), {
        name: customerName,
        phone,
        email,
        partySize,
        date: reservationDate,
        time: reservationTime,
        occasion: reservationOccasion || '',
        seatingPreference: seatingPreference || '',
        isVIP,
        status: 'confirmed',
        type: 'dine-in-order',
        orderId: oId,
        specialRequests: `Pre-ordered ${cart.length} item(s) with order`,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to create dine-in booking:', err);
    }
  };

  // ── Place order ──
  const handlePlaceOrder = async () => {
    if (!business || cart.length === 0) return;
    if (!customerName || !email || !phone) {
      alert('Please fill in your contact info.');
      return;
    }
    if (orderType === 'delivery' && !deliveryAddress) {
      alert('Please enter a delivery address.');
      return;
    }
    if (orderType === 'dine-in' && (!reservationDate || !reservationTime)) {
      alert('Please select a date and time for your reservation.');
      return;
    }

    setSubmitting(true);
    setPaymentError('');

    try {
      // For card payment — create order first, then show Stripe form
      if (paymentMethod === 'card') {
        const orderData = { ...buildOrderData(), paymentStatus: 'awaiting_payment' };
        const docRef = await addDoc(
          collection(db, 'businesses', business.businessId, 'orders'),
          orderData
        );

        // Create tracking link
        await createTrackingLink(docRef.id, business.businessId);
        await createDineInBooking(docRef.id, business.businessId);

        // Create PaymentIntent via API (with owner's Stripe Connect account if available)
        const amountCents = Math.round(total * 100);
        const res = await authFetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amountCents,
            orderId: docRef.id,
            businessId: business.businessId,
            ownerStripeAccountId: business.stripeAccountId || undefined,
            customerEmail: email,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create payment');

        // Save payment intent ID to order
        await updateDoc(doc(db, 'businesses', business.businessId, 'orders', docRef.id), {
          stripePaymentIntentId: data.paymentIntentId,
        });

        setPendingOrderId(docRef.id);
        setClientSecret(data.clientSecret);
        setShowStripeForm(true);
        setSubmitting(false);
        return; // Don't complete yet — wait for Stripe form submission
      }

      // For crypto payment — create order, then get deposit address
      if (paymentMethod === 'crypto') {
        const orderData = { ...buildOrderData(), paymentStatus: 'awaiting_crypto' };
        const docRef = await addDoc(
          collection(db, 'businesses', business.businessId, 'orders'),
          orderData
        );

        await createTrackingLink(docRef.id, business.businessId);
        await createDineInBooking(docRef.id, business.businessId);

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

        await updateDoc(doc(db, 'businesses', business.businessId, 'orders', docRef.id), {
          'cryptoPayment.paymentId': data.paymentId,
          'cryptoPayment.payAddress': data.payAddress,
          'cryptoPayment.payAmount': data.payAmount,
          'cryptoPayment.payCurrency': data.payCurrency,
        });

        setPendingOrderId(docRef.id);
        setCryptoPayment(data as CryptoPaymentData);
        setCryptoStatus(data.status || 'waiting');
        setShowCryptoModal(true);
        setSubmitting(false);
        return; // Don't complete yet — wait for crypto payment
      }

      // For cash payment — just place the order
      const orderData = buildOrderData();
      const docRef = await addDoc(
        collection(db, 'businesses', business.businessId, 'orders'),
        orderData
      );

      await createTrackingLink(docRef.id, business.businessId);
      await createDineInBooking(docRef.id, business.businessId);

      setOrderId(docRef.id);
      setOrderPlaced(true);
      // GA4: purchase (cash)
      purchase(
        docRef.id,
        cart.map(i => makeGtagItem(i.id, i.name, i.price, i.quantity, businessSlug, i.options)),
        total,
        'USD',
        { payment_type: 'cash' },
      );
      clearCart();
    } catch (err) {
      console.error('Order error:', err);
      alert('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Handle successful Stripe payment ──
  const handlePaymentSuccess = async () => {
    if (!business) return;
    try {
      // Update order payment status
      await updateDoc(doc(db, 'businesses', business.businessId, 'orders', pendingOrderId), {
        paymentStatus: 'paid',
        status: 'confirmed',
        updatedAt: new Date().toISOString(),
      });

      setOrderId(pendingOrderId);
      setOrderPlaced(true);
      setShowStripeForm(false);
      // GA4: purchase (card)
      purchase(
        pendingOrderId,
        cart.map(i => makeGtagItem(i.id, i.name, i.price, i.quantity, businessSlug, i.options)),
        total,
        'USD',
        { payment_type: 'card' },
      );
      clearCart();
    } catch (err) {
      console.error('Failed to update order after payment:', err);
      // Payment went through, but order update failed — still show success
      setOrderId(pendingOrderId);
      setOrderPlaced(true);
      setShowStripeForm(false);
      // GA4: purchase (card — order update failed but payment succeeded)
      purchase(
        pendingOrderId,
        cart.map(i => makeGtagItem(i.id, i.name, i.price, i.quantity, businessSlug, i.options)),
        total,
        'USD',
        { payment_type: 'card' },
      );
      clearCart();
    }
  };

  // ── Handle successful crypto payment ──
  const handleCryptoComplete = async () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (!business) return;
    try {
      await updateDoc(doc(db, 'businesses', business.businessId, 'orders', pendingOrderId), {
        paymentStatus: 'paid_crypto',
        status: 'confirmed',
        updatedAt: new Date().toISOString(),
      });
    } catch {
      /* payment confirmed on-chain — still show success */
    }
    setOrderId(pendingOrderId);
    setOrderPlaced(true);
    setShowCryptoModal(false);
    setCryptoPayment(null);
    setCryptoStatus('');
    // GA4: purchase (crypto)
    purchase(
      pendingOrderId,
      cart.map(i => makeGtagItem(i.id, i.name, i.price, i.quantity, businessSlug, i.options)),
      total,
      'USD',
      { payment_type: 'crypto' },
    );
    clearCart();
  };

  // Copy crypto address to clipboard
  const copyAddress = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCryptoCopied(true);
      setTimeout(() => setCryptoCopied(false), 2000);
    } catch { /* fallback */ }
  }, []);

  // ── Crypto payment polling ──
  useEffect(() => {
    if (!showCryptoModal || paymentMethod !== 'crypto' || !cryptoPayment?.paymentId) return;

    const poll = async () => {
      try {
        const res = await authFetch(`/api/crypto/create-payment?paymentId=${cryptoPayment.paymentId}`);
        if (!res.ok) return;
        const data = await res.json();
        const status = data.status as string;
        setCryptoStatus(status);

        if (status === 'finished') {
          handleCryptoComplete();
        } else if (['failed', 'expired', 'refunded'].includes(status)) {
          setCryptoStatus(status);
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        }
      } catch { /* poll silently */ }
    };

    poll();
    pollRef.current = setInterval(poll, 8000);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCryptoModal, paymentMethod, cryptoPayment?.paymentId]);

  // ─── Loading ──────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-zinc-200 border-t-black rounded-full animate-spin" />
          <p className="text-zinc-400 font-bold text-sm">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-4xl font-black mb-4">Restaurant Not Found</h1>
          <p className="text-zinc-500">This ordering page is not available.</p>
        </div>
      </div>
    );
  }

  // ─── Order Placed Success ──────────────────────────────────

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[3rem] shadow-[0_20px_100px_rgba(0,0,0,0.05)] border border-zinc-100 p-12 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheck className="text-3xl text-emerald-600" />
          </div>
          <h1 className="text-3xl font-black mb-3">Order Placed!</h1>
          <p className="text-zinc-500 mb-2">
            Thank you, {customerName}! Your order from {business.name} has been received.
          </p>
          <p className="text-sm text-zinc-400 mb-6">
            Order #{orderId.slice(0, 8).toUpperCase()}
          </p>
          {orderType === 'delivery' && (
            <a
              href={`/track-delivery/${orderId}`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 transition-all mb-3 w-full justify-center"
            >
              <FaMotorcycle /> Track Your Delivery
            </a>
          )}
          <a
            href={`/${businessSlug}`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-full font-bold hover:bg-zinc-800 transition-all w-full justify-center"
          >
            Back to {business.name}
          </a>
        </motion.div>
      </div>
    );
  }

  // ─── Main Menu + Cart Layout ──────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Demo Banner for demo businesses */}
      {(business as any)?.isDemo && <DemoBanner businessSlug={businessSlug} />}

      {/* ── Sticky Header ────────────────────────────────────── */}
      <div className={`sticky ${(business as any)?.isDemo ? 'top-[36px]' : 'top-0'} z-40 bg-white/95 backdrop-blur-xl border-b border-zinc-200`}>
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <a href={`/${businessSlug}`} className="text-zinc-400 hover:text-black transition-colors" aria-label="Back to business page">
                <FaArrowLeft />
              </a>
              <div>
                <h1 className="text-lg font-black text-black leading-tight">{business.name}</h1>
                <p className="text-xs text-zinc-400">{business.city}, {business.state}</p>
              </div>
            </div>

            {/* Search + Cart */}
            <div className="flex items-center gap-3">
              <div className="relative hidden sm:block">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300 text-sm" />
                <input
                  type="text"
                  value={search}
                  onChange={e => { setSearch(e.target.value); if (e.target.value) setActiveCategory(''); }}
                  placeholder="Search menu..."
                  className="pl-9 pr-4 py-2 w-56 border border-zinc-200 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black" aria-label="Clear search">
                    <FaTimes className="text-xs" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setCartOpen(true)}
                className="relative px-4 py-2 bg-black text-white rounded-full font-bold text-sm flex items-center gap-2 hover:bg-zinc-800 transition-all"
              >
                <FaShoppingCart />
                <span className="hidden sm:inline">Cart</span>
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <div className="sm:hidden pb-3">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300 text-sm" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); if (e.target.value) setActiveCategory(''); }}
                placeholder="Search menu..."
                className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {/* Category tabs — redesigned with 3D glassmorphic look */}
          {!search && (
            <div className="relative">
              <div
                ref={catScrollRef}
                className="flex gap-2 overflow-x-auto pb-3 scroll-smooth cursor-grab select-none"
                style={{ scrollbarWidth: 'none' }}
                onMouseDown={handleCatMouseDown}
                onMouseUp={handleCatMouseUp}
                onMouseLeave={handleCatMouseUp}
                onMouseMove={handleCatMouseMove}
              >
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { if (!catDragState.current.hasDragged) setActiveCategory(cat); }}
                    className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border ${
                      activeCategory === cat
                        ? 'bg-gradient-to-r from-zinc-900 to-zinc-800 text-white border-zinc-700 shadow-lg shadow-black/20 scale-[1.02]'
                        : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 hover:shadow-md hover:scale-[1.02] active:scale-95'
                    }`}
                    style={activeCategory === cat ? {} : {
                      boxShadow: '0 2px 4px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {/* Fade hint on right edge */}
              <div className="absolute right-0 top-0 bottom-3 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none" />
            </div>
          )}
        </div>
      </div>

      {/* ── Menu Grid ────────────────────────────────────────── */}
      <div className="container mx-auto max-w-7xl px-4 py-6">
        {search && (
          <p className="text-sm text-zinc-400 mb-4 font-medium">
            {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;
          </p>
        )}

        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-400 font-bold text-lg">No items found</p>
            <p className="text-zinc-300 text-sm mt-1">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => {
              const lowestPrice = getLowestPrice(item.prices);
              const hasSizes = Object.keys(item.prices).length > 1;
              const isSoldOut = item.trackStock && item.stock !== undefined && item.stock !== null && item.stock <= 0;
              const onSale = isFlashSaleActive(item);

              return (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    if (isSoldOut) return;
                    setShowItemModal(item);
                    setSelectedSize(getDefaultPriceKey(item.prices));
                    setItemQty(1);
                    setSpecialInstructions('');
                    // GA4: view_item
                    viewItem(makeGtagItem(item.id, item.name, lowestPrice, 1, businessSlug));
                  }}
                  className={`bg-white rounded-2xl border border-zinc-200 hover:border-zinc-400 transition-all text-left overflow-hidden group ${
                    isSoldOut ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                  whileHover={isSoldOut ? {} : { y: -2 }}
                  whileTap={isSoldOut ? {} : { scale: 0.98 }}
                >
                  {/* Item image */}
                  {item.image_url && (
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        {onSale && (
                          <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <FaFire className="text-[10px]" /> Sale
                          </span>
                        )}
                        {item.isSpicy && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <FaFire className="text-[10px]" /> Spicy
                          </span>
                        )}
                      </div>
                      {item.popular && (
                        <span className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          Popular
                        </span>
                      )}
                      {isSoldOut && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">Sold Out</span>
                        </div>
                      )}
                      {item.trackStock && item.stock !== undefined && item.stock !== null && item.stock > 0 && item.stock <= (item.lowStockThreshold || 5) && (
                        <span className="absolute bottom-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {item.stock} left
                        </span>
                      )}
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-black text-sm leading-tight">{item.name}</h3>
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{item.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        {onSale ? (
                          <div>
                            <p className="font-black text-orange-600 text-sm">${item.flashSalePrice!.toFixed(2)}</p>
                            <p className="text-[10px] text-zinc-400 line-through">${lowestPrice.toFixed(2)}</p>
                          </div>
                        ) : (
                          <p className="font-black text-black text-sm">
                            {hasSizes ? `$${lowestPrice.toFixed(2)}+` : `$${lowestPrice.toFixed(2)}`}
                          </p>
                        )}
                      </div>
                    </div>

                    {hasSizes && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Object.entries(item.prices).map(([key, val]) => (
                          <span key={key} className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full font-bold">
                            {formatPriceLabel(key)} ${val.toFixed(2)}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Order stats */}
                    {(item.orderCount || item.averageRating) && (
                      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-zinc-100">
                        {item.orderCount && item.orderCount > 0 && (
                          <span className="text-[10px] text-zinc-400 font-medium">{item.orderCount} ordered</span>
                        )}
                        {item.averageRating && item.averageRating > 0 && (
                          <span className="text-[10px] text-zinc-400 font-medium">⭐ {item.averageRating.toFixed(1)}</span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Floating Cart Button (Mobile) ────────────────────── */}
      {getTotalItems() > 0 && !cartOpen && (
        <div className="fixed bottom-6 left-4 right-4 z-[95] lg:hidden">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full py-4 bg-black text-white rounded-2xl font-bold text-sm flex items-center justify-between px-6 shadow-2xl"
          >
            <span className="flex items-center gap-2">
              <FaShoppingCart /> View Cart ({getTotalItems()})
            </span>
            <span>${subtotal.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* ── "Item Added" Confirmation Toast ──────────────────── */}
      <AnimatePresence>
        {showAddedConfirm && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[105] bg-zinc-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 max-w-sm"
          >
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shrink-0">
              <FaCheck className="text-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{showAddedConfirm} added!</p>
              <p className="text-xs text-zinc-400">Tap below to view cart or keep browsing</p>
            </div>
            <button
              onClick={() => { setShowAddedConfirm(null); setCartOpen(true); }}
              className="shrink-0 px-3 py-1.5 bg-white text-black rounded-lg text-xs font-bold hover:bg-zinc-100 transition-all"
            >
              View Cart
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Item Detail Modal ────────────────────────────────── */}
      <AnimatePresence>
        {showItemModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/60 flex items-end sm:items-center justify-center"
            onClick={() => setShowItemModal(null)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Image */}
              {showItemModal.image_url && (
                <div className="relative h-52 overflow-hidden sm:rounded-t-3xl">
                  <img src={showItemModal.image_url} alt={showItemModal.name} className="w-full h-full object-cover" />
                  <button
                    onClick={() => setShowItemModal(null)}
                    className="absolute top-4 right-4 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors"
                    aria-label="Close item details"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                </div>
              )}

              <div className="p-6 space-y-5">
                {/* Title & Description */}
                <div>
                  <div className="flex items-start gap-2">
                    <h2 className="text-xl font-black text-black flex-1">{showItemModal.name}</h2>
                    {showItemModal.isSpicy && <FaFire className="text-red-500 mt-1" />}
                  </div>
                  <p className="text-zinc-500 text-sm mt-1">{showItemModal.description}</p>
                </div>

                {/* Size / Price selection */}
                {Object.keys(showItemModal.prices).length > 1 ? (
                  <div>
                    <h3 className="text-sm font-black text-black mb-2">Select Size</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(showItemModal.prices).map(([key, val]) => (
                        <button
                          key={key}
                          onClick={() => setSelectedSize(key)}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${
                            selectedSize === key
                              ? 'border-black bg-zinc-50'
                              : 'border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          <span className="text-sm font-bold block">{formatPriceLabel(key)}</span>
                          <span className="text-sm font-black text-indigo-600">${val.toFixed(2)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-2xl font-black text-black">
                    ${Object.values(showItemModal.prices)[0].toFixed(2)}
                  </div>
                )}

                {/* Special instructions */}
                <div>
                  <h3 className="text-sm font-black text-black mb-2">Special Instructions</h3>
                  <textarea
                    value={specialInstructions}
                    onChange={e => setSpecialInstructions(e.target.value)}
                    className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black h-16 resize-none"
                    placeholder="Extra sauce, no onions, etc..."
                  />
                </div>

                {/* Quantity + Add button */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-zinc-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setItemQty(q => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-zinc-100 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <FaMinus className="text-xs" />
                    </button>
                    <span className="w-10 text-center font-bold text-sm">{itemQty}</span>
                    <button
                      onClick={() => setItemQty(q => q + 1)}
                      className="w-10 h-10 flex items-center justify-center hover:bg-zinc-100 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <FaPlus className="text-xs" />
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="flex-1 py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                  >
                    Add to Cart — ${((isFlashSaleActive(showItemModal) ? showItemModal.flashSalePrice! : showItemModal.prices[selectedSize || getDefaultPriceKey(showItemModal.prices)]) * itemQty).toFixed(2)}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Cart Drawer ──────────────────────────────────────── */}
      <AnimatePresence>
        {cartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/60"
            onClick={() => setCartOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute right-0 top-0 h-full w-full sm:max-w-md bg-white shadow-2xl flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Cart header */}
              <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
                <h2 className="text-xl font-black">Your Cart</h2>
                <button onClick={() => setCartOpen(false)} className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors" aria-label="Close cart">
                  <FaTimes className="text-sm" />
                </button>
              </div>

              {/* Cart items */}
              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <FaShoppingCart className="text-4xl text-zinc-200 mx-auto mb-4" />
                    <p className="text-zinc-400 font-bold">Your cart is empty</p>
                    <p className="text-zinc-300 text-sm mt-1">Add items from the menu to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.id} className="flex gap-3 bg-zinc-50 rounded-xl p-3">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-black truncate">{item.name}</h4>
                          {item.options && item.options.length > 0 && (
                            <p className="text-xs text-zinc-400 truncate">{item.options.join(' · ')}</p>
                          )}
                          <p className="text-sm font-black text-indigo-600 mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                          <button onClick={() => {
                            removeFromCartEvent(makeGtagItem(item.id, item.name, item.price, item.quantity, businessSlug, item.options));
                            removeFromCart(item.id);
                          }} className="text-zinc-300 hover:text-red-500 transition-colors" aria-label={`Remove ${item.name}`}>
                            <FaTrash className="text-xs" />
                          </button>
                          <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-zinc-100" aria-label="Decrease quantity">
                              <FaMinus className="text-[10px]" />
                            </button>
                            <span className="w-6 text-center font-bold text-xs">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-zinc-100" aria-label="Increase quantity">
                              <FaPlus className="text-[10px]" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Clear cart */}
                    <button
                      onClick={() => { clearCart(); setCartOpen(false); }}
                      className="text-xs text-zinc-400 hover:text-red-500 font-bold transition-colors"
                    >
                      Clear cart
                    </button>
                  </div>
                )}
              </div>

              {/* Cart footer */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-zinc-200 space-y-4">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Subtotal</span>
                      <span className="font-bold">${subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCartOpen(false);
                      setCheckoutOpen(true);
                      // GA4: begin_checkout
                      beginCheckout(
                        cart.map(i => makeGtagItem(i.id, i.name, i.price, i.quantity, businessSlug, i.options)),
                        subtotal,
                      );
                    }}
                    className="w-full py-4 bg-black text-white rounded-2xl font-bold text-sm hover:bg-zinc-800 transition-all"
                  >
                    Proceed to Checkout — ${subtotal.toFixed(2)}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Checkout Modal ───────────────────────────────────── */}
      <AnimatePresence>
        {checkoutOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/60 flex items-end sm:items-center justify-center overflow-y-auto"
            onClick={() => setCheckoutOpen(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[95vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-zinc-200 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-xl font-black">Checkout</h2>
                <button onClick={() => setCheckoutOpen(false)} className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200" aria-label="Close checkout">
                  <FaTimes className="text-sm" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Order Type */}
                <div>
                  <h3 className="text-sm font-black text-black mb-3">Order Type</h3>
                  <div className={`grid gap-3 ${
                    business?.type === 'bar_grill' || business?.type === 'restaurant' || business?.type === 'chinese_restaurant'
                      ? 'grid-cols-3' : 'grid-cols-2'
                  }`}>
                    <button
                      onClick={() => setOrderType('delivery')}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                        orderType === 'delivery' ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      <FaMotorcycle /> Delivery
                    </button>
                    <button
                      onClick={() => setOrderType('pickup')}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                        orderType === 'pickup' ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      <FaStore /> Pickup
                    </button>
                    {(business?.type === 'bar_grill' || business?.type === 'restaurant' || business?.type === 'chinese_restaurant') && (
                      <button
                        onClick={() => setOrderType('dine-in')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                          orderType === 'dine-in' ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                        }`}
                      >
                        <FaUtensils /> Dine-In
                      </button>
                    )}
                  </div>

                  {/* Dine-In Reservation Widget */}
                  {orderType === 'dine-in' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-5 border border-purple-100 space-y-4"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <FaCalendarAlt className="text-purple-600" />
                        <h4 className="text-sm font-black text-black">Reserve Your Table</h4>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 mb-1">Date</label>
                          <input
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            value={reservationDate}
                            onChange={e => setReservationDate(e.target.value)}
                            className="w-full px-3 py-2.5 bg-white rounded-xl border border-purple-200 text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 mb-1">Time</label>
                          <select
                            value={reservationTime}
                            onChange={e => setReservationTime(e.target.value)}
                            className="w-full px-3 py-2.5 bg-white rounded-xl border border-purple-200 text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                          >
                            <option value="">Select time</option>
                            {['5:00 PM','5:30 PM','6:00 PM','6:30 PM','7:00 PM','7:30 PM','8:00 PM','8:30 PM','9:00 PM','9:30 PM','10:00 PM','10:30 PM','11:00 PM'].map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-500 mb-1">Party Size</label>
                        <div className="flex gap-2 flex-wrap">
                          {[1,2,3,4,5,6,8,10].map(n => (
                            <button
                              key={n}
                              onClick={() => setPartySize(n)}
                              className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${
                                partySize === n
                                  ? 'bg-purple-600 text-white shadow-md'
                                  : 'bg-white text-zinc-600 border border-purple-200 hover:border-purple-400'
                              }`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-500 mb-1">Seating</label>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { v: 'indoor' as const, icon: FaUtensils, label: 'Indoor' },
                            { v: 'outdoor' as const, icon: FaStar, label: 'Patio' },
                            { v: 'bar' as const, icon: FaGlassCheers, label: 'Bar' },
                            { v: 'private' as const, icon: FaConciergeBell, label: 'Private' },
                          ].map(opt => (
                            <button
                              key={opt.v}
                              onClick={() => setSeatingPreference(seatingPreference === opt.v ? '' : opt.v)}
                              className={`flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-bold transition-all ${
                                seatingPreference === opt.v
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-white text-zinc-500 border border-purple-200 hover:border-purple-400'
                              }`}
                            >
                              <opt.icon className="text-sm" />
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* VIP toggle */}
                      <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-purple-200">
                        <div className="flex items-center gap-2">
                          <FaStar className="text-amber-500" />
                          <span className="text-xs font-bold text-black">VIP Experience</span>
                        </div>
                        <button
                          onClick={() => setIsVIP(!isVIP)}
                          className={`w-11 h-6 rounded-full transition-all relative ${isVIP ? 'bg-amber-500' : 'bg-zinc-200'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full shadow-md absolute top-0.5 transition-all ${isVIP ? 'left-5' : 'left-0.5'}`} />
                        </button>
                      </div>

                      <p className="text-[10px] text-purple-500 font-medium">
                        Your table and pre-ordered items will be ready when you arrive.
                      </p>

                      {/* Live Staff Selection */}
                      {business && (
                        <div className="border-t border-purple-100 pt-4 mt-2">
                          <LiveStaffSection
                            businessId={business.businessId}
                            primaryColor={business.brandColors?.primary || '#7C3AED'}
                            orderPath=""
                            compact
                            selectedStaffId={selectedStaffId}
                            onSelectStaff={(staff) => {
                              setSelectedStaffId(staff.id);
                              setSelectedStaffName(staff.name);
                            }}
                          />
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Third-party delivery options */}
                  {orderType === 'delivery' && business?.settings?.thirdPartyDelivery?.enabled && (
                    <div className="mt-4 bg-zinc-50 rounded-xl p-4 space-y-3">
                      <p className="text-xs font-bold text-zinc-500">Also available via:</p>
                      <div className="flex flex-wrap gap-2">
                        {business.settings.thirdPartyDelivery.uberEatsUrl && (
                          <a
                            href={business.settings.thirdPartyDelivery.uberEatsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all"
                          >
                            🟢 Uber Eats
                          </a>
                        )}
                        {business.settings.thirdPartyDelivery.doordashUrl && (
                          <a
                            href={business.settings.thirdPartyDelivery.doordashUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all"
                          >
                            🔴 DoorDash
                          </a>
                        )}
                        {business.settings.thirdPartyDelivery.grubhubUrl && (
                          <a
                            href={business.settings.thirdPartyDelivery.grubhubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition-all"
                          >
                            🟠 Grubhub
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact */}
                <div>
                  <h3 className="text-sm font-black text-black mb-3">Contact Info</h3>
                  <div className="space-y-3">
                    <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Full name" className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black" />
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black" />
                  </div>
                </div>

                {/* Delivery address */}
                {orderType === 'delivery' && (
                  <div>
                    <h3 className="text-sm font-black text-black mb-3">Delivery Address</h3>
                    <div className="space-y-3">
                      <AddressAutocomplete
                        value={deliveryAddress}
                        onChange={setDeliveryAddress}
                        onSelect={(parsed) => setDeliveryAddress(parsed.formatted)}
                        placeholder="Start typing your address…"
                        inputClassName="border-zinc-200 font-medium"
                      />
                      <input type="text" value={deliveryInstructions} onChange={e => setDeliveryInstructions(e.target.value)} placeholder="Delivery instructions (optional)" className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black" />
                    </div>
                  </div>
                )}

                {/* Delivery provider selection — shown when business has white-label delivery enabled */}
                {orderType === 'delivery' && business?.settings?.thirdPartyDelivery?.enabled && business.settings.thirdPartyDelivery.whiteLabel && (
                  <div>
                    <h3 className="text-sm font-black text-black mb-3">Delivery Method</h3>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryProvider('community')}
                        className={`w-full px-4 py-3 rounded-xl text-left flex items-center justify-between transition-all ${
                          deliveryProvider === 'community' ? 'bg-black text-white ring-2 ring-black' : 'bg-zinc-50 hover:bg-zinc-100 border border-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🚴</span>
                          <div>
                            <div className="text-sm font-bold">Community Courier</div>
                            <div className={`text-[11px] ${deliveryProvider === 'community' ? 'text-zinc-300' : 'text-zinc-400'}`}>Local walker, biker, or scooter</div>
                          </div>
                        </div>
                        <div className="text-sm font-black">${(business.settings?.pricing?.deliveryFee || 3.99).toFixed(2)}</div>
                      </button>

                      {(business.settings.thirdPartyDelivery.providers || []).includes('doordash') && (
                        <div
                          className="w-full px-4 py-3 rounded-xl text-left flex items-center justify-between bg-zinc-50 border border-zinc-200 opacity-60 cursor-not-allowed"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">🔴</span>
                            <div>
                              <div className="text-sm font-bold text-zinc-400">Express Delivery</div>
                              <div className="text-[11px] text-zinc-400">Professional driver • ~25-40 min</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200">Coming Soon</span>
                        </div>
                      )}

                      {(business.settings.thirdPartyDelivery.providers || []).includes('uber') && (
                        <div
                          className="w-full px-4 py-3 rounded-xl text-left flex items-center justify-between bg-zinc-50 border border-zinc-200 opacity-60 cursor-not-allowed"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">⬛</span>
                            <div>
                              <div className="text-sm font-bold text-zinc-400">Premium Delivery</div>
                              <div className="text-[11px] text-zinc-400">Professional driver • ~20-35 min</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200">Coming Soon</span>
                        </div>
                      )}
                    </div>
                    {quotesLoading && (
                      <p className="text-xs text-zinc-400 mt-2 animate-pulse">Getting delivery quotes…</p>
                    )}
                  </div>
                )}

                {/* Payment method */}
                <div>
                  <h3 className="text-sm font-black text-black mb-3">Payment</h3>
                  {(business?.settings?.cashPaymentsEnabled !== false) ? (
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setPaymentMethod('card')}
                        className={`py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1.5 ${
                          paymentMethod === 'card' ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                        }`}
                      >
                        <FaCreditCard className="text-xs" /> Card
                      </button>
                      <button
                        onClick={() => setPaymentMethod('crypto')}
                        className={`py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1.5 ${
                          paymentMethod === 'crypto'
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                        }`}
                      >
                        <FaBitcoin className="text-xs" /> Crypto
                      </button>
                      <button
                        onClick={() => setPaymentMethod('cash')}
                        className={`py-3 rounded-xl font-bold text-sm transition-all ${
                          paymentMethod === 'cash' ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                        }`}
                      >
                        💵 Cash
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setPaymentMethod('card')}
                        className={`py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1.5 ${
                          paymentMethod === 'card' ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                        }`}
                      >
                        <FaCreditCard className="text-xs" /> Card
                      </button>
                      <button
                        onClick={() => setPaymentMethod('crypto')}
                        className={`py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1.5 ${
                          paymentMethod === 'crypto'
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                        }`}
                      >
                        <FaBitcoin className="text-xs" /> Crypto
                      </button>
                    </div>
                  )}

                  {/* Crypto coin selector */}
                  {paymentMethod === 'crypto' && (
                    <div className="mt-3 space-y-3">
                      <p className="text-xs font-black uppercase tracking-widest text-zinc-400">
                        Select Coin
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {SUPPORTED_CRYPTOS.map(c => (
                          <button
                            key={c.id}
                            onClick={() => setSelectedCrypto(c)}
                            className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
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
                            <span className="text-base leading-none">{c.icon}</span>
                            <span>{c.symbol}</span>
                          </button>
                        ))}
                      </div>
                      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-xl p-3">
                        <p className="text-xs font-bold text-orange-700">
                          ⚡ Pay with {selectedCrypto.name} —{' '}
                          <span className="text-orange-500">0% platform fees · Instant settlement</span>
                        </p>
                        {selectedCrypto.id === 'btc' && (
                          <p className="text-[10px] text-orange-500/80 mt-1">
                            💲 Cash App users can scan the QR to pay with BTC
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tip */}
                <div>
                  <h3 className="text-sm font-black text-black mb-3">Add a Tip</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 2, 3, 5].map(t => (
                      <button
                        key={t}
                        onClick={() => setTip(t)}
                        className={`py-2 rounded-xl font-bold text-sm transition-all ${
                          tip === t ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                        }`}
                      >
                        {t === 0 ? 'None' : `$${t}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Order summary */}
                <div className="bg-zinc-50 rounded-2xl p-5 space-y-2 text-sm">
                  <h3 className="font-black text-black mb-3">Order Summary</h3>
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between">
                      <span className="text-zinc-600">
                        {item.quantity}x {item.name}
                        {item.options && item.options.filter(o => !o.startsWith('Note:')).length > 0 && (
                          <span className="text-zinc-400"> ({item.options.filter(o => !o.startsWith('Note:')).join(', ')})</span>
                        )}
                      </span>
                      <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t border-zinc-200 pt-2 mt-3 space-y-1">
                    <div className="flex justify-between"><span className="text-zinc-500">Subtotal</span><span className="font-bold">${subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">Tax ({(taxRate * 100).toFixed(0)}%)</span><span className="font-bold">${taxAmount.toFixed(2)}</span></div>
                    {orderType === 'delivery' && (
                      <div className="flex justify-between"><span className="text-zinc-500">Delivery Fee</span><span className="font-bold">${deliveryFee.toFixed(2)}</span></div>
                    )}
                    {tip > 0 && (
                      <div className="flex justify-between"><span className="text-zinc-500">Tip</span><span className="font-bold">${tip.toFixed(2)}</span></div>
                    )}
                    <div className="flex justify-between text-base pt-2 border-t border-zinc-200">
                      <span className="font-black text-black">Total</span>
                      <span className="font-black text-black">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Place order */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={submitting || !customerName || !email || !phone || (orderType === 'delivery' && !deliveryAddress)}
                  className={`w-full py-4 text-white rounded-2xl font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                    paymentMethod === 'crypto'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600'
                      : 'bg-black hover:bg-zinc-800'
                  }`}
                >
                  {submitting
                    ? 'Placing Order...'
                    : paymentMethod === 'card'
                    ? `Pay $${total.toFixed(2)}`
                    : paymentMethod === 'crypto'
                    ? <><FaBitcoin className="text-xs" /> Pay ${total.toFixed(2)} with {selectedCrypto.symbol}</>
                    : `Place Order — $${total.toFixed(2)}`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stripe Payment Modal ─────────────────────────────── */}
      <AnimatePresence>
        {showStripeForm && clientSecret && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-3xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                    <FaCreditCard className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black">Complete Payment</h2>
                    <p className="text-sm text-zinc-500">${total.toFixed(2)} — Order #{pendingOrderId.slice(0, 8).toUpperCase()}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <Elements stripe={getStripe()} options={{ clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#000000', borderRadius: '12px' } } }}>
                  <StripeCardForm
                    clientSecret={clientSecret}
                    total={total}
                    onSuccess={handlePaymentSuccess}
                    onError={(msg) => setPaymentError(msg)}
                  />
                </Elements>
                {paymentError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    {paymentError}
                  </div>
                )}
                <button
                  onClick={() => setShowStripeForm(false)}
                  className="w-full mt-3 py-3 text-zinc-500 text-sm font-medium hover:text-zinc-700 transition-colors"
                >
                  Cancel Payment
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Crypto Payment Modal ─────────────────────────────── */}
      <AnimatePresence>
        {showCryptoModal && cryptoPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-3xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold"
                    style={{ backgroundColor: selectedCrypto.color }}
                  >
                    {selectedCrypto.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-black">Pay with {selectedCrypto.name}</h2>
                    <p className="text-sm text-zinc-500">${total.toFixed(2)} — Order #{pendingOrderId.slice(0, 8).toUpperCase()}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Dark deposit card */}
                <div className="bg-zinc-900 rounded-2xl p-5 space-y-4">
                  {/* Status indicator */}
                  <div className="flex items-center justify-center gap-2">
                    {['waiting', 'confirming', 'confirmed', 'sending'].includes(cryptoStatus) ? (
                      <>
                        <div
                          className="w-2.5 h-2.5 rounded-full animate-pulse"
                          style={{ backgroundColor: selectedCrypto.color }}
                        />
                        <span className="text-white/70 text-xs font-bold uppercase tracking-wider">
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
                        <FaCheck className="text-emerald-400 text-sm" />
                        <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
                          Payment Complete
                        </span>
                      </>
                    ) : ['failed', 'expired'].includes(cryptoStatus) ? (
                      <span className="text-red-400 text-xs font-bold uppercase tracking-wider">
                        {cryptoStatus === 'expired' ? 'Payment Expired' : 'Payment Failed'}
                      </span>
                    ) : null}
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center">
                    <div className="bg-white p-3 rounded-xl">
                      <QRCodeSVG
                        value={buildCryptoUri(
                          cryptoPayment.payAddress,
                          cryptoPayment.payAmount,
                          cryptoPayment.payCurrency
                        )}
                        size={180}
                        level="M"
                        includeMargin={false}
                      />
                    </div>
                  </div>

                  {/* Wallet hint */}
                  {cryptoPayment.payCurrency.toLowerCase() === 'btc' && (
                    <p className="text-center text-white/40 text-xs leading-tight">
                      📱 Cash App users — scan this QR to pay instantly
                    </p>
                  )}
                  {hasCryptoUriScheme(cryptoPayment.payCurrency) &&
                    cryptoPayment.payCurrency.toLowerCase() !== 'btc' && (
                    <p className="text-center text-white/40 text-xs leading-tight">
                      📱 Scan with any {selectedCrypto.name} wallet to pay
                    </p>
                  )}

                  {/* Amount to send */}
                  <div className="text-center">
                    <p className="text-white/50 text-xs uppercase tracking-widest mb-1">
                      Send Exactly
                    </p>
                    <p className="text-white text-xl font-black tracking-tight">
                      {cryptoPayment.payAmount}{' '}
                      <span className="text-sm font-bold" style={{ color: selectedCrypto.color }}>
                        {cryptoPayment.payCurrency.toUpperCase()}
                      </span>
                    </p>
                    <p className="text-white/40 text-xs mt-0.5">
                      ≈ ${cryptoPayment.priceAmount.toFixed(2)} USD
                    </p>
                  </div>

                  {/* Deposit address */}
                  <div>
                    <p className="text-white/50 text-xs uppercase tracking-widest mb-1 text-center">
                      To Address
                    </p>
                    <button
                      onClick={() => copyAddress(cryptoPayment.payAddress)}
                      className="w-full flex items-center gap-2 bg-white/5 hover:bg-white/10 rounded-xl px-3 py-3 transition-all group"
                    >
                      <span className="flex-1 text-white/80 text-xs font-mono break-all text-left leading-relaxed">
                        {cryptoPayment.payAddress}
                      </span>
                      <span className="shrink-0">
                        {cryptoCopied ? (
                          <FaCheck className="text-emerald-400 text-sm" />
                        ) : (
                          <FaCopy className="text-white/40 group-hover:text-white/70 text-sm transition-colors" />
                        )}
                      </span>
                    </button>
                  </div>

                  {/* Extra ID (for coins like XRP that need memo/tag) */}
                  {cryptoPayment.payinExtraId && (
                    <div>
                      <p className="text-white/50 text-xs uppercase tracking-widest mb-1 text-center">
                        Memo / Tag
                      </p>
                      <button
                        onClick={() => copyAddress(cryptoPayment.payinExtraId!)}
                        className="w-full flex items-center gap-2 bg-white/5 hover:bg-white/10 rounded-xl px-3 py-3 transition-all group"
                      >
                        <span className="flex-1 text-white/80 text-xs font-mono text-left">
                          {cryptoPayment.payinExtraId}
                        </span>
                        <FaCopy className="text-white/40 group-hover:text-white/70 text-sm transition-colors shrink-0" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Cancel */}
                <button
                  onClick={() => setShowCryptoModal(false)}
                  className="w-full mt-4 py-3 text-zinc-500 text-sm font-medium hover:text-zinc-700 transition-colors"
                >
                  Cancel Payment
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Stripe Card Form Component ──────────────────────────────

function StripeCardForm({
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

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onError('Card element not found');
      setProcessing(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    });

    if (error) {
      onError(error.message || 'Payment failed');
      setProcessing(false);
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess();
    } else {
      onError('Payment was not completed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-zinc-200 rounded-xl bg-zinc-50">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#09090b',
                fontFamily: 'system-ui, -apple-system, sans-serif',
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
        className="w-full py-4 bg-black text-white rounded-2xl font-bold text-sm hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <FaLock className="text-xs" />
        {processing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
      </button>
      <p className="text-center text-xs text-zinc-400 flex items-center justify-center gap-1">
        <FaLock className="text-[10px]" /> Secured by Stripe
      </p>
    </form>
  );
}
