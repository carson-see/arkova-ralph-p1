/**
 * AnchorList Component
 *
 * Displays a list of user's anchored documents.
 */

import React from 'react';
import { formatFileSize } from '../../lib/fileHasher';
import { ANCHOR_STATUS_LABELS, ACTION_LABELS, EMPTY_STATES } from '../../lib/copy';
import type { Anchor, AnchorStatus } from '../../types/database.types';

interface AnchorListProps {
  anchors: Anchor[];
  loading: boolean;
  onSelect?: (anchor: Anchor) => void;
  onCreateNew?: () => void;
}

function getStatusBadgeClass(status: AnchorStatus): string {
  switch (status) {
    case 'SECURED':
      return 'status-secured';
    case 'PENDING':
      return 'status-pending';
    case 'REVOKED':
      return 'status-revoked';
    default:
      return '';
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function AnchorList({ anchors, loading, onSelect, onCreateNew }: AnchorListProps) {
  if (loading) {
    return (
      <div className="anchor-list-loading">
        <div className="loading-spinner" />
        <p>Loading records...</p>
      </div>
    );
  }

  if (anchors.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📄</div>
        <h3>{EMPTY_STATES.NO_RECORDS}</h3>
        <p>{EMPTY_STATES.NO_RECORDS_DESC}</p>
        {onCreateNew && (
          <button className="btn-primary" onClick={onCreateNew}>
            {ACTION_LABELS.CREATE_ANCHOR}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="anchor-list">
      <table className="anchor-table">
        <thead>
          <tr>
            <th>Document</th>
            <th>Status</th>
            <th>Created</th>
            <th>Size</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {anchors.map((anchor) => (
            <tr
              key={anchor.id}
              onClick={() => onSelect?.(anchor)}
              className="anchor-row"
              role="button"
              tabIndex={0}
            >
              <td className="anchor-filename">
                <span className="file-icon">📄</span>
                <span className="filename">{anchor.filename}</span>
              </td>
              <td>
                <span className={`status-badge ${getStatusBadgeClass(anchor.status)}`}>
                  {ANCHOR_STATUS_LABELS[anchor.status]}
                </span>
              </td>
              <td className="anchor-date">{formatDate(anchor.created_at)}</td>
              <td className="anchor-size">
                {anchor.file_size ? formatFileSize(anchor.file_size) : '-'}
              </td>
              <td className="anchor-actions">
                <button
                  type="button"
                  className="btn-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect?.(anchor);
                  }}
                  aria-label="View details"
                >
                  →
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
