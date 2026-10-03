import ScrollReveal from '../components/ScrollReveal'
import { BookOpen, Terminal, Hash, Zap, Shield } from '../components/Icons'
import './DeveloperDocsPage.css'

export default function DeveloperDocsPage() {
  return (
    <main className="docs-page">
      <div className="container">
        <ScrollReveal>
          <div className="docs-page__header">
            <p className="section-eyebrow">Documentation</p>
            <h1 className="section-title">Developer Docs</h1>
            <p className="section-subtitle">
              Technical documentation for understanding and extending PhishGuard.
            </p>
          </div>
        </ScrollReveal>

        <div className="docs-page__layout">
          {/* Sidebar */}
          <nav className="docs-page__sidebar glass-card" aria-label="Documentation navigation">
            <h3 className="docs-page__sidebar-title">Contents</h3>
            <a href="#overview" className="docs-page__sidebar-link">Overview</a>
            <a href="#quickstart" className="docs-page__sidebar-link">Quick Start</a>
            <a href="#analysis-engine" className="docs-page__sidebar-link">Analysis Engine</a>
            <a href="#scoring" className="docs-page__sidebar-link">Scoring Model</a>
            <a href="#detection" className="docs-page__sidebar-link">Detection Patterns</a>
            <a href="#extending" className="docs-page__sidebar-link">Extending</a>
            <a href="#limitations" className="docs-page__sidebar-link">Limitations</a>
          </nav>

          {/* Content */}
          <div className="docs-page__content">
            <ScrollReveal>
              <section className="docs-page__section" id="overview">
                <div className="docs-page__section-icon"><BookOpen size={22} /></div>
                <h2 className="docs-page__section-title">Overview</h2>
                <p className="docs-page__text">
                  PhishGuard is a client-side phishing and social-engineering analysis tool built with React.
                  It processes suspicious messages entirely in the browser — no data is transmitted to any server.
                </p>
                <p className="docs-page__text">
                  The analysis pipeline extracts URLs, detects typosquatting patterns, identifies social-engineering
                  tactics (urgency, fear, authority exploitation), and generates an explainable 0–100 threat risk score.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal>
              <section className="docs-page__section" id="quickstart">
                <div className="docs-page__section-icon"><Terminal size={22} /></div>
                <h2 className="docs-page__section-title">Quick Start</h2>
                <div className="docs-page__code-block">
                  <code className="docs-page__code">
{`# Clone and install
git clone https://github.com/your-repo/phishguard
cd phishguard
npm install

# Start development server
npm run dev

# Build for production
npm run build`}
                  </code>
                </div>
                <p className="docs-page__text">
                  The application runs on Vite with React 19. No additional backend setup is required.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal>
              <section className="docs-page__section" id="analysis-engine">
                <div className="docs-page__section-icon"><Zap size={22} /></div>
                <h2 className="docs-page__section-title">Analysis Engine</h2>
                <p className="docs-page__text">
                  The core analysis engine (<code>src/utils/analyzeMessage.js</code>) processes messages through
                  multiple detection layers:
                </p>
                <ol className="docs-page__list">
                  <li><strong>URL Extraction</strong> — Regex-based URL extraction and domain parsing</li>
                  <li><strong>Domain Analysis</strong> — TLD reputation checking and typosquatting detection</li>
                  <li><strong>Impersonation Detection</strong> — Brand pattern matching against known targets</li>
                  <li><strong>Social Engineering</strong> — Urgency, fear, authority, and credential-harvesting detection</li>
                  <li><strong>Risk Scoring</strong> — Weighted signal aggregation into a 0–100 score</li>
                </ol>
                <div className="docs-page__code-block">
                  <code className="docs-page__code">
{`import { analyzeMessage } from './utils/analyzeMessage'

const result = analyzeMessage(suspiciousText)
// result.score       → 0-100 threat score
// result.riskLevel   → { level, label, color }
// result.signals     → Array of detected signals
// result.badges      → Array of threat category labels
// result.urls        → Array of extracted URL analyses
// result.explanation → Human-readable explanation`}
                  </code>
                </div>
              </section>
            </ScrollReveal>

            <ScrollReveal>
              <section className="docs-page__section" id="scoring">
                <div className="docs-page__section-icon"><Hash size={22} /></div>
                <h2 className="docs-page__section-title">Scoring Model</h2>
                <p className="docs-page__text">
                  The threat score is a weighted sum of individual signal points, capped at 100:
                </p>
                <table className="docs-page__table">
                  <thead>
                    <tr>
                      <th>Signal Category</th>
                      <th>Max Points</th>
                      <th>Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>Suspicious URL / Domain</td><td>30</td><td>Highest</td></tr>
                    <tr><td>Typosquatting</td><td>8</td><td>High</td></tr>
                    <tr><td>Brand Impersonation</td><td>22</td><td>High</td></tr>
                    <tr><td>False Urgency</td><td>18</td><td>Medium-High</td></tr>
                    <tr><td>Emotional Pressure</td><td>14</td><td>Medium</td></tr>
                    <tr><td>Authority Exploitation</td><td>10</td><td>Medium</td></tr>
                    <tr><td>Credential Harvesting</td><td>12</td><td>Medium</td></tr>
                  </tbody>
                </table>
                <p className="docs-page__text">
                  Risk levels are assigned as: <strong>0–25</strong> Low, <strong>26–50</strong> Medium,{' '}
                  <strong>51–75</strong> High, <strong>76–100</strong> Critical.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal>
              <section className="docs-page__section" id="detection">
                <div className="docs-page__section-icon"><Shield size={22} /></div>
                <h2 className="docs-page__section-title">Detection Patterns</h2>
                <p className="docs-page__text">
                  PhishGuard uses regex-based pattern matching for signal detection. Patterns are organized into
                  categories:
                </p>
                <ul className="docs-page__list">
                  <li><strong>SUSPICIOUS_TLDS</strong> — Known malicious or free-registration TLDs (.cc, .tk, .xyz, etc.)</li>
                  <li><strong>TYPOSQUAT_BRANDS</strong> — Regex patterns for 10+ commonly impersonated brands</li>
                  <li><strong>URGENCY_PHRASES</strong> — 14 urgency and deadline-related patterns</li>
                  <li><strong>FEAR_PHRASES</strong> — 7 fear and loss-aversion patterns</li>
                  <li><strong>AUTHORITY_PHRASES</strong> — 8 institutional authority patterns</li>
                  <li><strong>CREDENTIAL_PHRASES</strong> — 9 credential and PII request patterns</li>
                </ul>
              </section>
            </ScrollReveal>

            <ScrollReveal>
              <section className="docs-page__section" id="extending">
                <div className="docs-page__section-icon"><Terminal size={22} /></div>
                <h2 className="docs-page__section-title">Extending PhishGuard</h2>
                <p className="docs-page__text">
                  To add new detection patterns, edit the pattern arrays in{' '}
                  <code>src/utils/analyzeMessage.js</code>:
                </p>
                <div className="docs-page__code-block">
                  <code className="docs-page__code">
{`// Add a new brand to typosquatting detection
const TYPOSQUAT_BRANDS = [
  // ...existing brands
  { brand: 'yourcompany', pattern: /y[o0]urc[o0]mpany/i },
]

// Add new urgency phrases
const URGENCY_PHRASES = [
  // ...existing phrases
  /respond immediately/i,
  /action required/i,
]`}
                  </code>
                </div>
              </section>
            </ScrollReveal>

            <ScrollReveal>
              <section className="docs-page__section" id="limitations">
                <div className="docs-page__section-icon"><Shield size={22} /></div>
                <h2 className="docs-page__section-title">Limitations</h2>
                <ul className="docs-page__list">
                  <li>PhishGuard uses heuristic pattern matching, not AI/ML classification</li>
                  <li>Cannot verify actual domain ownership or certificate validity</li>
                  <li>Does not visit or resolve URLs — analysis is text-only</li>
                  <li>Cannot detect image-based phishing or malicious attachments</li>
                  <li>Results should be treated as advisory, not definitive</li>
                </ul>
              </section>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </main>
  )
}
