'use client';

import { Suspense, useEffect } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { GA_MEASUREMENT_ID, pageview, setUserId } from '@/lib/gtag';
import { useAuth } from '@/context/AuthContext';

/**
 * Inner tracker that uses useSearchParams (requires Suspense boundary).
 */
function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Track page views on route change
  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    pageview(url);
  }, [pathname, searchParams]);

  // Link GA4 sessions to authenticated user
  useEffect(() => {
    setUserId(user?.uid ?? null);
  }, [user]);

  return null;
}

/**
 * Renders the two <Script> tags for gtag.js and fires a pageview
 * on every client-side navigation.
 *
 * Drop this component once inside the root layout — it handles everything.
 */
export default function GoogleAnalytics() {
  return (
    <>
      {/* Global site tag (gtag.js) — Google Analytics 4 */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
            send_page_view: true
          });
        `}
      </Script>
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
    </>
  );
}
