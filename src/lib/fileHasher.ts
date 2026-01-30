/**
 * FileHasher Utility (P4-S1)
 *
 * Client-side file fingerprinting using Web Crypto API.
 * Files NEVER leave the device - only the SHA-256 fingerprint is used.
 *
 * IMPORTANT: This is the core security feature of Arkova.
 * The file content stays in the browser; only the fingerprint goes to the server.
 */

/**
 * Result of file fingerprinting
 */
export interface FileFingerprint {
  /** SHA-256 fingerprint as hex string */
  fingerprint: string;
  /** Original filename */
  filename: string;
  /** File size in bytes */
  fileSize: number;
  /** MIME type */
  mimeType: string;
  /** Time taken to compute fingerprint (ms) */
  computeTimeMs: number;
}

/**
 * Progress callback for large files
 */
export type HashProgressCallback = (progress: number) => void;

/**
 * Convert ArrayBuffer to hex string
 */
function bufferToHex(buffer: ArrayBuffer): string {
  const hashArray = Array.from(new Uint8Array(buffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Compute SHA-256 fingerprint of a file using Web Crypto API
 *
 * @param file - File to fingerprint
 * @param onProgress - Optional progress callback (0-100)
 * @returns FileFingerprint with the computed fingerprint
 *
 * @example
 * ```ts
 * const result = await computeFingerprint(file);
 * console.log(result.fingerprint); // "a1b2c3..."
 * ```
 */
export async function computeFingerprint(
  file: File,
  onProgress?: HashProgressCallback
): Promise<FileFingerprint> {
  const startTime = performance.now();

  // For small files (< 10MB), read entire file at once
  if (file.size < 10 * 1024 * 1024) {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const fingerprint = bufferToHex(hashBuffer);

    onProgress?.(100);

    return {
      fingerprint,
      filename: file.name,
      fileSize: file.size,
      mimeType: file.type || 'application/octet-stream',
      computeTimeMs: performance.now() - startTime,
    };
  }

  // For large files, use streaming approach with progress updates
  const chunkSize = 2 * 1024 * 1024; // 2MB chunks
  const chunks = Math.ceil(file.size / chunkSize);
  let processedBytes = 0;

  // Create a SubtleCrypto digest stream manually
  // Note: We accumulate chunks and hash at the end for browser compatibility
  const allChunks: Uint8Array[] = [];

  for (let i = 0; i < chunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);
    const arrayBuffer = await chunk.arrayBuffer();
    allChunks.push(new Uint8Array(arrayBuffer));

    processedBytes += end - start;
    onProgress?.(Math.round((processedBytes / file.size) * 100));
  }

  // Combine chunks and compute hash
  const totalLength = allChunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of allChunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }

  const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
  const fingerprint = bufferToHex(hashBuffer);

  return {
    fingerprint,
    filename: file.name,
    fileSize: file.size,
    mimeType: file.type || 'application/octet-stream',
    computeTimeMs: performance.now() - startTime,
  };
}

/**
 * Verify a file matches a known fingerprint
 *
 * @param file - File to verify
 * @param expectedFingerprint - Expected SHA-256 fingerprint (hex)
 * @returns true if fingerprint matches, false otherwise
 */
export async function verifyFingerprint(
  file: File,
  expectedFingerprint: string
): Promise<boolean> {
  const result = await computeFingerprint(file);
  return result.fingerprint.toLowerCase() === expectedFingerprint.toLowerCase();
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/**
 * Truncate fingerprint for display (show first and last 8 chars)
 */
export function truncateFingerprint(fingerprint: string): string {
  if (fingerprint.length <= 20) return fingerprint;
  return `${fingerprint.slice(0, 8)}...${fingerprint.slice(-8)}`;
}
