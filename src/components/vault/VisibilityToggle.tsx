/**
 * VisibilityToggle Component
 *
 * Placeholder for profile visibility toggle.
 * Note: is_public field needs to be added to profiles table in a future migration.
 *
 * TODO: Add migration for profiles.is_public field, then implement full functionality.
 */

import React from 'react';

export function VisibilityToggle() {
  // Placeholder: is_public field not yet in schema
  const isPublic = false;

  return (
    <div className="visibility-toggle">
      <div className="toggle-info">
        <span className="toggle-label">Profile Visibility</span>
        <span className="toggle-status">
          {isPublic ? '🔓 Public' : '🔒 Private'}
        </span>
      </div>
      <button
        type="button"
        className={`toggle-button ${isPublic ? 'active' : ''}`}
        disabled={true}
        aria-pressed={isPublic}
        aria-label="Profile visibility toggle (coming soon)"
        title="Coming soon"
      >
        <span className="toggle-track">
          <span className="toggle-thumb" />
        </span>
      </button>
      <p className="toggle-description">
        Profile visibility settings coming soon. Your records are currently private.
      </p>
    </div>
  );
}
