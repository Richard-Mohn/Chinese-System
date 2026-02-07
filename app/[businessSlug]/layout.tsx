/**
 * Tenant Layout — wraps all /{businessSlug}/* pages.
 * 
 * Generates SEO metadata (OpenGraph, Twitter cards, robots)
 * for the tenant's auto-generated website.
 */

import { Metadata } from 'next';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MohnMenuBusiness } from '@/lib/types';
import { headers } from 'next/headers';
import TenantNav from '@/components/TenantNav';
import { generateTenantJsonLd, generateTenantKeywords, generateTenantBreadcrumb } from '@/lib/tenant-seo';

// Fetch business by slug
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ businessSlug: string }>;
}): Promise<Metadata> {
  const { businessSlug } = await params;
  const business = await getBusinessBySlug(businessSlug);
  
  if (!business) {
    return { title: 'Business Not Found' };
  }

  const seo = business.website?.seo;
  const title = seo?.metaTitle || `${business.name} | Order Online`;
  const description = seo?.metaDescription || business.description || `Order from ${business.name}. ${business.city}, ${business.state}.`;
  const keywords = generateTenantKeywords(business);

  return {
    title,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: business.name,
      locale: 'en_US',
      url: `https://mohnmenu.com/${businessSlug}`,
      images: business.logo ? [{ url: business.logo, alt: business.name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: business.logo ? [business.logo] : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `https://mohnmenu.com/${businessSlug}`,
    },
  };
}

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ businessSlug: string }>;
}) {
  const { businessSlug } = await params;
  const business = await getBusinessBySlug(businessSlug);
  const headersList = await headers();
  const isCustomDomain = headersList.get('x-custom-domain') === '1';

  if (!business || !business.website?.enabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-6xl font-black text-black mb-4">404</h1>
          <p className="text-zinc-500 text-lg">Business not found.</p>
        </div>
      </div>
    );
  }

  const basePath = isCustomDomain ? '' : `/${businessSlug}`;
  const orderPath = isCustomDomain ? '/order' : `/order/${businessSlug}`;
  const primaryColor = business.settings?.primaryColor || business.brandColors?.primary || '#4F46E5';

  // Generate JSON-LD structured data for this business
  const baseUrl = `https://mohnmenu.com/${businessSlug}`;
  const tenantJsonLd = generateTenantJsonLd(business, baseUrl);
  const breadcrumbJsonLd = generateTenantBreadcrumb(business.name, baseUrl);

  return (
    <div className="min-h-screen bg-white" style={{ '--tenant-primary': primaryColor } as React.CSSProperties}>
      {/* Tenant JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(tenantJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {/* Tenant Navigation */}
      <TenantNav business={business} basePath={basePath} orderPath={orderPath} />

      {/* Page Content */}
      <main className="pt-20">
        {children}
      </main>

      {/* Tenant Footer */}
      <footer className="bg-zinc-900 text-white py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-black mb-4">{business.name}</h3>
              <p className="text-zinc-400 mb-4 max-w-md">
                {business.description || `Serving ${business.city}, ${business.state} and surrounding areas.`}
              </p>
              <p className="text-zinc-500 text-sm">
                {business.address}, {business.city}, {business.state} {business.zipCode}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4">Quick Links</h4>
              <div className="space-y-3">
                <a href={`${basePath}/menu`} className="block text-zinc-400 hover:text-white text-sm font-medium transition-colors">Menu</a>
                <a href={`${basePath}/about`} className="block text-zinc-400 hover:text-white text-sm font-medium transition-colors">About Us</a>
                <a href={`${basePath}/contact`} className="block text-zinc-400 hover:text-white text-sm font-medium transition-colors">Contact</a>
                {business.services?.map(service => (
                  <a key={service} href={`${basePath}/services/${service}`} className="block text-zinc-400 hover:text-white text-sm font-medium transition-colors capitalize">
                    {service.replace(/-/g, ' ')}
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4">Contact</h4>
              <div className="space-y-3 text-zinc-400 text-sm">
                {business.businessPhone && <p>{business.businessPhone}</p>}
                {business.ownerEmail && <p>{business.ownerEmail}</p>}
              </div>
            </div>
          </div>
          
          <div className="border-t border-zinc-800 mt-12 pt-8 text-center text-zinc-600 text-xs">
            <p>&copy; {new Date().getFullYear()} {business.name}. All rights reserved.</p>
            <p className="mt-1">Powered by <a href="https://mohnmenu.com" className="text-zinc-400 hover:text-white">MohnMenu</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
