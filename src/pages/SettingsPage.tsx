/**
 * SettingsPage
 *
 * User settings and admin tools.
 */

import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { BatchProcessorPanel } from '../components/admin/BatchProcessorPanel';
import { useProfile } from '../hooks/useProfile';
import { NAV_LABELS } from '../lib/copy';

export function SettingsPage() {
  const { profile } = useProfile();

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="settings-page">
          {/* Page Header */}
          <div className="page-header">
            <div className="page-header-content">
              <h1>{NAV_LABELS.SETTINGS}</h1>
              <p className="page-subtitle">Manage your account and preferences</p>
            </div>
          </div>

          <div className="settings-grid">
            {/* Profile Section */}
            <div className="section-card">
              <h2>Profile</h2>
              <dl className="settings-list">
                <dt>Email</dt>
                <dd>{profile?.email || '—'}</dd>

                <dt>Name</dt>
                <dd>{profile?.full_name || 'Not set'}</dd>

                <dt>Role</dt>
                <dd>
                  <span className="role-badge">
                    {profile?.role === 'ORG_ADMIN' ? 'Organization Admin' : 'Individual'}
                  </span>
                </dd>

                <dt>Member Since</dt>
                <dd>
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString()
                    : '—'}
                </dd>
              </dl>
            </div>

            {/* Admin Tools (Demo) */}
            <div className="section-card">
              <h2>Admin Tools</h2>
              <p className="section-description">
                Demo tools for testing the verification flow.
              </p>
              <BatchProcessorPanel />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
