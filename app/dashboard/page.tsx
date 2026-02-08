'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardRouter() {
  const { user, MohnMenuUser, currentBusiness, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    // Route based on user role
    const role = MohnMenuUser?.role;

    if (role === 'owner' || role === 'manager') {
      router.push('/owner');
    } else if (role === 'driver_inhouse' || role === 'driver_marketplace' || role === 'driver') {
      router.push('/driver');
    } else if (role === 'staff') {
      // Staff (bartender/server) — go to KDS / Orders inside owner dashboard
      router.push('/owner/kds');
    } else if (role === 'customer') {
      router.push('/customer');
    } else if (role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/onboarding');
    }
  }, [user, MohnMenuUser, currentBusiness, loading, router]);

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
