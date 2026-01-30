/**
 * Ralph Application Entry Point
 *
 * Hash-based routing with authentication state management.
 */

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import { AuthProvider } from '@/components/auth/AuthProvider';
import { AuthPage } from '@/pages/AuthPage';

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
        <p className="text-muted-foreground">Coming in next story</p>
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
  '/onboarding/role': () => <PlaceholderPage title="Role Selection" />,
  '/onboarding/org': () => <PlaceholderPage title="Organization Setup" />,
  '/vault': () => <PlaceholderPage title="Your Vault" />,
  '/org': () => <PlaceholderPage title="Organization Dashboard" />,
  '/org/pending-review': () => <PlaceholderPage title="Pending Review" />,
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
    <App />
  </React.StrictMode>
);
