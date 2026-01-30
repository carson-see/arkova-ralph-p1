The word-for-word reconstruction of the Backlog and Constitution is
below. It integrates the critical adjustments (Locked Runtime, Seed Data
moved to P1-S2, Mocking Standards) directly into the text without
shortening the original detail.

You can copy the entire block below into BACKLOG.md or a Google Doc.

# **ARKOVA MASTER BACKLOG & CONSTITUTION**

## **GLOBAL TECHNICAL DIRECTIVES (THE CONSTITUTION)**

**Applies to:** all priorities, all repos, all environments.

**Rule:** If any story conflicts with the Constitution, the Constitution
wins.

### **1) TECH STACK (LOCKED)**

-   React + TypeScript

-   Tailwind CSS

-   Shadcn/ui

-   Lucide React

-   Supabase (Postgres + Auth)

-   Zod (validation)

-   **Recommended additions for Priority 7+ (only when needed):**

    -   Stripe (payments + billing portal)

    -   **Runtime (LOCKED):** A dedicated Node.js service (located in
        > services/worker) for webhooks + anchoring worker.

    -   **Constraint:** Do NOT use Next.js API routes for long-running
        > jobs.

### **2) SCHEMA-FIRST BUILD RULE (NON-NEGOTIABLE)**

-   Define DB schema + enums + constraints + RLS before building any UI
    > that depends on them.

-   Generate src/types/database.types.ts from Supabase and treat it as
    > the UI contract. No mocked data objects once a table exists.

-   Any schema change requires:

    -   migration + rollback/compensating plan.

    -   regenerated database.types.ts.

    -   updated docs/confluence pages.

    -   updated seed data (click-through must still work).

### **3) STRICT TERMINOLOGY (UI COPY ONLY)**

-   **UI must reject the following terms:** Wallet, Gas, Hash, Block,
    > Transaction, Crypto.

-   **UI must use the following terms instead:** Vault, Anchor,
    > Fingerprint, Record, Secure, Verify.

-   **Priority 7 terminology extensions (required for billing + chain
    > ops UI):**

    -   \"Wallet\" concepts MUST be rendered as: Fee Account, Billing
        > Account, or Network Fees Account.

    -   \"Transaction\" concepts MUST be rendered as: Network Receipt,
        > Anchor Receipt, or Proof Receipt.

    -   \"Testnet/Mainnet\" MUST be rendered as: Test Environment /
        > Production Network.

    -   \"Broadcast\" MUST be rendered as: Publish Anchor.

    -   \"UTXO\" MUST NOT appear in UI (internal only).

-   **Notes:**

    -   Internal code/DB may use technical names (e.g.,
        > file_fingerprint_sha256, txid), but UI must render approved
        > terms.

    -   All user-visible copy must be sourced from: src/lib/copy.ts.

    -   Add a CI check that fails PRs when banned terms appear in UI
        > copy.

### **4) SECURITY STANDARD (MANDATORY)**

-   **Baseline security posture:**

    -   RLS is mandatory on all tables.

    -   Tenant isolation must be enforced via DB policies (not just app
        > code).

-   **Least privilege by default:**

    -   revoke public grants on all tables/sequences/functions unless
        > explicitly required.

    -   no direct writes to privileged fields from client.

-   **Prevent privilege escalation via DB-level constraints:**

    -   role immutability (write-once).

    -   org linkage protected (cannot be set arbitrarily by the client).

    -   status transitions controlled by DB constraints/policies (no
        > client-trust).

-   **Sensitive actions must be auditable:**

    -   audit_events (append-only) required for privileged actions.

    -   later expansion is fine, but the hook points must exist now.

-   **Secrets handling (hard rules):**

    -   No service role keys committed.

    -   .env must be gitignored.

    -   CI must block secrets (secret scanning required).

    -   Never expose Supabase service role to the browser.

-   **Backend Functions:**

    -   Any backend function needing elevated privileges must run
        > server-side with strict authorization checks.

    -   No SECURITY DEFINER functions in Priority 1.

    -   In later priorities, SECURITY DEFINER is allowed only if
        > explicitly reviewed and approved. If introduced:

        -   must include SET search_path = public hardening.

        -   must use a dedicated DB role.

        -   must have explicit RLS-aligned authorization checks.

        -   must have tests proving no cross-tenant access.

-   **Key management + chain operations (Priority 7+):**

    -   Arkova is non-custodial:

        -   we do not custody or move user-owned BTC/ordinals.

        -   no user deposits/withdrawals/spend flows.

        -   no user private keys, seed phrases, or signing material tied
            > to user assets are ever stored.

    -   Network fee signing keys (Arkova treasury) must:

        -   never be accessible in client code.

        -   be stored in a server secret manager (or equivalent) and
            > rotated.

        -   be used only by the anchoring worker/runtime.

        -   have strict access controls and audited usage.

    -   Webhook signing secrets must:

        -   be stored server-side only.

        -   support rotation.

        -   never be logged.

### **5) PAYMENTS + WEBHOOKS RELIABILITY STANDARD (PRIORITY 7+)**

-   **Payments (Stripe):**

    -   All inbound Stripe webhooks must be:

        -   signature verified.

        -   idempotent (event_id stored and deduplicated).

        -   processed with a clear state machine for entitlements.

    -   Entitlements are enforced server-side:

        -   UI gating is not sufficient.

        -   any privileged action must check entitlement state in
            > DB/server logic.

-   **Outbound webhooks (Arkova → customer):**

    -   All outbound webhooks must be:

        -   signed (shared secret or asymmetric scheme).

        -   retried with exponential backoff.

        -   recorded in a delivery log with status + timestamps.

    -   Provide a replay mechanism for failed deliveries (admin-only).

    -   Webhooks must not leak sensitive data: minimal payload, stable
        > identifiers, no raw file content .

-   **Anchor processing pipeline:**

    -   Anchoring must be job-based (queue + worker):

        -   create anchor in DB (PENDING).

        -   worker publishes anchor (test env → prod network).

        -   update anchor to SECURED with proof metadata.

    -   Job execution must be:

        -   idempotent (same anchor job can rerun safely).

        -   retryable with bounded retries.

        -   dead-lettered or failure-marked after exhaustion.

    -   Worker must handle:

        -   transient network failures.

        -   duplicate broadcasts.

        -   confirmation lag.

        -   reorg-safe updates (avoid \"finality\" claims until policy
            > says so).

### **6) UTC TIME + EVIDENCE SEMANTICS**

-   All server-side timestamps are Postgres timestamptz and treated as
    > UTC.

-   Documented evidence timestamps must include UTC explicitly.

-   Bitcoin timestamps are not treated as eIDAS qualified timestamps. If
    > displayed, label as \"Network Observed Time\" .

-   Any \"proof package\" export must clearly state: what is measured,
    > what is asserted, what is not asserted .

### **7) TASK SIZING RULE**

-   Each task must be completable in one round.

-   Every task must have a pass/fail \"Done when\" check.

-   No task may require unstated product decisions.

-   No large \"umbrella tasks\" that hide multiple deliverables.

### **8) QUALITY GATES (REPO MUST STAY GREEN)**

-   Every task must keep the repo passing: typecheck, lint, tests .

-   Maintain seed data so the app can be clicked through after each
    > milestone.

-   Add dependency scanning (SCA) and secret scanning in CI.

-   Add a copy lint gate in CI to enforce banned/required terminology.

-   Add a migration rollback policy: every migration is reversible OR
    > has a documented compensating migration .

-   **Testing Requirements:**

    -   **RLS Tests:** MUST use the shared src/tests/rls/helpers.ts
        > utility (implement withUser/withAuth).

    -   **External Mocks:** Tests must NOT call real Stripe/Chain APIs.
        > Use IPaymentProvider and IAnchorPublisher interfaces.

### **9) DOCUMENTATION STANDARD (CONFLUENCE-READY)**

-   Technical documentation must be written in Markdown that can be
    > pasted into Confluence with minimal edits.

-   Any task that changes schema/security/contracts must update the
    > relevant docs/confluence page in the same PR.

-   **Required Confluence pages:**

    -   docs/confluence/01_architecture_overview.md

    -   docs/confluence/02_data_model.md

    -   docs/confluence/03_security_rls.md

    -   docs/confluence/04_audit_events.md

    -   docs/confluence/05_retention_legal_hold.md

    -   docs/confluence/06_on_chain_policy.md

    -   docs/confluence/07_seed_clickthrough.md

    -   *(Priority 7+)* 08_payments_entitlements.md, 09_webhooks.md,
        > 10_anchoring_worker.md, 11_proof_packages.md .

### **10) AGENT NOTES DIRECTIVE (agents.md)**

-   If any folder you edit contains an agents.md file, read it first.

-   If you learn something important, update that folder\'s agents.md:
    > what changed, why it matters, do/don\'t rules, links to docs .

### **11) FILE PLACEMENT MAP (WHERE TO PUT FILES)**

-   **Frontend:**

    -   App code: src/

    -   Shadcn UI components: src/components/ui/

    -   App components: src/components/

    -   Generated DB types: src/types/database.types.ts

    -   Central UI copy: src/lib/copy.ts

    -   Validators: src/lib/validators.ts

    -   Tests: src/tests/

-   **Supabase:**

    -   Config: supabase/config.toml

    -   Migrations: supabase/migrations/

    -   Seed: supabase/seed.sql

-   **Scripts:**

    -   Copy lint: scripts/check-copy-terms.ts

-   **Backend Runtime (Priority 7+):**

    -   **Worker/Webhooks:** services/worker/ (Dedicated Node.js
        > Service).

## **PRIORITY 1 - The Bedrock (Schema + Constraints + RLS + Types + Seed + Docs)**

**EPIC P1-E1: Data Architecture & Security Policies**

*Epic Description:* Priority 1 establishes the non-negotiable foundation
of Arkova\'s product: the database contract, security boundaries, and
evidence primitives that every UI and workflow will rely on. The goal is
to prevent \"poisoning the product\" by ensuring we do not ship a UI
shell without a durable, secure, and compliance-aware backend.

> +1

**Story P1-S1: Developer Experience & Test Harness (NEW - REQUIRED
FIRST)**

-   **Description:** Implementation of the copy-linter and RLS test
    > helpers to prevent future stories from stalling.

-   **Acceptance Criteria:**

    -   scripts/check-copy-terms.ts exists and fails on terms: Wallet,
        > Gas, Transaction.

    -   src/tests/rls/helpers.ts exists, exporting withUser(email, role)
        > to wrap DB calls in auth context.

-   **Definition of Done:**

    -   Lint script runs in CI.

    -   Test helpers are usable in subsequent stories.

-   **Tasks:**

    -   (DevEx) Add scripts/check-copy-terms.ts (Simple allow/block
        > list).

    -   (DevEx) Create src/tests/rls/helpers.ts.

    -   \(CI\) Add lint:copy step to ci.yml.

**Story P1-S2: Seed Data Core (MOVED UP FROM S16)**

-   **Description:** Create the initial supabase/seed.sql to support
    > click-throughs and tests in subsequent stories .

-   **Acceptance Criteria:**

    -   Seed creates: 1 Admin Org, 1 Individual User, 1 Org Admin User.

    -   supabase db reset applies seed successfully.

-   **Definition of Done:**

    -   supabase db reset loads seed.

    -   Seed documented.

-   **Tasks:**

    -   (BE) Create supabase/seed.sql.

    -   (Docs) Create docs/confluence/07_seed_clickthrough.md.

**Story P1-S3: Create enum types (BE)**

-   **Description:** Create the canonical DB enums for role and anchor
    > state so schema and UI contract are stable and typed.

-   **Acceptance Criteria:**

    -   Enum user_role exists with: INDIVIDUAL, ORG_ADMIN.

    -   Enum anchor_status exists with: PENDING, SECURED, REVOKED.

    -   Tables can reference enums; invalid values are rejected.

-   **Definition of Done:**

    -   Migration applies cleanly via supabase db reset.

    -   Rollback documented.

    -   docs/confluence/02_data_model.md updated with enum meanings.

-   **Tasks:**

    -   (BE) Add migration 0001_enums.sql.

    -   (BE) Add rollback notes.

    -   (Docs) Update docs/confluence/02_data_model.md.

**Story P1-S4: Create organizations table (BE)**

-   **Description:** Create org entity used for org admins and later
    > org-level registries.

-   **Acceptance Criteria:**

    -   Table organizations created with: id (uuid pk), legal_name (text
        > not null), display_name (text not null), domain (text null),
        > verification_status (text not null default \'UNVERIFIED\'),
        > created_at, updated_at .

    -   Index exists on domain and created_at.

    -   updated_at auto-updates on row update.

-   **Definition of Done:**

    -   Migration applies via db reset.

    -   Schema verified in Supabase.

    -   Docs updated.

-   **Tasks:**

    -   (BE) Migration 0002_organizations.sql.

    -   (BE) Add updated_at trigger.

    -   (Docs) Update docs/confluence/02_data_model.md.

    -   (BE) Update seed.sql.

**Story P1-S5: Create profiles table linked to Supabase Auth (BE)**

-   **Description:** Create auth-linked profile table that stores role,
    > org membership, and onboarding state.

-   **Acceptance Criteria:**

    -   Table profiles created with: id (uuid pk references auth.users),
        > email (text not null normalized), role (user_role null),
        > is_public (bool default false), org_id (references
        > organizations), requires_manual_review (bool),
        > manual_review_reason, role_set_at, onboarding_completed_at .

    -   Email normalization enforced (DB or trigger).

-   **Definition of Done:**

    -   Migration applies via db reset.

    -   updated_at works.

    -   Docs updated.

-   **Tasks:**

    -   (BE) Migration 0003_profiles.sql.

    -   (BE) Add normalization rule.

    -   (Docs) Update docs/confluence/02_data_model.md.

    -   (BE) Update seed.sql.

**Story P1-S6: Create anchors table (fingerprint-only) + retention
primitives (BE)**

-   **Description:** Create fingerprint-only record table. No raw files
    > stored. Add retention/legal hold primitives to avoid future schema
    > surgery.

-   **Acceptance Criteria:**

    -   Table anchors created with: id (pk), user_id, org_id,
        > file_fingerprint (sha256 hex), file_name, file_size_bytes,
        > file_mime, status (enum), retention_policy, retain_until,
        > legal_hold (bool), deleted_at, created_at .

    -   Constraints: fingerprint regex, legal_hold=true prevents
        > deleted_at .

    -   No raw file content columns.

-   **Definition of Done:**

    -   Constraint tests: invalid fingerprint fails; legal_hold deletion
        > fails.

    -   Docs updated.

-   **Tasks:**

    -   (BE) Migration 0004_anchors.sql (constraints + indexes).

    -   (BE) Add legal hold constraint.

    -   (Docs) Update docs/confluence/05_retention_legal_hold.md.

**Story P1-S7: Create audit_events append-only log (BE)**

-   **Description:** Add immutable audit trail foundation required for
    > evidence, enterprise security expectations, and future e-sign
    > admissibility.

-   **Acceptance Criteria:**

    -   Table audit_events created with: id, occurred_at, actor_user_id,
        > actor_role, action, target_table, target_id, org_id .

    -   Append-only enforced (UPDATE/DELETE rejected at DB level).

    -   Indexed by actor, org, occurred_at.

-   **Definition of Done:**

    -   Update/delete attempts fail.

    -   Docs page exists describing usage.

-   **Tasks:**

    -   (BE) Migration 0006_audit_events.sql.

    -   (BE) Trigger to block UPDATE/DELETE.

    -   (Docs) Create docs/confluence/04_audit_events.md.

**Story P1-S8: On-chain content policy guardrails (DB + Docs)**

-   **Description:** Prevent privacy/compliance poisoning: structurally
    > prevent anchors from becoming a PII dumping ground.

-   **Acceptance Criteria:**

    -   DB-level guardrail exists beyond Zod (e.g., filename
        > control-char ban).

    -   Policy documented: what is allowed vs forbidden.

-   **Definition of Done:**

    -   Guardrail validated with a failing insert/update test.

-   **Tasks:**

    -   (BE) Add DB constraint(s) to reduce unsafe input patterns.

    -   (Docs) Create docs/confluence/06_on_chain_policy.md.

**Story P1-S9: Role immutability enforced at DB level (BE)**

-   **Description:** Prevent privilege escalation by making role a
    > one-time assignment.

-   **Acceptance Criteria:**

    -   Allowed transition: role NULL -\> INDIVIDUAL \| ORG_ADMIN.

    -   Disallowed: any role change after set.

    -   role_set_at set on first assignment.

-   **Definition of Done:**

    -   Attempting to change role fails deterministically.

-   **Tasks:**

    -   (BE) Migration 0005_role_immutability.sql (trigger/function).

    -   (Tests) Add test proving immutability.

**Story P1-S10: Enable RLS + revoke public grants (BE)**

-   **Description:** Lock down the DB with default-deny posture.

-   **Acceptance Criteria:**

    -   RLS enabled on: profiles, organizations, anchors, audit_events.

    -   Public grants revoked unless explicitly required.

    -   Anonymous user cannot enumerate rows.

-   **Definition of Done:**

    -   Anonymous query returns 0 rows or permission denied.

-   **Tasks:**

    -   (BE) Migration 0007_enable_rls.sql.

**Story P1-S11: RLS policies: Profiles (BE)**

-   **Description:** Users can read/update only their own profile, and
    > cannot directly mutate privileged fields.

-   **Acceptance Criteria:**

    -   Select: only own profile.

    -   Direct updates blocked for: role, org_id,
        > requires_manual_review, manual_review_reason.

-   **Definition of Done:**

    -   Tests prove safe update works, privileged update fails.

-   **Tasks:**

    -   (BE) Migration 0008_rls_profiles.sql.

    -   (Tests) RLS negative tests (use helpers.ts).

**Story P1-S12: RLS policies: Organizations (BE)**

-   **Description:** Org admins can access only their organization.

-   **Acceptance Criteria:**

    -   ORG_ADMIN may read/update only where profiles.org_id =
        > organizations.id.

    -   Non-admin sees none.

-   **Definition of Done:**

    -   Tests prove org admin isolation.

-   **Tasks:**

    -   (BE) Migration 0009_rls_orgs.sql.

    -   (Tests) RLS negative tests.

**Story P1-S13: RLS policies: Anchors + INSERT policy (BE)**

-   **Description:** Allow safe creation of anchors while preventing
    > forged state.

-   **Acceptance Criteria:**

    -   Individuals select own anchors; Org Admin selects org anchors .

    -   INSERT allowed only if status = \'PENDING\'.

    -   Insert of SECURED/REVOKED is rejected.

-   **Definition of Done:**

    -   Tests: insert PENDING succeeds, insert SECURED fails.

-   **Tasks:**

    -   (BE) Migration 0010_rls_anchors.sql.

    -   (Tests) RLS insert tests.

**Story P1-S14: RLS policies: audit_events read scope (BE)**

-   **Description:** Prevent audit log leakage.

-   **Acceptance Criteria:** Users can read only their own audit events.

-   **Definition of Done:**

    -   Tests prove user cannot read other audit events.

-   **Tasks:**

    -   (BE) Migration 0011_rls_audit.sql.

**Story P1-S15: Generate Types & Zod Validators (FE)**

-   **Description:** Generate typed DB contract and enforce determinism.

-   **Acceptance Criteria:**

    -   src/types/database.types.ts generated from Supabase.

    -   Script gen:types exists.

    -   AnchorCreateSchema validates fingerprint regex, filename length.

-   **Definition of Done:**

    -   CI includes types drift guard.

    -   Unit tests for validators.

-   **Tasks:**

    -   (FE) Add types generation script.

    -   (FE) Create src/lib/validators.ts.

**Story P1-S16: Regression Pack & Doc Finalization**

-   **Description:** Ensure repo is green and docs complete.

-   **Acceptance Criteria:**

    -   All tests pass.

    -   Docs pages exist and reflect implemented contract.

-   **Definition of Done:**

    -   Teammate can run reset, understand model/security, and navigate
        > docs.

-   **Tasks:**

    -   \(CI\) Ensure tests run in pipeline.

    -   (Docs) Verify/Update all Confluence pages.

## **PRIORITY 2 - Identity & Access (Forked Onboarding)**

**EPIC P2-E1: Forked onboarding with manual review gate**

**Story P2-S1: Auth UI (FE)**

-   **Description:** Implement sign-in/sign-up UI and Google OAuth with
    > non-enumerating errors and stable signup success state.

-   **Acceptance Criteria:**

    -   Email/password sign-in works.

    -   Signup shows \"Check your email\" (no auto redirect).

    -   Google OAuth flow initiates.

    -   Copy passes banned-term lint.

-   **Definition of Done:**

    -   Playwright: signup success state exists.

-   **Tasks:**

    -   (FE) AuthForm (react-hook-form + Zod).

    -   (FE) Supabase auth integration.

    -   (Docs) Update docs/confluence/10_auth_session_model.md.

**Story P2-S2: Session bootstrap + route guards (FE)**

-   **Description:** Implement session bootstrap and route guards based
    > on profiles state.

-   **Acceptance Criteria:**

    -   Routing: unauth -\> auth; role null -\> /onboarding/role;
        > INDIVIDUAL -\> /vault; ORG_ADMIN + incomplete -\>
        > /onboarding/org .

-   **Definition of Done:**

    -   Playwright covers each route path.

-   **Tasks:**

    -   (FE) Session hook/provider.

    -   (FE) Guard logic.

**Story P2-S3: Transactional onboarding function (BE)**

-   **Description:** Create update_profile_onboarding to set role once,
    > create/link org, and emit audit events.

-   **Acceptance Criteria:**

    -   Binds all writes to auth.uid().

    -   Role set only if NULL.

    -   Emits audit_events: ROLE_SET, ORG_CREATED.

-   **Definition of Done:**

    -   DB tests prove immutability + idempotency.

-   **Tasks:**

    -   (BE) Migration to create function.

    -   (Tests) DB tests for repeat calls.

**Story P2-S4: Lock privileged profile fields from direct update (BE)**

-   **Description:** Force onboarding and security fields to be mutated
    > only via controlled pathways.

-   **Acceptance Criteria:**

    -   Direct updates fail for: role, org_id, requires_manual_review.

-   **Definition of Done:**

    -   Automated tests prove privileged updates fail.

-   **Tasks:**

    -   (BE) Update RLS/policies.

**Story P2-S5: Role selection UI (FE)**

-   **Description:** Build UI for user to choose Individual vs
    > Organization.

-   **Acceptance Criteria:**

    -   Two cards: Individual / Organization.

    -   Calls onboarding function and routes accordingly.

-   **Definition of Done:**

    -   Playwright covers selection + redirect.

-   **Tasks:**

    -   (FE) /onboarding/role page.

    -   (FE) Call onboarding function.

**Story P2-S6: Org KYB-lite form (FE)**

-   **Description:** Capture minimal org info for ORG_ADMIN onboarding.

-   **Acceptance Criteria:**

    -   Fields: legal_name, display_name, domain.

    -   Public domain warning banner shown.

-   **Definition of Done:**

    -   Playwright covers valid + invalid domain.

-   **Tasks:**

    -   (FE) /onboarding/org page.

    -   (FE) Zod schema for KYB.

**Story P2-S7: Pending review page + enforcement (FE)**

-   **Description:** Provide a holding state for manual review.

-   **Acceptance Criteria:**

    -   /org/pending-review exists.

    -   All /org/\* routes redirect to pending review when flagged.

-   **Definition of Done:**

    -   Playwright proves gating cannot be bypassed.

-   **Tasks:**

    -   (FE) Build pending review page.

**Story P2-S8: Identity & onboarding regression tests + docs (FE/BE)**

-   **Description:** Create a regression net for onboarding logic.

-   **Acceptance Criteria:** Tests cover role immutability, privileged
    > updates blocked, org scoping.

-   **Definition of Done:** CI runs tests reliably.

-   **Tasks:**

    -   (Tests) Playwright E2E suite.

    -   (Docs) Update 08_identity_access.md.

## **PRIORITY 3 - Individual \"Vault\"**

**EPIC P3-E1: Vault UI + visibility control**

**Story P3-S1: Vault dashboard shell (FE)**

-   **Description:** Create responsive dashboard layout.

-   **Acceptance Criteria:**

    -   Sidebar + header layout.

    -   Header indicates \"Vault Locked\" when is_public=false.

-   **Definition of Done:**

    -   Layout renders with seeded profile data.

-   **Tasks:**

    -   (FE) DashboardLayout component.

    -   (FE) useProfile hook (typed).

**Story P3-S2: Visibility toggle (FE/BE)**

-   **Description:** Add privacy toggle that updates profiles.is_public
    > instantly.

-   **Acceptance Criteria:**

    -   Optimistic UI toggle.

    -   DB update succeeds only for own profile.

-   **Definition of Done:**

    -   Unit/E2E proves persistence.

-   **Tasks:**

    -   (FE) Privacy Toggle component.

**Story P3-S3: Affiliations placeholder (FE)**

-   **Description:** Add placeholder view for future org relationships.

-   **Acceptance Criteria:** Route exists. Empty state UI .

-   **Definition of Done:** Click-through works.

-   **Tasks:**

    -   (FE) /affiliations page.

## **PRIORITY 4 - Anchor Engine**

**EPIC P4-E1: Client-side fingerprinting + anchor creation**

**Story P4-S1: File dropzone + FileHasher (FE)**

-   **Description:** Implement browser-side fingerprinting workflow.

-   **Acceptance Criteria:**

    -   Uses crypto.subtle.digest.

    -   Shows \"File never leaves device\".

-   **Definition of Done:**

    -   E2E proves no file payload in network requests.

-   **Tasks:**

    -   (FE) FileHasher utility.

    -   (FE) Dropzone component.

**Story P4-S2: Create anchor record (FE/BE)**

-   **Description:** Insert a new anchor row with status PENDING using
    > client + DB policy.

-   **Acceptance Criteria:**

    -   Confirmation modal shows fingerprint.

    -   Insert creates anchor with status PENDING.

-   **Definition of Done:**

    -   Tests: insert works and forbidden fields rejected.

-   **Tasks:**

    -   (FE) ConfirmAnchorModal.

    -   (FE) Insert call using typed client.

**Story P4-S3: Asset detail view + re-verify (FE)**

-   **Description:** Create certificate-like anchor details page with
    > re-verification flow.

-   **Acceptance Criteria:**

    -   Re-verify dropzone re-fingerprints file.

    -   Match -\> green check; mismatch -\> red alert.

-   **Definition of Done:**

    -   E2E covers match and mismatch.

-   **Tasks:**

    -   (FE) AssetDetailView page.

## **PRIORITY 5 - Organization Admin**

**EPIC P5-E1: Org registry + revoke + member invite**

**Story P5-S1: Org registry table (FE)**

-   **Description:** Build org admin registry table with server-side
    > pagination.

-   **Acceptance Criteria:**

    -   Server-side pagination.

    -   Filters work via query params.

-   **Definition of Done:**

    -   Works with seeded org admin.

-   **Tasks:**

    -   (FE) DataTable with shadcn/TanStack.

**Story P5-S2: Revoke anchor (BE/FE)**

-   **Description:** Allow org admins to set anchor status to REVOKED.

-   **Acceptance Criteria:**

    -   Only ORG_ADMIN for the org can revoke.

    -   Status transition enforced at DB level.

    -   Audit event emitted.

-   **Definition of Done:**

    -   Tests cover revoke success and forbidden revoke.

-   **Tasks:**

    -   (BE) Controlled update path.

    -   (FE) Revoke UI action.

**Story P5-S3: Export org records (FE)**

-   **Description:** Export org-scoped registry data to CSV.

-   **Acceptance Criteria:** Exports only org-scoped data. Includes UTC
    > timestamps .

-   **Definition of Done:** Export works on seeded data.

-   **Tasks:**

    -   (FE) CSV export utility.

**Story P5-S4: Member invite (FE/BE)**

-   **Description:** Invite members by email list (mocked for MVP).

-   **Acceptance Criteria:**

    -   If user exists: can be linked.

    -   If user doesn\'t exist: mock success.

-   **Definition of Done:** Does not violate tenant isolation.

-   **Tasks:**

    -   (FE) InviteMemberModal.

    -   (BE) Lookup path.

## **PRIORITY 6 - Bulk Verification Wizard**

**EPIC P6-E1: CSV bulk operations**

**Story P6-S1: CSV upload + parsing + mapping (FE)**

-   **Description:** Wizard step to upload CSV and parse it.

-   **Acceptance Criteria:** Pre-flight validation identifies invalid
    > emails.

-   **Definition of Done:** Handles 500 rows without crashing.

-   **Tasks:**

    -   (FE) CsvUploader component.

**Story P6-S2: Batch execution (BE)**

-   **Description:** Apply batch updates safely with idempotency
    > guarantees.

-   **Acceptance Criteria:**

    -   Idempotent.

    -   Emits audit event: BULK_VERIFICATION_RUN.

-   **Definition of Done:**

    -   Tested with repeated runs.

-   **Tasks:**

    -   (BE) Batch processing function.

**Story P6-S3: Bulk wizard end-to-end flow (FE)**

-   **Description:** Wire wizard UI to backend batch execution.

-   **Acceptance Criteria:** Progress bar shows X/Y.

-   **Definition of Done:** E2E test covers success + failure rows.

-   **Tasks:**

    -   (FE) Progress UI.

## **PRIORITY 7: Go-Live (Payments + Entitlements + Anchoring Ops)**

**Requirement:** This Priority requires the **Dedicated Node Service**
(services/worker) for long-running jobs. Next.js API routes are strictly
forbidden for the worker loop.

**EPIC P7-E1: Billing + Entitlements (Stripe)**

**Constraint:** Must use IPaymentProvider interface. Tests must use
MockPaymentProvider.

**Story P7-S1: Billing & Entitlement Schema (BE)**

-   **Description:** Add billing tables (plans, subscriptions,
    > entitlements).

-   **Acceptance Criteria:**

    -   Tables exist: plans, subscriptions, entitlements, billing_events
        > .

    -   All tables have RLS enabled.

-   **Definition of Done:** Migrations include rollback notes.

-   **Tasks:**

    -   (BE) Enums and Tables .

    -   (BE) RLS policies.

**Story P7-S2: Checkout + Billing UI (FE)**

-   **Description:** Add Pricing/Upgrade UI.

-   **Acceptance Criteria:**

    -   User can initiate checkout.

    -   \"Manage subscription\" uses server-generated portal link.

-   **Definition of Done:** lint:copy passes.

-   **Tasks:**

    -   (FE) Pricing components.

    -   (BE) Endpoint to create checkout sessions.

**Story P7-S3: Stripe Webhook Handler (BE)**

-   **Description:** Implement inbound Stripe webhooks with signature
    > verification.

-   **Acceptance Criteria:**

    -   Signature verified.

    -   Idempotent processing.

    -   Updates entitlements deterministically.

-   **Definition of Done:** Integration tests simulate duplicate
    > delivery.

-   **Tasks:**

    -   (BE) Webhook receiver.

    -   (BE) Entitlement state machine.

**EPIC P7-E2: Anchoring Worker**

**Constraint:** Must use IAnchorPublisher interface. Must be located in
services/worker.

**Story P7-S4: Anchoring Jobs + Proof Schema (BE)**

-   **Description:** Create DB schema for job processing.

-   **Acceptance Criteria:** anchoring_jobs table, anchor_proofs table.
    > RLS hardened .

-   **Definition of Done:** Migrations include rollback.

-   **Tasks:**

    -   (BE) Tables + RLS .

**Story P7-S5: Worker Skeleton + Idempotent Job Loop (BE)**

-   **Description:** Implement the **Node.js Service** runtime that
    > claims jobs and publishes anchors.

-   **Acceptance Criteria:**

    -   Safe claim mechanism.

    -   Worker is idempotent.

-   **Definition of Done:** Integration tests simulate duplicate
    > execution.

-   **Tasks:**

    -   (BE) Job claim + transition guard.

    -   (BE) Publish flow (Test Environment).

**Story P7-S6: Anchor Status Control + UI Proof Display (FE/BE)**

-   **Description:** Ensure only the worker can mark anchors as SECURED.

-   **Acceptance Criteria:**

    -   Client cannot set SECURED status directly.

    -   Asset detail view displays Network Receipt + Observed Time UTC .

-   **Definition of Done:** RLS/integration tests prove status cannot be
    > forged.

-   **Tasks:**

    -   (BE) Restrict updates to worker.

    -   (FE) Update AssetDetailView.

**EPIC P7-E3: Public Verification Links + Proof Packages**

**Story P7-S7: Public Verification View (FE/BE)**

-   **Description:** Implement a public route backed by a non-guessable
    > identifier.

-   **Acceptance Criteria:**

    -   Uses public_id.

    -   Redaction rules enforced server-side.

-   **Definition of Done:** E2E tests cover public view.

-   **Tasks:**

    -   (BE) Add public_id field.

    -   (FE) Build PublicVerificationView.

**Story P7-S8: Proof Package Export (JSON) (FE/BE)**

-   **Description:** Provide a structured export that compliance teams
    > can store.

-   **Acceptance Criteria:** Export includes Fingerprint, Record
    > metadata, Proof metadata.

-   **Definition of Done:** Export schema validated with Zod.

-   **Tasks:**

    -   (BE) Export endpoint.

    -   (FE) Download UI.

**EPIC P7-E4: Outbound Webhooks**

**Story P7-S9: Webhook Endpoint Configuration (FE/BE)**

-   **Description:** Allow org admins to configure webhook endpoints
    > securely.

-   **Acceptance Criteria:** Secret is write-only from UI.

-   **Definition of Done:** No secret appears in logs.

-   **Tasks:**

    -   (BE) webhook_endpoints table.

    -   (FE) WebhookSettings UI.

**Story P7-S10: Event Delivery Engine (BE)**

-   **Description:** Implement signed delivery, retries, and delivery
    > logs.

-   **Acceptance Criteria:** Signed header, exponential backoff .

-   **Definition of Done:** Queryable delivery history exists.

-   **Tasks:**

    -   (BE) Delivery loop (Node service).

**EPIC P7-E5: A la carte Lifecycle Report Ordering**

**Story P7-S11: Report Schema + Idempotency (BE)**

-   **Description:** Create report storage tables.

-   **Acceptance Criteria:** reports table, report_artifacts table .

-   **Tasks:** Tables + RLS.

**Story P7-S12: Generate + View + Download Report (FE/BE)**

-   **Description:** Generate and render a lifecycle report.

-   **Acceptance Criteria:** Entitlement-gated.

-   **Tasks:** Generation endpoint, UI actions .

**EPIC P7-E6: Launch Ops + Switchboard**

**Story P7-S13: Observability + Rate Limiting (BE)**

-   **Description:** Implement correlation IDs and basic rate limiting.

-   **Acceptance Criteria:** Sensitive endpoints enforce limits.

-   **Tasks:** Add logging, rate limiting .

**Story P7-S14: Implement Production Switchboard Flags (BE)**

-   **Description:** Introduce a centralized flag system to control
    > production behaviors without code changes.

-   **Acceptance Criteria:**

    -   Flags: ENABLE_PROD_NETWORK_ANCHORING (False),
        > ENABLE_OUTBOUND_WEBHOOKS (False), ENABLE_NEW_CHECKOUTS (True)
        > .

    -   Flags are enforced server-side.

    -   Switch changes are auditable.

-   **Definition of Done:** CI tests confirm flags block behavior.

-   **Tasks:**

    -   (BE) Define Flag Interface + Defaults.

    -   (BE) Enforce in Checkout, Worker, and Webhook paths .

    -   (Docs) Document the Switchboard.

## **PRIORITY 7- SWITCHBOARD GATE (REQUIRED)**

**Do not launch until ALL PASS.**

**A) Ownership + Scope (PASS/FAIL)**

-   PASS if flags are finalized: ENABLE_PROD_NETWORK_ANCHORING (FALSE),
    > ENABLE_OUTBOUND_WEBHOOKS (FALSE), ENABLE_NEW_CHECKOUTS (TRUE).

-   PASS if \"protected behaviors\" are finalized.

**B) Runtime Location Locked (PASS/FAIL)**

-   PASS if **Dedicated Node Service** is running and flags are
    > enforceable.

**C) Test Harness Preconditions (PASS/FAIL)**

-   PASS if the repo can run integration tests in CI for: checkout
    > endpoint, worker job processing, webhook delivery.

**D) Staging Proof (PASS/FAIL)**

-   PASS if staging environment has a documented \"Switchboard Smoke
    > Test\" run.
