import { FOR_GROCERY_METADATA, generateIndustryJsonLd, generateBreadcrumbJsonLd } from '@/lib/platform-seo';
export const metadata = FOR_GROCERY_METADATA;

const industryJsonLd = generateIndustryJsonLd('grocery-markets');
const breadcrumb = generateBreadcrumbJsonLd([
  { name: 'Home', url: 'https://mohnmenu.com' },
  { name: 'For Grocery Markets', url: 'https://mohnmenu.com/for-grocery-markets' },
]);

export default function ForGroceryLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {industryJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(industryJsonLd) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {children}
    </>
  );
}
