# Arkova Complete Product Backlog

*Aligned with Multi-Phase Product Roadmap*
*Last Updated: 2026-01-30*

---

## Overview

This backlog maps technical deliverables to Arkova's three-phase roadmap:
- **Phase I** — Credentialing (Foundation Layer)
- **Phase II** — Attestations (RWA & Supply Chain)
- **Phase III** — Legally Recognized E-Signatures

Each phase builds on the previous, creating Arkova's "trustless compliance fabric."

---

## Current State (P1-P3 Complete)

| Priority | Status | Deliverables |
|----------|--------|--------------|
| P1 Bedrock | ✅ Complete | Schema, RLS, audit trail, validators |
| P2 Identity | ✅ Complete | Auth, onboarding, route guards |
| P3 Vault | ✅ Complete | Dashboard, privacy toggle |
| P4-P7 | 🔲 Not Started | Anchor engine, org admin, payments, Bitcoin anchoring |

---

# PHASE I — CREDENTIALING

*Goal: Establish trustless credential verification for education, HR, and compliance.*
*ARR Target: $250K | Compliance: SOC 2 Framework Initiated*

---

## Priority 4: Anchor Engine (Core Credentialing)

### EPIC P4-E1: Client-Side Fingerprinting

**P4-S1: File Dropzone & FileHasher**
- Browser-side SHA-256 fingerprinting via Web Crypto API
- "File never leaves device" messaging
- Progress indicator for large files
- **Acceptance:** No file bytes in network requests

**P4-S2: Create Anchor Record**
- Confirmation modal with fingerprint preview
- Insert anchor with status=PENDING
- Zod validation before submission
- **Acceptance:** Forbidden fields (user_id, status) rejected

**P4-S3: Asset Detail View**
- Certificate-style anchor display
- Re-verification dropzone (match/mismatch indicator)
- Chain proof display (when SECURED)
- **Acceptance:** E2E covers match and mismatch scenarios

### EPIC P4-E2: Credential Metadata (Roadmap Gap)

**P4-S4: Credential Type Selection**
- Dropdown/cards for credential categories:
  - Academic transcript
  - Professional certification
  - Employment verification
  - Identity document
  - Custom
- Store as `credential_type` field
- **Acceptance:** Type persists and displays correctly

**P4-S5: Credential Metadata Fields**
- Optional structured metadata:
  - Issued date
  - Expiry date
  - Issuer name
  - Recipient name/ID (non-PII, or hashed)
- JSON metadata storage (no PII on-chain)
- **Acceptance:** Metadata editable until SECURED

**P4-S6: Version Lineage Tracking**
- Parent anchor reference for updated credentials
- Version number auto-increment
- Lineage visualization in UI
- **Acceptance:** Version chain queryable and displayed

---

## Priority 5: Organization Admin

### EPIC P5-E1: Org Registry & Management

**P5-S1: Org Registry Table**
- Server-side pagination
- Search by filename, fingerprint, status
- Date range filtering
- Bulk selection
- **Acceptance:** Works with 1000+ anchors

**P5-S2: Revoke Anchor**
- ORG_ADMIN only for org anchors
- DB-level status transition enforcement
- Revocation reason capture
- Audit event emission
- **Acceptance:** Cross-org revoke blocked

**P5-S3: Export Org Records (CSV)**
- Org-scoped data only
- UTC timestamps
- Includes metadata and lineage
- **Acceptance:** Export matches UI data

**P5-S4: Member Invite**
- Email invite flow
- Existing user linking
- New user registration path
- Org membership approval
- **Acceptance:** No tenant isolation violation

### EPIC P5-E2: Credential Issuance Portal (Roadmap Requirement)

**P5-S5: Issue Credential to Recipient**
- Recipient email input
- Credential details form
- Generate verification link
- Email notification (optional)
- **Acceptance:** Recipient can verify without account

**P5-S6: Batch Credential Issuance**
- CSV upload for bulk issuance
- Column mapping UI
- Progress tracking
- Error handling per row
- **Acceptance:** 500 credentials in single batch

**P5-S7: Credential Templates**
- Org-level template library
- Template fields and validation rules
- Clone and customize
- **Acceptance:** Templates speed issuance by 50%

---

## Priority 6: Verification Portal (Roadmap Critical)

### EPIC P6-E1: Self-Service Verification

**P6-S1: Public Verification Page**
- Non-guessable public_id URL
- No auth required
- Credential display with status
- Chain proof visualization
- Issuer information
- **Acceptance:** Anonymous verification works

**P6-S2: QR Code Generation**
- Generate QR for each credential
- Embeddable QR image
- Print-friendly credential certificate
- **Acceptance:** QR scans resolve to verification page

**P6-S3: Verification Widget (Embed)**
- JavaScript embed code
- Iframe option
- Customizable styling
- Callback on verification result
- **Acceptance:** Works on third-party sites

### EPIC P6-E2: Lifecycle Reporting (Roadmap Requirement)

**P6-S4: Credential History Timeline**
- Full lifecycle events
- Issuance, verification, revocation timestamps
- Actor attribution
- **Acceptance:** Auditors can trace full history

**P6-S5: Audit Report Export**
- PDF lifecycle report
- Includes chain proof
- Court/auditor readable format
- **Acceptance:** Report accepted by compliance teams

**P6-S6: Verification Analytics**
- Verification count per credential
- Geographic distribution (opt-in)
- Verifier metadata (when available)
- **Acceptance:** Analytics dashboard functional

---

## Priority 7: Go-Live (Bitcoin Anchoring + Payments)

### EPIC P7-E1: Billing & Entitlements (Stripe)

**P7-S1: Billing Schema**
- Tables: plans, subscriptions, entitlements, billing_events
- RLS enabled
- State machine for subscription lifecycle
- **Acceptance:** Migrations with rollback

**P7-S2: Checkout & Pricing UI**
- Pricing page with plan comparison
- Stripe checkout session creation
- Manage subscription portal link
- **Acceptance:** Copy lint passes (no "crypto" terms)

**P7-S3: Stripe Webhook Handler**
- Signature verification
- Idempotent processing
- Entitlement state machine
- **Acceptance:** Duplicate delivery handled

### EPIC P7-E2: Bitcoin Anchoring Worker

**P7-S4: Anchoring Jobs Schema**
- anchoring_jobs table
- anchor_proofs table
- RLS hardened
- **Acceptance:** Migrations with rollback

**P7-S5: Worker Service**
- Node.js service in services/worker/
- Job claim mechanism
- Idempotent execution
- Test Environment → Production Network toggle
- **Acceptance:** Duplicate execution safe

**P7-S6: Anchor Status Control**
- Only worker can set SECURED
- UI displays Network Receipt + Observed Time UTC
- **Acceptance:** Client cannot forge status

### EPIC P7-E3: Proof Packages (Roadmap Requirement)

**P7-S7: Proof Package Export (JSON)**
- Structured export with:
  - Fingerprint
  - Credential metadata
  - Chain proof
  - Issuer verification
- Zod schema validation
- **Acceptance:** Third parties can independently verify

**P7-S8: Proof Package Export (PDF)**
- Human-readable certificate
- QR code included
- Chain proof explanation
- Issuer branding option
- **Acceptance:** Legal teams accept as evidence

### EPIC P7-E4: Outbound Webhooks

**P7-S9: Webhook Configuration UI**
- Org admins configure endpoints
- Secret management (write-only)
- Event type selection
- **Acceptance:** No secrets in logs

**P7-S10: Event Delivery Engine**
- Signed headers (HMAC)
- Exponential backoff retry
- Delivery log with status
- Replay mechanism (admin-only)
- **Acceptance:** Delivery history queryable

---

## Priority 8: Enterprise Foundations (SOC 2 Prep)

### EPIC P8-E1: Compliance Certifications

**P8-S1: SOC 2 Readiness Assessment**
- Engage auditor
- Gap analysis
- Control implementation plan
- **Timeline:** 3-4 months
- **Acceptance:** Auditor confirms readiness

**P8-S2: Security Documentation**
- Security whitepaper
- Incident response procedure
- Data handling documentation
- **Acceptance:** Publishable for enterprise sales

**P8-S3: Data Processing Agreement**
- GDPR-compliant DPA template
- Sub-processor list
- Data transfer mechanisms
- **Acceptance:** Legal approved

### EPIC P8-E2: Enterprise SSO

**P8-S4: SAML SSO**
- SAML 2.0 SP implementation
- Metadata exchange
- JIT user provisioning
- Org-level configuration
- **Acceptance:** Okta/Azure AD tested

**P8-S5: SCIM Provisioning**
- SCIM 2.0 endpoints
- Create/Update/Delete sync
- Group membership sync
- **Acceptance:** Azure AD SCIM tested

**P8-S6: MFA Options**
- TOTP authenticator
- WebAuthn/passkey
- Org-level enforcement policy
- **Acceptance:** MFA enforced for org admins

---

# PHASE II — ATTESTATIONS

*Goal: Extend into institutional attestations and asset provenance.*
*ARR Target: $1M | Compliance: SOC 2 Type I Complete*

---

## Priority 9: Attestation Framework

### EPIC P9-E1: Attestation Types

**P9-S1: Attestation Data Model**
- attestations table
- Links to assets/credentials
- Attester identity
- Attestation schema (JSON-LD)
- **Acceptance:** Schema supports RWA and supply chain

**P9-S2: Attestation Creation Flow**
- Attest to existing anchor
- Third-party attestation (endorsement)
- Multi-party attestation
- **Acceptance:** Attestation chain visible

**P9-S3: Supplier/Vendor Attestations**
- Supplier onboarding
- Compliance attestation templates
- Recurring attestation schedules
- **Acceptance:** Suppliers can self-attest

### EPIC P9-E2: Chain of Custody

**P9-S4: Custody Event Logging**
- Custody transfer events
- Location tracking (opt-in)
- Handler identification
- **Acceptance:** Full custody chain queryable

**P9-S5: Chain-of-Custody Dashboard**
- Visual timeline
- Map view (if location enabled)
- Status indicators
- **Acceptance:** Logistics teams can monitor

**P9-S6: Physical-Digital Linking**
- QR code generation for physical goods
- NFC tag support (future)
- Scan-to-verify flow
- **Acceptance:** Physical item links to digital record

### EPIC P9-E3: Public Validation Explorer

**P9-S7: Public Explorer**
- Searchable credential/attestation lookup
- Opt-in visibility
- Anonymous verification
- **Acceptance:** Public can verify without account

**P9-S8: Explorer API**
- Public read-only API
- Rate limited
- No PII exposed
- **Acceptance:** Third parties can build on explorer

---

## Priority 10: Integration Layer

### EPIC P10-E1: Event APIs

**P10-S1: REST API v1**
- OpenAPI 3.0 specification
- Versioned endpoints
- API key management
- Rate limiting
- **Acceptance:** API docs published

**P10-S2: Webhook Events**
- credential.issued
- credential.verified
- credential.revoked
- attestation.created
- custody.transferred
- **Acceptance:** Events fire correctly

**P10-S3: Bulk Operations API**
- Batch create credentials
- Batch verify
- Async job status
- **Acceptance:** 1000 items per batch

### EPIC P10-E2: Enterprise Integrations

**P10-S4: Salesforce Connector**
- AppExchange package
- Record anchoring from Salesforce
- Verification in Salesforce
- **Acceptance:** Listed on AppExchange

**P10-S5: SAP GRC Integration**
- Attestation sync
- Compliance status feed
- **Acceptance:** SAP partner validated

**P10-S6: External Storage**
- S3 integration
- SharePoint integration
- Document sync triggers
- **Acceptance:** Auto-anchor from cloud storage

---

## Priority 11: AI Compliance Suite

### EPIC P11-E1: Compliance Scoring

**P11-S1: Readiness Score Calculator**
- Framework-specific scoring (SOX, ESG, GDPR)
- Gap identification
- Remediation recommendations
- **Acceptance:** Score correlates with audit outcomes

**P11-S2: Anomaly Detection**
- Unusual access patterns
- Verification spikes
- Revocation anomalies
- **Acceptance:** Alerts reduce false positives over time

**P11-S3: Audit Preparation Assistant**
- Pre-audit checklist
- Evidence gathering automation
- Report generation
- **Acceptance:** 3x reduction in audit prep time

---

# PHASE III — LEGALLY RECOGNIZED E-SIGNATURES

*Goal: Unify verification, attestations, and legally binding signatures.*
*ARR Target: $3M | Compliance: SOC 2 + eIDAS Certified*

---

## Priority 12: Signature Engine

### EPIC P12-E1: Advanced Electronic Signatures (AdES)

**P12-S1: AdES Signature Engine**
- PAdES (PDF Advanced Electronic Signatures)
- XAdES (XML Advanced Electronic Signatures)
- Timestamp embedding
- **Acceptance:** ETSI EN 319 122 compliant

**P12-S2: PKI Integration**
- Certificate management
- HSM integration (future)
- Key lifecycle management
- **Acceptance:** Keys never exposed

**P12-S3: Qualified Timestamp Service**
- Partner with QTSP
- Qualified timestamp option
- eIDAS Article 42 compliance
- **Acceptance:** Timestamps legally valid in EU

### EPIC P12-E2: Signing Workflows

**P12-S4: Signature Request Flow**
- Send for signature
- Multi-party signing order
- Reminder automation
- **Acceptance:** Complete signing in < 5 steps

**P12-S5: Signature Verification**
- Verify AdES signatures
- Certificate chain validation
- Timestamp verification
- **Acceptance:** Invalid signatures clearly flagged

**P12-S6: Signing Audit Trail**
- Every action logged
- IP, device, timestamp
- Intent capture
- **Acceptance:** Audit trail court-admissible

### EPIC P12-E3: Hybrid Storage

**P12-S7: Off-Chain Document Retention**
- Encrypted document storage
- Retention policy enforcement
- Legal hold integration
- **Acceptance:** Documents retrievable for legal hold

**P12-S8: On-Chain Proof Anchoring**
- Document hash + signature hash anchored
- Proof of existence at signing time
- **Acceptance:** Chain proof independent of Arkova

---

## Priority 13: Compliance Center

### EPIC P13-E1: Customer Compliance Portal

**P13-S1: Compliance Dashboard**
- Policy document library
- Audit log access
- Certificate downloads
- **Acceptance:** Customers self-serve compliance evidence

**P13-S2: SOC 2 Evidence Bundle**
- Automated evidence collection
- Control mapping
- Continuous monitoring status
- **Acceptance:** Auditors access directly

**P13-S3: eIDAS Compliance Documentation**
- ETSI conformity statements
- Policy OID registry
- Certificate practice statements
- **Acceptance:** EU regulators can verify

### EPIC P13-E2: Regulatory Reporting

**P13-S4: Jurisdiction Selector**
- eIDAS (EU)
- UETA/E-SIGN (US)
- Other jurisdictions
- **Acceptance:** Correct legal framework applied

**P13-S5: Court-Ready Export**
- Complete evidence package
- Legal opinion template
- Chain of custody proof
- **Acceptance:** Accepted in legal proceedings

---

## Priority 14: Mobile & Field Operations

### EPIC P14-E1: Mobile Applications

**P14-S1: iOS App**
- Credential wallet
- Camera verification
- Push notifications
- Offline mode
- **Acceptance:** App Store approved

**P14-S2: Android App**
- Feature parity with iOS
- Material Design
- **Acceptance:** Play Store approved

### EPIC P14-E2: Offline Verification

**P14-S3: Offline Verification Package**
- Downloadable proof bundle
- Local cryptographic verification
- Grace period for revocation
- **Acceptance:** Works without network

---

# Implementation Timeline

| Quarter | Priorities | Roadmap Phase | ARR Target |
|---------|------------|---------------|------------|
| Q1 2026 | P4-P5 | Phase I | — |
| Q2 2026 | P6-P7 | Phase I | $250K |
| Q3 2026 | P8 | Phase I (SOC 2) | — |
| Q4 2026 | P9-P10 | Phase II | $500K |
| Q1 2027 | P10-P11 | Phase II | $1M |
| Q2 2027 | P12 | Phase III | — |
| Q3 2027 | P13-P14 | Phase III | $2M |
| Q4 2027 | — | Phase III | $3M |

---

# Success Metrics (per Roadmap)

## Phase I
- ≥ 98% credential verification accuracy
- ≥ 99% version lineage integrity
- ≥ 95% lifecycle completeness
- ≥ 90% registrar/admin satisfaction
- 60% pilot-to-contract conversion
- Time to verify < 5 seconds
- Admin hours saved ≥ 80%

## Phase II
- ≥ 95% audit readiness score
- ≥ 2 enterprise pilots → paid
- 3x reduction in audit prep time
- API SLA ≥ 99.5%

## Phase III
- 100% AdES & SOC 2 alignment
- ≥ 90% pilot satisfaction
- ≥ 2 enterprise contracts
- ARR ≥ $3M

---

*This backlog is the canonical source of truth for Arkova product development.*
