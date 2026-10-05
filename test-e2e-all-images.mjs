import fs from 'fs'
import path from 'path'
import { mergeImageThreatScores } from './src/utils/mergeThreatScores.js'

const brainDir = process.env.TEST_IMAGE_DIR || 'C:/Users/USER/.gemini/antigravity-ide/brain/4936ef0a-221d-4bae-9896-652816aafe73'

const testCases = [
  {
    name: '1. SBI SCAM SCREENSHOT',
    file: 'sbi_scam_screenshot_1791137701657.jpg',
    expected: 'HIGH / CRITICAL RISK',
  },
  {
    name: '2. BENIGN PHYSICS NOTES CHAT',
    file: 'notes_request_screenshot_1791137734887.jpg',
    expected: 'LOW RISK',
  },
  {
    name: '3. AIRPORT WRONG-NUMBER MESSAGE',
    file: 'airport_message_screenshot_1791137763190.jpg',
    expected: 'MEDIUM / SOCIAL-ENGINEERING PATTERN',
  },
]

async function runTest(testCase) {
  console.log(`\n==================================================`)
  console.log(`RUNNING TEST: ${testCase.name}`)
  console.log(`Expected: ${testCase.expected}`)
  console.log(`==================================================`)

  const filePath = path.join(brainDir, testCase.file)
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`)
    return
  }

  const imageBuffer = fs.readFileSync(filePath)
  const rawBase64 = imageBuffer.toString('base64')
  console.log(`Image loaded: ${imageBuffer.length} bytes, base64 length: ${rawBase64.length}`)

  const payload = {
    sourceType: 'image',
    image: {
      data: rawBase64,
      mimeType: 'image/jpeg',
    },
  }

  const t0 = Date.now()
  const response = await fetch('http://127.0.0.1:3000/api/analyze-gemma', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const durationMs = Date.now() - t0
  const data = await response.json()

  console.log(`API HTTP Status: ${response.status} (${durationMs}ms)`)
  console.log(`Server Response:`, JSON.stringify({
    success: data.success,
    aiAvailable: data.aiAvailable,
    aiAttempted: data.aiAttempted,
    aiSucceeded: data.aiSucceeded,
    imageSent: data.imageSent,
    model: data.model,
    socialEngineeringScore: data.socialEngineeringScore,
    confidence: data.confidence,
    signals: data.signals,
    detectedTechniques: data.detectedTechniques,
  }, null, 2))

  // Simulate local heuristic output (baseline visual inspection)
  const localResult = {
    score: 8,
    badges: ['IMAGE SCREENING', 'CLEAR SCREENING'],
    signals: [
      {
        category: 'Image Visual Inspection',
        severity: 'low',
        signal: 'No overt scam patterns detected',
        detail: 'Image structure examined; no overt brand spoofing or known scam layouts identified.',
        points: 8,
      }
    ],
    explanation: 'Basic image visual inspection complete.',
  }

  const merged = mergeImageThreatScores(localResult, data)

  console.log(`Merged Image Result:`)
  console.log(`- Final Score: ${merged.score} / 100`)
  console.log(`- Risk Level: ${merged.riskLevel.level} (${merged.riskLevel.label})`)
  console.log(`- AI Available: ${merged.aiAvailable}`)
  console.log(`- Badges: ${merged.badges.join(', ')}`)
  console.log(`- Top Signals count: ${merged.signals.length}`)
  console.log(`- Explanation: ${merged.explanation}`)
  console.log(`- Recommended Action: ${merged.recommendedAction || 'N/A'}`)

  return { data, merged }
}

async function main() {
  for (const tc of testCases) {
    try {
      await runTest(tc)
    } catch (err) {
      console.error(`Test failed for ${tc.name}:`, err)
    }
  }
}

main()
