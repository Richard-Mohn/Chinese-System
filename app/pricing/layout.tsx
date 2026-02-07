import { PRICING_METADATA, PRICING_JSONLD, generateBreadcrumbJsonLd } from '@/lib/platform-seo';
export const metadata = PRICING_METADATA;

const breadcrumb = generateBreadcrumbJsonLd([
  { name: 'Home', url: 'https://mohnmenu.com' },
  { name: 'Pricing', url: 'https://mohnmenu.com/pricing' },
]);

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(PRICING_JSONLD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {children}
    </>
  );
}
