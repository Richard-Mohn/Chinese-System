import { FOR_BARS_METADATA, generateIndustryJsonLd, generateBreadcrumbJsonLd } from '@/lib/platform-seo';
export const metadata = FOR_BARS_METADATA;

const industryJsonLd = generateIndustryJsonLd('bars-nightlife');
const breadcrumb = generateBreadcrumbJsonLd([
  { name: 'Home', url: 'https://mohnmenu.com' },
  { name: 'For Bars & Nightlife', url: 'https://mohnmenu.com/for-bars-nightlife' },
]);

export default function ForBarsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {industryJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(industryJsonLd) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {children}
    </>
  );
}
