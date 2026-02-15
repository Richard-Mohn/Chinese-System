/**
 * Integration Registry
 * 
 * Comprehensive catalog of third-party integrations available for MohnMenu businesses.
 * Covers: POS systems, printers, accounting, payments, delivery, marketing, inventory.
 */

export type IntegrationCategory =
  | 'pos'           // Point of Sale systems
  | 'printer'       // Receipt & label printers
  | 'accounting'    // QuickBooks, Xero, etc.
  | 'payment'       // Stripe, Square, PayPal
  | 'delivery'      // DoorDash, Uber Eats, Grubhub
  | 'marketing'     // Email, SMS, loyalty
  | 'inventory'     // Stock management
  | 'analytics';    // Business intelligence

export type IntegrationStatus = 'active' | 'available' | 'coming_soon' | 'beta';

export interface Integration {
  id: string;
  name: string;
  category: IntegrationCategory;
  description: string;
  status: IntegrationStatus;
  logo?: string;
  features: string[];
  setupComplexity: 'easy' | 'medium' | 'advanced';
  pricingModel?: string;
  docsUrl?: string;
  requiresTier?: 'growth' | 'professional';
}

/**
 * COMPREHENSIVE INTEGRATION CATALOG
 * Based on research of top restaurant/business platforms
 */
export const INTEGRATION_REGISTRY: Integration[] = [
  // ═══════════════════════════════════════════════════════════
  // POS SYSTEMS (Top Restaurant POS Platforms)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'toast-pos',
    name: 'Toast POS',
    category: 'pos',
    description: 'Leading restaurant POS system with order sync, menu management, and payment processing.',
    status: 'coming_soon',
    features: ['Order sync', 'Menu sync', 'Payment integration', 'Employee management', 'Inventory sync'],
    setupComplexity: 'medium',
    pricingModel: 'Toast handles their own pricing',
    docsUrl: 'https://doc.toasttab.com/openapi/',
  },
  {
    id: 'square-pos',
    name: 'Square POS',
    category: 'pos',
    description: 'Popular all-in-one POS with payments, inventory, and customer management.',
    status: 'coming_soon',
    features: ['Payment processing', 'Order sync', 'Inventory management', 'Customer directory', 'Analytics'],
    setupComplexity: 'easy',
    pricingModel: '2.6% + 10¢ per transaction',
    docsUrl: 'https://developer.squareup.com/docs',
  },
  {
    id: 'clover',
    name: 'Clover POS',
    category: 'pos',
    description: 'Cloud-based POS by Fiserv with robust hardware and app ecosystem.',
    status: 'coming_soon',
    features: ['Order management', 'Payment processing', 'Employee tracking', 'Reporting', 'Customer engagement'],
    setupComplexity: 'medium',
    docsUrl: 'https://docs.clover.com/',
  },
  {
    id: 'lightspeed',
    name: 'Lightspeed Restaurant',
    category: 'pos',
    description: 'Full-service restaurant POS with table management and kitchen display.',
    status: 'coming_soon',
    features: ['Table management', 'Order routing', 'Menu sync', 'Reporting', 'Multi-location'],
    setupComplexity: 'medium',
    requiresTier: 'growth',
  },
  {
    id: 'touchbistro',
    name: 'TouchBistro',
    category: 'pos',
    description: 'iPad-based POS designed specifically for restaurants and bars.',
    status: 'coming_soon',
    features: ['Tableside ordering', 'Menu management', 'Staff management', 'Floor plans', 'CRM'],
    setupComplexity: 'medium',
  },
  {
    id: 'ncr-aloha',
    name: 'NCR Aloha',
    category: 'pos',
    description: 'Enterprise-grade POS for large restaurant chains and franchises.',
    status: 'coming_soon',
    features: ['Enterprise reporting', 'Multi-location', 'Inventory', 'Labor management', 'Loyalty programs'],
    setupComplexity: 'advanced',
    requiresTier: 'professional',
  },
  {
    id: 'revel-systems',
    name: 'Revel Systems',
    category: 'pos',
    description: 'Cloud POS with advanced inventory and employee management.',
    status: 'coming_soon',
    features: ['Inventory tracking', 'Employee scheduling', 'Customer profiles', 'Online ordering', 'Analytics'],
    setupComplexity: 'medium',
  },

  // ═══════════════════════════════════════════════════════════
  // RECEIPT & LABEL PRINTERS
  // ═══════════════════════════════════════════════════════════
  {
    id: 'star-printers',
    name: 'Star Micronics',
    category: 'printer',
    description: 'Industry-leading receipt printers (TSP100, TSP650, mC-Print series).',
    status: 'beta',
    features: ['Ethernet printing', 'Bluetooth printing', 'Kitchen tickets', 'Customer receipts', 'Auto-cut'],
    setupComplexity: 'easy',
    pricingModel: 'Hardware purchase ($200-$600)',
    docsUrl: 'https://www.starmicronics.com/support/',
  },
  {
    id: 'epson-tm',
    name: 'Epson TM Series',
    category: 'printer',
    description: 'Reliable thermal receipt printers (TM-T88, TM-M30, TM-T20).',
    status: 'beta',
    features: ['Thermal printing', 'Fast print speed', 'Kitchen orders', 'Bar tickets', 'USB/Ethernet'],
    setupComplexity: 'easy',
    pricingModel: 'Hardware purchase ($150-$500)',
  },
  {
    id: 'zebra-label',
    name: 'Zebra Label Printers',
    category: 'printer',
    description: 'Professional label printers for packaging, shipping, and inventory (ZD410, ZD620).',
    status: 'beta',
    features: ['Shipping labels', 'Product labels', 'Barcodes', 'QR codes', 'High-resolution printing'],
    setupComplexity: 'medium',
    pricingModel: 'Hardware purchase ($300-$1,200)',
    docsUrl: 'https://www.zebra.com/us/en/support-downloads/printers.html',
  },
  {
    id: 'brother-label',
    name: 'Brother Label Printers',
    category: 'printer',
    description: 'Affordable label printers for small businesses (QL-820NWB, PT-D600).',
    status: 'coming_soon',
    features: ['Address labels', 'Product labels', 'Name tags', 'Barcodes', 'Wireless printing'],
    setupComplexity: 'easy',
    pricingModel: 'Hardware purchase ($100-$400)',
  },
  {
    id: 'dymo-label',
    name: 'DYMO LabelWriter',
    category: 'printer',
    description: 'Compact label printers for shipping and organization (450 Turbo, 4XL).',
    status: 'coming_soon',
    features: ['Shipping labels', 'Barcode labels', 'Name tags', 'USB connectivity', 'Fast printing'],
    setupComplexity: 'easy',
    pricingModel: 'Hardware purchase ($100-$300)',
  },

  // ═══════════════════════════════════════════════════════════
  // ACCOUNTING SOFTWARE
  // ═══════════════════════════════════════════════════════════
  {
    id: 'quickbooks-online',
    name: 'QuickBooks Online',
    category: 'accounting',
    description: 'Industry-standard accounting software with bank sync and invoicing.',
    status: 'coming_soon',
    features: ['Auto sales sync', 'Expense tracking', 'Bank reconciliation', 'Tax reports', 'P&L statements'],
    setupComplexity: 'medium',
    pricingModel: 'QuickBooks subscription required ($30-$200/mo)',
    docsUrl: 'https://developer.intuit.com/app/developer/qbo/docs/get-started',
  },
  {
    id: 'xero',
    name: 'Xero',
    category: 'accounting',
    description: 'Cloud accounting platform popular with SMBs worldwide.',
    status: 'coming_soon',
    features: ['Multi-currency', 'Bank feeds', 'Invoicing', 'Expense claims', 'Financial reports'],
    setupComplexity: 'medium',
    pricingModel: 'Xero subscription required ($15-$70/mo)',
    docsUrl: 'https://developer.xero.com/documentation/',
  },
  {
    id: 'freshbooks',
    name: 'FreshBooks',
    category: 'accounting',
    description: 'Simple accounting software focused on invoicing and time tracking.',
    status: 'coming_soon',
    features: ['Invoice sync', 'Expense tracking', 'Time tracking', 'Proposals', 'Reporting'],
    setupComplexity: 'easy',
    pricingModel: 'FreshBooks subscription ($17-$55/mo)',
  },
  {
    id: 'wave',
    name: 'Wave Accounting',
    category: 'accounting',
    description: 'Free accounting software for small businesses.',
    status: 'coming_soon',
    features: ['Free accounting', 'Invoicing', 'Receipt scanning', 'Bank connections', 'Reports'],
    setupComplexity: 'easy',
    pricingModel: 'Free (payment processing fees apply)',
  },

  // ═══════════════════════════════════════════════════════════
  // PAYMENT PROCESSING
  // ═══════════════════════════════════════════════════════════
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'payment',
    description: 'MohnMenu\'s primary payment processor with powerful APIs and global reach.',
    status: 'active',
    features: ['Credit cards', 'Digital wallets', 'ACH', 'International', 'Subscriptions', 'Connect payouts'],
    setupComplexity: 'easy',
    pricingModel: '2.9% + 30¢ per transaction',
    docsUrl: 'https://stripe.com/docs',
  },
  {
    id: 'nowpayments',
    name: 'NOWPayments',
    category: 'payment',
    description: 'Cryptocurrency payment gateway supporting 350+ coins.',
    status: 'active',
    features: ['Bitcoin', 'Ethereum', 'USDT', 'Litecoin', '350+ cryptos', 'Auto-conversion'],
    setupComplexity: 'easy',
    pricingModel: '0.5-1% per transaction',
    docsUrl: 'https://documenter.getpostman.com/view/7907941/S1a32n38',
  },
  {
    id: 'square-payments',
    name: 'Square Payments',
    category: 'payment',
    description: 'Payment processing with hardware and software integration.',
    status: 'coming_soon',
    features: ['Card processing', 'Contactless', 'Invoicing', 'Virtual terminal', 'Reports'],
    setupComplexity: 'easy',
    pricingModel: '2.6% + 10¢ per transaction',
  },
  {
    id: 'paypal',
    name: 'PayPal Checkout',
    category: 'payment',
    description: 'Trusted online payment method with buyer protection.',
    status: 'coming_soon',
    features: ['PayPal balance', 'Credit cards', 'Buy now pay later', 'One-click checkout', 'International'],
    setupComplexity: 'easy',
    pricingModel: '2.99% + fixed fee',
  },

  // ═══════════════════════════════════════════════════════════
  // THIRD-PARTY DELIVERY
  // ═══════════════════════════════════════════════════════════
  {
    id: 'doordash',
    name: 'DoorDash Drive',
    category: 'delivery',
    description: 'On-demand delivery logistics for your own orders.',
    status: 'coming_soon',
    features: ['On-demand pickup', 'Live tracking', 'Dasher dispatch', 'API integration', 'White-label'],
    setupComplexity: 'medium',
    pricingModel: 'Per-delivery fee (varies by market)',
    docsUrl: 'https://developer.doordash.com/en-US/docs/drive/reference/intro/',
  },
  {
    id: 'uber-direct',
    name: 'Uber Direct',
    category: 'delivery',
    description: 'Uber\'s delivery API for businesses to use Uber drivers.',
    status: 'coming_soon',
    features: ['Same-day delivery', 'Real-time tracking', 'Driver dispatch', 'Scheduled deliveries', 'API'],
    setupComplexity: 'medium',
    pricingModel: 'Per-delivery pricing',
    docsUrl: 'https://developer.uber.com/docs/eats/introduction',
  },
  {
    id: 'grubhub-direct',
    name: 'Grubhub Direct',
    category: 'delivery',
    description: 'Access Grubhub\'s driver network for your orders.',
    status: 'coming_soon',
    features: ['Driver network', 'Order tracking', 'Delivery management', 'API integration'],
    setupComplexity: 'medium',
    pricingModel: 'Commission-based',
  },
  {
    id: 'roadie',
    name: 'Roadie',
    category: 'delivery',
    description: 'Crowd-sourced delivery for local and long-distance shipping.',
    status: 'coming_soon',
    features: ['Same-day delivery', 'Cross-country shipping', 'Big & bulky items', 'Live tracking'],
    setupComplexity: 'easy',
    pricingModel: 'Variable per delivery',
  },

  // ═══════════════════════════════════════════════════════════
  // MARKETING & COMMUNICATIONS
  // ═══════════════════════════════════════════════════════════
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    category: 'marketing',
    description: 'Email marketing platform with automation and segmentation.',
    status: 'coming_soon',
    features: ['Email campaigns', 'Automation', 'Audience segmentation', 'Landing pages', 'Analytics'],
    setupComplexity: 'easy',
    pricingModel: 'Free up to 500 contacts, then $13+/mo',
  },
  {
    id: 'klaviyo',
    name: 'Klaviyo',
    category: 'marketing',
    description: 'E-commerce email and SMS marketing platform.',
    status: 'coming_soon',
    features: ['Email & SMS', 'Customer segmentation', 'Abandoned cart', 'Order follow-ups', 'Analytics'],
    setupComplexity: 'medium',
    pricingModel: 'Free up to 250 contacts, then $20+/mo',
  },
  {
    id: 'twilio',
    name: 'Twilio',
    category: 'marketing',
    description: 'SMS and voice communication platform.',
    status: 'coming_soon',
    features: ['SMS notifications', 'Voice calls', 'Order updates', 'Customer support', 'Two-factor auth'],
    setupComplexity: 'medium',
    pricingModel: 'Pay-per-message ($0.0079/SMS)',
  },

  // ═══════════════════════════════════════════════════════════
  // INVENTORY MANAGEMENT
  // ═══════════════════════════════════════════════════════════
  {
    id: 'marketman',
    name: 'MarketMan',
    category: 'inventory',
    description: 'Restaurant inventory management and ordering platform.',
    status: 'coming_soon',
    features: ['Inventory tracking', 'Recipe costing', 'Supplier ordering', 'Waste tracking', 'Analytics'],
    setupComplexity: 'medium',
    requiresTier: 'growth',
  },
  {
    id: 'upserve',
    name: 'Upserve Inventory',
    category: 'inventory',
    description: 'Restaurant management platform with inventory and analytics.',
    status: 'coming_soon',
    features: ['Stock management', 'Recipe management', 'Vendor management', 'Menu engineering', 'Reports'],
    setupComplexity: 'medium',
    requiresTier: 'growth',
  },
  {
    id: 'toast-inventory',
    name: 'Toast Inventory',
    category: 'inventory',
    description: 'Inventory management built into Toast POS ecosystem.',
    status: 'coming_soon',
    features: ['Stock tracking', 'Order guides', 'Vendor catalogs', 'Recipe integration', 'Count sheets'],
    setupComplexity: 'medium',
    requiresTier: 'growth',
  },

  // ═══════════════════════════════════════════════════════════
  // BUSINESS INTELLIGENCE & ANALYTICS
  // ═══════════════════════════════════════════════════════════
  {
    id: 'google-analytics',
    name: 'Google Analytics 4',
    category: 'analytics',
    description: 'Web analytics platform tracking customer behavior and conversions.',
    status: 'active',
    features: ['Traffic analysis', 'Conversion tracking', 'Customer journey', 'Real-time data', 'Custom reports'],
    setupComplexity: 'easy',
    pricingModel: 'Free',
    docsUrl: 'https://developers.google.com/analytics',
  },
  {
    id: 'google-search-console',
    name: 'Google Search Console',
    category: 'analytics',
    description: 'SEO insights and search performance monitoring.',
    status: 'active',
    features: ['Search rankings', 'Click data', 'Indexing status', 'Mobile usability', 'Page speed'],
    setupComplexity: 'easy',
    pricingModel: 'Free',
  },
];

/**
 * Get integrations by category
 */
export function getIntegrationsByCategory(category: IntegrationCategory): Integration[] {
  return INTEGRATION_REGISTRY.filter(i => i.category === category);
}

/**
 * Get all active integrations
 */
export function getActiveIntegrations(): Integration[] {
  return INTEGRATION_REGISTRY.filter(i => i.status === 'active');
}

/**
 * Get integration by ID
 */
export function getIntegration(id: string): Integration | undefined {
  return INTEGRATION_REGISTRY.find(i => i.id === id);
}
