// Mohn Empire — Unified Auth, Points & UI for all Mohn Empire platforms

// Config
export { MOHN_EMPIRE_FIREBASE_CONFIG, MOHN_EMPIRE_APP_NAME, EMPIRE_COLLECTIONS, EMPIRE_PLATFORMS } from './config';
export type { PlatformId } from './config';

// Firebase
export { getEmpireApp, getEmpireAuth, getEmpireDb } from './firebase';

// Types
export type {
  MohnEmpireUser,
  PointsTransaction,
  EmpireTier,
  PointsReason,
  EmpireAuthState,
  PlatformAnalytics,
} from './types';
export {
  POINTS_RULES,
  TIER_THRESHOLDS,
  TIER_INFO,
  calculateTier,
  generateReferralCode,
} from './types';

// Auth
export { MohnEmpireProvider, useMohnAuth } from './auth-context';

// Points
export { awardPoints, spendPoints, getPointsHistory, applyReferralBonus, awardDailyLogin } from './points';
export { runBackgroundCheck } from './background-checks';
export type { BackgroundCheckRequest, BackgroundCheckResult, BackgroundCheckStatus } from './background-checks';

// Components
export { MohnLoginModal } from './components/MohnLoginModal';
export { MohnUserBadge } from './components/MohnUserBadge';
export { EmpireFooterBar } from './components/EmpireFooterBar';
export { default as BackgroundCheckPanel } from './components/BackgroundCheckPanel';
