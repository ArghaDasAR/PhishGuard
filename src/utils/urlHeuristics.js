/**
 * urlHeuristics.js — Member 2: URL & Keyword Heuristic Engine
 *
 * Static, local-only technical analysis of URLs and domains.
 * No network requests. No external APIs. No dependencies.
 * Uses only the browser / Node.js built-in URL parser.
 */

// ---------------------------------------------------------------------------
// CONFIGURATION — Suspicious TLDs
// ---------------------------------------------------------------------------
const SUSPICIOUS_TLDS = [
  '.cc', '.tk', '.ml', '.ga', '.cf', '.gq',
  '.xyz', '.top', '.buzz', '.icu',
  '.web.app',
  '.firebaseapp.com',
  '.pages.dev',
  '.netlify.app',
  '.vercel.app',
  '.glitch.me',
  '.repl.co',
  '.surge.sh',
  '.in.net',
  '.com.co',
  '.net.in',
  '.org.in',
]

// ---------------------------------------------------------------------------
// CONFIGURATION — Non-standard ports
// ---------------------------------------------------------------------------
const STANDARD_PORTS = new Set(['', '80', '443', '8080', '8443'])

// ---------------------------------------------------------------------------
// CONFIGURATION — Dangerous file extensions
// ---------------------------------------------------------------------------
const DANGEROUS_EXTENSIONS = new Set([
  '.exe', '.scr', '.bat', '.cmd', '.msi',
  '.apk', '.jar', '.ps1', '.vbs', '.js',
  '.hta', '.pif', '.cpl', '.reg',
  '.dll', '.lnk', '.wsf',
  '.vbe', '.wsh', '.msc',
])

// ---------------------------------------------------------------------------
// CONFIGURATION — Sensitive path keywords
// ---------------------------------------------------------------------------
const SENSITIVE_PATH_KEYWORDS = [
  'login', 'signin', 'sign-in', 'sign_in',
  'verify', 'verification', 'account',
  'update', 'billing', 'payment',
  'password', 'credential', 'credentials',
  'security', 'confirm', 'auth',
  'kyc', 'banking', 'wallet',
  'claim', 'airdrop', 'recover',
  'reset', 'secure', 'otp',
]

// ---------------------------------------------------------------------------
// CONFIGURATION — Brand model
// ---------------------------------------------------------------------------
const BRAND_CONFIG = [
  {
    brand: 'netflix',
    officialDomains: ['netflix.com', 'netflix.net', 'nflximg.com', 'nflxvideo.net'],
    pattern: /netf[il1][il1]x/i,
  },
  {
    brand: 'google',
    officialDomains: [
      'google.com', 'google.co.in', 'google.co.uk', 'google.de',
      'google.fr', 'google.es', 'google.ca', 'google.com.au',
      'googleapis.com', 'googleusercontent.com', 'gstatic.com',
      'googlevideo.com', 'youtube.com', 'youtu.be',
    ],
    pattern: /g[o0][o0]g[li1]e/i,
  },
  {
    brand: 'amazon',
    officialDomains: [
      'amazon.com', 'amazon.co.in', 'amazon.co.uk', 'amazon.de',
      'amazonaws.com', 'amazontrust.com', 'awsstatic.com',
    ],
    pattern: /amaz[o0]n|amzn/i,
  },
  {
    brand: 'paypal',
    officialDomains: ['paypal.com', 'paypal.me', 'paypalobjects.com'],
    pattern: /payp[a@][li1]/i,
  },
  {
    brand: 'apple',
    officialDomains: [
      'apple.com', 'icloud.com', 'itunes.com',
      'mzstatic.com', 'apple-cloudkit.com',
    ],
    pattern: /app[li1]e|[a@]ppl[e3]/i,
  },
  {
    brand: 'microsoft',
    officialDomains: [
      'microsoft.com', 'microsoftonline.com', 'office.com',
      'live.com', 'outlook.com', 'hotmail.com', 'skype.com',
      'windows.com', 'azure.com', 'azureedge.net',
      'msn.com', 'bing.com', 'xbox.com',
    ],
    pattern: /m[i1]cr[o0]s[o0]ft/i,
  },
  {
    brand: 'facebook',
    officialDomains: [
      'facebook.com', 'fb.com', 'fbcdn.net', 'instagram.com',
      'messenger.com', 'whatsapp.com',
    ],
    pattern: /f[a@]ceb[o0][o0]k|faceb[o0]k/i,
  },
  {
    brand: 'instagram',
    officialDomains: ['instagram.com', 'ig.me', 'cdninstagram.com'],
    pattern: /[i1]nst[a@]gr[a@]m/i,
  },
  {
    brand: 'sbi',
    officialDomains: [
      'sbi.co.in', 'onlinesbi.com', 'onlinesbi.sbi',
      'sbicards.com', 'sbilife.co.in',
    ],
    pattern: /\bsb[i1]\b/i,
  },
  {
    brand: 'hdfc',
    officialDomains: [
      'hdfcbank.com', 'hdfc.com', 'hdfclife.com',
      'hdfcsec.com', 'hdfcfund.com',
    ],
    pattern: /hdfc/i,
  },
  {
    brand: 'icici',
    officialDomains: [
      'icicibank.com', 'icicidirect.com', 'iciciprulife.com',
      'icici.com', 'icicibank.co.in',
    ],
    pattern: /[i1]c[i1]c[i1]/i,
  },
  {
    brand: 'chase',
    officialDomains: ['chase.com', 'jpmorganchase.com', 'jpmorgan.com'],
    pattern: /ch[a@]se/i,
  },
]

// Build a flat set of all official root domains for fast lookup
const ALL_OFFICIAL_DOMAINS = new Set()
for (const b of BRAND_CONFIG) {
  for (const d of b.officialDomains) {
    ALL_OFFICIAL_DOMAINS.add(d.toLowerCase())
  }
}

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

/**
 * Lightweight Levenshtein distance bounded at maxDist.
 */
function levenshtein(a, b, maxDist = 3) {
  if (Math.abs(a.length - b.length) > maxDist) return Infinity
  const la = a.length
  const lb = b.length
  let prev = Array.from({ length: lb + 1 }, (_, i) => i)
  let curr = new Array(lb + 1)
  for (let i = 1; i <= la; i++) {
    curr[0] = i
    let rowMin = i
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost)
      if (curr[j] < rowMin) rowMin = curr[j]
    }
    if (rowMin > maxDist) return Infinity
    const tmp = prev; prev = curr; curr = tmp
  }
  return prev[lb]
}

/**
 * Normalise a label by mapping common char-substitutions back.
 * e.g. "netf1ix" -> "netllix", "g00gle" -> "google"
 */
function normaliseLabel(label) {
  return label
    .replace(/0/g, 'o')
    .replace(/1/g, 'l')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/@/g, 'a')
    .replace(/\$/g, 's')
    .toLowerCase()
}

/**
 * Known multi-label public suffixes for registrable domain extraction.
 */
const MULTI_LABEL_SUFFIXES = new Set([
  'co.in', 'co.uk', 'co.nz', 'co.za', 'co.jp', 'co.kr',
  'com.au', 'com.br', 'com.ar', 'com.mx', 'com.cn',
  'org.in', 'net.in', 'in.net',
  'gov.in', 'gov.uk', 'gov.au',
  'web.app', 'firebaseapp.com', 'pages.dev', 'netlify.app',
  'vercel.app', 'glitch.me', 'repl.co', 'surge.sh',
  'com.co', 'net.co',
])

/**
 * Extract the registrable domain (eTLD+1) from a hostname.
 */
function getRegistrableDomain(hostname) {
  const parts = hostname.toLowerCase().split('.')
  if (parts.length < 2) return hostname.toLowerCase()
  if (parts.length >= 3) {
    const twoLabel = parts.slice(-2).join('.')
    if (MULTI_LABEL_SUFFIXES.has(twoLabel)) {
      return parts.slice(-3).join('.')
    }
  }
  return parts.slice(-2).join('.')
}

/**
 * Check if a hostname is — or is a subdomain of — an official brand domain.
 */
function isOfficialDomain(hostname) {
  const h = hostname.toLowerCase()
  for (const official of ALL_OFFICIAL_DOMAINS) {
    if (h === official || h.endsWith('.' + official)) {
      return true
    }
  }
  return false
}

/**
 * Detect typosquatting.
 */
function detectTyposquatting(hostname) {
  if (isOfficialDomain(hostname)) return { matched: false, brand: null, confidence: null }

  const regDomain = getRegistrableDomain(hostname)
  const regParts = regDomain.split('.')
  const mainLabel = regParts[0]
  const normMain = normaliseLabel(mainLabel.replace(/-/g, ''))

  for (const brand of BRAND_CONFIG) {
    const bName = brand.brand

    // 1. Quick regex hit on REGISTRABLE DOMAIN ONLY (not the full hostname).
    // Testing the full hostname would cause false positives when a legitimate
    // brand name appears in a subdomain (e.g. paypal.com.evil.example.com).
    if (brand.pattern.test(regDomain)) {
      if (isOfficialDomain(regDomain)) continue
      return { matched: true, brand: bName, confidence: 'high' }
    }

    // 2. Normalised edit-distance on the main label
    if (normMain.length >= bName.length - 1 && normMain.length <= bName.length + 5) {
      const dist = levenshtein(normMain, bName, 2)
      if (dist <= 1 && dist !== 0) {
        if (isOfficialDomain(regDomain)) continue
        return { matched: true, brand: bName, confidence: 'medium' }
      }
    }

    // 3. Brand name as substring of main label with extra chars
    const normBrand = bName.toLowerCase()
    if (normMain.includes(normBrand) && normMain !== normBrand) {
      if (isOfficialDomain(regDomain)) continue
      return { matched: true, brand: bName, confidence: 'medium' }
    }
  }

  return { matched: false, brand: null, confidence: null }
}

/**
 * Detect deceptive subdomain (brand name in subdomain but different registrable domain).
 */
function detectDeceptiveSubdomain(hostname) {
  if (isOfficialDomain(hostname)) return { detected: false, brand: null }

  const regDomain = getRegistrableDomain(hostname)
  const subdomainPart = hostname.endsWith('.' + regDomain)
    ? hostname.slice(0, hostname.length - regDomain.length - 1)
    : null

  if (!subdomainPart) return { detected: false, brand: null }

  const sdLower = subdomainPart.toLowerCase()

  for (const brand of BRAND_CONFIG) {
    const bName = brand.brand
    if (sdLower.includes(bName)) {
      return { detected: true, brand: bName }
    }
    for (const od of brand.officialDomains) {
      if (sdLower.includes(od)) {
        return { detected: true, brand: brand.brand }
      }
    }
  }

  return { detected: false, brand: null }
}

function isRawIpv4(hostname) {
  return /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname)
}

function isPunycode(hostname) {
  return /(?:^|\.)xn--/i.test(hostname)
}

function hasPunycodeInRawUrl(rawUrl) {
  return /(?:^|[^a-z0-9])xn--/i.test(String(rawUrl || ''))
}

function isUnicodeHostname(hostname) {
  // eslint-disable-next-line no-control-regex
  return /[^\x00-\x7F]/.test(hostname)
}

function countSubdomainLabels(hostname) {
  const regDomain = getRegistrableDomain(hostname)
  if (hostname === regDomain) return 0
  if (!hostname.endsWith('.' + regDomain)) return 0
  const subdomain = hostname.slice(0, hostname.length - regDomain.length - 1)
  if (!subdomain) return 0
  return subdomain.split('.').length
}

function countHyphens(hostname) {
  return (hostname.match(/-/g) || []).length
}

function numericFraction(hostname) {
  const digits = (hostname.match(/\d/g) || []).length
  return hostname.length > 0 ? digits / hostname.length : 0
}

function detectSuspiciousTld(hostname) {
  // Sort by length descending to try longest match first
  const sorted = SUSPICIOUS_TLDS.slice().sort((a, b) => b.length - a.length)
  for (const tld of sorted) {
    if (hostname.endsWith(tld)) return tld
  }
  return null
}

function detectSensitivePathKeywords(pathname, search) {
  const combined = (pathname + ' ' + search).toLowerCase()
  const matched = new Set()
  for (const kw of SENSITIVE_PATH_KEYWORDS) {
    if (combined.includes(kw)) matched.add(kw)
  }
  return [...matched]
}

function detectDangerousExtension(pathname) {
  const lower = pathname.toLowerCase()
  const extMatch = lower.match(/(\.[a-z0-9]{1,10})(?:[?#]|$)/)
  if (!extMatch) return null
  const ext = extMatch[1]
  return DANGEROUS_EXTENSIONS.has(ext) ? ext : null
}

function detectUserinfoAbuse(urlObj) {
  return !!(urlObj.username || urlObj.password)
}

// ---------------------------------------------------------------------------
// CORE — Analyse a single URL
// ---------------------------------------------------------------------------

export function analyzeUrl(originalUrl) {
  let urlObj
  let parseError = false
  let cleanUrl = String(originalUrl || '').trim()

  // Strip trailing punctuation that is never part of a URL
  cleanUrl = cleanUrl.replace(/[.,!?)\]}'"`>]+$/, '')

  // Check for punycode in raw string before parsing (Node may reject/normalise xn-- domains)
  const rawHasPunycode = hasPunycodeInRawUrl(cleanUrl)

  try {
    urlObj = new URL(cleanUrl)
  } catch {
    parseError = true
  }

  if (parseError) {
    const isPunycodeUrl = rawHasPunycode
    return {
      url: originalUrl,
      normalizedUrl: cleanUrl,
      domain: cleanUrl,
      suspicious: true,
      typosquatting: false,
      matchedBrand: null,
      riskPoints: isPunycodeUrl ? 42 : 20,
      reasons: isPunycodeUrl
        ? ['Punycode (internationalised) domain detected (xn-- prefix)', 'Malformed or unparseable URL syntax']
        : ['Malformed or unparseable URL syntax'],
      indicators: buildEmptyIndicators({ malformedHostname: true, punycode: isPunycodeUrl }),
      matchedPathKeywords: [],
      dangerousExtension: null,
      reason: isPunycodeUrl ? 'Punycode domain detected' : 'Malformed or unparseable URL syntax',
    }
  }

  const hostname = urlObj.hostname.toLowerCase()
  const pathname = urlObj.pathname
  const search = urlObj.search
  const protocol = urlObj.protocol
  const port = urlObj.port

  const indicators = buildEmptyIndicators()
  const reasons = []
  let riskPoints = 0
  let typosquatting = false
  let matchedBrand = null
  let dangerousExtension = null
  let matchedPathKeywords = []

  // 1. Userinfo / @ abuse
  if (detectUserinfoAbuse(urlObj)) {
    indicators.userinfoAbuse = true
    reasons.push('Suspicious @ (userinfo) in URL — real destination may be hidden')
    riskPoints += 28
  }

  // 2. Raw IPv4
  if (isRawIpv4(hostname)) {
    indicators.rawIp = true
    reasons.push('Raw IPv4 address used instead of domain name')
    riskPoints += 30
  }

  // 3. Punycode / Unicode
  if (isPunycode(hostname) || rawHasPunycode) {
    indicators.punycode = true
    reasons.push('Punycode (internationalised) domain detected (xn-- prefix)')
    riskPoints += 22
  } else if (isUnicodeHostname(hostname)) {
    indicators.unicodeHostname = true
    reasons.push('Unicode / non-ASCII characters in hostname')
    riskPoints += 15
  }

  // 4. Suspicious TLD
  const matchedTld = detectSuspiciousTld(hostname)
  if (matchedTld) {
    indicators.suspiciousTld = true
    reasons.push('Suspicious/high-risk domain extension detected (' + matchedTld + ')')
    riskPoints += 14
  }

  // 5. Typosquatting
  const typoResult = detectTyposquatting(hostname)
  if (typoResult.matched) {
    indicators.typosquatting = true
    typosquatting = true
    matchedBrand = typoResult.brand
    const capBrand = matchedBrand.charAt(0).toUpperCase() + matchedBrand.slice(1)
    reasons.push('Possible ' + capBrand + ' typosquatting — domain mimics brand using character substitution')
    riskPoints += typoResult.confidence === 'high' ? 36 : 24
  }

  // 6. Deceptive subdomain (only when not already typosquat)
  if (!typosquatting) {
    const deceptResult = detectDeceptiveSubdomain(hostname)
    if (deceptResult.detected) {
      indicators.deceptiveSubdomain = true
      matchedBrand = matchedBrand || deceptResult.brand
      const capBrand = deceptResult.brand
        ? deceptResult.brand.charAt(0).toUpperCase() + deceptResult.brand.slice(1)
        : 'a known brand'
      reasons.push('Deceptive subdomain — "' + capBrand + '" brand name used in subdomain to mislead')
      riskPoints += 26
    }
  }

  // 7. HTTP
  if (protocol === 'http:') {
    indicators.http = true
    reasons.push('Unencrypted HTTP protocol used')
    riskPoints += 10
  }

  // 8. Non-standard port
  if (port && !STANDARD_PORTS.has(port)) {
    indicators.suspiciousPort = true
    reasons.push('Non-standard port in URL (' + port + ')')
    riskPoints += 10
  }

  // 9. Excessive subdomains
  const subdomainCount = countSubdomainLabels(hostname)
  if (subdomainCount >= 4) {
    indicators.excessiveSubdomains = true
    reasons.push('Excessive subdomain nesting (' + subdomainCount + ' levels)')
    riskPoints += 8
  }

  // 10. Numeric-heavy hostname
  if (!indicators.rawIp) {
    const numFrac = numericFraction(hostname)
    if (numFrac >= 0.4 && hostname.length > 6) {
      indicators.numericHeavyHostname = true
      reasons.push('Hostname is heavily numeric — common in randomly generated phishing infrastructure')
      riskPoints += 5
    }
  }

  // 11. Excessive hyphens
  const hyphenCount = countHyphens(hostname)
  if (hyphenCount >= 3) {
    indicators.excessiveHyphens = true
    reasons.push('Hostname contains ' + hyphenCount + ' hyphens — often used in fake subdomain-rich domains')
    riskPoints += 5
  }

  // 12. Long URL
  if (cleanUrl.length > 120) {
    indicators.longUrl = true
    reasons.push('Excessively long URL — may be designed to obscure the true destination')
    riskPoints += 5
  }

  // 13. Long hostname
  if (hostname.length > 50) {
    indicators.obfuscatedUrl = true
    reasons.push('Excessively long hostname')
    riskPoints += 5
  }

  // 14. Dangerous file extension
  dangerousExtension = detectDangerousExtension(pathname)
  if (dangerousExtension) {
    indicators.dangerousFile = true
    reasons.push('Dangerous file extension in URL path (' + dangerousExtension + ')')
    riskPoints += 32
  }

  // 15. Sensitive path keywords
  matchedPathKeywords = detectSensitivePathKeywords(pathname, search)
  if (matchedPathKeywords.length > 0) {
    indicators.suspiciousPath = true
    const kws = matchedPathKeywords.slice(0, 4).join(', ')
    reasons.push('Sensitive path keywords detected: ' + kws)
    riskPoints += Math.min(14, 8 + (matchedPathKeywords.length - 1) * 2)
  }

  riskPoints = Math.min(100, riskPoints)

  const suspicious = riskPoints >= 20 || indicators.rawIp || indicators.typosquatting ||
    indicators.deceptiveSubdomain || indicators.dangerousFile || indicators.userinfoAbuse

  return {
    url: originalUrl,
    normalizedUrl: cleanUrl,
    domain: hostname,
    suspicious,
    typosquatting,
    matchedBrand,
    riskPoints,
    reasons,
    indicators,
    matchedPathKeywords,
    dangerousExtension,
    reason: reasons.length > 0 ? reasons.join('; ') : 'Domain verified — standard structure',
  }
}

// ---------------------------------------------------------------------------
// URL EXTRACTION from raw text
// ---------------------------------------------------------------------------

export function extractUrlsFromText(text) {
  if (!text) return []

  const URL_PATTERN = /https?:\/\/[^\s<>"{}|\\^`\[\]()]+/gi
  const raw = text.match(URL_PATTERN) || []
  const cleaned = raw.map(u => u.replace(/[.,!?)\]}'"`>]+$/, ''))

  const seen = new Set()
  const unique = []
  for (const u of cleaned) {
    if (u && !seen.has(u.toLowerCase())) {
      seen.add(u.toLowerCase())
      unique.push(u)
    }
  }
  return unique
}

// ---------------------------------------------------------------------------
// MULTI-URL ANALYSIS
// ---------------------------------------------------------------------------

export function analyzeUrls(input) {
  let urlStrings = []

  if (Array.isArray(input)) {
    urlStrings = input
  } else if (typeof input === 'string') {
    urlStrings = extractUrlsFromText(input)
  }

  if (urlStrings.length === 0) {
    return {
      urlCount: 0,
      urlResults: [],
      technicalScore: 0,
      matchedBrands: [],
      hasTyposquatting: false,
      hasDeceptiveSubdomain: false,
      hasDangerousFile: false,
      hasRawIp: false,
      aggregatedReasons: [],
    }
  }

  const urlResults = urlStrings.map(u => analyzeUrl(u))
  urlResults.sort((a, b) => b.riskPoints - a.riskPoints)

  let technicalScore = urlResults[0].riskPoints
  let additionalSuspicious = 0
  for (let i = 1; i < urlResults.length; i++) {
    if (urlResults[i].suspicious) additionalSuspicious++
  }
  technicalScore = Math.min(100, technicalScore + additionalSuspicious * 5)

  const matchedBrands = [...new Set(
    urlResults.filter(r => r.matchedBrand).map(r => r.matchedBrand)
  )]

  return {
    urlCount: urlStrings.length,
    urlResults,
    technicalScore,
    matchedBrands,
    hasTyposquatting: urlResults.some(r => r.typosquatting),
    hasDeceptiveSubdomain: urlResults.some(r => r.indicators.deceptiveSubdomain),
    hasDangerousFile: urlResults.some(r => r.indicators.dangerousFile),
    hasRawIp: urlResults.some(r => r.indicators.rawIp),
    aggregatedReasons: [...new Set(urlResults.flatMap(r => r.reasons))],
  }
}

// ---------------------------------------------------------------------------
// TECHNICAL KEYWORD ANALYSIS (message text)
// ---------------------------------------------------------------------------

const TECHNICAL_KEYWORDS = [
  'download', 'attachment', 'installer', 'update', 'install',
  'login', 'signin', 'verify', 'billing', 'payment',
  'wallet', 'credential', 'password', 'account', 'security',
  'kyc', 'claim', 'airdrop', 'recover', 'reset',
  'otp', 'pin', 'bank', 'card', 'cvv',
  'seed phrase', 'private key', 'recovery phrase',
]

export function detectTechnicalKeywords(text) {
  if (!text) return []
  const lower = text.toLowerCase()
  const matched = new Set()
  for (const kw of TECHNICAL_KEYWORDS) {
    if (lower.includes(kw)) matched.add(kw)
  }
  return [...matched]
}

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function buildEmptyIndicators(overrides) {
  return Object.assign({
    rawIp: false,
    malformedHostname: false,
    suspiciousTld: false,
    punycode: false,
    unicodeHostname: false,
    deceptiveSubdomain: false,
    typosquatting: false,
    suspiciousPath: false,
    dangerousFile: false,
    http: false,
    suspiciousPort: false,
    longUrl: false,
    excessiveSubdomains: false,
    numericHeavyHostname: false,
    excessiveHyphens: false,
    obfuscatedUrl: false,
    userinfoAbuse: false,
  }, overrides || {})
}

export { BRAND_CONFIG, SUSPICIOUS_TLDS, DANGEROUS_EXTENSIONS }
