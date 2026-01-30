/**
 * ProtectedRoute Component
 *
 * Guards routes based on authentication and profile state.
 * Redirects users based on their onboarding progress.
 *
 * Routing Logic:
 * - Not authenticated → /auth
 * - Authenticated, no role → /onboarding/role
 * - ORG_ADMIN, no org onboarding complete → /onboarding/org
 * - ORG_ADMIN, pending review → /org/pending-review
 * - INDIVIDUAL → /vault
 * - ORG_ADMIN (complete) → /org
 */

import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'INDIVIDUAL' | 'ORG_ADMIN' | null;
  requireOnboardingComplete?: boolean;
}

export function ProtectedRoute({
  children,
  requireRole,
  requireOnboardingComplete = false,
}: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  // Show loading state while checking auth/profile
  if (authLoading || profileLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  // Not authenticated - redirect to auth
  if (!user) {
    window.location.href = '/auth';
    return null;
  }

  // No profile yet (shouldn't happen with RLS trigger, but handle gracefully)
  if (!profile) {
    return (
      <div className="error-container">
        <p>Unable to load profile. Please try again.</p>
      </div>
    );
  }

  // No role assigned - redirect to role selection
  if (!profile.role) {
    window.location.href = '/onboarding/role';
    return null;
  }

  // ORG_ADMIN pending review
  if (profile.role === 'ORG_ADMIN' && profile.requires_manual_review) {
    window.location.href = '/org/pending-review';
    return null;
  }

  // Check role requirement
  if (requireRole && profile.role !== requireRole) {
    // Redirect to appropriate dashboard
    if (profile.role === 'INDIVIDUAL') {
      window.location.href = '/vault';
    } else {
      window.location.href = '/org';
    }
    return null;
  }

  // All checks passed - render children
  return <>{children}</>;
}

/**
 * PublicRoute Component
 *
 * For routes that should only be accessible when NOT authenticated.
 * Redirects authenticated users to their dashboard.
 */
interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  if (authLoading || profileLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  // Authenticated - redirect to appropriate dashboard
  if (user && profile) {
    if (!profile.role) {
      window.location.href = '/onboarding/role';
    } else if (profile.role === 'INDIVIDUAL') {
      window.location.href = '/vault';
    } else {
      window.location.href = '/org';
    }
    return null;
  }

  return <>{children}</>;
}
