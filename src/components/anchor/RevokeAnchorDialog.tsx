/**
 * RevokeAnchorDialog Component (P5-S2)
 *
 * Confirmation dialog for revoking an anchor.
 * Only available to ORG_ADMIN users for anchors in their organization.
 *
 * Features:
 * - AlertDialog for destructive action confirmation
 * - Clear warning about irreversibility
 * - Loading state during revocation
 * - Error handling with display
 */

import { useState } from 'react';
import { AlertTriangle, Loader2, Ban } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/lib/supabase';
import type { Anchor } from '@/types/database.types';

interface RevokeAnchorDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Called when the dialog should close */
  onClose: () => void;
  /** The anchor to revoke */
  anchor: Pick<Anchor, 'id' | 'filename' | 'status'>;
  /** Called after successful revocation */
  onRevoked?: () => void;
}

export function RevokeAnchorDialog({
  open,
  onClose,
  anchor,
  onRevoked,
}: RevokeAnchorDialogProps) {
  const [isRevoking, setIsRevoking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRevoke = async () => {
    setIsRevoking(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('revoke_anchor', {
        p_anchor_id: anchor.id,
      });

      if (rpcError) {
        console.error('Revoke anchor error:', rpcError);
        // Extract user-friendly message from error
        const message = rpcError.message || 'Failed to revoke anchor';
        setError(message);
        setIsRevoking(false);
        return;
      }

      // Type-safe check for success property
      const result = data as { success?: boolean } | null;
      if (!result?.success) {
        setError('Revocation failed. Please try again.');
        setIsRevoking(false);
        return;
      }

      // Success - notify parent and close
      onRevoked?.();
      onClose();
    } catch (err) {
      console.error('Unexpected error revoking anchor:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsRevoking(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && !isRevoking) {
      setError(null);
      onClose();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <AlertDialogTitle>Revoke Anchor</AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                You are about to revoke the following anchor:
              </p>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium truncate" title={anchor.filename}>
                  {anchor.filename}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Current status: {anchor.status}
                </p>
              </div>
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md">
                <p className="text-sm text-red-700 font-medium flex items-center gap-2">
                  <Ban className="h-4 w-4 flex-shrink-0" />
                  This action is irreversible
                </p>
                <p className="text-sm text-red-600 mt-1">
                  Once revoked, this anchor cannot be restored. The document fingerprint
                  will remain on record but will be marked as invalid.
                </p>
              </div>
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRevoking}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleRevoke();
            }}
            disabled={isRevoking}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isRevoking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Revoking...
              </>
            ) : (
              'Revoke Anchor'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
