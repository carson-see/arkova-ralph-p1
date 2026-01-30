/**
 * NotFoundPage
 *
 * 404 page for unknown routes.
 */

import React from 'react';

export function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <div className="not-found-actions">
          <a href="#/" className="btn-primary">Go Home</a>
          <a href="#/verify" className="btn-secondary">Verify a Document</a>
        </div>
      </div>
    </div>
  );
}
