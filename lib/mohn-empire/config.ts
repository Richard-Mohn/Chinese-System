// ============================================================================
// Mohn Empire — Unified Platform Configuration
// Central Firebase project: mohnmint
// ============================================================================

/** Firebase configuration for the Mohn Empire auth hub (mohnmint project) */
export const MOHN_EMPIRE_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBzvaUJZLWFUh9afLEI2wHZXxE1a5FkSXU',
  authDomain: 'mohnmint.firebaseapp.com',
  projectId: 'mohnmint',
  storageBucket: 'mohnmint.firebasestorage.app',
  messagingSenderId: '24430670',
  appId: '1:24430670:web:44d631afe35f7102a75b1f',
  measurementId: 'G-RDMTQH565T',
} as const;

/** Name for the secondary Firebase app instance (avoids conflicts with per-project Firebase) */
export const MOHN_EMPIRE_APP_NAME = 'mohn-empire';

/** Firestore collection names in the auth hub */
export const EMPIRE_COLLECTIONS = {
  users: 'empire_users',
  pointsTransactions: 'empire_points_transactions',
  analytics: 'empire_analytics',
  platforms: 'empire_platforms',
} as const;

/** All Mohn Empire platforms */
export const EMPIRE_PLATFORMS = [
  {
    id: 'mohnmint',
    name: 'MohnMint',
    tagline: 'Digital Currency',
    url: 'https://mohnmint.com',
    color: '#6366f1',
    icon: '💰',
  },
  {
    id: 'mohnmatrix',
    name: 'MohnMatrix',
    tagline: 'Background Checks',
    url: 'https://mohnmatrix.com',
    color: '#8b5cf6',
    icon: '🔍',
  },
  {
    id: 'mohnmenu',
    name: 'MohnMenu',
    tagline: 'Food & Delivery',
    url: 'https://mohnmenu.com',
    color: '#ef4444',
    icon: '🍔',
  },
  {
    id: 'mohnsters',
    name: 'MohnSters',
    tagline: 'Collectible Game',
    url: 'https://mohnsters.com',
    color: '#10b981',
    icon: '👾',
  },
  {
    id: 'flamingsocial',
    name: 'Flaming Social',
    tagline: 'Social Media Growth',
    url: 'https://flamingsocialmedia.com',
    color: '#f97316',
    icon: '🔥',
  },
  {
    id: 'neighbortechs',
    name: 'NeighborTechs',
    tagline: 'Tech Repair',
    url: 'https://neighbortechs.com',
    color: '#06b6d4',
    icon: '🔧',
  },
  {
    id: 'rivercitymoving',
    name: 'RiverCity Moving',
    tagline: 'Moving Services',
    url: 'https://rivercitymovingva.com',
    color: '#eab308',
    icon: '🚚',
  },
] as const;

export type PlatformId = (typeof EMPIRE_PLATFORMS)[number]['id'];
