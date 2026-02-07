import { COMPARISON_METADATA, COMPARISON_JSONLD, generateBreadcrumbJsonLd } from '@/lib/platform-seo';
export const metadata = COMPARISON_METADATA;

const breadcrumb = generateBreadcrumbJsonLd([
  { name: 'Home', url: 'https://mohnmenu.com' },
  { name: 'Comparison', url: 'https://mohnmenu.com/comparison' },
]);

export default function ComparisonLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(COMPARISON_JSONLD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {children}
    </>
  );
}
