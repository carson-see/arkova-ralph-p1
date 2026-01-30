# Arkova Competitive Intelligence

*Last updated: 2026-01-30*

## Executive Summary

Arkova operates in the **document verification/timestamping** market, specifically the segment focused on **cryptographic proof of existence and integrity** using blockchain anchoring. This is a narrow but growing niche within the broader $5B+ e-signature and document management market.

**Key differentiator:** Arkova is positioning as **compliance-first verification middleware** — not consumer e-signature, not notarization, but B2B infrastructure for audit trails and evidence anchoring.

---

## Market Landscape

### Three Overlapping Markets

| Market | Size | Arkova's Position |
|--------|------|-------------------|
| **E-Signature** | ~$5B (2025), growing 25% CAGR | Adjacent — not primary competition |
| **Blockchain Timestamping** | ~$200M niche | Direct competition |
| **Compliance/Audit Software** | ~$15B | Target integration layer |

### Target Buyer Segments (per Carson)

- **Law Firms** — Evidence preservation, chain of custody
- **Funds/Financial Services** — Audit trails, regulatory compliance
- **Enterprises** — Document lifecycle, internal compliance
- **Universities** — Credential verification, academic records

---

## Direct Competitors

### 1. **OpenTimestamps** (opentimestamps.org)
- **Model:** Free, open-source Bitcoin timestamping protocol
- **Strengths:** 
  - Free calendar servers (no registration required)
  - Open standard — interoperable
  - Pure Bitcoin anchoring
- **Weaknesses:**
  - No enterprise features (no UI, no audit trail, no RLS)
  - No support, no SLA
  - Technical users only
- **Threat level:** Low (different segment — they're infrastructure, not product)
- **Opportunity:** Could use OTS protocol under the hood for interoperability claims

### 2. **OriginStamp** (originstamp.com)
- **Model:** SaaS timestamping — pivoted to "OriginVault" (audit-proof archiving)
- **Strengths:**
  - Multi-chain (Bitcoin + Ethereum)
  - Enterprise focus
  - White-label ready
  - Targeting 2025 EU e-invoicing mandate
- **Weaknesses:**
  - German-focused (may lack US presence)
  - Pivoting positioning — unclear product focus
- **Threat level:** Medium — similar target market
- **Pricing:** Unknown (enterprise sales)

### 3. **Woleet** (woleet.io)
- **Model:** French SaaS — e-signatures + timestamping
- **Strengths:**
  - GDPR/eIDAS compliant positioning
  - API-first (handles 1000 files/second)
  - "Documents never leave your device" — same privacy model as Arkova
  - 99.99% uptime SLA
- **Weaknesses:**
  - French-first (site in French)
  - Less known in US market
- **Threat level:** Medium-high in EU market
- **Note:** Very similar value prop to Arkova

### 4. **Tierion** (tierion.com)
- **Model:** "Blockchain Proof Engine" — enterprise timestamping
- **Strengths:**
  - Enterprise focus
  - Multiple use cases: IoT, accounting, compliance
  - Verifiable credentials support
- **Weaknesses:**
  - Appears less active (website minimal)
  - Unclear current status
- **Threat level:** Low-medium
- **Note:** May be acquisition target or pivot

### 5. **Sproof** (sproof.com)
- **Model:** Austrian e-signature platform with blockchain
- **Strengths:**
  - Full eIDAS compliance (QES support)
  - Strong EU presence
  - White-label, API-first
  - Microsoft integrations (Teams, SharePoint)
- **Weaknesses:**
  - German/Austrian focus
  - E-signature primary (timestamping secondary)
- **Threat level:** Medium in EU
- **Pricing:** Subscription-based

### 6. **Certifaction** (certifaction.com)
- **Model:** Swiss "Zero Document Knowledge" e-signatures
- **Strengths:**
  - Privacy-first (documents never seen by service)
  - Healthcare sector focus
  - Swiss data residency
- **Weaknesses:**
  - Smaller, niche
  - E-signature focus, not pure timestamping
- **Threat level:** Low
- **Note:** Interesting positioning for privacy-sensitive sectors

---

## Adjacent Players (Not Direct Competitors)

### **DocuSign**
- **What they do:** E-signature market leader
- **Why not direct:** Different product category — signing, not timestamping
- **Relationship:** Potential integration partner or acquirer
- **Risk:** If they add blockchain timestamping, could commoditize the feature

### **Notarize.com / Proof**
- **What they do:** Online notarization (RON)
- **Why not direct:** Human notary in the loop — different value prop
- **Relationship:** Complementary — notarization + timestamping could combine
- **Note:** $25/seal pricing, consumer-focused

### **Blockcerts** (blockcerts.org)
- **What they do:** Open standard for blockchain credentials
- **Why relevant:** Overlaps with university/credential use case
- **Status:** Open-source project, not commercial competitor
- **Note:** Potential interoperability target

---

## Competitive Positioning Matrix

| Feature | Arkova | OpenTimestamps | OriginStamp | Woleet | Tierion |
|---------|--------|----------------|-------------|--------|---------|
| Bitcoin anchoring | ✅ | ✅ | ✅ | ✅ | ✅ |
| Enterprise UI | ✅ | ❌ | ✅ | ✅ | ✅ |
| Multi-tenant RLS | ✅ | N/A | ? | ? | ? |
| Audit trail | ✅ | ❌ | ? | ✅ | ✅ |
| Legal hold | ✅ | ❌ | ? | ? | ? |
| Privacy (fingerprint-only) | ✅ | ✅ | ? | ✅ | ? |
| Open-source | ❌ | ✅ | ❌ | ❌ | ❌ |
| Free tier | ? | ✅ | ? | ✅ | ? |
| SOC 2 | ❌ (needed) | N/A | ? | ? | ? |
| eIDAS qualified | ❌ | ❌ | ? | ✅ | ❌ |

---

## Arkova's Differentiation

### What Arkova Does That Others Don't (or Don't Emphasize)

1. **Compliance-first architecture**
   - Legal hold at DB level
   - Retention policies built-in
   - Append-only audit events
   - Most competitors bolt this on later

2. **Non-custodial, fingerprint-only**
   - Same as Woleet, but more explicit
   - Documents never touch servers — regulatory advantage

3. **Multi-tenant enterprise design**
   - RLS from day one
   - Org admin hierarchies
   - Most timestamping tools are single-user or flat

4. **Terminology discipline**
   - No "crypto" language in UI
   - Frames as compliance infrastructure, not blockchain
   - Reduces buyer friction in regulated industries

### What Arkova Needs to Win

| Gap | Priority | Notes |
|-----|----------|-------|
| SOC 2 Type II | 🔴 Critical | Enterprise buyers require |
| Pricing/packaging | 🔴 Critical | No clear model yet |
| Public case studies | 🟡 High | Social proof for sales |
| eIDAS positioning | 🟡 High | EU market requires |
| Integrations (Salesforce, etc.) | 🟡 Medium | Enterprise distribution |
| API documentation | 🟡 Medium | Developer adoption |

---

## Market Trends

### Tailwinds

1. **EU e-invoicing mandate (2025)** — OriginStamp explicitly targeting this
2. **Increasing audit/compliance costs** — $3M+ per audit for public companies
3. **Remote work** — accelerated digital document adoption
4. **Credential fraud** — $600B+ problem globally
5. **AI-generated content** — provenance/authenticity becoming critical

### Headwinds

1. **Blockchain skepticism** — "crypto" association in regulated industries
2. **eIDAS 2.0** — may require qualified trust services (higher bar)
3. **Big tech entry** — Microsoft/Google could add timestamping to existing products
4. **Economic pressure** — compliance budgets may be cut in downturn

---

## Strategic Recommendations

### Short-term (0-6 months)
1. Get SOC 2 readiness assessment
2. Develop pricing model (per-anchor? per-seat? tiered?)
3. Create security whitepaper for enterprise sales
4. Build 2-3 case studies (even design partners)

### Medium-term (6-18 months)
1. Complete SOC 2 Type II
2. Add eIDAS-qualified timestamp option (partner with EU TSP)
3. Build Salesforce/HubSpot integration
4. Establish US + EU data residency options

### Long-term (18+ months)
1. Consider OTS protocol compatibility for interoperability claims
2. Explore credential issuance (Blockcerts-compatible)
3. Potential acquisition targets: smaller EU players

---

## Key Competitor URLs

- https://opentimestamps.org/
- https://originstamp.com/
- https://woleet.io/
- https://tierion.com/
- https://www.sproof.com/
- https://certifaction.com/
- https://www.blockcerts.org/
- https://www.docusign.com/ (adjacent)
- https://www.notarize.com/ (adjacent)

---

*This document should be updated quarterly as the competitive landscape evolves.*
