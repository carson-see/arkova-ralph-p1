/**
 * RoleSelection Component
 *
 * Allows users to select their role during onboarding.
 * This is a one-time choice - roles are immutable once set.
 *
 * Options:
 * - INDIVIDUAL: Personal account for securing documents
 * - ORG_ADMIN: Organization administrator account
 */

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { USER_ROLE_LABELS, USER_ROLE_DESCRIPTIONS } from '../../lib/copy';
import type { UserRole } from '../../types/database.types';

interface RoleSelectionProps {
  onComplete?: (role: UserRole) => void;
}

export function RoleSelection({ onComplete }: RoleSelectionProps) {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleSelect = async () => {
    if (!selectedRole || !user) return;

    setLoading(true);
    setError(null);

    // Update profile with selected role
    // Note: The DB trigger will set role_set_at and enforce immutability
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: selectedRole })
      .eq('id', user.id);

    if (updateError) {
      setError('Unable to set role. Please try again.');
      setLoading(false);
      return;
    }

    // Navigate based on role
    if (selectedRole === 'INDIVIDUAL') {
      window.location.href = '/vault';
    } else {
      window.location.href = '/onboarding/org';
    }

    onComplete?.(selectedRole);
  };

  return (
    <div className="role-selection-container">
      <h1>Welcome to Arkova</h1>
      <p className="subtitle">How will you use Arkova?</p>

      <div className="role-cards">
        <button
          type="button"
          className={`role-card ${selectedRole === 'INDIVIDUAL' ? 'selected' : ''}`}
          onClick={() => setSelectedRole('INDIVIDUAL')}
          disabled={loading}
        >
          <div className="role-icon">👤</div>
          <h3>{USER_ROLE_LABELS.INDIVIDUAL}</h3>
          <p>{USER_ROLE_DESCRIPTIONS.INDIVIDUAL}</p>
        </button>

        <button
          type="button"
          className={`role-card ${selectedRole === 'ORG_ADMIN' ? 'selected' : ''}`}
          onClick={() => setSelectedRole('ORG_ADMIN')}
          disabled={loading}
        >
          <div className="role-icon">🏢</div>
          <h3>{USER_ROLE_LABELS.ORG_ADMIN}</h3>
          <p>{USER_ROLE_DESCRIPTIONS.ORG_ADMIN}</p>
        </button>
      </div>

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      <div className="role-actions">
        <button
          type="button"
          onClick={handleRoleSelect}
          disabled={!selectedRole || loading}
          className="btn-primary"
        >
          {loading ? 'Setting up...' : 'Continue'}
        </button>
      </div>

      <p className="role-note">
        <strong>Note:</strong> This choice is permanent and cannot be changed later.
      </p>
    </div>
  );
}
