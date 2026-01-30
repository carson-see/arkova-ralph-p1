/**
 * PendingReview Component
 *
 * Displayed when an ORG_ADMIN account is pending manual review.
 * Users cannot access org features until review is completed.
 */

import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';

export function PendingReview() {
  const { signOut } = useAuth();
  const { profile } = useProfile();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/auth';
  };

  return (
    <div className="pending-review-container">
      <div className="pending-review-card">
        <div className="pending-icon">⏳</div>
        <h1>Account Under Review</h1>
        <p>
          Your organization account is currently being reviewed by our team.
          This typically takes 1-2 business days.
        </p>

        {profile?.manual_review_reason && (
          <div className="review-reason">
            <strong>Reason:</strong> {profile.manual_review_reason}
          </div>
        )}

        <div className="pending-info">
          <h3>What happens next?</h3>
          <ul>
            <li>Our team will verify your organization details</li>
            <li>You'll receive an email when the review is complete</li>
            <li>Once approved, you'll have full access to organization features</li>
          </ul>
        </div>

        <div className="pending-contact">
          <p>
            Need help? Contact us at{' '}
            <a href="mailto:support@arkova.io">support@arkova.io</a>
          </p>
        </div>

        <div className="pending-actions">
          <button type="button" onClick={handleSignOut} className="btn-secondary">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
