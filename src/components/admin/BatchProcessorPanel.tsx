/**
 * BatchProcessorPanel Component
 *
 * Admin panel for triggering batch processing (MVP demo).
 * In production, this would be automated via cron/scheduler.
 */

import React, { useState, useEffect } from 'react';
import { processPendingAnchors, getBatchStatus } from '../../lib/batchProcessor';
import { MESSAGES } from '../../lib/copy';

interface BatchStatus {
  pending: number;
  secured: number;
  revoked: number;
}

export function BatchProcessorPanel() {
  const [status, setStatus] = useState<BatchStatus>({ pending: 0, secured: 0, revoked: 0 });
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ processed: number; errors: string[] } | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    const newStatus = await getBatchStatus();
    setStatus(newStatus);
    setLoading(false);
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleProcess = async () => {
    setProcessing(true);
    setResult(null);

    const processResult = await processPendingAnchors();
    setResult(processResult);

    // Refresh status
    await fetchStatus();
    setProcessing(false);
  };

  return (
    <div className="batch-processor-panel">
      <div className="panel-header">
        <h3>Verification Queue</h3>
        <button
          type="button"
          className="btn-icon"
          onClick={fetchStatus}
          disabled={loading}
          aria-label="Refresh status"
        >
          🔄
        </button>
      </div>

      {/* Status Display */}
      <div className="batch-status-grid">
        <div className="batch-status-item pending">
          <span className="status-count">{status.pending}</span>
          <span className="status-label">Pending</span>
        </div>
        <div className="batch-status-item secured">
          <span className="status-count">{status.secured}</span>
          <span className="status-label">Verified</span>
        </div>
        <div className="batch-status-item revoked">
          <span className="status-count">{status.revoked}</span>
          <span className="status-label">Revoked</span>
        </div>
      </div>

      {/* Process Button */}
      {status.pending > 0 && (
        <div className="batch-action">
          <button
            type="button"
            className="btn-primary full-width"
            onClick={handleProcess}
            disabled={processing}
          >
            {processing ? 'Processing...' : `Process ${status.pending} Pending Records`}
          </button>
          <p className="batch-hint">
            Simulates verification anchoring for demo purposes.
          </p>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className={`batch-result ${result.errors.length > 0 ? 'error' : 'success'}`}>
          {result.errors.length > 0 ? (
            <>
              <strong>Processing Error</strong>
              <p>{result.errors.join(', ')}</p>
            </>
          ) : (
            <>
              <strong>✅ Processing Complete</strong>
              <p>{result.processed} records verified successfully.</p>
            </>
          )}
        </div>
      )}

      {/* Info */}
      <div className="batch-info">
        <p>
          <strong>Note:</strong> This is a demo simulation. In production, records are
          automatically batched and anchored to the verification network on a scheduled basis.
        </p>
      </div>
    </div>
  );
}
