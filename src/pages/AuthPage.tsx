/**
 * AuthPage
 *
 * Landing page for authentication (sign-in/sign-up).
 */

import React, { useState } from 'react';
import { AuthForm } from '../components/auth/AuthForm';
import { PublicRoute } from '../components/auth/ProtectedRoute';

export function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  return (
    <PublicRoute>
      <div className="auth-page">
        <div className="auth-page-content">
          <div className="auth-branding">
            <h1>Arkova</h1>
            <p>Secure your documents with verifiable proof</p>
          </div>
          <AuthForm mode={mode} onModeChange={setMode} />
        </div>
      </div>
    </PublicRoute>
  );
}
