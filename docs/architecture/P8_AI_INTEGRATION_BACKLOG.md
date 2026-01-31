# PRIORITY 8: AI-Powered Intelligence (Gemini Integration)

**Status:** Draft  
**Dependencies:** Priority 4 (Anchor Engine), Priority 6 (Bulk Verification)  
**Estimated Duration:** 10-12 weeks  
**Business Value:** Major competitive differentiator — no competitor offers AI-powered document processing or fraud detection

---

## Priority Overview

Priority 8 introduces Google Gemini AI integration to transform Arkova from a verification platform into an intelligent document processing system. This priority delivers five key capabilities:

1. **Smart Document Extraction** — Auto-fill metadata from uploaded credentials
2. **AI-Powered Fraud Detection** — Analyze documents for tampering before anchoring
3. **Semantic Search** — Natural language search across all anchored documents
4. **Intelligent Batch Processing** — AI-assisted bulk upload with validation
5. **Auto-Generated Reports** — AI-written audit summaries and compliance reports

---

## EPIC P8-E1: AI Infrastructure & Configuration

*Epic Description:* Establish the foundational infrastructure for Gemini API integration including API management, rate limiting, cost tracking, and error handling. All subsequent AI features depend on this infrastructure.

### Story P8-S1: Gemini API Integration Setup

**As a** developer  
**I want** a configured and tested Gemini API integration  
**So that** all AI features have a reliable foundation to build on

**Acceptance Criteria:**
- Gemini API client configured in `services/worker/lib/ai/`
- API key stored securely in environment secrets (not in code)
- Health check endpoint verifies API connectivity
- Error handling for API failures with graceful degradation
- Rate limiting implemented (3 req/sec to avoid quota issues)

**Definition of Done:**
- API client can call Gemini Flash and Pro models
- Health check passes in CI
- No API keys committed to repository
- Error handling tested with mock failures

**Tasks:**
- (BE) Create `services/worker/lib/ai/gemini-client.ts`
- (BE) Add API key to secrets management
- (BE) Implement rate limiter with token bucket
- (BE) Add health check endpoint `/api/health/ai`
- (BE) Write unit tests with mocked API responses
- (Docs) Document AI configuration in `docs/confluence/12_ai_integration.md`

**Story Points:** 5

---

### Story P8-S2: AI Cost Tracking & Monitoring

**As an** Arkova admin  
**I want** visibility into AI API usage and costs  
**So that** we can monitor expenses and optimize usage

**Acceptance Criteria:**
- All AI API calls logged with: timestamp, model, tokens, cost estimate
- Daily/monthly cost aggregation available
- Alerts when usage exceeds thresholds
- Per-organization usage tracking for future billing

**Definition of Done:**
- AI usage table exists with proper indexes
- Dashboard shows usage metrics
- Alert thresholds configurable

**Tasks:**
- (BE) Create `ai_usage_log` table with migration
- (BE) Add logging middleware to Gemini client
- (FE) Create admin AI usage dashboard component
- (BE) Implement threshold alerts
- (Docs) Update data model docs

**Story Points:** 3

---

### Story P8-S3: AI Feature Flags & Graceful Degradation

**As a** product owner  
**I want** feature flags to control AI features per organization  
**So that** we can gradually roll out and disable features if needed

**Acceptance Criteria:**
- Feature flags for: extraction, fraud_detection, semantic_search, batch_ai, reports
- Flags configurable per organization
- UI gracefully hides AI features when disabled
- Manual entry fallback always available

**Definition of Done:**
- Feature flag system implemented
- Admin can toggle flags per org
- UI adapts based on flags

**Tasks:**
- (BE) Add `ai_features` JSONB column to `organizations` table
- (BE) Create feature flag check utility
- (FE) Add conditional rendering for AI features
- (FE) Create admin feature flag management UI

**Story Points:** 3

---

## EPIC P8-E2: Smart Document Extraction

*Epic Description:* Implement AI-powered automatic extraction of metadata from uploaded credential documents. This reduces manual data entry by 90%+ and improves accuracy.

### Story P8-S4: Document Extraction Service

**As a** user uploading a credential  
**I want** the system to automatically extract document information  
**So that** I don't have to manually enter all the details

**Acceptance Criteria:**
- Service accepts document buffer and returns structured extraction
- Supports PDF, JPEG, PNG document formats
- Returns confidence scores (0-1) for each extracted field
- Extraction completes in <5 seconds for typical documents
- Handles extraction failures gracefully

**Definition of Done:**
- Extraction service deployed and tested
- 95%+ accuracy on test document set
- Error handling for corrupt/unreadable documents

**Tasks:**
- (BE) Create `services/worker/lib/ai/extraction-service.ts`
- (BE) Design extraction prompt with field definitions
- (BE) Implement confidence score parsing
- (BE) Add timeout handling (5s max)
- (BE) Write integration tests with sample documents
- (Docs) Document extraction API in `docs/confluence/12_ai_integration.md`

**Story Points:** 8

---

### Story P8-S5: Extraction UI Integration

**As a** user uploading a credential  
**I want** to see pre-filled form fields with confidence indicators  
**So that** I can quickly verify and correct the extracted data

**Acceptance Criteria:**
- Upload triggers extraction automatically
- Form fields pre-populated with extracted values
- Confidence indicators: green (>90%), yellow (70-90%), red (<70%)
- User can edit any field before submission
- Loading state shown during extraction
- Manual entry fallback if extraction fails

**Definition of Done:**
- UI shows extracted data with confidence colors
- User corrections are easy
- Fallback to manual entry works

**Tasks:**
- (FE) Create `ExtractionResultForm` component
- (FE) Add confidence indicator badges
- (FE) Implement loading skeleton during extraction
- (FE) Add "Enter manually" fallback button
- (FE) Write component tests

**Story Points:** 5

---

### Story P8-S6: Extraction Learning & Improvement

**As a** product owner  
**I want** to track extraction corrections  
**So that** we can improve prompts over time

**Acceptance Criteria:**
- Store original extraction alongside user corrections
- Flag fields with frequent corrections
- Generate correction report for prompt tuning

**Definition of Done:**
- Corrections logged to database
- Report available for analysis

**Tasks:**
- (BE) Add `extraction_corrections` table
- (BE) Log corrections on credential save
- (BE) Create correction analysis query
- (Docs) Document improvement process

**Story Points:** 3

---

## EPIC P8-E3: AI-Powered Fraud Detection

*Epic Description:* Implement document fraud analysis to detect signs of tampering, forgery, or inconsistency before anchoring. This is a major competitive differentiator — no competitor offers this capability.

### Story P8-S7: Fraud Analysis Service

**As a** system  
**I want** to analyze documents for fraud indicators  
**So that** we can flag suspicious credentials before anchoring

**Acceptance Criteria:**
- Service accepts document and returns fraud analysis
- Checks: visual inconsistencies, logical impossibilities, formatting anomalies
- Returns: overall risk (low/medium/high), risk score (0-100), findings list
- Uses Gemini Pro for deeper analysis
- Completes in <10 seconds

**Definition of Done:**
- Fraud service deployed and tested
- Detects 90%+ of known fraud samples
- False positive rate <10%

**Tasks:**
- (BE) Create `services/worker/lib/ai/fraud-service.ts`
- (BE) Design fraud detection prompt
- (BE) Implement risk scoring logic
- (BE) Create test suite with known fraud samples
- (BE) Tune prompts for accuracy
- (Docs) Document fraud detection in `docs/confluence/12_ai_integration.md`

**Story Points:** 13

---

### Story P8-S8: Fraud Detection UI

**As a** user uploading a credential  
**I want** to see fraud analysis results  
**So that** I can make informed decisions about suspicious documents

**Acceptance Criteria:**
- Fraud analysis runs automatically (can be disabled)
- Results shown in clear UI: risk level, findings, recommendations
- High-risk documents require explicit acknowledgment to proceed
- Option to request manual review
- Audit log records fraud analysis results

**Definition of Done:**
- UI displays fraud results clearly
- High-risk flow requires confirmation
- Results logged for audit

**Tasks:**
- (FE) Create `FraudAnalysisResults` component
- (FE) Implement risk level styling (green/yellow/red)
- (FE) Add "Proceed anyway" confirmation modal for high risk
- (FE) Add "Request review" button
- (BE) Log fraud results to audit_events
- (FE) Write component tests

**Story Points:** 5

---

### Story P8-S9: Fraud Review Workflow

**As an** organization admin  
**I want** to review flagged documents  
**So that** I can make final decisions on suspicious credentials

**Acceptance Criteria:**
- Admin dashboard shows flagged documents queue
- Admin can view document, fraud findings, and extracted data
- Admin can: approve, reject, or request more info
- Decision logged with timestamp and admin ID
- Notification sent to uploader on decision

**Definition of Done:**
- Review queue functional
- Decisions logged and notified

**Tasks:**
- (BE) Add `fraud_review_status` enum and column
- (FE) Create `FraudReviewQueue` admin component
- (FE) Create `FraudReviewDetail` component
- (BE) Implement decision logging
- (BE) Add notification on decision
- (Docs) Document review workflow

**Story Points:** 8

---

## EPIC P8-E4: Semantic Search

*Epic Description:* Implement natural language search across all anchored credentials using vector embeddings. Users can search with queries like "engineering degrees from 2020" instead of exact field matches.

### Story P8-S10: Vector Storage Setup (pgvector)

**As a** developer  
**I want** vector storage capability in our database  
**So that** we can store and search document embeddings

**Acceptance Criteria:**
- pgvector extension enabled in Supabase
- `embedding` column added to credentials table
- Similarity search index created
- Search function implemented

**Definition of Done:**
- pgvector working in Supabase
- Similarity search returns results

**Tasks:**
- (BE) Enable pgvector extension in Supabase
- (BE) Add migration for embedding column (vector(768))
- (BE) Create ivfflat index for cosine similarity
- (BE) Create `match_credentials` SQL function
- (BE) Test similarity search performance
- (Docs) Document vector search in data model

**Story Points:** 5

---

### Story P8-S11: Embedding Generation Service

**As a** system  
**I want** to generate embeddings for all anchored credentials  
**So that** they become searchable via semantic search

**Acceptance Criteria:**
- Embeddings generated on credential anchor
- Uses Gemini text-embedding-004 model
- Embedding stored in credentials table
- Backfill job for existing credentials

**Definition of Done:**
- New credentials get embeddings automatically
- Existing credentials backfilled

**Tasks:**
- (BE) Create `services/worker/lib/ai/embedding-service.ts`
- (BE) Add embedding generation to anchor workflow
- (BE) Create backfill job for existing credentials
- (BE) Add embedding generation to batch processing
- (Docs) Document embedding process

**Story Points:** 5

---

### Story P8-S12: Semantic Search UI

**As a** user  
**I want** to search my credentials using natural language  
**So that** I can find documents without knowing exact field values

**Acceptance Criteria:**
- Search box accepts natural language queries
- Results ranked by relevance (similarity score)
- Results show match percentage
- Search completes in <2 seconds
- Fallback to traditional search if semantic fails

**Definition of Done:**
- Semantic search working end-to-end
- UI shows relevance-ranked results

**Tasks:**
- (FE) Create `SemanticSearchInput` component
- (BE) Create `/api/search/semantic` endpoint
- (FE) Create `SemanticSearchResults` component with relevance scores
- (FE) Add search loading state
- (FE) Implement traditional search fallback
- (FE) Write integration tests

**Story Points:** 8

---

## EPIC P8-E5: Intelligent Batch Processing

*Epic Description:* Enhance the bulk verification wizard (Priority 6) with AI-powered extraction and fraud detection for processing thousands of credentials at once.

### Story P8-S13: Batch AI Processing Pipeline

**As an** organization admin  
**I want** AI processing for bulk credential uploads  
**So that** I can process thousands of documents efficiently

**Acceptance Criteria:**
- Batch upload triggers AI extraction for all documents
- Fraud detection runs on all documents
- Processing is parallelized (10 concurrent)
- Progress tracked in real-time
- Documents categorized: ready, flagged, error

**Definition of Done:**
- Batch processing with AI working
- 1000 docs/hour throughput minimum

**Tasks:**
- (BE) Create batch AI processing queue
- (BE) Implement parallel processing with rate limiting
- (BE) Add progress tracking via WebSocket or polling
- (BE) Categorize results by status
- (BE) Write load tests for 5000 document batch
- (Docs) Document batch processing pipeline

**Story Points:** 13

---

### Story P8-S14: Batch Processing Dashboard

**As an** organization admin  
**I want** to monitor batch processing progress  
**So that** I can track uploads and handle flagged items

**Acceptance Criteria:**
- Dashboard shows: total, processed, pending, flagged, errors
- Progress bar with percentage and ETA
- List of flagged documents with fraud findings
- Bulk actions: approve all ready, review flagged
- Export results to CSV

**Definition of Done:**
- Dashboard shows real-time progress
- Bulk actions working

**Tasks:**
- (FE) Create `BatchProcessingDashboard` component
- (FE) Implement real-time progress updates
- (FE) Create flagged documents list with expand/collapse
- (FE) Add bulk action buttons
- (FE) Add CSV export
- (FE) Write component tests

**Story Points:** 8

---

## EPIC P8-E6: Auto-Generated Reports

*Epic Description:* Use Gemini to generate human-readable audit reports, compliance summaries, and verification certificates from credential data.

### Story P8-S15: Report Generation Service

**As an** organization admin  
**I want** AI-generated audit reports  
**So that** I can produce compliance documentation quickly

**Acceptance Criteria:**
- Report types: audit summary, batch summary, risk assessment
- Reports generated from credential data and statistics
- Reports are professional and compliance-ready
- PDF and DOCX export options

**Definition of Done:**
- Report generation working for all types
- Export to PDF/DOCX functional

**Tasks:**
- (BE) Create `services/worker/lib/ai/report-service.ts`
- (BE) Design report generation prompts
- (BE) Implement PDF generation (puppeteer or similar)
- (BE) Implement DOCX generation (docx library)
- (BE) Create report templates
- (Docs) Document report types and formats

**Story Points:** 8

---

### Story P8-S16: Report Generation UI

**As an** organization admin  
**I want** to generate reports from the dashboard  
**So that** I can create audit documentation on demand

**Acceptance Criteria:**
- Report type selector with date range
- Preview report before download
- Download as PDF or DOCX
- Report history with re-download option

**Definition of Done:**
- Report generation UI working
- Download functional

**Tasks:**
- (FE) Create `ReportGenerator` component
- (FE) Add report type selector and date picker
- (FE) Implement report preview modal
- (FE) Add download buttons for PDF/DOCX
- (FE) Create report history list
- (FE) Write component tests

**Story Points:** 5

---

## Technical Constraints (AI-Specific)

### Model Selection

| Use Case | Model | Rationale |
|----------|-------|-----------|
| Extraction | gemini-1.5-flash | Fast, cheap, good for structured extraction |
| Fraud Detection | gemini-1.5-pro | Deeper analysis, better reasoning |
| Embeddings | text-embedding-004 | Optimized for semantic search |
| Reports | gemini-1.5-flash | Fast generation, adequate quality |

### Rate Limiting

- Global: 3 requests/second to Gemini API
- Per-organization: 100 requests/hour (configurable)
- Batch processing: Queue-based with backoff

### Cost Controls

- Daily cost cap: $100 (configurable)
- Alert at 80% of cap
- Auto-disable AI features at 100% cap
- Per-org cost tracking for future billing

### Error Handling

- All AI features have manual fallback
- API failures logged but don't block user flow
- Retry with exponential backoff (max 3 attempts)
- Circuit breaker after 10 consecutive failures

### Security

- API key in secrets manager only
- No document content logged (only metadata)
- Extracted PII follows existing data policies
- Fraud results are internal (not shared externally)

---

## Acceptance Criteria (Priority Level)

Priority 8 is complete when:

- [ ] All 16 stories completed and deployed
- [ ] AI extraction accuracy >95% on test set
- [ ] Fraud detection rate >90% on known samples
- [ ] Semantic search returns relevant results in <2s
- [ ] Batch processing handles 5000 docs without failure
- [ ] Cost tracking operational with alerts
- [ ] Feature flags allow per-org control
- [ ] All features have manual fallback
- [ ] Documentation updated (Confluence + API docs)
- [ ] No AI API keys in codebase

---

## Story Point Summary

| Epic | Stories | Total Points |
|------|---------|--------------|
| P8-E1: AI Infrastructure | 3 | 11 |
| P8-E2: Smart Extraction | 3 | 16 |
| P8-E3: Fraud Detection | 3 | 26 |
| P8-E4: Semantic Search | 3 | 18 |
| P8-E5: Batch Processing | 2 | 21 |
| P8-E6: Auto Reports | 2 | 13 |
| **Total** | **16** | **105** |

**Estimated Duration:** 10-12 weeks (assuming 10-15 points/week velocity)

---

*Last Updated: January 2026*
