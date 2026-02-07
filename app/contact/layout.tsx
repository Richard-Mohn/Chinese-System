import { CONTACT_METADATA, generateBreadcrumbJsonLd } from '@/lib/platform-seo';
export const metadata = CONTACT_METADATA;

const breadcrumb = generateBreadcrumbJsonLd([
  { name: 'Home', url: 'https://mohnmenu.com' },
  { name: 'Contact', url: 'https://mohnmenu.com/contact' },
]);

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {children}
    </>
  );
}
