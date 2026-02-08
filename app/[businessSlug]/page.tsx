/**
 * Tenant Homepage — /{businessSlug}
 * 
 * Full SEO-optimized homepage for a tenant's auto-generated website.
 * Server-rendered on demand from Firestore data.
 * Dynamically renders sections based on business type and features:
 *   - Bar/Restaurant: Featured drinks, entertainment (jukebox/karaoke),
 *     reservations CTA, happy hour, specialties
 *   - All types: Services, menu highlights, about, service areas, CTA
 */

import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MohnMenuBusiness } from '@/lib/types';
import { SERVICE_INFO } from '@/lib/types';
import { headers } from 'next/headers';
import { getServerBasePath, getServerOrderPath } from '@/lib/tenant-links';
import TenantHeroActions from '@/components/TenantHeroActions';
import TenantCTA from '@/components/TenantCTA';
import LiveStaffSection from '@/components/LiveStaffSection';

/* eslint-disable @typescript-eslint/no-explicit-any */

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

interface FeaturedItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  popular?: boolean;
  isSpicy?: boolean;
}

async function getFeaturedMenuItems(businessId: string): Promise<FeaturedItem[]> {
  try {
    const itemsRef = collection(db, 'businesses', businessId, 'menuItems');
    const snap = await getDocs(itemsRef);
    if (snap.empty) return [];
    const all = snap.docs.map(d => {
      const data = d.data() as any;
      let price = 0;
      if (data.prices && typeof data.prices === 'object') {
        const vals = Object.values(data.prices).filter((v: any) => typeof v === 'number') as number[];
        price = vals.length > 0 ? Math.min(...vals) : Number(data.price) || 0;
      } else {
        price = Number(data.price) || 0;
      }
      return {
        id: d.id,
        name: data.name || '',
        description: data.description || '',
        category: data.category || '',
        price,
        popular: data.popular || false,
        isSpicy: data.isSpicy || false,
      };
    });
    // Return popular items first, then fill to 8
    const popular = all.filter(i => i.popular);
    const rest = all.filter(i => !i.popular).slice(0, 8 - popular.length);
    return [...popular, ...rest].slice(0, 8);
  } catch {
    return [];
  }
}

const BAR_TYPES = ['bar_grill', 'restaurant', 'chinese_restaurant'];

export default async function TenantHomePage({
  params,
}: {
  params: Promise<{ businessSlug: string }>;
}) {
  const { businessSlug } = await params;
  const business = await getBusinessBySlug(businessSlug);
  const headersList = await headers();
  const customDomainHeader = headersList.get('x-custom-domain');
  
  if (!business || !business.website?.enabled) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-black mb-4">404</h1>
          <p className="text-zinc-500">This business website is not available.</p>
        </div>
      </div>
    );
  }

  const basePath = getServerBasePath(businessSlug, customDomainHeader);
  const orderPath = getServerOrderPath(businessSlug, customDomainHeader);
  const website = business.website;
  const content = website.content || {};
  const isBarType = BAR_TYPES.includes(business.type);
  const hasEntertainment = (business as any).entertainment?.jukeboxEnabled;
  const hasReservations = (business as any).features?.reservations || (business as any).reservationSettings?.enabled;
  const specialties = website.specialties || [];
  const menuHighlights = website.menuHighlights || [];
  const primaryColor = business.brandColors?.primary || '#4F46E5';

  // Fetch featured menu items server-side
  const featuredItems = await getFeaturedMenuItems(business.businessId);

  return (
    <div className="bg-white">
      {/* ─── Hero Section ──────────────────────────────────────── */}
      <section className="relative pt-24 pb-32 px-4 overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10 text-center">
          <p className="text-sm font-black uppercase tracking-widest mb-6" style={{ color: primaryColor }}>
            {content.tagline || `Welcome to ${business.name}`}
          </p>
          
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-black mb-8 leading-[0.9]">
            {content.heroTitle || business.name}
          </h1>
          
          <p className="text-xl md:text-2xl text-zinc-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            {content.heroSubtitle || business.description || `Serving the best food in ${business.city}, ${business.state}`}
          </p>

          <TenantHeroActions
            business={business}
            orderPath={orderPath}
            menuPath={`${basePath}/menu`}
          />
        </div>

        {/* Decorative background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none opacity-20">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full blur-[120px]" style={{ backgroundColor: primaryColor + '30' }} />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-[150px]" style={{ backgroundColor: primaryColor + '20' }} />
        </div>
      </section>

      {/* ─── Specialties / What We're Known For ─────────────── */}
      {specialties.length > 0 && (
        <section className="py-6 bg-zinc-950 text-white border-y border-zinc-800">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="flex items-center justify-center gap-6 md:gap-10 flex-wrap">
              {specialties.map((s: string, i: number) => (
                <span key={i} className="flex items-center gap-2 text-sm font-bold text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                  {s}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Featured Menu Items ──────────────────────────────── */}
      {featuredItems.length > 0 && (
        <section className="py-24 px-4 bg-zinc-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <p className="text-sm font-black uppercase tracking-widest mb-3" style={{ color: primaryColor }}>
                Our Menu
              </p>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-black mb-4">
                {isBarType ? 'Popular Picks' : 'Fan Favorites'}
              </h2>
              <p className="text-lg text-zinc-500 max-w-xl mx-auto">
                {isBarType
                  ? 'Our most-ordered drinks and dishes — straight from the menu.'
                  : 'The dishes our customers keep coming back for.'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredItems.map((item) => (
                <a
                  key={item.id}
                  href={orderPath}
                  className="group bg-white p-6 rounded-2xl border border-zinc-200 hover:border-zinc-900 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {item.popular && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black rounded-full uppercase">Popular</span>
                      )}
                      {item.isSpicy && (
                        <span className="text-red-500 text-xs">🌶️</span>
                      )}
                    </div>
                    <span className="text-sm font-black" style={{ color: primaryColor }}>
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                  <h3 className="font-bold text-black text-sm mb-1 group-hover:opacity-80 transition-opacity">{item.name}</h3>
                  <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2">{item.description}</p>
                  <p className="text-[10px] font-bold text-zinc-400 mt-3 uppercase tracking-wider">{item.category}</p>
                </a>
              ))}
            </div>

            <div className="text-center mt-10">
              <a
                href={`${basePath}/menu`}
                className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-full font-bold hover:bg-zinc-800 transition-all"
              >
                View Full Menu
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ─── Who's Working Tonight (live real-time staff) ─── */}
      {isBarType && (
        <LiveStaffSection
          businessId={business.businessId}
          primaryColor={primaryColor}
          orderPath={orderPath}
        />
      )}

      {/* ─── Reservations CTA (bar/restaurant) ────────────────── */}
      {hasReservations && (
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="bg-zinc-950 rounded-[2rem] p-10 md:p-16 relative overflow-hidden">
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div>
                  <p className="text-sm font-black uppercase tracking-widest text-purple-400 mb-4">Reservations</p>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-4">
                    {isBarType ? 'Reserve Your Spot' : 'Book a Table'}
                  </h2>
                  <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                    {isBarType
                      ? 'Skip the wait. Reserve a table, booth, or VIP area — perfect for groups, date nights, or just guaranteeing your favorite seat at the bar.'
                      : 'Plan ahead and reserve your table. We\'ll have everything ready when you arrive.'
                    }
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={`${basePath}/reserve`}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 text-white rounded-full font-bold hover:bg-purple-500 transition-all shadow-xl shadow-purple-600/20"
                    >
                      📅 Reserve Now
                    </a>
                    <a
                      href={orderPath}
                      className="inline-flex items-center gap-2 px-8 py-4 border border-zinc-700 text-white rounded-full font-bold hover:border-white transition-all"
                    >
                      🍽️ Dine-In Order
                    </a>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: '🪑', label: 'Indoor Seating', desc: 'Comfortable dining room' },
                    { icon: '🌿', label: 'Patio', desc: 'Fresh air & sunshine' },
                    { icon: isBarType ? '🍺' : '🍽️', label: isBarType ? 'Bar Seats' : 'Private Room', desc: isBarType ? 'First-come bar seating' : 'Groups & events' },
                    { icon: '⭐', label: 'VIP', desc: 'Premium reserved area' },
                  ].map((opt, i) => (
                    <div key={i} className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
                      <span className="text-2xl mb-2 block">{opt.icon}</span>
                      <p className="font-bold text-white text-sm">{opt.label}</p>
                      <p className="text-zinc-500 text-xs">{opt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
            </div>
          </div>
        </section>
      )}

      {/* ─── Entertainment (Jukebox/Karaoke) ──────────────────── */}
      {hasEntertainment && (
        <section className="py-24 px-4 bg-gradient-to-b from-purple-950 to-zinc-950 text-white">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <p className="text-sm font-black uppercase tracking-widest text-purple-400 mb-3">Entertainment</p>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
                {(business as any).entertainment?.karaokeEnabled ? 'Jukebox & Karaoke' : 'Digital Jukebox'}
              </h2>
              <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                Pick the music from your phone. Pay with credits. Your song, your vibe — no more fighting over the aux.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
                <span className="text-4xl mb-4 block">🎵</span>
                <h3 className="text-lg font-bold text-white mb-2">Browse & Request</h3>
                <p className="text-zinc-400 text-sm">Search any song, add it to the queue from your phone. See what&apos;s playing and what&apos;s next.</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
                <span className="text-4xl mb-4 block">💰</span>
                <h3 className="text-lg font-bold text-white mb-2">Pay Per Song</h3>
                <p className="text-zinc-400 text-sm">
                  Just ${((business as any).entertainment?.creditPrice || 0.50).toFixed(2)} per song credit. Buy a pack and queue up your favorites all night.
                </p>
              </div>
              {(business as any).entertainment?.karaokeEnabled ? (
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
                  <span className="text-4xl mb-4 block">🎤</span>
                  <h3 className="text-lg font-bold text-white mb-2">Karaoke Mode</h3>
                  <p className="text-zinc-400 text-sm">Mark your song as karaoke and the lyrics appear on the big screen. Sing your heart out.</p>
                </div>
              ) : (
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
                  <span className="text-4xl mb-4 block">📱</span>
                  <h3 className="text-lg font-bold text-white mb-2">From Your Phone</h3>
                  <p className="text-zinc-400 text-sm">No app to download. Just scan, browse, and play through the bar&apos;s speakers via Bluetooth/WiFi.</p>
                </div>
              )}
            </div>

            <div className="text-center">
              <a
                href={`${basePath}/jukebox`}
                className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold text-lg hover:shadow-xl hover:shadow-purple-500/20 transition-all"
              >
                🎵 Open Jukebox
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ─── Services Section ──────────────────────────────────── */}
      {website.selectedServices && website.selectedServices.length > 0 && (
        <section className="py-24 px-4 bg-zinc-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <p className="text-sm font-black uppercase tracking-widest mb-3" style={{ color: primaryColor }}>
                What We Offer
              </p>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-black mb-4">
                Our Services
              </h2>
              <p className="text-lg text-zinc-500 max-w-xl mx-auto">
                Everything you need, all in one place.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {website.selectedServices.map((serviceKey: string) => {
                const info = SERVICE_INFO[serviceKey];
                if (!info) return null;
                const customDesc = content.serviceDescriptions?.[serviceKey];
                
                return (
                  <div
                    key={serviceKey}
                    className="group bg-white p-8 rounded-3xl border border-zinc-200 hover:border-black transition-all duration-500"
                  >
                    <h3 className="text-xl font-bold text-black mb-3 group-hover:opacity-70 transition-opacity">
                      {info.label}
                    </h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                      {customDesc || info.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── Menu Highlights Banner ───────────────────────────── */}
      {menuHighlights.length > 0 && (
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-black">
                {isBarType ? '🔥 Must-Try' : '⭐ Chef\'s Picks'}
              </h2>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {menuHighlights.map((item: string, i: number) => (
                <a
                  key={i}
                  href={orderPath}
                  className="px-6 py-3 bg-zinc-900 text-white rounded-full text-sm font-bold hover:scale-105 transition-all"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── How It Works ──────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-sm font-black uppercase tracking-widest mb-3" style={{ color: primaryColor }}>Simple & Fast</p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-black mb-4">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-black" style={{ color: primaryColor }}>
                1
              </div>
              <h3 className="text-xl font-bold mb-3">
                {isBarType ? 'Scan & Browse' : 'Browse & Order'}
              </h3>
              <p className="text-zinc-500">
                {isBarType
                  ? 'Open the menu on your phone — no app needed. Browse drinks, food, and specials.'
                  : 'Browse our menu and place your order online in seconds.'
                }
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-black" style={{ color: primaryColor }}>
                2
              </div>
              <h3 className="text-xl font-bold mb-3">
                {isBarType ? 'Order & Pay' : 'We Prepare It'}
              </h3>
              <p className="text-zinc-500">
                {isBarType
                  ? 'Add to cart, pay from your phone — card, crypto, or start a tab. No waiting for the bartender.'
                  : 'Your order is freshly prepared with care and quality ingredients.'
                }
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-black" style={{ color: primaryColor }}>
                3
              </div>
              <h3 className="text-xl font-bold mb-3">
                {isBarType ? 'Get Notified' : 'Enjoy!'}
              </h3>
              <p className="text-zinc-500">
                {isBarType
                  ? 'Get a notification when your order is ready. Pick up at the bar or we\'ll bring it to your table.'
                  : 'Pick up or get it delivered straight to your door with real-time tracking.'
                }
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Hours & Location ─────────────────────────────────── */}
      {(content.businessHours || business.address) && (
        <section className="py-20 px-4 bg-zinc-50">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-sm font-black uppercase tracking-widest mb-3" style={{ color: primaryColor }}>Visit Us</p>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-black mb-6">
                  Hours & Location
                </h2>
                {content.businessHours && (
                  <div className="mb-6">
                    <h3 className="font-bold text-zinc-700 mb-2">Hours</h3>
                    <p className="text-zinc-500 whitespace-pre-line leading-relaxed">{content.businessHours.split('|').join('\n')}</p>
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-zinc-700 mb-2">Address</h3>
                  <p className="text-zinc-500">
                    {business.address}<br/>
                    {business.city}, {business.state} {business.zipCode}
                  </p>
                </div>
                {business.businessPhone && (
                  <div className="mt-4">
                    <h3 className="font-bold text-zinc-700 mb-2">Phone</h3>
                    <a href={`tel:${business.businessPhone}`} className="text-zinc-500 hover:text-black transition-colors font-medium">
                      {business.businessPhone}
                    </a>
                  </div>
                )}
              </div>

              {/* Quick action cards */}
              <div className="grid grid-cols-2 gap-4">
                <a
                  href={orderPath}
                  className="bg-white rounded-2xl p-6 border border-zinc-200 hover:border-black transition-all text-center group"
                >
                  <span className="text-3xl mb-3 block">🛒</span>
                  <p className="font-bold text-black text-sm group-hover:opacity-70 transition-opacity">Order Online</p>
                  <p className="text-zinc-500 text-xs mt-1">Delivery or Pickup</p>
                </a>
                <a
                  href={`${basePath}/menu`}
                  className="bg-white rounded-2xl p-6 border border-zinc-200 hover:border-black transition-all text-center group"
                >
                  <span className="text-3xl mb-3 block">📋</span>
                  <p className="font-bold text-black text-sm group-hover:opacity-70 transition-opacity">View Menu</p>
                  <p className="text-zinc-500 text-xs mt-1">See full menu</p>
                </a>
                {hasReservations && (
                  <a
                    href={`${basePath}/reserve`}
                    className="bg-white rounded-2xl p-6 border border-zinc-200 hover:border-black transition-all text-center group"
                  >
                    <span className="text-3xl mb-3 block">📅</span>
                    <p className="font-bold text-black text-sm group-hover:opacity-70 transition-opacity">Reservations</p>
                    <p className="text-zinc-500 text-xs mt-1">Book a table</p>
                  </a>
                )}
                {hasEntertainment && (
                  <a
                    href={`${basePath}/jukebox`}
                    className="bg-white rounded-2xl p-6 border border-zinc-200 hover:border-black transition-all text-center group"
                  >
                    <span className="text-3xl mb-3 block">🎵</span>
                    <p className="font-bold text-black text-sm group-hover:opacity-70 transition-opacity">Jukebox</p>
                    <p className="text-zinc-500 text-xs mt-1">Pick the music</p>
                  </a>
                )}
                {!hasReservations && !hasEntertainment && (
                  <a
                    href={`${basePath}/contact`}
                    className="bg-white rounded-2xl p-6 border border-zinc-200 hover:border-black transition-all text-center group col-span-2"
                  >
                    <span className="text-3xl mb-3 block">📞</span>
                    <p className="font-bold text-black text-sm group-hover:opacity-70 transition-opacity">Contact Us</p>
                    <p className="text-zinc-500 text-xs mt-1">Get in touch</p>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── About Preview ──────────────────────────────────────── */}
      {(content.aboutContent || content.aboutMission) && (
        <section className="py-24 px-4 bg-zinc-900 text-white">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">
                  {content.aboutTitle || `About ${business.name}`}
                </h2>
                <p className="text-zinc-400 text-lg leading-relaxed mb-4">
                  {content.aboutContent || business.description}
                </p>
                {content.aboutValues && (
                  <p className="text-zinc-500 italic mb-8">&ldquo;{content.aboutValues}&rdquo;</p>
                )}
                <a 
                  href={`${basePath}/about`}
                  className="inline-flex items-center gap-2 text-white font-bold border-b-2 border-white pb-1 hover:gap-4 transition-all"
                >
                  Learn more about us
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
              <div className="space-y-4">
                {content.aboutMission && (
                  <div className="bg-zinc-800 p-8 rounded-3xl">
                    <h3 className="text-sm font-black uppercase tracking-widest mb-3" style={{ color: primaryColor }}>Our Mission</h3>
                    <p className="text-zinc-300 leading-relaxed">{content.aboutMission}</p>
                  </div>
                )}
                {content.contactContent && (
                  <div className="bg-zinc-800 p-8 rounded-3xl">
                    <h3 className="text-sm font-black uppercase tracking-widest text-amber-400 mb-3">Good to Know</h3>
                    <p className="text-zinc-300 leading-relaxed">{content.contactContent}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── Service Areas ──────────────────────────────────────── */}
      {website.selectedCities && website.selectedCities.length > 0 && (
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-black mb-4">
                {isBarType ? 'Serving' : 'Areas We Serve'}
              </h2>
              <p className="text-lg text-zinc-500">
                Proudly serving these communities.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {website.selectedCities.map((city: string) => {
                const state = website.selectedStates?.[0] || business.state;
                const locationSlug = `${city.toLowerCase().replace(/\s+/g, '-')}-${state.toLowerCase()}`;
                return (
                  <a
                    key={city}
                    href={`${basePath}/${locationSlug}`}
                    className="px-6 py-3 bg-zinc-100 rounded-full text-sm font-bold text-zinc-700 hover:bg-black hover:text-white transition-all"
                  >
                    {city}, {state}
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA Section ──────────────────────────────────────── */}
      <TenantCTA business={business} menuPath={`${basePath}/menu`} />
    </div>
  );
}
