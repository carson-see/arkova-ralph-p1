/**
 * Tests for CSV export utility
 */

import { describe, it, expect } from 'vitest';
import { exportAnchorsToCSV, generateExportFilename } from './csvExport';
import type { Anchor } from '@/types/database.types';

// Mock anchor for testing
const createMockAnchor = (overrides: Partial<Anchor> = {}): Anchor => ({
  id: 'test-id-123',
  user_id: 'user-123',
  org_id: 'org-123',
  fingerprint: 'abc123def456',
  filename: 'test-document.pdf',
  file_size: 1024 * 1024, // 1 MB
  file_mime: 'application/pdf',
  status: 'SECURED',
  chain_tx_id: null,
  chain_block_height: null,
  chain_timestamp: null,
  legal_hold: false,
  retention_until: null,
  deleted_at: null,
  created_at: '2024-01-15T10:30:00.000Z',
  updated_at: '2024-01-15T10:30:00.000Z',
  ...overrides,
});

describe('exportAnchorsToCSV', () => {
  it('generates CSV with correct headers', async () => {
    const blob = exportAnchorsToCSV([]);
    const text = await blob.text();

    // Check headers (BOM may be present as first character)
    expect(text).toContain('Filename,Fingerprint,Status,Created (UTC),File Size');
  });

  it('includes anchor data in correct columns', async () => {
    const anchor = createMockAnchor();
    const blob = exportAnchorsToCSV([anchor]);
    const text = await blob.text();

    expect(text).toContain('test-document.pdf');
    expect(text).toContain('abc123def456');
    expect(text).toContain('SECURED');
    expect(text).toContain('2024-01-15T10:30:00.000Z');
    expect(text).toContain('1.0 MB');
  });

  it('escapes commas in filenames', async () => {
    const anchor = createMockAnchor({ filename: 'file,with,commas.pdf' });
    const blob = exportAnchorsToCSV([anchor]);
    const text = await blob.text();

    // Commas should be wrapped in quotes
    expect(text).toContain('"file,with,commas.pdf"');
  });

  it('escapes quotes in filenames', async () => {
    const anchor = createMockAnchor({ filename: 'file"with"quotes.pdf' });
    const blob = exportAnchorsToCSV([anchor]);
    const text = await blob.text();

    // Quotes should be doubled and wrapped
    expect(text).toContain('"file""with""quotes.pdf"');
  });

  it('handles null file_size', async () => {
    const anchor = createMockAnchor({ file_size: null });
    const blob = exportAnchorsToCSV([anchor]);
    const text = await blob.text();

    // Should not throw and should produce valid CSV
    const lines = text.split('\n');
    expect(lines.length).toBe(2); // Header + 1 data row

    // The row should have all columns (even if last is empty)
    const dataLine = lines[1];
    const columns = dataLine.split(',');
    expect(columns.length).toBe(5); // All 5 columns present
  });

  it('exports multiple anchors', async () => {
    const anchors = [
      createMockAnchor({ filename: 'file1.pdf' }),
      createMockAnchor({ filename: 'file2.pdf' }),
      createMockAnchor({ filename: 'file3.pdf' }),
    ];
    const blob = exportAnchorsToCSV(anchors);
    const text = await blob.text();

    const lines = text.split('\n');
    // Header + 3 data rows
    expect(lines.length).toBe(4);
  });

  it('formats timestamps in UTC ISO format', async () => {
    const anchor = createMockAnchor({
      created_at: '2024-06-15T14:30:00+05:00',
    });
    const blob = exportAnchorsToCSV([anchor]);
    const text = await blob.text();

    // Should be converted to UTC ISO format
    expect(text).toContain('2024-06-15T09:30:00.000Z');
  });
});

describe('generateExportFilename', () => {
  it('generates filename with correct format', () => {
    const filename = generateExportFilename();

    expect(filename).toMatch(/^arkova-records-\d{4}-\d{2}-\d{2}\.csv$/);
  });

  it('includes current date', () => {
    const filename = generateExportFilename();
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    expect(filename).toBe(`arkova-records-${year}-${month}-${day}.csv`);
  });
});
