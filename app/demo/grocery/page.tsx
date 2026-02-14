'use client';

import BusinessDemoTemplate from '../_components/BusinessDemoTemplate';

export default function GroceryDemoPage() {
  return (
    <BusinessDemoTemplate
      badge="Grocery Demo"
      title="Fresh Valley Market"
      accentColorClass="text-emerald-600"
      heroGradientClass="from-green-500 to-emerald-600"
      sectionTitle="Weekly Grocery Picks"
      sectionDescription="A market demo with product-category browsing, pickup-ready pricing, and neighborhood delivery style inventory."
      cards={[
        { name: 'Farm Fresh Eggs (12)', subtitle: 'Dairy', price: '$4.49', emoji: '🥚' },
        { name: 'Organic Bananas', subtitle: 'Produce', price: '$1.99/lb', emoji: '🍌' },
        { name: 'Whole Milk 1 Gallon', subtitle: 'Dairy', price: '$3.89', emoji: '🥛' },
        { name: 'Sourdough Bread', subtitle: 'Bakery', price: '$5.49', emoji: '🍞' },
        { name: 'Family Chicken Pack', subtitle: 'Meat', price: '$11.99', emoji: '🍗' },
        { name: 'Sparkling Water 8pk', subtitle: 'Beverage', price: '$6.99', emoji: '🛒' },
      ]}
      ctaHref="/for-grocery-markets"
      ctaLabel="Launch My Market"
      secondaryHref="/pricing"
      secondaryLabel="View Pricing"
    />
  );
}
