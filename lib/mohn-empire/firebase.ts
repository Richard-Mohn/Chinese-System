// ============================================================================
// Mohn Empire — Secondary Firebase App (Auth Hub)
// Initializes a SEPARATE Firebase app for empire auth + central data.
// This does NOT conflict with each project's own Firebase instance.
// ============================================================================

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { MOHN_EMPIRE_FIREBASE_CONFIG, MOHN_EMPIRE_APP_NAME } from './config';

let _empireApp: FirebaseApp | null = null;
let _empireAuth: Auth | null = null;
let _empireDb: Firestore | null = null;

/**
 * Get or initialize the Mohn Empire Firebase app.
 * This is a SECONDARY app that runs alongside each project's own Firebase.
 */
export function getEmpireApp(): FirebaseApp {
  if (_empireApp) return _empireApp;

  // Check if already initialized (e.g. HMR in dev mode)
  const existing = getApps().find((app) => app.name === MOHN_EMPIRE_APP_NAME);
  if (existing) {
    _empireApp = existing;
    return _empireApp;
  }

  _empireApp = initializeApp(MOHN_EMPIRE_FIREBASE_CONFIG, MOHN_EMPIRE_APP_NAME);
  return _empireApp;
}

/** Firebase Auth instance for the Mohn Empire hub */
export function getEmpireAuth(): Auth {
  if (!_empireAuth) {
    _empireAuth = getAuth(getEmpireApp());
  }
  return _empireAuth;
}

/** Firestore instance for the Mohn Empire hub (central user profiles + points) */
export function getEmpireDb(): Firestore {
  if (!_empireDb) {
    _empireDb = getFirestore(getEmpireApp());
  }
  return _empireDb;
}
