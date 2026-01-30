/**
 * VerifyPage
 *
 * Public page for document verification.
 * Anyone can verify a document without signing in.
 */

import React, { useState, useCallback, useRef } from 'react';
import { hashFile, formatFileSize } from '../lib/fileHasher';
import { supabase } from '../lib/supabase';
import { ANCHOR_STATUS_LABELS, MESSAGES, TOOLTIPS } from '../lib/copy';
import type { Anchor } from '../types/database.types';

type VerificationState = 'idle' | 'processing' | 'found' | 'not-found' | 'error';

export function VerifyPage() {
  const [state, setState] = useState<VerificationState>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const verifyFile = useCallback(async (fileToVerify: File) => {
    setState('processing');
    setFile(fileToVerify);
    setError(null);
    setAnchor(null);

    try {
      // Calculate fingerprint
      const fp = await hashFile(fileToVerify);
      setFingerprint(fp);

      // Search for matching anchor
      const { data, error: searchError } = await supabase
        .from('anchors')
        .select('*')
        .eq('fingerprint', fp)
        .is('deleted_at', null)
        .single();

      if (searchError) {
        if (searchError.code === 'PGRST116') {
          // No match found
          setState('not-found');
        } else {
          throw searchError;
        }
      } else if (data) {
        setAnchor(data);
        setState('found');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('An error occurred during verification. Please try again.');
      setState('error');
    }
  }, []);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      verifyFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      verifyFile(files[0]);
    }
  };

  const handleReset = () => {
    setState('idle');
    setFile(null);
    setFingerprint(null);
    setAnchor(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
    <div className="verify-page">
      <div className="verify-container">
        {/* Header */}
        <div className="verify-header">
          <h1>Verify Document</h1>
          <p>Drop a file to verify its authenticity. Your file never leaves your device.</p>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="file-input-hidden"
        />

        {/* Dropzone */}
        {state === 'idle' && (
          <div
            className={`verify-dropzone ${isDragging ? 'dragging' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
          >
            <div className="dropzone-icon">🔍</div>
            <p className="dropzone-label">Drop a file to verify</p>
            <p className="dropzone-sublabel">or click to select</p>
          </div>
        )}

        {/* Processing */}
        {state === 'processing' && (
          <div className="verify-processing">
            <div className="loading-spinner large" />
            <p>Verifying document...</p>
            {file && <p className="file-name">{file.name}</p>}
          </div>
        )}

        {/* Found - Document is verified */}
        {state === 'found' && anchor && (
          <div className="verify-result found">
            <div className="result-icon">✅</div>
            <h2>Document Verified</h2>
            <p className="result-subtitle">This document has been secured and verified.</p>

            <div className="result-details">
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <span className={`status-badge status-${anchor.status.toLowerCase()}`}>
                  {ANCHOR_STATUS_LABELS[anchor.status]}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Secured On</span>
                <span>{formatDate(anchor.created_at)}</span>
              </div>

              {anchor.chain_timestamp && (
                <div className="detail-row">
                  <span className="detail-label">Verified On</span>
                  <span>{formatDate(anchor.chain_timestamp)}</span>
                </div>
              )}

              <div className="detail-row fingerprint-row">
                <span className="detail-label">Fingerprint</span>
                <code className="fingerprint-value">{fingerprint}</code>
              </div>

              {anchor.chain_tx_id && (
                <div className="detail-row">
                  <span className="detail-label">Network Receipt</span>
                  <code className="tx-value">{anchor.chain_tx_id}</code>
                </div>
              )}
            </div>

            <button className="btn-secondary" onClick={handleReset}>
              Verify Another Document
            </button>
          </div>
        )}

        {/* Not Found */}
        {state === 'not-found' && (
          <div className="verify-result not-found">
            <div className="result-icon">❌</div>
            <h2>Document Not Found</h2>
            <p className="result-subtitle">
              This document has not been secured in our system.
            </p>

            {fingerprint && (
              <div className="fingerprint-display">
                <span className="detail-label">Fingerprint Checked</span>
                <code className="fingerprint-value">{fingerprint}</code>
              </div>
            )}

            <p className="not-found-note">
              This could mean the document was never secured, or it may have been modified
              since it was secured.
            </p>

            <button className="btn-secondary" onClick={handleReset}>
              Try Another Document
            </button>
          </div>
        )}

        {/* Error */}
        {state === 'error' && (
          <div className="verify-result error">
            <div className="result-icon">⚠️</div>
            <h2>Verification Error</h2>
            <p className="result-subtitle">{error}</p>
            <button className="btn-secondary" onClick={handleReset}>
              Try Again
            </button>
          </div>
        )}

        {/* Privacy Note */}
        <div className="verify-privacy">
          <p>
            🔒 <strong>Privacy First:</strong> Your file is processed entirely in your browser.
            Only the fingerprint is checked against our records – your file is never uploaded.
          </p>
        </div>

        {/* Link to sign in */}
        <div className="verify-cta">
          <p>
            Want to secure your own documents?{' '}
            <a href="#/auth">Sign up for free</a>
          </p>
        </div>
      </div>
    </div>
  );
}
