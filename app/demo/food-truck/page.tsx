'use client';

import BusinessDemoTemplate from '../_components/BusinessDemoTemplate';

export default function FoodTruckDemoPage() {
  return (
    <BusinessDemoTemplate
      badge="Food Truck Demo"
      title="Street Eats RVA"
      accentColorClass="text-amber-600"
      heroGradientClass="from-yellow-500 to-orange-600"
      sectionTitle="Fast Truck Favorites"
      sectionDescription="A mobile-first food truck demo with QR-ready menu structure and event-friendly combo items."
      cards={[
        { name: 'Loaded Street Tacos', subtitle: 'Main', price: '$10.99', emoji: '🌮' },
        { name: 'BBQ Pulled Pork Bowl', subtitle: 'Main', price: '$12.49', emoji: '🍲' },
        { name: 'Crispy Fries Basket', subtitle: 'Side', price: '$4.99', emoji: '🍟' },
        { name: 'Spicy Chicken Wrap', subtitle: 'Main', price: '$9.99', emoji: '🌯' },
        { name: 'Fresh Lemonade', subtitle: 'Drink', price: '$3.49', emoji: '🍋' },
        { name: 'Truck Combo Meal', subtitle: 'Combo', price: '$14.99', emoji: '🚚' },
      ]}
      ctaHref="/for-food-trucks"
      ctaLabel="Launch My Food Truck"
      secondaryHref="/pricing"
      secondaryLabel="View Pricing"
    />
  );
}
