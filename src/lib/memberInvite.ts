/**
 * Member Invite Service
 *
 * Handles inviting members to an organization by email.
 * For MVP: validates emails and returns mock success.
 * Future: will check if user exists and link, or send invite email.
 */

import { z } from 'zod';

// =============================================================================
// TYPES
// =============================================================================

export interface InviteResult {
  email: string;
  status: 'success' | 'invalid' | 'error';
  message: string;
}

export interface InviteMembersResponse {
  success: boolean;
  results: InviteResult[];
  summary: {
    total: number;
    successful: number;
    invalid: number;
    errors: number;
  };
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Email validation schema
 */
const EmailSchema = z.string().email('Invalid email format');

/**
 * Validates a single email address
 */
export function isValidEmail(email: string): boolean {
  const result = EmailSchema.safeParse(email.trim().toLowerCase());
  return result.success;
}

/**
 * Parses a string of emails (comma, semicolon, or newline separated)
 * Returns normalized, unique emails
 */
export function parseEmailList(input: string): string[] {
  if (!input.trim()) return [];

  // Split by common separators: comma, semicolon, newline, space
  const emails = input
    .split(/[,;\n\s]+/)
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);

  // Remove duplicates
  return [...new Set(emails)];
}

/**
 * Validates a list of emails and returns validation results
 */
export function validateEmails(emails: string[]): {
  valid: string[];
  invalid: string[];
} {
  const valid: string[] = [];
  const invalid: string[] = [];

  for (const email of emails) {
    if (isValidEmail(email)) {
      valid.push(email);
    } else {
      invalid.push(email);
    }
  }

  return { valid, invalid };
}

// =============================================================================
// INVITE SERVICE
// =============================================================================

/**
 * Invite members by email list
 *
 * For MVP: Validates emails and returns mock success for valid emails.
 * Does not actually send emails or create invites in database.
 *
 * Future implementation will:
 * - Check if user already exists in system
 * - If exists: Link to org pending approval
 * - If not exists: Send invite email with signup link
 *
 * @param emails - Array of email addresses to invite
 * @param _orgId - Organization ID (unused in MVP, for future tenant isolation)
 */
export async function inviteMembers(
  emails: string[],
  _orgId?: string
): Promise<InviteMembersResponse> {
  const results: InviteResult[] = [];

  for (const email of emails) {
    const normalizedEmail = email.trim().toLowerCase();

    // Validate email format
    if (!isValidEmail(normalizedEmail)) {
      results.push({
        email: normalizedEmail,
        status: 'invalid',
        message: 'Invalid email format',
      });
      continue;
    }

    // MVP: Mock success for all valid emails
    // Future: Check if user exists, link or send invite
    results.push({
      email: normalizedEmail,
      status: 'success',
      message: 'Invitation sent',
    });
  }

  // Calculate summary
  const summary = {
    total: results.length,
    successful: results.filter((r) => r.status === 'success').length,
    invalid: results.filter((r) => r.status === 'invalid').length,
    errors: results.filter((r) => r.status === 'error').length,
  };

  return {
    success: summary.errors === 0 && summary.invalid === 0,
    results,
    summary,
  };
}

// =============================================================================
// FUTURE: DATABASE OPERATIONS
// =============================================================================

/**
 * TODO: Future implementation
 *
 * interface PendingInvite {
 *   id: string;
 *   org_id: string;
 *   email: string;
 *   invited_by: string;
 *   status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
 *   created_at: string;
 *   expires_at: string;
 * }
 *
 * - Create pending_invites table
 * - Store invites with expiration
 * - Track invite acceptance
 * - Enforce tenant isolation (org_id scoping)
 */
