import type {
  OfferwallActorRole,
  OfferwallDevice,
  OfferwallPlacement,
  OfferwallTrackingContext,
} from './ogads-types';

export function generateSessionId(): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 10);
  return `${ts}-${rand}`;
}

export function detectDevice(userAgent?: string): OfferwallDevice {
  if (typeof window !== 'undefined') {
    const cap = (window as any).Capacitor;
    if (cap?.isNativePlatform?.()) {
      const platform = cap.getPlatform?.();
      if (platform === 'android') return 'android';
      if (platform === 'ios') return 'ios';
    }
  }

  const ua = userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '');
  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  if (/mobile/i.test(ua)) return 'web';
  return 'desktop';
}

export function buildAffSubParams(ctx: OfferwallTrackingContext): Record<string, string> {
  return {
    aff_sub: ctx.userId,
    aff_sub2: `${ctx.source}:${ctx.placement}`,
    aff_sub3: ctx.businessId || 'none',
    aff_sub4: ctx.role,
    aff_sub5: ctx.sessionId,
  };
}

export function parsePostbackContext(params: {
  aff_sub?: string | null;
  aff_sub2?: string | null;
  aff_sub3?: string | null;
  aff_sub4?: string | null;
  aff_sub5?: string | null;
}) {
  const userId = params.aff_sub || '';
  if (!userId) return null;

  const [source, placement] = (params.aff_sub2 || 'mohnmenu:rewards_page').split(':');
  const businessId = params.aff_sub3 || 'none';
  const role = ((params.aff_sub4 || 'customer') as OfferwallActorRole);
  const sessionId = params.aff_sub5 || generateSessionId();

  return {
    userId,
    source: source === 'mohnmenu' ? 'mohnmenu' : 'mohnmenu',
    placement: (placement || 'rewards_page') as OfferwallPlacement,
    businessId,
    role,
    sessionId,
  };
}
