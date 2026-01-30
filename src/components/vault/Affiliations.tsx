/**
 * Affiliations Component
 *
 * Placeholder for future organization affiliations feature.
 * Will display organizations the user is connected to.
 */

import React from 'react';

export function Affiliations() {
  return (
    <div className="affiliations-section">
      <h2>Affiliations</h2>
      <div className="affiliations-empty">
        <div className="empty-icon">🏢</div>
        <h3>No Affiliations Yet</h3>
        <p>
          When organizations verify your credentials, they'll appear here.
          You'll be able to see which organizations have access to your verified records.
        </p>
      </div>
    </div>
  );
}
