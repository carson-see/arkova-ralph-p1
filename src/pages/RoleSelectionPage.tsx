/**
 * RoleSelectionPage
 *
 * Onboarding page for role selection.
 */

import React from 'react';
import { RoleSelection } from '../components/auth/RoleSelection';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

export function RoleSelectionPage() {
  return (
    <ProtectedRoute>
      <div className="onboarding-page">
        <RoleSelection />
      </div>
    </ProtectedRoute>
  );
}
