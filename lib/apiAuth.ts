/**
 * API Route Authentication Helper
 *
 * Verifies Firebase Auth tokens from the Authorization header.
 * Usage in API routes:
 *
 *   const auth = await verifyApiAuth(request);
 *   if (auth.error) return auth.error;
 *   const { uid, email } = auth;
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from './firebaseAdmin';

export interface AuthResult {
  uid: string;
  email?: string;
  error?: never;
}

export interface AuthError {
  uid?: never;
  email?: never;
  error: NextResponse;
}

/**
 * Verify the Firebase ID token from the Authorization: Bearer <token> header.
 * Returns { uid, email } on success, or { error: NextResponse } on failure.
 */
export async function verifyApiAuth(
  request: NextRequest
): Promise<AuthResult | AuthError> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      error: NextResponse.json(
        { error: 'Missing or invalid Authorization header. Expected: Bearer <token>' },
        { status: 401 }
      ),
    };
  }

  const idToken = authHeader.slice(7); // Remove "Bearer "

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    return { uid: decoded.uid, email: decoded.email };
  } catch (err) {
    console.error('Auth token verification failed:', err);
    return {
      error: NextResponse.json(
        { error: 'Invalid or expired authentication token' },
        { status: 401 }
      ),
    };
  }
}
