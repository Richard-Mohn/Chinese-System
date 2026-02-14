'use client';

import BusinessDemoTemplate from '../_components/BusinessDemoTemplate';

export default function BakeryDemoPage() {
  return (
    <BusinessDemoTemplate
      badge="Bakery & Café Demo"
      title="Sweet Crumb Bakery"
      accentColorClass="text-rose-600"
      heroGradientClass="from-pink-500 to-rose-500"
      sectionTitle="Bakery Favorites"
      sectionDescription="A bakery demo with pre-orders, pastries, cakes, and coffee add-ons in a modern storefront layout."
      cards={[
        { name: 'Red Velvet Slice', subtitle: 'Cake', price: '$6.99', emoji: '🍰' },
        { name: 'Assorted Macarons', subtitle: 'Pastry', price: '$8.49', emoji: '🧁' },
        { name: 'Blueberry Muffin', subtitle: 'Bakery', price: '$3.99', emoji: '🫐' },
        { name: 'Croissant Box (6)', subtitle: 'Pre-Order', price: '$14.99', emoji: '🥐' },
        { name: 'Iced Latte', subtitle: 'Coffee', price: '$4.99', emoji: '☕' },
        { name: 'Custom Cake Deposit', subtitle: 'Special Order', price: '$25.00', emoji: '🎂' },
      ]}
      ctaHref="/for-bakeries-cafes"
      ctaLabel="Launch My Bakery Demo"
      secondaryHref="/pricing"
      secondaryLabel="View Pricing"
    />
  );
}
