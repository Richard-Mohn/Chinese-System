'use client';

import {
  FaBroadcastTower,
  FaBriefcase,
  FaBoxOpen,
  FaCar,
  FaCashRegister,
  FaChartLine,
  FaClipboardList,
  FaConciergeBell,
  FaDesktop,
  FaDonate,
  FaGuitar,
  FaHandsHelping,
  FaRoute,
  FaShoppingBasket,
  FaStore,
  FaTv,
  FaTruck,
  FaUser,
  FaUserTie,
  FaUsers,
  FaVideo,
  FaWrench,
} from 'react-icons/fa';
import type { DemoAccount, DemoQuickLink } from '@/components/DemoBanner';

interface DemoRoleConfig {
  businessSlug: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  backLinkHref: string;
  demoAccounts: DemoAccount[];
  roleQuickLinks: Record<string, DemoQuickLink[]>;
}

const PASSWORDLESS_ACCOUNTS = {
  owner: 'owner@coppertap.demo',
  bartender: 'bartender@coppertap.demo',
  server: 'server@coppertap.demo',
  driver: 'driver@coppertap.demo',
  customer: 'customer@coppertap.demo',
};

function createCommonLinks(slug: string): Record<string, DemoQuickLink[]> {
  return {
    owner: [
      { label: 'Owner Dashboard', href: '/owner', icon: FaChartLine },
      { label: 'Orders', href: '/owner/orders', icon: FaClipboardList },
      { label: 'Staff', href: '/owner/staff', icon: FaUsers },
      { label: 'Drivers', href: '/owner/drivers', icon: FaTruck },
    ],
    customer: [
      { label: 'Shop Demo', href: `/demo/${slug}`, icon: FaStore },
      { label: 'Order Flow', href: '/order/the-copper-tap', icon: FaShoppingBasket },
      { label: 'My Orders', href: '/customer/orders', icon: FaClipboardList },
    ],
  };
}

function createConfig(
  slug: string,
  title: string,
  subtitle: string,
  accounts: DemoAccount[],
  quickLinks: Record<string, DemoQuickLink[]>,
): DemoRoleConfig {
  return {
    businessSlug: slug,
    welcomeTitle: title,
    welcomeSubtitle: subtitle,
    backLinkHref: `/demo/${slug}`,
    demoAccounts: accounts,
    roleQuickLinks: quickLinks,
  };
}

export const DEMO_ROLE_CONFIGS: Record<string, DemoRoleConfig> = {
  bars: createConfig(
    'bars',
    'Explore this nightlife demo as Owner, Bartender, Server, Driver, or Customer.',
    'Each role mirrors real bar operations with role-appropriate controls and quick links.',
    [
      { role: 'owner', label: 'Owner / Admin', email: PASSWORDLESS_ACCOUNTS.owner, icon: FaUserTie, color: 'from-amber-500 to-orange-600', description: 'Manage full operation, staffing, and analytics.', dashboardPath: '/owner' },
      { role: 'bartender', label: 'Bartender', email: PASSWORDLESS_ACCOUNTS.bartender, icon: FaConciergeBell, color: 'from-purple-500 to-indigo-600', description: 'Handle drink tickets and service queue.', dashboardPath: '/owner/kds' },
      { role: 'server', label: 'Server', email: PASSWORDLESS_ACCOUNTS.server, icon: FaCashRegister, color: 'from-emerald-500 to-teal-600', description: 'Manage table flow and active tickets.', dashboardPath: '/owner/orders' },
      { role: 'driver', label: 'Delivery Driver', email: PASSWORDLESS_ACCOUNTS.driver, icon: FaTruck, color: 'from-blue-500 to-cyan-600', description: 'Accept and complete delivery runs.', dashboardPath: '/driver' },
      { role: 'customer', label: 'Customer', email: PASSWORDLESS_ACCOUNTS.customer, icon: FaUser, color: 'from-pink-500 to-rose-600', description: 'Browse, order, and track from storefront.', dashboardPath: '/demo/bars' },
    ],
    {
      ...createCommonLinks('bars'),
      bartender: [
        { label: 'Kitchen Display', href: '/owner/kds', icon: FaClipboardList },
        { label: 'Orders', href: '/owner/orders', icon: FaBoxOpen },
      ],
      server: [
        { label: 'Orders', href: '/owner/orders', icon: FaClipboardList },
        { label: 'Storefront', href: '/the-copper-tap', icon: FaStore },
      ],
      driver: [{ label: 'Driver Dashboard', href: '/driver', icon: FaTruck }],
    },
  ),
  coffee: createConfig(
    'coffee',
    'Try this coffee demo as Owner, Barista, Cashier, Driver, or Customer.',
    'Perfect for owner walkthroughs, barista workflow demos, and customer ordering tests.',
    [
      { role: 'owner', label: 'Owner / Admin', email: PASSWORDLESS_ACCOUNTS.owner, icon: FaUserTie, color: 'from-amber-500 to-orange-600', description: 'Run menu, pricing, and daily reporting.', dashboardPath: '/owner' },
      { role: 'barista', label: 'Barista', email: PASSWORDLESS_ACCOUNTS.bartender, icon: FaConciergeBell, color: 'from-purple-500 to-indigo-600', description: 'Work queue and prep tickets in KDS.', dashboardPath: '/owner/kds' },
      { role: 'cashier', label: 'Cashier', email: PASSWORDLESS_ACCOUNTS.server, icon: FaCashRegister, color: 'from-emerald-500 to-teal-600', description: 'Manage front counter and order handoff.', dashboardPath: '/owner/orders' },
      { role: 'driver', label: 'Delivery Driver', email: PASSWORDLESS_ACCOUNTS.driver, icon: FaTruck, color: 'from-blue-500 to-cyan-600', description: 'Complete pickup and neighborhood delivery.', dashboardPath: '/driver' },
      { role: 'customer', label: 'Customer', email: PASSWORDLESS_ACCOUNTS.customer, icon: FaUser, color: 'from-pink-500 to-rose-600', description: 'Use mobile order-ahead experience.', dashboardPath: '/demo/coffee' },
    ],
    {
      ...createCommonLinks('coffee'),
      barista: [{ label: 'Kitchen Display', href: '/owner/kds', icon: FaClipboardList }],
      cashier: [{ label: 'Orders', href: '/owner/orders', icon: FaCashRegister }],
      driver: [{ label: 'Driver Dashboard', href: '/driver', icon: FaTruck }],
    },
  ),
  music: createConfig(
    'music',
    'Switch roles across Artist Admin, Tour Manager, Merch Manager, Driver, and Fan.',
    'See how artist operations, ticketing, and merchandise can run from one account system.',
    [
      { role: 'owner', label: 'Artist / Admin', email: PASSWORDLESS_ACCOUNTS.owner, icon: FaGuitar, color: 'from-violet-500 to-purple-600', description: 'Control storefront, releases, and analytics.', dashboardPath: '/owner' },
      { role: 'tour-manager', label: 'Tour Manager', email: PASSWORDLESS_ACCOUNTS.bartender, icon: FaRoute, color: 'from-indigo-500 to-blue-600', description: 'Manage events, schedules, and lineup updates.', dashboardPath: '/owner/orders' },
      { role: 'merch-manager', label: 'Merch Manager', email: PASSWORDLESS_ACCOUNTS.server, icon: FaShoppingBasket, color: 'from-emerald-500 to-teal-600', description: 'Handle catalog, stock, and fulfillment flow.', dashboardPath: '/owner/menu' },
      { role: 'driver', label: 'Delivery Driver', email: PASSWORDLESS_ACCOUNTS.driver, icon: FaTruck, color: 'from-blue-500 to-cyan-600', description: 'Deliver local merch and event bundles.', dashboardPath: '/driver' },
      { role: 'customer', label: 'Fan / Customer', email: PASSWORDLESS_ACCOUNTS.customer, icon: FaUser, color: 'from-pink-500 to-rose-600', description: 'Browse tracks, tour dates, and merch.', dashboardPath: '/demo/music' },
    ],
    {
      ...createCommonLinks('music'),
      'tour-manager': [{ label: 'Orders', href: '/owner/orders', icon: FaClipboardList }],
      'merch-manager': [{ label: 'Catalog', href: '/owner/menu', icon: FaShoppingBasket }],
      driver: [{ label: 'Driver Dashboard', href: '/driver', icon: FaTruck }],
    },
  ),
  grocery: createConfig(
    'grocery',
    'Test this market demo as Owner, Cashier, Inventory Associate, Driver, or Shopper.',
    'Professional grocery roles are mapped for realistic team walkthroughs and onboarding demos.',
    [
      { role: 'owner', label: 'Owner / Admin', email: PASSWORDLESS_ACCOUNTS.owner, icon: FaUserTie, color: 'from-green-500 to-emerald-600', description: 'Full operations and business controls.', dashboardPath: '/owner' },
      { role: 'cashier', label: 'Cashier', email: PASSWORDLESS_ACCOUNTS.server, icon: FaCashRegister, color: 'from-blue-500 to-indigo-600', description: 'Manage checkout and order fulfillment.', dashboardPath: '/owner/orders' },
      { role: 'inventory-associate', label: 'Inventory Associate', email: PASSWORDLESS_ACCOUNTS.bartender, icon: FaBoxOpen, color: 'from-violet-500 to-purple-600', description: 'Track stock and prep substitutions.', dashboardPath: '/owner/menu' },
      { role: 'driver', label: 'Delivery Driver', email: PASSWORDLESS_ACCOUNTS.driver, icon: FaTruck, color: 'from-cyan-500 to-blue-600', description: 'Deliver baskets and scheduled orders.', dashboardPath: '/driver' },
      { role: 'customer', label: 'Shopper', email: PASSWORDLESS_ACCOUNTS.customer, icon: FaUser, color: 'from-rose-500 to-pink-600', description: 'Browse aisles and place pickup/delivery orders.', dashboardPath: '/demo/grocery' },
    ],
    {
      ...createCommonLinks('grocery'),
      cashier: [{ label: 'Orders', href: '/owner/orders', icon: FaClipboardList }],
      'inventory-associate': [{ label: 'Catalog', href: '/owner/menu', icon: FaBoxOpen }],
      driver: [{ label: 'Driver Dashboard', href: '/driver', icon: FaTruck }],
    },
  ),
  convenience: createConfig(
    'convenience',
    'Switch between Owner, Cashier, Shift Lead, Driver, and Shopper for c-store operations.',
    'Role cards are aligned to convenience-store staffing and fulfillment patterns.',
    [
      { role: 'owner', label: 'Owner / Admin', email: PASSWORDLESS_ACCOUNTS.owner, icon: FaUserTie, color: 'from-blue-500 to-indigo-600', description: 'Control pricing, staffing, and operations.', dashboardPath: '/owner' },
      { role: 'cashier', label: 'Cashier', email: PASSWORDLESS_ACCOUNTS.server, icon: FaCashRegister, color: 'from-emerald-500 to-teal-600', description: 'Run register flow and order release.', dashboardPath: '/owner/orders' },
      { role: 'shift-lead', label: 'Shift Lead', email: PASSWORDLESS_ACCOUNTS.bartender, icon: FaBriefcase, color: 'from-amber-500 to-orange-600', description: 'Oversee shift tasks and service continuity.', dashboardPath: '/owner/staff' },
      { role: 'driver', label: 'Delivery Driver', email: PASSWORDLESS_ACCOUNTS.driver, icon: FaTruck, color: 'from-cyan-500 to-blue-600', description: 'Handle rapid local delivery requests.', dashboardPath: '/driver' },
      { role: 'customer', label: 'Shopper', email: PASSWORDLESS_ACCOUNTS.customer, icon: FaUser, color: 'from-pink-500 to-rose-600', description: 'Place quick reorder and essentials pickups.', dashboardPath: '/demo/convenience' },
    ],
    {
      ...createCommonLinks('convenience'),
      cashier: [{ label: 'Orders', href: '/owner/orders', icon: FaCashRegister }],
      'shift-lead': [{ label: 'Staff', href: '/owner/staff', icon: FaUsers }],
      driver: [{ label: 'Driver Dashboard', href: '/driver', icon: FaTruck }],
    },
  ),
  driver: createConfig(
    'driver',
    'View delivery operations as Fleet Owner, Dispatcher, Driver, Roadside Tech, or Customer.',
    'Role switching helps operators validate every part of the delivery and support lifecycle.',
    [
      { role: 'owner', label: 'Fleet Owner / Admin', email: PASSWORDLESS_ACCOUNTS.owner, icon: FaUserTie, color: 'from-emerald-500 to-green-600', description: 'Manage fleet, payouts, and compliance.', dashboardPath: '/owner/drivers' },
      { role: 'dispatcher', label: 'Dispatcher', email: PASSWORDLESS_ACCOUNTS.server, icon: FaRoute, color: 'from-blue-500 to-indigo-600', description: 'Monitor assignment and active runs.', dashboardPath: '/owner/orders' },
      { role: 'driver', label: 'Professional Driver', email: PASSWORDLESS_ACCOUNTS.driver, icon: FaCar, color: 'from-cyan-500 to-sky-600', description: 'Accept jobs and complete routes.', dashboardPath: '/driver' },
      { role: 'roadside-tech', label: 'Roadside Technician', email: PASSWORDLESS_ACCOUNTS.bartender, icon: FaWrench, color: 'from-orange-500 to-amber-600', description: 'Respond to jump, lockout, and tire calls.', dashboardPath: '/driver' },
      { role: 'customer', label: 'Customer', email: PASSWORDLESS_ACCOUNTS.customer, icon: FaUser, color: 'from-pink-500 to-rose-600', description: 'Track ETAs and request support.', dashboardPath: '/demo/driver' },
    ],
    {
      ...createCommonLinks('driver'),
      dispatcher: [{ label: 'Orders', href: '/owner/orders', icon: FaClipboardList }],
      'roadside-tech': [{ label: 'Driver App', href: '/driver', icon: FaWrench }],
      driver: [{ label: 'Driver Dashboard', href: '/driver', icon: FaTruck }],
    },
  ),
  roadside: createConfig(
    'roadside',
    'Use role switcher to test Owner, Dispatcher, Roadside Technician, Driver, and Customer.',
    'This mirrors the roadside workflow from intake through dispatch and completion payout.',
    [
      { role: 'owner', label: 'Ops Owner / Admin', email: PASSWORDLESS_ACCOUNTS.owner, icon: FaUserTie, color: 'from-orange-500 to-amber-600', description: 'Manage service coverage and performance.', dashboardPath: '/owner/drivers' },
      { role: 'dispatcher', label: 'Dispatcher', email: PASSWORDLESS_ACCOUNTS.server, icon: FaRoute, color: 'from-blue-500 to-indigo-600', description: 'Route and track incoming service calls.', dashboardPath: '/owner/orders' },
      { role: 'roadside-tech', label: 'Roadside Technician', email: PASSWORDLESS_ACCOUNTS.bartender, icon: FaWrench, color: 'from-violet-500 to-purple-600', description: 'Respond to roadside incidents.', dashboardPath: '/driver' },
      { role: 'driver', label: 'Marketplace Driver', email: PASSWORDLESS_ACCOUNTS.driver, icon: FaTruck, color: 'from-cyan-500 to-blue-600', description: 'Accept job offers and complete service.', dashboardPath: '/driver' },
      { role: 'customer', label: 'Customer', email: PASSWORDLESS_ACCOUNTS.customer, icon: FaUser, color: 'from-pink-500 to-rose-600', description: 'Request assistance and monitor ETA.', dashboardPath: '/demo/roadside' },
    ],
    {
      ...createCommonLinks('roadside'),
      dispatcher: [{ label: 'Orders', href: '/owner/orders', icon: FaClipboardList }],
      'roadside-tech': [{ label: 'Driver App', href: '/driver', icon: FaWrench }],
      driver: [{ label: 'Driver Dashboard', href: '/driver', icon: FaTruck }],
    },
  ),
  'shepherds-gate': createConfig(
    'shepherds-gate',
    'Welcome to the Shepherds Gate demo! Click any role below to instantly log in and explore the platform.',
    'Each role highlights a church team: admin, media, volunteers, care, and finance.',
    [
      { role: 'pastor', label: 'Pastor Admin', email: 'pastor@shepherdsgate.demo', icon: FaUserTie, color: 'from-emerald-500 to-teal-600', description: 'Dashboard, giving insights, events, and member care.', dashboardPath: '/owner' },
      { role: 'media', label: 'Media / AV', email: 'media@shepherdsgate.demo', icon: FaVideo, color: 'from-indigo-500 to-sky-500', description: 'Streaming console, run of service, and media cues.', dashboardPath: '/owner/kds' },
      { role: 'volunteer', label: 'Volunteer Lead', email: 'volunteers@shepherdsgate.demo', icon: FaHandsHelping, color: 'from-amber-500 to-orange-500', description: 'Schedules, rotations, and team communication.', dashboardPath: '/owner/staff' },
      { role: 'care', label: 'Care Team', email: 'care@shepherdsgate.demo', icon: FaUser, color: 'from-pink-500 to-rose-500', description: 'Prayer requests, follow-ups, and care workflows.', dashboardPath: '/owner/website' },
      { role: 'finance', label: 'Finance / Giving', email: 'finance@shepherdsgate.demo', icon: FaDonate, color: 'from-emerald-600 to-green-500', description: 'Giving campaigns, receipts, and reporting.', dashboardPath: '/owner/analytics' },
    ],
    {
      pastor: [
        { label: 'Dashboard', href: '/owner', icon: FaUserTie },
        { label: 'Giving', href: '/demo/shepherds-gate#giving', icon: FaDonate },
        { label: 'Events', href: '/demo/shepherds-gate#events', icon: FaClipboardList },
      ],
      media: [
        { label: 'Projector', href: '/demo/shepherds-gate/menu-board', icon: FaTv },
        { label: 'KDS', href: '/owner/kds', icon: FaDesktop },
        { label: 'Stream Hub', href: '/demo/shepherds-gate#streaming', icon: FaBroadcastTower },
      ],
      volunteer: [
        { label: 'Teams', href: '/owner/staff', icon: FaHandsHelping },
        { label: 'Events', href: '/demo/shepherds-gate#events', icon: FaClipboardList },
      ],
      care: [
        { label: 'Member Care', href: '/demo/shepherds-gate#ministries', icon: FaUsers },
        { label: 'Prayer Requests', href: '/demo/shepherds-gate#events', icon: FaDonate },
      ],
      finance: [
        { label: 'Giving', href: '/demo/shepherds-gate#giving', icon: FaDonate },
        { label: 'Analytics', href: '/owner/analytics', icon: FaChartLine },
      ],
      default: [
        { label: 'Donate', href: '/demo/shepherds-gate#giving', icon: FaDonate },
        { label: 'Events', href: '/demo/shepherds-gate#events', icon: FaClipboardList },
        { label: 'Projector', href: '/demo/shepherds-gate/menu-board', icon: FaTv },
      ],
    },
  ),
};

const TEMPLATE_PAGE_TYPES: Record<string, keyof typeof DEMO_ROLE_CONFIGS> = {
  pizza: 'bars',
  bakery: 'coffee',
  'food-truck': 'driver',
  boutique: 'coffee',
  antique: 'coffee',
};

export function getDemoRoleConfig(pathname: string): DemoRoleConfig | null {
  const route = pathname.replace(/^\/demo\/?/, '').split('/')[0];
  if (!route) return null;
  if (DEMO_ROLE_CONFIGS[route]) {
    return DEMO_ROLE_CONFIGS[route];
  }
  const templateType = TEMPLATE_PAGE_TYPES[route];
  if (templateType) {
    const base = DEMO_ROLE_CONFIGS[templateType];
    return {
      ...base,
      businessSlug: route,
      backLinkHref: `/demo/${route}`,
      demoAccounts: base.demoAccounts.map(account =>
        account.role === 'customer' ? { ...account, dashboardPath: `/demo/${route}` } : account,
      ),
      roleQuickLinks: {
        ...base.roleQuickLinks,
        customer: [
          { label: 'Shop Demo', href: `/demo/${route}`, icon: FaStore },
          { label: 'My Orders', href: '/customer/orders', icon: FaClipboardList },
        ],
      },
    };
  }
  return null;
}
