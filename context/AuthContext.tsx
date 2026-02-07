'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { MohnMenuUser, MohnMenuBusiness } from '@/lib/types';
import { loginEvent, signUpEvent, setUserId } from '@/lib/gtag';

interface AuthContextType {
  user: User | null;
  MohnMenuUser: MohnMenuUser | null;
  currentBusiness: MohnMenuBusiness | null;
  userBusinesses: MohnMenuBusiness[];
  loading: boolean;
  error: string | null;
  
  // Auth methods
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  
  // Business switching
  switchBusiness: (businessId: string) => Promise<void>;
  
  // User info getters
  isOwner: () => boolean;
  isManager: () => boolean;
  isDriver: () => boolean;
  isCustomer: () => boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [MohnMenuUser, setMohnMenuUser] = useState<MohnMenuUser | null>(null);
  const [currentBusiness, setCurrentBusiness] = useState<MohnMenuBusiness | null>(null);
  const [userBusinesses, setUserBusinesses] = useState<MohnMenuBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // On mount, set up auth state listener
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch(err => {
      console.error('Persistence setup error:', err);
    });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setLoading(true);
        setError(null);

        if (firebaseUser) {
          setUser(firebaseUser);

          // Fetch MohnMenu user profile
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as MohnMenuUser;
            setMohnMenuUser(userData);

            // Fetch all businesses this user is associated with
            if (userData.businessIds && userData.businessIds.length > 0) {
              const businesses: MohnMenuBusiness[] = [];

              for (const businessId of userData.businessIds) {
                const businessDocRef = doc(db, 'businesses', businessId);
                const businessDocSnap = await getDoc(businessDocRef);

                if (businessDocSnap.exists()) {
                  businesses.push(businessDocSnap.data() as MohnMenuBusiness);
                }
              }

              setUserBusinesses(businesses);

              // Set current business (prioritize active, otherwise first one)
              const activeBusiness = userData.activeBusinessId
                ? businesses.find(b => b.businessId === userData.activeBusinessId)
                : businesses[0];

              if (activeBusiness) {
                setCurrentBusiness(activeBusiness);
              }
            }
          } else {
            // User logged in but no MohnMenu profile - shouldn't happen in normal flow
            console.warn('User authenticated but no MohnMenu profile found');
          }
        } else {
          // User logged out
          setUser(null);
          setMohnMenuUser(null);
          setCurrentBusiness(null);
          setUserBusinesses([]);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Auth state change error';
        setError(message);
        console.error('Auth state error:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      // GA4: login
      loginEvent('email');
      setUserId(result.user.uid);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
  ) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create MohnMenu user profile
      const MohnMenuUserData: MohnMenuUser = {
        uid: result.user.uid,
        email,
        displayName: email,
        role: 'customer',
        businessIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to Firestore
      const userDocRef = doc(db, 'users', result.user.uid);
      await setDoc(userDocRef, MohnMenuUserData);
      // GA4: sign_up
      signUpEvent('email');
      setUserId(result.user.uid);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
      setMohnMenuUser(null);
      setCurrentBusiness(null);
      setUserBusinesses([]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      setError(message);
      throw err;
    }
  };

  const switchBusiness = async (businessId: string) => {
    try {
      const business = userBusinesses.find(b => b.businessId === businessId);
      if (!business) {
        throw new Error('Business not found');
      }

      setCurrentBusiness(business);

      // Update active business in MohnMenu user profile
      if (MohnMenuUser && user) {
        const updatedUser: MohnMenuUser = {
          ...MohnMenuUser,
          activeBusinessId: businessId,
          updatedAt: new Date().toISOString(),
        };
        setMohnMenuUser(updatedUser);
        
        // Update in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, updatedUser);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to switch business';
      setError(message);
      throw err;
    }
  };

  const isOwner = () => MohnMenuUser?.role === 'owner';
  const isManager = () => MohnMenuUser?.role === 'manager';
  const isDriver = () => 
    MohnMenuUser?.role === 'driver_inhouse' || MohnMenuUser?.role === 'driver_marketplace';
  const isCustomer = () => MohnMenuUser?.role === 'customer';
  const isAdmin = () => MohnMenuUser?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        MohnMenuUser,
        currentBusiness,
        userBusinesses,
        loading,
        error,
        loginWithEmail,
        signUpWithEmail,
        logout,
        switchBusiness,
        isOwner,
        isManager,
        isDriver,
        isCustomer,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
