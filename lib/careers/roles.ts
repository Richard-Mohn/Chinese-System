export interface EcosystemRole {
  slug: string;
  title: string;
  category: 'hospitality' | 'delivery' | 'church' | 'operations';
  summary: string;
  details: string;
  applyHref: string;
  badge: string;
  highlights: string[];
}

export const ECOSYSTEM_ROLES: EcosystemRole[] = [
  {
    slug: 'delivery-driver',
    title: 'Delivery Driver',
    category: 'delivery',
    badge: 'Driver Network',
    summary: 'Deliver food, drinks, and local products with flexible hours and role-based earnings.',
    details:
      'Drivers accept delivery requests, can pick up roadside support opportunities, and can earn extra credits during downtime through offerwall tasks.',
    applyHref: '/signup/driver',
    highlights: [
      'Use car, bike, scooter, or walking routes depending on coverage zone',
      'Role-based payout tracking per business and per shift',
      'Offerwall add-on earnings between active jobs',
      'Future-ready for in-game delivery scenarios in Mohnsters',
    ],
  },
  {
    slug: 'community-courier',
    title: 'Community Courier',
    category: 'delivery',
    badge: 'Open Signup',
    summary: 'Open-registration courier role for neighborhood pickup/drop-off delivery.',
    details:
      'Community couriers can onboard quickly, complete local deliveries, and grow into advanced driver roles after consistency and verification.',
    applyHref: '/signup/courier',
    highlights: [
      'No invite code required for onboarding',
      'Best for short-radius neighborhood delivery',
      'Works with bike, scooter, walking, and car modes',
      'Can stack with offerwall earnings during low-demand hours',
    ],
  },
  {
    slug: 'bartender-server',
    title: 'Bartender / Server',
    category: 'hospitality',
    badge: 'Hospitality Marketplace',
    summary: 'Serve across bars, restaurants, lounges, and event venues with one profile.',
    details:
      'Staff members build public professional profiles, apply to shifts, and can work across multiple venues that use the MohnMenu staffing system.',
    applyHref: '/signup/bartender',
    highlights: [
      'One profile can be used across multiple businesses',
      'Certifications and specialties are visible to owners',
      'Role-specific review and rating growth',
      'Background check handled during application flow',
    ],
  },
  {
    slug: 'kitchen-staff',
    title: 'Kitchen Staff',
    category: 'hospitality',
    badge: 'Back-of-House',
    summary: 'Line cooks, prep cooks, and kitchen support roles for growing restaurant teams.',
    details:
      'Kitchen team members can apply through the same ecosystem and be routed into restaurants with active hiring needs and role-based schedules.',
    applyHref: '/signup/bartender',
    highlights: [
      'Cross-venue opportunities for stable scheduling',
      'Clear role expectations and shift requirements',
      'Integrated with owner hiring and team management',
      'Application-based background check gating',
    ],
  },
  {
    slug: 'church-volunteer',
    title: 'Church Volunteer',
    category: 'church',
    badge: 'Faith & Community',
    summary: 'Volunteer roles for church events, support teams, and community operations.',
    details:
      'Church operators can post opportunities and recruit volunteers while maintaining role visibility, trust checks, and campaign-level performance metrics.',
    applyHref: '/signup/bartender',
    highlights: [
      'Volunteer role pages and church-specific onboarding',
      'Fundraising pathways linked to offerwall participation',
      'Role-based assignment controls for ministry teams',
      'Consistent application screening flow where enabled',
    ],
  },
  {
    slug: 'operations-manager',
    title: 'Operations Manager',
    category: 'operations',
    badge: 'Leadership',
    summary: 'Lead staffing, shift quality, and service operations for one or multiple locations.',
    details:
      'Managers coordinate hiring, staff coverage, and delivery readiness while using centralized dashboards for performance and compliance.',
    applyHref: '/signup/owner',
    highlights: [
      'Coordinate multi-role teams from one workflow',
      'Visibility across staffing and delivery readiness',
      'Works with role-based access and reporting',
      'Recruitment and application pipeline support',
    ],
  },
];

export function getRoleBySlug(slug: string): EcosystemRole | undefined {
  return ECOSYSTEM_ROLES.find(role => role.slug === slug);
}
