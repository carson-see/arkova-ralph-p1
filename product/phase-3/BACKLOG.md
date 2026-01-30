# ARKOVA PHASE 3 BACKLOG — Post-MVP Roadmap

*Last updated: 2026-01-30*
*Status: Planning*

## Overview

Phase 3 begins after P7 (Go-Live) is complete. This backlog covers expansion features needed to capture enterprise market share and establish Arkova as the leading compliance verification platform globally.

**Strategic Goals:**
1. Expand from timestamping to full credential ecosystem
2. Achieve enterprise compliance certifications (SOC 2, ISO 27001)
3. Build integrations that accelerate distribution
4. Capture EU market with eIDAS 2.0 compliance
5. Develop SDK/API for platform plays

---

## PRIORITY 8: Enterprise Foundations

*Goal: Close enterprise deals by removing procurement blockers.*

### EPIC P8-E1: Compliance Certifications

**Story P8-S1: SOC 2 Type II Preparation**
- **Description:** Implement controls required for SOC 2 Type II certification.
- **Acceptance Criteria:**
  - Complete readiness assessment with auditor
  - Implement required controls (access management, change management, monitoring)
  - Document policies and procedures
  - Pass readiness review
- **Dependencies:** External auditor engagement
- **Estimate:** 3-4 months
- **Business Impact:** Unblocks 80%+ of enterprise deals

**Story P8-S2: Security Whitepaper**
- **Description:** Create customer-facing security documentation.
- **Acceptance Criteria:**
  - Architecture security overview
  - Data handling and encryption practices
  - Incident response procedures
  - Compliance posture summary
- **Estimate:** 1 week

**Story P8-S3: Data Processing Agreement Template**
- **Description:** Create GDPR-compliant DPA for B2B customers.
- **Acceptance Criteria:**
  - Standard DPA template
  - Sub-processor list
  - Data transfer mechanisms documented
- **Dependencies:** Legal review
- **Estimate:** 2 weeks

### EPIC P8-E2: Enterprise SSO & Identity

**Story P8-S4: SAML SSO Integration**
- **Description:** Support enterprise SAML identity providers.
- **Acceptance Criteria:**
  - SAML 2.0 SP implementation
  - Metadata exchange flow
  - JIT provisioning for new users
  - Org-level SSO configuration UI
- **Estimate:** 2 weeks

**Story P8-S5: SCIM User Provisioning**
- **Description:** Automated user lifecycle management.
- **Acceptance Criteria:**
  - SCIM 2.0 endpoint implementation
  - Create/Update/Delete user sync
  - Group membership sync
- **Estimate:** 2 weeks

**Story P8-S6: Multi-Factor Authentication**
- **Description:** Add MFA options beyond email.
- **Acceptance Criteria:**
  - TOTP authenticator support
  - WebAuthn/passkey support
  - Org-level MFA enforcement policy
- **Estimate:** 2 weeks

### EPIC P8-E3: Advanced RBAC

**Story P8-S7: Custom Roles & Permissions**
- **Description:** Flexible permission system beyond INDIVIDUAL/ORG_ADMIN.
- **Acceptance Criteria:**
  - Role definition UI
  - Granular permissions (view, create, revoke, admin)
  - Role assignment to users
  - Permission check middleware
- **Estimate:** 3 weeks

**Story P8-S8: Team/Department Structure**
- **Description:** Hierarchical organization structure.
- **Acceptance Criteria:**
  - Teams/departments within org
  - Team-level record visibility
  - Manager approval workflows
- **Estimate:** 2 weeks

---

## PRIORITY 9: Verifiable Credentials Platform

*Goal: Transform from timestamping tool to full credential issuance platform.*

### EPIC P9-E1: W3C Verifiable Credentials

**Story P9-S1: VC Data Model Support**
- **Description:** Implement W3C Verifiable Credentials Data Model 2.0.
- **Acceptance Criteria:**
  - Credential schema (JSON-LD)
  - Credential issuance flow
  - Holder binding to anchor
  - Presentation generation
- **Reference:** https://www.w3.org/TR/vc-data-model/
- **Estimate:** 4 weeks

**Story P9-S2: Credential Templates**
- **Description:** Pre-built templates for common credential types.
- **Acceptance Criteria:**
  - Certificate of completion
  - Professional certification
  - Employment verification
  - Document attestation
  - Custom template builder
- **Estimate:** 2 weeks

**Story P9-S3: Credential Revocation Registry**
- **Description:** Public revocation status for issued credentials.
- **Acceptance Criteria:**
  - StatusList2021 support
  - Revocation list publication
  - Revocation check API
- **Estimate:** 2 weeks

### EPIC P9-E2: Open Badges / CLR

**Story P9-S4: Open Badges 3.0 Issuer**
- **Description:** Issue credentials as Open Badges.
- **Acceptance Criteria:**
  - OpenBadgeCredential generation
  - Badge visual design tools
  - Recipient delivery (email, API)
  - Badge verification endpoint
- **Reference:** https://www.imsglobal.org/spec/ob/v3p0/
- **Estimate:** 3 weeks

**Story P9-S5: Comprehensive Learner Record Support**
- **Description:** Bundle credentials into CLR for universities.
- **Acceptance Criteria:**
  - ClrCredential generation
  - Multiple achievement aggregation
  - Issuer endorsements
  - CLR verification
- **Reference:** https://www.imsglobal.org/spec/clr/v2p0/
- **Target Segment:** Universities
- **Estimate:** 3 weeks

### EPIC P9-E3: Credential Verification Portal

**Story P9-S6: Public Verification Page**
- **Description:** Standalone verification portal for credential holders.
- **Acceptance Criteria:**
  - QR code scanning
  - Credential display
  - Chain proof visualization
  - Verification result UI
- **Estimate:** 2 weeks

**Story P9-S7: Embeddable Verification Widget**
- **Description:** Widget for third-party sites to verify credentials.
- **Acceptance Criteria:**
  - JavaScript embed
  - Iframe embed
  - Customizable styling
  - Callback on verification result
- **Estimate:** 2 weeks

---

## PRIORITY 10: eIDAS 2.0 & EU Market

*Goal: Become a qualified trust service provider in the EU market.*

### EPIC P10-E1: Qualified Timestamping

**Story P10-S1: Qualified Trust Service Provider Partnership**
- **Description:** Partner with existing QTSP for qualified timestamps.
- **Acceptance Criteria:**
  - Partnership agreement with EU QTSP
  - Integration with QTSP API
  - Qualified timestamp option in UI
  - Clear labeling of qualified vs. non-qualified
- **Business Impact:** Unlocks regulated EU verticals
- **Estimate:** 2 weeks (integration) + partnership timeline

**Story P10-S2: eIDAS Timestamp Display**
- **Description:** Display qualified timestamp metadata per eIDAS.
- **Acceptance Criteria:**
  - QTSP identity shown
  - Certificate chain available
  - Timestamp policy OID displayed
- **Estimate:** 1 week

### EPIC P10-E2: European Digital Identity Wallet Interop

**Story P10-S3: EUDI Wallet Credential Issuance**
- **Description:** Issue credentials to EU Digital Identity Wallets.
- **Acceptance Criteria:**
  - Support common protocols per eIDAS 2.0 Article 5a(5)(a)
  - Credential issuance to wallet
  - Selective disclosure support
- **Timeline:** Dependent on EUDI Wallet rollout (2026-2027)
- **Estimate:** 4-6 weeks

**Story P10-S4: EUDI Wallet Verification**
- **Description:** Verify credentials presented from EUDI Wallets.
- **Acceptance Criteria:**
  - Accept presentations from wallets
  - Verify wallet authenticity
  - Extract claims from presentation
- **Estimate:** 3 weeks

### EPIC P10-E3: Data Residency

**Story P10-S5: EU Data Residency Option**
- **Description:** Host customer data exclusively in EU.
- **Acceptance Criteria:**
  - EU-based infrastructure deployment
  - Org-level region selection
  - Data migration tools
  - Clear region labeling in UI
- **Estimate:** 3 weeks

---

## PRIORITY 11: Developer Platform

*Goal: Enable third-party integrations and platform ecosystem.*

### EPIC P11-E1: Public API

**Story P11-S1: REST API v1**
- **Description:** Stable, documented public API.
- **Acceptance Criteria:**
  - OpenAPI 3.0 specification
  - Versioned endpoints (/v1/)
  - Rate limiting
  - API key management UI
  - Webhook configuration
- **Estimate:** 3 weeks

**Story P11-S2: API Documentation Portal**
- **Description:** Developer-friendly documentation site.
- **Acceptance Criteria:**
  - Interactive API explorer
  - Code samples (Python, Node, cURL)
  - Quickstart guides
  - Authentication guide
- **Estimate:** 2 weeks

**Story P11-S3: Sandbox Environment**
- **Description:** Test environment for developers.
- **Acceptance Criteria:**
  - Isolated sandbox instance
  - Test credentials
  - Simulated anchoring (no real chain)
  - Reset capability
- **Estimate:** 1 week

### EPIC P11-E2: SDKs

**Story P11-S4: JavaScript/TypeScript SDK**
- **Description:** First-party SDK for web and Node.js.
- **Acceptance Criteria:**
  - npm package
  - Full API coverage
  - TypeScript types
  - Browser + Node support
  - Usage examples
- **Estimate:** 2 weeks

**Story P11-S5: Python SDK**
- **Description:** SDK for data/ML teams and backend integrations.
- **Acceptance Criteria:**
  - PyPI package
  - Full API coverage
  - Async support
  - CLI tool
- **Estimate:** 2 weeks

### EPIC P11-E3: Enterprise Integrations

**Story P11-S6: Salesforce Managed Package**
- **Description:** Native Salesforce integration.
- **Acceptance Criteria:**
  - AppExchange listing
  - Record anchoring from Salesforce
  - Verification in Salesforce
  - Audit trail in Salesforce
- **Target Segment:** Enterprise sales
- **Estimate:** 4 weeks

**Story P11-S7: HubSpot Integration**
- **Description:** Document verification in HubSpot workflows.
- **Acceptance Criteria:**
  - HubSpot marketplace app
  - Workflow triggers for anchoring
  - Contact-linked verification
- **Estimate:** 2 weeks

**Story P11-S8: Zapier Integration**
- **Description:** No-code integration via Zapier.
- **Acceptance Criteria:**
  - Zapier app listing
  - Triggers: anchor created, anchor secured
  - Actions: create anchor, verify document
- **Estimate:** 1 week

**Story P11-S9: DocuSign Integration**
- **Description:** Anchor signed documents from DocuSign.
- **Acceptance Criteria:**
  - DocuSign webhook integration
  - Auto-anchor on envelope completion
  - Proof package attachment to envelope
- **Target Segment:** Legal, contracts
- **Estimate:** 2 weeks

---

## PRIORITY 12: Mobile & Offline

*Goal: Enable field verification and mobile-first workflows.*

### EPIC P12-E1: Mobile Applications

**Story P12-S1: iOS App**
- **Description:** Native iOS app for credential holders.
- **Acceptance Criteria:**
  - View credentials
  - Verify documents (camera scan)
  - Share proof links
  - Push notifications
- **Estimate:** 6 weeks

**Story P12-S2: Android App**
- **Description:** Native Android app for credential holders.
- **Acceptance Criteria:**
  - Feature parity with iOS
  - Material Design
- **Estimate:** 6 weeks

### EPIC P12-E2: Offline Verification

**Story P12-S3: Offline Verification Mode**
- **Description:** Verify credentials without network.
- **Acceptance Criteria:**
  - Download verification package
  - Local cryptographic verification
  - Grace period for revocation checks
  - Clear offline indicator
- **Use Case:** Field inspections, remote locations
- **Estimate:** 3 weeks

---

## PRIORITY 13: Analytics & Reporting

*Goal: Provide compliance insights and usage analytics.*

### EPIC P13-E1: Compliance Dashboards

**Story P13-S1: Audit Trail Export**
- **Description:** Export audit events for compliance.
- **Acceptance Criteria:**
  - CSV/JSON export
  - Date range filtering
  - Event type filtering
  - Scheduled exports
- **Estimate:** 1 week

**Story P13-S2: Compliance Reports**
- **Description:** Pre-built compliance report templates.
- **Acceptance Criteria:**
  - SOX compliance report
  - GDPR data subject report
  - Retention policy report
  - Custom report builder
- **Estimate:** 2 weeks

### EPIC P13-E2: Usage Analytics

**Story P13-S3: Admin Dashboard**
- **Description:** Usage metrics for org admins.
- **Acceptance Criteria:**
  - Anchors created/secured over time
  - User activity metrics
  - API usage tracking
  - Cost/usage projections
- **Estimate:** 2 weeks

**Story P13-S4: Verification Analytics**
- **Description:** Track how credentials are being verified.
- **Acceptance Criteria:**
  - Verification count per credential
  - Geographic distribution
  - Verifier analytics (where configured)
  - Time-to-verification metrics
- **Estimate:** 2 weeks

---

## PRIORITY 14: Advanced Document Features

*Goal: Handle complex document workflows.*

### EPIC P14-E1: Multi-Signature

**Story P14-S1: Multi-Party Attestation**
- **Description:** Multiple parties sign/attest to same document.
- **Acceptance Criteria:**
  - Define required signers
  - Signature collection workflow
  - Partial signature state
  - All-signed completion
- **Use Case:** Contracts, agreements
- **Estimate:** 4 weeks

**Story P14-S2: Delegation**
- **Description:** Delegate anchoring authority.
- **Acceptance Criteria:**
  - Delegate definition
  - Scope limits (time, document types)
  - Audit trail for delegated actions
  - Revocation of delegation
- **Estimate:** 2 weeks

### EPIC P14-E2: Document Intelligence

**Story P14-S3: Metadata Extraction**
- **Description:** Extract metadata from documents for indexing.
- **Acceptance Criteria:**
  - PDF metadata extraction
  - Image EXIF data
  - Office document properties
  - Custom field mapping
- **Note:** Client-side only to maintain privacy
- **Estimate:** 2 weeks

**Story P14-S4: Document Classification**
- **Description:** AI-assisted document categorization.
- **Acceptance Criteria:**
  - Suggested category based on filename
  - Custom category taxonomy
  - Bulk categorization
- **Estimate:** 2 weeks

---

## Implementation Timeline (Suggested)

| Quarter | Priorities | Key Deliverables |
|---------|------------|------------------|
| Q1 2026 | P8 | SOC 2 prep, SSO, security whitepaper |
| Q2 2026 | P9 (E1-E2) | W3C VCs, Open Badges |
| Q3 2026 | P10, P11 (E1) | eIDAS, Public API |
| Q4 2026 | P11 (E2-E3), P12 | SDKs, Integrations, Mobile |
| Q1 2027 | P13, P14 | Analytics, Advanced features |

---

## Dependencies & Risks

### External Dependencies
- SOC 2 auditor availability
- QTSP partnership negotiation
- EUDI Wallet specification finalization
- App store review processes

### Technical Risks
- W3C VC spec changes (mitigate: stick to stable core)
- EUDI Wallet interop complexity (mitigate: phased approach)
- Mobile platform fragmentation (mitigate: cross-platform framework)

### Business Risks
- Enterprise sales cycle length
- Competitor moves (DocuSign, Adobe)
- Regulatory changes

---

## Success Metrics

| Metric | Target |
|--------|--------|
| SOC 2 Type II certification | Q2 2026 |
| Enterprise customers (>1000 employees) | 10 by end Q4 2026 |
| API monthly active developers | 100 by end 2026 |
| Credentials issued | 100,000 by end 2026 |
| EU market revenue | 20% of total by Q4 2026 |

---

*This backlog is a living document. Review quarterly and adjust based on customer feedback and market conditions.*
