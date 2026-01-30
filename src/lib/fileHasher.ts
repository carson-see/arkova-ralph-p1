/**
 * FileHasher Utility
 *
 * Client-side SHA-256 hashing using Web Crypto API.
 * The file NEVER leaves the user's device - only the hash is sent to the server.
 *
 * This is a core security feature of Arkova.
 */

/**
 * Calculate SHA-256 hash of a file
 * @param file - File to hash
 * @returns Promise resolving to lowercase hex string (64 characters)
 */
export async function hashFile(file: File): Promise<string> {
  // Read file as ArrayBuffer
  const buffer = await file.arrayBuffer();

  // Calculate SHA-256 hash using Web Crypto API
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);

  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return hashHex.toLowerCase();
}

/**
 * Verify a file matches an expected fingerprint
 * @param file - File to verify
 * @param expectedFingerprint - Expected SHA-256 hash (64 hex chars)
 * @returns Promise resolving to true if match, false otherwise
 */
export async function verifyFile(file: File, expectedFingerprint: string): Promise<boolean> {
  const actualFingerprint = await hashFile(file);
  return actualFingerprint.toLowerCase() === expectedFingerprint.toLowerCase();
}

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Human-readable file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file extension
 * @param filename - File name
 * @returns File extension (lowercase) or empty string
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
}

/**
 * Check if file type is allowed
 * @param file - File to check
 * @returns true if file type is acceptable
 */
export function isAllowedFileType(file: File): boolean {
  // Allow common document types
  const allowedTypes = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/gif',
    'text/plain',
    'application/json',
    'application/xml',
    'text/csv',
  ];

  const allowedExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'txt', 'json', 'xml', 'csv'];

  // Check MIME type
  if (allowedTypes.includes(file.type)) {
    return true;
  }

  // Fallback to extension check
  const ext = getFileExtension(file.name);
  return allowedExtensions.includes(ext);
}
