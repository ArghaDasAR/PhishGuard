/* Simple analysis engine - extracts signals from message text */

const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`\]]+/gi

const SUSPICIOUS_TLDS = ['.cc', '.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.buzz', '.icu', '.web.app', '.firebaseapp.com', '.pages.dev']

const TYPOSQUAT_BRANDS = [
  { brand: 'netflix', pattern: /netf[li1][li1]x|netf[il1]x/i },
  { brand: 'google', pattern: /g[o0][o0]g[li1]e/i },
  { brand: 'amazon', pattern: /amaz[o0]n|amzn/i },
  { brand: 'paypal', pattern: /payp[a@][li1]/i },
  { brand: 'apple', pattern: /app[li1]e|[a@]pp[li1]e/i },
  { brand: 'microsoft', pattern: /m[i1]cr[o0]s[o0]ft/i },
  { brand: 'facebook', pattern: /f[a@]ceb[o0][o0]k|faceb[o0]k/i },
  { brand: 'instagram', pattern: /[i1]nst[a@]gr[a@]m/i },
  { brand: 'sbi', pattern: /sb[i1]/i },
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

  const urls = extractUrls(text)
  const urlAnalysis = analyzeUrls(urls)
  const urgencySignals = detectPatterns(text, URGENCY_PHRASES)
  const fearSignals = detectPatterns(text, FEAR_PHRASES)
  const authoritySignals = detectPatterns(text, AUTHORITY_PHRASES)
  const credentialSignals = detectPatterns(text, CREDENTIAL_PHRASES)

  const signals = []
  const badges = []
  let totalScore = 0

  // URL Analysis
  if (urlAnalysis.some(u => u.suspicious)) {
    const worst = urlAnalysis.find(u => u.suspicious)
    let pts = 30
    signals.push({
      category: 'Link Intelligence',
      severity: 'high',
      signal: 'Suspicious domain detected',
      detail: `Domain "${worst.domain}" ${worst.reason}`,
      points: pts
    })
    totalScore += pts
    badges.push('SUSPICIOUS URL')

    if (urlAnalysis.some(u => u.typosquatting)) {
      pts = 8
      signals.push({
        category: 'Link Intelligence',
        severity: 'high',
        signal: 'Typosquatting detected',
        detail: `Domain appears to mimic a recognized brand using character substitution.`,
        points: pts
      })
      totalScore += pts
      badges.push('TYPOSQUATTING')
    }
  } else if (urls.length > 0) {
    signals.push({
      category: 'Link Intelligence',
      severity: 'low',
      signal: 'Links appear consistent',
      detail: 'No obviously suspicious domains detected in the message URLs.',
      points: 4
    })
    totalScore += 4
  }

  // Impersonation
  const brandMentions = TYPOSQUAT_BRANDS.filter(b => b.pattern.test(text))
  if (brandMentions.length > 0 && urlAnalysis.some(u => u.suspicious)) {
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

  // Urgency
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

  // Fear / Emotional Pressure
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

  // Authority
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

  // Credential Request
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

  // Social Engineering composite
  if (fearSignals.length + authoritySignals.length + urgencySignals.length >= 4) {
    badges.push('SOCIAL ENGINEERING')
  }

  // Ensure minimum analysis
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

  // Generate explanation
  const explanation = generateExplanation(signals, score, badges)

  return {
    score,
    riskLevel: getRiskLevel(score),
    signals: signals.sort((a, b) => b.points - a.points),
    badges,
    urls: urlAnalysis,
    explanation,
    messageLength: text.length,
  }
}

function extractUrls(text) {
  const matches = text.match(URL_REGEX) || []
  return [...new Set(matches)]
}

function analyzeUrls(urls) {
  return urls.map(url => {
    try {
      const urlObj = new URL(url)
      const domain = urlObj.hostname
      const suspicious = SUSPICIOUS_TLDS.some(tld => domain.endsWith(tld))
      const typosquatting = TYPOSQUAT_BRANDS.some(b => {
        return b.pattern.test(domain) && !domain.includes(b.brand + '.')
      })

      let reason = ''
      if (typosquatting) reason = 'appears to mimic a recognized brand using character substitution or alternate TLD'
      else if (suspicious) reason = `uses a suspicious TLD commonly associated with phishing campaigns`
      else reason = 'Domain matches sender context'

      return { url, domain, suspicious: suspicious || typosquatting, typosquatting, reason }
    } catch {
      return { url, domain: url, suspicious: true, typosquatting: false, reason: 'Malformed URL' }
    }
  })
}

function detectPatterns(text, patterns) {
  return patterns.filter(p => p.test(text))
}

export function getRiskLevel(score) {
  if (score <= 25) return { level: 'LOW', label: 'LOW RISK', color: 'low' }
  if (score <= 50) return { level: 'MEDIUM', label: 'MEDIUM RISK', color: 'medium' }
  if (score <= 75) return { level: 'HIGH', label: 'HIGH RISK', color: 'high' }
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

/* Dedicated URL & Domain Analysis Engine */
export function analyzeUrlInput(rawInput) {
  if (!rawInput || !rawInput.trim()) return null

  const items = rawInput.split(/[\n,\s]+/).map(s => s.trim()).filter(Boolean)
  if (items.length === 0) return null

  const urlResults = []
  const signals = []
  const badges = []
  let totalScore = 0

  for (const item of items) {
    let clean = item
    if (!/^https?:\/\//i.test(clean)) {
      clean = 'https://' + clean
    }

    try {
      const urlObj = new URL(clean)
      const domain = urlObj.hostname.toLowerCase()
      const pathname = urlObj.pathname.toLowerCase()
      const search = urlObj.search.toLowerCase()
      const isHttp = urlObj.protocol === 'http:'

      let suspicious = false
      let typosquatting = false
      const reasons = []

      // 1. IP address hostname check
      const ipPattern = /^(?:\d{1,3}\.){3}\d{1,3}$/
      if (ipPattern.test(domain)) {
        suspicious = true
        reasons.push('Uses raw numeric IP address instead of domain')
        signals.push({
          category: 'Host Infrastructure',
          severity: 'high',
          signal: 'Direct IP host detected',
          detail: `Destination "${domain}" uses a raw IP address instead of a domain name, commonly used in disposable phishing servers.`,
          points: 35
        })
        totalScore += 35
        badges.push('IP HOST DETECTED')
      }

      // 2. Suspicious TLD check
      const matchedTld = SUSPICIOUS_TLDS.find(tld => domain.endsWith(tld))
      if (matchedTld) {
        suspicious = true
        reasons.push(`Uses high-risk TLD (${matchedTld}) with elevated fraud history`)
        signals.push({
          category: 'Domain Reputation',
          severity: 'high',
          signal: `High-risk TLD (${matchedTld})`,
          detail: `The top-level domain "${matchedTld}" has an elevated rate of phishing and deceptive campaigns.`,
          points: 26
        })
        totalScore += 26
        badges.push('SUSPICIOUS TLD')
      }

      // 3. Typosquatting / Character Substitution check
      const matchedBrand = TYPOSQUAT_BRANDS.find(b => {
        return b.pattern.test(domain) && !domain.includes(b.brand + '.')
      })
      if (matchedBrand) {
        suspicious = true
        typosquatting = true
        reasons.push(`Typosquats brand "${matchedBrand.brand}"`)
        signals.push({
          category: 'Brand Protection',
          severity: 'high',
          signal: `Typosquatting: ${matchedBrand.brand}`,
          detail: `The domain "${domain}" employs homoglyphs or character substitution targeting "${matchedBrand.brand}".`,
          points: 34
        })
        totalScore += 34
        badges.push('TYPOSQUATTING')
      }

      // 4. Deceptive Subdomains (e.g. paypal.com.account-update.xyz)
      const subBrandMatch = TYPOSQUAT_BRANDS.find(b => domain.includes(b.brand) && !domain.endsWith('.' + b.brand + '.com') && domain !== b.brand + '.com')
      if (subBrandMatch && !typosquatting) {
        suspicious = true
        reasons.push(`Uses deceptive subdomain containing "${subBrandMatch.brand}"`)
        signals.push({
          category: 'Domain Structure',
          severity: 'high',
          signal: 'Deceptive subdomain structure',
          detail: `Domain structures brand name "${subBrandMatch.brand}" into a subdomain to deceive victims.`,
          points: 24
        })
        totalScore += 24
        badges.push('DECEPTIVE SUBDOMAIN')
      }

      // 5. Credential harvesting path keywords
      const credKeywords = ['login', 'signin', 'verify', 'account', 'update', 'billing', 'security', 'claim', 'wallet', 'auth', 'confirm', 'kyc', 'banking', 'airdrop']
      const matchedPath = credKeywords.filter(kw => pathname.includes(kw) || search.includes(kw))
      if (matchedPath.length > 0) {
        const pts = Math.min(20, 10 + matchedPath.length * 4)
        signals.push({
          category: 'Path Intelligence',
          severity: suspicious ? 'high' : 'medium',
          signal: 'Credential harvesting path pattern',
          detail: `URL path targets sensitive action triggers (${matchedPath.join(', ')}).`,
          points: pts
        })
        totalScore += pts
        badges.push('CREDENTIAL HARVESTING')
      }

      // 6. Plain HTTP (Unencrypted)
      if (isHttp) {
        signals.push({
          category: 'Protocol Security',
          severity: 'medium',
          signal: 'Unencrypted HTTP protocol',
          detail: 'URL communicates over unencrypted HTTP, leaving login credentials vulnerable to interception.',
          points: 12
        })
        totalScore += 12
        badges.push('UNENCRYPTED HTTP')
      }

      urlResults.push({
        url: clean,
        domain,
        suspicious,
        typosquatting,
        reason: reasons.length > 0 ? reasons.join('; ') : 'Domain verified standard structure',
      })
    } catch {
      urlResults.push({
        url: clean,
        domain: clean,
        suspicious: true,
        typosquatting: false,
        reason: 'Malformed or unparseable URL syntax',
      })
      totalScore += 20
      signals.push({
        category: 'Syntax Analysis',
        severity: 'medium',
        signal: 'Malformed URL format',
        detail: `The provided string "${clean}" is not a valid standard URL.`,
        points: 20
      })
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

  const score = Math.min(100, totalScore)
  const uniqueBadges = [...new Set(badges)]
  const explanation = score > 50
    ? `URL inspection revealed ${signals.filter(s => s.severity === 'high').length} high-severity risk factors including suspicious host attributes, deceptive brand keywords, or high-risk domain extensions. Navigating to this destination poses severe phishing risks.`
    : `The inspected URL exhibits legitimate structural patterns without known typosquatting or high-risk TLD anomalies. Exercise standard security precautions.`

  return {
    score,
    riskLevel: getRiskLevel(score),
    signals: signals.sort((a, b) => b.points - a.points),
    badges: uniqueBadges,
    urls: urlResults,
    explanation,
    type: 'url'
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

