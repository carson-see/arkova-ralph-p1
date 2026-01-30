/**
 * Ralph Application Entry Point
 *
 * Main entry point with client-side routing.
 * Uses hash-based routing for simplicity (no server config needed).
 */

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

// Styles
import './styles/main.css';

// Components
import { ErrorBoundary } from './components/ErrorBoundary';

// Pages
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { RoleSelectionPage } from './pages/RoleSelectionPage';
import { OrgOnboardingPage } from './pages/OrgOnboardingPage';
import { PendingReviewPage } from './pages/PendingReviewPage';
import { VaultPage } from './pages/VaultPage';
import { OrgDashboardPage } from './pages/OrgDashboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { VerifyPage } from './pages/VerifyPage';
import { NotFoundPage } from './pages/NotFoundPage';

/**
 * Simple hash-based router
 */
function useHashRouter() {
  const [path, setPath] = useState(window.location.hash.slice(1) || '/');

  useEffect(() => {
    const handleHashChange = () => {
      setPath(window.location.hash.slice(1) || '/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return path;
}

/**
 * Route configuration
 */
const routes: Record<string, React.ComponentType> = {
  '/': LandingPage,
  '/auth': AuthPage,
  '/verify': VerifyPage,
  '/onboarding/role': RoleSelectionPage,
  '/onboarding/org': OrgOnboardingPage,
  '/org/pending-review': PendingReviewPage,
  '/vault': VaultPage,
  '/org': OrgDashboardPage,
  '/settings': SettingsPage,
};

/**
 * App Component
 */
export function App() {
  const path = useHashRouter();

  // Match route or fallback to 404
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const RouteComponent = routes[normalizedPath] || NotFoundPage;

  return (
    <ErrorBoundary>
      <RouteComponent />
    </ErrorBoundary>
  );
}

// Mount application
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Override window.location.href assignments to use hash routing
const originalHrefDescriptor = Object.getOwnPropertyDescriptor(window.location, 'href');
if (originalHrefDescriptor) {
  Object.defineProperty(window.location, 'href', {
    ...originalHrefDescriptor,
    set(value: string) {
      // Convert path-based navigation to hash-based
      if (value.startsWith('/') && !value.startsWith('//')) {
        window.location.hash = value;
      } else {
        originalHrefDescriptor.set?.call(window.location, value);
      }
    },
  });
}
