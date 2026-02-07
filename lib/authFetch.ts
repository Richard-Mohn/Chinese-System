/**
 * Authenticated Fetch Helper
 *
 * Wraps fetch() to automatically add the Firebase Auth token
 * to the Authorization header for API routes that require it.
 *
 * Usage:
 *   import { authFetch } from '@/lib/authFetch';
 *   const res = await authFetch('/api/stripe/create-payment-intent', {
 *     method: 'POST',
 *     body: JSON.stringify({ amount: 1000 }),
 *   });
 */

import { getAuth } from 'firebase/auth';

/**
 * Fetch with Firebase Auth token.
 * Automatically adds `Authorization: Bearer <idToken>` header.
 * Falls back to regular fetch if no user is signed in.
 */
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const auth = getAuth();
  const user = auth.currentUser;

  const headers = new Headers(options.headers || {});

  if (user) {
    try {
      const token = await user.getIdToken();
      headers.set('Authorization', `Bearer ${token}`);
    } catch (err) {
      console.warn('Failed to get auth token for API call:', err);
    }
  }

  // Set Content-Type for JSON if body is a string and not already set
  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
