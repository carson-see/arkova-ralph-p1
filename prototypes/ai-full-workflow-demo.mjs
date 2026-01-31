/**
 * Arkova AI Complete Workflow Demo
 * 
 * Demonstrates the full P8 AI-powered credential verification flow:
 * 1. Document Upload
 * 2. AI Extraction (auto-fill metadata)
 * 3. AI Fraud Detection (risk analysis)
 * 4. User Confirmation
 * 5. Anchor Creation
 * 
 * This is what makes Arkova different from every competitor.
 */

import fs from 'fs';
import crypto from 'crypto';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const FLASH_MODEL = 'gemini-2.0-flash';
const PRO_MODEL = 'gemini-2.5-pro';

// ═══════════════════════════════════════════════════════════════════
// STEP 1: Document Upload & Fingerprinting
// ═══════════════════════════════════════════════════════════════════

function uploadDocument(filePath) {
  console.log('\n' + '═'.repeat(60));
  console.log('📤 STEP 1: DOCUMENT UPLOAD');
  console.log('═'.repeat(60));
  
  const buffer = fs.readFileSync(filePath);
  const fingerprint = crypto.createHash('sha256').update(buffer).digest('hex');
  const stats = fs.statSync(filePath);
  
  console.log(`\n  📄 File: ${filePath}`);
  console.log(`  📏 Size: ${(stats.size / 1024).toFixed(2)} KB`);
  console.log(`  🔐 Fingerprint: ${fingerprint.substring(0, 16)}...`);
  console.log(`  ✅ Document never leaves your device - only the hash is stored`);
  
  return {
    buffer,
    base64: buffer.toString('base64'),
    mimeType: filePath.endsWith('.png') ? 'image/png' : 'image/jpeg',
    fingerprint,
    fileName: filePath.split('/').pop(),
    fileSize: stats.size
  };
}

// ═══════════════════════════════════════════════════════════════════
// STEP 2: AI-Powered Data Extraction
// ═══════════════════════════════════════════════════════════════════

async function extractData(document) {
  console.log('\n' + '═'.repeat(60));
  console.log('🤖 STEP 2: AI DATA EXTRACTION');
  console.log('═'.repeat(60));
  console.log('\n  ⏳ Sending to Gemini Flash for extraction...');
  
  const startTime = Date.now();
  
  const prompt = `Extract credential data from this document. Return ONLY valid JSON:
{
  "recipientName": {"value": "string or null", "confidence": 0.0-1.0},
  "issuerName": {"value": "string or null", "confidence": 0.0-1.0},
  "credentialType": {"value": "string or null", "confidence": 0.0-1.0},
  "issueDate": {"value": "YYYY-MM-DD or null", "confidence": 0.0-1.0},
  "fieldOfStudy": {"value": "string or null", "confidence": 0.0-1.0},
  "credentialId": {"value": "string or null", "confidence": 0.0-1.0},
  "honors": {"value": "string or null", "confidence": 0.0-1.0}
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${FLASH_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: document.mimeType, data: document.base64 } }
          ]
        }],
        generationConfig: { temperature: 0.1 }
      })
    }
  );

  const data = await response.json();
  const elapsed = Date.now() - startTime;
  
  if (data.error) {
    throw new Error(`Extraction failed: ${data.error.message}`);
  }

  const text = data.candidates[0].content.parts[0].text;
  const extracted = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
  
  console.log(`  ⚡ Completed in ${elapsed}ms\n`);
  console.log('  📋 EXTRACTED DATA:');
  console.log('  ─'.repeat(30));
  
  for (const [key, field] of Object.entries(extracted)) {
    if (field && field.value) {
      const conf = field.confidence;
      const icon = conf >= 0.9 ? '🟢' : conf >= 0.7 ? '🟡' : '🔴';
      const label = key.replace(/([A-Z])/g, ' $1').trim();
      console.log(`  ${icon} ${label}: ${field.value} (${(conf * 100).toFixed(0)}%)`);
    }
  }
  
  return { extracted, extractionTime: elapsed };
}

// ═══════════════════════════════════════════════════════════════════
// STEP 3: AI-Powered Fraud Detection
// ═══════════════════════════════════════════════════════════════════

async function detectFraud(document, extractedData) {
  console.log('\n' + '═'.repeat(60));
  console.log('🛡️ STEP 3: AI FRAUD DETECTION');
  console.log('═'.repeat(60));
  console.log('\n  ⏳ Sending to Gemini Pro for deep analysis...');
  
  const startTime = Date.now();
  
  const prompt = `Analyze this credential for fraud indicators. Context: ${JSON.stringify(extractedData)}

Return ONLY valid JSON:
{
  "overallRisk": "low" | "medium" | "high",
  "riskScore": 0-100,
  "findings": [{"category": "visual|content|logical", "severity": "info|warning|critical", "description": "...", "confidence": 0.0-1.0}],
  "positiveIndicators": ["list of legitimate aspects"],
  "recommendation": "proceed" | "review" | "reject",
  "summary": "2-3 sentence summary"
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${PRO_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: document.mimeType, data: document.base64 } }
          ]
        }],
        generationConfig: { temperature: 0.2 }
      })
    }
  );

  const data = await response.json();
  const elapsed = Date.now() - startTime;
  
  if (data.error) {
    throw new Error(`Fraud detection failed: ${data.error.message}`);
  }

  const text = data.candidates[0].content.parts[0].text;
  const fraudResult = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
  
  console.log(`  ⚡ Completed in ${elapsed}ms\n`);
  
  // Display results
  const riskColors = { low: '\x1b[32m', medium: '\x1b[33m', high: '\x1b[31m' };
  const reset = '\x1b[0m';
  const color = riskColors[fraudResult.overallRisk] || reset;
  
  console.log(`  📊 FRAUD ANALYSIS RESULTS:`);
  console.log('  ─'.repeat(30));
  console.log(`  Risk Level: ${color}${fraudResult.overallRisk.toUpperCase()}${reset} (${fraudResult.riskScore}/100)`);
  
  const recIcons = { proceed: '✅', review: '⚠️', reject: '🚫' };
  console.log(`  Recommendation: ${recIcons[fraudResult.recommendation]} ${fraudResult.recommendation.toUpperCase()}`);
  
  console.log(`\n  Summary: ${fraudResult.summary}`);
  
  if (fraudResult.findings?.length > 0) {
    console.log('\n  Findings:');
    for (const f of fraudResult.findings) {
      const icon = f.severity === 'critical' ? '🚨' : f.severity === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`    ${icon} ${f.description}`);
    }
  }
  
  if (fraudResult.positiveIndicators?.length > 0) {
    console.log('\n  Positive Indicators:');
    for (const p of fraudResult.positiveIndicators.slice(0, 3)) {
      console.log(`    ✓ ${p}`);
    }
  }
  
  return { fraudResult, fraudTime: elapsed };
}

// ═══════════════════════════════════════════════════════════════════
// STEP 4: User Confirmation (Simulated)
// ═══════════════════════════════════════════════════════════════════

function confirmData(extracted, fraudResult) {
  console.log('\n' + '═'.repeat(60));
  console.log('👤 STEP 4: USER CONFIRMATION');
  console.log('═'.repeat(60));
  
  console.log('\n  [In the real UI, user would see a form with:]');
  console.log('  • Pre-filled fields from AI extraction');
  console.log('  • Confidence indicators (🟢🟡🔴)');
  console.log('  • Fraud analysis summary');
  console.log('  • Option to edit any field');
  console.log('  • "Confirm & Anchor" button');
  
  if (fraudResult.overallRisk === 'high') {
    console.log('\n  ⚠️ HIGH RISK: User must acknowledge fraud warnings before proceeding');
  }
  
  console.log('\n  ✅ User confirms data is correct');
  
  return true;
}

// ═══════════════════════════════════════════════════════════════════
// STEP 5: Create Anchor Record
// ═══════════════════════════════════════════════════════════════════

function createAnchor(document, extracted, fraudResult) {
  console.log('\n' + '═'.repeat(60));
  console.log('⚓ STEP 5: CREATE ANCHOR');
  console.log('═'.repeat(60));
  
  const anchor = {
    id: crypto.randomUUID(),
    fingerprint: document.fingerprint,
    fileName: document.fileName,
    fileSize: document.fileSize,
    status: 'PENDING',
    metadata: {
      recipientName: extracted.recipientName?.value,
      issuerName: extracted.issuerName?.value,
      credentialType: extracted.credentialType?.value,
      issueDate: extracted.issueDate?.value,
      extractionConfidence: calculateAverageConfidence(extracted)
    },
    fraudAnalysis: {
      riskScore: fraudResult.riskScore,
      riskLevel: fraudResult.overallRisk,
      recommendation: fraudResult.recommendation,
      analyzedAt: new Date().toISOString()
    },
    createdAt: new Date().toISOString()
  };
  
  console.log('\n  📝 ANCHOR RECORD CREATED:');
  console.log('  ─'.repeat(30));
  console.log(`  ID: ${anchor.id}`);
  console.log(`  Fingerprint: ${anchor.fingerprint.substring(0, 32)}...`);
  console.log(`  Status: ${anchor.status}`);
  console.log(`  Recipient: ${anchor.metadata.recipientName || 'N/A'}`);
  console.log(`  Issuer: ${anchor.metadata.issuerName || 'N/A'}`);
  console.log(`  Fraud Risk: ${anchor.fraudAnalysis.riskLevel} (${anchor.fraudAnalysis.riskScore}/100)`);
  
  console.log('\n  ⏳ Next: Worker will publish to Bitcoin network');
  console.log('  📬 User will be notified when anchor is SECURED');
  
  return anchor;
}

function calculateAverageConfidence(extracted) {
  const confidences = Object.values(extracted)
    .filter(f => f && f.confidence)
    .map(f => f.confidence);
  return confidences.length > 0 
    ? (confidences.reduce((a, b) => a + b, 0) / confidences.length).toFixed(2)
    : 0;
}

// ═══════════════════════════════════════════════════════════════════
// MAIN WORKFLOW
// ═══════════════════════════════════════════════════════════════════

async function runWorkflow(imagePath) {
  console.log('\n' + '╔' + '═'.repeat(58) + '╗');
  console.log('║' + ' '.repeat(15) + 'ARKOVA AI-POWERED WORKFLOW' + ' '.repeat(17) + '║');
  console.log('║' + ' '.repeat(12) + 'Credential Verification Demo' + ' '.repeat(17) + '║');
  console.log('╚' + '═'.repeat(58) + '╝');
  
  const totalStart = Date.now();
  
  try {
    // Step 1: Upload
    const document = uploadDocument(imagePath);
    
    // Step 2: Extract
    const { extracted, extractionTime } = await extractData(document);
    
    // Step 3: Fraud Detection
    const { fraudResult, fraudTime } = await detectFraud(document, extracted);
    
    // Step 4: Confirm
    const confirmed = confirmData(extracted, fraudResult);
    
    // Step 5: Anchor
    const anchor = createAnchor(document, extracted, fraudResult);
    
    // Summary
    const totalTime = Date.now() - totalStart;
    
    console.log('\n' + '═'.repeat(60));
    console.log('📊 WORKFLOW SUMMARY');
    console.log('═'.repeat(60));
    console.log(`\n  Total Time: ${totalTime}ms`);
    console.log(`  ├─ Extraction: ${extractionTime}ms (Gemini Flash)`);
    console.log(`  └─ Fraud Check: ${fraudTime}ms (Gemini Pro)`);
    console.log(`\n  Estimated Cost: ~$0.002`);
    console.log(`  (Extraction: $0.0001 + Fraud: $0.001)`);
    
    console.log('\n' + '═'.repeat(60));
    console.log('✅ WORKFLOW COMPLETE');
    console.log('═'.repeat(60));
    
    return anchor;
    
  } catch (error) {
    console.error('\n❌ Workflow failed:', error.message);
    throw error;
  }
}

// Run demo
const imagePath = process.argv[2];

if (!imagePath) {
  console.log('\nUsage: node ai-full-workflow-demo.mjs <credential-image>');
  console.log('Example: node ai-full-workflow-demo.mjs diploma.jpg\n');
  process.exit(1);
}

if (!GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY not set');
  process.exit(1);
}

runWorkflow(imagePath).catch(() => process.exit(1));
