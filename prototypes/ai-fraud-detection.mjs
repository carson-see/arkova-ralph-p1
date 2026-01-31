/**
 * Arkova AI Fraud Detection - Proof of Concept
 * 
 * Demonstrates P8-S7: Fraud Analysis Service
 * Uses Google Gemini Pro to detect signs of document tampering/forgery
 * 
 * THIS IS THE BIG DIFFERENTIATOR - No competitor offers this!
 */

import fs from 'fs';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Use Pro model for deeper analysis
const GEMINI_MODEL = 'gemini-2.5-pro';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Analyze a document for fraud indicators
 * @param {string} imagePath - Path to the document image
 * @param {object} extractedData - Optional: previously extracted data for cross-reference
 * @returns {Promise<object>} Fraud analysis results
 */
async function analyzeForFraud(imagePath, extractedData = null) {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';

  const extractedContext = extractedData 
    ? `\nPreviously extracted data for reference:\n${JSON.stringify(extractedData, null, 2)}\n` 
    : '';

  const prompt = `You are an expert document fraud analyst. Analyze this credential document for signs of tampering, forgery, or inconsistency.
${extractedContext}
Examine carefully for:

1. **Visual Inconsistencies**
   - Font mismatches (different fonts in areas that should match)
   - Alignment issues (text not properly aligned with document structure)
   - Resolution differences (some areas sharper/blurrier than others)
   - Color inconsistencies (mismatched tones, obvious splicing)
   - Pixelation or artifacts around text/images
   - Unusual spacing between characters or lines

2. **Content Red Flags**
   - Spelling errors in official document fields
   - Incorrect terminology for the document type
   - Impossible or suspicious dates
   - Formatting that doesn't match typical documents of this type
   - Missing expected security features (watermarks, seals, signatures)

3. **Logical Impossibilities**
   - Dates that don't make sense (graduation before enrollment)
   - Non-existent institutions or programs
   - Credential types that don't exist
   - Inconsistent information across the document

4. **Metadata/Technical Issues**
   - Signs of digital editing (if visible)
   - Copy-paste artifacts
   - Inconsistent image quality across regions

Return ONLY valid JSON (no markdown) with this structure:
{
  "overallRisk": "low" | "medium" | "high",
  "riskScore": 0-100,
  "findings": [
    {
      "category": "visual" | "content" | "logical" | "technical",
      "severity": "info" | "warning" | "critical",
      "description": "detailed description of what was found",
      "location": "where in the document (if applicable)",
      "confidence": 0.0-1.0
    }
  ],
  "positiveIndicators": [
    "list of things that look legitimate"
  ],
  "recommendation": "proceed" | "review" | "reject",
  "summary": "2-3 sentence human-readable summary for the user"
}

Risk scoring guidelines:
- 0-30: Low risk (minor issues or none)
- 31-60: Medium risk (some concerns, recommend review)
- 61-100: High risk (significant red flags)

Be thorough but avoid false positives. If something looks legitimate, say so.`;

  const requestBody = {
    contents: [{
      parts: [
        { text: prompt },
        { 
          inline_data: {
            mime_type: mimeType,
            data: base64Image
          }
        }
      ]
    }],
    generationConfig: {
      temperature: 0.2,  // Slightly higher for nuanced analysis
      maxOutputTokens: 2048
    }
  };

  const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  const data = await response.json();
  
  if (data.error) {
    throw new Error(`Gemini API error: ${data.error.message}`);
  }

  const text = data.candidates[0].content.parts[0].text;
  
  try {
    return JSON.parse(text);
  } catch (e) {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error(`Failed to parse fraud analysis: ${text}`);
  }
}

/**
 * Format fraud analysis results for display
 */
function formatResults(results) {
  const riskColors = {
    low: '\x1b[32m',    // Green
    medium: '\x1b[33m', // Yellow
    high: '\x1b[31m'    // Red
  };
  const reset = '\x1b[0m';
  const bold = '\x1b[1m';

  console.log('\n' + '═'.repeat(60));
  console.log(`${bold}🔍 FRAUD ANALYSIS RESULTS${reset}`);
  console.log('═'.repeat(60));

  // Overall risk
  const riskColor = riskColors[results.overallRisk] || reset;
  console.log(`\n${bold}Overall Risk:${reset} ${riskColor}${results.overallRisk.toUpperCase()}${reset} (${results.riskScore}/100)`);
  
  // Risk bar
  const filled = Math.round(results.riskScore / 5);
  const empty = 20 - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  console.log(`Risk Score:  [${riskColor}${bar}${reset}]`);

  // Recommendation
  const recIcons = { proceed: '✅', review: '⚠️', reject: '🚫' };
  console.log(`\n${bold}Recommendation:${reset} ${recIcons[results.recommendation] || '❓'} ${results.recommendation.toUpperCase()}`);

  // Summary
  console.log(`\n${bold}Summary:${reset}`);
  console.log(`  ${results.summary}`);

  // Findings
  if (results.findings && results.findings.length > 0) {
    console.log(`\n${bold}Findings:${reset}`);
    for (const finding of results.findings) {
      const sevIcons = { info: 'ℹ️', warning: '⚠️', critical: '🚨' };
      const icon = sevIcons[finding.severity] || '•';
      console.log(`\n  ${icon} [${finding.category.toUpperCase()}] ${finding.description}`);
      if (finding.location) {
        console.log(`     Location: ${finding.location}`);
      }
      console.log(`     Confidence: ${(finding.confidence * 100).toFixed(0)}%`);
    }
  } else {
    console.log(`\n${bold}Findings:${reset} None detected`);
  }

  // Positive indicators
  if (results.positiveIndicators && results.positiveIndicators.length > 0) {
    console.log(`\n${bold}Positive Indicators:${reset}`);
    for (const indicator of results.positiveIndicators) {
      console.log(`  ✓ ${indicator}`);
    }
  }

  console.log('\n' + '═'.repeat(60));
}

/**
 * Generate a mock credential for testing (since we don't have real samples)
 */
async function runDemoAnalysis() {
  console.log('\n🎭 Running demo analysis (no image provided)');
  console.log('   Generating sample fraud analysis response...\n');

  // Simulate what the analysis would return
  const demoResult = {
    overallRisk: "medium",
    riskScore: 42,
    findings: [
      {
        category: "visual",
        severity: "warning",
        description: "Font rendering appears inconsistent between the header and body text. The graduation date uses a slightly different typeface than other dates on the document.",
        location: "Center of document, near graduation date",
        confidence: 0.72
      },
      {
        category: "content",
        severity: "info",
        description: "Document uses standard formatting for this credential type.",
        location: "Overall layout",
        confidence: 0.95
      }
    ],
    positiveIndicators: [
      "University seal appears authentic with proper resolution",
      "Signature matches expected placement and style",
      "Paper texture and background are consistent",
      "Document dimensions match standard diploma size",
      "Embossing artifacts visible (suggests physical document)"
    ],
    recommendation: "review",
    summary: "This document shows minor visual inconsistencies in font rendering that warrant a closer look. While most elements appear authentic (seal, signature, layout), the date field typography doesn't perfectly match the rest of the document. Recommend manual verification of the graduation date with the issuing institution."
  };

  return demoResult;
}

// Main execution
async function main() {
  const imagePath = process.argv[2];

  if (!GEMINI_API_KEY) {
    console.error('Error: GEMINI_API_KEY environment variable not set');
    process.exit(1);
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log('🛡️  ARKOVA FRAUD DETECTION SYSTEM');
  console.log('    Powered by Google Gemini Pro');
  console.log('═'.repeat(60));

  let results;
  const startTime = Date.now();

  if (!imagePath) {
    // Run demo mode
    results = await runDemoAnalysis();
  } else {
    console.log(`\n📄 Analyzing document: ${imagePath}`);
    console.log('⏳ Running deep fraud analysis (this may take a few seconds)...\n');
    
    try {
      results = await analyzeForFraud(imagePath);
    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      process.exit(1);
    }
  }

  const elapsed = Date.now() - startTime;
  
  formatResults(results);
  console.log(`\n⚡ Analysis completed in ${elapsed}ms`);
  
  // Output raw JSON
  console.log('\n📋 Raw JSON output:');
  console.log(JSON.stringify(results, null, 2));

  // Exit code based on risk
  if (results.overallRisk === 'high') {
    process.exit(2); // High risk
  } else if (results.overallRisk === 'medium') {
    process.exit(1); // Medium risk (warning)
  }
  // Low risk = exit 0 (success)
}

main();
