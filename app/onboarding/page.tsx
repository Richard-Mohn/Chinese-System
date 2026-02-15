/**
 * Business Onboarding — /onboarding
 *
 * After an owner registers, they come here to create their business.
 * Collects: business name, type, address, phone, and auto-generates a slug.
 * Creates the business document in Firestore, updates the user's role to 'owner',
 * and links the business to the user.
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, setDoc, collection, query, where, getDocs, updateDoc, addDoc } from 'firebase/firestore';
import { getStarterMenu } from '@/data/starterMenus';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowRight, FaArrowLeft, FaStore, FaUtensils, FaCheck, FaMapMarkerAlt } from 'react-icons/fa';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import type { MohnMenuBusiness } from '@/lib/types';

// ─── Helpers ──────────────────────────────────────────────────

function generateSlug(name: string, city: string): string {
  return `${name}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
];

const BUSINESS_TYPES = [
  { value: 'restaurant', label: 'Restaurant', icon: '🍽️', desc: 'Full-service or fast casual' },
  { value: 'chinese_restaurant', label: 'Chinese Restaurant', icon: '🥡', desc: 'Chinese cuisine' },
  { value: 'pizza', label: 'Pizza Shop', icon: '🍕', desc: 'Pizza & Italian' },
  { value: 'mexican', label: 'Mexican Restaurant', icon: '🌮', desc: 'Mexican cuisine' },
  { value: 'bakery', label: 'Bakery / Café', icon: '🧁', desc: 'Baked goods & coffee' },
  { value: 'convenience_store', label: 'Convenience Store', icon: '🏪', desc: 'Snacks, drinks, essentials' },
  { value: 'grocery', label: 'Grocery Store', icon: '🛒', desc: 'Fresh produce & groceries' },
  { value: 'food_truck', label: 'Food Truck', icon: '🚚', desc: 'Mobile food service' },
  { value: 'bar_grill', label: 'Bar & Grill', icon: '🍺', desc: 'Drinks & pub food' },
  { value: 'boutique', label: 'Boutique / Small Shop', icon: '👗', desc: 'Clothing, gifts & accessories' },
  { value: 'antique_shop', label: 'Antique Shop', icon: '🏺', desc: 'Antiques, vintage & collectibles' },
  { value: 'market', label: 'Market / Farm Stand', icon: '🧺', desc: 'Farmers market & local goods' },
  { value: 'other', label: 'Other', icon: '🏬', desc: 'Something else' },
];

// ─── Component ────────────────────────────────────────────────

export default function OnboardingPage() {
  const { user, MohnMenuUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  // Form fields
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [description, setDescription] = useState('');

  const slug = generateSlug(businessName, city);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/register');
    }
  }, [user, authLoading, router]);

  // If already an owner with a business, redirect to dashboard
  useEffect(() => {
    if (!authLoading && MohnMenuUser?.role === 'owner' && MohnMenuUser.businessIds?.length > 0) {
      router.push('/owner');
    }
  }, [authLoading, MohnMenuUser, router]);

  // Check slug availability when it changes
  useEffect(() => {
    if (!slug || slug.length < 3) {
      setSlugAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingSlug(true);
      try {
        const q = query(collection(db, 'businesses'), where('slug', '==', slug));
        const snapshot = await getDocs(q);
        setSlugAvailable(snapshot.empty);
      } catch {
        setSlugAvailable(null);
      } finally {
        setCheckingSlug(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [slug]);

  const handleCreateBusiness = async () => {
    if (!user || !MohnMenuUser) return;
    if (!businessName.trim() || !businessType || !phone || !address || !city || !state || !zipCode) {
      setError('Please fill in all required fields.');
      return;
    }
    if (slugAvailable === false) {
      setError('This business URL is already taken. Try a different name.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const now = new Date();
      const trialEnds = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      let resolvedLatitude = latitude;
      let resolvedLongitude = longitude;

      if (resolvedLatitude === null || resolvedLongitude === null) {
        const coords = await geocodeAddress(`${address.trim()}, ${city.trim()}, ${state.toUpperCase()} ${zipCode.trim()}`);
        if (coords) {
          resolvedLatitude = coords.lat;
          resolvedLongitude = coords.lng;
        }
      }

      // Create business document
      const businessRef = doc(collection(db, 'businesses'));
      const businessId = businessRef.id;

      const newBusiness = {
        businessId,
        name: businessName.trim(),
        slug,
        ownerId: user.uid,
        type: businessType as MohnMenuBusiness['type'],
        description: description.trim() || undefined,
        tier: 'starter' as const,
        subscriptionStatus: 'trial' as const,
        subscriptionStartDate: now.toISOString(),
        subscriptionEndDate: trialEnds.toISOString(),
        brandColors: {
          primary: '#000000',
          secondary: '#4F46E5',
          accent: '#10B981',
        },
        ownerEmail: MohnMenuUser.email || user.email || '',
        ownerPhone: phone.trim(),
        businessPhone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.toUpperCase(),
        zipCode: zipCode.trim(),
        latitude: resolvedLatitude ?? 0,
        longitude: resolvedLongitude ?? 0,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        website: {
          enabled: true,
          setupComplete: true,
          customDomainEnabled: false,
          selectedServices: [],
          selectedStates: [],
          selectedCities: [],
          menuHighlights: [],
          specialties: [],
          content: {},
          seo: {},
        },
        settings: {
          orderingEnabled: true,
          primaryColor: '#000000',
          cashPaymentsEnabled: true,
          useMarketplaceDrivers: false,
          thirdPartyDelivery: {
            enabled: false,
          },
          pricing: {
            deliveryFee: 3.99,
            minimumOrder: 10,
            taxRate: 0.07,
          },
        },
        features: {
          liveOrderTracking: false,
          driverManagement: false,
          kitchenDisplaySystem: false,
          loyaltyProgram: false,
          liveStreaming: false,
          batchRouting: false,
          advancedAnalytics: false,
          apiAccess: false,
          customIntegrations: false,
          seoWebsite: true,
        },
        serviceAreas: [city.trim()],
        services: ['takeout', 'delivery'],
        isActive: true,
        isLocked: false,
        maxInhouseDrivers: 0,
        inHouseDriverIds: [],
        staffCount: 1,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      // Save business
      await setDoc(businessRef, newBusiness);

      // Seed starter menu items based on business type
      const starterItems = getStarterMenu(businessType);
      const menuRef = collection(db, 'businesses', businessId, 'menuItems');
      await Promise.all(
        starterItems.map(item =>
          addDoc(menuRef, {
            ...item,
            available: true,
            popular: false,
            options: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        )
      );

      // Update user role to 'owner' and link business
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        role: 'owner',
        businessIds: [businessId],
        activeBusinessId: businessId,
        updatedAt: new Date().toISOString(),
      });

      // Redirect to owner dashboard (force reload to pick up new role)
      window.location.href = '/owner';
    } catch (err) {
      console.error('Business creation error:', err);
      setError('Failed to create business. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white/90">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white rounded-[2rem] shadow-[0_20px_100px_rgba(0,0,0,0.06)] border border-zinc-100 overflow-hidden">
          {/* Header */}
          <div className="bg-black text-white p-8 text-center">
            <h1 className="text-3xl font-black mb-2">Set Up Your Business</h1>
            <p className="text-zinc-400 font-medium">
              Get your online ordering system running in under 2 minutes. No setup fees.
            </p>
            {/* Progress */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {[1, 2, 3].map(s => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all ${
                    s <= step ? 'bg-white w-12' : 'bg-zinc-700 w-8'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="p-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold"
              >
                {error}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {/* ── Step 1: Business Type ─────────────────────── */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-black text-black mb-1">What type of business do you have?</h2>
                    <p className="text-zinc-400 text-sm">Select the category that best fits your business.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {BUSINESS_TYPES.map(type => (
                      <button
                        key={type.value}
                        onClick={() => setBusinessType(type.value)}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          businessType === type.value
                            ? 'border-black bg-black text-white'
                            : 'border-zinc-200 hover:border-zinc-400'
                        }`}
                      >
                        <span className="text-2xl block mb-2">{type.icon}</span>
                        <span className="font-bold text-sm block">{type.label}</span>
                        <span className={`text-xs ${businessType === type.value ? 'text-zinc-300' : 'text-zinc-400'}`}>
                          {type.desc}
                        </span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    disabled={!businessType}
                    className="w-full py-4 bg-black text-white rounded-full font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Continue <FaArrowRight className="text-sm" />
                  </button>
                </motion.div>
              )}

              {/* ── Step 2: Business Details ──────────────────── */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div>
                    <h2 className="text-xl font-black text-black mb-1">Business Details</h2>
                    <p className="text-zinc-400 text-sm">Tell us about your business.</p>
                  </div>

                  {/* Business Name */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={e => setBusinessName(e.target.value)}
                      className="w-full px-5 py-3.5 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="China Wok"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">
                      Short Description
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="w-full px-5 py-3.5 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="Authentic Chinese cuisine made fresh daily"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">
                      Business Phone *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full px-5 py-3.5 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="(804) 555-1234"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="px-6 py-4 border border-zinc-200 rounded-full font-bold text-sm text-zinc-600 hover:border-zinc-400 transition-colors"
                    >
                      <FaArrowLeft />
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      disabled={!businessName.trim() || !phone.trim()}
                      className="flex-1 py-4 bg-black text-white rounded-full font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Continue <FaArrowRight className="text-sm" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── Step 3: Address & Create ──────────────────── */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div>
                    <h2 className="text-xl font-black text-black mb-1">Business Location</h2>
                    <p className="text-zinc-400 text-sm">Where is your business located?</p>
                  </div>

                  <AddressAutocomplete
                    value={address}
                    onChange={setAddress}
                    onSelect={(parsed) => {
                      setAddress(parsed.street);
                      setCity(parsed.city);
                      setState(parsed.state);
                      setZipCode(parsed.zipCode);
                      setLatitude(parsed.lat);
                      setLongitude(parsed.lng);
                    }}
                    label="Street Address *"
                    placeholder="Start typing your business address…"
                    inputClassName="border-zinc-200 font-medium"
                    required
                  />

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        className="w-full px-4 py-3.5 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="Richmond"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">
                        State *
                      </label>
                      <select
                        title="State"
                        value={state}
                        onChange={e => setState(e.target.value)}
                        className="w-full px-4 py-3.5 border border-zinc-200 rounded-xl text-sm font-bold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-black"
                      >
                        <option value="">—</option>
                        {US_STATES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">
                        ZIP *
                      </label>
                      <input
                        type="text"
                        value={zipCode}
                        onChange={e => setZipCode(e.target.value)}
                        className="w-full px-4 py-3.5 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="23220"
                      />
                    </div>
                  </div>

                  {/* Slug Preview */}
                  {slug.length >= 3 && (
                    <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200">
                      <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">
                        Your Ordering URL
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-400">mohnmenu.com/</span>
                        <span className="text-sm font-black text-black">{slug}</span>
                        {checkingSlug && (
                          <div className="w-4 h-4 border-2 border-zinc-300 border-t-black rounded-full animate-spin" />
                        )}
                        {!checkingSlug && slugAvailable === true && (
                          <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
                            <FaCheck className="text-[10px]" /> Available
                          </span>
                        )}
                        {!checkingSlug && slugAvailable === false && (
                          <span className="text-red-500 text-xs font-bold">Taken</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  <div className="bg-black text-white rounded-2xl p-5 space-y-2">
                    <h3 className="font-bold text-sm mb-3">Ready to Launch</h3>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-2xl">{BUSINESS_TYPES.find(t => t.value === businessType)?.icon || '🏬'}</span>
                      <div>
                        <p className="font-bold">{businessName || 'Your Business'}</p>
                        <p className="text-zinc-400 text-xs">
                          {city && state ? `${city}, ${state}` : 'Location TBD'}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-zinc-400 pt-2 border-t border-zinc-800 space-y-1">
                      <p>✓ Free online ordering system</p>
                      <p>✓ SEO website with your menu</p>
                      <p>✓ No setup fees · No contracts</p>
                      <p>✓ Only 1% per online order</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(2)}
                      className="px-6 py-4 border border-zinc-200 rounded-full font-bold text-sm text-zinc-600 hover:border-zinc-400 transition-colors"
                    >
                      <FaArrowLeft />
                    </button>
                    <button
                      onClick={handleCreateBusiness}
                      disabled={saving || !address.trim() || !city.trim() || !state || !zipCode.trim() || slugAvailable === false}
                      className="flex-1 py-4 bg-black text-white rounded-full font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Creating Business...
                        </>
                      ) : (
                        <>
                          Launch My Business <FaArrowRight className="text-sm" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-400 mt-6">
          Already set up? <a href="/login" className="font-bold text-black hover:underline">Sign in</a>
        </p>
      </motion.div>
    </div>
  );
}

async function geocodeAddress(fullAddress: string): Promise<{ lat: number; lng: number } | null> {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) return null;

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${key}`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const loc = data?.results?.[0]?.geometry?.location;
    if (typeof loc?.lat === 'number' && typeof loc?.lng === 'number') {
      return { lat: loc.lat, lng: loc.lng };
    }
    return null;
  } catch {
    return null;
  }
}
