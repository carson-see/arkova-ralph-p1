# Arkova AI Integration Specification

**Feature Spec: Google Gemini Integration for Intelligent Document Processing**

*Version 1.0 | January 2026*

---

## Executive Summary

This document outlines how Arkova can integrate Google's Gemini AI to transform document verification from a manual process into an intelligent, automated experience. The integration focuses on three core capabilities: automatic data extraction, fraud detection, and semantic search.

**Key Benefits:**
- 10x faster credential onboarding
- Reduced manual data entry errors
- AI-powered fraud detection (competitive differentiator)
- Semantic search across all anchored documents
- Enterprise-scale batch processing

**Estimated AI Costs:** $1-50/month for typical university (5,000-15,000 credentials/year)

---

## Use Case 1: Smart Document Processing

### Problem
Currently, users must manually enter metadata when uploading credentials:
- Name
- Institution
- Degree/Certificate Type
- Issue Date
- Student/Employee ID
- Additional fields

This is time-consuming, error-prone, and doesn't scale for bulk uploads.

### Solution
Use Gemini to automatically extract structured data from uploaded documents.

### User Flow

**Before (Manual):**
1. User uploads diploma.pdf
2. User manually fills 6-10 form fields
3. User submits
4. System creates anchor

**After (AI-Assisted):**
1. User uploads diploma.pdf
2. System sends to Gemini for extraction
3. UI displays pre-filled fields with confidence scores
4. User reviews and confirms (one click if correct)
5. System creates anchor

### Technical Implementation

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Upload    │────▶│   Gemini    │────▶│  Pre-fill   │
│   (PDF)     │     │  Extract    │     │    Form     │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Extracted  │
                    │    Data     │
                    │  + Scores   │
                    └─────────────┘
```

### API Call Example

```javascript
const extractCredentialData = async (documentBuffer, mimeType) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `
    Extract the following information from this credential document.
    Return JSON with confidence scores (0-1) for each field.
    
    Required fields:
    - recipientName: Full name of the credential recipient
    - issuerName: Institution or organization that issued this
    - credentialType: Type of credential (diploma, certificate, license, etc.)
    - issueDate: Date issued (ISO format if possible)
    - expirationDate: Expiration date if applicable (null if none)
    - credentialId: Any ID number, student ID, certificate number
    - fieldOfStudy: Major, specialization, or subject area
    - honors: Any honors, distinctions, or special recognitions
    - additionalInfo: Any other relevant information
    
    Return ONLY valid JSON, no markdown.
  `;
  
  const result = await model.generateContent([
    prompt,
    { inlineData: { data: documentBuffer.toString('base64'), mimeType } }
  ]);
  
  return JSON.parse(result.response.text());
};
```

### Expected Output

```json
{
  "recipientName": {
    "value": "Jane Elizabeth Smith",
    "confidence": 0.98
  },
  "issuerName": {
    "value": "Ohio State University",
    "confidence": 0.99
  },
  "credentialType": {
    "value": "Bachelor of Science",
    "confidence": 0.97
  },
  "issueDate": {
    "value": "2024-05-15",
    "confidence": 0.95
  },
  "expirationDate": {
    "value": null,
    "confidence": 1.0
  },
  "credentialId": {
    "value": "OSU-2024-BS-78432",
    "confidence": 0.92
  },
  "fieldOfStudy": {
    "value": "Computer Science",
    "confidence": 0.96
  },
  "honors": {
    "value": "Magna Cum Laude",
    "confidence": 0.94
  },
  "additionalInfo": {
    "value": "Minor in Mathematics",
    "confidence": 0.88
  }
}
```

### UI/UX Considerations

1. **Confidence Thresholds:**
   - High (>0.9): Auto-fill, green indicator
   - Medium (0.7-0.9): Auto-fill, yellow indicator, suggest review
   - Low (<0.7): Leave blank or show suggestion with red indicator

2. **Fallback:** If extraction fails, gracefully fall back to manual entry

3. **Learning:** Store corrections to improve prompts over time

### Cost Estimate

| Volume | Model | Cost/Doc | Monthly Cost |
|--------|-------|----------|--------------|
| 1,000 docs | Flash | $0.0001 | $0.10 |
| 5,000 docs | Flash | $0.0001 | $0.50 |
| 15,000 docs | Flash | $0.0001 | $1.50 |

---

## Use Case 2: AI-Powered Fraud Detection

### Problem
Credential fraud is a $1B+ problem. Current verification is binary (anchored or not) but doesn't assess document authenticity before anchoring.

### Solution
Use Gemini to analyze documents for signs of tampering, inconsistencies, or fraud indicators before anchoring.

### Fraud Indicators to Detect

| Category | Indicators |
|----------|------------|
| **Visual** | Misaligned text, inconsistent fonts, pixelation around text, unusual spacing |
| **Content** | Impossible dates, non-existent institutions, formatting inconsistencies |
| **Metadata** | PDF creation date vs. claimed issue date mismatch, editing software traces |
| **Logical** | Degree date before birth year, future dates, impossible combinations |

### User Flow

1. User uploads document
2. System runs fraud analysis in parallel with extraction
3. Results displayed:
   - ✅ No issues detected
   - ⚠️ Potential concerns (with details)
   - 🚨 High-risk indicators (requires review)

### Technical Implementation

```javascript
const analyzeForFraud = async (documentBuffer, mimeType, extractedData) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  
  const prompt = `
    You are a document fraud detection expert. Analyze this credential document
    for signs of tampering, forgery, or inconsistency.
    
    Extracted data for reference:
    ${JSON.stringify(extractedData)}
    
    Check for:
    1. Visual inconsistencies (fonts, alignment, resolution differences)
    2. Logical impossibilities (dates, sequences, combinations)
    3. Formatting anomalies (unusual layouts for this document type)
    4. Content red flags (spelling errors in official docs, wrong terminology)
    5. Metadata concerns (if visible in document)
    
    Return JSON:
    {
      "overallRisk": "low" | "medium" | "high",
      "riskScore": 0-100,
      "findings": [
        {
          "category": "visual|content|logical|metadata",
          "severity": "info|warning|critical",
          "description": "what was found",
          "location": "where in document (if applicable)"
        }
      ],
      "recommendation": "proceed|review|reject",
      "summary": "brief human-readable summary"
    }
  `;
  
  const result = await model.generateContent([
    prompt,
    { inlineData: { data: documentBuffer.toString('base64'), mimeType } }
  ]);
  
  return JSON.parse(result.response.text());
};
```

### Expected Output

```json
{
  "overallRisk": "medium",
  "riskScore": 45,
  "findings": [
    {
      "category": "visual",
      "severity": "warning",
      "description": "Font rendering around graduation date appears inconsistent with surrounding text",
      "location": "Center of document, date field"
    },
    {
      "category": "content",
      "severity": "info",
      "description": "Institution name matches known university database",
      "location": "Header"
    }
  ],
  "recommendation": "review",
  "summary": "Document shows minor visual inconsistencies around the date field that warrant manual review. Other elements appear authentic."
}
```

### UI Display

```
┌─────────────────────────────────────────────────────┐
│  🔍 Fraud Analysis Results                          │
├─────────────────────────────────────────────────────┤
│  Overall Risk: ⚠️ MEDIUM (45/100)                   │
│                                                     │
│  Findings:                                          │
│  ⚠️ Font inconsistency near graduation date         │
│  ✅ Institution verified in database                │
│  ✅ Date format matches expected pattern            │
│                                                     │
│  Recommendation: Manual review suggested            │
│                                                     │
│  [Proceed Anyway]  [Request Review]  [Reject]       │
└─────────────────────────────────────────────────────┘
```

### Competitive Advantage

**No competitor offers this.** This positions Arkova as not just a verification platform but a fraud prevention platform.

### Cost Estimate

Using Gemini Pro for deeper analysis:

| Volume | Model | Cost/Doc | Monthly Cost |
|--------|-------|----------|--------------|
| 1,000 docs | Pro | $0.001 | $1.00 |
| 5,000 docs | Pro | $0.001 | $5.00 |
| 15,000 docs | Pro | $0.001 | $15.00 |

---

## Use Case 3: Semantic Search

### Problem
As organizations anchor thousands of documents, finding specific credentials becomes difficult. Traditional search requires exact field matches.

### Solution
Implement semantic search using Gemini embeddings, allowing natural language queries across all anchored documents.

### Example Queries

| Query | Traditional Search | Semantic Search |
|-------|-------------------|-----------------|
| "engineering degrees from 2020" | ❌ Requires exact field filters | ✅ Understands intent |
| "certificates expiring soon" | ❌ Manual date calculation | ✅ Understands "soon" |
| "Jane's nursing credentials" | ❌ Exact name match only | ✅ Handles variations |
| "accredited institutions in Ohio" | ❌ Not possible | ✅ Cross-references |

### Technical Implementation

#### 1. Generate Embeddings on Anchor

```javascript
const generateEmbedding = async (documentMetadata) => {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  
  // Create searchable text from metadata
  const searchText = `
    ${documentMetadata.recipientName}
    ${documentMetadata.issuerName}
    ${documentMetadata.credentialType}
    ${documentMetadata.fieldOfStudy}
    Issued: ${documentMetadata.issueDate}
    ${documentMetadata.additionalInfo || ''}
  `;
  
  const result = await model.embedContent(searchText);
  return result.embedding.values; // 768-dimensional vector
};
```

#### 2. Store in Vector Database

Options:
- **Supabase pgvector** (already using Supabase)
- **Pinecone** (managed, scales well)
- **Weaviate** (open source)

Recommended: **Supabase pgvector** — no new infrastructure

```sql
-- Add vector column to credentials table
ALTER TABLE credentials ADD COLUMN embedding vector(768);

-- Create index for fast similarity search
CREATE INDEX ON credentials 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

#### 3. Search Flow

```javascript
const semanticSearch = async (query, organizationId, limit = 20) => {
  // Generate embedding for query
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const queryEmbedding = await model.embedContent(query);
  
  // Search using cosine similarity
  const results = await supabase.rpc('match_credentials', {
    query_embedding: queryEmbedding.embedding.values,
    org_id: organizationId,
    match_threshold: 0.7,
    match_count: limit
  });
  
  return results;
};
```

```sql
-- Supabase function for similarity search
CREATE FUNCTION match_credentials(
  query_embedding vector(768),
  org_id uuid,
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  recipient_name text,
  credential_type text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.recipient_name,
    c.credential_type,
    1 - (c.embedding <=> query_embedding) as similarity
  FROM credentials c
  WHERE c.organization_id = org_id
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### UI Example

```
┌─────────────────────────────────────────────────────┐
│  🔍 Search credentials...                           │
│  ┌─────────────────────────────────────────────┐   │
│  │ engineering degrees from Big Ten schools    │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Results (23 found):                                │
│                                                     │
│  📄 Jane Smith - BS Computer Engineering            │
│     Ohio State University | 2024 | 98% match       │
│                                                     │
│  📄 John Doe - MS Electrical Engineering            │
│     University of Michigan | 2023 | 95% match      │
│                                                     │
│  📄 Sarah Johnson - BS Mechanical Engineering       │
│     Penn State | 2024 | 93% match                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Cost Estimate

Embeddings are very cheap:

| Volume | Cost/Embedding | Monthly Cost |
|--------|----------------|--------------|
| 5,000 docs | $0.00001 | $0.05 |
| 15,000 docs | $0.00001 | $0.15 |
| + 10,000 searches | $0.00001 | $0.10 |

---

## Use Case 4: Batch Processing

### Problem
Universities need to process thousands of credentials at once (graduation season, historical digitization). Manual processing doesn't scale.

### Solution
AI-powered batch upload with automatic extraction, validation, and optional fraud screening.

### User Flow

1. Admin uploads CSV/ZIP with documents
2. System queues all documents for AI processing
3. Dashboard shows progress: Processed / Pending / Flagged
4. Admin reviews flagged items
5. Bulk anchor all approved documents

### Technical Implementation

```javascript
const processBatch = async (files, organizationId) => {
  const queue = [];
  
  for (const file of files) {
    queue.push({
      id: uuid(),
      file,
      status: 'pending',
      organizationId
    });
  }
  
  // Process in parallel with rate limiting
  const results = await pMap(queue, async (item) => {
    try {
      // Extract data
      const extracted = await extractCredentialData(item.file.buffer, item.file.mimeType);
      
      // Run fraud check
      const fraudAnalysis = await analyzeForFraud(item.file.buffer, item.file.mimeType, extracted);
      
      // Generate embedding
      const embedding = await generateEmbedding(extracted);
      
      return {
        ...item,
        status: fraudAnalysis.overallRisk === 'high' ? 'flagged' : 'ready',
        extracted,
        fraudAnalysis,
        embedding
      };
    } catch (error) {
      return { ...item, status: 'error', error: error.message };
    }
  }, { concurrency: 10 });
  
  return results;
};
```

### Dashboard UI

```
┌─────────────────────────────────────────────────────┐
│  📦 Batch Upload: Spring 2024 Graduates             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Progress: ████████████░░░░░░░░ 60%                │
│                                                     │
│  ✅ Processed: 3,247                                │
│  ⏳ Pending: 2,153                                  │
│  ⚠️ Flagged: 23                                     │
│  ❌ Errors: 2                                       │
│                                                     │
│  [View Flagged]  [View Errors]  [Anchor All Ready] │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Cost Estimate (Batch of 5,000)

| Operation | Cost |
|-----------|------|
| Extraction (Flash) | $0.50 |
| Fraud Detection (Pro) | $5.00 |
| Embeddings | $0.05 |
| **Total** | **$5.55** |

---

## Use Case 5: Auto-Generated Reports

### Problem
Organizations need to produce audit reports, compliance summaries, and verification statistics. Currently manual.

### Solution
Use Gemini to generate human-readable reports from verification data.

### Report Types

1. **Audit Summary** — For compliance officers / regulators
2. **Verification Certificate** — Formal proof for third parties
3. **Batch Summary** — Overview of bulk upload results
4. **Risk Assessment** — Fraud analysis summary

### Example: Generate Audit Report

```javascript
const generateAuditReport = async (organizationId, dateRange) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  // Fetch relevant data
  const verifications = await getVerifications(organizationId, dateRange);
  const stats = calculateStats(verifications);
  
  const prompt = `
    Generate a professional audit report for credential verifications.
    
    Organization: ${organization.name}
    Period: ${dateRange.start} to ${dateRange.end}
    
    Statistics:
    - Total credentials anchored: ${stats.total}
    - Unique recipients: ${stats.uniqueRecipients}
    - Credential types: ${JSON.stringify(stats.byType)}
    - Verification requests: ${stats.verificationRequests}
    - Fraud flags raised: ${stats.fraudFlags}
    
    Generate a formal report suitable for regulatory review including:
    1. Executive Summary
    2. Verification Activity Overview
    3. Integrity Metrics
    4. Notable Findings
    5. Recommendations
    
    Use professional tone appropriate for compliance documentation.
  `;
  
  const result = await model.generateContent(prompt);
  return result.response.text();
};
```

---

## Implementation Roadmap

### Phase 1: Smart Extraction (2-3 weeks)
- [ ] Integrate Gemini API
- [ ] Build extraction prompt engineering
- [ ] Create confidence-based UI
- [ ] Add fallback to manual entry
- [ ] Test with sample credentials

### Phase 2: Fraud Detection (2-3 weeks)
- [ ] Develop fraud analysis prompts
- [ ] Build risk scoring system
- [ ] Create review workflow UI
- [ ] Test with known fraud samples
- [ ] Tune thresholds

### Phase 3: Semantic Search (2 weeks)
- [ ] Add pgvector to Supabase
- [ ] Generate embeddings on anchor
- [ ] Build search API
- [ ] Create search UI
- [ ] Backfill existing credentials

### Phase 4: Batch Processing (2 weeks)
- [ ] Build batch upload API
- [ ] Create processing queue
- [ ] Build progress dashboard
- [ ] Add bulk anchor flow
- [ ] Test at scale (10K+ docs)

### Phase 5: Reporting (1-2 weeks)
- [ ] Design report templates
- [ ] Build generation API
- [ ] Create export options (PDF, DOCX)
- [ ] Add to admin dashboard

---

## Cost Summary

### Per-Document Costs

| Feature | Model | Cost/Doc |
|---------|-------|----------|
| Extraction | Flash | $0.0001 |
| Fraud Detection | Pro | $0.001 |
| Embedding | text-embedding-004 | $0.00001 |
| **Total** | — | **$0.00111** |

### Monthly Projections by Tier

| Tier | Docs/Month | AI Cost | % of Subscription |
|------|------------|---------|-------------------|
| Department (5K) | 5,000 | $5.55 | 0.04% of $15K |
| Registrar (15K) | 15,000 | $16.65 | 0.04% of $45K |
| Enterprise (50K) | 50,000 | $55.50 | — |

**Conclusion:** AI costs are negligible relative to subscription pricing. This is a high-margin feature add.

---

## Security Considerations

1. **Data Privacy:** Documents sent to Gemini API are subject to Google's data policies. Review for compliance with customer contracts.

2. **PII Handling:** Extracted PII should be handled per existing data policies. Consider:
   - Data residency requirements
   - Retention policies
   - Access controls

3. **API Key Security:** Store Gemini API key in secure secrets management (not in code).

4. **Rate Limiting:** Implement rate limits to prevent API abuse and cost overruns.

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Extraction accuracy | >95% for standard credentials |
| Time saved per credential | >80% reduction |
| Fraud detection rate | >90% of known fraud samples |
| Search relevance | >85% user satisfaction |
| Batch processing speed | 1000 docs/hour |

---

## Appendix: Gemini Model Selection

| Model | Best For | Cost | Speed |
|-------|----------|------|-------|
| gemini-1.5-flash | Extraction, embeddings, reports | Cheapest | Fastest |
| gemini-1.5-pro | Fraud detection, complex analysis | 10x flash | Slower |
| text-embedding-004 | Semantic search | Cheapest | Fast |

**Recommendation:** Use Flash for everything except fraud detection (use Pro).

---

*Prepared for Arkova Product Team | January 2026*
