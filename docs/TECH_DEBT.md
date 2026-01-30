# Technical Debt - P2/P3 Review

*Generated: 2026-01-30*

## Critical (Must Fix Before P4)

### 1. ~~lint:copy False Positive on Tailwind Classes~~ ✅ FIXED
**Priority:** HIGH  
**Impact:** CI would fail incorrectly  
**Location:** `scripts/check-copy-terms.ts`

~~The `\bblock\b` regex matches Tailwind classes like `sm:block`, `lg:block`, `hidden` → `block`. The colon acts as a word boundary.~~

**Fixed:** Added `isTailwindContext()` function to detect and ignore Tailwind CSS class patterns.

---

### 2. ~~RLS Tests Are Placeholders~~ ✅ FIXED
**Priority:** HIGH  
**Impact:** No actual coverage of RLS policies  
**Location:** `tests/rls/rls.test.ts`

~~All 26 RLS tests use `expect(true).toBe(true)` - they pass but test nothing.~~

**Fixed:** Implemented 17 real RLS tests that:
- Sign in as seeded users
- Attempt privileged field updates (role, org_id, requires_manual_review)
- Verify they fail with correct error codes
- Test organization isolation and anchor access
- Gracefully skip when Supabase not available

---

## Medium (Should Fix Soon)

### 3. ~~No E2E/Playwright Tests~~ ✅ FIXED
**Priority:** MEDIUM  
**Impact:** DoD mentions Playwright coverage, none exists  
**Location:** `e2e/` directory

~~Stories P2-S1, P2-S2 mention "Playwright covers each route path" but no Playwright config or tests exist.~~

**Fixed:**
- Added Playwright config and `e2e/` directory
- Auth smoke tests: form display, mode switching, validation
- Route guard tests: unauthenticated redirect
- Copy compliance tests: no forbidden terms
- Scripts: `npm run test:e2e` and `npm run test:e2e:ui`

---

### 4. ~~Profile State Not Synced After Mutations~~ ✅ FIXED
**Priority:** MEDIUM  
**Impact:** UI can show stale data  
**Location:** `src/pages/vault/VaultPage.tsx`, `src/hooks/useProfile.ts`

~~When `is_public` is toggled, only local state updates. The AuthProvider's profile doesn't know about the change.~~

**Fixed:**
- Added Supabase realtime subscription to useProfile for live updates
- Added `updateProfile()` helper with optimistic updates and rollback
- VaultPage now uses context's updateProfile instead of direct supabase calls

---

## Low (Nice to Have)

### 5. ~~Missing Affiliations Nav Link~~ ✅ FIXED
**Priority:** LOW  
**Impact:** Feature is unreachable via navigation  
**Location:** `src/components/layout/DashboardLayout.tsx`

~~INDIVIDUAL users can't navigate to `/affiliations` from the sidebar - no nav item exists.~~

**Fixed:** Added Affiliations nav item for INDIVIDUAL role users.

---

### 6. ~~No React Error Boundaries~~ ✅ FIXED
**Priority:** LOW  
**Impact:** Unhandled errors crash entire app  
**Location:** `src/main.tsx`

~~No error boundaries to catch and display errors gracefully.~~

**Fixed:** Added `ErrorBoundary` component with:
- Graceful error UI with retry/reload options
- Development mode shows error details
- Wraps entire App in main.tsx

---

### 7. Hardcoded Redirect URLs
**Priority:** LOW  
**Impact:** Won't work if deployed to different domain  
**Location:** `src/components/auth/AuthForm.tsx:104`

Google OAuth redirectTo uses `window.location.origin` which is fine, but the callback URL in Supabase config must match.

**Note:** Document this in deployment guide.

---

## Accepted Decisions (Not Debt)

- **Hash-based routing:** Intentional for simplicity, works well for SPA
- **No SSR:** React SPA is correct for this use case
- **Placeholder pages:** Settings, Help are stubs by design (future priorities)
- **No loading skeletons:** Simple spinners are adequate for MVP

---

## Action Plan

1. ✅ Document tech debt (this file)
2. ✅ Fix lint:copy false positive (added Tailwind context detection)
3. ✅ Implement real RLS tests (17 tests for P2-S4 compliance - run with Supabase)
4. ✅ Add Affiliations nav link
5. ✅ Playwright setup with auth smoke tests

---

## Fixed (2026-01-30)

- **lint:copy**: Added `isTailwindContext()` function to ignore CSS class contexts
- **RLS tests**: Replaced placeholders with real tests that verify P2-S4 requirements
  - Tests run against local Supabase when available
  - Gracefully skip when Supabase not running (CI-friendly)
- **Nav**: Added Affiliations link for INDIVIDUAL users in sidebar
- **Profile sync**: Added realtime subscription + optimistic update helper
  - useProfile now subscribes to postgres_changes
  - updateProfile() handles optimistic UI with automatic rollback
  - VaultPage uses context instead of direct supabase calls
- **Error boundaries**: Added ErrorBoundary component
  - Catches unhandled errors, shows friendly UI
  - Try Again / Reload options
  - Dev mode shows error details
- **Playwright E2E**: Added Playwright test infrastructure
  - `e2e/auth.spec.ts` with auth form and route guard tests
  - Copy compliance tests for forbidden terms
  - `npm run test:e2e` / `npm run test:e2e:ui` scripts
