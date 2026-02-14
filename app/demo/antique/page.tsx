'use client';

import BusinessDemoTemplate from '../_components/BusinessDemoTemplate';

export default function AntiqueDemoPage() {
  return (
    <BusinessDemoTemplate
      badge="Antique Demo"
      title="Timeless Treasures"
      accentColorClass="text-yellow-700"
      heroGradientClass="from-amber-600 to-yellow-600"
      sectionTitle="Vintage Collection"
      sectionDescription="An antique shop demo with one-of-one catalog listings, collection highlights, and curated vintage inventory."
      cards={[
        { name: 'Victorian Table Clock', subtitle: 'Collectible', price: '$145.00', emoji: '🕰️' },
        { name: 'Brass Desk Lamp', subtitle: 'Home Decor', price: '$85.00', emoji: '💡' },
        { name: 'Mid-century Side Chair', subtitle: 'Furniture', price: '$220.00', emoji: '🪑' },
        { name: 'Porcelain Tea Set', subtitle: 'Vintage Set', price: '$98.00', emoji: '🍵' },
        { name: 'Retro Vinyl Collection', subtitle: 'Music', price: '$75.00', emoji: '📻' },
        { name: 'Classic Wall Mirror', subtitle: 'Decor', price: '$129.00', emoji: '🪞' },
      ]}
      ctaHref="/for-retail-shops"
      ctaLabel="Launch My Antique Shop"
      secondaryHref="/pricing"
      secondaryLabel="View Pricing"
    />
  );
}
