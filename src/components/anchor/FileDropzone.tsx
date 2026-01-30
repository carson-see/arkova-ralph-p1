/**
 * FileDropzone Component
 *
 * Drag-and-drop file upload with client-side SHA-256 hashing.
 * The file NEVER leaves the user's device - only the hash is sent.
 */

import React, { useState, useCallback, useRef } from 'react';
import { hashFile, formatFileSize, isAllowedFileType } from '../../lib/fileHasher';
import { FORM_LABELS, MESSAGES, TOOLTIPS } from '../../lib/copy';

interface FileDropzoneProps {
  onFileHashed: (data: {
    fingerprint: string;
    filename: string;
    fileSize: number;
    fileMime: string;
  }) => void;
  disabled?: boolean;
}

export function FileDropzone({ onFileHashed, disabled = false }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setIsProcessing(true);

      // Validate file type
      if (!isAllowedFileType(file)) {
        setError('File type not supported. Please use PDF, images, or text files.');
        setIsProcessing(false);
        return;
      }

      // Validate file size (max 100MB)
      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('File too large. Maximum size is 100MB.');
        setIsProcessing(false);
        return;
      }

      try {
        // Calculate hash (file never leaves device)
        const hash = await hashFile(file);

        setSelectedFile(file);
        setFingerprint(hash);

        // Notify parent
        onFileHashed({
          fingerprint: hash,
          filename: file.name,
          fileSize: file.size,
          fileMime: file.type || 'application/octet-stream',
        });
      } catch (err) {
        setError(MESSAGES.UPLOAD_ERROR);
        console.error('File processing error:', err);
      } finally {
        setIsProcessing(false);
      }
    },
    [onFileHashed]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        processFile(files[0]);
      }
    },
    [disabled, processFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile]
  );

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setFingerprint(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="file-dropzone-container">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        disabled={disabled || isProcessing}
        className="file-input-hidden"
        accept=".pdf,.png,.jpg,.jpeg,.gif,.txt,.json,.xml,.csv"
      />

      {/* Dropzone */}
      <div
        className={`file-dropzone ${isDragging ? 'dragging' : ''} ${
          selectedFile ? 'has-file' : ''
        } ${disabled ? 'disabled' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={FORM_LABELS.FILE_SELECT}
      >
        {isProcessing ? (
          <div className="dropzone-processing">
            <div className="loading-spinner" />
            <p>{MESSAGES.PROCESSING}</p>
          </div>
        ) : selectedFile ? (
          <div className="dropzone-file-info">
            <div className="file-icon">📄</div>
            <div className="file-details">
              <span className="file-name">{selectedFile.name}</span>
              <span className="file-size">{formatFileSize(selectedFile.size)}</span>
            </div>
            <button
              type="button"
              className="file-reset"
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
              aria-label="Remove file"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="dropzone-empty">
            <div className="dropzone-icon">📁</div>
            <p className="dropzone-label">{FORM_LABELS.FILE_DRAG}</p>
            <p className="dropzone-sublabel">or click to select a file</p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      {/* Fingerprint display */}
      {fingerprint && (
        <div className="fingerprint-display">
          <div className="fingerprint-header">
            <span className="fingerprint-label">{FORM_LABELS.FINGERPRINT}</span>
            <span className="fingerprint-tooltip" title={TOOLTIPS.FINGERPRINT}>
              ℹ️
            </span>
          </div>
          <code className="fingerprint-value">{fingerprint}</code>
          <p className="fingerprint-info">{MESSAGES.FINGERPRINT_INFO}</p>
        </div>
      )}
    </div>
  );
}
