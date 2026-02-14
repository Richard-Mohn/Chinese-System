'use client';

import BusinessDemoTemplate from '../_components/BusinessDemoTemplate';

export default function ConvenienceDemoPage() {
  return (
    <BusinessDemoTemplate
      badge="Convenience Store Demo"
      title="QuickStop Mini Mart"
      accentColorClass="text-blue-600"
      heroGradientClass="from-blue-500 to-indigo-600"
      sectionTitle="Grab-and-Go Essentials"
      sectionDescription="A convenience-store demo designed for fast reorders, everyday items, and rapid neighborhood checkout."
      cards={[
        { name: 'Energy Drink 16oz', subtitle: 'Beverage', price: '$2.99', emoji: '⚡' },
        { name: 'Chips Variety Pack', subtitle: 'Snacks', price: '$4.99', emoji: '🥔' },
        { name: 'Phone Charger Cable', subtitle: 'Essentials', price: '$9.99', emoji: '🔌' },
        { name: 'Household Batteries 4pk', subtitle: 'Essentials', price: '$6.49', emoji: '🔋' },
        { name: 'Quick Breakfast Sandwich', subtitle: 'Hot Food', price: '$5.99', emoji: '🥪' },
        { name: 'Daily Combo Bundle', subtitle: 'Deal', price: '$8.99', emoji: '🏪' },
      ]}
      ctaHref="/for-convenience-stores"
      ctaLabel="Launch My C-Store"
      secondaryHref="/pricing"
      secondaryLabel="View Pricing"
    />
  );
}
