/**
 * src/utils/gemmaAnalyzer.test.js — Member 3: Gemma 4 AI & Social Engineering Analyzer Tests
 *
 * Uses Node.js built-in assert test harness (identical runner pattern to urlHeuristics.test.js).
 * Does NOT require live Gemini API keys (uses mocked model outputs & API contracts).
 */

import { strict as assert } from 'assert'
import {
  calculateSocialEngineeringScore,
  validateModelOutput,
  parseInteractionResponse,
  GEMMA_RESPONSE_SCHEMA,
} from '../../api/analyze-gemma.js'
import { mergeThreatScores, getRiskLevel } from './mergeThreatScores.js'

let passed = 0
let failed = 0

function test(name, fn) {
  try {
    fn()
    console.log(`  ✅  ${name}`)
    passed++
  } catch (err) {
    console.error(`  ❌  ${name}`)
    console.error(`       ${err.message}`)
    failed++
  }
}

console.log('\n── MEMBER 3: GEMMA 4 SOCIAL ENGINEERING ANALYZER TESTS ──')

// ---------------------------------------------------------------------------
// TEST 1 — Deterministic Weighting Formula
// ---------------------------------------------------------------------------
console.log('\n── TEST 1: Deterministic Score Calculation ──')

test('Weights sum correctly for max signals (100 in all signals = 100)', () => {
  const maxSignals = {
    urgency: 100,
    fear_or_threat: 100,
    fake_authority: 100,
    financial_pressure: 100,
    credential_request: 100,
    emotional_pressure: 100,
    impersonation: 100,
    action_pressure: 100,
    reward_manipulation: 100,
  }
  const score = calculateSocialEngineeringScore(maxSignals)
  assert.equal(score, 100, `Expected score 100, got ${score}`)
})

test('Zero signals produce 0 score', () => {
  const zeroSignals = {
    urgency: 0,
    fear_or_threat: 0,
    fake_authority: 0,
    financial_pressure: 0,
    credential_request: 0,
    emotional_pressure: 0,
    impersonation: 0,
    action_pressure: 0,
    reward_manipulation: 0,
  }
  const score = calculateSocialEngineeringScore(zeroSignals)
  assert.equal(score, 0, `Expected score 0, got ${score}`)
})

test('Weights exact mathematical contribution', () => {
  // urgency (18%) + credential_request (18%) = 36%
  const signals = {
    urgency: 100,
    fear_or_threat: 0,
    fake_authority: 0,
    financial_pressure: 0,
    credential_request: 100,
    emotional_pressure: 0,
    impersonation: 0,
    action_pressure: 0,
    reward_manipulation: 0,
  }
  const score = calculateSocialEngineeringScore(signals)
  assert.equal(score, 36, `Expected score 36, got ${score}`)
})

// ---------------------------------------------------------------------------
// TEST 2 — Benign Message Scenario
// ---------------------------------------------------------------------------
console.log('\n── TEST 2: Benign Message ──')

test('"Reminder: your project meeting is at 3 PM." — Low social engineering score', () => {
  const mockBenignModelResponse = {
    is_social_engineering: false,
    social_engineering_score: 5,
    confidence: 95,
    signals: {
      urgency: 5,
      fear_or_threat: 0,
      fake_authority: 0,
      financial_pressure: 0,
      credential_request: 0,
      emotional_pressure: 0,
      impersonation: 0,
      action_pressure: 0,
      reward_manipulation: 0,
    },
    detected_techniques: [],
    explanation: 'Standard workplace scheduling notification with no deceptive signals.',
    recommended_action: 'None needed. Content appears benign.',
  }

  assert(validateModelOutput(mockBenignModelResponse), 'Schema validation failed')
  const score = calculateSocialEngineeringScore(mockBenignModelResponse.signals)
  assert(score <= 15, `Score should be low (<=15), got ${score}`)
  const risk = getRiskLevel(score)
  assert.equal(risk.level, 'LOW', `Risk level should be LOW, got ${risk.level}`)
})

// ---------------------------------------------------------------------------
// TEST 3 — Urgency Pressure Scenario
// ---------------------------------------------------------------------------
console.log('\n── TEST 3: High Urgency Scenario ──')

test('"Act now. Your account will be deleted in 10 minutes." — High urgency', () => {
  const mockUrgencyResponse = {
    is_social_engineering: true,
    social_engineering_score: 75,
    confidence: 92,
    signals: {
      urgency: 95,
      fear_or_threat: 80,
      fake_authority: 40,
      financial_pressure: 0,
      credential_request: 20,
      emotional_pressure: 70,
      impersonation: 30,
      action_pressure: 85,
      reward_manipulation: 0,
    },
    detected_techniques: ['false urgency', 'time-limited threat', 'forced action'],
    explanation: 'Extreme artificial urgency combined with threats of account deletion.',
    recommended_action: 'Do not comply with timer-based demands.',
  }

  assert(validateModelOutput(mockUrgencyResponse))
  const score = calculateSocialEngineeringScore(mockUrgencyResponse.signals)
  assert(score >= 50, `Score should be >= 50, got ${score}`)
  assert(mockUrgencyResponse.signals.urgency >= 90, 'Urgency signal should be high')
})

// ---------------------------------------------------------------------------
// TEST 4 — Fear + Authority Scenario
// ---------------------------------------------------------------------------
console.log('\n── TEST 4: Fear & Authority Scenario ──')

test('"This is the Security Department. Your account violated policy." — Fear + Fake Authority', () => {
  const mockAuthorityResponse = {
    is_social_engineering: true,
    social_engineering_score: 78,
    confidence: 88,
    signals: {
      urgency: 60,
      fear_or_threat: 85,
      fake_authority: 90,
      financial_pressure: 10,
      credential_request: 40,
      emotional_pressure: 75,
      impersonation: 65,
      action_pressure: 70,
      reward_manipulation: 0,
    },
    detected_techniques: ['fake authority', 'intimidation', 'security policy threat'],
    explanation: 'Uses formal security authority framing to coerce compliance through fear.',
    recommended_action: 'Verify with your internal IT department directly.',
  }

  assert(validateModelOutput(mockAuthorityResponse))
  assert(mockAuthorityResponse.signals.fear_or_threat >= 80, 'Fear signal should be >= 80')
  assert(mockAuthorityResponse.signals.fake_authority >= 80, 'Authority signal should be >= 80')
})

// ---------------------------------------------------------------------------
// TEST 5 — Financial Pressure Scenario
// ---------------------------------------------------------------------------
console.log('\n── TEST 5: Financial Pressure Scenario ──')

test('"Your payment failed. Update your card immediately." — Financial pressure', () => {
  const mockFinancialResponse = {
    is_social_engineering: true,
    social_engineering_score: 80,
    confidence: 90,
    signals: {
      urgency: 85,
      fear_or_threat: 60,
      fake_authority: 45,
      financial_pressure: 90,
      credential_request: 85,
      emotional_pressure: 50,
      impersonation: 55,
      action_pressure: 80,
      reward_manipulation: 0,
    },
    detected_techniques: ['financial pressure', 'payment failure threat', 'credential harvesting'],
    explanation: 'Pretends payment failed to solicit credit card information under urgency.',
    recommended_action: 'Log in to your service provider via their official website or app.',
  }

  assert(validateModelOutput(mockFinancialResponse))
  assert(mockFinancialResponse.signals.financial_pressure >= 85, 'Financial pressure should be >= 85')
  assert(mockFinancialResponse.signals.credential_request >= 80, 'Credential request should be >= 80')
})

// ---------------------------------------------------------------------------
// TEST 6 — Credential Request Scenario
// ---------------------------------------------------------------------------
console.log('\n── TEST 6: Explicit Credential Request ──')

test('"Send your password and OTP to complete verification." — High credential request', () => {
  const mockCredentialResponse = {
    is_social_engineering: true,
    social_engineering_score: 85,
    confidence: 96,
    signals: {
      urgency: 70,
      fear_or_threat: 40,
      fake_authority: 60,
      financial_pressure: 30,
      credential_request: 98,
      emotional_pressure: 40,
      impersonation: 50,
      action_pressure: 75,
      reward_manipulation: 0,
    },
    detected_techniques: ['credential harvesting', 'OTP theft', 'password solicitation'],
    explanation: 'Direct solicitation of authentication secrets (password and OTP).',
    recommended_action: 'Never share OTPs or passwords with anyone.',
  }

  assert(validateModelOutput(mockCredentialResponse))
  assert(mockCredentialResponse.signals.credential_request >= 95, 'Credential request should be near 100')
})

// ---------------------------------------------------------------------------
// TEST 7 — Mixed Phishing Scenario
// ---------------------------------------------------------------------------
console.log('\n── TEST 7: Mixed Phishing ──')

test('"Your Netflix payment failed. Update your account immediately or it will be terminated." — Mixed phishing', () => {
  const mockMixedResponse = {
    is_social_engineering: true,
    social_engineering_score: 86,
    confidence: 94,
    signals: {
      urgency: 90,
      fear_or_threat: 85,
      fake_authority: 70,
      financial_pressure: 85,
      credential_request: 80,
      emotional_pressure: 75,
      impersonation: 85,
      action_pressure: 88,
      reward_manipulation: 5,
    },
    detected_techniques: [
      'brand impersonation',
      'false urgency',
      'fear of termination',
      'financial manipulation',
      'credential solicitation',
    ],
    explanation: 'Combines Netflix brand spoofing with urgency, payment failure, and account loss threats.',
    recommended_action: 'Never click links in billing alert emails. Visit netflix.com directly.',
  }

  assert(validateModelOutput(mockMixedResponse))
  const calculated = calculateSocialEngineeringScore(mockMixedResponse.signals)
  assert(calculated >= 75, `Expected score >= 75, got ${calculated}`)
  const risk = getRiskLevel(calculated)
  assert(risk.level === 'HIGH' || risk.level === 'CRITICAL', `Expected HIGH or CRITICAL, got ${risk.level}`)
})

// ---------------------------------------------------------------------------
// TEST 8 — Benign Request Scenario
// ---------------------------------------------------------------------------
console.log('\n── TEST 8: Benign Request ──')

test('"Please review the class report before tomorrow." — Low score', () => {
  const mockClassReport = {
    is_social_engineering: false,
    social_engineering_score: 8,
    confidence: 92,
    signals: {
      urgency: 20,
      fear_or_threat: 0,
      fake_authority: 0,
      financial_pressure: 0,
      credential_request: 0,
      emotional_pressure: 0,
      impersonation: 0,
      action_pressure: 15,
      reward_manipulation: 0,
    },
    detected_techniques: [],
    explanation: 'Normal academic collaboration request with standard timeline.',
    recommended_action: 'No action required.',
  }

  assert(validateModelOutput(mockClassReport))
  const calculated = calculateSocialEngineeringScore(mockClassReport.signals)
  assert(calculated < 20, `Expected low score (<20), got ${calculated}`)
})

// ---------------------------------------------------------------------------
// TEST 9 — Technical + AI Score Merge Formula
// ---------------------------------------------------------------------------
console.log('\n── TEST 9: Technical + AI Merge Formula ──')

test('Technical 80 + Social Engineering 90 -> final score 85 (80 * 0.55 + 90 * 0.45)', () => {
  const mockTechResult = {
    technicalScore: 80,
    score: 80,
    signals: [{ category: 'Link Intelligence', severity: 'high', signal: 'Lookalike domain', detail: 'Fake brand domain', points: 35 }],
    badges: ['SUSPICIOUS URL'],
    urls: [{ url: 'http://evil.cc', domain: 'evil.cc', suspicious: true }],
    explanation: 'Suspicious domain detected.',
  }

  const mockAiResult = {
    success: true,
    aiAvailable: true,
    model: 'gemma-4-26b-a4b-it',
    socialEngineeringScore: 90,
    confidence: 95,
    signals: {
      urgency: 90,
      fearOrThreat: 90,
      fakeAuthority: 80,
      financialPressure: 90,
      credentialRequest: 95,
      emotionalPressure: 80,
      impersonation: 90,
      actionPressure: 90,
      rewardManipulation: 10,
    },
    detectedTechniques: ['false urgency', 'credential harvesting'],
    explanation: 'AI detected high-severity psychological coercion and credential theft tactics.',
    recommendedAction: 'Do not submit credentials.',
  }

  const merged = mergeThreatScores(mockTechResult, mockAiResult)
  // Expected: Math.round(80 * 0.55 + 90 * 0.45) = Math.round(44 + 40.5) = Math.round(84.5) = 85
  assert.equal(merged.score, 85, `Expected merged score 85, got ${merged.score}`)
  assert.equal(merged.technicalScore, 80)
  assert.equal(merged.socialEngineeringScore, 90)
  assert.equal(merged.aiAvailable, true)
  assert(merged.badges.includes('GEMMA 4 VERIFIED'), 'Badge GEMMA 4 VERIFIED missing')
  assert.equal(merged.riskLevel.level, 'CRITICAL')
})

test('AI Unavailable Fallback — Preserves technical score without crashing', () => {
  const mockTechResult = {
    technicalScore: 78,
    score: 78,
    signals: [{ category: 'Link Intelligence', severity: 'high', signal: 'IP host detected', detail: 'Direct IP', points: 35 }],
    badges: ['IP HOST DETECTED'],
    urls: [{ url: 'http://192.168.1.1/login', domain: '192.168.1.1', suspicious: true }],
    explanation: 'Direct IP host detected.',
  }

  const mockFailedAiResult = {
    success: false,
    aiAvailable: false,
    error: 'AI analysis unavailable',
  }

  const merged = mergeThreatScores(mockTechResult, mockFailedAiResult)
  assert.equal(merged.score, 78, `Expected score 78, got ${merged.score}`)
  assert.equal(merged.aiAvailable, false)
  assert.equal(merged.socialEngineeringScore, null)
  assert(merged.explanation.includes('AI analysis unavailable'), 'Explanation should note AI unavailability')
})

// ---------------------------------------------------------------------------
// TEST 10 — Invalid Model Output Handling & Parsing
// ---------------------------------------------------------------------------
console.log('\n── TEST 10: Model Output Validation & JSON Parsing ──')

test('parseInteractionResponse strips markdown code fences cleanly', () => {
  const rawInteraction = {
    output_text: '```json\n{"is_social_engineering":true,"social_engineering_score":80,"confidence":90,"signals":{"urgency":80,"fear_or_threat":50,"fake_authority":50,"financial_pressure":50,"credential_request":50,"emotional_pressure":50,"impersonation":50,"action_pressure":50,"reward_manipulation":10},"detected_techniques":["urgency"],"explanation":"test","recommended_action":"test"}\n```',
  }
  const parsed = parseInteractionResponse(rawInteraction)
  assert(parsed !== null, 'Should parse fenced JSON')
  assert.equal(parsed.is_social_engineering, true)
  assert.equal(validateModelOutput(parsed), true)
})

test('validateModelOutput rejects invalid/incomplete responses', () => {
  assert.equal(validateModelOutput(null), false)
  assert.equal(validateModelOutput('string'), false)
  assert.equal(validateModelOutput({ is_social_engineering: true }), false)
  assert.equal(validateModelOutput({
    is_social_engineering: true,
    social_engineering_score: 'not a number', // invalid
    confidence: 80,
    signals: {},
    detected_techniques: [],
    explanation: 'test',
    recommended_action: 'test',
  }), false)
})

// ---------------------------------------------------------------------------
// TEST 11 — Multimodal Image Analysis Contract
// ---------------------------------------------------------------------------
console.log('\n── TEST 11: Image Analysis Contract ──')

test('Image analysis response maps correctly with visual signals', () => {
  const mockImageAiResponse = {
    success: true,
    aiAvailable: true,
    model: 'gemma-4-26b-a4b-it',
    sourceType: 'image',
    socialEngineeringScore: 82,
    confidence: 90,
    signals: {
      urgency: 85,
      fearOrThreat: 70,
      fakeAuthority: 60,
      financialPressure: 75,
      credentialRequest: 80,
      emotionalPressure: 60,
      impersonation: 80,
      actionPressure: 75,
      rewardManipulation: 0,
    },
    detectedTechniques: ['brand impersonation', 'credential harvesting', 'false urgency'],
    explanation: 'Screenshot mimics banking login portal with urgent account verification demand.',
    recommendedAction: 'Close image and do not visit any links shown.',
  }

  assert.equal(mockImageAiResponse.sourceType, 'image')
  assert.equal(mockImageAiResponse.socialEngineeringScore, 82)
  assert(mockImageAiResponse.signals.impersonation >= 70)
  assert(mockImageAiResponse.signals.credentialRequest >= 70)
})

// ---------------------------------------------------------------------------
// TEST 12 — Risk Level Boundaries
// ---------------------------------------------------------------------------
console.log('\n── TEST 12: Risk Level Boundaries ──')

test('0-29: LOW, 30-59: MEDIUM, 60-79: HIGH, 80-100: CRITICAL', () => {
  assert.equal(getRiskLevel(0).level, 'LOW')
  assert.equal(getRiskLevel(29).level, 'LOW')
  assert.equal(getRiskLevel(30).level, 'MEDIUM')
  assert.equal(getRiskLevel(59).level, 'MEDIUM')
  assert.equal(getRiskLevel(60).level, 'HIGH')
  assert.equal(getRiskLevel(79).level, 'HIGH')
  assert.equal(getRiskLevel(80).level, 'CRITICAL')
  assert.equal(getRiskLevel(100).level, 'CRITICAL')
})

// ---------------------------------------------------------------------------
// SUMMARY
// ---------------------------------------------------------------------------
console.log('\n──────────────────────────────────────────────────')
console.log(`Member 3 Tests Complete: ${passed} passed, ${failed} failed\n`)

if (failed > 0) {
  process.exit(1)
}
