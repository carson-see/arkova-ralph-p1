/**
 * OrgDashboardPage
 *
 * Organization admin dashboard.
 */

import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { EMPTY_STATES, ACTION_LABELS } from '../lib/copy';

export function OrgDashboardPage() {
  return (
    <ProtectedRoute requireRole="ORG_ADMIN">
      <DashboardLayout>
        <div className="org-dashboard-page">
          <div className="page-header">
            <h1>Organization Dashboard</h1>
            <button className="btn-primary">{ACTION_LABELS.CREATE_ANCHOR}</button>
          </div>

          <div className="empty-state">
            <h2>{EMPTY_STATES.NO_ORG_RECORDS}</h2>
            <p>{EMPTY_STATES.NO_ORG_RECORDS_DESC}</p>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
