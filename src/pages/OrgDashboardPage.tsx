/**
 * OrgDashboardPage
 *
 * Organization admin dashboard.
 * Shows organization's anchors and team management.
 */

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { AnchorList } from '../components/anchor/AnchorList';
import { AnchorDetailView } from '../components/anchor/AnchorDetailView';
import { CreateAnchorModal } from '../components/anchor/CreateAnchorModal';
import { ACTION_LABELS, EMPTY_STATES, NAV_LABELS } from '../lib/copy';
import { useProfile } from '../hooks/useProfile';
import { useAnchors } from '../hooks/useAnchors';
import { supabase } from '../lib/supabase';
import type { Anchor, Organization } from '../types/database.types';

export function OrgDashboardPage() {
  const { profile } = useProfile();
  const [org, setOrg] = useState<Organization | null>(null);
  const [orgLoading, setOrgLoading] = useState(true);
  const { anchors, loading: anchorsLoading, refetch } = useAnchors({ orgId: profile?.org_id || undefined });
  const [selectedAnchor, setSelectedAnchor] = useState<Anchor | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch organization data
  useEffect(() => {
    async function fetchOrg() {
      if (!profile?.org_id) {
        setOrgLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.org_id)
        .single();

      if (!error && data) {
        setOrg(data);
      }
      setOrgLoading(false);
    }

    fetchOrg();
  }, [profile?.org_id]);

  // If viewing anchor detail, show that view
  if (selectedAnchor) {
    return (
      <ProtectedRoute requireRole="ORG_ADMIN">
        <DashboardLayout>
          <AnchorDetailView
            anchor={selectedAnchor}
            onClose={() => setSelectedAnchor(null)}
          />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const loading = orgLoading || anchorsLoading;

  return (
    <ProtectedRoute requireRole="ORG_ADMIN">
      <DashboardLayout>
        <div className="org-dashboard-page">
          {/* Page Header */}
          <div className="page-header">
            <div className="page-header-content">
              <h1>{org?.display_name || 'Organization'}</h1>
              <p className="page-subtitle">
                {org?.legal_name || 'Loading...'}
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
                  <h2>{NAV_LABELS.ORG_RECORDS}</h2>
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

            {/* Sidebar */}
            <div className="dashboard-sidebar-section">
              {/* Organization Info */}
              <div className="section-card">
                <h3>Organization Details</h3>
                {org ? (
                  <dl className="org-details">
                    <dt>Legal Name</dt>
                    <dd>{org.legal_name}</dd>
                    
                    <dt>Display Name</dt>
                    <dd>{org.display_name}</dd>
                    
                    {org.domain && (
                      <>
                        <dt>Domain</dt>
                        <dd>{org.domain}</dd>
                      </>
                    )}
                    
                    <dt>Status</dt>
                    <dd>
                      <span className={`status-badge ${org.verification_status === 'VERIFIED' ? 'status-secured' : 'status-pending'}`}>
                        {org.verification_status === 'VERIFIED' ? 'Verified' : org.verification_status}
                      </span>
                    </dd>
                  </dl>
                ) : (
                  <p className="loading-text">Loading organization...</p>
                )}
              </div>

              {/* Team Section (Placeholder) */}
              <div className="section-card">
                <h3>Team</h3>
                <div className="team-placeholder">
                  <p>Team management coming soon.</p>
                  <p className="text-muted">Invite team members to collaborate on records.</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="section-card stats-card">
                <h3>Organization Stats</h3>
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
