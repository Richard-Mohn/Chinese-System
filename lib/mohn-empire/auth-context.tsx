'use client';
// ============================================================================
// Mohn Empire — Unified Auth Context
// Provides authentication + user profile + points across ALL Mohn platforms.
// Uses the central mohnmint Firebase project as the identity hub.
// ============================================================================

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { getEmpireAuth, getEmpireDb } from './firebase';
import { EMPIRE_COLLECTIONS } from './config';
import {
  type MohnEmpireUser,
  type EmpireAuthState,
  type PlatformId,
  generateReferralCode,
  calculateTier,
  POINTS_RULES,
} from './types';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface MohnEmpireContextValue extends EmpireAuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
}

const MohnEmpireContext = createContext<MohnEmpireContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface MohnEmpireProviderProps {
  children: ReactNode;
  /** Which platform this instance is running on (for analytics) */
  platformId: PlatformId;
  /** Optional referral code from URL params */
  referralCode?: string | null;
}

export function MohnEmpireProvider({
  children,
  platformId,
  referralCode,
}: MohnEmpireProviderProps) {
  const [state, setState] = useState<EmpireAuthState>({
    user: null,
    firebaseUser: null,
    loading: true,
    error: null,
  });

  // Listen to auth state changes
  useEffect(() => {
    const auth = getEmpireAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in — fetch or create their empire profile
        try {
          const profile = await getOrCreateEmpireProfile(firebaseUser, platformId);
          setState({ user: profile, firebaseUser, loading: false, error: null });

          // Update last login & linked platforms in background
          updateLoginMetadata(firebaseUser.uid, platformId).catch(console.error);
        } catch (err) {
          console.error('[MohnEmpire] Failed to load profile:', err);
          setState({
            user: null,
            firebaseUser,
            loading: false,
            error: 'Failed to load profile',
          });
        }
      } else {
        setState({ user: null, firebaseUser: null, loading: false, error: null });
      }
    });

    return () => unsubscribe();
  }, [platformId]);

  // Real-time profile listener (points updates, etc.)
  useEffect(() => {
    if (!state.firebaseUser) return;

    const db = getEmpireDb();
    const userRef = doc(db, EMPIRE_COLLECTIONS.users, state.firebaseUser.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (snap) => {
        if (snap.exists()) {
          setState((prev) => ({
            ...prev,
            user: { uid: snap.id, ...snap.data() } as MohnEmpireUser,
          }));
        }
      },
      (err) => console.error('[MohnEmpire] Profile listener error:', err),
    );

    return () => unsubscribe();
  }, [state.firebaseUser?.uid]);

  // --- Auth Methods ---

  const signIn = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const auth = getEmpireAuth();
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      setState((prev) => ({ ...prev, loading: false, error: friendlyError(message) }));
      throw err;
    }
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const auth = getEmpireAuth();
        const { user: fbUser } = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(fbUser, { displayName });

        // Create empire profile with signup bonus
        await createEmpireProfile(fbUser, displayName, platformId, referralCode ?? null);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Sign up failed';
        setState((prev) => ({ ...prev, loading: false, error: friendlyError(message) }));
        throw err;
      }
    },
    [platformId, referralCode],
  );

  const signInWithGoogleFn = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const auth = getEmpireAuth();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign in failed';
      setState((prev) => ({ ...prev, loading: false, error: friendlyError(message) }));
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    const auth = getEmpireAuth();
    await firebaseSignOut(auth);
    setState({ user: null, firebaseUser: null, loading: false, error: null });
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!state.firebaseUser) return;
    const profile = await getOrCreateEmpireProfile(state.firebaseUser, platformId);
    setState((prev) => ({ ...prev, user: profile }));
  }, [state.firebaseUser, platformId]);

  const value = useMemo(
    () => ({
      ...state,
      signIn,
      signUp,
      signInWithGoogle: signInWithGoogleFn,
      logout,
      clearError,
      refreshProfile,
    }),
    [state, signIn, signUp, signInWithGoogleFn, logout, clearError, refreshProfile],
  );

  return <MohnEmpireContext.Provider value={value}>{children}</MohnEmpireContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useMohnAuth() {
  const ctx = useContext(MohnEmpireContext);
  if (!ctx) {
    throw new Error('useMohnAuth must be used within a <MohnEmpireProvider>');
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Firestore helpers
// ---------------------------------------------------------------------------

async function getOrCreateEmpireProfile(
  fbUser: User,
  platformId: string,
): Promise<MohnEmpireUser> {
  const db = getEmpireDb();
  const userRef = doc(db, EMPIRE_COLLECTIONS.users, fbUser.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    return { uid: snap.id, ...snap.data() } as MohnEmpireUser;
  }

  // First time — create profile
  return createEmpireProfile(fbUser, fbUser.displayName ?? 'Empire Member', platformId, null);
}

async function createEmpireProfile(
  fbUser: User,
  displayName: string,
  platformId: string,
  referredByCode: string | null,
): Promise<MohnEmpireUser> {
  const db = getEmpireDb();
  const userRef = doc(db, EMPIRE_COLLECTIONS.users, fbUser.uid);
  const now = new Date();

  const profile: Omit<MohnEmpireUser, 'uid'> = {
    email: fbUser.email ?? '',
    displayName,
    photoURL: fbUser.photoURL ?? null,
    phone: fbUser.phoneNumber ?? null,
    mohnPoints: POINTS_RULES.signup_bonus,
    totalPointsEarned: POINTS_RULES.signup_bonus,
    totalPointsSpent: 0,
    tier: 'bronze',
    memberSince: now,
    lastLoginAt: now,
    lastActiveProject: platformId,
    linkedProjects: [platformId],
    loginCount: 1,
    referralCode: generateReferralCode(fbUser.uid),
    referredBy: referredByCode,
    referralCount: 0,
    demographics: {
      city: null,
      state: null,
      country: null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
    },
    isVerified: fbUser.emailVerified,
    isAdmin: false,
  };

  await setDoc(userRef, profile);
  return { uid: fbUser.uid, ...profile };
}

async function updateLoginMetadata(uid: string, platformId: string) {
  const db = getEmpireDb();
  const userRef = doc(db, EMPIRE_COLLECTIONS.users, uid);

  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const linkedProjects: string[] = data.linkedProjects ?? [];
    const updates: Record<string, unknown> = {
      lastLoginAt: serverTimestamp(),
      lastActiveProject: platformId,
      loginCount: increment(1),
    };

    if (!linkedProjects.includes(platformId)) {
      updates.linkedProjects = [...linkedProjects, platformId];
    }

    await updateDoc(userRef, updates);
  } catch (err) {
    console.error('[MohnEmpire] Failed to update login metadata:', err);
  }
}

// ---------------------------------------------------------------------------
// Error message helpers
// ---------------------------------------------------------------------------

function friendlyError(message: string): string {
  if (message.includes('user-not-found') || message.includes('wrong-password')) {
    return 'Invalid email or password';
  }
  if (message.includes('email-already-in-use')) {
    return 'An account with this email already exists';
  }
  if (message.includes('weak-password')) {
    return 'Password should be at least 6 characters';
  }
  if (message.includes('invalid-email')) {
    return 'Please enter a valid email address';
  }
  if (message.includes('too-many-requests')) {
    return 'Too many attempts. Please try again later';
  }
  if (message.includes('popup-closed-by-user')) {
    return 'Sign-in popup was closed';
  }
  if (message.includes('network-request-failed')) {
    return 'Network error. Check your connection';
  }
  return message;
}
