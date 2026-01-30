/**
 * VaultPage
 *
 * Individual user dashboard (vault).
 * Displays user's records, visibility settings, and affiliations.
 */

import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { VisibilityToggle } from '../components/vault/VisibilityToggle';
import { Affiliations } from '../components/vault/Affiliations';
import { AnchorList } from '../components/anchor/AnchorList';
import { AnchorDetailView } from '../components/anchor/AnchorDetailView';
import { CreateAnchorModal } from '../components/anchor/CreateAnchorModal';
import { ACTION_LABELS, NAV_LABELS } from '../lib/copy';
import { useProfile } from '../hooks/useProfile';
import { useAnchors } from '../hooks/useAnchors';
import type { Anchor } from '../types/database.types';

export function VaultPage() {
  const { profile } = useProfile();
  const { anchors, loading, refetch } = useAnchors();
  const [selectedAnchor, setSelectedAnchor] = useState<Anchor | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // If viewing anchor detail, show that view
  if (selectedAnchor) {
    return (
      <ProtectedRoute requireRole="INDIVIDUAL">
        <DashboardLayout>
          <AnchorDetailView
            anchor={selectedAnchor}
            onClose={() => setSelectedAnchor(null)}
          />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

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
            <button
              className="btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              {ACTION_LABELS.CREATE_ANCHOR}
            </button>
          </div>

          {/* Dashboard Grid */}
          <div className="dashboard-grid">
            {/* Main Content - Records */}
            <div className="dashboard-main-section">
              <div className="section-card">
                <div className="section-header">
                  <h2>{NAV_LABELS.MY_RECORDS}</h2>
                  <span className="record-count">{anchors.length} records</span>
                </div>
                <AnchorList
                  anchors={anchors}
                  loading={loading}
                  onSelect={setSelectedAnchor}
                  onCreateNew={() => setShowCreateModal(true)}
                />
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
                    <span className="stat-value">{anchors.length}</span>
                    <span className="stat-label">Records</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">
                      {anchors.filter((a) => a.status === 'SECURED').length}
                    </span>
                    <span className="stat-label">Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Create Anchor Modal */}
          <CreateAnchorModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              refetch();
              setShowCreateModal(false);
            }}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
