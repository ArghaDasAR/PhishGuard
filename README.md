# 🛡️ PhishGuard AI

### One-Click Scam & Social Engineering Analyzer

PhishGuard AI is an AI-powered cybersecurity tool designed to detect **phishing, scams, malicious links, and social-engineering attacks** in suspicious emails, SMS messages, and online communications.

The system combines **URL analysis, threat-pattern detection, and AI-powered semantic analysis** to provide users with an understandable risk score and explanation.

---

## 🤖 AI Engine — Gemma 4

PhishGuard AI uses **Google's Gemma 4 model through an API** as its AI analysis engine.

Gemma 4 analyzes the **meaning, intent, language, and psychological manipulation techniques** present in suspicious messages. This allows PhishGuard AI to go beyond simple URL checking and understand the broader context of a potential scam.

### What Gemma 4 Detects

* 🚨 **False Urgency** — "Act immediately or your account will be blocked."
* 👮 **Fake Authority** — Impersonation of banks, police, government agencies, companies, etc.
* 💰 **Financial Manipulation** — Requests for payments, refunds, transfers, or financial information.
* 🔐 **Credential Harvesting** — Requests for passwords, OTPs, PINs, or login information.
* 🎁 **Fake Rewards** — Lottery, cashback, prize, giveaway, or reward scams.
* 😨 **Fear & Threats** — Account suspension, legal threats, fines, or other intimidation.
* 🧠 **Social Engineering** — Psychological techniques designed to manipulate the victim.
* 🔗 **Suspicious Context** — Dangerous or suspicious links combined with manipulative messaging.

---

## 🧠 How Gemma 4 Fits Into PhishGuard

```text
                 USER
                   │
                   ▼
          ┌─────────────────┐
          │ Suspicious      │
          │ Message         │
          └────────┬────────┘
                   │
                   ▼
          ┌─────────────────┐
          │ PhishGuard AI   │
          │ Analysis Engine │
          └────────┬────────┘
                   │
          ┌────────┴─────────┐
          │                  │
          ▼                  ▼
   ┌─────────────┐    ┌──────────────┐
   │ URL & Domain │    │   Gemma 4    │
   │ Analysis     │    │ AI Analysis  │
   └──────┬──────┘    └──────┬───────┘
          │                  │
          │    ┌─────────────┘
          │    │
          ▼    ▼
       ┌─────────────────┐
       │   Risk Engine   │
       └────────┬────────┘
                │
                ▼
       ┌─────────────────┐
       │ Risk Score      │
       │ + Verdict       │
       │ + Explanation   │
       └─────────────────┘
```

The system combines **deterministic security checks** with **AI-based semantic analysis** rather than relying exclusively on the AI model.

---

## 🔄 AI Analysis Pipeline

### 1️⃣ User Input

The user pastes a suspicious email, SMS, social-media message, or other communication.

### 2️⃣ Message Processing

The backend extracts relevant information such as:

* Message text
* URLs
* Domains
* Suspicious keywords
* Potential requests for credentials or payments

### 3️⃣ Gemma 4 Analysis

The message is sent to the configured Gemma 4 API/model for semantic analysis.

Gemma evaluates:

```text
Intent
   ↓
Psychological Triggers
   ↓
Social Engineering
   ↓
Impersonation
   ↓
Credential Requests
   ↓
Financial Manipulation
   ↓
Overall Threat Assessment
```

### 4️⃣ Risk Calculation

The AI findings are combined with URL and rule-based security indicators.

Example:

```text
URL Analysis              → Suspicious
Social Engineering        → High
Credential Request        → Detected
Fake Urgency              → Detected
Financial Manipulation    → Detected

              ↓

       Risk Score: 94/100

              ↓

          🔴 DANGEROUS
```

---

## 🔑 Gemma API Configuration

PhishGuard keeps the API credentials on the **backend** rather than exposing them in frontend JavaScript.

Example environment configuration:

```env
GEMMA_API_KEY=your_api_key_here
GEMMA_MODEL=your_configured_gemma_model
```

> 🔒 **Never commit your real API key to GitHub.** Store secrets in environment variables and add `.env` to `.gitignore`.

---

## 🛡️ Why Use Gemma?

Traditional phishing detection often focuses heavily on:

```text
URL → Domain → Reputation → Verdict
```

PhishGuard AI expands this approach:

```text
Message
   │
   ├── URL Analysis
   ├── Domain Analysis
   ├── Language Analysis
   ├── Intent Analysis
   ├── Social Engineering
   └── Psychological Manipulation
             │
             ▼
        AI + Security
             │
             ▼
        Risk Assessment
```

This makes the system capable of identifying suspicious **communication patterns**, even when a message does not contain an obviously malicious URL.

---

## 📊 Example

### Suspicious Message

```text
URGENT!

Your bank account will be permanently blocked today.

Verify your account immediately using the link below:

https://example.com/account-verification

Enter your username, password and OTP.
```

### PhishGuard AI Result

```text
Risk Score: 96 / 100

🔴 DANGEROUS

Detected Indicators:

✓ Fake urgency
✓ Financial institution impersonation
✓ Credential harvesting
✓ OTP request
✓ Suspicious URL
✓ Account suspension threat
✓ Social engineering
```

---

## ⚠️ Security Disclaimer

PhishGuard AI is an **AI-assisted cybersecurity and awareness tool**.

An AI-generated **SAFE** result does not guarantee that a message or website is completely safe. Attackers continuously change their techniques, domains, wording, and infrastructure.

Users should always independently verify sensitive communications through official channels, especially when dealing with:

* Banking
* Payments
* Passwords
* OTPs
* Government services
* Cryptocurrency
* Account recovery

---

### 🛡️ PhishGuard AI

**Don't just detect the link. Understand the attack.**
