/**
 * Arkova AI Document Extraction - Proof of Concept
 * 
 * Demonstrates P8-S4: Document Extraction Service
 * Uses Google Gemini to extract structured data from credential documents
 */

const fs = require('fs');
const path = require('path');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Extract credential data from a document image
 * @param {string} imagePath - Path to the document image
 * @returns {Promise<object>} Extracted data with confidence scores
 */
async function extractCredentialData(imagePath) {
  // Read and encode image
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';

  const prompt = `You are a document data extraction expert. Analyze this credential document and extract structured information.

Return ONLY valid JSON (no markdown, no backticks) with this exact structure:
{
  "recipientName": {"value": "string or null", "confidence": 0.0-1.0},
  "issuerName": {"value": "string or null", "confidence": 0.0-1.0},
  "credentialType": {"value": "string or null", "confidence": 0.0-1.0},
  "issueDate": {"value": "YYYY-MM-DD or null", "confidence": 0.0-1.0},
  "expirationDate": {"value": "YYYY-MM-DD or null", "confidence": 0.0-1.0},
  "credentialId": {"value": "string or null", "confidence": 0.0-1.0},
  "fieldOfStudy": {"value": "string or null", "confidence": 0.0-1.0},
  "honors": {"value": "string or null", "confidence": 0.0-1.0},
  "additionalInfo": {"value": "string or null", "confidence": 0.0-1.0}
}

Confidence scores:
- 1.0 = Clearly visible and unambiguous
- 0.7-0.9 = Visible but partially obscured or ambiguous
- 0.5-0.7 = Inferred from context
- Below 0.5 = Guessing, set value to null instead

If a field is not present in the document, set value to null and confidence to 1.0.`;

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
      temperature: 0.1,  // Low temperature for consistent extraction
      maxOutputTokens: 1024
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
  
  // Parse JSON response
  try {
    return JSON.parse(text);
  } catch (e) {
    // Try to extract JSON from response if wrapped in markdown
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error(`Failed to parse extraction response: ${text}`);
  }
}

/**
 * Format extraction results for display
 */
function formatResults(results) {
  console.log('\n📄 EXTRACTED CREDENTIAL DATA\n');
  console.log('─'.repeat(50));
  
  const fields = [
    ['recipientName', 'Recipient Name'],
    ['issuerName', 'Issuer/Institution'],
    ['credentialType', 'Credential Type'],
    ['issueDate', 'Issue Date'],
    ['expirationDate', 'Expiration Date'],
    ['credentialId', 'Credential ID'],
    ['fieldOfStudy', 'Field of Study'],
    ['honors', 'Honors/Distinctions'],
    ['additionalInfo', 'Additional Info']
  ];

  for (const [key, label] of fields) {
    const field = results[key];
    if (field && field.value) {
      const conf = field.confidence;
      const indicator = conf >= 0.9 ? '🟢' : conf >= 0.7 ? '🟡' : '🔴';
      console.log(`${indicator} ${label}: ${field.value} (${(conf * 100).toFixed(0)}%)`);
    } else {
      console.log(`⚪ ${label}: Not found`);
    }
  }
  
  console.log('─'.repeat(50));
}

// Main execution
async function main() {
  const imagePath = process.argv[2];
  
  if (!imagePath) {
    console.log('Usage: node ai-extraction-demo.js <image-path>');
    console.log('Example: node ai-extraction-demo.js diploma.jpg');
    process.exit(1);
  }

  if (!GEMINI_API_KEY) {
    console.error('Error: GEMINI_API_KEY environment variable not set');
    process.exit(1);
  }

  console.log(`\n🔍 Analyzing document: ${imagePath}`);
  console.log('⏳ Sending to Gemini for extraction...\n');

  try {
    const startTime = Date.now();
    const results = await extractCredentialData(imagePath);
    const elapsed = Date.now() - startTime;
    
    formatResults(results);
    console.log(`\n⚡ Extraction completed in ${elapsed}ms`);
    
    // Output raw JSON for integration
    console.log('\n📋 Raw JSON output:');
    console.log(JSON.stringify(results, null, 2));
    
  } catch (error) {
    console.error('❌ Extraction failed:', error.message);
    process.exit(1);
  }
}

main();
