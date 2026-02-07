'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import {
  FaArrowRight, FaEnvelope, FaBox, FaBoxOpen,
  FaMapMarkerAlt, FaPhone, FaClock, FaDollarSign,
} from 'react-icons/fa';
import AddressAutocomplete from '@/components/AddressAutocomplete';

const PACKAGE_SIZES = [
  { value: 'letter', label: 'Letter / Document', icon: FaEnvelope, desc: 'Envelopes, papers, small items', baseFee: 3.99 },
  { value: 'small', label: 'Small Package', icon: FaBox, desc: 'Up to 5 lbs — books, electronics', baseFee: 4.99 },
  { value: 'medium', label: 'Medium Package', icon: FaBoxOpen, desc: '5-20 lbs — boxes, bags', baseFee: 6.99 },
] as const;

type PackageSize = typeof PACKAGE_SIZES[number]['value'];

export default function QuickDeliveryPage() {
  const { user, MohnMenuUser } = useAuth();
  const router = useRouter();

  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [packageSize, setPackageSize] = useState<PackageSize>('letter');
  const [description, setDescription] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const selectedSize = PACKAGE_SIZES.find(s => s.value === packageSize)!;
  const deliveryFee = selectedSize.baseFee;
  const platformFee = 0.25;
  const totalFee = deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!pickupAddress.trim() || !dropoffAddress.trim()) {
      setError('Please enter both pickup and drop-off addresses.');
      return;
    }
    if (!senderName.trim() || !senderPhone.trim()) {
      setError('Please enter sender name and phone.');
      return;
    }

    setLoading(true);

    try {
      // Create a quick delivery order in the quickDeliveries collection
      const deliveryData = {
        type: 'quick_delivery',
        packageSize,
        description: description || `${selectedSize.label} delivery`,
        pickupAddress,
        dropoffAddress,
        senderName,
        senderPhone,
        recipientName: recipientName || 'Recipient',
        recipientPhone: recipientPhone || '',
        instructions,
        deliveryFee,
        platformFee,
        courierEarnings: deliveryFee - platformFee,
        status: 'pending',
        paymentStatus: 'pending', // Will be paid on pickup
        customerId: user?.uid || null,
        customerEmail: user?.email || MohnMenuUser?.email || null,
        assignedCourierId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'quickDeliveries'), deliveryData);
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to create quick delivery:', err);
      setError('Failed to submit delivery request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent px-4 pt-24 pb-20">
        <motion.div
          className="w-full max-w-md text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="bg-white rounded-[3rem] shadow-[0_20px_100px_rgba(0,0,0,0.05)] border border-zinc-100 p-10">
            <div className="text-5xl mb-4">📦</div>
            <h1 className="text-3xl font-black text-black mb-3">
              Delivery Requested!
            </h1>
            <p className="text-sm text-zinc-500 mb-6">
              A community courier will pick up your {selectedSize.label.toLowerCase()} soon.
              You&apos;ll receive updates as your delivery progresses.
            </p>
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-emerald-700">Delivery Fee</span>
                <span className="text-lg font-black text-emerald-700">${deliveryFee.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setPickupAddress('');
                  setDropoffAddress('');
                  setDescription('');
                  setRecipientName('');
                  setRecipientPhone('');
                  setInstructions('');
                }}
                className="flex-1 py-3 bg-zinc-100 text-zinc-700 rounded-full font-bold text-sm hover:bg-zinc-200 transition-all"
              >
                New Delivery
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex-1 py-3 bg-black text-white rounded-full font-bold text-sm hover:bg-zinc-800 transition-all"
              >
                Go Home
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent px-4 pt-24 pb-20">
      <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-white rounded-[3rem] shadow-[0_20px_100px_rgba(0,0,0,0.05)] border border-zinc-100 p-10 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block px-4 py-1.5 mb-4 rounded-full bg-blue-50 border border-blue-100 text-xs font-black uppercase tracking-widest text-blue-600"
            >
              Quick Delivery
            </motion.div>
            <h1 className="text-3xl font-black text-black mb-3">
              Send Anything<span className="text-blue-600">.</span>
            </h1>
            <p className="text-zinc-500 font-medium text-sm">
              Letters, documents, packages — delivered by a local community courier in your neighborhood.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Package Size */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-3 ml-1">
                What are you sending?
              </label>
              <div className="space-y-2">
                {PACKAGE_SIZES.map((size) => (
                  <button
                    key={size.value}
                    type="button"
                    onClick={() => setPackageSize(size.value)}
                    className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center justify-between ${
                      packageSize === size.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-zinc-100 bg-zinc-50 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <size.icon className={`text-xl ${packageSize === size.value ? 'text-blue-600' : 'text-zinc-400'}`} />
                      <div>
                        <p className={`font-bold text-sm ${packageSize === size.value ? 'text-blue-700' : 'text-zinc-700'}`}>
                          {size.label}
                        </p>
                        <p className="text-[10px] text-zinc-400">{size.desc}</p>
                      </div>
                    </div>
                    <span className={`font-black text-sm ${packageSize === size.value ? 'text-blue-600' : 'text-zinc-400'}`}>
                      ${size.baseFee.toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Description (optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-5 py-4 border border-zinc-100 rounded-2xl bg-zinc-50 text-black font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-zinc-300"
                placeholder="e.g. Manila envelope, birthday gift..."
              />
            </div>

            {/* Pickup Address */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">
                <FaMapMarkerAlt className="inline text-emerald-500 mr-1" /> Pickup Address
              </label>
              <AddressAutocomplete
                value={pickupAddress}
                onChange={setPickupAddress}
                onSelect={(parsed) => setPickupAddress(parsed.formatted)}
                placeholder="Where to pick up"
                inputClassName="border-zinc-100 bg-zinc-50 font-bold rounded-2xl"
              />
            </div>

            {/* Drop-off Address */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">
                <FaMapMarkerAlt className="inline text-red-500 mr-1" /> Drop-off Address
              </label>
              <AddressAutocomplete
                value={dropoffAddress}
                onChange={setDropoffAddress}
                onSelect={(parsed) => setDropoffAddress(parsed.formatted)}
                placeholder="Where to deliver"
                inputClassName="border-zinc-100 bg-zinc-50 font-bold rounded-2xl"
              />
            </div>

            {/* Sender Info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Your Name</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 border border-zinc-100 rounded-2xl bg-zinc-50 text-black font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-zinc-300 text-sm"
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Your Phone</label>
                <input
                  type="tel"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 border border-zinc-100 rounded-2xl bg-zinc-50 text-black font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-zinc-300 text-sm"
                  placeholder="(804) 555-1234"
                />
              </div>
            </div>

            {/* Recipient Info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Recipient Name</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-4 py-3.5 border border-zinc-100 rounded-2xl bg-zinc-50 text-black font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-zinc-300 text-sm"
                  placeholder="Jane Doe (optional)"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Recipient Phone</label>
                <input
                  type="tel"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full px-4 py-3.5 border border-zinc-100 rounded-2xl bg-zinc-50 text-black font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-zinc-300 text-sm"
                  placeholder="(804) 555-5678"
                />
              </div>
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Delivery Instructions</label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full px-5 py-4 border border-zinc-100 rounded-2xl bg-zinc-50 text-black font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-zinc-300 text-sm resize-none"
                rows={2}
                placeholder="Leave at front door, ring doorbell, etc."
              />
            </div>

            {/* Pricing Summary */}
            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-zinc-500">Delivery Fee</span>
                <span className="text-sm font-bold text-black">${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-zinc-400">Courier earns</span>
                <span className="text-xs text-emerald-600 font-bold">${(deliveryFee - platformFee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-zinc-400">Platform fee</span>
                <span className="text-xs text-zinc-400">${platformFee.toFixed(2)}</span>
              </div>
              <div className="border-t border-zinc-200 pt-2 mt-2 flex justify-between items-center">
                <span className="text-sm font-black text-black">Total</span>
                <span className="text-lg font-black text-black">${totalFee.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full group bg-blue-600 text-white py-5 rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:bg-blue-700 transition-all active:scale-[0.98] shadow-xl shadow-blue-600/20 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Request Courier'}
              {!loading && <FaArrowRight className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          {/* Info */}
          <div className="mt-8 p-5 bg-blue-50 rounded-2xl border border-blue-100">
            <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-3">How it works</p>
            <ul className="space-y-2">
              {[
                'Submit your delivery request',
                'A nearby community courier accepts',
                'Courier picks up and delivers your item',
                'Track progress in real-time',
              ].map((step, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-zinc-600">
                  <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-black shrink-0">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
