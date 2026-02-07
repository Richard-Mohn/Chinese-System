import { FOR_BAKERIES_METADATA, generateIndustryJsonLd, generateBreadcrumbJsonLd } from '@/lib/platform-seo';
export const metadata = FOR_BAKERIES_METADATA;

const industryJsonLd = generateIndustryJsonLd('bakeries-cafes');
const breadcrumb = generateBreadcrumbJsonLd([
  { name: 'Home', url: 'https://mohnmenu.com' },
  { name: 'For Bakeries & Cafés', url: 'https://mohnmenu.com/for-bakeries-cafes' },
]);

export default function ForBakeriesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {industryJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(industryJsonLd) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {children}
    </>
  );
}
