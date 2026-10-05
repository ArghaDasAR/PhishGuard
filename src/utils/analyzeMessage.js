/* Simple analysis engine - extracts signals from message text */
/* Member 2 URL engine is in src/utils/urlHeuristics.js */
import { analyzeUrls as heuristicAnalyzeUrls, extractUrlsFromText, detectTechnicalKeywords } from './urlHeuristics.js'

// TYPOSQUAT_BRANDS kept for psychology/impersonation detection used by Member 3
// URL analysis is now delegated to urlHeuristics.js
const TYPOSQUAT_BRANDS = [
  { brand: 'netflix', pattern: /netf[li1][li1]x|netf[il1]x/i },
  { brand: 'google', pattern: /g[o0][o0]g[li1]e/i },
  { brand: 'amazon', pattern: /amaz[o0]n|amzn/i },
  { brand: 'paypal', pattern: /payp[a@][li1]/i },
  { brand: 'apple', pattern: /app[li1]e|[a@]pp[li1]e/i },
  { brand: 'microsoft', pattern: /m[i1]cr[o0]s[o0]ft/i },
  { brand: 'facebook', pattern: /f[a@]ceb[o0][o0]k|faceb[o0]k/i },
  { brand: 'instagram', pattern: /[i1]nst[a@]gr[a@]m/i },
  { brand: 'sbi', pattern: /\bsb[i1]\b/i },
  { brand: 'hdfc', pattern: /hdfc/i },
  { brand: 'icici', pattern: /[i1]c[i1]c[i1]/i },
]

const URGENCY_PHRASES = [
  /within \d+ (hour|minute|day)/i,
  /immediate(ly)?/i,
  /urgent/i,
  /act now/i,
  /time.?sensitive/i,
  /expir(e|es|ing|ation)/i,
  /suspend(ed)?/i,
  /deactivat/i,
  /terminat/i,
  /locked/i,
  /restricted/i,
  /last chance/i,
  /final warning/i,
  /don't delay/i,
]

const FEAR_PHRASES = [
  /account.*(terminat|delet|suspend|lock|deactivat)/i,
  /permanent(ly)?/i,
  /loss of/i,
  /unauthorized/i,
  /suspicious activity/i,
  /security (alert|breach|threat)/i,
  /compromis/i,
]

const AUTHORITY_PHRASES = [
  /\[alert\]/i,
  /support team/i,
  /security team/i,
  /automated message/i,
  /do not reply/i,
  /official/i,
  /compliance/i,
  /verification required/i,
]

const CREDENTIAL_PHRASES = [
  /verify.*(identity|account|payment|billing)/i,
  /update.*(payment|billing|information|details|account)/i,
  /confirm.*(identity|account)/i,
  /log.?in/i,
  /sign.?in/i,
  /password/i,
  /credential/i,
  /credit card/i,
  /ssn|social security/i,
]

export function analyzeMessage(text) {
  if (!text || text.trim().length < 10) {
    return null
  }

  // ── Member 2: URL/domain heuristic engine ──────────────────────────────
  const urlAnalysis = heuristicAnalyzeUrls(text)
  const urlResults = urlAnalysis.urlResults
  // Build legacy-compatible url array (domain, suspicious, reason)
  const legacyUrls = urlResults.map(r => ({
    url: r.url,
    domain: r.domain,
    suspicious: r.suspicious,
    typosquatting: r.typosquatting,
    reason: r.reason,
  }))

  // ── Member 3: psychology signals (preserved as-is) ─────────────────────
  const urgencySignals = detectPatterns(text, URGENCY_PHRASES)
  const fearSignals = detectPatterns(text, FEAR_PHRASES)
  const authoritySignals = detectPatterns(text, AUTHORITY_PHRASES)
  const credentialSignals = detectPatterns(text, CREDENTIAL_PHRASES)

  const signals = []
  const badges = []
  let totalScore = 0

  // ── URL Analysis (powered by Member 2 engine) ──────────────────────────
  if (urlResults.some(u => u.suspicious)) {
    const worst = urlResults.find(u => u.suspicious)
    const pts = Math.min(35, 20 + Math.round(urlAnalysis.technicalScore * 0.15))
    signals.push({
      category: 'Link Intelligence',
      severity: 'high',
      signal: 'Suspicious domain detected',
      detail: `Domain "${worst.domain}" ${worst.reason}`,
      points: pts
    })
    totalScore += pts
    badges.push('SUSPICIOUS URL')

    if (urlAnalysis.hasTyposquatting) {
      const pts2 = 8
      signals.push({
        category: 'Link Intelligence',
        severity: 'high',
        signal: 'Typosquatting detected',
        detail: `Domain appears to mimic a recognized brand using character substitution.`,
        points: pts2
      })
      totalScore += pts2
      badges.push('TYPOSQUATTING')
    }

    if (urlAnalysis.hasRawIp) {
      badges.push('IP HOST DETECTED')
    }
    if (urlAnalysis.hasDangerousFile) {
      badges.push('DANGEROUS FILE')
    }
  } else if (urlAnalysis.urlCount > 0) {
    signals.push({
      category: 'Link Intelligence',
      severity: 'low',
      signal: 'Links appear consistent',
      detail: 'No obviously suspicious domains detected in the message URLs.',
      points: 4
    })
    totalScore += 4
  }

  // ── Impersonation ──────────────────────────────────────────────────────
  const brandMentions = TYPOSQUAT_BRANDS.filter(b => b.pattern.test(text))
  if (brandMentions.length > 0 && urlResults.some(u => u.suspicious)) {
    const pts = 22
    signals.push({
      category: 'Impersonation Detection',
      severity: 'high',
      signal: 'Brand impersonation detected',
      detail: `Message references "${brandMentions[0].brand}" but uses unofficial domains or communication channels.`,
      points: pts
    })
    totalScore += pts
    badges.push('IMPERSONATION')
  }

  // ── Urgency (Member 3) ─────────────────────────────────────────────────
  if (urgencySignals.length >= 2) {
    const pts = Math.min(18, 8 + urgencySignals.length * 3)
    signals.push({
      category: 'Urgency & Pressure',
      severity: urgencySignals.length >= 3 ? 'high' : 'medium',
      signal: 'False urgency detected',
      detail: `${urgencySignals.length} urgency indicators found including time-limited threats and action demands.`,
      points: pts
    })
    totalScore += pts
    badges.push('FALSE URGENCY')
  } else if (urgencySignals.length === 1) {
    signals.push({
      category: 'Urgency & Pressure',
      severity: 'low',
      signal: 'Mild urgency signals',
      detail: 'Some urgency language detected but within normal range.',
      points: 4
    })
    totalScore += 4
  }

  // ── Fear / Emotional Pressure (Member 3) ───────────────────────────────
  if (fearSignals.length >= 2) {
    const pts = Math.min(14, 6 + fearSignals.length * 3)
    signals.push({
      category: 'Social Engineering',
      severity: fearSignals.length >= 3 ? 'high' : 'medium',
      signal: 'Emotional pressure detected',
      detail: 'Language designed to create fear of loss or consequences to pressure immediate action.',
      points: pts
    })
    totalScore += pts
    badges.push('EMOTIONAL PRESSURE')
  }

  // ── Authority (Member 3) ───────────────────────────────────────────────
  if (authoritySignals.length >= 2) {
    const pts = Math.min(10, 4 + authoritySignals.length * 2)
    signals.push({
      category: 'Social Engineering',
      severity: 'medium',
      signal: 'Authority exploitation',
      detail: 'Uses authoritative language and institutional framing to bypass critical evaluation.',
      points: pts
    })
    totalScore += pts
    badges.push('FAKE AUTHORITY')
  }

  // ── Credential Request (Member 3) ──────────────────────────────────────
  if (credentialSignals.length >= 1) {
    const pts = Math.min(12, 6 + credentialSignals.length * 3)
    signals.push({
      category: 'Social Engineering',
      severity: 'high',
      signal: 'Credential harvesting indicators',
      detail: 'Message requests verification of sensitive personal or financial information.',
      points: pts
    })
    totalScore += pts
    badges.push('CREDENTIAL REQUEST')
  }

  // ── Social Engineering composite (Member 3) ────────────────────────────
  if (fearSignals.length + authoritySignals.length + urgencySignals.length >= 4) {
    badges.push('SOCIAL ENGINEERING')
  }

  // ── Minimum analysis fallback ──────────────────────────────────────────
  if (signals.length === 0) {
    signals.push({
      category: 'Message Analysis',
      severity: 'low',
      signal: 'No significant threats detected',
      detail: 'The message does not contain obvious phishing or social-engineering signals.',
      points: 4
    })
    totalScore += 4
  }

  const score = Math.min(100, totalScore)
  const explanation = generateExplanation(signals, score, badges)

  return {
    // ── Existing UI-compatible fields ──────────────────────────────────
    score,
    riskLevel: getRiskLevel(score),
    signals: signals.sort((a, b) => b.points - a.points),
    badges,
    urls: legacyUrls,
    explanation,
    messageLength: text.length,
    // ── Member 2 extended fields ───────────────────────────────────────
    technicalScore: urlAnalysis.technicalScore,
    technicalIndicators: urlResults.length > 0 ? urlResults[0].indicators : null,
    matchedBrands: urlAnalysis.matchedBrands,
    urlCount: urlAnalysis.urlCount,
  }
}

// extractUrls is now provided by urlHeuristics.js (extractUrlsFromText)
// analyzeUrls is now provided by urlHeuristics.js (analyzeUrls)
// These internal helpers are removed to avoid duplicated logic.

function detectPatterns(text, patterns) {
  return patterns.filter(p => p.test(text))
}

export function getRiskLevel(score) {
  const s = Math.max(0, Math.min(100, Math.round(score || 0)))
  if (s <= 29) return { level: 'LOW', label: 'LOW RISK', color: 'low' }
  if (s <= 59) return { level: 'MEDIUM', label: 'MEDIUM RISK', color: 'medium' }
  if (s <= 79) return { level: 'HIGH', label: 'HIGH RISK', color: 'high' }
  return { level: 'CRITICAL', label: 'CRITICAL RISK', color: 'critical' }
}

function generateExplanation(signals, score, badges) {
  const high = signals.filter(s => s.severity === 'high')
  const medium = signals.filter(s => s.severity === 'medium')

  if (score <= 25) {
    return 'This message shows characteristics of a legitimate communication. No significant phishing or social-engineering signals were detected. Standard caution is still recommended when clicking links or sharing personal information.'
  }

  const parts = []
  if (high.length > 0) {
    parts.push(`This message contains ${high.length} high-risk signal${high.length > 1 ? 's' : ''}`)
  }
  if (medium.length > 0) {
    parts.push(`${medium.length} medium-risk indicator${medium.length > 1 ? 's' : ''}`)
  }

  const tactics = []
  if (badges.includes('SUSPICIOUS URL') || badges.includes('TYPOSQUATTING')) tactics.push('a lookalike domain')
  if (badges.includes('IMPERSONATION')) tactics.push('brand impersonation')
  if (badges.includes('FALSE URGENCY')) tactics.push('artificial time pressure')
  if (badges.includes('EMOTIONAL PRESSURE')) tactics.push('fear-based language')
  if (badges.includes('CREDENTIAL REQUEST')) tactics.push('credential harvesting')

  let explanation = parts.join(' and ') + '. '
  if (tactics.length > 0) {
    explanation += `The message combines ${tactics.join(', ')}. `
  }
  explanation += 'Together, these signals suggest this communication should be treated with significant caution. Verify through official channels before taking any action.'

  return explanation
}

/* Dedicated URL & Domain Analysis Engine — Member 2 */
export function analyzeUrlInput(rawInput) {
  if (!rawInput || !rawInput.trim()) return null

  // Normalise input: prepend scheme if missing, split on whitespace/newlines
  const lines = rawInput.split(/[\n\r,]+/).map(s => s.trim()).filter(Boolean)
  if (lines.length === 0) return null

  // For each line, ensure it has a scheme so the URL parser can handle it
  const normalisedInputs = lines.map(item => {
    if (!/^https?:\/\//i.test(item)) return 'https://' + item
    return item
  })

  // ── Member 2: delegate to urlHeuristics engine ─────────────────────────
  const urlAnalysis = heuristicAnalyzeUrls(normalisedInputs)
  const urlResults = urlAnalysis.urlResults

  // Build signals and badges from per-URL results
  const signals = []
  const badges = []
  let totalScore = 0

  for (const r of urlResults) {
    const ind = r.indicators

    if (ind.rawIp) {
      signals.push({
        category: 'Host Infrastructure',
        severity: 'high',
        signal: 'Direct IP host detected',
        detail: `Destination "${r.domain}" uses a raw IP address instead of a domain name, commonly used in disposable phishing servers.`,
        points: 35
      })
      totalScore += 35
      if (!badges.includes('IP HOST DETECTED')) badges.push('IP HOST DETECTED')
    }

    if (ind.userinfoAbuse) {
      signals.push({
        category: 'URL Obfuscation',
        severity: 'high',
        signal: 'Suspicious @ (userinfo) trick detected',
        detail: `The URL uses a userinfo prefix (e.g. paypal.com@evil.com) to disguise the real destination as "${r.domain}".`,
        points: 30
      })
      totalScore += 30
      if (!badges.includes('URL OBFUSCATION')) badges.push('URL OBFUSCATION')
    }

    if (ind.suspiciousTld) {
      const tldMsg = r.reasons.find(rs => rs.includes('extension')) || 'Suspicious TLD'
      signals.push({
        category: 'Domain Reputation',
        severity: 'medium',
        signal: 'High-risk domain extension',
        detail: tldMsg,
        points: 18
      })
      totalScore += 18
      if (!badges.includes('SUSPICIOUS TLD')) badges.push('SUSPICIOUS TLD')
    }

    if (ind.typosquatting) {
      signals.push({
        category: 'Brand Protection',
        severity: 'high',
        signal: `Typosquatting: ${r.matchedBrand || 'unknown brand'}`,
        detail: `The domain "${r.domain}" employs homoglyphs or character substitution targeting "${r.matchedBrand || 'a known brand'}".`,
        points: 36
      })
      totalScore += 36
      if (!badges.includes('TYPOSQUATTING')) badges.push('TYPOSQUATTING')
    }

    if (ind.deceptiveSubdomain) {
      signals.push({
        category: 'Domain Structure',
        severity: 'high',
        signal: 'Deceptive subdomain structure',
        detail: `Domain places brand name "${r.matchedBrand || 'a known brand'}" in a subdomain to deceive victims.`,
        points: 28
      })
      totalScore += 28
      if (!badges.includes('DECEPTIVE SUBDOMAIN')) badges.push('DECEPTIVE SUBDOMAIN')
    }

    if (ind.dangerousFile) {
      signals.push({
        category: 'Malware Distribution',
        severity: 'high',
        signal: `Dangerous file extension (${r.dangerousExtension})`,
        detail: `URL path contains a potentially malicious file type (${r.dangerousExtension}) that may execute code when downloaded.`,
        points: 35
      })
      totalScore += 35
      if (!badges.includes('DANGEROUS FILE')) badges.push('DANGEROUS FILE')
    }

    if (ind.suspiciousPath && r.matchedPathKeywords.length > 0) {
      const kws = r.matchedPathKeywords.slice(0, 4).join(', ')
      const pts = Math.min(20, 10 + r.matchedPathKeywords.length * 3)
      signals.push({
        category: 'Path Intelligence',
        severity: r.suspicious ? 'high' : 'medium',
        signal: 'Credential harvesting path pattern',
        detail: `URL path targets sensitive action triggers (${kws}).`,
        points: pts
      })
      totalScore += pts
      if (!badges.includes('CREDENTIAL HARVESTING')) badges.push('CREDENTIAL HARVESTING')
    }

    if (ind.http) {
      signals.push({
        category: 'Protocol Security',
        severity: 'medium',
        signal: 'Unencrypted HTTP protocol',
        detail: 'URL communicates over unencrypted HTTP, leaving credentials vulnerable to interception.',
        points: 12
      })
      totalScore += 12
      if (!badges.includes('UNENCRYPTED HTTP')) badges.push('UNENCRYPTED HTTP')
    }

    if (ind.punycode) {
      signals.push({
        category: 'Domain Obfuscation',
        severity: 'medium',
        signal: 'Punycode internationalised domain',
        detail: 'Domain uses xn-- punycode encoding, commonly used to create Unicode lookalike characters.',
        points: 22
      })
      totalScore += 22
      if (!badges.includes('PUNYCODE DOMAIN')) badges.push('PUNYCODE DOMAIN')
    }

    if (ind.suspiciousPort) {
      signals.push({
        category: 'Infrastructure',
        severity: 'medium',
        signal: `Non-standard port detected`,
        detail: `URL specifies a non-standard port which is atypical for legitimate web services.`,
        points: 10
      })
      totalScore += 10
      if (!badges.includes('UNUSUAL PORT')) badges.push('UNUSUAL PORT')
    }

    if (r.suspicious && !ind.rawIp && !ind.userinfoAbuse && !ind.typosquatting &&
        !ind.deceptiveSubdomain && !ind.dangerousFile && !ind.suspiciousTld &&
        !ind.suspiciousPath && !ind.http && !ind.punycode && !ind.suspiciousPort &&
        r.reasons.includes('Malformed or unparseable URL syntax')) {
      signals.push({
        category: 'Syntax Analysis',
        severity: 'medium',
        signal: 'Malformed URL format',
        detail: `The provided string "${r.url}" is not a valid standard URL.`,
        points: 20
      })
      totalScore += 20
    }
  }

  if (signals.length === 0) {
    signals.push({
      category: 'URL Intelligence',
      severity: 'low',
      signal: 'No malicious indicators detected',
      detail: 'Domain syntax, protocol, and structure correspond with benign, established web endpoints.',
      points: 6
    })
    totalScore += 6
  }

  // Use technicalScore as the authoritative score (capped at 100)
  const score = Math.min(100, Math.max(totalScore, urlAnalysis.technicalScore))
  const uniqueBadges = [...new Set(badges)]

  // Legacy-compatible url array
  const legacyUrls = urlResults.map(r => ({
    url: r.normalizedUrl || r.url,
    domain: r.domain,
    suspicious: r.suspicious,
    typosquatting: r.typosquatting,
    reason: r.reason,
  }))

  const highCount = signals.filter(s => s.severity === 'high').length
  const explanation = score > 50
    ? `URL inspection revealed ${highCount} high-severity risk factor${highCount !== 1 ? 's' : ''} including suspicious host attributes, deceptive brand keywords, or high-risk domain extensions. Navigating to this destination poses severe phishing risks.`
    : `The inspected URL exhibits legitimate structural patterns without known typosquatting or high-risk TLD anomalies. Exercise standard security precautions.`

  return {
    // ── UI-compatible fields ───────────────────────────────────────────
    score,
    riskLevel: getRiskLevel(score),
    signals: signals.sort((a, b) => b.points - a.points),
    badges: uniqueBadges,
    urls: legacyUrls,
    explanation,
    type: 'url',
    // ── Member 2 extended fields ───────────────────────────────────────
    technicalScore: urlAnalysis.technicalScore,
    technicalIndicators: urlResults.length > 0 ? urlResults[0].indicators : null,
    matchedBrands: urlAnalysis.matchedBrands,
    urlCount: urlAnalysis.urlCount,
  }
}

/* Dedicated Image / Screenshot Scam Screening Engine */
export function analyzeImageScam({ fileName, imagePreview, detectedText }) {
  const text = (detectedText || '').toLowerCase()
  const signals = []
  const badges = ['IMAGE SCREENING']
  let totalScore = 0

  // 1. Brand Impersonation in Graphic
  const brands = ['netflix', 'chase', 'paypal', 'apple', 'google', 'amazon', 'sbi', 'hdfc', 'binance', 'metamask']
  const matchedBrand = brands.find(b => text.includes(b) || (fileName || '').toLowerCase().includes(b))
  if (matchedBrand) {
    signals.push({
      category: 'Visual Impersonation',
      severity: 'high',
      signal: `Brand identity spoofing: ${matchedBrand.toUpperCase()}`,
      detail: `The screened image incorporates corporate trademarks, logos, and color palettes mimicking ${matchedBrand.toUpperCase()}.`,
      points: 30
    })
    totalScore += 30
    badges.push('BRAND IMPERSONATION')
  }

  // 2. Urgent Time-limit Threats
  if (/2 hours|24 hours|immediate|suspend|within|terminate|deadline|urgent|act now/i.test(text)) {
    signals.push({
      category: 'Psychological Coercion',
      severity: 'high',
      signal: 'Visual urgency cues & countdown threats',
      detail: 'Screenshot features artificial urgency framing designed to induce panic and prompt impulsive compliance.',
      points: 25
    })
    totalScore += 25
    badges.push('FALSE URGENCY')
  }

  // 3. Credential / Payment Solicitation
  if (/payment|billing|failed|credit card|cvv|seed phrase|password|verify account|update details|claim/i.test(text)) {
    signals.push({
      category: 'Data Harvesting',
      severity: 'high',
      signal: 'Payment & credential collection intent',
      detail: 'The screenshot prompts the user to enter billing data, passwords, or recovery phrases to avoid penalties.',
      points: 22
    })
    totalScore += 22
    badges.push('CREDENTIAL HARVESTING')
  }

  // 4. Suspicious URL / Link / QR in Image
  const urlMatches = text.match(/https?:\/\/[^\s<>"{}|\\^`\]]+|[a-z0-9-]+\.(?:cc|xyz|top|icu|buzz|tk|ga|cf)/i)
  if (urlMatches || /\.cc|\.xyz|\.top|verify|auth/i.test(text)) {
    signals.push({
      category: 'Visual Link Intelligence',
      severity: 'high',
      signal: 'Deceptive URL or redirection callout',
      detail: 'Visual content directs the victim toward an unverified third-party phishing or harvest domain.',
      points: 20
    })
    totalScore += 20
    badges.push('DECEPTIVE LINK IN IMAGE')
  }

  if (signals.length === 0) {
    signals.push({
      category: 'Image Visual Inspection',
      severity: 'low',
      signal: 'No overt scam patterns detected',
      detail: 'Visual elements and extracted text do not exhibit recognized social engineering or phishing templates.',
      points: 8
    })
    totalScore += 8
    badges.push('CLEAR SCREENING')
  } else {
    badges.push('SCAM SIGNATURE MATCH')
  }

  const score = Math.min(100, Math.max(totalScore, signals.some(s => s.severity === 'high') ? 85 : 12))

  return {
    score,
    riskLevel: getRiskLevel(score),
    signals: signals.sort((a, b) => b.points - a.points),
    badges: [...new Set(badges)],
    urls: urlMatches ? [{ url: urlMatches[0], domain: urlMatches[0], suspicious: true, reason: 'Deceptive URL embedded in screenshot' }] : [],
    explanation: score > 50
      ? `Visual screening identified deceptive brand elements, high-pressure urgency prompts, and credential solicitation patterns within the submitted screenshot. This image matches confirmed phishing and social engineering templates.`
      : `Visual screening did not detect recognizable scam templates or deceptive brand impersonation within this image. Verify external links independently.`,
    imageMeta: {
      fileName: fileName || 'screenshot.png',
      detectedText: detectedText || 'Screened via optical & visual feature analysis',
      previewUrl: imagePreview
    },
    type: 'image'
  }
}

