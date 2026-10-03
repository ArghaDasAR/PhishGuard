export const demoMessages = [
  {
    id: 'netflix-phish',
    label: 'Netflix Billing Scam',
    category: 'Email',
    text: `Subject: Urgent: Your Netflix Payment Failed

Dear Valued Customer,

We were unable to process your latest payment for your Netflix subscription. Your account will be suspended within 2 hours unless you verify your billing information immediately.

Click below to update your payment details:
https://netfIix-verify.cc/billing/update?ref=usr_829371

Failure to act will result in permanent account termination and loss of your viewing history.

This is an automated message. Do not reply.

Netflix Support Team
support@netfIix-verify.cc`,
    expectedScore: 88,
    signals: [
      { category: 'Link Intelligence', severity: 'high', signal: 'Suspicious domain detected', detail: 'Domain "netfIix-verify.cc" uses character substitution (I instead of l) to resemble "netflix.com". This is a typosquatting technique.', points: 35 },
      { category: 'Impersonation Detection', severity: 'high', signal: 'Brand impersonation detected', detail: 'Message impersonates Netflix branding and support communications. The sender domain does not match official Netflix domains.', points: 25 },
      { category: 'Urgency & Pressure', severity: 'high', signal: 'False urgency detected', detail: 'Message creates artificial time pressure with "2 hours" deadline and threatens "permanent account termination".', points: 18 },
      { category: 'Social Engineering', severity: 'medium', signal: 'Emotional pressure detected', detail: 'Language designed to create fear of loss ("permanent account termination", "loss of your viewing history") to pressure immediate action.', points: 10 },
    ],
    urls: [
      { url: 'https://netfIix-verify.cc/billing/update?ref=usr_829371', domain: 'netfIix-verify.cc', suspicious: true, reason: 'Possible typosquatting of netflix.com' }
    ],
    badges: ['SUSPICIOUS URL', 'TYPOSQUATTING', 'IMPERSONATION', 'FALSE URGENCY', 'EMOTIONAL PRESSURE', 'CREDENTIAL REQUEST'],
    explanation: 'This message combines a lookalike domain (netfIix-verify.cc mimicking netflix.com), a short response deadline (2 hours), and account-loss language. Together, these signals indicate a high-risk phishing attempt designed to steal billing credentials.'
  },
  {
    id: 'bank-sms',
    label: 'Bank SMS Scam',
    category: 'SMS',
    text: `[ALERT] Your SBI account has been temporarily locked due to suspicious activity. Verify your identity immediately to avoid permanent deactivation: http://sbi-secure-verify.in.net/auth

Reply STOP to unsubscribe.`,
    expectedScore: 82,
    signals: [
      { category: 'Link Intelligence', severity: 'high', signal: 'Suspicious domain detected', detail: 'Domain "sbi-secure-verify.in.net" is not an official SBI domain. Official SBI domains use sbi.co.in or onlinesbi.com.', points: 32 },
      { category: 'Impersonation Detection', severity: 'high', signal: 'Bank impersonation detected', detail: 'Message impersonates State Bank of India communications using their name and alert format.', points: 24 },
      { category: 'Urgency & Pressure', severity: 'high', signal: 'False urgency with threat', detail: '"Temporarily locked" and "permanent deactivation" create fear-driven urgency.', points: 16 },
      { category: 'Social Engineering', severity: 'medium', signal: 'Authority exploitation', detail: 'Uses banking authority to bypass critical thinking. "ALERT" prefix mimics official notification systems.', points: 10 },
    ],
    urls: [
      { url: 'http://sbi-secure-verify.in.net/auth', domain: 'sbi-secure-verify.in.net', suspicious: true, reason: 'Unofficial domain mimicking SBI banking' }
    ],
    badges: ['SUSPICIOUS URL', 'IMPERSONATION', 'FALSE URGENCY', 'FAKE AUTHORITY', 'CREDENTIAL REQUEST'],
    explanation: 'This SMS mimics a bank security alert using an unofficial domain. It exploits the authority of banking institutions and creates artificial urgency through account-locking threats to harvest credentials.'
  },
  {
    id: 'linkedin-scam',
    label: 'LinkedIn Job Scam',
    category: 'LinkedIn',
    text: `Hi there! 👋

I came across your profile and I'm impressed with your background. We have an exciting remote opportunity at Google that matches your skills perfectly.

💰 Salary: $180,000 - $250,000/year
🏠 100% Remote
🎯 Immediate start

To proceed with your application, please fill out this quick form:
https://g00gle-careers-apply.web.app/form/new

Looking forward to hearing from you!

Sarah Mitchell
Senior Talent Acquisition Specialist
Google LLC`,
    expectedScore: 74,
    signals: [
      { category: 'Link Intelligence', severity: 'high', signal: 'Suspicious application URL', detail: 'Domain "g00gle-careers-apply.web.app" uses character substitution (00 instead of oo) and is hosted on a generic web.app platform, not official Google careers.', points: 30 },
      { category: 'Impersonation Detection', severity: 'high', signal: 'Company impersonation', detail: 'Claims to represent Google LLC but uses unofficial channels and non-standard recruitment process.', points: 22 },
      { category: 'Social Engineering', severity: 'medium', signal: 'Too-good-to-be-true offer', detail: 'Unusually high salary range and immediate start suggest social engineering to attract applicants.', points: 14 },
      { category: 'Urgency & Pressure', severity: 'low', signal: 'Mild urgency signals', detail: '"Immediate start" creates subtle time pressure.', points: 8 },
    ],
    urls: [
      { url: 'https://g00gle-careers-apply.web.app/form/new', domain: 'g00gle-careers-apply.web.app', suspicious: true, reason: 'Typosquatting of google.com on generic hosting' }
    ],
    badges: ['SUSPICIOUS URL', 'TYPOSQUATTING', 'IMPERSONATION', 'SOCIAL ENGINEERING'],
    explanation: 'This message uses a common LinkedIn recruitment scam pattern: an unsolicited job offer from a well-known company with attractive terms, directing to a lookalike domain for data harvesting.'
  },
  {
    id: 'safe-message',
    label: 'Legitimate Newsletter',
    category: 'Email',
    text: `Hi,

Thanks for subscribing to our weekly tech digest! Here's what happened this week:

1. React 20 released with new concurrent features
2. GitHub Copilot adds multi-file editing
3. OpenAI announces GPT-5 Turbo

Read more on our blog: https://techdigest.dev/weekly/2026-w40

You're receiving this because you signed up at techdigest.dev.
Unsubscribe: https://techdigest.dev/unsubscribe

Best,
The TechDigest Team`,
    expectedScore: 12,
    signals: [
      { category: 'Link Intelligence', severity: 'low', signal: 'Links appear consistent', detail: 'All URLs point to techdigest.dev which matches the stated sender. Domain appears legitimate.', points: 4 },
      { category: 'Social Engineering', severity: 'low', signal: 'Minimal pressure detected', detail: 'Message is informational with no urgency or emotional pressure tactics.', points: 4 },
      { category: 'Message Analysis', severity: 'low', signal: 'Standard newsletter format', detail: 'Content follows typical newsletter patterns with clear unsubscribe option.', points: 4 },
    ],
    urls: [
      { url: 'https://techdigest.dev/weekly/2026-w40', domain: 'techdigest.dev', suspicious: false, reason: 'Domain matches sender context' },
      { url: 'https://techdigest.dev/unsubscribe', domain: 'techdigest.dev', suspicious: false, reason: 'Standard unsubscribe link' }
    ],
    badges: [],
    explanation: 'This message shows characteristics of a legitimate newsletter: consistent sender domain, no urgency or pressure tactics, clear unsubscribe option, and informational content without credential requests.'
  }
]

export const scanSteps = [
  { id: 1, label: 'Extracting links & entities', icon: 'link' },
  { id: 2, label: 'Inspecting domains & hosts', icon: 'globe' },
  { id: 3, label: 'Detecting impersonation & spoofing', icon: 'user-x' },
  { id: 4, label: 'Analyzing psychological coercion', icon: 'brain' },
  { id: 5, label: 'Evaluating social-engineering signals', icon: 'shield-alert' },
  { id: 6, label: 'Generating threat assessment', icon: 'file-check' },
]

export const demoUrls = [
  {
    id: 'netflix-url',
    label: 'Netflix Typosquat',
    url: 'https://netf1ix-billing-update.cc/verify/account?user_id=9831',
    description: 'Typosquatting + Suspicious .cc TLD + Credential harvesting path'
  },
  {
    id: 'chase-url',
    label: 'Chase Bank Spoof',
    url: 'http://chase-security-auth.xyz/signin/confirm',
    description: 'Unencrypted HTTP + Brand spoofing + Suspicious .xyz TLD'
  },
  {
    id: 'crypto-url',
    label: 'Crypto Airdrop Trap',
    url: 'https://free-eth-tesla-airdrop2x.top/claim-reward',
    description: 'Scam keyword combination + High-risk .top TLD'
  },
  {
    id: 'github-url',
    label: 'Legitimate Site (Clean)',
    url: 'https://github.com/security/advisories',
    description: 'Safe legitimate domain with HTTPS and clean reputation'
  }
]

export const demoImages = [
  {
    id: 'netflix-screenshot',
    label: 'Netflix Billing Alert',
    fileName: 'netflix_payment_failed.png',
    detectedText: 'Netflix Security Alert: Your membership payment failed. Update billing within 2 hours or your subscription will be permanently terminated. Verify payment: https://netf1ix-verify.cc/billing',
    svgData: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360" viewBox="0 0 600 360" fill="none"><rect width="600" height="360" rx="16" fill="%23111111"/><rect x="24" y="24" width="552" height="312" rx="12" fill="%231a1a1a" stroke="%23333333"/><text x="48" y="70" font-family="Arial,sans-serif" font-weight="900" font-size="28" fill="%23e50914">NETFLIX</text><text x="48" y="110" font-family="Arial,sans-serif" font-weight="700" font-size="18" fill="%23ffffff">⚠️ Urgent: Your Membership Payment Failed</text><text x="48" y="145" font-family="Arial,sans-serif" font-size="14" fill="%23cccccc">We were unable to process your billing. Update your credit card</text><text x="48" y="170" font-family="Arial,sans-serif" font-size="14" fill="%23ff6b6b" font-weight="bold">within 2 hours or your account will be permanently terminated.</text><rect x="48" y="200" width="220" height="44" rx="8" fill="%23e50914"/><text x="75" y="228" font-family="Arial,sans-serif" font-weight="bold" font-size="14" fill="%23ffffff">Update Payment Details</text><text x="48" y="280" font-family="monospace" font-size="12" fill="%23888888">https://netf1ix-verify.cc/billing/login</text><text x="48" y="305" font-family="Arial,sans-serif" font-size="11" fill="%23555555">Automated Security Notification • Do Not Reply</text></svg>`
  },
  {
    id: 'crypto-screenshot',
    label: 'Crypto 2x Giveaway DM',
    fileName: 'crypto_giveaway_dm.png',
    detectedText: 'Official Elon Musk 5,000 ETH Giveaway! To verify your wallet and claim 2x back, send 0.1 to 5 ETH to the address below. You will immediately receive double! Visit https://tesla-eth-airdrop.xyz to participate.',
    svgData: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360" viewBox="0 0 600 360" fill="none"><rect width="600" height="360" rx="16" fill="%230f141c"/><rect x="24" y="24" width="552" height="312" rx="12" fill="%23161f2e" stroke="%2324334a"/><circle cx="60" cy="65" r="22" fill="%232563eb"/><text x="53" y="73" font-family="Arial,sans-serif" font-weight="bold" font-size="20" fill="%23ffffff">X</text><text x="96" y="60" font-family="Arial,sans-serif" font-weight="bold" font-size="16" fill="%23ffffff">Elon Musk [Official]</text><text x="96" y="80" font-family="Arial,sans-serif" font-size="12" fill="%2338bdf8">@elonmusk_official • Verified Airdrop</text><text x="48" y="130" font-family="Arial,sans-serif" font-weight="bold" font-size="18" fill="%23facc15">🔥 5,000 ETH Official Community Giveaway!</text><text x="48" y="165" font-family="Arial,sans-serif" font-size="14" fill="%23e2e8f0">Send 0.2 ETH to 5 ETH to verify wallet — get 2X return instantly.</text><text x="48" y="195" font-family="Arial,sans-serif" font-size="13" fill="%23f87171" font-weight="bold">⚡ Only 42 slots remaining! Offer expires in 15 minutes.</text><rect x="48" y="225" width="240" height="42" rx="8" fill="%232563eb"/><text x="75" y="251" font-family="Arial,sans-serif" font-weight="bold" font-size="14" fill="%23ffffff">Claim Airdrop (Connect Wallet)</text><text x="48" y="300" font-family="monospace" font-size="12" fill="%2394a3b8">https://tesla-eth-airdrop.xyz/claim</text></svg>`
  },
  {
    id: 'bank-screenshot',
    label: 'Chase Bank SMS Alert',
    fileName: 'bank_alert_sms.png',
    detectedText: '[CHASE ALERT]: Your debit card has been temporarily locked due to an unrecognized login attempt from IP 185.220.101.5. Reactivate immediately: http://chase-security-auth.xyz/verify',
    svgData: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360" viewBox="0 0 600 360" fill="none"><rect width="600" height="360" rx="16" fill="%23f1f5f9"/><rect x="24" y="24" width="552" height="312" rx="12" fill="%23ffffff" stroke="%23cbd5e1"/><text x="48" y="65" font-family="Arial,sans-serif" font-weight="bold" font-size="15" fill="%230f172a">Messages • CHASE-ALERT</text><text x="48" y="85" font-family="Arial,sans-serif" font-size="11" fill="%2364748b">Today 11:42 AM</text><rect x="48" y="105" width="480" height="150" rx="16" fill="%23e2e8f0"/><text x="68" y="138" font-family="Arial,sans-serif" font-weight="bold" font-size="14" fill="%23b91c1c">[CHASE-BANK URGENT ALERT]</text><text x="68" y="165" font-family="Arial,sans-serif" font-size="13" fill="%231e293b">Your online banking and debit card have been restricted due to</text><text x="68" y="188" font-family="Arial,sans-serif" font-size="13" fill="%231e293b">suspicious activity. Verify your identity immediately to restore access:</text><text x="68" y="222" font-family="monospace" font-size="13" font-weight="bold" fill="%230284c7">http://chase-security-auth.xyz/verify</text><text x="48" y="295" font-family="Arial,sans-serif" font-size="12" fill="%2394a3b8">Reply STOP to opt out of fraud alerts.</text></svg>`
  }
]

