'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallbackPath?: string;
}

/**
 * ProtectedRoute — Guards routes by user role.
 * 
 * Usage:
 *   <ProtectedRoute allowedRoles={['owner', 'manager']}>
 *     <OwnerDashboard />
 *   </ProtectedRoute>
 * 
 * If user is not authenticated → redirects to /login
 * If user doesn't have an allowed role → redirects to role-appropriate dashboard
 */
export default function ProtectedRoute({ children, allowedRoles, fallbackPath }: ProtectedRouteProps) {
  const { user, MohnMenuUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (MohnMenuUser && !allowedRoles.includes(MohnMenuUser.role)) {
      // Redirect to the correct dashboard for their role
      const roleDashboard = getRoleDashboard(MohnMenuUser.role);
      router.push(fallbackPath || roleDashboard);
    }
  }, [user, MohnMenuUser, loading, allowedRoles, fallbackPath, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin inline-flex items-center justify-center w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full mb-4" />
          <p className="text-lg font-semibold text-zinc-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || (MohnMenuUser && !allowedRoles.includes(MohnMenuUser.role))) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}

function getRoleDashboard(role: string): string {
  switch (role) {
    case 'owner':
    case 'manager':
      return '/owner';
    case 'staff':
      return '/owner/kds';
    case 'driver_inhouse':
    case 'driver_marketplace':
      return '/driver';
    case 'customer':
      return '/customer';
    case 'admin':
      return '/admin';
    default:
      return '/dashboard';
  }
}
