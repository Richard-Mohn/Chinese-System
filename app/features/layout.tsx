import { FEATURES_METADATA, generateBreadcrumbJsonLd } from '@/lib/platform-seo';
export const metadata = FEATURES_METADATA;

const breadcrumb = generateBreadcrumbJsonLd([
  { name: 'Home', url: 'https://mohnmenu.com' },
  { name: 'Features', url: 'https://mohnmenu.com/features' },
]);

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {children}
    </>
  );
}
