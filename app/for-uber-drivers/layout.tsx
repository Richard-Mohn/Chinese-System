import { FOR_UBER_DRIVERS_METADATA, generateIndustryJsonLd, generateBreadcrumbJsonLd } from '@/lib/platform-seo';

export const metadata = FOR_UBER_DRIVERS_METADATA;

const industryJsonLd = generateIndustryJsonLd('uber-drivers');
const breadcrumb = generateBreadcrumbJsonLd([
  { name: 'Home', url: 'https://mohnmenu.com' },
  { name: 'For Uber Drivers', url: 'https://mohnmenu.com/for-uber-drivers' },
]);

export default function ForUberDriversLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {industryJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(industryJsonLd) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {children}
    </>
  );
}
