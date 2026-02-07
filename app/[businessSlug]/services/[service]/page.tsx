/**
 * Tenant Service Page — /{businessSlug}/services/{service}
 *
 * Individual service page with rich SEO content.
 * Uses generateServiceContent() from seo-data.ts for unique, keyword-rich
 * title / intro / features list / FAQ per service + cuisine type.
 */

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MohnMenuBusiness } from '@/lib/types';
import { SERVICE_INFO } from '@/lib/types';
import { generateServiceContent, CUISINE_TYPES } from '@/lib/seo-data';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { getServerBasePath, getServerOrderPath } from '@/lib/tenant-links';

// ISR: revalidate service pages every 1 hour
export const revalidate = 3600;
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
  params: Promise<{ businessSlug: string; service: string }>;
}): Promise<Metadata> {
  const { businessSlug, service } = await params;
  const business = await getBusinessBySlug(businessSlug);
  const info = SERVICE_INFO[service];
  
  if (!business || !info) return { title: 'Not Found' };

  const cuisineType = business.website?.cuisineType;
  const generated = generateServiceContent(business.name, business.city, business.state, service, cuisineType);
  
  return {
    title: generated.title,
    description: generated.intro.slice(0, 155),
    keywords: [...info.keywords, business.name, business.city, business.state].join(', '),
    robots: { index: true, follow: true },
  };
}

export default async function TenantServicePage({
  params,
}: {
  params: Promise<{ businessSlug: string; service: string }>;
}) {
  const { businessSlug, service } = await params;
  const business = await getBusinessBySlug(businessSlug);
  const headersList = await headers();
  const basePath = getServerBasePath(businessSlug, headersList.get('x-custom-domain'));
  const orderPath = getServerOrderPath(businessSlug, headersList.get('x-custom-domain'));
  
  const info = SERVICE_INFO[service];

  if (!business || !business.website?.enabled || !info) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-4xl font-black">Service Not Found</h1>
      </div>
    );
  }

  // Check if this service is enabled for this business
  if (!business.website.selectedServices?.includes(service)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black mb-4">Service Not Available</h1>
          <p className="text-zinc-500 mb-8">This service is not currently offered by {business.name}.</p>
          <a href={basePath || '/'} className="text-indigo-600 font-bold hover:underline">← Back to homepage</a>
        </div>
      </div>
    );
  }

  const customDesc = business.website.content?.serviceDescriptions?.[service];
  const cuisineType = business.website?.cuisineType;
  const cuisine = CUISINE_TYPES.find(c => c.key === cuisineType);
  const generated = generateServiceContent(business.name, business.city, business.state, service, cuisineType);

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
            {customDesc || generated.intro}
          </p>

          <div className="flex items-center gap-2 text-sm text-zinc-400 font-bold flex-wrap">
            {cuisine && <span>{cuisine.emoji}</span>}
            <span>📍 {business.city}, {business.state}</span>
            <span>•</span>
            <span>{business.name}</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            {generated.features.map((feature, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-5 bg-zinc-50 rounded-2xl border border-zinc-100"
              >
                <span className="text-emerald-500 font-black text-lg mt-0.5">✓</span>
                <span className="text-zinc-700 font-medium text-sm leading-relaxed">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-black mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {generated.faq.map((item, i) => (
              <details
                key={i}
                className="group bg-zinc-50 rounded-2xl border border-zinc-100 overflow-hidden"
              >
                <summary className="p-5 cursor-pointer font-bold text-black text-sm flex items-center justify-between">
                  {item.q}
                  <span className="text-zinc-400 group-open:rotate-45 transition-transform text-xl">+</span>
                </summary>
                <div className="px-5 pb-5 text-zinc-600 text-sm leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* About Service (original block, kept for custom overrides) */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-zinc-50 rounded-3xl p-10 border border-zinc-100 mb-12">
            <h2 className="text-2xl font-black mb-4">About Our {info.label} Service</h2>
            <p className="text-zinc-600 text-lg leading-relaxed">
              {customDesc || generated.intro}
            </p>
          </div>

          {/* Cross-links to location pages */}
          {business.website.selectedCities && business.website.selectedCities.length > 0 && (
            <div className="mb-12">
              <h3 className="text-xl font-black mb-4">
                {info.label} Available In
              </h3>
              <div className="flex flex-wrap gap-3">
                {business.website.selectedCities.map((city) => {
                  const state = business.website.selectedStates?.[0] || business.state;
                  const locationSlug = `${city.toLowerCase().replace(/\s+/g, '-')}-${state.toLowerCase()}`;
                  return (
                    <a
                      key={city}
                      href={`${basePath}/${locationSlug}`}
                      className="px-5 py-2.5 bg-zinc-100 rounded-full text-sm font-bold text-zinc-700 hover:bg-black hover:text-white transition-all"
                    >
                      {city}, {state}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cross-links to other services */}
          {business.website.selectedServices && business.website.selectedServices.length > 1 && (
            <div>
              <h3 className="text-xl font-black mb-4">Other Services</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {business.website.selectedServices
                  .filter(s => s !== service)
                  .map(s => {
                    const sInfo = SERVICE_INFO[s];
                    if (!sInfo) return null;
                    return (
                      <a
                        key={s}
                        href={`${basePath}/services/${s}`}
                        className="p-5 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-black transition-all"
                      >
                        <h4 className="font-bold text-black">{sInfo.label}</h4>
                        <p className="text-zinc-500 text-sm mt-1">{sInfo.description.slice(0, 80)}...</p>
                      </a>
                    );
                  })}
              </div>
            </div>
          )}

          {/* CTA */}
          {business.settings?.orderingEnabled && (
            <div className="mt-16 text-center bg-black text-white rounded-3xl p-12">
              <h2 className="text-3xl font-black mb-4">Ready to Get Started?</h2>
              <p className="text-zinc-400 mb-8">Order {info.label.toLowerCase()} from {business.name} today.</p>
              <a 
                href={orderPath}
                className="inline-flex items-center gap-3 px-10 py-4 bg-white text-black rounded-full font-bold hover:bg-zinc-200 transition-all"
              >
                Order Now →
              </a>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
