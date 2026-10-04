/**
 * urlHeuristics.test.js — Member 2: URL & Keyword Heuristic Engine Tests
 *
 * Uses Node.js built-in test runner (node:test).
 * Run with: node --experimental-vm-modules src/utils/urlHeuristics.test.js
 * Or via the npm test script if configured.
 *
 * No external test framework needed.
 */

import { analyzeUrl, analyzeUrls, extractUrlsFromText, detectTechnicalKeywords } from './urlHeuristics.js'
import { strict as assert } from 'assert'

// ---------------------------------------------------------------------------
// Tiny test harness (Node built-in assert)
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// TEST 1 — Official Netflix (should NOT be flagged)
// ---------------------------------------------------------------------------
console.log('\n── TEST 1: Official Netflix domain ──')
test('https://www.netflix.com/account — not typosquatting', () => {
  const r = analyzeUrl('https://www.netflix.com/account')
  assert.equal(r.typosquatting, false, 'typosquatting should be false')
  assert.equal(r.matchedBrand, null, 'matchedBrand should be null')
  assert.equal(r.indicators.deceptiveSubdomain, false, 'deceptiveSubdomain should be false')
})

test('https://www.netflix.com/account — low risk score', () => {
  const r = analyzeUrl('https://www.netflix.com/account')
  // /account path will add some path keyword points, but score should stay low overall
  assert(r.riskPoints < 50, `riskPoints should be < 50, got ${r.riskPoints}`)
})

// ---------------------------------------------------------------------------
// TEST 2 — Netflix typosquat
// ---------------------------------------------------------------------------
console.log('\n── TEST 2: Netflix typosquat ──')
test('http://netfIix-verify.cc/login — typosquatting = true', () => {
  const r = analyzeUrl('http://netfIix-verify.cc/login')
  assert.equal(r.typosquatting, true, 'typosquatting should be true')
})

test('http://netfIix-verify.cc/login — matchedBrand = netflix', () => {
  const r = analyzeUrl('http://netfIix-verify.cc/login')
  assert.equal(r.matchedBrand, 'netflix', `matchedBrand should be "netflix", got "${r.matchedBrand}"`)
})

test('http://netfIix-verify.cc/login — suspicious = true', () => {
  const r = analyzeUrl('http://netfIix-verify.cc/login')
  assert.equal(r.suspicious, true, 'suspicious should be true')
})

test('http://netfIix-verify.cc/login — multiple reasons', () => {
  const r = analyzeUrl('http://netfIix-verify.cc/login')
  assert(r.reasons.length >= 2, `Expected >= 2 reasons, got ${r.reasons.length}: ${r.reasons.join('; ')}`)
})

test('http://netf1ix-billing-update.cc/verify/account — typosquatting', () => {
  const r = analyzeUrl('http://netf1ix-billing-update.cc/verify/account')
  assert.equal(r.typosquatting, true, 'typosquatting should be true')
  assert.equal(r.matchedBrand, 'netflix', `matchedBrand should be "netflix"`)
})

// ---------------------------------------------------------------------------
// TEST 3 — Raw IP host
// ---------------------------------------------------------------------------
console.log('\n── TEST 3: Raw IPv4 host ──')
test('http://192.168.1.10/login — rawIp = true', () => {
  const r = analyzeUrl('http://192.168.1.10/login')
  assert.equal(r.indicators.rawIp, true, 'rawIp should be true')
})

test('http://192.168.1.10/login — suspicious = true', () => {
  const r = analyzeUrl('http://192.168.1.10/login')
  assert.equal(r.suspicious, true, 'suspicious should be true')
})

// ---------------------------------------------------------------------------
// TEST 4 — Deceptive subdomain
// ---------------------------------------------------------------------------
console.log('\n── TEST 4: Deceptive subdomain ──')
test('https://paypal.com.security-check.example.com/login — deceptiveSubdomain = true', () => {
  const r = analyzeUrl('https://paypal.com.security-check.example.com/login')
  assert.equal(r.indicators.deceptiveSubdomain, true, 'deceptiveSubdomain should be true')
})

test('https://paypal.com.security-check.example.com/login — suspicious = true', () => {
  const r = analyzeUrl('https://paypal.com.security-check.example.com/login')
  assert.equal(r.suspicious, true, 'suspicious should be true')
})

// ---------------------------------------------------------------------------
// TEST 5 — Dangerous file extension
// ---------------------------------------------------------------------------
console.log('\n── TEST 5: Dangerous file extension ──')
test('https://example.com/update.exe — dangerousFile = true', () => {
  const r = analyzeUrl('https://example.com/update.exe')
  assert.equal(r.indicators.dangerousFile, true, 'dangerousFile should be true')
})

test('https://example.com/update.exe — suspicious = true or high riskPoints', () => {
  const r = analyzeUrl('https://example.com/update.exe')
  assert(r.suspicious || r.riskPoints >= 30, `Expected suspicious or riskPoints >= 30, got ${r.riskPoints}`)
})

test('https://example.com/document.pdf.exe — dangerousFile = true', () => {
  const r = analyzeUrl('https://example.com/document.pdf.exe')
  assert.equal(r.indicators.dangerousFile, true, 'dangerousFile should be true for double-extension .exe')
})

// ---------------------------------------------------------------------------
// TEST 6 — Punycode
// ---------------------------------------------------------------------------
console.log('\n── TEST 6: Punycode ──')
test('https://xn--example-test.com/ — punycode = true', () => {
  const r = analyzeUrl('https://xn--example-test.com/')
  assert.equal(r.indicators.punycode, true, 'punycode should be true')
})

// ---------------------------------------------------------------------------
// TEST 7 — Official Google (should NOT be flagged)
// ---------------------------------------------------------------------------
console.log('\n── TEST 7: Official Google domain ──')
test('https://accounts.google.com/ — not typosquatting', () => {
  const r = analyzeUrl('https://accounts.google.com/')
  assert.equal(r.typosquatting, false, 'typosquatting should be false')
})

test('https://accounts.google.com/ — not deceptive subdomain', () => {
  const r = analyzeUrl('https://accounts.google.com/')
  assert.equal(r.indicators.deceptiveSubdomain, false, 'deceptiveSubdomain should be false')
})

test('https://www.google.com/ — low risk score', () => {
  const r = analyzeUrl('https://www.google.com/')
  assert(r.riskPoints < 30, `riskPoints should be < 30 for google.com, got ${r.riskPoints}`)
})

// ---------------------------------------------------------------------------
// TEST 8 — HTTP
// ---------------------------------------------------------------------------
console.log('\n── TEST 8: HTTP protocol ──')
test('http://example.com/login — http indicator = true', () => {
  const r = analyzeUrl('http://example.com/login')
  assert.equal(r.indicators.http, true, 'http should be true')
})

// ---------------------------------------------------------------------------
// TEST 9 — Sensitive path keywords
// ---------------------------------------------------------------------------
console.log('\n── TEST 9: Sensitive path keywords ──')
test('https://example.com/account/verify?payment=true — suspiciousPath = true', () => {
  const r = analyzeUrl('https://example.com/account/verify?payment=true')
  assert.equal(r.indicators.suspiciousPath, true, 'suspiciousPath should be true')
  assert(r.matchedPathKeywords.length >= 2, `Expected >= 2 keywords, got: ${r.matchedPathKeywords.join(', ')}`)
})

test('https://example.com/account/verify?payment=true — matched keywords include account and verify', () => {
  const r = analyzeUrl('https://example.com/account/verify?payment=true')
  assert(r.matchedPathKeywords.includes('account'), 'should include "account"')
  assert(r.matchedPathKeywords.includes('verify'), 'should include "verify"')
})

// ---------------------------------------------------------------------------
// TEST 10 — Multiple URLs
// ---------------------------------------------------------------------------
console.log('\n── TEST 10: Multiple URL extraction ──')
test('Text with two URLs — both extracted', () => {
  const text = 'Check https://google.com and http://netfIix-verify.cc/login'
  const urls = extractUrlsFromText(text)
  assert.equal(urls.length, 2, `Expected 2 URLs, got ${urls.length}: ${urls.join(', ')}`)
})

test('analyzeUrls with two URLs — suspicious one found', () => {
  const text = 'Check https://google.com and http://netfIix-verify.cc/login'
  const result = analyzeUrls(text)
  assert.equal(result.urlCount, 2, 'urlCount should be 2')
  assert(result.hasTyposquatting, 'hasTyposquatting should be true for the netflix fake')
})

test('Both URLs analyzed independently', () => {
  const text = 'Check https://google.com and http://netfIix-verify.cc/login'
  const result = analyzeUrls(text)
  const domains = result.urlResults.map(r => r.domain)
  assert(domains.some(d => d === 'google.com'), 'google.com should be in results')
  assert(domains.some(d => d.includes('netfiix') || d.includes('netflix')), 'netflix fake domain should be in results')
})

// ---------------------------------------------------------------------------
// TEST 11 — Userinfo / @ trick
// ---------------------------------------------------------------------------
console.log('\n── TEST 11: @ userinfo abuse ──')
test('https://paypal.com@evil.example/login — userinfoAbuse = true', () => {
  const r = analyzeUrl('https://paypal.com@evil.example/login')
  assert.equal(r.indicators.userinfoAbuse, true, 'userinfoAbuse should be true')
})

// ---------------------------------------------------------------------------
// TEST 12 — Official Indian banks (must NOT be falsely flagged)
// ---------------------------------------------------------------------------
console.log('\n── TEST 12: Official Indian bank domains ──')
test('https://www.sbi.co.in/ — not typosquatting', () => {
  const r = analyzeUrl('https://www.sbi.co.in/')
  assert.equal(r.typosquatting, false, `typosquatting should be false for sbi.co.in, got ${r.typosquatting}`)
})

test('https://www.hdfcbank.com/ — not typosquatting', () => {
  const r = analyzeUrl('https://www.hdfcbank.com/')
  assert.equal(r.typosquatting, false, `typosquatting should be false for hdfcbank.com`)
})

test('https://www.icicibank.com/ — not typosquatting', () => {
  const r = analyzeUrl('https://www.icicibank.com/')
  assert.equal(r.typosquatting, false, `typosquatting should be false for icicibank.com`)
})

// ---------------------------------------------------------------------------
// BONUS TESTS — Demo URL coverage
// ---------------------------------------------------------------------------
console.log('\n── BONUS: Demo URL verification ──')
test('SBI spoof — deceptive or typosquat detected', () => {
  const r = analyzeUrl('http://sbi-secure-verify.in.net/auth')
  assert(r.suspicious, 'SBI spoof should be suspicious')
  // "sbi" appears in subdomain "sbi-secure-verify" of in.net
  assert(r.typosquatting || r.indicators.deceptiveSubdomain || r.indicators.http,
    'Should flag typosquatting or deceptive subdomain or http')
})

test('Google careers fake — suspicious', () => {
  const r = analyzeUrl('https://g00gle-careers-apply.web.app/form/new')
  assert(r.suspicious, 'Google careers fake should be suspicious')
  assert(r.typosquatting || r.indicators.suspiciousTld,
    'Should detect typosquatting or suspicious TLD (.web.app)')
})

test('techdigest.dev — benign', () => {
  const r = analyzeUrl('https://techdigest.dev/weekly/2026-w40')
  // Should not be flagged as typosquatting
  assert.equal(r.typosquatting, false, 'techdigest.dev should not be flagged as typosquatting')
})

test('github.com — benign', () => {
  const r = analyzeUrl('https://github.com/security/advisories')
  assert.equal(r.typosquatting, false, 'github.com should not be flagged as typosquatting')
  assert(r.riskPoints < 30, `github.com riskPoints should be < 30, got ${r.riskPoints}`)
})

// Technical keywords
test('detectTechnicalKeywords — matches billing and password', () => {
  const kws = detectTechnicalKeywords('Update your billing information and enter your password')
  assert(kws.includes('billing'), 'should detect "billing"')
  assert(kws.includes('password'), 'should detect "password"')
})

test('detectTechnicalKeywords — empty on benign text', () => {
  const kws = detectTechnicalKeywords('Hello, please check your schedule for tomorrow.')
  assert.equal(kws.length, 0, `Expected 0 keywords, got: ${kws.join(', ')}`)
})

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${'─'.repeat(50)}`)
console.log(`Tests complete: ${passed} passed, ${failed} failed`)
if (failed > 0) {
  process.exit(1)
}
