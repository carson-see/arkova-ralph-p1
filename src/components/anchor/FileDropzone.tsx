/**
 * FileDropzone Component (P4-S1)
 *
 * Drag-and-drop file upload component for fingerprinting.
 * Files are processed entirely client-side - never uploaded to server.
 *
 * Features:
 * - Drag and drop support
 * - Click to browse
 * - Progress indicator for large files
 * - Privacy messaging ("File never leaves device")
 */

import { useState, useCallback, useRef } from 'react';
import { Upload, FileText, Shield, Loader2, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  computeFingerprint,
  formatFileSize,
  truncateFingerprint,
  type FileFingerprint,
} from '@/lib/fileHasher';
import { MESSAGES } from '@/lib/copy';

interface FileDropzoneProps {
  /** Called when a file has been fingerprinted */
  onFingerprint: (result: FileFingerprint) => void;
  /** Optional: Called when user clears the selection */
  onClear?: () => void;
  /** Disable the dropzone */
  disabled?: boolean;
  /** Show compact version */
  compact?: boolean;
}

type DropzoneState = 'idle' | 'dragging' | 'processing' | 'complete';

export function FileDropzone({
  onFingerprint,
  onClear,
  disabled = false,
  compact = false,
}: FileDropzoneProps) {
  const [state, setState] = useState<DropzoneState>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<FileFingerprint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setState('processing');
      setProgress(0);
      setError(null);

      try {
        const fingerprint = await computeFingerprint(file, (p) => setProgress(p));
        setResult(fingerprint);
        setState('complete');
        onFingerprint(fingerprint);
      } catch (err) {
        setError('Failed to process file. Please try again.');
        setState('idle');
        console.error('Fingerprint error:', err);
      }
    },
    [onFingerprint]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled) return;

      setState('idle');

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        processFile(files[0]);
      }
    },
    [disabled, processFile]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && state !== 'processing') {
        setState('dragging');
      }
    },
    [disabled, state]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (state === 'dragging') {
        setState('idle');
      }
    },
    [state]
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

  const handleClear = useCallback(() => {
    setResult(null);
    setState('idle');
    setProgress(0);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onClear?.();
  }, [onClear]);

  const handleClick = useCallback(() => {
    if (!disabled && state !== 'processing') {
      inputRef.current?.click();
    }
  }, [disabled, state]);

  // Compact version for re-verification
  if (compact) {
    return (
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
          state === 'dragging'
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          disabled={disabled}
        />
        {state === 'processing' ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Processing... {progress}%</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Upload className="h-4 w-4" />
            <span className="text-sm">Drop file to verify</span>
          </div>
        )}
      </div>
    );
  }

  // Complete state - show result
  if (state === 'complete' && result) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium truncate">{result.filename}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(result.fileSize)} • Processed in{' '}
                    {result.computeTimeMs.toFixed(0)}ms
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleClear}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-3 p-3 bg-muted rounded-md">
                <p className="text-xs text-muted-foreground mb-1">Document Fingerprint</p>
                <p className="font-mono text-sm break-all">{result.fingerprint}</p>
              </div>
            </div>
          </div>

          {/* Privacy notice */}
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-green-600" />
            <span>{MESSAGES.FINGERPRINT_INFO}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Idle/dragging/processing state
  return (
    <Card
      className={`transition-colors ${
        state === 'dragging' ? 'border-primary bg-primary/5' : ''
      } ${disabled ? 'opacity-50' : ''}`}
    >
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-lg">Secure Your Document</CardTitle>
        <CardDescription>
          Create a permanent, verifiable record of your document
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            state === 'dragging'
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
          } ${disabled || state === 'processing' ? 'cursor-not-allowed' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            disabled={disabled || state === 'processing'}
          />

          {state === 'processing' ? (
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
              <div>
                <p className="font-medium">{MESSAGES.PROCESSING}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Calculating fingerprint... {progress}%
                </p>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-2 max-w-xs mx-auto">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-primary/10">
                {state === 'dragging' ? (
                  <FileText className="h-8 w-8 text-primary" />
                ) : (
                  <Upload className="h-8 w-8 text-primary" />
                )}
              </div>
              <div>
                <p className="font-medium">
                  {state === 'dragging'
                    ? 'Drop your file here'
                    : 'Drag and drop your document'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse
                </p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive text-center">
            {error}
          </div>
        )}

        {/* Privacy notice */}
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4 text-green-600" />
          <span>{MESSAGES.FINGERPRINT_INFO}</span>
        </div>
      </CardContent>
    </Card>
  );
}
