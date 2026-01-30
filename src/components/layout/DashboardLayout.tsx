/**
 * DashboardLayout Component
 *
 * Main layout wrapper for authenticated pages.
 * Provides sidebar navigation and header.
 */

import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { NAV_LABELS } from '../../lib/copy';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { signOut } = useAuth();
  const { profile } = useProfile();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/auth';
  };

  const isOrgAdmin = profile?.role === 'ORG_ADMIN';

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h1 className="logo">Arkova</h1>
        </div>

        <nav className="sidebar-nav">
          <a href={isOrgAdmin ? '/org' : '/vault'} className="nav-item">
            {NAV_LABELS.DASHBOARD}
          </a>
          <a href={isOrgAdmin ? '/org/records' : '/vault/records'} className="nav-item">
            {NAV_LABELS.MY_RECORDS}
          </a>
          {isOrgAdmin && (
            <a href="/org/members" className="nav-item">
              {NAV_LABELS.ORGANIZATION}
            </a>
          )}
          <a href="/settings" className="nav-item">
            {NAV_LABELS.SETTINGS}
          </a>
        </nav>

        <div className="sidebar-footer">
          <button type="button" onClick={handleSignOut} className="btn-signout">
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            {/* Breadcrumb or page title could go here */}
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="user-name">{profile?.full_name || profile?.email}</span>
              <span className="user-role">
                {isOrgAdmin ? 'Organization Admin' : 'Individual'}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="dashboard-content">{children}</div>
      </main>
    </div>
  );
}
