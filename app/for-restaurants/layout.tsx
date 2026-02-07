import { FOR_RESTAURANTS_METADATA, generateIndustryJsonLd, generateBreadcrumbJsonLd } from '@/lib/platform-seo';
export const metadata = FOR_RESTAURANTS_METADATA;

const industryJsonLd = generateIndustryJsonLd('restaurants');
const breadcrumb = generateBreadcrumbJsonLd([
  { name: 'Home', url: 'https://mohnmenu.com' },
  { name: 'For Restaurants', url: 'https://mohnmenu.com/for-restaurants' },
]);

export default function ForRestaurantsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {industryJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(industryJsonLd) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {children}
    </>
  );
}
