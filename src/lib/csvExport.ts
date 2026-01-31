/**
 * CSV Export Utility
 *
 * Provides functions for exporting data to CSV format with proper escaping.
 * Used for org admin data export functionality.
 */

import type { Anchor } from '@/types/database.types';

/**
 * Escape a value for CSV format.
 * - Wraps in quotes if contains comma, quote, or newline
 * - Doubles any quotes within the value
 */
function escapeCSVValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // Check if escaping is needed (contains comma, quote, or newline)
  if (
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n') ||
    stringValue.includes('\r')
  ) {
    // Double any quotes and wrap in quotes
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number | null): string {
  if (bytes === null || bytes === undefined) {
    return '';
  }

  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Format date to UTC ISO string
 */
function formatUTCDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString();
}

/**
 * Export anchors to CSV format.
 *
 * Columns: Filename, Fingerprint, Status, Created (UTC), File Size
 *
 * @param anchors - Array of anchor records to export
 * @returns Blob containing the CSV data
 */
export function exportAnchorsToCSV(anchors: Anchor[]): Blob {
  // CSV header
  const headers = ['Filename', 'Fingerprint', 'Status', 'Created (UTC)', 'File Size'];
  const headerRow = headers.map(escapeCSVValue).join(',');

  // CSV data rows
  const dataRows = anchors.map((anchor) => {
    const row = [
      escapeCSVValue(anchor.filename),
      escapeCSVValue(anchor.fingerprint),
      escapeCSVValue(anchor.status),
      escapeCSVValue(formatUTCDate(anchor.created_at)),
      escapeCSVValue(formatFileSize(anchor.file_size)),
    ];
    return row.join(',');
  });

  // Combine header and data
  const csvContent = [headerRow, ...dataRows].join('\n');

  // Create blob with BOM for Excel compatibility
  const BOM = '\uFEFF';
  return new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });
}

/**
 * Generate export filename with current date.
 *
 * Format: arkova-records-YYYY-MM-DD.csv
 */
export function generateExportFilename(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `arkova-records-${year}-${month}-${day}.csv`;
}

/**
 * Trigger browser download of a blob.
 *
 * @param blob - The blob to download
 * @param filename - The filename to use for the download
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
