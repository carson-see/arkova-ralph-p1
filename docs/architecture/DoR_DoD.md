### **Definition of Ready for Priorities 1-6 (Updated)**

*(Copy this into docs/architecture/dor_priorities_1_to_6.md)*

**PRIORITY 3 --- Definition of Ready (Individual Vault)**

**A) Data + Security Preconditions (PASS/FAIL)**

-   PASS if profiles exists and has required fields: id, email, role,
    > is_public, org_id, requires_manual_review, role_set_at,
    > onboarding_completed_at, created_at, updated_at

-   PASS if RLS is enabled on profiles and:

    -   User can SELECT their own profile

    -   User can UPDATE only is_public

    -   User cannot UPDATE privileged fields: role, org_id,
        > requires_manual_review, manual_review_reason, role_set_at,
        > onboarding_completed_at

-   PASS if role immutability is enforced at DB level (NULL → role
    > allowed once; any change rejected)

**B) Frontend Contract Preconditions (PASS/FAIL)**

-   PASS if src/types/database.types.ts is generated from Supabase and
    > committed

-   PASS if CI fails on types drift (regenerate types produces no diff)

-   PASS if src/lib/copy.ts exists and lint:copy passes (no banned
    > terms)

**C) Routing Preconditions (PASS/FAIL)**

-   PASS if route guard truth table exists:

    -   unauth → /auth

    -   role null → /onboarding/role

    -   INDIVIDUAL → /vault

    -   ORG_ADMIN → /org (or onboarding/org if incomplete)

    -   flagged manual review → /org/pending-review

-   PASS if direct URL access can't bypass guard

**D) Seed + Click-through (PASS/FAIL)**

-   **PASS if supabase/seed.sql (established in P1-S2) already
    > creates:**

    -   1 INDIVIDUAL user profile with is_public=false

    -   1 INDIVIDUAL user profile with is_public=true (or a toggle path)

-   PASS if a reviewer can click through auth → vault page using these
    > seeded users.

**E) Test Gate (PASS/FAIL)**

-   PASS if RLS regression tests (using src/tests/rls/helpers.ts) run in
    > CI.

-   PASS if at least one E2E test exists for "login → vault route"

-   *If ALL PASS → Priority 3 is Ready.*

**PRIORITY 4 --- Definition of Ready (Anchor Engine)**

**A) Data + Constraints Preconditions (PASS/FAIL)**

-   PASS if anchors table exists with:

    -   fingerprint constraint (64 hex)

    -   filename bounds (\<=255)

    -   timestamptz timestamps

    -   status enum with at least PENDING/SECURED/REVOKED

-   PASS if schema explicitly has no file storage columns (no raw file
    > bytes, no blob column)

**B) RLS + State Machine Preconditions (PASS/FAIL)**

-   PASS if anchors RLS enforces:

    -   INSERT only for user_id = auth.uid()

    -   INSERT only with status = PENDING (cannot insert
        > SECURED/REVOKED)

    -   SELECT only own anchors (or org scope rules if present)

-   PASS if cross-user insert/select is blocked (tests prove it)

**C) Frontend Contract Preconditions (PASS/FAIL)**

-   PASS if AnchorCreateSchema exists and rejects: user_id, org_id,
    > status

-   PASS if file fingerprint is computed client-side via Web Crypto
    > (planned utility exists)

**D) Seed + Click-through (PASS/FAIL)**

-   PASS if seed includes at least:

    -   1 anchor record for an INDIVIDUAL user (to visit detail view)

-   PASS if app can load anchor list/detail without mocked objects

**E) Test Gate (PASS/FAIL)**

-   PASS if an E2E test exists proving "no file upload":

    -   Network assertions show no request payload contains file bytes

-   PASS if RLS tests cover forbidden inserts (SECURED/REVOKED, other
    > user_id)

-   *If ALL PASS → Priority 4 is Ready.*

**PRIORITY 5 --- Definition of Ready (Organization Admin)**

**A) Identity + Org Preconditions (PASS/FAIL)**

-   PASS if ORG_ADMIN onboarding reliably creates:

    -   organizations row

    -   profiles.org_id link

-   PASS if manual review gating is enforced:

    -   flagged ORG_ADMIN is blocked from /org routes

**B) Tenant Isolation Preconditions (PASS/FAIL)**

-   PASS if organizations and org-scoped data access is enforced via
    > RLS:

    -   org admin can only read their org

    -   org admin can only read anchors where anchors.org_id matches
        > their org

-   PASS if profile fields org_id/manual flags are not client-writable
    > (DB enforced)

**C) Admin Action Preconditions (PASS/FAIL)**

-   PASS if anchor status transitions are controlled:

    -   REVOKE is permitted only for authorized org admin

    -   Revoke cannot be reversed

    -   Revoke cannot target another org's anchor

-   PASS if audit logging strategy is in place for privileged actions:

    -   audit_events exists and is append-only

    -   logging hook point is explicitly defined

**D) Seed + Scale Preconditions (PASS/FAIL)**

-   PASS if seed contains:

    -   1 ORG_ADMIN user with org_id

    -   = 100 anchors with org_id for basic pagination testing (ideally
        > \>=1000)

-   PASS if seed supports "other org exists" to test isolation

**E) Test Gate (PASS/FAIL)**

-   PASS if E2E exists:

    -   ORG_ADMIN can access registry

    -   flagged manual review user cannot access /org

-   PASS if RLS/integration tests prove:

    -   cross-org data access fails

    -   cross-org revoke fails

-   *If ALL PASS → Priority 5 is Ready.*

**PRIORITY 6 --- Definition of Ready (Bulk Verification Wizard)**

**A) Data Model Preconditions (PASS/FAIL)**

-   PASS if the "badges / verifications" schema is finalized with:

    -   unique constraint enabling idempotency (so reruns do not
        > duplicate)

    -   org scoping fields (issued_by_org_id or equivalent)

    -   timestamptz timestamps (UTC semantics)

-   PASS if RLS/authorization model for badge writes is explicit and
    > tested

**B) Execution Path Preconditions (PASS/FAIL)**

-   **PASS if the execution path is standardized on the Node.js Service
    > (or DB Function if lightweight):**

    -   Must verify which path handles parsing to ensure no timeout
        > risks.

-   PASS if abuse controls exist for batch execution:

    -   rate limiting strategy

    -   logging/audit event strategy for batch runs

**C) UI Preconditions (PASS/FAIL)**

-   PASS if CSV parsing library choice is locked (papaparse)

-   PASS if mapping requirements are locked (required fields list and
    > validations)

**D) Safety Preconditions (PASS/FAIL)**

-   PASS if user lookup by email does not create enumeration risk:

    -   errors and responses are non-enumerating

    -   access is org-scoped and rate limited

**E) Test Gate (PASS/FAIL)**

-   PASS if integration tests exist for:

    -   rerun same input → no duplicates (idempotency)

    -   cross-tenant attempt → fails

    -   partial failure behavior is deterministic and documented

-   *If ALL PASS → Priority 6 is Ready.*

**GLOBAL "STOP THE LINE" CONDITIONS** *(Never proceed if any are true)*

-   CI is not green (typecheck/lint/tests)

-   RLS policies missing on any new table

-   Any endpoint/mutation allows setting privileged fields from client

-   Seed click-through is broken

-   Copy lint fails (banned terminology appears)

-   Migration has no rollback/compensating plan

-   agents.md exists in touched folder and wasn't reviewed/updated when
    > needed

**NEXT STEPS**

1.  Add a "DoR Checklist" section to the Confluence doc for each
    > priority (copy/paste these gates).

2.  Add CI steps if missing:

    -   lint:copy

    -   gen:types drift check

    -   secret scanning + dependency scanning

    -   RLS regression test suite

3.  Lock Priority 3 start when Priority 2 gate passes.
