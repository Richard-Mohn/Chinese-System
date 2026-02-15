'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardRouter() {
  const { user, MohnMenuUser, currentBusiness, loading } = useAuth();
  const router = useRouter();
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, 5000); // 5 second timeout
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    // Route based on user role
    const role = MohnMenuUser?.role;
    console.log('🔀 Dashboard routing:', { role, userId: user?.uid });

    if (role === 'owner' || role === 'manager') {
      router.push('/owner');
    } else if (role === 'driver_inhouse' || role === 'driver_marketplace' || role === 'driver') {
      router.push('/driver');
    } else if (role === 'staff') {
      const staffRole = String((MohnMenuUser as any)?.staffRole || '').toLowerCase();
      // Staff landing pages:
      // - bartender → KDS
      // - server/both → Orders (so they can advance delivery orders to "ready")
      router.push(staffRole === 'bartender' ? '/owner/kds' : '/owner/orders');
    } else if (role === 'customer') {
      router.push('/customer');
    } else if (role === 'admin') {
      router.push('/admin');
    } else {
      console.warn('⚠️ Unknown role, redirecting to onboarding:', role);
      router.push('/onboarding');
    }
  }, [user, MohnMenuUser, currentBusiness, loading, router]);

  // Show error state if loading takes too long
  if (timeoutReached && loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50 px-4">
        <div className="text-center max-w-md">
          <p className="text-5xl mb-4">⚠️</p>
          <p className="text-xl font-bold text-black mb-2">
            Taking longer than expected...
          </p>
          <p className="text-sm text-zinc-500 mb-6">
            Try refreshing the page or logging out and back in.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-zinc-800 transition"
            >
              Refresh Page
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3 bg-zinc-100 text-black rounded-xl font-bold hover:bg-zinc-200 transition"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-50">
      <div className="text-center">
        <div className="animate-spin inline-flex items-center justify-center w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full mb-4"></div>
        <p className="text-lg font-semibold text-zinc-600">
          Redirecting you to your dashboard...
        </p>
      </div>
    </div>
  );
}
