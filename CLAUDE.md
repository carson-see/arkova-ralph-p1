# ARKOVA PROJECT CONTEXT & GUIDELINES

## 1. Commands

* **Start Dev Server:** `npm run dev`
* **Run Tests:** `npm test`
* **Run RLS/Security Tests:** `npm run test:rls` (Ensure this runs `src/tests/rls/`)
* **Lint Code:** `npm run lint`
* **Lint Copy (Strict):** `npx tsx scripts/check-copy-terms.ts` (Fails on "Wallet", "Crypto", etc.)
* **Generate DB Types:** `npx supabase gen types typescript --local > src/types/database.types.ts` (Run after EVERY migration)
* **Reset Database:** `npx supabase db reset` (Applies schema + seeds)

## 2. Architecture Constraints (LOCKED)

* **Frontend:** React 19, TypeScript, Tailwind CSS, Shadcn/ui.
* **Backend:** Supabase (Postgres + Auth).
* **Worker Runtime:** Dedicated Node.js service in `services/worker/`.
* **Rule:** DO NOT use Next.js API routes or Edge Functions for long-running anchoring jobs.
* **External Integrations:** Must use Interfaces (`IPaymentProvider`, `IAnchorPublisher`).
* **Dev/CI Rule:** Use Mocks only. Never call real Stripe/Chain APIs in tests.

## 3. Development Workflow (Strict)

1. **Schema First:** Define DB schema/RLS in `supabase/migrations/` before writing UI.
2. **Seed Maintenance:** Update `supabase/seed.sql` with every migration so `db reset` leaves the app clickable.
3. **Documentation:** Update `docs/confluence/*.md` in the SAME PR as the code changes.
4. **Context Loading:** Before starting a story, read the relevant section in `docs/architecture/Backlog.md` and the DoR in `docs/architecture/DoR_DoD.md`.

## 4. Coding Standards

* **RLS Testing:** ALL database tests must use `src/tests/rls/helpers.ts` (utilizing `withUser`/`withAuth`) to ensure tenant isolation.
* **Terminology:**
  * ❌ **BANNED:** Wallet, Gas, Hash, Block, Transaction, Crypto.
  * ✅ **REQUIRED:** Vault, Anchor, Fingerprint, Record, Secure, Verify.
* **Timestamps:** All server-side times are `timestamptz` (UTC). Displayed times must explicitly state "UTC".
* **Secrets:** No `.env` in git. No service keys in client code.

## 5. File Structure

* `src/components/ui` → Shadcn components
* `src/lib/copy.ts` → Centralized UI copy strings
* `src/tests/rls` → Security & RLS tests
* `supabase/migrations` → SQL migrations
* `services/worker` → Node.js anchoring worker (Priority 7+)
* `docs/architecture` → Constitution, Backlog, DoR/DoD
* `docs/confluence` → Confluence-ready technical docs

## 6. Priority Order

1. **P1 (Bedrock):** Schema, RLS, audit, seed, validators — COMPLETE
2. **P2 (Identity):** Auth UI, onboarding, route guards
3. **P3 (Vault):** Individual dashboard + privacy toggle
4. **P4 (Anchor):** Client-side fingerprinting + anchor records
5. **P5 (Org Admin):** Registry + member management
6. **P6 (Bulk):** CSV verification wizard
7. **P7 (Go Live):** Stripe + Bitcoin testnet→mainnet + webhooks

## 7. Definition of Ready/Done

* **DoR:** Check `docs/architecture/DoR_DoD.md` before starting any priority
* **DoD:** All tests pass, docs updated, seed clickable, copy lint clean
* **STOP conditions:** CI red, RLS missing, privileged fields client-writable, seed broken
