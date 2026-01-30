/**
 * AnchorDetailView Component
 *
 * Detailed view of an anchor with re-verification capability.
 * Allows users to verify a file matches the original fingerprint.
 */

import React, { useState, useCallback, useRef } from 'react';
import { hashFile, verifyFile, formatFileSize } from '../../lib/fileHasher';
import {
  ANCHOR_STATUS_LABELS,
  ANCHOR_STATUS_DESCRIPTIONS,
  ACTION_LABELS,
  MESSAGES,
  TOOLTIPS,
} from '../../lib/copy';
import type { Anchor } from '../../types/database.types';

interface AnchorDetailViewProps {
  anchor: Anchor;
  onClose: () => void;
}

type VerificationState = 'idle' | 'processing' | 'match' | 'mismatch';

export function AnchorDetailView({ anchor, onClose }: AnchorDetailViewProps) {
  const [verificationState, setVerificationState] = useState<VerificationState>('idle');
  const [verifiedFilename, setVerifiedFilename] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVerifyClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      setVerificationState('processing');
      setVerifiedFilename(file.name);

      try {
        const isMatch = await verifyFile(file, anchor.fingerprint);
        setVerificationState(isMatch ? 'match' : 'mismatch');
      } catch (err) {
        console.error('Verification error:', err);
        setVerificationState('mismatch');
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [anchor.fingerprint]
  );

  const getStatusClass = () => {
    switch (anchor.status) {
      case 'SECURED':
        return 'status-secured';
      case 'PENDING':
        return 'status-pending';
      case 'REVOKED':
        return 'status-revoked';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  };

  return (
    <div className="anchor-detail-view">
      {/* Hidden file input for verification */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="file-input-hidden"
      />

      {/* Header */}
      <div className="detail-header">
        <button type="button" className="back-button" onClick={onClose}>
          ← Back
        </button>
        <h1>{anchor.filename}</h1>
      </div>

      {/* Status Banner */}
      <div className={`status-banner ${getStatusClass()}`}>
        <span className="status-icon">
          {anchor.status === 'SECURED' && '✅'}
          {anchor.status === 'PENDING' && '⏳'}
          {anchor.status === 'REVOKED' && '❌'}
        </span>
        <div className="status-info">
          <strong>{ANCHOR_STATUS_LABELS[anchor.status]}</strong>
          <p>{ANCHOR_STATUS_DESCRIPTIONS[anchor.status]}</p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="detail-grid">
        <div className="detail-section">
          <h2>Document Details</h2>
          <dl className="detail-list">
            <dt>Filename</dt>
            <dd>{anchor.filename}</dd>

            <dt>Size</dt>
            <dd>{anchor.file_size ? formatFileSize(anchor.file_size) : 'Unknown'}</dd>

            <dt>Type</dt>
            <dd>{anchor.file_mime || 'Unknown'}</dd>

            <dt>Created</dt>
            <dd>{formatDate(anchor.created_at)}</dd>
          </dl>
        </div>

        <div className="detail-section">
          <h2>Verification</h2>
          <div className="fingerprint-section">
            <div className="fingerprint-header">
              <span>Document Fingerprint</span>
              <span className="tooltip-icon" title={TOOLTIPS.FINGERPRINT}>
                ℹ️
              </span>
            </div>
            <code className="fingerprint-code">{anchor.fingerprint}</code>
          </div>

          {/* Re-verify Section */}
          <div className="verify-section">
            <h3>Re-verify Document</h3>
            <p className="verify-description">
              Drop a file to verify it matches this record. The file will not be uploaded.
            </p>

            {verificationState === 'idle' && (
              <button type="button" className="btn-secondary" onClick={handleVerifyClick}>
                {ACTION_LABELS.VERIFY_ANCHOR}
              </button>
            )}

            {verificationState === 'processing' && (
              <div className="verify-processing">
                <div className="loading-spinner" />
                <p>Verifying {verifiedFilename}...</p>
              </div>
            )}

            {verificationState === 'match' && (
              <div className="verify-result match">
                <span className="result-icon">✅</span>
                <div className="result-info">
                  <strong>Verification Successful</strong>
                  <p>{verifiedFilename} matches the secured record.</p>
                </div>
                <button
                  type="button"
                  className="btn-text"
                  onClick={() => setVerificationState('idle')}
                >
                  Verify another
                </button>
              </div>
            )}

            {verificationState === 'mismatch' && (
              <div className="verify-result mismatch">
                <span className="result-icon">❌</span>
                <div className="result-info">
                  <strong>Verification Failed</strong>
                  <p>{verifiedFilename} does not match the secured record.</p>
                </div>
                <button
                  type="button"
                  className="btn-text"
                  onClick={() => setVerificationState('idle')}
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* On-chain info (if secured) */}
      {anchor.status === 'SECURED' && anchor.chain_tx_id && (
        <div className="detail-section chain-section">
          <h2>Verification Proof</h2>
          <dl className="detail-list">
            {anchor.chain_tx_id && (
              <>
                <dt>Network Receipt</dt>
                <dd className="mono">{anchor.chain_tx_id}</dd>
              </>
            )}
            {anchor.chain_timestamp && (
              <>
                <dt>Verification Time</dt>
                <dd>{formatDate(anchor.chain_timestamp)}</dd>
              </>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
