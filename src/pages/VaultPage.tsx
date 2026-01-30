/**
 * VaultPage
 *
 * Individual user dashboard (vault).
 * Displays user's records, visibility settings, and affiliations.
 */

import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { VisibilityToggle } from '../components/vault/VisibilityToggle';
import { Affiliations } from '../components/vault/Affiliations';
import { EMPTY_STATES, ACTION_LABELS, NAV_LABELS } from '../lib/copy';
import { useProfile } from '../hooks/useProfile';

export function VaultPage() {
  const { profile } = useProfile();

  return (
    <ProtectedRoute requireRole="INDIVIDUAL">
      <DashboardLayout>
        <div className="vault-page">
          {/* Page Header */}
          <div className="page-header">
            <div className="page-header-content">
              <h1>{NAV_LABELS.DASHBOARD}</h1>
              <p className="page-subtitle">
                Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}
              </p>
            </div>
            <button className="btn-primary">{ACTION_LABELS.CREATE_ANCHOR}</button>
          </div>

          {/* Dashboard Grid */}
          <div className="dashboard-grid">
            {/* Main Content - Records */}
            <div className="dashboard-main-section">
              <div className="section-card">
                <div className="section-header">
                  <h2>{NAV_LABELS.MY_RECORDS}</h2>
                </div>
                <div className="empty-state">
                  <div className="empty-icon">📄</div>
                  <h3>{EMPTY_STATES.NO_RECORDS}</h3>
                  <p>{EMPTY_STATES.NO_RECORDS_DESC}</p>
                  <button className="btn-primary">{ACTION_LABELS.CREATE_ANCHOR}</button>
                </div>
              </div>
            </div>

            {/* Sidebar - Settings & Info */}
            <div className="dashboard-sidebar-section">
              {/* Visibility Settings */}
              <div className="section-card">
                <VisibilityToggle />
              </div>

              {/* Affiliations */}
              <div className="section-card">
                <Affiliations />
              </div>

              {/* Quick Stats */}
              <div className="section-card stats-card">
                <h3>Your Stats</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-value">0</span>
                    <span className="stat-label">Records</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">0</span>
                    <span className="stat-label">Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
