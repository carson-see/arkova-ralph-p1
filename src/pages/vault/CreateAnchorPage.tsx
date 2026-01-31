/**
 * CreateAnchorPage (P4-S2)
 *
 * Page for creating a new anchor record.
 * Uses FileDropzone to compute fingerprint, shows confirmation modal,
 * and inserts anchor record to Supabase with status PENDING.
 */

import { useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { RoleRoute } from '@/components/auth/RouteGuard';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FileDropzone } from '@/components/anchor/FileDropzone';
import { ConfirmAnchorModal } from '@/components/anchor/ConfirmAnchorModal';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { MESSAGES } from '@/lib/copy';
import type { FileFingerprint } from '@/lib/fileHasher';

export function CreateAnchorPage() {
  const { profile } = useAuthContext();
  const [fingerprint, setFingerprint] = useState<FileFingerprint | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFingerprint = useCallback((result: FileFingerprint) => {
    setFingerprint(result);
    setShowConfirmModal(true);
    setError(null);
  }, []);

  const handleClear = useCallback(() => {
    setFingerprint(null);
    setShowConfirmModal(false);
    setError(null);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowConfirmModal(false);
  }, []);

  const handleConfirmCreate = useCallback(async () => {
    if (!fingerprint || !profile) return;

    setIsCreating(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from('anchors').insert({
        user_id: profile.id,
        org_id: profile.org_id,
        fingerprint: fingerprint.fingerprint,
        filename: fingerprint.filename,
        file_size: fingerprint.fileSize,
        file_mime: fingerprint.mimeType || null,
        status: 'PENDING',
      });

      if (insertError) {
        console.error('Failed to create anchor:', insertError);
        setError(insertError.message || MESSAGES.ANCHOR_FAILED);
        return;
      }

      // Success - redirect to vault
      window.location.hash = '/vault';
    } catch (err) {
      console.error('Unexpected error creating anchor:', err);
      setError(MESSAGES.ANCHOR_FAILED);
    } finally {
      setIsCreating(false);
    }
  }, [fingerprint, profile]);

  const handleBack = useCallback(() => {
    window.location.hash = '/vault';
  }, []);

  return (
    <RoleRoute allowedRoles={['INDIVIDUAL']} fallbackPath="/org">
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header with back button */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Create New Anchor</h1>
              <p className="text-muted-foreground">
                Secure a document by creating a permanent, verifiable record
              </p>
            </div>
          </div>

          {/* File Dropzone */}
          <FileDropzone
            onFingerprint={handleFingerprint}
            onClear={handleClear}
            disabled={isCreating}
          />

          {/* Error Display */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Confirmation Modal */}
          <ConfirmAnchorModal
            open={showConfirmModal}
            onClose={handleCloseModal}
            fingerprint={fingerprint}
            onConfirm={handleConfirmCreate}
            isCreating={isCreating}
          />
        </div>
      </DashboardLayout>
    </RoleRoute>
  );
}
