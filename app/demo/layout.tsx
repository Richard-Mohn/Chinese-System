import { DEMO_METADATA, generateBreadcrumbJsonLd } from '@/lib/platform-seo';
import DemoRouteBanner from './_components/DemoRouteBanner';
export const metadata = DEMO_METADATA;

const breadcrumb = generateBreadcrumbJsonLd([
  { name: 'Home', url: 'https://mohnmenu.com' },
  { name: 'Demo', url: 'https://mohnmenu.com/demo' },
]);

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <DemoRouteBanner />
      {children}
    </>
  );
}
