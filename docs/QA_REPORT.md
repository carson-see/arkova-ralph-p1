# Arkova QA Report

**QA Specialist:** Ralph  
**Date:** 2025-01-30  
**Scope:** P1 (Bedrock), P2 (Identity & Access), P3 (Individual Vault)

---

## Executive Summary

Overall code quality is **solid** with good architectural decisions. The RLS policies are comprehensive, and the frontend follows React best practices. However, I've identified **4 critical issues**, **8 high-priority bugs**, **12 medium-priority issues**, and **15 low-priority suggestions**.

---

## 1. Critical Issues (Must Fix Before Launch)

### CRIT-001: Onboarding Function Schema Mismatch
**Location:** `supabase/migrations/0012_onboarding_function.sql:74-75`  
**Description:** The `update_profile_onboarding` function references columns that don't exist in `audit_events`:
- `actor_user_id` (should be `actor_id`)
- `actor_role` (doesn't exist)
- `action` (should be `event_type`)

**Impact:** The onboarding function will fail with column-not-found errors when called.

**Recommended Fix:**
```sql
-- Replace:
INSERT INTO audit_events (actor_user_id, actor_role, action, target_table, target_id, org_id)
-- With:
INSERT INTO audit_events (actor_id, event_type, event_category, target_type, target_id, org_id)
VALUES (v_user_id, 'ORG_CREATED', 'ORG', 'organizations', v_org_id, v_org_id);
```

---

### CRIT-002: Onboarding Function References Non-Existent Column
**Location:** `supabase/migrations/0012_onboarding_function.sql:82`  
**Description:** The function sets `onboarding_completed_at` which doesn't exist in the profiles table.

**Impact:** Function will fail on profile update.

**Recommended Fix:** Either add the column to profiles or remove the reference:
```sql
-- Remove this line or add the column via migration:
onboarding_completed_at = CASE WHEN p_role = 'INDIVIDUAL' THEN now() ELSE NULL END,
```

---

### CRIT-003: Missing Profile INSERT Policy Blocks New User Creation
**Location:** `supabase/migrations/0008_rls_profiles.sql`  
**Description:** There is no INSERT policy for profiles. The comment says "Profile creation should be handled by auth hooks or admin functions" but no such hook exists in the codebase.

**Impact:** New users cannot complete signup because their profile cannot be created via RLS.

**Recommended Fix:** Add an auth trigger OR create an INSERT policy:
```sql
CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
```
Or create an auth trigger in Supabase to auto-create profiles on signup.

---

### CRIT-004: Public Profiles Cannot Be Queried (Future P4 Feature)
**Location:** `supabase/migrations/0008_rls_profiles.sql`  
**Description:** The `is_public` flag exists but there's no RLS policy allowing public profile lookups. When public verification is implemented, users won't be able to verify public vaults.

**Impact:** Public vault feature (P4) will be blocked.

**Recommended Fix:** Add conditional SELECT policy:
```sql
CREATE POLICY profiles_select_public ON profiles
  FOR SELECT
  TO authenticated
  USING (is_public = true OR auth.uid() = id);
```

---

## 2. High Priority Bugs (Should Fix Soon)

### HIGH-001: Missing useEffect Cleanup in useProfile Realtime Subscription
**Location:** `src/hooks/useProfile.ts:56-74`  
**Description:** The realtime channel cleanup uses `supabase.removeChannel(channel)` but the channel variable may be stale if the component re-renders rapidly.

**Recommended Fix:**
```typescript
useEffect(() => {
  if (!user) return;
  
  let channelRef: ReturnType<typeof supabase.channel> | null = null;
  
  channelRef = supabase
    .channel(`profile:${user.id}`)
    .on(...)
    .subscribe();

  return () => {
    if (channelRef) {
      supabase.removeChannel(channelRef);
    }
  };
}, [user]);
```

---

### HIGH-002: Race Condition in RoleSelectionPage
**Location:** `src/pages/onboarding/RoleSelectionPage.tsx:58-71`  
**Description:** When selecting INDIVIDUAL role, the code calls `supabase.rpc()` then immediately redirects via `window.location.href`. If the RPC fails but the redirect happens first, user gets stuck.

**Recommended Fix:**
```typescript
const handleContinue = async () => {
  setIsLoading(true);
  setError(null);

  try {
    if (selectedRole === 'INDIVIDUAL') {
      const { data, error: rpcError } = await supabase.rpc('update_profile_onboarding', {
        p_role: 'INDIVIDUAL',
      });

      if (rpcError) throw rpcError;
      
      // Wait for profile refetch before redirect
      await refetchProfile();
      window.location.href = '#/vault';
    }
    // ...
```

---

### HIGH-003: OrgSetupPage Doesn't Await Profile Refetch
**Location:** `src/pages/onboarding/OrgSetupPage.tsx:104-107`  
**Description:** After creating org, redirects without waiting for profile state to update. RouteGuard may redirect back to org-setup.

**Recommended Fix:**
```typescript
// After RPC call succeeds:
await refetchProfile();
window.location.href = '#/org';
```

---

### HIGH-004: Error in RecordsList Doesn't Filter by User
**Location:** `src/pages/vault/VaultPage.tsx:92-98`  
**Description:** The anchor query doesn't filter by `user_id`. While RLS will filter server-side, explicitly filtering is clearer and prevents issues if RLS changes.

**Recommended Fix:**
```typescript
const { data, error } = await supabase
  .from('anchors')
  .select('*')
  .eq('user_id', user.id)  // Add explicit filter
  .is('deleted_at', null)
  .order('created_at', { ascending: false });
```

---

### HIGH-005: Domain Warning Logic is Too Permissive
**Location:** `src/pages/onboarding/OrgSetupPage.tsx:64-68`  
**Description:** Using `includes()` means "yahoo.com.uk" triggers for "yahoo.com", but "attacker-gmail.com" also triggers. Should use exact match or suffix match.

**Recommended Fix:**
```typescript
const isPublic = PUBLIC_DOMAINS.some((pd) =>
  domainValue.toLowerCase() === pd || 
  domainValue.toLowerCase().endsWith('.' + pd)
);
```

---

### HIGH-006: Seed Data bcrypt Hash is Invalid
**Location:** `supabase/seed.sql:51`  
**Description:** The bcrypt hash `$2a$10$PznXcXqCJqMcmyN5y9PYxeJ.Rjt2vTGH/BwMZqTn1eKBTqTqTqTqT` appears invalid (repeated characters at end). Users won't be able to log in with demo credentials.

**Recommended Fix:** Generate actual bcrypt hashes:
```bash
node -e "console.log(require('bcryptjs').hashSync('demo_password_123', 10))"
```

---

### HIGH-007: Anchor Insert Policy May Fail for New ORG_ADMIN
**Location:** `supabase/migrations/0010_rls_anchors.sql:30-37`  
**Description:** The INSERT policy checks `org_id = get_user_org_id()` but `get_user_org_id()` queries profiles. If the profile hasn't been updated yet (race), insert fails.

**Impact:** Timing-dependent failures on anchor creation.

**Recommended Fix:** Add COALESCE or explicit NULL handling.

---

### HIGH-008: Database Types Out of Sync
**Location:** `src/types/database.types.ts`  
**Description:** The types don't include `onboarding_completed_at` mentioned in the function, suggesting types may be stale. CI should validate types match schema.

**Recommended Fix:** Run `npm run gen:types` and verify CI enforces this.

---

## 3. Medium Priority Issues (Backlog Items)

### MED-001: No Error Recovery in AuthForm
**Location:** `src/components/auth/AuthForm.tsx:68-70`  
**Description:** After signup success, if user navigates back and tries again, there's no clear indication of existing account.

---

### MED-002: Optimistic Update in useProfile Doesn't Handle Concurrent Updates
**Location:** `src/hooks/useProfile.ts:82-105`  
**Description:** If realtime subscription fires while optimistic update is pending, state can become inconsistent.

---

### MED-003: No Loading State for Org Fetch in OrgDashboardPage
**Location:** `src/pages/org/OrgDashboardPage.tsx:124-141`  
**Description:** `org` starts as null, so OrgInfoCard renders nothing initially. Should show skeleton.

---

### MED-004: Audit Events SELECT Policy is Too Restrictive
**Location:** `supabase/migrations/0011_rls_audit_events.sql:10-13`  
**Description:** Users can only see events where `actor_id = auth.uid()`. Org admins cannot see events from org members.

---

### MED-005: No Rate Limiting on Auth Attempts
**Location:** `src/components/auth/AuthForm.tsx`  
**Description:** Supabase has built-in rate limiting but client-side feedback is missing. Users hammering login get generic errors.

---

### MED-006: Hash Routing Leaks State on OAuth Callback
**Location:** `src/main.tsx:47`  
**Description:** `/auth/callback` maps to `AuthPage`. OAuth returns with query params that may interfere with hash routing.

---

### MED-007: RLS Test Assumes Supabase Running
**Location:** `tests/rls/rls.test.ts`  
**Description:** Tests silently pass when Supabase isn't running. Should be clear skip or fail.

---

### MED-008: No Graceful Degradation for Missing Env Vars
**Location:** `src/lib/supabase.ts:12-15`  
**Description:** Warning is logged but app continues with placeholder values. Should show user-facing error.

---

### MED-009: DashboardLayout Hardcodes Route Prefixes
**Location:** `src/components/layout/DashboardLayout.tsx:33-50`  
**Description:** `roles` check uses hardcoded route filtering. Adding new roles requires updating multiple places.

---

### MED-010: No Confirmation on Sign Out
**Location:** `src/components/layout/DashboardLayout.tsx:71-74`  
**Description:** Sign out is immediate. Accidental clicks lose unsaved state.

---

### MED-011: Database Constraint for anchors_org_required Not Complete
**Location:** `supabase/migrations/0003_profiles.sql:38-40`  
**Description:** Constraint allows ORG_ADMIN with NULL org_id until onboarding completes. But route guards assume org_id is set for ORG_ADMIN.

---

### MED-012: Trigger Order Dependency
**Location:** Multiple migration files  
**Description:** `protect_privileged_fields` trigger runs before `enforce_role_immutability`. Order matters but isn't explicitly controlled.

---

## 4. Low Priority Suggestions (Nice to Have)

### LOW-001: Add aria-labels for Icon Buttons
**Location:** `src/components/layout/DashboardLayout.tsx:100, 154`  
**Description:** Menu and close buttons only have icons. Screen readers won't announce purpose.

---

### LOW-002: Use Semantic HTML for Nav
**Location:** `src/components/layout/DashboardLayout.tsx:93-108`  
**Description:** Navigation uses `<a>` tags wrapped in `<nav>`, but could benefit from `<ul><li>` structure.

---

### LOW-003: Add Test IDs for E2E Tests
**Location:** Various components  
**Description:** E2E tests rely on text content which is fragile. Add `data-testid` attributes.

---

### LOW-004: Consolidate Redirect Logic
**Location:** `src/components/auth/RouteGuard.tsx`, `src/components/auth/AuthProvider.tsx`  
**Description:** Redirect logic is duplicated. Could be single source of truth.

---

### LOW-005: Add Suspense Boundaries
**Location:** `src/main.tsx`  
**Description:** No code splitting or suspense. As app grows, initial bundle will be large.

---

### LOW-006: Consider React Query or SWR
**Description:** Manual cache management in hooks. Dedicated data-fetching library would reduce complexity.

---

### LOW-007: Add Error Boundaries Per Route
**Location:** `src/main.tsx:102-107`  
**Description:** Single ErrorBoundary at root. Error in one page crashes all.

---

### LOW-008: Normalize CSS Loading
**Location:** `src/main.tsx:6`  
**Description:** `index.css` is imported but not visible in file list. Verify it exists.

---

### LOW-009: Add Focus Trap in Mobile Sidebar
**Location:** `src/components/layout/DashboardLayout.tsx:83-115`  
**Description:** When mobile sidebar is open, focus can escape to background elements.

---

### LOW-010: useHashRouter Creates Unnecessary Rerenders
**Location:** `src/main.tsx:32-44`  
**Description:** New string created on every hash change triggers rerender. Use ref for comparison.

---

### LOW-011: Validators Don't Match DB Exactly
**Location:** `src/lib/validators.ts:19-20`  
**Description:** CONTROL_CHARS_REGEX uses `\x7F` but DB constraint uses `[\x00-\x1F\x7F]`. Verify parity.

---

### LOW-012: Add Descriptive aria-live for Toast/Error Messages
**Location:** `src/components/auth/AuthForm.tsx:132-134`  
**Description:** Error div should have `role="alert"` for screen reader announcement.

---

### LOW-013: Consistent Date Formatting
**Location:** `src/pages/vault/VaultPage.tsx:147`, `src/pages/org/OrgDashboardPage.tsx:148`  
**Description:** Using `toLocaleDateString()` without locale parameter. Results vary by browser.

---

### LOW-014: Add Storybook or Component Documentation
**Description:** No component documentation. Adding Storybook would help design consistency.

---

### LOW-015: Consider Using Enums in TypeScript
**Location:** Throughout  
**Description:** String literals used for roles/statuses. TypeScript enums would add type safety.

---

## 5. Performance Recommendations

### PERF-001: N+1 Query Risk in OrgDashboardPage
**Location:** `src/pages/org/OrgDashboardPage.tsx`  
**Description:** Fetches org and anchors separately. Could be combined or use join.

---

### PERF-002: Realtime Subscription Per User
**Location:** `src/hooks/useProfile.ts`  
**Description:** Each authenticated user creates a WebSocket subscription. Consider connection pooling for large scale.

---

### PERF-003: No Pagination on Anchor Lists
**Location:** `src/pages/vault/VaultPage.tsx`, `src/pages/org/OrgDashboardPage.tsx`  
**Description:** Fetches all anchors at once. Add limit/offset or cursor pagination.

---

### PERF-004: Missing Indexes on Common Queries
**Location:** Migrations  
**Description:** Common query `anchors WHERE user_id = X AND deleted_at IS NULL` should have composite index.

**Recommended Fix:**
```sql
CREATE INDEX idx_anchors_user_active ON anchors(user_id) WHERE deleted_at IS NULL;
```

---

### PERF-005: Bundle Size Not Optimized
**Location:** `package.json`  
**Description:** No tree-shaking configuration visible. Lucide-react imports could be optimized.

**Recommended Fix:**
```typescript
// Instead of:
import { FileText, Plus, Shield } from 'lucide-react';
// Use individual imports:
import FileText from 'lucide-react/dist/esm/icons/file-text';
```

---

## 6. Security Findings

### SEC-001: JWT Role Check in Trigger Uses current_setting
**Location:** `supabase/migrations/0008_rls_profiles.sql:44-47`  
**Description:** `current_setting('request.jwt.claims', true)` returns NULL if not set, not an error. Ensure NULL handling.

**Impact:** Low - the check handles NULL correctly but should be explicit.

---

### SEC-002: No Content-Security-Policy Headers
**Description:** Missing CSP headers in deployment. Add via Supabase hosting config.

---

### SEC-003: Supabase Anon Key in Client Code
**Location:** `src/lib/supabase.ts`  
**Description:** Anon key is designed to be public but should still be rotated periodically.

---

### SEC-004: OAuth Redirect Not Validated
**Location:** `src/components/auth/AuthForm.tsx:95`  
**Description:** `redirectTo` uses `window.location.origin` but doesn't validate the callback URL.

**Impact:** Low - Supabase validates server-side.

---

### SEC-005: No CSRF Protection on Forms
**Description:** Forms use state-changing mutations. Supabase auth includes CSRF tokens but verify all mutations are protected.

---

### SEC-006: Error Messages May Leak Info
**Location:** `src/pages/onboarding/RoleSelectionPage.tsx:68`  
**Description:** `console.error('Role selection error:', err)` in production could expose stack traces.

**Recommended Fix:** Use proper error logging service in production.

---

## 7. Suggested Backlog Items

### BACKLOG-001: Add Profile Creation Auth Trigger
**Priority:** P1  
**Description:** Create Supabase auth trigger to automatically create profile on user signup.

---

### BACKLOG-002: Implement Password Reset Flow
**Priority:** P2  
**Description:** Auth flow exists but no forgot password UI.

---

### BACKLOG-003: Add Email Verification Reminder
**Priority:** P2  
**Description:** Users with unverified emails can't sign in. Need clear messaging.

---

### BACKLOG-004: Add Admin Panel for Manual Review
**Priority:** P2  
**Description:** No UI for admins to approve orgs flagged for manual review.

---

### BACKLOG-005: Add Anchor Detail View
**Priority:** P3  
**Description:** Clicking anchor shows no details. Need detail modal/page.

---

### BACKLOG-006: Add File Size Limits to UI
**Priority:** P3  
**Description:** No client-side validation of file sizes before anchor creation.

---

### BACKLOG-007: Add Accessibility Audit
**Priority:** P3  
**Description:** Run axe-core or Lighthouse accessibility audit.

---

### BACKLOG-008: Add Dark Mode Support
**Priority:** P4  
**Description:** Tailwind config supports dark mode but no toggle.

---

### BACKLOG-009: Add i18n/l10n Framework
**Priority:** P4  
**Description:** All strings are hardcoded in English.

---

### BACKLOG-010: Add Telemetry/Analytics
**Priority:** P4  
**Description:** No usage tracking for product insights.

---

### BACKLOG-011: Add Service Health Checks
**Priority:** P2  
**Description:** No health check endpoint or status page.

---

### BACKLOG-012: Add CI Schema Validation
**Priority:** P1  
**Description:** Ensure database.types.ts matches actual schema in CI.

---

### BACKLOG-013: Add Integration Tests for Onboarding Flow
**Priority:** P2  
**Description:** E2E tests don't actually complete the flow with auth.

---

### BACKLOG-014: Add Anchor Deduplication Warning
**Priority:** P3  
**Description:** If user tries to anchor same fingerprint twice, show clear message.

---

### BACKLOG-015: Document Public API Contracts
**Priority:** P2  
**Description:** No OpenAPI/Swagger spec for RPC functions.

---

## Test Coverage Summary

| Area | Unit Tests | RLS Tests | E2E Tests |
|------|------------|-----------|-----------|
| Validators | ✅ Good | N/A | N/A |
| Auth Flow | ❌ None | ✅ Partial | ✅ Partial |
| Onboarding | ❌ None | ❌ None | ✅ UI Only |
| Vault | ❌ None | ✅ Basic | ✅ UI Only |
| RLS Policies | N/A | ✅ Good | N/A |
| Error Handling | ❌ None | ❌ None | ❌ None |

**Recommendation:** Add unit tests for hooks and critical business logic.

---

## Summary

The codebase is well-structured with thoughtful security measures. The **critical issues around the onboarding function** must be fixed immediately as they will cause runtime errors. The RLS policies are comprehensive but need the missing INSERT policy for profiles.

After addressing critical and high-priority items, the platform should be stable for beta testing. Medium and low priority items can be addressed incrementally.

---

*Generated by Ralph, QA Specialist*  
*Report version: 1.0*
