'use client';

import BusinessDemoTemplate from '../_components/BusinessDemoTemplate';

export default function BoutiqueDemoPage() {
  return (
    <BusinessDemoTemplate
      badge="Boutique Demo"
      title="Ivy & Thread"
      accentColorClass="text-amber-600"
      heroGradientClass="from-amber-500 to-orange-500"
      sectionTitle="Featured Boutique Items"
      sectionDescription="A boutique storefront demo focused on apparel, accessories, and featured seasonal collections."
      cards={[
        { name: 'Linen Summer Dress', subtitle: 'Apparel', price: '$48.00', emoji: '👗' },
        { name: 'Minimal Gold Necklace', subtitle: 'Accessories', price: '$26.00', emoji: '📿' },
        { name: 'Canvas Crossbody Bag', subtitle: 'Bags', price: '$39.00', emoji: '👜' },
        { name: 'Classic White Blouse', subtitle: 'Apparel', price: '$34.00', emoji: '🤍' },
        { name: 'Wide Brim Hat', subtitle: 'Accessories', price: '$22.00', emoji: '👒' },
        { name: 'Gift Set Bundle', subtitle: 'Featured', price: '$59.00', emoji: '🎁' },
      ]}
      ctaHref="/for-retail-shops"
      ctaLabel="Launch My Boutique"
      secondaryHref="/pricing"
      secondaryLabel="View Pricing"
    />
  );
}
