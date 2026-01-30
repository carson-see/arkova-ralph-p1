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
