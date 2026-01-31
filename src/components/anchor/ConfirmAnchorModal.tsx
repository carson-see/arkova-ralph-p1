/**
 * ConfirmAnchorModal Component (P4-S2)
 *
 * Modal dialog for confirming anchor creation.
 * Shows file details and fingerprint before creating the anchor record.
 *
 * Features:
 * - File name and size display
 * - Full SHA-256 fingerprint display
 * - Privacy reminder text
 * - Create Anchor and Cancel buttons
 */

import { Shield, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatFileSize, type FileFingerprint } from '@/lib/fileHasher';
import { ACTION_LABELS, MESSAGES } from '@/lib/copy';

interface ConfirmAnchorModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Called when the modal should close */
  onClose: () => void;
  /** File fingerprint data to display */
  fingerprint: FileFingerprint | null;
  /** Called when user confirms anchor creation */
  onConfirm: () => void;
  /** Whether the creation is in progress */
  isCreating?: boolean;
}

export function ConfirmAnchorModal({
  open,
  onClose,
  fingerprint,
  onConfirm,
  isCreating = false,
}: ConfirmAnchorModalProps) {
  if (!fingerprint) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Document Anchor</DialogTitle>
          <DialogDescription>
            Review the details below before creating a permanent record.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Details */}
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate" title={fingerprint.filename}>
                {fingerprint.filename}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(fingerprint.fileSize)}
                {fingerprint.mimeType && fingerprint.mimeType !== 'application/octet-stream' && (
                  <span className="ml-2">• {fingerprint.mimeType}</span>
                )}
              </p>
            </div>
          </div>

          {/* Fingerprint Display */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Document Fingerprint
            </label>
            <div className="p-3 bg-muted rounded-md">
              <p
                className="font-mono text-xs break-all select-all"
                title="Click to select"
              >
                {fingerprint.fingerprint}
              </p>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="flex items-start gap-2 p-3 bg-green-500/10 rounded-md">
            <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-700">
              {MESSAGES.FINGERPRINT_INFO}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              ACTION_LABELS.CREATE_ANCHOR
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
