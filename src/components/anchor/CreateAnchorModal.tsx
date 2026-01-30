/**
 * CreateAnchorModal Component
 *
 * Modal for creating a new anchor (securing a document).
 * Shows fingerprint confirmation before submission.
 */

import React, { useState } from 'react';
import { FileDropzone } from './FileDropzone';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { ACTION_LABELS, MESSAGES } from '../../lib/copy';

interface FileData {
  fingerprint: string;
  filename: string;
  fileSize: number;
  fileMime: string;
}

interface CreateAnchorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateAnchorModal({ isOpen, onClose, onSuccess }: CreateAnchorModalProps) {
  const { user } = useAuth();
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileHashed = (data: FileData) => {
    setFileData(data);
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async () => {
    if (!fileData || !user) return;

    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase.from('anchors').insert({
      user_id: user.id,
      fingerprint: fileData.fingerprint,
      filename: fileData.filename,
      file_size: fileData.fileSize,
      file_mime: fileData.fileMime,
      // status defaults to PENDING in database
    });

    if (insertError) {
      if (insertError.code === '23505') {
        // Unique constraint violation - document already anchored
        setError('This document has already been secured. Each document can only be anchored once.');
      } else {
        setError(MESSAGES.ANCHOR_FAILED);
        console.error('Anchor creation error:', insertError);
      }
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    // Notify parent and close after delay
    setTimeout(() => {
      onSuccess?.();
      handleClose();
    }, 2000);
  };

  const handleClose = () => {
    setFileData(null);
    setError(null);
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{ACTION_LABELS.CREATE_ANCHOR}</h2>
          <button
            type="button"
            className="modal-close"
            onClick={handleClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          {success ? (
            <div className="anchor-success">
              <div className="success-icon">✅</div>
              <h3>Document Secured!</h3>
              <p>{MESSAGES.ANCHOR_CREATED}</p>
            </div>
          ) : (
            <>
              <p className="modal-description">{MESSAGES.SECURE_INFO}</p>

              <FileDropzone onFileHashed={handleFileHashed} disabled={loading} />

              {error && (
                <div className="form-error" role="alert">
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {!success && (
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSubmit}
              disabled={!fileData || loading}
            >
              {loading ? 'Securing...' : 'Secure Document'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
