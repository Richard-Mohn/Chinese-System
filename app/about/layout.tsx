import { ABOUT_METADATA, generateBreadcrumbJsonLd } from '@/lib/platform-seo';
export const metadata = ABOUT_METADATA;

const breadcrumb = generateBreadcrumbJsonLd([
  { name: 'Home', url: 'https://mohnmenu.com' },
  { name: 'About', url: 'https://mohnmenu.com/about' },
]);

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {children}
    </>
  );
}
