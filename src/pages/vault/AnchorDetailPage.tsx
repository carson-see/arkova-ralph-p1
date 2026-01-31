/**
 * AnchorDetailPage (P4-S3)
 *
 * Certificate-style anchor detail view with re-verification flow.
 * Displays anchor metadata in a professional, certificate-like format
 * and allows users to re-verify documents by dropping them.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  FileText,
  Shield,
  Calendar,
  HardDrive,
  Fingerprint,
  CheckCircle2,
  XCircle,
  Loader2,
  Award,
  Clock,
} from 'lucide-react';
import { RoleRoute } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FileDropzone } from '@/components/anchor/FileDropzone';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import {
  formatFileSize,
  type FileFingerprint,
} from '@/lib/fileHasher';
import {
  ANCHOR_STATUS_LABELS,
  ANCHOR_STATUS_DESCRIPTIONS,
  MESSAGES,
} from '@/lib/copy';
import type { Anchor } from '@/types/database.types';

type VerificationResult = 'idle' | 'verifying' | 'match' | 'mismatch';

/**
 * Status badge component with enhanced styling
 */
function StatusBadge({ status }: { status: string }) {
  const config = {
    PENDING: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-700',
      icon: Clock,
    },
    SECURED: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      text: 'text-green-700',
      icon: Shield,
    },
    REVOKED: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-700',
      icon: XCircle,
    },
  };

  const { bg, border, text, icon: Icon } =
    config[status as keyof typeof config] || config.PENDING;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${bg} ${border} ${text}`}
    >
      <Icon className="h-4 w-4" />
      {ANCHOR_STATUS_LABELS[status as keyof typeof ANCHOR_STATUS_LABELS] || status}
    </span>
  );
}

/**
 * Certificate-style detail row
 */
function DetailRow({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0">
      <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`font-medium ${mono ? 'font-mono text-sm break-all' : ''}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

/**
 * Re-verification section with result display
 */
function ReVerifySection({
  storedFingerprint,
}: {
  storedFingerprint: string;
}) {
  const [result, setResult] = useState<VerificationResult>('idle');
  const [verifiedFilename, setVerifiedFilename] = useState<string | null>(null);

  const handleFingerprint = useCallback(
    async (fileResult: FileFingerprint) => {
      setResult('verifying');
      setVerifiedFilename(fileResult.filename);

      // Small delay for UX
      await new Promise((resolve) => setTimeout(resolve, 300));

      const isMatch =
        fileResult.fingerprint.toLowerCase() === storedFingerprint.toLowerCase();
      setResult(isMatch ? 'match' : 'mismatch');
    },
    [storedFingerprint]
  );

  const handleClear = useCallback(() => {
    setResult('idle');
    setVerifiedFilename(null);
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Fingerprint className="h-5 w-5" />
          Re-verify Document
        </CardTitle>
        <CardDescription>
          Drop the original document to verify it matches this record
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {result === 'idle' && (
          <FileDropzone
            onFingerprint={handleFingerprint}
            onClear={handleClear}
            compact
          />
        )}

        {result === 'verifying' && (
          <div className="flex items-center justify-center gap-3 p-6 rounded-lg border-2 border-dashed border-muted-foreground/25">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-muted-foreground">Verifying fingerprint...</span>
          </div>
        )}

        {result === 'match' && (
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-green-700">Verification Successful</p>
                <p className="text-sm text-green-600">
                  {verifiedFilename && (
                    <>
                      <span className="font-medium">{verifiedFilename}</span> —{' '}
                    </>
                  )}
                  The document fingerprint matches this record exactly.
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="mt-3 text-green-700 hover:text-green-800 hover:bg-green-500/20"
            >
              Verify another document
            </Button>
          </div>
        )}

        {result === 'mismatch' && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-red-700">Verification Failed</p>
                <p className="text-sm text-red-600">
                  {verifiedFilename && (
                    <>
                      <span className="font-medium">{verifiedFilename}</span> —{' '}
                    </>
                  )}
                  The document fingerprint does not match this record.
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="mt-3 text-red-700 hover:text-red-800 hover:bg-red-500/20"
            >
              Try another document
            </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-green-600" />
          {MESSAGES.FINGERPRINT_INFO}
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * Get anchor ID from URL hash
 */
function getAnchorIdFromUrl(): string | null {
  const path = window.location.hash.slice(1); // Remove #
  const match = path.match(/^\/vault\/anchor\/([a-f0-9-]+)$/i);
  return match ? match[1] : null;
}

export function AnchorDetailPage() {
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnchor() {
      const anchorId = getAnchorIdFromUrl();

      if (!anchorId) {
        setError('Invalid record ID');
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('anchors')
        .select('*')
        .eq('id', anchorId)
        .is('deleted_at', null)
        .single();

      if (fetchError || !data) {
        console.error('Failed to fetch anchor:', fetchError);
        setError('Record not found');
      } else {
        setAnchor(data);
      }
      setLoading(false);
    }

    fetchAnchor();
  }, []);

  const handleBack = useCallback(() => {
    window.location.hash = '/vault';
  }, []);

  if (loading) {
    return (
      <RoleRoute allowedRoles={['INDIVIDUAL']} fallbackPath="/org">
        <DashboardLayout>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </DashboardLayout>
      </RoleRoute>
    );
  }

  if (error || !anchor) {
    return (
      <RoleRoute allowedRoles={['INDIVIDUAL']} fallbackPath="/org">
        <DashboardLayout>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Record Not Found</h1>
                <p className="text-muted-foreground">
                  {error || 'The requested record could not be found.'}
                </p>
              </div>
            </div>
            <Button onClick={handleBack}>Return to Vault</Button>
          </div>
        </DashboardLayout>
      </RoleRoute>
    );
  }

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
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold truncate">{anchor.filename}</h1>
              <p className="text-muted-foreground">Document Record</p>
            </div>
            <StatusBadge status={anchor.status} />
          </div>

          {/* Certificate Card */}
          <Card className="border-2">
            <CardHeader className="text-center border-b bg-muted/30 pb-6">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20">
                  <Award className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-xl">Certificate of Record</CardTitle>
              <CardDescription className="text-base">
                {ANCHOR_STATUS_DESCRIPTIONS[
                  anchor.status as keyof typeof ANCHOR_STATUS_DESCRIPTIONS
                ] || 'Document record details'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="max-w-2xl mx-auto">
                <DetailRow
                  icon={FileText}
                  label="Document Name"
                  value={anchor.filename}
                />
                <DetailRow
                  icon={HardDrive}
                  label="File Size"
                  value={
                    anchor.file_size
                      ? formatFileSize(anchor.file_size)
                      : 'Unknown'
                  }
                />
                <DetailRow
                  icon={Fingerprint}
                  label="Document Fingerprint"
                  value={anchor.fingerprint}
                  mono
                />
                <DetailRow
                  icon={Calendar}
                  label="Created"
                  value={new Date(anchor.created_at).toLocaleString(undefined, {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  })}
                />
                {anchor.status === 'SECURED' && anchor.chain_timestamp && (
                  <DetailRow
                    icon={Shield}
                    label="Secured"
                    value={new Date(anchor.chain_timestamp).toLocaleString(undefined, {
                      dateStyle: 'full',
                      timeStyle: 'short',
                    })}
                  />
                )}
                {anchor.file_mime && (
                  <DetailRow
                    icon={FileText}
                    label="File Type"
                    value={anchor.file_mime}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Re-verify Section */}
          <ReVerifySection storedFingerprint={anchor.fingerprint} />
        </div>
      </DashboardLayout>
    </RoleRoute>
  );
}
