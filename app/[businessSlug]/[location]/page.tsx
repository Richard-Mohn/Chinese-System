/**
 * Tenant Location Page — /{businessSlug}/{location}
 *
 * Geo-targeted SEO page for a specific city.
 * Uses generateLocationContent() from seo-data.ts to produce rich,
 * unique intro copy and highlight bullets per city + cuisine type.
 */

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MohnMenuBusiness } from '@/lib/types';
import { SERVICE_INFO } from '@/lib/types';
import { generateLocationContent, CUISINE_TYPES } from '@/lib/seo-data';
import { parseLocation } from '@/lib/tenant-links';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { getServerBasePath, getServerOrderPath } from '@/lib/tenant-links';

// ISR: revalidate location pages every 1 hour
export const revalidate = 3600;
// Allow dynamic params so any city slug is rendered on-demand
export const dynamicParams = true;

async function getBusinessBySlug(slug: string): Promise<MohnMenuBusiness | null> {
  try {
    const businessesRef = collection(db, 'businesses');
    const q = query(businessesRef, where('slug', '==', slug));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as MohnMenuBusiness;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ businessSlug: string; location: string }>;
}): Promise<Metadata> {
  const { businessSlug, location } = await params;
  const business = await getBusinessBySlug(businessSlug);
  const parsed = parseLocation(location);
  
  if (!business || !parsed) return { title: 'Not Found' };
  
  const cuisineType = business.website?.cuisineType;
  const generated = generateLocationContent(
    business.name,
    parsed.city,
    parsed.state,
    cuisineType,
    business.website?.selectedServices,
  );
  
  return {
    title: generated.title,
    description: generated.intro.slice(0, 155),
    keywords: [
      `${business.name} ${parsed.city}`,
      `food delivery ${parsed.city}`,
      `restaurant ${parsed.city} ${parsed.state}`,
      `order online ${parsed.city}`,
      ...(business.website?.seo?.keywords || []),
    ].join(', '),
    robots: { index: true, follow: true },
  };
}

export default async function TenantLocationPage({
  params,
}: {
  params: Promise<{ businessSlug: string; location: string }>;
}) {
  const { businessSlug, location } = await params;
  const business = await getBusinessBySlug(businessSlug);
  const headersList = await headers();
  const basePath = getServerBasePath(businessSlug, headersList.get('x-custom-domain'));
  const orderPath = getServerOrderPath(businessSlug, headersList.get('x-custom-domain'));
  
  const parsed = parseLocation(location);

  if (!business || !business.website?.enabled || !parsed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black mb-4">Location Not Found</h1>
          <a href={basePath || '/'} className="text-indigo-600 font-bold hover:underline">← Back to homepage</a>
        </div>
      </div>
    );
  }

  // Validate this city is in the business's selected cities
  const isValidCity = business.website.selectedCities?.some(
    c => c.toLowerCase() === parsed.city.toLowerCase()
  );

  if (!isValidCity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black mb-4">Area Not Served</h1>
          <p className="text-zinc-500 mb-8">{business.name} doesn&apos;t currently serve {parsed.city}, {parsed.state}.</p>
          <a href={basePath || '/'} className="text-indigo-600 font-bold hover:underline">← Back to homepage</a>
        </div>
      </div>
    );
  }

  const cuisineType = business.website?.cuisineType;
  const cuisine = CUISINE_TYPES.find(c => c.key === cuisineType);
  const generated = generateLocationContent(
    business.name,
    parsed.city,
    parsed.state,
    cuisineType,
    business.website?.selectedServices,
  );

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <a href={basePath || '/'} className="text-sm text-indigo-600 font-bold hover:underline mb-6 block">
            ← Back to {business.name}
          </a>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-black mb-6">
            {generated.title}
          </h1>

          <p className="text-xl text-zinc-500 leading-relaxed max-w-2xl mb-8">
            {generated.intro}
          </p>

          <div className="flex items-center gap-2 text-sm text-zinc-400 font-bold mb-8">
            {cuisine && <span>{cuisine.emoji}</span>}
            <span>📍 {parsed.city}, {parsed.state}</span>
          </div>

          {business.settings?.orderingEnabled && (
            <a
              href={orderPath}
              className="inline-flex items-center gap-3 px-10 py-5 bg-black text-white rounded-full font-bold text-lg hover:bg-zinc-800 transition-all shadow-xl"
            >
              Order in {parsed.city} →
            </a>
          )}
        </div>
      </section>

      {/* Location Highlights */}
      {generated.highlights.length > 0 && (
        <section className="pb-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {generated.highlights.map((highlight, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-5 bg-zinc-50 rounded-2xl border border-zinc-100"
                >
                  <span className="text-indigo-500 font-black text-lg mt-0.5">✦</span>
                  <span className="text-zinc-700 font-medium text-sm leading-relaxed">{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services in this location */}
      {business.website.selectedServices && business.website.selectedServices.length > 0 && (
        <section className="pb-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-black mb-8">
              Services Available in {parsed.city}, {parsed.state}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {business.website.selectedServices.map(serviceKey => {
                const info = SERVICE_INFO[serviceKey];
                if (!info) return null;
                return (
                  <a
                    key={serviceKey}
                    href={`${basePath}/services/${serviceKey}`}
                    className="group p-6 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-black transition-all"
                  >
                    <h3 className="text-lg font-bold group-hover:text-indigo-600 transition-colors">
                      {info.label}
                    </h3>
                    <p className="text-zinc-500 text-sm mt-2">
                      {info.description}
                    </p>
                    <p className="text-xs text-zinc-400 mt-3 font-bold">
                      {info.label} in {parsed.city}, {parsed.state} →
                    </p>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Other locations */}
      {business.website.selectedCities && business.website.selectedCities.length > 1 && (
        <section className="pb-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-black mb-8">Other Areas We Serve</h2>
            <div className="flex flex-wrap gap-3">
              {business.website.selectedCities
                .filter(c => c.toLowerCase() !== parsed.city.toLowerCase())
                .map(city => {
                  const state = business.website.selectedStates?.[0] || business.state;
                  const slug = `${city.toLowerCase().replace(/\s+/g, '-')}-${state.toLowerCase()}`;
                  return (
                    <a
                      key={city}
                      href={`${basePath}/${slug}`}
                      className="px-5 py-2.5 bg-zinc-100 rounded-full text-sm font-bold text-zinc-700 hover:bg-black hover:text-white transition-all"
                    >
                      {city}, {state}
                    </a>
                  );
                })}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="pb-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-black text-white rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-black mb-4">
              Order from {business.name} in {parsed.city}
            </h2>
            <p className="text-zinc-400 mb-8">
              Fresh food, fast delivery, and real-time tracking in {parsed.city}, {parsed.state}.
            </p>
            {business.settings?.orderingEnabled && (
              <a 
                href={orderPath}
                className="inline-flex items-center gap-3 px-10 py-4 bg-white text-black rounded-full font-bold hover:bg-zinc-200 transition-all"
              >
                Start Your Order →
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
