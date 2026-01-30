/**
 * RouteGuard Components (P2-S2)
 *
 * Protects routes based on authentication and profile state.
 */

import { ReactNode, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuthContext, getRedirectPath } from './AuthProvider';

interface RouteGuardProps {
  children: ReactNode;
}

/**
 * Navigate using href to avoid lint issues with hash property
 */
function navigateTo(path: string) {
  window.location.href = `#${path}`;
}

/**
 * Get current path from URL
 */
function getCurrentPath(): string {
  const fullHash = window.location.href.split('#')[1];
  return fullHash || '/';
}

/**
 * Loading spinner for route transitions
 */
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

/**
 * ProtectedRoute - Requires authentication
 * Redirects to appropriate page based on auth state
 */
export function ProtectedRoute({ children }: RouteGuardProps) {
  const { user, profile, loading } = useAuthContext();
  const [currentPath, setCurrentPath] = useState(getCurrentPath());

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(getCurrentPath());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (loading) return;

    const redirectPath = getRedirectPath(user, profile, currentPath);
    if (redirectPath) {
      navigateTo(redirectPath);
    }
  }, [user, profile, loading, currentPath]);

  if (loading) {
    return <LoadingScreen />;
  }

  // Check if we need to redirect
  const redirectPath = getRedirectPath(user, profile, currentPath);
  if (redirectPath) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

/**
 * PublicRoute - Only for unauthenticated users
 * Redirects authenticated users to their dashboard
 */
export function PublicRoute({ children }: RouteGuardProps) {
  const { user, profile, loading } = useAuthContext();

  useEffect(() => {
    if (loading) return;

    if (user) {
      // Redirect based on profile state
      if (!profile || !profile.role) {
        navigateTo('/onboarding/role');
      } else if (profile.role === 'INDIVIDUAL') {
        navigateTo('/vault');
      } else if (profile.role === 'ORG_ADMIN') {
        if (!profile.org_id) {
          navigateTo('/onboarding/org');
        } else if (profile.requires_manual_review) {
          navigateTo('/org/pending-review');
        } else {
          navigateTo('/org');
        }
      }
    }
  }, [user, profile, loading]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (user) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

/**
 * RoleRoute - Requires specific role
 */
interface RoleRouteProps extends RouteGuardProps {
  allowedRoles: Array<'INDIVIDUAL' | 'ORG_ADMIN'>;
  fallbackPath?: string;
}

export function RoleRoute({
  children,
  allowedRoles,
  fallbackPath = '/auth',
}: RoleRouteProps) {
  const { user, profile, loading } = useAuthContext();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigateTo('/auth');
      return;
    }

    if (!profile || !profile.role) {
      navigateTo('/onboarding/role');
      return;
    }

    if (!allowedRoles.includes(profile.role)) {
      navigateTo(fallbackPath);
    }
  }, [user, profile, loading, allowedRoles, fallbackPath]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user || !profile || !profile.role || !allowedRoles.includes(profile.role)) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
