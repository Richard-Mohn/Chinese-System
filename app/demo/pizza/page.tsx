'use client';

import BusinessDemoTemplate from '../_components/BusinessDemoTemplate';

export default function PizzaDemoPage() {
  return (
    <BusinessDemoTemplate
      badge="Pizza Shop Demo"
      title="Demo Pizza Co."
      accentColorClass="text-orange-600"
      heroGradientClass="from-orange-500 to-red-500"
      sectionTitle="Popular Pizza Menu"
      sectionDescription="A full pizza storefront demo with build-your-own flow, combos, and quick checkout behavior."
      cards={[
        { name: 'Classic Pepperoni', subtitle: 'Large Pizza', price: '$15.99', emoji: '🍕' },
        { name: 'Meat Lovers Combo', subtitle: 'Large Pizza', price: '$18.49', emoji: '🥩' },
        { name: 'Veggie Supreme', subtitle: 'Large Pizza', price: '$16.99', emoji: '🫑' },
        { name: 'Garlic Knots', subtitle: 'Sides', price: '$5.49', emoji: '🧄' },
        { name: 'Buffalo Wings', subtitle: 'Sides', price: '$10.99', emoji: '🍗' },
        { name: '2-Liter Soda', subtitle: 'Drinks', price: '$3.49', emoji: '🥤' },
      ]}
      ctaHref="/for-restaurants"
      ctaLabel="Launch My Pizza Store"
      secondaryHref="/pricing"
      secondaryLabel="View Pricing"
    />
  );
}
