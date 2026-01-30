# Test Status & Technical Debt

## Overview

This document tracks the current test coverage status and identifies placeholder tests that need real implementations in subsequent priorities.

## Current Test Summary

| Test Suite | Location | Status | Notes |
|------------|----------|--------|-------|
| Validators | `src/lib/validators.test.ts` | ✅ Real tests | 32 tests, fully implemented |
| RLS | `tests/rls/rls.test.ts` | ⚠️ Placeholder stubs | 26 tests, pass but need real implementations |

**Total:** 58 tests passing

## Validator Tests (Complete)

The validator tests in `src/lib/validators.test.ts` are fully implemented and test:

- `AnchorCreateSchema` validation (fingerprint format, filename constraints)
- `AnchorUpdateSchema` validation
- `ProfileUpdateSchema` validation
- `AuditEventCreateSchema` validation
- `OrganizationUpdateSchema` validation
- Helper functions (`normalizeFingerprint`, `isValidFilename`)

These tests run without external dependencies and verify Zod schemas work correctly.

## RLS Tests (Placeholder - Needs P2)

The RLS tests in `tests/rls/rls.test.ts` are **structural placeholders**. They define the test cases that need to exist but use `expect(true).toBe(true)` stubs.

### Why Placeholders?

RLS tests require:
1. A running Supabase instance
2. Authenticated user sessions
3. The Auth UI (P2) to create and manage test users

P1 focused on schema, migrations, and documentation. Real RLS tests will be implemented in P2 when the auth infrastructure exists.

### Tests Needing Implementation

#### Profiles RLS
- [ ] `users can only read their own profile`
- [ ] `users can update allowed fields on their own profile`
- [ ] `users cannot update privileged fields (org_id, role, etc)`
- [ ] `users cannot read other users profiles`

#### Organizations RLS
- [ ] `users can only see their own organization`
- [ ] `org admins can update their organization`
- [ ] `users cannot see other organizations`

#### Anchors RLS
- [ ] `users can only see their own anchors`
- [ ] `org admins can see all org anchors`
- [ ] `users can create anchors with PENDING status`
- [ ] `users cannot create anchors with SECURED status`
- [ ] `users can update their own anchors (allowed fields)`
- [ ] `users cannot update other users anchors`

#### Audit Events RLS
- [ ] `users can only see their own audit events`
- [ ] `audit events cannot be updated`
- [ ] `audit events cannot be deleted`

### Test Helpers Available

The following helpers are exported from `tests/rls/rls.test.ts`:

```typescript
// Create authenticated client for a user
export async function createAuthenticatedClient(
  email: string,
  password: string
): Promise<SupabaseClient<Database>>

// Create service role client (bypasses RLS)
export function createServiceClient(): SupabaseClient<Database>

// Demo credentials from seed data
export const DEMO_CREDENTIALS = {
  adminEmail: 'admin_demo@arkova.local',
  adminPassword: 'demo_password_123',
  userEmail: 'user_demo@arkova.local',
  userPassword: 'demo_password_123',
}
```

## P2 Test Implementation Plan

When implementing P2 (Identity & Access), the following test work is required:

1. **Auth UI Tests (Playwright E2E)**
   - Sign-in flow
   - Sign-up flow
   - Session persistence
   - Route guards

2. **RLS Integration Tests**
   - Replace all placeholder stubs with real implementations
   - Use seeded demo users or create test users
   - Verify positive and negative cases

3. **Onboarding Function Tests**
   - Role assignment (one-time)
   - Org creation/linking
   - Audit event emission

## Running Tests

```bash
# Run all tests
npm test

# Run with watch mode
npm run test:watch

# Run only RLS tests
npm run test:rls
```

## CI Integration

Tests run in CI via the `test` script. All tests must pass before merging.

The copy linter (`npm run lint:copy`) also runs in CI to enforce terminology guidelines.

---

*Last updated: 2026-01-30 by Kai*
*Status: P1 Complete, P2 In Progress*
