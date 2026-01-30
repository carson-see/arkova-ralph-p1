/**
 * Ralph Application Entry Point
 *
 * Hash-based routing with authentication state management.
 */

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { AuthPage } from '@/pages/AuthPage';
import { RoleSelectionPage } from '@/pages/onboarding/RoleSelectionPage';
import { OrgSetupPage } from '@/pages/onboarding/OrgSetupPage';
import { VaultPage } from '@/pages/vault/VaultPage';
import { AffiliationsPage } from '@/pages/vault/AffiliationsPage';
import { OrgDashboardPage } from '@/pages/org/OrgDashboardPage';
import { PendingReviewPage } from '@/pages/org/PendingReviewPage';

/**
 * Get current path from URL fragment
 */
function getCurrentPath(): string {
  const fullUrl = window.location.href;
  const hashIndex = fullUrl.indexOf('#');
  if (hashIndex === -1) return '/';
  return fullUrl.slice(hashIndex + 1) || '/';
}

/**
 * Simple hash-based router
 */
function useHashRouter() {
  const [path, setPath] = useState(getCurrentPath());

  useEffect(() => {
    const handleHashChange = () => {
      setPath(getCurrentPath());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return path;
}

/**
 * Placeholder pages (to be implemented in subsequent stories)
 */
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground">Coming soon</p>
      </div>
    </div>
  );
}

/**
 * Route configuration
 */
const routes: Record<string, React.ComponentType> = {
  '/': AuthPage,
  '/auth': AuthPage,
  '/auth/callback': AuthPage,
  
  // Onboarding (P2)
  '/onboarding/role': RoleSelectionPage,
  '/onboarding/org': OrgSetupPage,
  
  // Individual Vault (P3)
  '/vault': VaultPage,
  '/affiliations': AffiliationsPage,
  
  // Organization (P5 placeholder)
  '/org': OrgDashboardPage,
  '/org/pending-review': PendingReviewPage,
  '/org/settings': () => <PlaceholderPage title="Organization Settings" />,
  
  // Settings
  '/settings': () => <PlaceholderPage title="Settings" />,
  '/help': () => <PlaceholderPage title="Help & Support" />,
};

/**
 * App with routing
 */
function App() {
  const path = useHashRouter();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Find matching route or default to auth
  const RouteComponent = routes[normalizedPath] || AuthPage;

  return (
    <AuthProvider>
      <RouteComponent />
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
