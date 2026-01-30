/**
 * OrgOnboardingPage
 *
 * Onboarding page for organization setup.
 */

import React from 'react';
import { OrgOnboarding } from '../components/auth/OrgOnboarding';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

export function OrgOnboardingPage() {
  return (
    <ProtectedRoute requireRole="ORG_ADMIN">
      <div className="onboarding-page">
        <OrgOnboarding />
      </div>
    </ProtectedRoute>
  );
}
