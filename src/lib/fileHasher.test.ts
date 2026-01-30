/**
 * FileHasher Unit Tests (P4-S1)
 *
 * Tests the client-side fingerprinting utility.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  formatFileSize,
  truncateFingerprint,
} from './fileHasher';

// Note: computeFingerprint and verifyFingerprint require File API and crypto.subtle
// which need to be mocked in a Node.js test environment.
// These are better tested via E2E tests in the browser.

describe('formatFileSize', () => {
  it('formats bytes correctly', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(500)).toBe('500 B');
    expect(formatFileSize(1023)).toBe('1023 B');
  });

  it('formats kilobytes correctly', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(10240)).toBe('10.0 KB');
  });

  it('formats megabytes correctly', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB');
    expect(formatFileSize(100 * 1024 * 1024)).toBe('100.0 MB');
  });

  it('formats gigabytes correctly', () => {
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.00 GB');
    expect(formatFileSize(2.5 * 1024 * 1024 * 1024)).toBe('2.50 GB');
  });
});

describe('truncateFingerprint', () => {
  it('returns short fingerprints unchanged', () => {
    expect(truncateFingerprint('abc123')).toBe('abc123');
    expect(truncateFingerprint('12345678901234567890')).toBe('12345678901234567890');
  });

  it('truncates long fingerprints', () => {
    const longFingerprint = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6';
    const result = truncateFingerprint(longFingerprint);
    expect(result).toBe('a1b2c3d4...w3x4y5z6');
    expect(result.length).toBe(19); // 8 + 3 + 8
  });

  it('handles 64-character SHA-256 fingerprint', () => {
    const sha256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    const result = truncateFingerprint(sha256);
    expect(result).toBe('e3b0c442...7852b855');
  });
});

describe('FileHasher integration', () => {
  // These tests would run in browser environment with actual File API
  // Marking as placeholder for E2E testing

  it.todo('computes SHA-256 fingerprint for small files');
  it.todo('computes SHA-256 fingerprint for large files with progress');
  it.todo('verifies matching fingerprints correctly');
  it.todo('detects mismatched fingerprints');
});
