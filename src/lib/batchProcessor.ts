/**
 * Batch Processor (MVP Mock)
 *
 * Simulates the batch anchoring process for demo purposes.
 * In production, this would be a Supabase Edge Function or external worker
 * that batches fingerprints, creates a Merkle tree, and anchors to Bitcoin.
 *
 * This mock immediately marks PENDING anchors as SECURED with a simulated tx.
 */

import { supabase } from './supabase';

/**
 * Generate a mock Bitcoin transaction ID (for demo)
 */
function generateMockTxId(): string {
  const chars = '0123456789abcdef';
  let txId = '';
  for (let i = 0; i < 64; i++) {
    txId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return txId;
}

/**
 * Process pending anchors (MVP mock)
 *
 * In production:
 * 1. Query all PENDING anchors
 * 2. Build Merkle tree from fingerprints
 * 3. Create OP_RETURN transaction with Merkle root
 * 4. Broadcast to Bitcoin network
 * 5. Update anchors with tx_id and block timestamp
 *
 * This mock simulates step 5 immediately.
 */
export async function processPendingAnchors(): Promise<{
  processed: number;
  errors: string[];
}> {
  const errors: string[] = [];

  // Fetch all pending anchors
  const { data: pendingAnchors, error: fetchError } = await supabase
    .from('anchors')
    .select('id')
    .eq('status', 'PENDING')
    .is('deleted_at', null);

  if (fetchError) {
    return { processed: 0, errors: [fetchError.message] };
  }

  if (!pendingAnchors || pendingAnchors.length === 0) {
    return { processed: 0, errors: [] };
  }

  // Generate mock transaction data
  const mockTxId = generateMockTxId();
  const chainTimestamp = new Date().toISOString();

  // Update all pending anchors to SECURED
  const anchorIds = pendingAnchors.map((a) => a.id);

  const { error: updateError } = await supabase
    .from('anchors')
    .update({
      status: 'SECURED',
      chain_tx_id: mockTxId,
      chain_timestamp: chainTimestamp,
    })
    .in('id', anchorIds);

  if (updateError) {
    return { processed: 0, errors: [updateError.message] };
  }

  return { processed: anchorIds.length, errors };
}

/**
 * Get batch processing status
 */
export async function getBatchStatus(): Promise<{
  pending: number;
  secured: number;
  revoked: number;
}> {
  const { data, error } = await supabase
    .from('anchors')
    .select('status')
    .is('deleted_at', null);

  if (error || !data) {
    return { pending: 0, secured: 0, revoked: 0 };
  }

  return {
    pending: data.filter((a) => a.status === 'PENDING').length,
    secured: data.filter((a) => a.status === 'SECURED').length,
    revoked: data.filter((a) => a.status === 'REVOKED').length,
  };
}
