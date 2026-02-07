import { FOR_CONVENIENCE_METADATA, generateIndustryJsonLd, generateBreadcrumbJsonLd } from '@/lib/platform-seo';
export const metadata = FOR_CONVENIENCE_METADATA;

const industryJsonLd = generateIndustryJsonLd('convenience-stores');
const breadcrumb = generateBreadcrumbJsonLd([
  { name: 'Home', url: 'https://mohnmenu.com' },
  { name: 'For Convenience Stores', url: 'https://mohnmenu.com/for-convenience-stores' },
]);

export default function ForConvenienceLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {industryJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(industryJsonLd) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {children}
    </>
  );
}
