/**
 * Firebase Admin SDK — Server-side only
 *
 * Used by API routes that need Firestore admin access
 * (domain purchases, webhooks, etc.)
 *
 * Uses the service account key file for authentication.
 */

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

let adminApp: App;
let adminDb: Firestore;

function initAdmin() {
  if (getApps().length === 0) {
    // Try service account key file first, then default credentials
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const serviceAccount = require('../serviceAccountKey.json');
      adminApp = initializeApp({
        credential: cert(serviceAccount),
      });
    } catch {
      // In production (Firebase App Hosting), use default credentials
      adminApp = initializeApp();
    }
  } else {
    adminApp = getApps()[0];
  }

  adminDb = getFirestore(adminApp);
}

// Initialize on import
initAdmin();

export { adminApp, adminDb };
