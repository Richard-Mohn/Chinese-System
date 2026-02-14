'use client';

import { usePathname } from 'next/navigation';
import DemoBanner from '@/components/DemoBanner';
import { getDemoRoleConfig } from './demoRoleConfigs';

export default function DemoRouteBanner() {
  const pathname = usePathname();
  const config = getDemoRoleConfig(pathname);

  if (!config) return null;

  return (
    <DemoBanner
      businessSlug={config.businessSlug}
      welcomeTitle={config.welcomeTitle}
      welcomeSubtitle={config.welcomeSubtitle}
      backLinkHref={config.backLinkHref}
      demoAccounts={config.demoAccounts}
      roleQuickLinks={config.roleQuickLinks}
    />
  );
}
