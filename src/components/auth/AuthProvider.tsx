/**
 * AuthProvider Component (P2-S2)
 *
 * Provides authentication context and handles routing logic.
 * Route guard truth table:
 * - unauth → /auth
 * - role null → /onboarding/role
 * - INDIVIDUAL → /vault
 * - ORG_ADMIN + no org → /onboarding/org
 * - ORG_ADMIN + manual review → /org/pending-review
 * - ORG_ADMIN + approved → /org
 */

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import type { Database } from '@/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, session, loading: authLoading, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  const loading = authLoading || (!!user && profileLoading);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Get the appropriate redirect path based on auth state
 */
export function getRedirectPath(
  user: User | null,
  profile: Profile | null,
  currentPath: string
): string | null {
  // Not authenticated → auth page
  if (!user) {
    if (currentPath !== '/auth' && !currentPath.startsWith('/auth/')) {
      return '/auth';
    }
    return null;
  }

  // Authenticated but no profile or no role → role selection
  if (!profile || !profile.role) {
    if (currentPath !== '/onboarding/role') {
      return '/onboarding/role';
    }
    return null;
  }

  // INDIVIDUAL user
  if (profile.role === 'INDIVIDUAL') {
    // Can't access org routes
    if (currentPath.startsWith('/org') || currentPath.startsWith('/onboarding/org')) {
      return '/vault';
    }
    // Already on auth? Go to vault
    if (currentPath === '/auth' || currentPath === '/onboarding/role') {
      return '/vault';
    }
    return null;
  }

  // ORG_ADMIN user
  if (profile.role === 'ORG_ADMIN') {
    // No org yet → org onboarding
    if (!profile.org_id) {
      if (currentPath !== '/onboarding/org') {
        return '/onboarding/org';
      }
      return null;
    }

    // Manual review required → pending review page
    if (profile.requires_manual_review) {
      if (currentPath !== '/org/pending-review') {
        return '/org/pending-review';
      }
      return null;
    }

    // Can't access individual vault
    if (currentPath === '/vault') {
      return '/org';
    }

    // Already on auth/onboarding? Go to org dashboard
    if (currentPath === '/auth' || currentPath.startsWith('/onboarding')) {
      return '/org';
    }

    return null;
  }

  return null;
}
