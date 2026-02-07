/**
 * USER TYPES & ROLES for MohnMenu Multi-Tenant Platform
 * 
 * Every user in the system has a role that determines permissions
 */

// Business types that determine feature availability
export type BusinessType = 
  | 'restaurant'
  | 'chinese_restaurant'
  | 'pizza'
  | 'mexican'
  | 'bakery'
  | 'convenience_store'
  | 'grocery'
  | 'food_truck'
  | 'bar_grill'
  | 'boutique'
  | 'antique_shop'
  | 'market'
  | 'other';

// Subscription tiers that determine feature access & pricing
// All tiers include 14-day free trial, then monthly billing
export type SubscriptionTier = 
  | 'free'         // 14-day trial (all tiers start here)
  | 'starter'      // $19.99/mo — core ordering, payments, storefront
  | 'growth'       // $49.99/mo — GPS tracking, KDS, analytics, marketing
  | 'professional' // $99.99/mo — multi-location, API, priority support
  | 'reseller';    // Custom, white-label partner

// User roles in the system
export type UserRole = 
  | 'customer'           // Regular customer placing orders
  | 'owner'              // Business owner (full access)
  | 'manager'            // Staff manager (manage drivers, orders, limited settings)
  | 'driver_inhouse'     // In-house driver (their own business's drivers)
  | 'driver_marketplace' // Marketplace driver (MohnMenu's overflow driver pool)
  | 'admin'              // MohnMenu admin (super user)
  | 'reseller';          // Agency partner with their own clients

// Driver status in the system
export type DriverStatus = 
  | 'offline'            // Not working
  | 'online'             // Available for orders
  | 'on_delivery'        // Currently delivering
  | 'on_break';          // Taking a break

// Courier vehicle type
export type CourierVehicle = 'bike' | 'walk' | 'car' | 'scooter';

// Platform fee configuration
export const PLATFORM_FEE_CENTS = 25; // $0.25 per order

// Order status throughout fulfillment
export type OrderStatus = 
  | 'pending'            // Just placed, awaiting confirmation
  | 'confirmed'          // Owner confirmed, starting to prepare
  | 'preparing'          // Kitchen is making it
  | 'ready'              // Ready for pickup or delivery
  | 'out_for_delivery'   // Driver is en route
  | 'delivered'          // Successfully delivered
  | 'picked_up'          // Customer picked it up
  | 'cancelled';         // Order cancelled

// Delivery types
export type DeliveryType = 'delivery' | 'pickup' | 'shipping';

// Subscription status
export type SubscriptionStatus = 
  | 'active'
  | 'past_due'
  | 'cancelled'
  | 'trial';

/**
 * USER OBJECT (Firebase Auth Custom Claims)
 * Stored in Firebase Auth + Firestore
 */
export interface MohnMenuUser {
  uid: string;
  email: string;
  displayName: string;
  profileImage?: string;
  role: UserRole;
  
  // Which business(es) is this user associated with?
  businessIds: string[];
  
  // Current active business (for multi-business owners)
  activeBusinessId?: string;
  
  // For drivers: which businesses can they drive for?
  allowedBusinessIds?: string[];
  
  createdAt: string;
  updatedAt: string;
}

/**
 * BUSINESS OBJECT
 * The core tenant in the multi-tenant system
 */
export interface MohnMenuBusiness {
  businessId: string;
  
  // Basic info
  name: string;
  slug: string; // URL-friendly name, e.g., "china-wok-rva"
  ownerId: string; // Firebase Auth UID of the owner
  type: BusinessType;
  description?: string;
  logo?: string;
  
  // Subscription
  tier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  subscriptionStartDate: string;
  subscriptionEndDate?: string;
  
  // Stripe Connect
  stripeAccountId?: string; // Owner's Stripe Express Connected Account
  
  // Custom domain
  customDomain?: string; // e.g., chinawok.com
  brandColors: {
    primary: string;    // e.g., #4F46E5
    secondary: string;  // e.g., #9333EA
    accent: string;     // e.g., #10B981
  };
  
  // Contact info
  ownerEmail: string;
  ownerPhone: string;
  businessPhone?: string;

  // Address (primary location)
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  timezone: string;
  
  // Computed location helper (for map center)
  location?: { lat: number; lng: number };
  
  // SEO Website System — auto-generated tenant website
  website: BusinessWebsite;
  
  // Settings
  settings: {
    orderingEnabled: boolean;
    primaryColor: string;
    logoUrl?: string;
    pricing?: {
      deliveryFee: number;
      minimumOrder: number;
      taxRate: number;
    };
    /** When false, customers can only pay by card (prepayment). Defaults to true. */
    cashPaymentsEnabled?: boolean;
    /** Third-party delivery platform links (Uber Eats, DoorDash, etc.) */
    thirdPartyDelivery?: {
      enabled: boolean;
      uberEatsUrl?: string;
      doordashUrl?: string;
      grubhubUrl?: string;
    };
    /** Allow this business to request drivers from the MohnMenu marketplace */
    useMarketplaceDrivers?: boolean;
    /** Show order stats (order count, ratings) on the public menu page */
    showMenuStats?: boolean;
    /** Enable inventory / stock tracking for menu items */
    inventoryEnabled?: boolean;
    /** Community Courier delivery settings */
    courierDelivery?: {
      enabled: boolean;
      /** Delivery radius in miles (default: 2) */
      radiusMiles: number;
      /** Maximum delivery radius in miles */
      maxRadiusMiles: number;
    };
    /** Enable flash sales / limited-run items */
    flashSalesEnabled?: boolean;
  };
  
  // Features (determined by tier, but can be customized)
  features: {
    liveOrderTracking: boolean;
    driverManagement: boolean;
    kitchenDisplaySystem: boolean;
    loyaltyProgram: boolean;
    liveStreaming: boolean;
    batchRouting: boolean;
    advancedAnalytics: boolean;
    apiAccess: boolean;
    customIntegrations: boolean;
    seoWebsite: boolean; // Can generate a tenant SEO website
  };
  
  // Service areas for delivery
  serviceAreas: string[]; // e.g., ["Richmond", "Henrico", "Chesterfield"]
  
  // Services offered
  services: string[]; // e.g., ["dine-in", "takeout", "delivery", "catering"]
  
  // Operational
  isActive: boolean;
  isLocked: boolean; // Locked if payment failed
  
  // Drivers
  maxInhouseDrivers: number;
  inHouseDriverIds: string[];
  
  // Team
  staffCount: number;
  
  // Metrics
  monthlyRevenue?: number;
  totalOrders?: number;
  customerCount?: number;
  
  // Crypto balance (NOWPayments Custody)
  cryptoBalance?: number;              // USD equivalent of crypto earnings
  nowPaymentsCustomerId?: string;      // NOWPayments custody sub-partner ID
  nowPaymentsCustomerName?: string;    // NOWPayments customer name (mohn_slug)
  
  // Dates
  createdAt: string;
  setupCompletedAt?: string;
  updatedAt: string;
}

/**
 * SEO WEBSITE CONFIGURATION
 * Stored on businesses/{businessId}.website
 * Powers the auto-generated SEO website for each tenant
 */
export interface BusinessWebsite {
  enabled: boolean;
  setupComplete: boolean;
  
  // Custom domain
  customDomain?: string;
  customDomainEnabled: boolean;
  domainPurchased?: boolean;
  domainPurchaseDate?: string;
  domainExpiry?: string;
  domainOrderId?: number;
  domainAutoRenew?: boolean;
  dnsConfigured?: boolean;
  domainStatus?: 'active' | 'pending_dns' | 'expired';
  domainRegistrar?: string;
  stripePaymentIntentId?: string;
  
  // Selected verticals for SEO pages
  selectedServices: string[]; // e.g., ["dine-in", "takeout", "delivery", "catering", "meal-prep"]
  selectedStates: string[];   // e.g., ["VA", "NC"]
  selectedCities: string[];   // e.g., ["Richmond", "Virginia Beach", "Norfolk"]
  
  // Food/store-specific SEO fields
  cuisineType?: string;             // e.g., "chinese", "mexican", "pizza" — from CUISINE_TYPES
  foodCategories?: string[];        // e.g., ["appetizers", "entrees", "desserts"]
  storeCategories?: string[];       // e.g., ["snacks", "drinks", "tobacco"] — for convenience stores
  menuHighlights?: string[];        // e.g., ["General Tso's Chicken", "Pad Thai", "BBQ Brisket"]
  specialties?: string[];           // e.g., ["Authentic Szechuan", "Wood-fired Pizza", "Smoked In-House"]
  
  // Editable website content
  content: {
    tagline?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    aboutTitle?: string;
    aboutContent?: string;
    aboutMission?: string;
    aboutValues?: string;
    contactTitle?: string;
    contactContent?: string;
    businessHours?: string;
    serviceDescriptions?: Record<string, string>; // per-service custom descriptions
  };
  
  // SEO metadata
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
}

/**
 * SERVICE_INFO — base SEO content & metadata for each restaurant/store service type.
 * Used on individual service SEO pages: /{slug}/services/{service}
 * These are the verticals MohnMenu supports — like Menufy but for all local food/store businesses.
 */
export const SERVICE_INFO: Record<string, { label: string; description: string; keywords: string[] }> = {
  'online-ordering': {
    label: 'Online Ordering',
    description: 'Browse our full menu and order online for delivery or pickup. Fast, easy, no middleman fees.',
    keywords: ['online ordering', 'order online', 'food order', 'menu online'],
  },
  'delivery': {
    label: 'Delivery',
    description: 'Fresh food and items delivered straight to your door with real-time GPS tracking. No inflated prices.',
    keywords: ['delivery', 'food delivery', 'order delivery', 'deliver to me', 'local delivery'],
  },
  'takeout': {
    label: 'Takeout & Pickup',
    description: 'Order ahead and pick up your favorites. Hot, fresh, and ready the moment you arrive. Skip the wait.',
    keywords: ['takeout', 'carry out', 'pick up', 'to go', 'curbside pickup'],
  },
  'dine-in': {
    label: 'Dine-In',
    description: 'Enjoy a full dining experience. Great food, great atmosphere, and service that keeps you coming back.',
    keywords: ['dine in', 'restaurant', 'eat in', 'dining', 'sit down restaurant'],
  },
  'catering': {
    label: 'Catering',
    description: 'Professional catering for events of all sizes. Full menu available, custom packages, reliable service.',
    keywords: ['catering', 'event catering', 'party food', 'corporate catering', 'bulk order'],
  },
  'convenience-store': {
    label: 'Convenience Store',
    description: 'Shop snacks, drinks, everyday essentials, and more — delivered or ready for pickup from your local store.',
    keywords: ['convenience store', 'corner store', 'snacks', 'drinks', 'essentials', 'bodega'],
  },
  'grocery': {
    label: 'Grocery & Essentials',
    description: 'Fresh produce, pantry staples, household items, and specialty goods from your neighborhood store.',
    keywords: ['grocery', 'grocery delivery', 'fresh produce', 'local grocery', 'essentials'],
  },
  'bakery': {
    label: 'Bakery',
    description: 'Freshly baked bread, pastries, custom cakes, and desserts. Order ahead for guaranteed freshness.',
    keywords: ['bakery', 'custom cakes', 'pastries', 'fresh bread', 'desserts', 'bakery order'],
  },
  'meal-prep': {
    label: 'Meal Prep',
    description: 'Weekly meal prep packages. Healthy, portioned, ready-to-eat meals for your busy schedule.',
    keywords: ['meal prep', 'weekly meals', 'healthy meals', 'meal planning', 'prepared meals'],
  },
  'food-truck': {
    label: 'Food Truck',
    description: 'Order from our food truck before you arrive. Check our schedule and pre-order your favorites.',
    keywords: ['food truck', 'street food', 'mobile kitchen', 'food truck order'],
  },
  'family-packs': {
    label: 'Family Packs',
    description: 'Feed the whole family. Value packs and combo meals designed for groups. Order online and save.',
    keywords: ['family pack', 'family meal', 'combo deal', 'group order', 'value pack'],
  },
  'late-night': {
    label: 'Late Night',
    description: 'Hungry late? We deliver when others close. Late-night menu available for delivery and pickup.',
    keywords: ['late night food', 'late night delivery', 'midnight food', 'after hours'],
  },
};

/**
 * INVITE CODE — for driver/staff signup
 * Stored at businesses/{businessId}/inviteCodes/{codeId}
 */
export interface InviteCode {
  code: string;
  businessId: string;
  role: UserRole; // What role does this invite grant?
  usedBy?: string; // UID of user who used it
  usedAt?: string;
  expiresAt?: string;
  createdBy: string; // UID of owner who created it
  createdAt: string;
}

/**
 * MENU ITEM — stored in Firestore at businesses/{businessId}/menuItems/{itemId}
 * Or loaded from a static menu.json during onboarding.
 */
export interface MenuItem {
  id: string;
  businessId: string;
  category: string;
  name: string;
  description: string;
  prices: Record<string, number>; // e.g., { "sm": 7.95, "lg": 10.95 } or { "order": 8.50 }
  image_url?: string;
  available: boolean;
  popular?: boolean;
  options?: MenuItemOption[];
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;

  // ── Inventory / Stock ──
  /** Current stock quantity. null/undefined = unlimited (no stock tracking). 0 = sold out. */
  stock?: number | null;
  /** Whether stock tracking is enabled for this item (e.g., bakery: 24 cupcakes) */
  trackStock?: boolean;
  /** Low stock warning threshold */
  lowStockThreshold?: number;

  // ── Order Stats (aggregated) ──
  /** Total times this item has been ordered */
  orderCount?: number;
  /** Average customer rating (1-5) */
  averageRating?: number;
  /** Number of reviews */
  reviewCount?: number;

  // ── Flash Sale / Limited Run ──
  /** Flash sale price (overrides normal price during sale window) */
  flashSalePrice?: number;
  /** Sale start time (ISO string) */
  saleStartTime?: string;
  /** Sale end time (ISO string) */
  saleEndTime?: string;
  /** Whether this is a limited-run item (disappears after stock hits 0) */
  isLimitedRun?: boolean;
  /** Maximum quantity available for limited runs */
  maxQuantity?: number;
}

export interface MenuItemOption {
  label: string; // e.g., "Size", "Protein", "Extra Sauce"
  choices: {
    name: string;
    priceAdd: number; // additional cost, 0 if free
  }[];
  required: boolean;
  maxSelections?: number;
}

/**
 * MENU CATEGORY — for organizing the menu display
 */
export interface MenuCategory {
  name: string;
  description?: string;
  sortOrder: number;
  visible: boolean;
}

/**
 * ONLINE ORDER — placed from the tenant website menu
 * Stored at businesses/{businessId}/orders/{orderId}
 * This is the core transaction in MohnMenu — customer browses menu, adds to cart, checks out.
 */
export interface MohnMenuOnlineOrder {
  orderId: string;
  businessId: string;
  
  // Customer info (may or may not be logged in)
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerId?: string; // Firebase UID if logged in
  
  // Items
  items: Array<{
    menuItemId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    priceSize?: string; // which price key was used ("sm", "lg", "order")
    options?: string[];  // selected options
    specialInstructions?: string;
    lineTotal: number;
  }>;
  
  // Order type
  orderType: 'delivery' | 'pickup';
  
  // Fulfillment
  status: OrderStatus; // reuse the existing OrderStatus type
  
  // Delivery info
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryZip?: string;
  deliveryInstructions?: string;
  
  // Pricing
  subtotal: number;
  taxAmount: number;
  taxRate: number; // e.g., 0.07 for 7%
  deliveryFee: number;
  tip: number;
  total: number;
  
  // Payment
  paymentMethod: 'card' | 'cash' | 'crypto' | 'pay-at-pickup';
  paymentStatus: 'pending' | 'paid' | 'paid_crypto' | 'awaiting_payment' | 'awaiting_crypto' | 'refunded' | 'failed';
  stripePaymentIntentId?: string;
  
  // Crypto payment details (NOWPayments — inline white-label)
  cryptoPayment?: {
    paymentId?: string;        // NOWPayments payment_id
    payAddress?: string;       // Deposit address shown to customer
    payAmount?: number;        // Amount in crypto to send
    payCurrency?: string;      // Crypto currency code (btc, eth, etc.)
    payinExtraId?: string;     // Memo/tag for XRP, XLM, etc.
    invoiceId?: string;        // Legacy: NOWPayments invoice ID
    invoiceUrl?: string;       // Legacy: redirect URL
    nowPaymentId?: string;     // Alias for paymentId (webhook compat)
    status?: string;           // NOWPayments payment status
    actuallyPaid?: number;     // How much was actually paid in crypto
    priceAmountUsd?: number;   // USD equivalent
    expirationEstimate?: string;
    lastIpnAt?: string;
  };
  
  // Timing
  estimatedReadyTime?: string;
  estimatedDeliveryTime?: string;
  scheduledFor?: string; // if scheduled for later
  
  // Driver
  assignedDriverId?: string;
  
  // Special requests
  specialRequests?: string;
  
  // Proof of delivery
  proofOfDeliveryPhoto?: string;
  
  createdAt: string;
  updatedAt: string;
}

/**
 * LOCATION OBJECT
 * A business can have multiple locations
 */
export interface MohnMenuLocation {
  locationId: string;
  businessId: string;
  
  name: string; // "Downtown", "Airport", "Main Street", etc.
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  
  phone: string;
  hours: {
    monday?: { open: string; close: string };     // "09:00" "22:00"
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
  
  isOpen: boolean;
  timezone: string;
  
  // Drivers assigned to this location
  driverIds: string[];
  
  createdAt: string;
  updatedAt: string;
}

/**
 * DRIVER OBJECT (In-House or Marketplace)
 */
export interface MohnMenuDriver {
  driverId: string;
  businessId: string; // Which business they drive for
  userId: string;     // Reference to Firebase Auth user
  
  // Personal info
  name: string;
  phone: string;
  email: string;
  profileImage?: string;
  
  // Driver type
  driverType: 'inhouse' | 'marketplace' | 'courier';
  
  // Vehicle info
  vehicle?: {
    make: string;
    model: string;
    licensePlate: string;
    color: string;
  };

  // Courier-specific
  courierVehicle?: CourierVehicle;
  deliveryRadiusMiles?: number;
  
  // Status
  status: DriverStatus;
  currentLocation?: {
    lat: number;
    lng: number;
    timestamp: string;
  };
  
  // Performance
  rating: number; // 1-5 stars
  totalDeliveries: number;
  acceptanceRate: number; // % of offers accepted
  cancellationRate: number;
  
  // Earnings (for marketplace drivers)
  totalEarnings?: number;
  pendingPayouts?: number;
  lastPayout?: string;
  
  // Verification
  backgroundCheckStatus: 'pending' | 'approved' | 'rejected';
  backgroundCheckDate?: string;
  licenseVerified: boolean;
  insuranceVerified: boolean;
  
  // Availability
  activeLocationIds: string[]; // Which locations they can work at
  
  // Stripe Connect
  stripeAccountId?: string; // Driver's Stripe Express Connected Account
  
  // Dates
  createdAt: string;
  updatedAt: string;
}

/**
 * ORDER OBJECT
 */
export interface MohnMenuOrder {
  orderId: string;
  businessId: string;
  locationId: string;
  customerId: string;
  
  // Items ordered
  items: Array<{
    menuItemId: string;
    quantity: number;
    price: number;
    customizations?: Record<string, string | number>;
    specialInstructions?: string;
  }>;
  
  // Pricing
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  
  // Delivery info
  deliveryType: DeliveryType;
  status: OrderStatus;
  
  // If delivery: who's delivering?
  assignedDriverId?: string;
  driverType?: 'inhouse' | 'marketplace'; // Was this in-house or overflow?
  
  // Delivery location
  deliveryAddress?: string;
  customerLocation?: {
    lat: number;
    lng: number;
  };
  
  // Timing
  estimatedReadyTime?: string;
  estimatedDeliveryTime?: string;
  actualReadyTime?: string;
  actualDeliveryTime?: string;
  
  // Live features
  liveStreamUrl?: string;
  
  // Customer notes
  customerNotes?: string;
  driverNotes?: string;
  
  // Proof of delivery
  proofOfDeliveryPhoto?: string;
  proofOfDeliverySignature?: string;
  
  // Ratings
  customerRating?: number;
  customerReview?: string;
  
  // Dates
  createdAt: string;
  updatedAt: string;
}

/**
 * CUSTOMER OBJECT
 * Tracked per business (multi-tenancy: same person is different customer in different businesses)
 */
export interface MohnMenuCustomer {
  customerId: string;
  businessId: string;
  
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
  
  // Loyalty program
  loyaltyPoints: number;
  totalOrders: number;
  totalSpent: number;
  lifetime_value: number;
  
  // Saved addresses
  savedAddresses: Array<{
    label: string;
    address: string;
    lat: number;
    lng: number;
    isDefault: boolean;
  }>;
  
  // Marketing preferences
  acceptsMarketing: boolean;
  preferredNotificationMethod: 'sms' | 'email' | 'both';
  
  // Recurring orders
  activeSubscriptions?: string[]; // subscription IDs
  
  // Last order
  lastOrderDate?: string;
  
  // Dates
  createdAt: string;
  updatedAt: string;
}

/**
 * PERMISSION MODEL
 * Used to check if a user can perform an action
 */
export interface PermissionContext {
  user: MohnMenuUser;
  business: MohnMenuBusiness;
  role: UserRole;
}

// Permission helpers
export const PERMISSIONS = {
  // Business owner permissions
  owner: {
    canManageBusiness: true,
    canViewOrders: true,
    canManageDrivers: true,
    canManageStaff: true,
    canViewAnalytics: true,
    canManagePayments: true,
    canAccessAPI: true,
  },
  // Manager permissions
  manager: {
    canManageBusiness: false,
    canViewOrders: true,
    canManageDrivers: true,
    canManageStaff: false,
    canViewAnalytics: true,
    canManagePayments: false,
    canAccessAPI: false,
  },
  // Driver permissions
  driver_inhouse: {
    canManageBusiness: false,
    canViewOrders: true,  // Only their assigned orders
    canManageDrivers: false,
    canManageStaff: false,
    canViewAnalytics: false,
    canManagePayments: false,
    canAccessAPI: false,
  },
  // Customer permissions
  customer: {
    canManageBusiness: false,
    canViewOrders: false, // Only their own
    canManageDrivers: false,
    canManageStaff: false,
    canViewAnalytics: false,
    canManagePayments: false,
    canAccessAPI: false,
  },
} as const;
