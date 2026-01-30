/**
 * VaultPage
 *
 * Individual user dashboard (vault).
 */

import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { EMPTY_STATES, ACTION_LABELS } from '../lib/copy';

export function VaultPage() {
  return (
    <ProtectedRoute requireRole="INDIVIDUAL">
      <DashboardLayout>
        <div className="vault-page">
          <div className="page-header">
            <h1>Your Vault</h1>
            <button className="btn-primary">{ACTION_LABELS.CREATE_ANCHOR}</button>
          </div>

          <div className="empty-state">
            <h2>{EMPTY_STATES.NO_RECORDS}</h2>
            <p>{EMPTY_STATES.NO_RECORDS_DESC}</p>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
